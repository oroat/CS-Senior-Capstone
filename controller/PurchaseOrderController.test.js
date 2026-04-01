const dao = require('../model/PurchaseOrderDao');
const controller = require('./PurchaseOrderController');

jest.mock('../model/PurchaseOrderDao');

beforeEach(() => {
    jest.clearAllMocks();
});

// ─── Create

test('Successfully create purchase order', async () => {
    const req = { body: {
        poNumber: 'PO-001',
        vendor: 'Acme Supply',
        project: 'projectId123',
        status: 'Pending',
        materials: [
            { name: 'Steel Beam', quantity: 10, unit: 'units' }
        ]
    }};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.create.mockResolvedValue(req.body);

    await controller.createPurchaseOrder(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, po: req.body });
});

test('Create purchase order but DAO throws an error', async () => {
    const req = { body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB error'));

    await controller.createPurchaseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create purchase order' });
});

// ─── Read All

test('Fetch all purchase orders', async () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const mockOrders = [
        { poNumber: 'PO-001', vendor: 'Vendor A' },
        { poNumber: 'PO-002', vendor: 'Vendor B' }
    ];

    dao.readAll.mockResolvedValue(mockOrders);

    await controller.getAllPurchaseOrders(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockOrders);
});

test('Fetch all purchase orders but DAO throws an error', async () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.readAll.mockRejectedValue(new Error('DB error'));

    await controller.getAllPurchaseOrders(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch purchase orders' });
});

// ─── Read by ID

test('Get purchase order by ID', async () => {
    const req = { params: { id: 'po123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const mockPO = { _id: 'po123', poNumber: 'PO-001', vendor: 'Acme' };
    dao.read.mockResolvedValue(mockPO);

    await controller.getPurchaseOrderById(req, res);

    expect(dao.read).toHaveBeenCalledWith('po123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPO);
});

test('Get purchase order by ID but DAO throws an error', async () => {
    const req = { params: { id: 'po123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read.mockRejectedValue(new Error('DB error'));

    await controller.getPurchaseOrderById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch purchase order' });
});

// ─── Update

test('Update purchase order', async () => {
    const req = { params: { id: 'po123' }, body: { status: 'Verified' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    const updatedPO = { _id: 'po123', status: 'Verified' };
    dao.update.mockResolvedValue(updatedPO);

    await controller.updatePurchaseOrder(req, res);

    expect(dao.update).toHaveBeenCalledWith('po123', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, updatedPO });
});

test('Update purchase order but DAO throws an error', async () => {
    const req = { params: { id: 'po123' }, body: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.update.mockRejectedValue(new Error('DB error'));

    await controller.updatePurchaseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update purchase order' });
});

// ─── Delete

test('Delete purchase order', async () => {
    const req = { params: { id: 'po123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.del.mockResolvedValue(true);

    await controller.deletePurchaseOrder(req, res);

    expect(dao.del).toHaveBeenCalledWith('po123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
});

test('Delete purchase order but DAO throws an error', async () => {
    const req = { params: { id: 'po123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.del.mockRejectedValue(new Error('DB error'));

    await controller.deletePurchaseOrder(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete purchase order' });
});