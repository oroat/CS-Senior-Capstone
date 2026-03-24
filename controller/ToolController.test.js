const dbcon = require('../dbconnection')
const dao = require('../model/ToolDao');
const controller = require('./ToolController');

require("dotenv").config();

jest.mock('../model/ToolDao');

beforeAll(async function(){
    await dbcon.connect('test'); //add test db connection
});
afterAll(async function(){
    await dao.deleteAll();
    await dbcon.disconnect();
});

beforeEach(async function(){
    await dao.deleteAll();
});

test('Successful tool creation', async function(){
    let req = { body: {
        serial: 'tool1',
        model: 'leak detector',
    }}
    let res = {redirect: jest.fn()}

    await controller.create(req, res);
    
    expect(dao.create).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalled();
});

test('Successfully fetch all tools', async function(){
    let req = {};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    let mockTools = [
        {_id: 't1', serialNum: 'toolA', model: 'leak detector', inUse: false},
        {_id: 't2', serialNum: 'toolB', model: 'vacuum pump', inUse: false},
    ]

    dao.readAll = jest.fn().mockResolvedValue(mockTools);

    await controller.getAllTools(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockTools);
});

test('Error in fetching all tools', async function(){
    let req = {};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    dao.readAll = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getAllTools(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'failed to fetch tools'});
});

test('Delete tool', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    await controller.deleteTool(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true});
});

test('Error in deleting tool', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    let error = {message: 'DB error'};

    dao.del = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.deleteTool(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Failed to delete tool", details: error.message});
})

test('Update tool', async function(){
    let req = {
        params: {id: 'id'}, 
        body: {id: 'id',
                updates: {serial: 'A234',
                            model: 'leak detector',
                            inUse: true,
                            usedBy: 'id2'}
        }
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    let updatedTool = await controller.update(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.body.id, {serialNum: req.body.updates.serial,
                                                            model: req.body.updates.model,
                                                            inUse: req.body.updates.inUse,
                                                            usedBy: req.body.updates.usedBy});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true, updatedTool, redirect: '/tools.html'});
});

test('Update only serial number & model', async function(){
    let req = { 
        body: {id: 'id',
            updates:{
            serial: 'A234',
                model: 'leak detector',}
        }
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    let updatedTool = await controller.update(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.body.id, {serialNum: req.body.updates.serial,
                                                            model: req.body.updates.model});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true, updatedTool, redirect: '/tools.html'});
});

test('Error in updating tool', async function(){
    let req = { 
        body: {id: 'id',
                updates: {serial: 'A234',
                model: 'leak detector',
                inUse: true,
                usedBy: 'id2'}
        }
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    let error = {message: 'DB error'};

    dao.update = jest.fn().mockRejectedValue(new Error('DB error'));

    let updatedTool = await controller.update(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.body.id, {serialNum: req.body.updates.serial,
                                                            model: req.body.updates.model,
                                                            inUse: req.body.updates.inUse,
                                                            usedBy: req.body.updates.usedBy});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Failed to update user role", details: error.message});
});

test('Get tool by serial number', async function(){
    let tool = {_id: 't1', serialNum: '1A', model: 'Pump', inUse: 'false'};

    let req = {params: {serial: '1A'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    dao.findBySerial = jest.fn().mockResolvedValue(tool);

    await controller.getToolBySerial(req, res);

    expect(dao.findBySerial).toHaveBeenCalledWith(req.params.serial);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(tool);
});

test('Error in getting tool by serial number', async function(){
    let tool = {_id: 't1', serialNum: '1A', model: 'Pump', inUse: 'false'};

    let req = {params: {serial: '1A'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    let error = {message: 'DB error'};

    dao.findBySerial = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getToolBySerial(req, res);

    expect(dao.findBySerial).toHaveBeenCalledWith(req.params.serial);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Failed to find tool", details: error.message});
});