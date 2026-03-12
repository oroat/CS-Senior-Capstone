async function getLogged(){
    const response = await fetch('/logged');
    const user = await response.json();

    return user;
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

async function populateTitle(){
    const user = await getLogged();
    const role = await roleIntToString(user.role);
    document.getElementById('name&role').innerHTML = `${user.name}, ${role}`;
}

async function populateTables(){
    let response = await fetch('/tools');
    const tools = await response.json();

    const user = await getLogged();
    toolBody = document.getElementById('toolTableBody');
    let i = 1;

    for (const tool of tools){
        if (tool.usedBy == user._id){
            const newRow = document.createElement('tr');

            const num = document.createElement('th');
            num.innerHTML = i;

            const model = document.createElement('td');
            model.innerHTML = tool.model;   

            
            const serial = document.createElement('td');
            serial.innerHTML = tool.serialNum;
            
            const buttonTd = document.createElement('td');
            buttonTd.style.placeItems = 'center';

            const button = document.createElement('button');
            button.classList.add('btn');
            button.classList.add('btn-warning');
            button.innerHTML = 'Warning';
            buttonTd.appendChild(button);

            newRow.appendChild(num);
            newRow.appendChild(model);
            newRow.appendChild(serial);
            newRow.appendChild(buttonTd);

            toolBody.appendChild(newRow);

            i++;

        } 
        
    }
}

  
document.addEventListener('DOMContentLoaded', async () => {
    await populateTitle();
    await populateTables();
});