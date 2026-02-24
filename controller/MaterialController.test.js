const dao = require('../model/MaterialDao');
const controller = require('./MaterialController');

// Mock the DAO
jest.mock('../model/MaterialDao');

beforeEach(() => {
    jest.clearAllMocks();
});


test('Successful material creation', async () => {
    const req = {
        body: {
            name: 'Steel Beam',
            quantity: 50,
            unit: 'units',
            project: 'projectId123'
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.create.mockResolvedValue(req.body);

    await controller.createMaterial(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        material: req.body
    });
});

test('Create material but DAO throws an error', async () => {
    const req = { body: {} };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.create.mockRejectedValue(new Error('DB error'));

    await controller.createMaterial(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create material' });
});



test('Fetch all materials', async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const mockMaterials = [
        { name: 'Timber', quantity: 100 },
        { name: 'Concrete', quantity: 20 }
    ];

    dao.readAll.mockResolvedValue(mockMaterials);

    await controller.getAllMaterials(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMaterials);
});

test('Get material by ID', async () => {
    const req = { params: { id: 'mat123' } };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const mockMaterial = { _id: 'mat123', name: 'Wiring' };

    dao.read.mockResolvedValue(mockMaterial);

    await controller.getMaterialById(req, res);

    expect(dao.read).toHaveBeenCalledWith('mat123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockMaterial);
});


test('Update material', async () => {
    const req = {
        params: { id: 'mat123' },
        body: { quantity: 500 }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const updatedMaterial = { _id: 'mat123', name: 'Cement', quantity: 500 };

    dao.update.mockResolvedValue(updatedMaterial);

    await controller.updateMaterial(req, res);

    expect(dao.update).toHaveBeenCalledWith('mat123', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        updatedMaterial
    });
});

test('Delete material', async () => {
    const req = { params: { id: 'mat123' } };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.del.mockResolvedValue(true);

    await controller.deleteMaterial(req, res);

    expect(dao.del).toHaveBeenCalledWith('mat123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
});
