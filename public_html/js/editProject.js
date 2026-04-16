let allManagers = [];
let allWorkers  = [];
let selectedWorkerIds = [];   // tracks currently selected worker IDs

$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        alert('No project ID provided');
        return;
    }

    // 1. Load users into picker arrays first, then load project details
    $.get('/users', function (users) {
        allManagers = users.filter(u => u.role === 1);
        allWorkers  = users.filter(u => u.role !== 1);
        fetchProjectDetails();
    });

    function fetchProjectDetails() {
        $.ajax({
            url: '/projects/' + projectId,
            type: 'GET',
            success: function (project) {
                // Fill basic fields
                $('#name').val(project.name);
                $('#location').val(project.location);

                // Pre-select manager
                if (project.manager) {
                    const mgr = project.manager;
                    document.getElementById('selectedManagerId').value = mgr._id || mgr;
                    document.getElementById('managerSearch').value     = mgr.name || '';
                    const badge = document.getElementById('managerBadge');
                    badge.textContent   = '✓ ' + (mgr.name || '');
                    badge.style.display = 'inline-block';
                }

                // Pre-select workers as chips
                if (project.workers && project.workers.length > 0) {
                    project.workers.forEach(w => {
                        const id   = w._id || w;
                        const name = w.name || id;
                        if (!selectedWorkerIds.includes(id)) {
                            selectedWorkerIds.push(id);
                            const chip = document.createElement('div');
                            chip.classList.add('worker-chip');
                            chip.dataset.id = id;
                            chip.innerHTML  = `${name} <span class="remove-chip" onmousedown="removeWorker('${id}')">✕</span>`;
                            document.getElementById('workerChips').appendChild(chip);
                        }
                    });
                }
            },
            error: function () {
                alert('Failed to load project details');
            }
        });
    }

    // 2. Handle form submit
    $('#editProjectForm').on('submit', function (e) {
        e.preventDefault();

        const managerId = $('#selectedManagerId').val();
        if (!managerId) { alert('Please select a Project Manager.'); return; }

        const updatedData = {
            name:     $('#name').val(),
            location: $('#location').val(),
            manager:  managerId,
            workers:  selectedWorkerIds
        };

        $.ajax({
            url: '/projects/' + projectId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updatedData),
            success: function () {
                alert('Project updated successfully!');
                window.location.href = '/addProject';
            },
            error: function (err) {
                console.error(err);
                alert('Failed to update project');
            }
        });
    });
});

// ── Picker functions (same API as projects.js) ────────────────────────────────

function openPicker(dropdownId) {
    document.getElementById(dropdownId).classList.add('open');
}

function closePicker(dropdownId) {
    setTimeout(() => document.getElementById(dropdownId).classList.remove('open'), 200);
}

function filterPicker(inputId, dropdownId, dataArr, onSelect) {
    const query    = document.getElementById(inputId).value.toLowerCase();
    const dropdown = document.getElementById(dropdownId);
    dropdown.innerHTML = '';
    dropdown.classList.add('open');

    const filtered = dataArr.filter(u => u.name.toLowerCase().includes(query));

    if (filtered.length === 0) {
        dropdown.innerHTML = '<li class="no-results">No results found</li>';
        return;
    }

    filtered.forEach(u => {
        const li = document.createElement('li');
        li.textContent  = u.name;
        li.onmousedown  = (e) => { e.preventDefault(); onSelect(u); };
        dropdown.appendChild(li);
    });
}

function selectManager(user) {
    document.getElementById('selectedManagerId').value = user._id;
    document.getElementById('managerSearch').value     = user.name;
    const badge = document.getElementById('managerBadge');
    badge.textContent   = '✓ ' + user.name;
    badge.style.display = 'inline-block';
    document.getElementById('managerDropdown').classList.remove('open');
}

function selectWorker(user) {
    if (selectedWorkerIds.includes(user._id)) return;
    selectedWorkerIds.push(user._id);

    const chip = document.createElement('div');
    chip.classList.add('worker-chip');
    chip.dataset.id = user._id;
    chip.innerHTML  = `${user.name} <span class="remove-chip" onmousedown="removeWorker('${user._id}')">✕</span>`;
    document.getElementById('workerChips').appendChild(chip);

    document.getElementById('workerSearch').value = '';
    document.getElementById('workerDropdown').classList.remove('open');
}

function removeWorker(id) {
    selectedWorkerIds = selectedWorkerIds.filter(w => w !== id);
    const chip = document.querySelector(`.worker-chip[data-id="${id}"]`);
    if (chip) chip.remove();
}