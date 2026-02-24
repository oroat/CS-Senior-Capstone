$(document).ready(function () {
    // submission had for making new material
    $("#createMaterialForm").on("submit", function (e) {
        e.preventDefault();
        
        const newMaterial = {
            name: $("#matName").val(),
            quantity: $("#matQty").val(),
            unit: $("#matUnit").val(),
            project: $("#projectDropdown").val()
        };

        $.ajax({
            url: '/materials',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(newMaterial),
            success: function (response) {
                alert("Material added successfully!");
                $("#createMaterialForm")[0].reset();
                viewMaterials(); // refresh
                loadMaterialDropdowns(); // refresh the drop down
            },
            error: function (err) {
                console.error("Error creating material:", err);
                alert("Failed to add material.");
            }
        });
    });
});

// load list
function viewMaterials(isFilter = false) {
    $.get('/materials', function (materials) {
        let filterText = $("#filteredProject").val().toLowerCase();
        let html = "";

        materials.forEach(mat => {
            // check if filter is applied
            const projectName = mat.project ? mat.project.name : "Unassigned";
            if (isFilter && !projectName.toLowerCase().includes(filterText)) {
                return; 
            }

            html += `
                <div class="row material-item">
                    <div class="col-3">${mat.name}</div>
                    <div class="col-2">${mat.quantity}</div>
                    <div class="col-2">${mat.unit}</div>
                    <div class="col-3">${projectName}</div>
                    <div class="col-2">
                        <button class="btn btn-danger btn-sm" onclick="deleteMaterial('${mat._id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        $("#materialList").html(html);
        loadMaterialDropdowns(materials); // sync dropdown
    });
}

// delete a material
function deleteMaterial(id) {
    if (confirm("Are you sure you want to delete this material?")) {
        $.ajax({
            url: `/materials/${id}`,
            type: 'DELETE',
            success: function () {
                viewMaterials();
            }
        });
    }
}

// update quantity for a selected material
function updateStock() {
    const id = $("#updateMatSelect").val();
    const newQty = $("#updateQty").val();

    if (!id || !newQty) {
        alert("Please select a material and enter a quantity.");
        return;
    }

    $.ajax({
        url: `/materials/${id}`,
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ quantity: newQty }),
        success: function () {
            alert("Stock updated!");
            $("#updateQty").val('');
            viewMaterials();
        }
    });
}

// load Projects into the 'Assign' dropdown
function loadProjectDropdown() {
    $.get('/projects', function (projects) {
        let options = '<option value="" selected disabled>Choose Project...</option>';
        projects.forEach(proj => {
            options += `<option value="${proj._id}">${proj.name}</option>`;
        });
        $("#projectDropdown").html(options);
    });
}

// populate the 'Update' dropdown with current materials
function loadMaterialDropdowns(materials) {
    if (!materials) return;
    let options = '<option value="" selected disabled>Choose Material...</option>';
    materials.forEach(mat => {
        options += `<option value="${mat._id}">${mat.name} (${mat.unit})</option>`;
    });
    $("#updateMatSelect").html(options);
}
