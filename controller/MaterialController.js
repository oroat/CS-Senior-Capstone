const dao = require('../model/MaterialDao');

exports.createMaterial = async function(req, res) {
    try {
        const material = await dao.create(req.body);
        console.log('Successfully created material');

        res.status(201).json({
            success: true,
            material: material
        });

    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ error: 'Failed to create material' });
    }
};

exports.getAllMaterials = async function(req, res) {
    try {
        const materials = await dao.readAll();

        res.status(200).json(materials);

    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
};

exports.getMaterialById = async function(req, res) {
    try {
        const material = await dao.read(req.params.id);

        if (!material) {
            return res.status(404).json({ error: 'Material not found' });
        }

        res.status(200).json(material);

    } catch (error) {
        console.error('Error fetching material:', error);
        res.status(500).json({ error: 'Failed to fetch material' });
    }
};

exports.updateMaterial = async function(req, res) {
    try {
        const updatedMaterial = await dao.update(req.params.id, req.body);

        res.status(200).json({
            success: true,
            updatedMaterial
        });

    } catch (error) {
        console.error('Error updating material:', error);
        res.status(500).json({ error: 'Failed to update material' });
    }
};

exports.deleteMaterial = async function(req, res) {
    try {
        await dao.del(req.params.id);

        res.status(200).json({
            success: true
        });

    } catch (error) {
        console.error('Error deleting material:', error);
        res.status(500).json({ error: 'Failed to delete material' });
    }
};
