let allUsers = [];
let allTools = [];
let allProjects = [];

function openList(listId) {
    document.getElementById(listId).classList.add('open');
}

function closeListDelayed(listId) {
    setTimeout(() => document.getElementById(listId).classList.remove('open'), 200);
}

function filterList(inputId, listId, badge, selectedId, dataArr, searchField, onSelect) {
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
        populateFilterOption(li, searchField, item);
        li.onclick = () => onSelect(item, selectedId, inputId, badge, listId);
        list.appendChild(li);
    }
}

function populateFilterOption(li, searchField, item){
        if (searchField === 'serialNum'){
            li.textContent = `${item.serialNum} — ${item.model}`;
        } else if (searchField === 'email'){
            li.textContent = `${item.name} - ${item.email}`;
        } else{
            li.textContent = `${item.name}`;
        }
}

function selectTool(tool, selectedId, inputId, badge, listId) {
    document.getElementById(selectedId).value = tool._id;
    document.getElementById(inputId).value = tool.serialNum;
    document.getElementById(badge).textContent = '✓ ' + tool.serialNum;
    document.getElementById(badge).style.display = 'inline-block';
    document.getElementById(listId).classList.remove('open');
}

function selectUser(user, selectedId, inputId, badge, listId) {
    document.getElementById(selectedId).value = user._id;
    document.getElementById(inputId).value = user.email;
    document.getElementById(badge).textContent = '✓ ' + user.email;
    document.getElementById(badge).style.display = 'inline-block';
    document.getElementById(listId).classList.remove('open');
}

function selectProject(project, selectedId, inputId, badge, listId) {
    document.getElementById(selectedId).value = project._id;
    document.getElementById(inputId).value = project.name;
    document.getElementById(badge).textContent = '✓ ' + project.name;
    document.getElementById(badge).style.display = 'inline-block';
    document.getElementById(listId).classList.remove('open');
}

function clearSearch(searchIds, badges) {
    searchIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    badges.forEach(badge => {
        document.getElementById(badge).style.display = 'none';
    })
}

async function createPopup(valueId, dataType){
    const id = document.getElementById(valueId).value;
    let response;
    let data;
    try{
        switch (dataType){
            case 'tool':
                response = await fetch(`/tools/${id}`);
                break;
            case 'project':
                response = await fetch(`/projects/${id}`);
                break;
            case 'user':
                response = await fetch(`/users/${id}`);
                break;
        }
        data = await response.json();
    } catch (error){
        alert(`${error}`);
    }

    let popup = document.getElementById('popup');
    popup.innerHTML = '';

    let logo = document.createElement('img');
    logo.src = "./images/CoolSys-Logo.png";
    popup.appendChild(logo);

    switch(dataType){
        case 'tool':
            populateToolPopup(popup, data);
            break;
        case 'project':
            populateProjectPopup(popup, data);
            break;
        case 'user':
            populateUserPopup(popup, data);
            break;
    }

    let closeBtn = document.createElement('button');
    closeBtn.classList.add('close')
    closeBtn.innerHTML = 'Close';
    closeBtn.onclick = () => closePopup();

    popup.appendChild(closeBtn);

    popup.classList.add('open-popup');
}

function populateToolPopup(popup, tool){
    // TOOL INFO
    let title = document.createElement('h2');
    title.innerHTML = 'Tool';
    popup.appendChild(title);

    let serial = document.createElement('p');

    let serialTitle = document.createElement('b');
    serialTitle.innerHTML = 'Serial Number: ';

    let serialBody = document.createElement('span');
    serialBody.innerHTML = `${tool.serialNum}`;

    serial.appendChild(serialTitle);
    serial.appendChild(serialBody);

    let model = document.createElement('p');

    let modelTitle = document.createElement('b');
    modelTitle.innerHTML = 'Model: ';

    let modelBody = document.createElement('span');
    modelBody.innerHTML = `${tool.model}`;

    model.appendChild(modelTitle);
    model.appendChild(modelBody);

    let inUse = document.createElement('p');
    if (tool.inUse){
        inUse.innerHTML = `Currently being used by ${tool.usedBy.name}`;
    } else{
        inUse.innerHTML = 'Currently not being used';
    }

    // ACTION BUTTONS
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('text-center');
    btnDiv.style.margin = '5px';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn-danger');
    deleteBtn.style.marginRight = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteTool(tool);
    btnDiv.appendChild(deleteBtn);

    const deallocateBtn = document.createElement('button');
    deallocateBtn.classList.add('btn');
    deallocateBtn.classList.add('btn-warning');
    deallocateBtn.style.marginRight = "10px";
    deallocateBtn.innerHTML = 'Deallocate';
    deallocateBtn.onclick = () => deallocateTool(tool, user, '/tools.html');
    btnDiv.appendChild(deallocateBtn);

    popup.appendChild(serial);
    popup.appendChild(model);
    popup.appendChild(inUse);
    popup.appendChild(btnDiv);
}

function populateUserPopup(popup, user){
    let title = document.createElement('h2');
    title.innerHTML = 'User';
    popup.appendChild(title);

    let name = document.createElement('p');

    let nameTitle = document.createElement('b');
    nameTitle.innerHTML = 'Name: ';

    let nameBody = document.createElement('span');
    nameBody.innerHTML = `${user.name}`;

    name.appendChild(nameTitle);
    name.appendChild(nameBody);

    let role = document.createElement('p');

    let roleTitle = document.createElement('b');
    roleTitle.innerHTML = 'Role: ';

    let roleBody = document.createElement('span');
    //roleBody.innerHTML = `${roleIntToString(user.role)}`;
    roleBody.innterHTML = user.role

    role.appendChild(roleTitle);
    role.appendChild(roleBody);

    let email = document.createElement('p');

    let emailTitle = document.createElement('b');
    emailTitle.innerHTML = 'Email: ';

    let emailBody = document.createElement('span');
    emailBody.innerHTML = `${user.email}`;

    email.appendChild(emailTitle);
    email.appendChild(emailBody);

    // ACTION BUTTONS
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('text-center');
    btnDiv.style.margin = '5px';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn-danger');
    deleteBtn.style.marginRight = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteUser(user._id);
    btnDiv.appendChild(deleteBtn);

    popup.appendChild(name);
    popup.appendChild(role);
    popup.appendChild(email);
    popup.appendChild(btnDiv);
}

function populateProjectPopup(popup, project){
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
}

function closePopup(){
    let popup = document.getElementById('popup');
    popup.classList.remove('open-popup')
}

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const toolsRes = await fetch('/tools');
        const usersRes = await fetch('/users');
        const projectsRes = await fetch('/projects');
        allTools = await toolsRes.json();
        allUsers = await usersRes.json();
        allProjects = await projectsRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
        showMsg('Failed to load data', 'danger');
    }
});