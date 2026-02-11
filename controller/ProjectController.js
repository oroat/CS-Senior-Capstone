const dao = require('../model/ProjectDao');

exports.createProject = async function(req, res) {
    try {
        const project = await dao.create(req.body);
        console.log('Successfully created project');

        res.status(201).json({
            success: true,
            project: project
        });

    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
};

exports.getAllProjects = async function(req, res) {
    try {
        const projects = await dao.readAll();

        res.status(200).json(projects);

    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

exports.getProjectById = async function(req, res) {
    try {
        const project = await dao.read(req.params.id);

        res.status(200).json(project);

    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

exports.updateProject = async function(req, res) {
    try {
        const updatedProject = await dao.update(req.params.id, req.body);

        res.status(200).json({
            success: true,
            updatedProject
        });

    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
};

exports.deleteProject = async function(req, res) {
    try {
        await dao.del(req.params.id);

        res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};
