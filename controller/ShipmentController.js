const dao = require('../model/ShipmentDao');
const purchaseOrderDao = require('../model/PurchaseOrderDao');

exports.createShipment = async function (req, res) {
    try {
        const shipment = await dao.create(req.body);

        if (req.body.po) {
            const po = await purchaseOrderDao.read(req.body.po);
            if (po) {
                const totalMaterials = po.materials.length;
                const checkedMaterials = (req.body.materials_recvd || []).length;
                const newStatus = checkedMaterials === totalMaterials ? 'Verified' : 'Missing Materials';
                await purchaseOrderDao.update(req.body.po, { status: newStatus });
            }
        }

        res.status(201).json({ success: true, shipment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
};

exports.deleteShipment = async function (req, res) {
    try {
        await dao.del(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete shipment' });
    }
};

exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await dao.readAll();
        res.status(200).json(shipments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
};

exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await dao.read(req.params.id);
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
        res.status(200).json(shipment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch shipment' });
    }
};

exports.updateShipment = async (req, res) => {
    try {
        const updated = await dao.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ error: 'Shipment not found' });
        res.status(200).json({ success: true, updated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update shipment' });
    }
};