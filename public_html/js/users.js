async function viewUsers(filterApplied){
    try{
        const response = await fetch('/users');

        if (response.ok) {
            const users = await response.json();
            //window.alert("response ok ", users);

            userList = document.getElementById('userList');
            filter = document.getElementById("filteredRole").value;
            userList.innerHTML = '';
            
            users.forEach(user => {
                if (!filterApplied || filter == user.role){
                    const userDiv = document.createElement('div');
                    userDiv.classList.add('row');
                    userDiv.style.margin = '10px';

                    const nameDiv = document.createElement('div');
                    nameDiv.classList.add('col');
                    nameDiv.style.border = 'solid #27f5da'
                    nameDiv.innerHTML = `${user.name}`;
                    userDiv.appendChild(nameDiv);

                    const roleDiv = document.createElement('div');
                    roleDiv.classList.add('col');
                    roleDiv.style.border = 'solid #27f5da'
                    roleDiv.innerHTML = `${user.role}`;
                    userDiv.appendChild(roleDiv);

                    const emailDiv = document.createElement('div');
                    emailDiv.classList.add('col');
                    emailDiv.style.border = 'solid #27f5da'
                    emailDiv.innerHTML = `${user.email}`;
                    userDiv.appendChild(emailDiv);

                    const buttonsDiv = document.createElement('div');
                    buttonsDiv.classList.add('col');

                    const deleteBtn = document.createElement('button');
                    deleteBtn.classList.add('btn');
                    deleteBtn.classList.add('btn-outline-danger');
                    deleteBtn.innerHTML = 'Delete';
                    deleteBtn.onclick = () => deleteUser(user._id);
                    buttonsDiv.appendChild(deleteBtn);

                    const updateBtn = document.createElement('button');
                    updateBtn.classList.add('btn');
                    updateBtn.classList.add('btn-outline-secondary');
                    updateBtn.innerHTML = 'Update Role';
                    updateBtn.onclick = () => updateRole(user._id);
                    buttonsDiv.appendChild(updateBtn);

                    userDiv.appendChild(buttonsDiv);

                    userList.appendChild(userDiv);
                }
            });
        } else{
        
        }
        } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert(`Network error: ${error}`);
        }   
}

async function deleteUser(userId){
    if (!confirm("Are you sure you want to delete this user?")) return;

    try{
        const response = await fetch(`/deleteuser/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            viewUsers();
        } else{
            const result = await response.json();
            alert("Failed to delete user: " + (result.error || "Unknown error"));
        }
    } catch (error){
        console.error('Error during delete: ', error);
        alert('Error. Please try again');
    }
}

async function updateRole(userId){
    const answer = prompt('Enter a new role (0 for admin, 1 for PM, ...)');
    let newRole = Number(answer);
    if (Number.isNaN(newRole)){
        window.alert('Please enter a number (0 = admin, 1 = PM, ...)');
        return;
    }
    else{
        try{
            const response = await fetch(`/updaterole/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({role: newRole})
            });
    
            if (response.ok){
                alert('User role updated successfully. Please refresh page to see changes.');
            } else{
                const result = response.json();
                alert('Failed to edit review: ' + (result.error || "Unknown error."));
            }
        } catch (error){
            console.error('Network error during update:', error);
            alert("Network error. Please try again.");
        }
    }
}

async function populateDropdown(){
    try{
        const response = await fetch('/users');

        if (response.ok) {
            const users = await response.json();
            //window.alert("response ok ", users);

            let dropdown = document.getElementById('usersdropdown');
            
            users.forEach( user => {
                let opt = document.createElement('option');
                opt.value = `${user._id}`;
                opt.innerHTML = `${user.name}`;

                dropdown.appendChild(opt);
            })




        } else{
        
        }
    } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert(`Network error: ${error}`);
    }   
}


document.addEventListener('DOMContentLoaded', async () => {
    await viewUsers(false);
    await populateDropdown();
});