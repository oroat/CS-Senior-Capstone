let allProjects = [];

$(document).ready(function () {

    function loadUserDropdowns() {
        $.get('/users', function (users) {
            const managerSelect = $('#manager');
            const workersSelect = $('#workers');

            managerSelect.find('option:not(:first)').remove();
            workersSelect.empty();

            users.forEach(user => {
                const option = `<option value="${user._id}">${user.name}</option>`;
                if (user.role === 1) {
                    managerSelect.append(option);
                } else {
                    workersSelect.append(option);
                }
            });
        });
    }

    loadUserDropdowns();
    //loadProjects();

    $('#projectForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: $('#name').val(),
            location: $('#location').val(),
            manager: $('#manager').val(),
            workers: $('#workers').val()
        };

        $.ajax({
            url: '/projects',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Project Created!');
                $('#projectForm')[0].reset();
                loadProjects();
            },
            error: function () {
                alert('Error creating project');
            }
        });
    });
});

function loadProjects() {
    $.when(
        $.get('/projects'),
        $.get('/purchaseorders')
    ).done(function (projectsRes, ordersRes) {
        const projects = projectsRes[0];
        const allOrders = ordersRes[0];
        const list = $('#projectList2');
        list.empty();

        allProjects = projects;

        projects.forEach(project => {
            const workerNames = project.workers.map(w => w.name).join(', ') || 'None';

            const projectPOs = allOrders.filter(po =>
                po.project && (po.project._id === project._id || po.project === project._id)
            );

            let poDisplay;
            if (projectPOs.length === 0) {
                poDisplay = '<span style="color:#888;">No purchase orders</span>';
            } else {
                poDisplay = projectPOs.map(po => {
                    const badgeColors = { 'Draft': '#6c757d', 'Pending': '#ffc107', 'Approved': '#28a745', 'Received': '#17a2b8', 'Cancelled': '#dc3545' };
                    const bg = badgeColors[po.status] || '#6c757d';
                    const fg = po.status === 'Pending' ? '#333' : '#fff';
                    const matCount = po.materials ? po.materials.length : 0;
                    return `<span style="display:inline-block;background:${bg};color:${fg};border-radius:6px;padding:3px 10px;font-size:0.82rem;font-weight:600;margin:2px 4px 2px 0;">${po.poNumber} — ${po.vendor} (${matCount} item${matCount !== 1 ? 's' : ''})</span>`;
                }).join('');
            }

            list.append(`
                <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px; background:#fff;">
                    <h3>${project.name}</h3>
                    <p><strong>Location:</strong> ${project.location}</p>
                    <p><strong>Manager:</strong> ${project.manager ? project.manager.name : 'N/A'}</p>
                    <p><strong>Workers:</strong> ${workerNames}</p>
                    <p><strong>Purchase Orders:</strong><br>${poDisplay}</p>
                    <div style="margin-top: 10px;">
                        <button onclick="editProject('${project._id}')" style="background:#ffc107;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;">Edit</button>
                        <button onclick="deleteProject('${project._id}')" style="background:#dc3545;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;">Delete</button>
                    </div>
                </div>
            `);
        });
    }).fail(function () {
        $.get('/projects', function (projects) {
            allProjects = projects;
            const list = $('#projectList');
            list.empty();
            projects.forEach(project => {
                const workerNames = project.workers.map(w => w.name).join(', ') || 'None';
                list.append(`
                    <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px; background:#fff;">
                        <h3>${project.name}</h3>
                        <p><strong>Location:</strong> ${project.location}</p>
                        <p><strong>Manager:</strong> ${project.manager ? project.manager.name : 'N/A'}</p>
                        <p><strong>Workers:</strong> ${workerNames}</p>
                        <div style="margin-top: 10px;">
                            <button onclick="editProject('${project._id}')" style="background:#ffc107;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;">Edit</button>
                            <button onclick="deleteProject('${project._id}')" style="background:#dc3545;color:white;border:none;padding:5px 10px;cursor:pointer;border-radius:4px;">Delete</button>
                        </div>
                    </div>
                `);
            });
        });
    });
}

function editProject(id) {
    window.location.href = `editProject.html?id=${id}`;
}

