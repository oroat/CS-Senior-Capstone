const dbcon = require('../dbconnection');
const dao = require('../model/ShipmentDao');
const controller = require('./ShipmentController');

require("dotenv").config();

jest.mock('../model/ShipmentDao');

const mockProjectId = '000000000000000000000001';
const mockRecipId =   '000000000000000000000002';
const mockMaterialId = '000000000000000000000003';

beforeAll(async function(){
    await dbcon.connect('test');
});
afterAll(async function(){
    await dao.deleteAll();
    await dbcon.disconnect();
});
beforeEach(async function(){
    await dao.deleteAll();
});

// ─── Create 

test('Successfully create shipment', async function(){
    let req = { body: {
        sender: 'Test Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: [mockMaterialId]
    }};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipment = { _id: 's1', ...req.body };
    dao.create = jest.fn().mockResolvedValue(mockShipment);

    await controller.createShipment(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, shipment: mockShipment });
});

test('Failed to create shipment', async function(){
    let req = { body: {
        sender: 'Test Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: []
    }};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.create = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.createShipment(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create shipment' });
});

// ─── Read All 

test('Successfully fetch all shipments', async function(){
    let req = {};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipments = [
        { _id: 's1', sender: 'Supplier A', project: mockProjectId, dt_recvd: '2024-01-10', recip: mockRecipId, materials_recvd: [] },
        { _id: 's2', sender: 'Supplier B', project: mockProjectId, dt_recvd: '2024-01-11', recip: mockRecipId, materials_recvd: [] }
    ];
    dao.readAll = jest.fn().mockResolvedValue(mockShipments);

    await controller.getAllShipments(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockShipments);
});

test('Failed to fetch all shipments', async function(){
    let req = {};
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.readAll = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getAllShipments(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch shipments' });
});

// ─── Read by ID 

test('Successfully get shipment by ID', async function(){
    let mockShipment = { _id: 's1', sender: 'Supplier A', project: mockProjectId, dt_recvd: '2024-01-10', recip: mockRecipId, materials_recvd: [] };

    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read = jest.fn().mockResolvedValue(mockShipment);

    await controller.getShipmentById(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockShipment);
});

test('Shipment not found by ID', async function(){
    let req = { params: { id: 'nonexistent' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read = jest.fn().mockResolvedValue(null);

    await controller.getShipmentById(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Shipment not found' });
});

test('Error getting shipment by ID', async function(){
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getShipmentById(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch shipment' });
});

// ─── Update 

test('Successfully update shipment', async function(){
    let req = {
        params: { id: 's1' },
        body: { sender: 'Updated Supplier', dt_recvd: '2024-02-01' }
    };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let updatedShipment = { _id: 's1', ...req.body };
    dao.update = jest.fn().mockResolvedValue(updatedShipment);

    await controller.updateShipment(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, updated: updatedShipment });
});

test('Update shipment not found', async function(){
    let req = {
        params: { id: 'nonexistent' },
        body: { sender: 'Updated Supplier' }
    };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.update = jest.fn().mockResolvedValue(null);

    await controller.updateShipment(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Shipment not found' });
});

test('Failed to update shipment', async function(){
    let req = {
        params: { id: 's1' },
        body: { sender: 'Updated Supplier' }
    };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.update = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.updateShipment(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update shipment' });
});

// ─── Delete 

test('Successfully delete shipment', async function(){
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    let mockShipment = { _id: 's1', project: mockProjectId };
    dao.read = jest.fn().mockResolvedValue(mockShipment);
    dao.del = jest.fn().mockResolvedValue(mockShipment);

    await controller.deleteShipment(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
});

test('Failed to delete shipment', async function(){
    let req = { params: { id: 's1' } };
    let res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    dao.read = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.deleteShipment(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to delete shipment' });
});
