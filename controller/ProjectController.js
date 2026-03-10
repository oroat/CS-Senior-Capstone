const dao = require('../model/ProjectDao');
const mongoose = require('mongoose');

exports.deleteProject = async function(req, res) {
    try {
        const projectId = req.params.id;
        const Material = mongoose.model('materials');
        
        await Material.updateMany(
            { project: projectId }, 
            { $set: { project: null } }
        );

        await dao.del(projectId);

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
};

exports.createProject = async function(req, res) {
    try {
        const project = await dao.create(req.body);
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
    }
};

exports.getAllProjects = async function(req, res) {
    try {
        const projects = await dao.readAll();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
};

exports.getProjectById = async function(req, res) {
    try {
        const project = await dao.read(req.params.id);
        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch project' });
    }
};

exports.updateProject = async function(req, res) {
    try {
        const updatedProject = await dao.update(req.params.id, req.body);
        res.status(200).json({ success: true, updatedProject });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update project' });
    }
};