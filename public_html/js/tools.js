async function viewTools(filterApplied){
    try{
        const response = await fetch('/tools');

        if (response.ok) {
            const tools = await response.json();
            //window.alert("response ok ", users);

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

                    /**const updateBtn = document.createElement('button');
                    updateBtn.classList.add('btn');
                    updateBtn.classList.add('btn-outline-secondary');
                    updateBtn.innerHTML = 'Update Role';
                    updateBtn.onclick = () => updateRole(user._id);
                    buttonsDiv.appendChild(updateBtn);**/

                    toolDiv.appendChild(buttonsDiv);

                    toolList.appendChild(toolDiv);
            }}
            
            // users.forEach(user => async {
            //     if (!filterApplied || filter == user.role){
            //         const userDiv = document.createElement('div');
            //         userDiv.classList.add('row');
            //         userDiv.style.margin = '10px';

            //         const nameDiv = document.createElement('div');
            //         nameDiv.classList.add('col');
            //         nameDiv.style.border = 'solid #27f5da'
            //         nameDiv.innerHTML = `${user.name}`;
            //         userDiv.appendChild(nameDiv);

            //         const roleDiv = document.createElement('div');
            //         roleDiv.classList.add('col');
            //         roleDiv.style.border = 'solid #27f5da'
            //         let role = await roleIntToString(user.role);
            //         roleDiv.innerHTML = `${role}`;
            //         userDiv.appendChild(roleDiv);

            //         const emailDiv = document.createElement('div');
            //         emailDiv.classList.add('col');
            //         emailDiv.style.border = 'solid #27f5da'
            //         emailDiv.innerHTML = `${user.email}`;
            //         userDiv.appendChild(emailDiv);

            //         const buttonsDiv = document.createElement('div');
            //         buttonsDiv.classList.add('col');

            //         const deleteBtn = document.createElement('button');
            //         deleteBtn.classList.add('btn');
            //         deleteBtn.classList.add('btn-outline-danger');
            //         deleteBtn.innerHTML = 'Delete';
            //         deleteBtn.onclick = () => deleteUser(user._id);
            //         buttonsDiv.appendChild(deleteBtn);

            //         /**const updateBtn = document.createElement('button');
            //         updateBtn.classList.add('btn');
            //         updateBtn.classList.add('btn-outline-secondary');
            //         updateBtn.innerHTML = 'Update Role';
            //         updateBtn.onclick = () => updateRole(user._id);
            //         buttonsDiv.appendChild(updateBtn);**/

            //         userDiv.appendChild(buttonsDiv);

            //         userList.appendChild(userDiv);
            //     }
            // 
        } else{
        
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

document.addEventListener('DOMContentLoaded', async () => {
    await viewTools(false);
});