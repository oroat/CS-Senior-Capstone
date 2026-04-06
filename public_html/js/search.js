let allUsers = [];
let allTools = [];
let allProjects = [];

function openList(listId) {
    document.getElementById(listId).classList.add('open');
}

function closeListDelayed(listId) {
    setTimeout(() => document.getElementById(listId).classList.remove('open'), 200);
}

function filterList(inputId, listId, badge, selectedId, dataArr, searchField, onSelect) {
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
        populateFilterOption(li, searchField, item);
        li.onclick = () => onSelect(item, selectedId, inputId, badge, listId);
        list.appendChild(li);
    }
}

function populateFilterOption(li, searchField, item){
        if (searchField === 'serialNum'){
            li.textContent = `${item.serialNum} — ${item.model}`;
        } else if (searchField === 'email'){
            li.textContent = `${item.name} - ${item.email}`;
        } else{
            li.textContent = `${item.name}`;
        }
}

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const toolsRes = await fetch('/tools');
        const usersRes = await fetch('/users');
        const projectsRes = await fetch('/projects');
        allTools = await toolsRes.json();
        allUsers = await usersRes.json();
        allProjects = await projectsRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
        showMsg('Failed to load data', 'danger');
    }

});