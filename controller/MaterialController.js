const materialDao = require('../model/MaterialDao');
const mongoose = require('mongoose');

exports.createMaterial = async function(req, res) {
    try {
        const material = await materialDao.create(req.body);

        if (req.body.project) {
            const Project = mongoose.model('projects');
            await Project.findByIdAndUpdate(
                req.body.project,
                { $push: { materials: material._id } }
            );
        }

        res.status(201).json({ success: true, material });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create material' });
    }
};

exports.deleteMaterial = async function(req, res) {
    try {
        const materialId = req.params.id;
        const material = await materialDao.read(materialId);
        
        if (material && material.project) {
            const Project = mongoose.model('projects');
            await Project.findByIdAndUpdate(material.project, {
                $pull: { materials: materialId }
            });
        }

        await materialDao.del(materialId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
};

exports.getAllMaterials = async (req, res) => {
    const materials = await materialDao.readAll();
    res.status(200).json(materials);
};

exports.getMaterialById = async (req, res) => {
    const material = await materialDao.read(req.params.id);
    res.status(200).json(material);
};

exports.updateMaterial = async (req, res) => {
    const updated = await materialDao.update(req.params.id, req.body);
    res.status(200).json({ success: true, updated });
};