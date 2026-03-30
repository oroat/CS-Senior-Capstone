let allTools = [];

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
        li.textContent = searchField === 'serialNum'
            ? `${item.serialNum} — ${item.model}`
            : item.serialNum;
        li.onclick = () => onSelect(item);
        list.appendChild(li);
    }
}

function selectRecip(tool) {
    document.getElementById('selectedToolId').value = tool._id;
    document.getElementById('toolSearch').value = tool.serialNum;
    document.getElementById('toolBadge').textContent = '✓ ' + tool.serialNum;
    document.getElementById('toolBadge').style.display = 'inline-block';
    document.getElementById('toolList').classList.remove('open');
}

async function test(event){
    event.preventDefault();
    let id = document.getElementById('selectedToolId').value;
    let tool;
    let user;
    if (id == '') alert('no tool selected');
    else{
        try{
            let response = await fetch(`/tools/${id}`);
            tool = await response.json();
            if (tool.inUse){
                const response = await fetch(`/users/${tool.usedBy}`);
                user = await response.json();
            }
            await openPopup(tool, user);
        }catch (error){
            alert(`${error}`);
        }
    }
}

async function viewTools(filterApplied){
    // if (document.getElementById('toolList') == null){
    //     return;
    // }

    try{
        const response = await fetch('/tools');

        if (response.ok) {
            const tools = await response.json();

            toolBody = document.getElementById('toolTableBody');

            toolList = document.getElementById('toolList');
            //filter = document.getElementById("filteredRole").value;
            toolBody.innerHTML = '';

            //if (!filterApplied) document.getElementById('filteredRole').value = '';

            for (const tool of tools){

                //if (!filterApplied || filter == role){
                if (!filterApplied){
                    await addToolRow(toolBody, tool);
            }}   
            //FILTER STUFF LEFT IN CASE A FILTER IS ADDED IN THE FUTURE
        }
        } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert(`Network error: ${error}`);
        }   
}

async function addToolRow(body, tool){
    let user;
    try{
        if (tool.inUse){
            const response = await fetch(`/users/${tool.usedBy}`);
            user = await response.json();
        }
    } catch (error){
        alert(`Network error: ${error}`);
    }

    const newRow = document.createElement('tr');

    const serialInput = document.createElement('td');
    serialInput.innerHTML = tool.serialNum;

    const modelInput = document.createElement('td');
    modelInput.innerHTML = tool.model; 
    
    
    const useInput = document.createElement('td');
    useInput.innerHTML = `${tool.inUse}`;
    if (tool.inUse) useInput.innerHTML += `, used by ${user.name}`;
            
    const buttonTd = document.createElement('td');
    buttonTd.style.placeItems = 'center';

    const deleteBtn = document.createElement('button');

    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn-danger');
    deleteBtn.style.marginRight = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteTool(tool);
    buttonTd.appendChild(deleteBtn);

    const deallocateBtn = document.createElement('button');
    deallocateBtn.classList.add('btn');
    deallocateBtn.classList.add('btn-warning');
    deallocateBtn.style.marginRight = "10px";
    deallocateBtn.innerHTML = 'Deallocate';
    deallocateBtn.onclick = () => deallocateTool(tool, user);
    buttonTd.appendChild(deallocateBtn);

    const popupBtn = document.createElement('button');
    popupBtn.classList.add('btn');
    popupBtn.classList.add('btn-primary');
    popupBtn.innerHTML = 'Open Popup';
    //popupBtn.onclick = () => openPopup(tool);
    buttonTd.appendChild(popupBtn);

    newRow.appendChild(serialInput);
    newRow.appendChild(modelInput);
    newRow.appendChild(useInput);
    newRow.appendChild(buttonTd);

    body.appendChild(newRow);
}


async function openPopup(tool, user){

    let popup = document.getElementById('popup');
    popup.innerHTML = '';

    let logo = document.createElement('img');
    logo.src = "./images/CoolSys-Logo.png";
    popup.appendChild(logo);

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

    
    popup.appendChild(serial);
    popup.appendChild(model);
    popup.appendChild(inUse);

    let closeBtn = document.createElement('button');
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

        if (response.ok) {
            viewTools();
        } else{
            const result = await response.json();
            alert("Failed to delete tool: " + (result.error || "Unknown error"));
        }
    } catch (error){
        console.error('Error during delete: ', error);
        alert('Error. Please try again');
    }
}

async function populateToolDropdowns(){
    //add more dropdowns here as needed
    let dropdowns = [document.getElementById('toolsdropdown'),
                    document.getElementById('toolsdropdown2')]
    
    for (const dropdown of dropdowns){
        await popToolDropdown(dropdown);
    }
}

async function popToolDropdown(dropdown){
    try{
        const response = await fetch('/tools');
        const tools = await response.json();

        tools.forEach( tool => {
            let opt = document.createElement('option');
            opt.value = `${tool._id}`;
            opt.innerHTML = `${tool.model} (${tool.serialNum})`;

            dropdown.appendChild(opt);
        })
    } catch (error){
        alert(`Network error: ${error}`);
    }
}

async function updateTool(event){
    event.preventDefault();
    let toolId = document.getElementById("toolsdropdown").value;

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
    let toolId = document.getElementById("toolsdropdown2").value;
    let userId = document.getElementById("usersdropdown").value;

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

document.addEventListener('DOMContentLoaded', async () => {
    await viewTools(false);
    await populateToolDropdowns();

    try {
        const toolsRes = await fetch('/tools');
        allTools = await toolsRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
        showMsg('Failed to load users/projects.', 'danger');
    }

});