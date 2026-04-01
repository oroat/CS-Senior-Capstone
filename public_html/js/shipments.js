// ─── State
let allUsers = [];
let allProjects = [];
let allPOs = [];
let projectPOs = [];
let selectedPOMaterials = [];

// ─── Message Helper
function showMsg(msg, type = 'success') {
    document.getElementById('msg-display').innerHTML = `
        <div class="alert alert-${type} alert-dismissible">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            ${msg}
        </div>`;
}

// ─── Searchable Dropdown Helpers
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
        if (searchField === 'email') {
            li.textContent = `${item.name} — ${item.email}`;
        } else if (searchField === 'poNumber') {
            li.textContent = `${item.poNumber} — ${item.vendor}`;
        } else {
            li.textContent = item.name;
        }
        li.onclick = () => onSelect(item);
        list.appendChild(li);
    }
}

// ─── Select Project → filter POs for that project
async function selectProject(project) {
    document.getElementById('selectedProjectId').value = project._id;
    document.getElementById('projectSearch').value = project.name;
    document.getElementById('projectBadge').textContent = '✓ ' + project.name;
    document.getElementById('projectBadge').style.display = 'inline-block';
    document.getElementById('projectList').classList.remove('open');

    // Filter POs for this project
    projectPOs = allPOs.filter(po => {
        const poProj = po.project?._id || po.project;
        return String(poProj) === String(project._id);
    });

    // Reset PO search
    clearPOSearch();
    renderMaterialChecklist([]);

    if (projectPOs.length === 0) {
        document.getElementById('materialChecklist').innerHTML =
            '<p class="text-muted" style="padding:10px;">No purchase orders found for this project.</p>';
    }
}

// ─── Select PO → show its materials as checkboxes
function selectPO(po) {
    document.getElementById('selectedPOId').value = po._id;
    document.getElementById('poSearch').value = po.poNumber;
    document.getElementById('poBadge').textContent = `✓ ${po.poNumber} — ${po.vendor}`;
    document.getElementById('poBadge').style.display = 'inline-block';
    document.getElementById('poList').classList.remove('open');

    selectedPOMaterials = po.materials || [];
    renderMaterialChecklist(selectedPOMaterials);
}

function clearPOSearch() {
    const el = document.getElementById('poSearch');
    const idEl = document.getElementById('selectedPOId');
    const badge = document.getElementById('poBadge');
    if (el) el.value = '';
    if (idEl) idEl.value = '';
    if (badge) badge.style.display = 'none';
    selectedPOMaterials = [];
}

// ─── Render material checkboxes from selected PO
function renderMaterialChecklist(materials) {
    const container = document.getElementById('materialChecklist');
    container.innerHTML = '';

    if (!materials || materials.length === 0) {
        container.innerHTML = '<p class="text-muted" style="padding:10px;">Select a PO to see its materials.</p>';
        return;
    }

    for (const mat of materials) {
        const row = document.createElement('div');
        row.classList.add('material-check-row');
        row.innerHTML = `
            <div class="form-check" style="flex:1;">
                <input class="form-check-input" type="checkbox" id="matCheck_${mat._id}" value="${mat._id}">
                <label class="form-check-label" for="matCheck_${mat._id}">
                    ${mat.name} <small class="text-muted">(${mat.quantity} ${mat.unit})</small>
                </label>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <input type="number" class="form-control form-control-sm" id="matQty_${mat._id}"
                    placeholder="Qty" min="0" style="width:90px;" disabled>
                <small class="text-muted">${mat.unit}</small>
            </div>
        `;

        const checkbox = row.querySelector(`#matCheck_${mat._id}`);
        const qtyInput = row.querySelector(`#matQty_${mat._id}`);
        checkbox.addEventListener('change', () => {
            qtyInput.disabled = !checkbox.checked;
            if (!checkbox.checked) qtyInput.value = '';
        });

        container.appendChild(row);
    }
}

// ─── Collect checked materials
function getCheckedMaterials() {
    return selectedPOMaterials
        .filter(mat => document.getElementById(`matCheck_${mat._id}`)?.checked)
        .map(mat => ({
            materialId: mat._id,
            name: mat.name,
            unit: mat.unit,
            quantity: Number(document.getElementById(`matQty_${mat._id}`)?.value || 0)
        }));
}

// ─── Recipient select
function selectRecip(user) {
    document.getElementById('selectedRecipId').value = user._id;
    document.getElementById('recipSearch').value = user.email;
    document.getElementById('recipBadge').textContent = '✓ ' + user.name;
    document.getElementById('recipBadge').style.display = 'inline-block';
    document.getElementById('recipList').classList.remove('open');
}

function selectUpdateRecip(user) {
    document.getElementById('updateSelectedRecipId').value = user._id;
    document.getElementById('updateRecipSearch').value = user.email;
    document.getElementById('updateRecipBadge').textContent = '✓ ' + user.name;
    document.getElementById('updateRecipBadge').style.display = 'inline-block';
    document.getElementById('updateRecipList').classList.remove('open');
}

