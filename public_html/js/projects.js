$(document).ready(function () {
    
    function loadUserDropdowns() {
        $.get('/users', function (users) {
            const managerSelect = $('#manager');
            const workersSelect = $('#workers');

            managerSelect.find('option:not(:first)').remove();
            workersSelect.empty();

            users.forEach(user => {
                const option = `<option value="${user._id}">${user.name}</option>`;
                if (user.role === 1) {
                    managerSelect.append(option);
                } else {
                    workersSelect.append(option);
                }
            });
        });
    }

    function loadProjects() {
        $.get('/projects', function (projects) {
            const list = $('#projectList');
            list.empty();
            
            projects.forEach(project => {
                const workerNames = project.workers.map(w => w.name).join(', ') || 'None';
                const materialDisplay = project.materials && project.materials.length > 0 
                    ? project.materials.map(m => `${m.name} (${m.quantity} ${m.unit})`).join(', ')
                    : 'No materials assigned';

                list.append(`
                    <div style="border: 1px solid #ccc; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                        <h3>${project.name}</h3>
                        <p><strong>Location:</strong> ${project.location}</p>
                        <p><strong>Manager:</strong> ${project.manager ? project.manager.name : 'N/A'}</p>
                        <p><strong>Workers:</strong> ${workerNames}</p>
                        <p><strong>Materials:</strong> ${materialDisplay}</p>
                        <div style="margin-top: 10px;">
                            <button onclick="editProject('${project._id}')" style="background: #ffc107; border: none; padding: 5px 10px; cursor: pointer;">Edit</button>
                            <button onclick="deleteProject('${project._id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer;">Delete</button>
                        </div>
                    </div>
                `);
            });
        });
    }

    loadUserDropdowns();
    loadProjects();

    $('#projectForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            name: $('#name').val(),
            location: $('#location').val(),
            manager: $('#manager').val(),
            workers: $('#workers').val()
        };

        $.ajax({
            url: '/projects',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                alert('Project Created!');
                $('#projectForm')[0].reset();
                loadProjects();
            },
            error: function () {
                alert('Error creating project');
            }
        });
    });
});

function editProject(id) {
    window.location.href = `editProject.html?id=${id}`;
}

function deleteProject(id) {
    if (confirm("Are you sure you want to delete this project?")) {
        $.ajax({
            url: `/projects/${id}`,
            type: 'DELETE',
            success: function () {
                location.reload();
            },
            error: function () {
                alert("Failed to delete project");
            }
        });
    }
}