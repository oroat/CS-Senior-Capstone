$(document).ready(function () {

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get("id");

    if (!projectId) {
        alert("No project ID provided");
        return;
    }

    // input the existing data from the projects
    $.ajax({
        url: "/projects/" + projectId,
        type: "GET",
        success: function (project) {

            $("#name").val(project.name);
            $("#location").val(project.location);
            $("#manager").val(project.manager._id || project.manager);

            if (project.workers && project.workers.length > 0) {
                const workerIds = project.workers.map(w => w._id || w);
                $("#workers").val(workerIds.join(", "));
            }
        },
        error: function () {
            alert("Failed to load project");
        }
    });

    // do the update
    $("#editProjectForm").submit(function (e) {
        e.preventDefault();

        let workersArray = [];

        let workersInput = $("#workers").val();
        if (workersInput) {
            workersArray = workersInput.split(",").map(id => id.trim());
        }

        let updatedData = {
            name: $("#name").val(),
            location: $("#location").val(),
            manager: $("#manager").val(),
            workers: workersArray
        };

        $.ajax({
            url: "/projects/" + projectId,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedData),
            success: function () {
                alert("Project updated successfully!");
                window.location.href = "/addProject.html";
            },
            error: function (err) {
                console.error(err);
                alert("Failed to update project");
            }
        });
    });

});
