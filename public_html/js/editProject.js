$(document).ready(function () {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
        alert("No project ID provided");
        return;
    }

    // 1. Load users into dropdowns first
    function loadUsersAndData() {
        $.get('/users', function (users) {
            const managerSelect = $('#manager');
            const workersSelect = $('#workers');

            users.forEach(user => {
                const option = `<option value="${user._id}">${user.name}</option>`;
                if (user.role === 1) { // Role 1 = Project Manager
                    managerSelect.append(option);
                } else {
                    workersSelect.append(option);
                }
            });

            // 2. Only after users are loaded, fetch project details
            fetchProjectDetails();
        });
    }

    function fetchProjectDetails() {
        $.ajax({
            url: "/projects/" + projectId,
            type: "GET",
            success: function (project) {
                $("#name").val(project.name);
                $("#location").val(project.location);
                
                // Set the Manager dropdown value
                if (project.manager) {
                    $("#manager").val(project.manager._id || project.manager);
                }

                // Set the Workers multiple-select values
                if (project.workers && project.workers.length > 0) {
                    const workerIds = project.workers.map(w => w._id || w);
                    $("#workers").val(workerIds); // jQuery handles array selection for <select multiple>
                }
            },
            error: function () {
                alert("Failed to load project details");
            }
        });
    }

    loadUsersAndData();

    // 3. Handle the Update
    $("#editProjectForm").submit(function (e) {
        e.preventDefault();

        const updatedData = {
            name: $("#name").val(),
            location: $("#location").val(),
            manager: $("#manager").val(),
            workers: $("#workers").val() // Automatically returns an array of selected IDs
        };

        $.ajax({
            url: "/projects/" + projectId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
            success: function () {
                alert("Project updated successfully!");
                window.location.href = "/addProject"; 
            },
            error: function (err) {
                console.error(err);
                alert("Failed to update project");
            }
        });
    });
});