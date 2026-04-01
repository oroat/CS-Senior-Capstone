const dbcon = require('../dbconnection');
const dao = require('../model/ShipmentDao');
const purchaseOrderDao = require('../model/PurchaseOrderDao');
const controller = require('./ShipmentController');

require("dotenv").config();

jest.mock('../model/ShipmentDao');
jest.mock('../model/PurchaseOrderDao');

const mockProjectId  = '000000000000000000000001';
const mockRecipId    = '000000000000000000000002';
const mockPOId       = '000000000000000000000003';

beforeAll(async function () {
    await dbcon.connect('test');
});
afterAll(async function () {
    await dao.deleteAll();
    await dbcon.disconnect();
});
beforeEach(async function () {
    await dao.deleteAll();
    jest.clearAllMocks();
});

// ─── Create

test('Successfully create shipment - all materials checked (Verified)', async function () {
    let req = { body: {
        sender: 'Test Supplier',
        project: mockProjectId,
        po: mockPOId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: [
            { materialId: 'mat1', name: 'Steel', unit: 'kg', quantity: 10 },
            { materialId: 'mat2', name: 'Timber', unit: 'm', quantity: 5 }
        ]
    }};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipment = { _id: 's1', ...req.body };
    dao.create.mockResolvedValue(mockShipment);

    // PO has 2 materials — same as checked = Verified
    purchaseOrderDao.read.mockResolvedValue({
        _id: mockPOId,
        materials: [{ _id: 'mat1' }, { _id: 'mat2' }]
    });
    purchaseOrderDao.update.mockResolvedValue({});

    await controller.createShipment(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(purchaseOrderDao.update).toHaveBeenCalledWith(mockPOId, { status: 'Verified' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, shipment: mockShipment });
});

test('Successfully create shipment - not all materials checked (Missing Materials)', async function () {
    let req = { body: {
        sender: 'Test Supplier',
        project: mockProjectId,
        po: mockPOId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: [
            { materialId: 'mat1', name: 'Steel', unit: 'kg', quantity: 10 }
            // mat2 not checked
        ]
    }};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipment = { _id: 's1', ...req.body };
    dao.create.mockResolvedValue(mockShipment);

    // PO has 2 materials but only 1 checked = Missing Materials
    purchaseOrderDao.read.mockResolvedValue({
        _id: mockPOId,
        materials: [{ _id: 'mat1' }, { _id: 'mat2' }]
    });
    purchaseOrderDao.update.mockResolvedValue({});

    await controller.createShipment(req, res);

    expect(purchaseOrderDao.update).toHaveBeenCalledWith(mockPOId, { status: 'Missing Materials' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, shipment: mockShipment });
});

test('Failed to create shipment', async function () {
    let req = { body: {
        sender: 'Test Supplier',
        project: mockProjectId,
        po: mockPOId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: []
    }};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.create.mockRejectedValue(new Error('DB error'));

    await controller.createShipment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create shipment' });
});

// ─── Read All

test('Successfully fetch all shipments', async function () {
    let req = {};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipments = [
        { _id: 's1', sender: 'Supplier A', project: mockProjectId, po: mockPOId, dt_recvd: '2024-01-10', recip: mockRecipId, materials_recvd: [] },
        { _id: 's2', sender: 'Supplier B', project: mockProjectId, po: mockPOId, dt_recvd: '2024-01-11', recip: mockRecipId, materials_recvd: [] }
    ];
    dao.readAll.mockResolvedValue(mockShipments);

    await controller.getAllShipments(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockShipments);
});

test('Failed to fetch all shipments', async function () {
    let req = {};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.readAll.mockRejectedValue(new Error('DB error'));

    await controller.getAllShipments(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch shipments' });
});

// ─── Read by ID

test('Successfully get shipment by ID', async function () {
    let mockShipment = { _id: 's1', sender: 'Supplier A', project: mockProjectId, po: mockPOId, dt_recvd: '2024-01-10', recip: mockRecipId, materials_recvd: [] };
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read.mockResolvedValue(mockShipment);

    await controller.getShipmentById(req, res);

    expect(dao.read).toHaveBeenCalledWith('s1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockShipment);
});

test('Shipment not found by ID', async function () {
    let req = { params: { id: 'nonexistent' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read.mockResolvedValue(null);

    await controller.getShipmentById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Shipment not found' });
});

test('Error getting shipment by ID', async function () {
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read.mockRejectedValue(new Error('DB error'));

    await controller.getShipmentById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch shipment' });
});

// ─── Update

test('Successfully update shipment', async function () {
    let req = { params: { id: 's1' }, body: { sender: 'Updated Supplier', dt_recvd: '2024-02-01' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let updatedShipment = { _id: 's1', ...req.body };
    dao.update.mockResolvedValue(updatedShipment);

    await controller.updateShipment(req, res);

    expect(dao.update).toHaveBeenCalledWith('s1', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, updated: updatedShipment });
});

test('Update shipment not found', async function () {
    let req = { params: { id: 'nonexistent' }, body: { sender: 'Updated Supplier' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.update.mockResolvedValue(null);

    await controller.updateShipment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Shipment not found' });
});

test('Failed to update shipment', async function () {
    let req = { params: { id: 's1' }, body: { sender: 'Updated Supplier' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.update.mockRejectedValue(new Error('DB error'));

    await controller.updateShipment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update shipment' });
});

// ─── Delete

test('Successfully delete shipment', async function () {
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.del.mockResolvedValue({ _id: 's1' });

    await controller.deleteShipment(req, res);

    expect(dao.del).toHaveBeenCalledWith('s1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
});

test('Failed to delete shipment', async function () {
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.del.mockRejectedValue(new Error('DB error'));

    await controller.deleteShipment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete shipment' });
});