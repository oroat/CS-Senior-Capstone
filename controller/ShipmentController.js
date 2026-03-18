const shipmentDao = require('../model/ShipmentDao');
const mongoose = require('mongoose');

exports.createShipment = async function(req, res) {
    try {
        const shipment = await shipmentDao.create(req.body);
        if (req.body.project) {
            const Project = mongoose.model('projects');
            await Project.findByIdAndUpdate(
                req.body.project,
                { $push: { shipments: shipment._id } }
            );
        }
        res.status(201).json({ success: true, shipment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
};

exports.deleteShipment = async function(req, res) {
    try {
        const shipmentId = req.params.id;
        const shipment = await shipmentDao.read(shipmentId);
        if (shipment && shipment.project) {
            const Project = mongoose.model('projects');
            await Project.findByIdAndUpdate(shipment.project, {
                $pull: { shipments: shipmentId }
            });
        }
        await shipmentDao.del(shipmentId);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete shipment' });
    }
};

exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await shipmentDao.readAll();
        res.status(200).json(shipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
};

exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await shipmentDao.read(req.params.id);
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
        res.status(200).json(shipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipment' });
    }
};

exports.updateShipment = async (req, res) => {
    try {
        const updated = await shipmentDao.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Shipment not found' });
        res.status(200).json({ success: true, updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update shipment' });
    }
};
