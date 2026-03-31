// purchaseOrders.js

$(document).ready(function () {

    function loadProjectDropdown() {
        $.get('/projects', function (projects) {
            const sel = $('#poProject');
            sel.find('option:not(:first)').remove();
            projects.forEach(p => {
                sel.append(`<option value="${p._id}">${p.name}</option>`);
            });
        });
    }

    loadProjectDropdown();
    loadPurchaseOrders();

    $('#poForm').on('submit', function (e) {
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
            alert('Please add at least one material to the purchase order.');
            return;
        }

        const formData = {
            poNumber: $('#poNumber').val(),
            vendor:   $('#poVendor').val(),
            project:  $('#poProject').val(),
            status:   $('#poStatus').val(),
            notes:    $('#poNotes').val(),
            materials: materials
        };

        $.ajax({
            url: '/purchaseorders',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Purchase Order Created!');
                $('#poForm')[0].reset();
                $('#materialRows').empty();
                loadPurchaseOrders();
            },
            error: function () {
                alert('Error creating purchase order.');
            }
        });
    });
});

function loadPurchaseOrders(filter = false) {
    $.get('/purchaseorders', function (orders) {

        if (filter) {
            const filterVal = $('#filterPONumber').val().trim().toLowerCase();
            if (filterVal) {
                orders = orders.filter(po =>
                    po.poNumber.toLowerCase().includes(filterVal)
                );
            }
        }

        const list = $('#poList');
        list.empty();

        if (orders.length === 0) {
            list.append('<p style="color:#888;">No purchase orders found.</p>');
            return;
        }

        orders.forEach(po => {
            const project    = po.project ? po.project.name : 'N/A';
            const badgeClass = 'badge-' + (po.status || 'Draft');
            const matHtml    = po.materials && po.materials.length > 0
                ? po.materials.map(m => `<li>${m.name} — ${m.quantity} ${m.unit}</li>`).join('')
                : '<li style="color:#888;">No materials</li>';

            list.append(`
                <div class="po-card">
                    <h3>
                        ${po.poNumber}
                        <span class="badge ${badgeClass}">${po.status}</span>
                    </h3>
                    <p><strong>Vendor:</strong> ${po.vendor}</p>
                    <p><strong>Project:</strong> ${project}</p>
                    ${po.notes ? `<p><strong>Notes:</strong> ${po.notes}</p>` : ''}
                    <p><strong>Materials:</strong></p>
                    <ul class="mat-list">${matHtml}</ul>
                    <div class="po-actions">
                        <button class="btn-edit" onclick="editPO('${po._id}')">Edit</button>
                        <button class="btn-delete" onclick="deletePO('${po._id}')">Delete</button>
                    </div>
                </div>
            `);
        });
    });
}

function addMaterialRow() {
    const row = `
        <div class="material-row">
            <input class="mat-name" type="text" placeholder="Material name" required>
            <input class="mat-qty" type="number" placeholder="Qty" min="0" required>
            <input class="mat-unit" type="text" placeholder="Unit (kg, m...)" required>
            <button type="button" class="btn-remove-mat" onclick="removeMaterialRow(this)">✕</button>
        </div>`;
    $('#materialRows').append(row);
}

function removeMaterialRow(btn) {
    $(btn).closest('.material-row').remove();
}

function editPO(id) {
    window.location.href = `editPurchaseOrder.html?id=${id}`;
}

function deletePO(id) {
    if (confirm('Are you sure you want to delete this purchase order?')) {
        $.ajax({
            url: `/purchaseorders/${id}`,
            type: 'DELETE',
            success: function () {
                loadPurchaseOrders();
            },
            error: function () {
                alert('Failed to delete purchase order.');
            }
        });
    }
}
