async function roleIntToString(roleInt){
    let roleStr;

    switch (roleInt) {
        case 0: 
            roleStr = "Admin";
            break;
        case 1:
            roleStr = "Project Manager"
            break;
        case 2:
            roleStr = "Foreman";
            break;
        case 3:
            roleStr = "Logistics";
            break;
        case 4:
            roleStr = "Warehouse";
            break;
        default:
            roleStr = "Unknown";
            break;
    }
    return roleStr;
}

async function populateTitle(){
    const role = await roleIntToString(loggedUser.role);
    document.getElementById('name&role').innerHTML = `${loggedUser.name}, ${role}`;
}

async function populateTables(){

    let response = await fetch('/tools');
    let tools = await response.json();

    response = await fetch('/projects');
    let projects = await response.json();

    toolBody = document.getElementById('toolTableBody');
    projectBody = document.getElementById('projectTableBody');

    let count = 1;

    for (const tool of tools){
        if (tool.usedBy == user._id){
            addToolRow(toolBody, tool, loggedUser, count);
            count++;
        } 
    }
    
    count = 1;
    for (let i = 0; i < projects.length; i++){
        for (let j = 0; j < projects[i].workers.length; j++){
            //alert(projects[i].workers[j]);
            if (projects[i].workers[j].name == user.name){
                addProjectRow(projectBody, projects[i], count)
                count++;
            }
        }
    }

}


async function addToolRow(body, tool, user, count){
     
    const newRow = document.createElement('tr');

    const num = document.createElement('th');
    num.innerHTML = count;

    const model = document.createElement('td');
    model.innerHTML = tool.model;   

            
    const serial = document.createElement('td');
    serial.innerHTML = tool.serialNum;
            
    const buttonTd = document.createElement('td');
    buttonTd.style.placeItems = 'center';

    const button = document.createElement('button');
    button.classList.add('btn');
    button.classList.add('btn-warning');
    button.innerHTML = 'Unassign';
    button.onclick = () => deallocateTool(tool, user, '/profile.html');
    buttonTd.appendChild(button);

    newRow.appendChild(num);
    newRow.appendChild(model);
    newRow.appendChild(serial);
    newRow.appendChild(buttonTd);

    body.appendChild(newRow);

} 

async function addProjectRow(body, project, count){  
    const newRow = document.createElement('tr');

    const num = document.createElement('th');
    num.innerHTML = count;

    const projectName = document.createElement('td');
    projectName.innerHTML = project.name;

    const location = document.createElement('td');
    location.innerHTML = project.location;

    const manager = document.createElement('td');
    manager.innerHTML = project.manager.name;

    newRow.appendChild(num);
    newRow.appendChild(projectName);
    newRow.appendChild(location);
    newRow.appendChild(manager);

    body.appendChild(newRow)
}

// async function deallocateTool(tool, user){
//     try{
//         if (!tool.inUse){
//             alert(`${tool.model} (${tool.serialNum}) not allocated`);
//             return;
//         }
//         if (!confirm(`Are you sure you want to deallocate ${tool.model} (${tool.serialNum}) from ${user.name}?`)) return;

//         let updates = {inUse: false};

//         const response = await fetch(`/updatetool/${tool._id}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(updates)
//         });

//         if (response.ok){
//             alert('Tool updated successfully. Please refresh page to see changes.');
//         } else{
//             const result = response.json();
//             alert('Failed to update tool: ' + (result.error || "Unknown error."));
//         }
//     } catch (error){
//         alert(`Error during update: ${error}`);
//     }
// }

  
document.addEventListener('DOMContentLoaded', async () => {
    await checkLogged();
    await populateTitle();
    await populateTables();
});