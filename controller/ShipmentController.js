const dao = require('../model/ShipmentDao');
const purchaseOrderDao = require('../model/PurchaseOrderDao');

exports.createShipment = async function (req, res) {
    try {
        // Block shipment if PO is not Pending
        if (req.body.po) {
            const po = await purchaseOrderDao.read(req.body.po);
            if (!po) {
                return res.status(404).json({ error: 'Purchase order not found' });
            }
            if (po.status !== 'Pending') {
                return res.status(400).json({
                    error: `Cannot log a shipment for a PO with status "${po.status}". Only Pending POs can receive shipments.`
                });
            }

            // Create the shipment
            const shipment = await dao.create(req.body);

            // Determine new PO status based on materials
            const poMaterials = po.materials;
            const received    = req.body.materials_recvd || [];

            const allSelected         = poMaterials.length === received.length;
            const allQuantitiesMatch  = poMaterials.every(poMat => {
                const match = received.find(r => String(r.materialId) === String(poMat._id));
                return match && Number(match.quantity) === Number(poMat.quantity);
            });

            let newStatus;
            if (allSelected && allQuantitiesMatch) {
                newStatus = 'Verified';
            } else if (!allSelected) {
                newStatus = 'Missing Materials';
            } else {
                newStatus = 'Inaccurate';
            }

            await purchaseOrderDao.update(req.body.po, { status: newStatus });

            return res.status(201).json({ success: true, shipment });
        }

        // No PO provided — just create the shipment
        const shipment = await dao.create(req.body);
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