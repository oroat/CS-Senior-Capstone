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

function clearPopupSearch() {
    ['popupToolSearch', 'popupSelectedToolId',].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('popupToolBadge').style.display = 'none';
}

function clearAddUserSearch() {
    ['addUserToolSearch', 'addUserSelectedToolId', 'addUserUserSearch', 'addUserSelectedUserId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('addUserToolBadge').style.display = 'none';
    document.getElementById('addUserUserBadge').style.display = 'none';
}

function clearUpdateSearch(){
    ['updateToolSearch', 'updateSelectedToolId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('updateToolBadge').style.display = 'none';
    document.getElementById('updateserial').value = '';
    document.getElementById('updatemodel').value = '';
}

async function openPopup(event){
    event.preventDefault();
    let tool;
    let user;

    let id = document.getElementById('popupSelectedToolId').value;
    if (id == '') alert('no tool selected');
    else{
        try{
            let response = await fetch(`/tools/${id}`);
            tool = await response.json();
            if (tool.inUse){
                const response = await fetch(`/users/${tool.usedBy}`);
                user = await response.json();
            }
            populatePopup(tool, user);
        }catch (error){
            alert(`${error}`);
        }
    }
}

function populatePopup(tool, user){

    let popup = document.getElementById('popup');
    popup.innerHTML = '';

    let logo = document.createElement('img');
    logo.src = "./images/CoolSys-Logo.png";
    popup.appendChild(logo);

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
        inUse.innerHTML = `Currently being used by ${user.name}`;
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
    deallocateBtn.onclick = () => deallocateTool(tool, user);
    btnDiv.appendChild(deallocateBtn);

    popup.appendChild(serial);
    popup.appendChild(model);
    popup.appendChild(inUse);
    popup.appendChild(btnDiv);

    let closeBtn = document.createElement('button');
    closeBtn.classList.add('close')
    closeBtn.innerHTML = 'Close';
    closeBtn.onclick = () => closePopup();

    popup.appendChild(closeBtn);

    popup.classList.add('open-popup');
}

function closePopup(){
    let popup = document.getElementById('popup');
    popup.classList.remove('open-popup')
}

async function deleteTool(tool){
    if (!confirm(`Are you sure you want to delete ${tool.model} (${tool.serialNum})?`)) return;

    try{
        const response = await fetch(`/deletetool/${tool._id}`, {
            method: 'DELETE'
        });
        window.location.reload();

    } catch (error){
        console.error('Error during delete: ', error);
        alert('Error. Please try again');
    }
}

async function updateTool(event){
    event.preventDefault();
    let toolId = document.getElementById("updateSelectedToolId").value;

    let userial = document.getElementById("updateserial").value;
    let umodel = document.getElementById("updatemodel").value;
    let updates = {serial: userial, model: umodel};


    const response = await fetch(`/updatetool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: toolId, updates})
    })
    .then(response => response.json())
    .then(data => {
        alert('Update Successful');
        window.location.href = data.redirect; 
    })
    .catch(error => {
        alert(`Error updating tool`);
    });
}

async function addUserToTool(event){
    event.preventDefault();
    let toolId = document.getElementById("addUserSelectedToolId").value;
    let userId = document.getElementById("addUserSelectedUserId").value;

    let updates = {inUse: true, usedBy: userId};

    const response = await fetch(`/updatetool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: toolId, updates})
    })
    .then(response => response.json())
    .then(data => {
        alert('Update Successful');
        window.location.href = data.redirect; 
    })
    .catch(error => {
        alert(`Error updating tool`);
    });
}

async function deallocateTool(tool, user){
        if (!tool.inUse){
            alert(`${tool.model} (${tool.serialNum}) not allocated`);
            return;
        }
        if (!confirm(`Are you sure you want to deallocate ${tool.model} (${tool.serialNum}) from ${user.name}?`)) return;

        let updates = {inUse: false};

        const response = await fetch(`/updatetool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: tool._id, updates})
        })
        .then(response => response.json())
        .then(data => {
            alert('Update Successful');
            window.location.href = data.redirect; 
        })
        .catch(error => {
            alert(`Error deallocating tool: ${error.message}`);
        });
    }