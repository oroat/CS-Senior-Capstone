let loggedUser;

async function createPopup(valueId, dataType){
    const id = document.getElementById(valueId).value;
    if (id != ''){
        let response;
        let data;
        let usedBy;
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
            if (data.inUse){ //only for tools
                response = await fetch(`/users/${data.usedBy}`);
                usedBy = await response.json();
            }
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
                populateToolPopup(popup, data, usedBy);
                break;
            case 'project':
                populateProjectPopup(popup, data);
                break;
            case 'user':
                populateUserPopup(popup, data);
                break;
        }

        let closeBtn = document.createElement('button');
        closeBtn.classList.add('close');
        closeBtn.innerHTML = 'Close';
        closeBtn.onclick = () => closePopup();
        popup.appendChild(closeBtn);

        popup.classList.add('open-popup');
    } else alert('No item selected');
}

function populateToolPopup(popup, tool, user){
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
        inUse.innerHTML = `Currently being used by ${user.name}`;
    } else {
        inUse.innerHTML = 'Currently not being used';
    }

    popup.appendChild(serial);
    popup.appendChild(model);
    popup.appendChild(inUse);
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
    roleBody.innerHTML = `${roleIntToString(user.role)}`;
    role.appendChild(roleTitle);
    role.appendChild(roleBody);

    let email = document.createElement('p');
    let emailTitle = document.createElement('b');
    emailTitle.innerHTML = 'Email: ';
    let emailBody = document.createElement('span');
    emailBody.innerHTML = `${user.email}`;
    email.appendChild(emailTitle);
    email.appendChild(emailBody);

    popup.appendChild(name);
    popup.appendChild(role);
    popup.appendChild(email);
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

    popup.appendChild(manager);
    popup.appendChild(location);
    popup.appendChild(workers);

    // FIX: use 'popup-btn-row' instead of a plain div — the old
    // ".popup div { display: inline-flex }" rule in popup.css was
    // collapsing this div and making the buttons unclickable.
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('popup-btn-row');

    // View — always visible to all roles
    const viewBtn = document.createElement('button');
    viewBtn.classList.add('btn', 'btn-info');
    viewBtn.style.marginRight = '6px';
    viewBtn.innerHTML = '🔍 View Project';
    viewBtn.onclick = () => {
        window.location.href = `viewProject.html?id=${project._id}`;
    };
    btnDiv.appendChild(viewBtn);

    // Edit & Delete — admins (0) and managers (1) only
    // Safe check: loggedUser may still be loading, so guard with &&
    if (loggedUser && (loggedUser.role == 0 || loggedUser.role == 1)){
        const editBtn = document.createElement('button');
        editBtn.classList.add('btn', 'btn-warning');
        editBtn.style.marginRight = '6px';
        editBtn.innerHTML = 'Edit';
        editBtn.onclick = () => editProject(project._id);
        btnDiv.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-danger');
        deleteBtn.style.marginRight = '6px';
        deleteBtn.innerHTML = 'Delete';
        deleteBtn.onclick = () => deleteProject(project._id);
        btnDiv.appendChild(deleteBtn);
    }

    popup.appendChild(btnDiv);
}

function editProject(id){
    window.location.href = `editProject.html?id=${id}`;
}

function deleteProject(id){
    if (confirm("Are you sure you want to delete this project?")) {
        fetch(`/projects/${id}`, { method: 'DELETE' })
            .then(res => {
                if (!res.ok) throw new Error('Delete failed');
                closePopup();
                location.reload();
            })
            .catch(() => alert("Failed to delete project"));
    }
}

function closePopup(){
    let popup = document.getElementById('popup');
    popup.classList.remove('open-popup');
}

async function checkLogged(){
    try{
        let response = await fetch('/logged');
        loggedUser = await response.json();
    } catch (error){
        console.error("Auth check failed", error);
    }
}