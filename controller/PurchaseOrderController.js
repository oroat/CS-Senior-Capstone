const dao = require('../model/PurchaseOrderDao');

exports.deletePurchaseOrder = async function (req, res) {
    try {
        await dao.del(req.params.id);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete purchase order' });
    }
};

exports.createPurchaseOrder = async function (req, res) {
    try {
        const po = await dao.create(req.body);
        res.status(201).json({ success: true, po });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create purchase order' });
    }
};

exports.getAllPurchaseOrders = async function (req, res) {
    try {
        const orders = await dao.readAll();
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
};

exports.getPurchaseOrderById = async function (req, res) {
    try {
        const po = await dao.read(req.params.id);
        res.status(200).json(po);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch purchase order' });
    }
};

exports.updatePurchaseOrder = async function (req, res) {
    try {
        const updatedPO = await dao.update(req.params.id, req.body);
        res.status(200).json({ success: true, updatedPO });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update purchase order' });
    }
};