function deleteProject(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        $.ajax({
            url: `/projects/${id}`,
            type: 'DELETE',
            success: function () { location.reload(); },
            error: function () { alert("Failed to delete project"); }
        });
    }
}

function openList(listId) {
    document.getElementById(listId).classList.add('open');
}

function closeListDelayed(listId) {
    setTimeout(() => document.getElementById(listId).classList.remove('open'), 200);
}

function filterList(inputId, listId, dataArr, searchField, onSelect) {
    const query = document.getElementById(inputId).value.toLowerCase();
    const list = document.getElementById(listId);
    list.innerHTML = '';
    list.classList.add('open');

    const filtered = dataArr.filter(item =>
        (item[searchField] || '').toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        list.innerHTML = '<li class="no-results">No results found</li>';
        return;
    }

    for (const item of filtered) {
        const li = document.createElement('li');
        li.textContent = searchField === 'email' ? `${item.name} — ${item.email}` : item.name;
        li.onclick = () => onSelect(item);
        list.appendChild(li);
    }
}

async function selectProject(project) {
    document.getElementById('selectedProjectId').value = project._id;
    document.getElementById('projectSearch').value = project.name;
    document.getElementById('projectBadge').textContent = '✓ ' + project.name;
    document.getElementById('projectBadge').style.display = 'inline-block';
    document.getElementById('projectList').classList.remove('open');
}

function clearProjectSearch() {
    ['projectSearch', 'selectedProjectId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('projectBadge').style.display = 'none';
}

async function openPopup(event) {
    event.preventDefault();
    const id = document.getElementById('selectedProjectId').value;
    if (id == '') {
        alert('no project selected');
    } else {
        try {
            const response = await fetch(`/projects/${id}`);
            const project = await response.json();
            populatePopup(project);
        } catch (error) {
            alert(`${error}`);
        }
    }
}

function populatePopup(project) {
    const popup = document.getElementById('popup');
    popup.innerHTML = '';

    const logo = document.createElement('img');
    logo.src = "./images/CoolSys-Logo.png";
    popup.appendChild(logo);

    const title = document.createElement('h2');
    title.innerHTML = project.name;
    popup.appendChild(title);

    const manager = document.createElement('p');
    const managerTitle = document.createElement('b');
    managerTitle.innerHTML = 'Manager: ';
    const managerBody = document.createElement('span');
    managerBody.innerHTML = project.manager ? project.manager.name : 'N/A';
    manager.appendChild(managerTitle);
    manager.appendChild(managerBody);

    const location = document.createElement('p');
    const locationTitle = document.createElement('b');
    locationTitle.innerHTML = 'Location: ';
    const locationBody = document.createElement('span');
    locationBody.innerHTML = project.location;
    location.appendChild(locationTitle);
    location.appendChild(locationBody);

    const workers = document.createElement('p');
    const workersTitle = document.createElement('b');
    workersTitle.innerHTML = 'Workers: ';
    const workersBody = document.createElement('span');
    let count = 1;
    for (const worker of project.workers) {
        workersBody.innerHTML += worker.name;
        if (count != project.workers.length) { workersBody.innerHTML += ', '; count++; }
    }
    workers.appendChild(workersTitle);
    workers.appendChild(workersBody);

    const btnDiv = document.createElement('div');
    btnDiv.classList.add('text-center');
    btnDiv.style.margin = '5px';

    const editBtn = document.createElement('button');
    editBtn.classList.add('btn', 'btn-warning');
    editBtn.style.marginRight = "10px";
    editBtn.innerHTML = 'Edit';
    editBtn.onclick = () => editProject(project._id);
    btnDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-danger');
    deleteBtn.style.marginRight = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteProject(project._id);
    btnDiv.appendChild(deleteBtn);

    popup.appendChild(manager);
    popup.appendChild(location);
    popup.appendChild(workers);
    popup.appendChild(btnDiv);

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.innerHTML = 'Close';
    closeBtn.onclick = () => closePopup();
    popup.appendChild(closeBtn);

    popup.classList.add('open-popup');
}

function closePopup() {
    document.getElementById('popup').classList.remove('open-popup');
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const projectsRes = await fetch('/projects');
        allProjects = await projectsRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
    }
});
