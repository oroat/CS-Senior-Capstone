async function viewTools(filterApplied){
    try{
        const response = await fetch('/tools');

        if (response.ok) {
            const tools = await response.json();

            toolList = document.getElementById('toolList');
            //filter = document.getElementById("filteredRole").value;
            toolList.innerHTML = '';

            //if (!filterApplied) document.getElementById('filteredRole').value = '';

            for (const tool of tools){
                //let role = await roleIntToString(user.role);

                //if (!filterApplied || filter == role){
                if (!filterApplied){
                    const toolDiv = document.createElement('div');
                    toolDiv.classList.add('row');
                    toolDiv.style.margin = '10px';

                    const serialDiv = document.createElement('div');
                    serialDiv.classList.add('col');
                    serialDiv.style.border = 'solid #27f5da'
                    serialDiv.innerHTML = `${tool.serialNum}`;
                    toolDiv.appendChild(serialDiv);

                    const modelDiv = document.createElement('div');
                    modelDiv.classList.add('col');
                    modelDiv.style.border = 'solid #27f5da'
                    
                    modelDiv.innerHTML = `${tool.model}`;
                    toolDiv.appendChild(modelDiv);

                    const useDiv = document.createElement('div');
                    useDiv.classList.add('col');
                    useDiv.style.border = 'solid #27f5da'
                    useDiv.innerHTML = `${tool.inUse}`;
                    toolDiv.appendChild(useDiv);

                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.classList.add('col');

                    const deleteBtn = document.createElement('button');
                    deleteBtn.classList.add('btn');
                    deleteBtn.classList.add('btn-outline-danger');
                    deleteBtn.innerHTML = 'Delete';
                    deleteBtn.onclick = () => deleteTool(tool._id);
                    buttonsDiv.appendChild(deleteBtn);

                    toolDiv.appendChild(buttonsDiv);

                    toolList.appendChild(toolDiv);
            }}   
        }
        } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert(`Network error: ${error}`);
        }   
}

async function deleteTool(toolId){
    if (!confirm("Are you sure you want to delete this tool?")) return;

    try{
        const response = await fetch(`/deletetool/${toolId}`, {
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

async function populateDropdowns(){
    try{
        const response = await fetch('/tools');

        if (response.ok) {
            const tools = await response.json();

            let dropdown = document.getElementById('toolsdropdown');
            let dropdown2 = document.getElementById('toolsdropdown2');
            
            tools.forEach( tool => {
                let opt = document.createElement('option');
                opt.value = `${tool._id}`;
                opt.innerHTML = `${tool.model} (${tool.serialNum})`;

                dropdown.appendChild(opt);

                let opt2 = document.createElement('option');
                opt2.value = `${tool._id}`;
                opt2.innerHTML = `${tool.model} (${tool.serialNum})`;
                dropdown2.appendChild(opt2);
            })
        }
    } catch (error){
            console.error('Network error during review retrieval:', error); 
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

async function addUserToTool(){
    let toolId = document.getElementById("toolsdropdown2").value;
    let userId = document.getElementById("usersdropdown").value;

    let updates = {inUse: true, usedBy: userId};

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

document.addEventListener('DOMContentLoaded', async () => {
    await viewTools(false);
    await populateDropdowns();
});