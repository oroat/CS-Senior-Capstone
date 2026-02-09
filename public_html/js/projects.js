$(document).ready(function () {

    // Load projects on page load
    viewProjects();

    // Submit form
    $("#projectForm").submit(function (e) {
        e.preventDefault();

        let workersArray = [];

        let workersInput = $("#workers").val();
        if (workersInput) {
            workersArray = workersInput.split(",").map(id => id.trim());
        }

        let projectData = {
            name: $("#name").val(),
            location: $("#location").val(),
            manager: $("#manager").val(),
            workers: workersArray
        };

        $.ajax({
            url: "/projects",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(projectData),
            success: function (response) {
                alert("Project created successfully!");
                $("#projectForm")[0].reset();
                viewProjects();
            },
            error: function (err) {
                console.error("Error creating project:", err);
                alert("Failed to create project.");
            }
        });
    });
});


// Load all projects
function viewProjects() {
    $.ajax({
        url: "/projects",
        type: "GET",
        success: function (projects) {

            let html = "";

            projects.forEach(project => {
                html += `
                    <div style="border:1px solid black; margin:10px; padding:10px;">
                        <p><strong>Name:</strong> ${project.name}</p>
                        <p><strong>Location:</strong> ${project.location}</p>
                        <p><strong>Manager:</strong> ${project.manager?.name || project.manager}</p>
                        <p><strong>Workers:</strong> ${
                            project.workers.map(w => w.name || w).join(", ")
                        }</p>

                        <button onclick="goToEdit('${project._id}')">Edit</button>
                        <button onclick="deleteProject('${project._id}')">Delete</button>
                    </div>
                `;
            });

            $("#projectList").html(html);
        },
        error: function (err) {
            console.error("Error loading projects:", err);
        }
    });
}


// Delete project
function deleteProject(id) {
    $.ajax({
        url: "/projects/" + id,
        type: "DELETE",
        success: function () {
            alert("Project deleted");
            viewProjects();
        },
        error: function (err) {
            console.error("Error deleting project:", err);
        }
    });
}

// Edit project
function goToEdit(id) {
    window.location.href = "/editProject.html?id=" + id;
}
