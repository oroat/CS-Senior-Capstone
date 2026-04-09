function clearUserSearch() {
    ['userSearch', 'selectedUserId',].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('userBadge').style.display = 'none';
}

function clearUpdateUserSearch() {
    ['updateUserSearch', 'updateSelectedUserId',].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('updateUserBadge').style.display = 'none';
    document.getElementById('rolesdropdown').value = "";
    // document.getElementById('rolesdropdown').selected = "Choose..."
}

async function openPopup(event){
    event.preventDefault();
    let user;

    let id = document.getElementById('selectedUserId').value;
    if (id == '') alert('no user selected');
    else{
        try{
            let response = await fetch(`/users/${id}`);
            user = await response.json();
            populatePopup(user);
        }catch (error){
            alert(`${error}`);
        }
    }
}

function populatePopup(user){

    let popup = document.getElementById('popup');
    popup.innerHTML = '';

    let logo = document.createElement('img');
    logo.src = "./images/CoolSys-Logo.png";
    popup.appendChild(logo);

    // TOOL INFO
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

    // ACTION BUTTONS
    const btnDiv = document.createElement('div');
    btnDiv.classList.add('text-center');
    btnDiv.style.margin = '5px';

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn');
    deleteBtn.classList.add('btn-danger');
    deleteBtn.style.marginRight = "10px";
    deleteBtn.innerHTML = 'Delete';
    deleteBtn.onclick = () => deleteUser(user._id);
    btnDiv.appendChild(deleteBtn);

    popup.appendChild(name);
    popup.appendChild(role);
    popup.appendChild(email);
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

function roleIntToString(roleInt){
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
        window.location.reload();
    } catch (error){
        console.error('Error during delete: ', error);
        alert('Error. Please try again');
    }
}

async function updateRole(event, redirect){
    event.preventDefault();
    let userId = document.getElementById('updateSelectedUserId');
    let rdropdown = document.getElementById('rolesdropdown');

    const response = await fetch(`/updaterole`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({id: userId.value, role: rdropdown.value, redirectTo: redirect})
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