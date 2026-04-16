let allProjects  = [];
let allManagers  = [];          // users with role === 1
let allWorkers   = [];          // users with role !== 1
let selectedWorkerIds = [];     // tracks multi-selected workers on addProject page
let loggedUser   = null;

// ── Boot ─────────────────────────────────────────────────────────────────────

$(document).ready(function () {

    // Load users into picker arrays (addProject page)
    if ($('#projectForm').length) {
        $.get('/users', function (users) {
            allManagers = users.filter(u => u.role === 1);
            allWorkers  = users.filter(u => u.role !== 1);
        });
    }

    // Create project form submit
    $('#projectForm').on('submit', function (e) {
        e.preventDefault();

        const managerId = $('#selectedManagerId').val();
        if (!managerId) { alert('Please select a Project Manager.'); return; }

        const formData = {
            name:     $('#name').val(),
            location: $('#location').val(),
            manager:  managerId,
            workers:  selectedWorkerIds
        };

        $.ajax({
            url: '/projects',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Project Created!');
                $('#projectForm')[0].reset();
                // Reset pickers
                $('#managerSearch').val('');
                $('#managerBadge').hide().text('');
                $('#selectedManagerId').val('');
                selectedWorkerIds = [];
                $('#workerChips').empty();
                $('#workerSearch').val('');
                loadProjects();
            },
            error: function () {
                alert('Error creating project');
            }
        });
    });
});

// ── Picker helpers ────────────────────────────────────────────────────────────

function openPicker(dropdownId) {
    document.getElementById(dropdownId).classList.add('open');
}

function closePicker(dropdownId) {
    setTimeout(() => document.getElementById(dropdownId).classList.remove('open'), 200);
}

function filterPicker(inputId, dropdownId, dataArr, onSelect) {
    const query    = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';
    dropdown.classList.add('open');

    const filtered = dataArr.filter(u => u.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        dropdown.innerHTML = '<li class="no-results">No results found</li>';
        return;
    }

    filtered.forEach(u => {
        const li = document.createElement('li');
        li.textContent = u.name;
        // onmousedown fires before the input's onblur, so the click registers
        li.onmousedown = (e) => { e.preventDefault(); onSelect(u); };
        dropdown.appendChild(li);
    });
}

// Single-select: manager
function selectManager(user) {
    document.getElementById('selectedManagerId').value = user._id;
    document.getElementById('managerSearch').value     = user.name;
    const badge = document.getElementById('managerBadge');
    badge.textContent    = '✓ ' + user.name;
    badge.style.display  = 'inline-block';
    document.getElementById('managerDropdown').classList.remove('open');
}

// Multi-select: workers (addProject)
function selectWorker(user) {
    if (selectedWorkerIds.includes(user._id)) return;
    selectedWorkerIds.push(user._id);

    const chip = document.createElement('div');
    chip.classList.add('worker-chip');
    chip.dataset.id  = user._id;
    chip.innerHTML   = `${user.name} <span class="remove-chip" onmousedown="removeWorker('${user._id}')">✕</span>`;
    document.getElementById('workerChips').appendChild(chip);

    document.getElementById('workerSearch').value = '';
    document.getElementById('workerDropdown').classList.remove('open');
}

function removeWorker(id) {
    selectedWorkerIds = selectedWorkerIds.filter(w => w !== id);
    const chip = document.querySelector(`.worker-chip[data-id="${id}"]`);
    if (chip) chip.remove();
}

// ── Project list ──────────────────────────────────────────────────────────────

function loadProjects() {
    $.when(
        $.get('/projects'),
        $.get('/purchaseorders')
    ).done(function (projectsRes, ordersRes) {
        const projects  = projectsRes[0];
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
                    const badgeColors = {
                        'Draft': '#6c757d', 'Pending': '#ffc107', 'Approved': '#28a745',
                        'Received': '#17a2b8', 'Cancelled': '#dc3545',
                        'Verified': '#20c997', 'Missing Materials': '#dc3545'
                    };
                    const bg  = badgeColors[po.status] || '#6c757d';
                    const fg  = po.status === 'Pending' ? '#333' : '#fff';
                    const cnt = po.materials ? po.materials.length : 0;
                    return `<span style="display:inline-block;background:${bg};color:${fg};border-radius:6px;padding:3px 10px;font-size:0.82rem;font-weight:600;margin:2px 4px 2px 0;">${po.poNumber} — ${po.vendor} (${cnt} item${cnt !== 1 ? 's' : ''})</span>`;
                }).join('');
            }

            list.append(`
                <div class="po-card">
                    <h3>${project.name}</h3>
                    <p><strong>Location:</strong> ${project.location}</p>
                    <p><strong>Manager:</strong> ${project.manager ? project.manager.name : 'N/A'}</p>
                    <p><strong>Workers:</strong> ${workerNames}</p>
                    <p><strong>Purchase Orders:</strong><br>${poDisplay}</p>
                    <div class="po-actions">
                        <button class="btn-view"   onclick="viewProject('${project._id}')">View</button>
                        <button class="btn-edit"   onclick="editProject('${project._id}')">Edit</button>
                        <button class="btn-delete" onclick="deleteProject('${project._id}')">Delete</button>
                    </div>
                </div>
            `);
        });
    }).fail(function () {
        $.get('/projects', function (projects) {
            allProjects = projects;
            const list  = $('#projectList2');
            list.empty();
            projects.forEach(project => {
                const workerNames = project.workers.map(w => w.name).join(', ') || 'None';
                list.append(`
                    <div class="po-card">
                        <h3>${project.name}</h3>
                        <p><strong>Location:</strong> ${project.location}</p>
                        <p><strong>Manager:</strong> ${project.manager ? project.manager.name : 'N/A'}</p>
                        <p><strong>Workers:</strong> ${workerNames}</p>
                        <div class="po-actions">
                            <button class="btn-view"   onclick="viewProject('${project._id}')">View</button>
                            <button class="btn-edit"   onclick="editProject('${project._id}')">Edit</button>
                            <button class="btn-delete" onclick="deleteProject('${project._id}')">Delete</button>
                        </div>
                    </div>
                `);
            });
        });
    });
}