// ─── Create Shipment
async function createShipment() {
    const sender   = document.getElementById('senderInput').value.trim();
    const project  = document.getElementById('selectedProjectId').value;
    const po       = document.getElementById('selectedPOId').value;
    const recip    = document.getElementById('selectedRecipId').value;
    const dt_recvd = document.getElementById('dtRecvdInput').value;
    const materials_recvd = getCheckedMaterials();

    if (!sender || !project || !po || !recip || !dt_recvd) {
        showMsg('Please fill out all required fields (Sender, Project, PO, Recipient, Date).', 'warning');
        return;
    }

    try {
        const response = await fetch('/shipments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender, project, po, recip, dt_recvd, materials_recvd })
        });

        if (response.ok) {
            showMsg('Shipment logged successfully.');
            clearForm();
            await viewShipments(false);
            await populateShipmentDropdown();
        } else {
            const result = await response.json();
            showMsg('Failed to log shipment: ' + (result.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        console.error('Error creating shipment:', error);
        showMsg('Network error. Please try again.', 'danger');
    }
}

// ─── Clear Form
function clearForm() {
    ['senderInput', 'dtRecvdInput', 'projectSearch', 'poSearch', 'recipSearch',
     'selectedProjectId', 'selectedPOId', 'selectedRecipId'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    ['projectBadge', 'poBadge', 'recipBadge'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
    projectPOs = [];
    selectedPOMaterials = [];
    renderMaterialChecklist([]);
}

// ─── View Shipments
async function viewShipments(filterApplied) {
    try {
        const response = await fetch('/shipments');
        if (!response.ok) throw new Error('Failed to fetch');

        const shipments = await response.json();
        const list = document.getElementById('shipmentList');
        const filter = document.getElementById('filteredSender').value.toLowerCase();

        list.innerHTML = '';
        if (!filterApplied) document.getElementById('filteredSender').value = '';

        if (shipments.length === 0) {
            list.innerHTML = '<p class="text-muted" style="margin-top:20px;">No shipments logged yet.</p>';
            return;
        }

        for (const shipment of shipments) {
            if (!filterApplied || shipment.sender.toLowerCase().includes(filter)) {
                addShipmentRow(list, shipment);
            }
        }
    } catch (error) {
        console.error('Error fetching shipments:', error);
        showMsg('Failed to load shipments.', 'danger');
    }
}

function addShipmentRow(container, shipment) {
    const materialNames = shipment.materials_recvd?.length
        ? shipment.materials_recvd.map(m => `${m.name} (${m.quantity} ${m.unit})`).join(', ')
        : '—';

    const poDisplay = shipment.po
        ? `${shipment.po.poNumber} — ${shipment.po.vendor}`
        : '—';

    const row = document.createElement('div');
    row.classList.add('row', 'shipment-item');
    row.innerHTML = `
        <div class="col-2">${shipment.sender}</div>
        <div class="col-2">${shipment.project?.name || '—'}</div>
        <div class="col-1">${poDisplay}</div>
        <div class="col-2">${shipment.recip?.name || '—'}</div>
        <div class="col-2">${shipment.dt_recvd}</div>
        <div class="col-2">${materialNames}</div>
        <div class="col-1">
            <button class="btn btn-danger btn-sm" onclick="deleteShipment('${shipment._id}')">Delete</button>
        </div>
    `;
    container.appendChild(row);
}

// ─── Delete
async function deleteShipment(id) {
    if (!confirm('Are you sure you want to delete this shipment?')) return;
    try {
        const response = await fetch(`/shipments/${id}`, { method: 'DELETE' });
        if (response.ok) {
            showMsg('Shipment deleted.');
            await viewShipments(false);
            await populateShipmentDropdown();
        } else {
            const result = await response.json();
            showMsg('Failed to delete: ' + (result.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        showMsg('Network error. Please try again.', 'danger');
    }
}

// ─── Update
async function populateUpdateForm() {
    const id = document.getElementById('updateShipmentDropdown').value;
    if (!id) return;
    try {
        const res = await fetch(`/shipments/${id}`);
        const shipment = await res.json();
        document.getElementById('updateSender').value = shipment.sender || '';
        document.getElementById('updateDt').value = shipment.dt_recvd || '';
        if (shipment.recip) {
            const recip = shipment.recip;
            document.getElementById('updateSelectedRecipId').value = recip._id || recip;
            document.getElementById('updateRecipSearch').value = recip.email || '';
            document.getElementById('updateRecipBadge').textContent = '✓ ' + (recip.name || '');
            document.getElementById('updateRecipBadge').style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error loading shipment:', error);
    }
}

async function updateShipment() {
    const id = document.getElementById('updateShipmentDropdown').value;
    if (!id) { showMsg('Please select a shipment to update.', 'warning'); return; }

    const updates = {
        sender:   document.getElementById('updateSender').value.trim(),
        dt_recvd: document.getElementById('updateDt').value,
        recip:    document.getElementById('updateSelectedRecipId').value
    };

    try {
        const response = await fetch(`/shipments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (response.ok) {
            showMsg('Shipment updated successfully.');
            await viewShipments(false);
        } else {
            const result = await response.json();
            showMsg('Failed to update: ' + (result.error || 'Unknown error'), 'danger');
        }
    } catch (error) {
        showMsg('Network error. Please try again.', 'danger');
    }
}

// ─── Shipment dropdown for update form
async function populateShipmentDropdown() {
    try {
        const res = await fetch('/shipments');
        const shipments = await res.json();
        const dd = document.getElementById('updateShipmentDropdown');
        dd.innerHTML = '<option value="" selected>Choose...</option>';
        for (const s of shipments) {
            dd.appendChild(new Option(`${s.sender} — ${s.dt_recvd}`, s._id));
        }
    } catch (e) {
        console.error('Error loading shipment dropdown:', e);
    }
}

// ─── Init
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [usersRes, projectsRes, posRes] = await Promise.all([
            fetch('/users'),
            fetch('/projects'),
            fetch('/purchaseorders')
        ]);
        allUsers    = await usersRes.json();
        allProjects = await projectsRes.json();
        allPOs      = await posRes.json();
    } catch (e) {
        console.error('Error loading init data:', e);
        showMsg('Failed to load init data.', 'danger');
    }

    await populateShipmentDropdown();
    await viewShipments(false);
});