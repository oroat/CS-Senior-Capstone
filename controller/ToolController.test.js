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

test('Delete tool', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    await controller.deleteTool(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true});
});