// ── Navigation ────────────────────────────────────────────────────────────────

function viewProject(id) {
    window.location.href = `viewProject.html?id=${id}`;
}

function editProject(id) {
    window.location.href = `editProject.html?id=${id}`;
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        $.ajax({
            url: `/projects/${id}`,
            type: 'DELETE',
            success: function () {
                closePopup();
                loadProjects();
            },
            error: function (xhr) {
                console.error('Delete failed:', xhr);
                alert('Failed to delete project');
            }
        });
    }
}

// ── Search helpers (project search on addProject page) ────────────────────────

function openList(listId) {
    document.getElementById(listId).classList.add('open');
}

function closeListDelayed(listId) {
    setTimeout(() => document.getElementById(listId).classList.remove('open'), 200);
}

function filterList(inputId, listId, dataArr, searchField, onSelect) {
    const query = document.getElementById(inputId).value.toLowerCase();
    const list  = document.getElementById(listId);
    list.innerHTML = '';
    list.classList.add('open');

    const filtered = dataArr.filter(item =>
        (item[searchField] || '').toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
        list.innerHTML = '<li class="no-results">No results found</li>';
        return;
    }

    filtered.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item.name;
        li.onclick = () => onSelect(item);
        list.appendChild(li);
    });
}

function selectProject(project) {
    document.getElementById('selectedProjectId').value  = project._id;
    document.getElementById('projectSearch').value      = project.name;
    document.getElementById('projectBadge').textContent = '✓ ' + project.name;
    document.getElementById('projectBadge').style.display = 'inline-block';
    document.getElementById('projectList').classList.remove('open');
}

function clearProjectSearch() {
    ['projectSearch', 'selectedProjectId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const badge = document.getElementById('projectBadge');
    if (badge) badge.style.display = 'none';
}

// ── Popup (addProject page) ───────────────────────────────────────────────────

async function openPopup(event) {
    event.preventDefault();
    const id = document.getElementById('selectedProjectId').value;
    if (!id) { alert('No project selected'); return; }
    try {
        const response = await fetch(`/projects/${id}`);
        if (!response.ok) throw new Error(`Server returned ${response.status}`);
        const project = await response.json();
        populatePopup(project);
    } catch (error) {
        alert(`Failed to load project: ${error}`);
    }
}

function populatePopup(project) {
    const popup = document.getElementById('popup');
    popup.innerHTML = '';

    const logo = document.createElement('img');
    logo.src = './images/CoolSys-Logo.png';
    popup.appendChild(logo);

    const title = document.createElement('h2');
    title.textContent = project.name;
    popup.appendChild(title);

    const manager = document.createElement('p');
    manager.innerHTML = `<b>Manager:</b> ${project.manager ? project.manager.name : 'N/A'}`;
    popup.appendChild(manager);

    const location = document.createElement('p');
    location.innerHTML = `<b>Location:</b> ${project.location}`;
    popup.appendChild(location);

    const workerNames = project.workers.length
        ? project.workers.map(w => w.name).join(', ')
        : 'None';
    const workers = document.createElement('p');
    workers.innerHTML = `<b>Workers:</b> ${workerNames}`;
    popup.appendChild(workers);

    const btnDiv = document.createElement('div');
    btnDiv.classList.add('popup-btn-row');

    const viewBtn = document.createElement('button');
    viewBtn.classList.add('btn', 'btn-info');
    viewBtn.style.marginRight = '6px';
    viewBtn.textContent = '🔍 View';
    viewBtn.onclick = () => viewProject(project._id);
    btnDiv.appendChild(viewBtn);

    if (loggedUser && (loggedUser.role === 0 || loggedUser.role === 1)) {
        const editBtn = document.createElement('button');
        editBtn.classList.add('btn', 'btn-warning');
        editBtn.style.marginRight = '6px';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editProject(project._id);
        btnDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-danger');
        deleteBtn.style.marginRight = '6px';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteProject(project._id);
        btnDiv.appendChild(deleteBtn);
    }

    popup.appendChild(btnDiv);

    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.textContent = 'Close';
    closeBtn.onclick = () => closePopup();
    popup.appendChild(closeBtn);

    popup.classList.add('open-popup');
}

function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) popup.classList.remove('open-popup');
}

// ── DOMContentLoaded: fetch loggedUser + allProjects ─────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userRes = await fetch('/logged');
        if (userRes.ok) loggedUser = await userRes.json();
    } catch (e) {
        console.error('Could not fetch logged user:', e);
    }

    try {
        const projectsRes = await fetch('/projects');
        if (projectsRes.ok) allProjects = await projectsRes.json();
    } catch (e) {
        console.error('Error loading projects:', e);
    }
});