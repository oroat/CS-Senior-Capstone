async function viewUsers(filterApplied){
    if (document.getElementById('userTableBody') == null){
        return;
    }

    try{
        const response = await fetch('/users');

        if (response.ok) {
            const users = await response.json();

            userBody = document.getElementById('userTableBody');
            
            filter = document.getElementById("filteredRole").value;
            userBody.innerHTML = '';

            if (!filterApplied) document.getElementById('filteredRole').value = '';

            for (const user of users){
                if (!filterApplied || filter == await roleIntToString(user.role)){
                    addUserRow(userBody, user);
            }}
        }
        } catch (error){
            console.error('Network error during review retrieval:', error); 
            alert(`Network error: ${error}`);
        }   
}

async function addUserRow(body, user){
     
    const newRow = document.createElement('tr');

    const nameInput = document.createElement('td');
    nameInput.innerHTML = user.name;

    const roleInput = document.createElement('td');
    let role = await roleIntToString(user.role);
    roleInput.innerHTML = role;   

            
    const emailInput = document.createElement('td');
    emailInput.innerHTML = user.email;
            
    const buttonTd = document.createElement('td');
    buttonTd.style.placeItems = 'center';

    const button = document.createElement('button');
    button.classList.add('btn');
    button.classList.add('btn-danger');
    button.innerHTML = 'Delete';
    button.onclick = () => deleteUser(user._id);
    buttonTd.appendChild(button);

    newRow.appendChild(nameInput);
    newRow.appendChild(roleInput);
    newRow.appendChild(emailInput);
    newRow.appendChild(buttonTd);

    body.appendChild(newRow);

} 

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

async function updateRole(event){
    event.preventDefault();
    let udropdown = document.getElementById('usersdropdown');
    let rdropdown = document.getElementById('rolesdropdown');

    const response = await fetch(`/updaterole`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({usersdropdown: udropdown.value, rolesdropdown: rdropdown.value})
    })
    .then(response => response.json())
    .then(data => {
        alert('Update Successful');
        window.location.href = data.redirect; 
    })
    .catch(error => {
        alert(`Error updating user`);
    });
} 
    


// async function updateRoleOld(userId){
//     const answer = prompt('Enter a new role (0 for admin, 1 for PM, ...)');
//     let newRole = Number(answer);
//     if (Number.isNaN(newRole)){
//         window.alert('Please enter a number (0 = admin, 1 = PM, ...)');
//         return;
//     }
//     else{
//         try{
//             const response = await fetch(`/updaterole/${userId}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({role: newRole})
//             });
    
//             if (response.ok){
//                 alert('User role updated successfully. Please refresh page to see changes.');
//             } else{
//                 const result = response.json();
//                 alert('Failed to edit review: ' + (result.error || "Unknown error."));
//             }
//         } catch (error){
//             console.error('Network error during update:', error);
//             alert("Network error. Please try again.");
//         }
//     }
// }

async function populateUserDropdowns(){
    if (document.getElementById('usersdropdown') == null){
        return;
    }

    //add to list if necessary
    let dropdowns = [document.getElementById('usersdropdown')];

    let users;
    try{
        const response = await fetch('/users');
        users = await response.json();
    } catch (error){
        alert(`Network error: ${error}`);
    }

    for (const dropdown of dropdowns){
        await popUserDropdown(dropdown, users);
    }
}

async function popUserDropdown(dropdown, users){
    for (const user of users){
        let opt = document.createElement('option');
        opt.value = `${user._id}`;
        opt.innerHTML = `${user.name}`;

        dropdown.appendChild(opt);
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await viewUsers(false);
    await populateUserDropdowns();
});