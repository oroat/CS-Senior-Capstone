// editPurchaseOrder.js

const params = new URLSearchParams(window.location.search);
const poId   = params.get('id');

// Load projects into dropdown
function loadProjectDropdown(selectedProjectId) {
    $.get('/projects', function (projects) {
        const sel = $('#poProject');
        sel.find('option:not(:first)').remove();
        projects.forEach(p => {
            const option = $(`<option value="${p._id}">${p.name}</option>`);
            if (p._id === selectedProjectId) option.attr('selected', true);
            sel.append(option);
        });
    });
}

// Add a material row (pre-filled if editing existing)
function addMaterialRow(name = '', quantity = '', unit = '') {
    const row = `
        <div class="material-row">
            <input class="mat-name" type="text" placeholder="Material name" value="${name}" required>
            <input class="mat-qty"  type="number" placeholder="Qty" min="0" value="${quantity}" required>
            <input class="mat-unit" type="text" placeholder="Unit (kg, m...)" value="${unit}" required>
            <button type="button" class="btn-remove-mat" onclick="removeMaterialRow(this)">✕</button>
        </div>`;
    $('#materialRows').append(row);
}

function removeMaterialRow(btn) {
    $(btn).closest('.material-row').remove();
}

// Load existing PO data into the form
async function loadPO() {
    if (!poId) {
        alert('No PO ID provided.');
        window.location.href = 'purchaseOrders.html';
        return;
    }

    try {
        const res = await fetch(`/purchaseorders/${poId}`);
        if (!res.ok) throw new Error('PO not found');
        const po = await res.json();

        $('#poNumber').val(po.poNumber);
        $('#poVendor').val(po.vendor);
        $('#poNotes').val(po.notes || '');
        $('#poStatus').val(po.status);

        const projectId = po.project?._id || po.project;
        loadProjectDropdown(projectId);

        // Populate existing materials
        if (po.materials && po.materials.length > 0) {
            po.materials.forEach(m => addMaterialRow(m.name, m.quantity, m.unit));
        }
    } catch (err) {
        alert('Failed to load purchase order: ' + err.message);
        window.location.href = 'purchaseOrders.html';
    }
}

// Handle form submit
$(document).ready(function () {
    loadPO();

    $('#editPOForm').on('submit', async function (e) {
        e.preventDefault();

        const materials = [];
        $('#materialRows .material-row').each(function () {
            const name     = $(this).find('.mat-name').val().trim();
            const quantity = $(this).find('.mat-qty').val();
            const unit     = $(this).find('.mat-unit').val().trim();
            if (name && quantity && unit) {
                materials.push({ name, quantity: Number(quantity), unit });
            }
        });

        if (materials.length === 0) {
            alert('Please add at least one material.');
            return;
        }

        const updates = {
            poNumber:  $('#poNumber').val(),
            vendor:    $('#poVendor').val(),
            project:   $('#poProject').val(),
            status:    $('#poStatus').val(),
            notes:     $('#poNotes').val(),
            materials: materials
        };

        try {
            const res = await fetch(`/purchaseorders/${poId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                alert('Purchase Order updated!');
                window.location.href = 'purchaseOrders.html';
            } else {
                const result = await res.json();
                alert('Failed to update: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Network error: ' + err.message);
        }
    });
});