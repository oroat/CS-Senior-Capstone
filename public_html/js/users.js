let allUsers = [];

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
        li.textContent = searchField === 'email'
            ? `${item.name} — ${item.email}`
            : item.name;
        li.onclick = () => onSelect(item);
        list.appendChild(li);
    }
}

function selectUser(user) {
    document.getElementById('selectedUserId').value = user._id;
    document.getElementById('userSearch').value = user.email;
    document.getElementById('userBadge').textContent = '✓ ' + user.email;
    document.getElementById('userBadge').style.display = 'inline-block';
    document.getElementById('userList').classList.remove('open');
}

function clearUserSearch() {
    ['userSearch', 'selectedUserId',].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('userBadge').style.display = 'none';
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
    // await viewUsers(false);
    try {
        const usersRes = await fetch('/users');
        allUsers = await usersRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
        showMsg('Failed to load users', 'danger');
    }
    await populateUserDropdowns();
});