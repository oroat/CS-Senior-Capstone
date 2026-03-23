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
    deleteBtn.style.margin = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteTool(tool);
    buttonTd.appendChild(deleteBtn);

    const deallocateBtn = document.createElement('button');
    deallocateBtn.classList.add('btn');
    deallocateBtn.classList.add('btn-warning');
    deallocateBtn.innerHTML = 'Deallocate';
    deallocateBtn.onclick = () => deallocateTool(tool, user);
    buttonTd.appendChild(deallocateBtn);

    newRow.appendChild(serialInput);
    newRow.appendChild(modelInput);
    newRow.appendChild(useInput);
    newRow.appendChild(buttonTd);

    body.appendChild(newRow);
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

async function updateTool(){
    let toolId = document.getElementById("toolsdropdown").value;

    let userial = document.getElementById("updateserial").value;
    let umodel = document.getElementById("updatemodel").value;
    let updates = {serial: userial, model: umodel};

    try{
        const response = await fetch(`/updatetool/${toolId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok){
            alert('Tool updated successfully. Please refresh page to see changes.');
        } else{
            const result = response.json();
            alert('Failed to update tool: ' + (result.error || "Unknown error."));
        }
    } catch (error){
        alert(`Network error during update: ${error}`);
    }
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

        // if (response.ok){
        //     alert('Tool updated successfully. Please refresh page to see changes.');
        // } else{
        //     const result = response.json();
        //     alert('Failed to update tool: ' + (result.error || "Unknown error."));
        // }
    
        // alert(`Network error during update: ${error}`);
}

async function deallocateTool(tool, user){
    try{
        if (!tool.inUse){
            alert(`${tool.model} (${tool.serialNum}) not allocated`);
            return;
        }
        if (!confirm(`Are you sure you want to deallocate ${tool.model} (${tool.serialNum}) from ${user.name}?`)) return;

        let updates = {inUse: false};

        const response = await fetch(`/updatetool/${tool._id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (response.ok){
            alert('Tool updated successfully. Please refresh page to see changes.');
        } else{
            const result = response.json();
            alert('Failed to update tool: ' + (result.error || "Unknown error."));
        }
    } catch (error){
        alert(`Error during update: ${error}`);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await viewTools(false);
    await populateToolDropdowns();
});