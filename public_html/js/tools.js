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

async function updateTool(event, redirect){
    event.preventDefault();
    let toolId = document.getElementById("updateSelectedToolId").value;

    let userial = document.getElementById("updateserial").value;
    let umodel = document.getElementById("updatemodel").value;
    let updates = {serial: userial, model: umodel};


    const response = await fetch(`/updatetool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: toolId, updates, redirectTo: redirect})
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

async function addUserToTool(event, redirect){
    event.preventDefault();
    let toolId = document.getElementById("addUserSelectedToolId").value;
    let userId = document.getElementById("addUserSelectedUserId").value;


    let response = await fetch(`/tools/${toolId}`);
    // let tool = await response.json();
    // // if you are not an admin, you can not unassign a tool from someone else to use it yourself. 
    // if (tool.inUse && loggedUser.role != 0){
    //     alert('Tool is already in use. Please check the tool popup to see who is using it.');
    //     return;
    // }

    let updates = {inUse: true, usedBy: userId};

    response = await fetch(`/updatetool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: toolId, updates, redirectTo: redirect})
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

async function deallocateTool(tool, user, redirect){
        if (!tool.inUse){
            alert(`${tool.model} (${tool.serialNum}) not allocated`);
            return;
        }
        if (!confirm(`Are you sure you want to deallocate ${tool.model} (${tool.serialNum}) from ${user.name}?`)) return;

        let updates = {inUse: false};

        const response = await fetch(`/updatetool`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({id: tool._id, updates, redirectTo: redirect})
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
    await checkLogged();

    //if you are not an admin, you can't update tools (besides moving them between users)
    if (loggedUser.role != 0){
        document.getElementById('toolUpdate').style.display = 'none';
    }

});