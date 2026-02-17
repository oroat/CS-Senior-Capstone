const dbcon = require('../dbconnection') //add db connection file
const dao = require('./ToolDao');

require("dotenv").config();

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

test('Create new tool', async function(){
    let newdata = {serialNum:'tool1', 
                    model: 'leak detector'};

    let created = await dao.create(newdata);
    let found = await dao.read(created._id);

    expect(created._id).not.toBeNull();
    expect(created.serialNum).toBe(found.serialNum);
    expect(created.inUse).toBeFalsy(); 
});

test('Delete tool', async function(){
    let newdata = {serialNum:'tool1', 
        model: 'leak detector'};
    let created = await dao.create(newdata);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

test('Read All', async function(){
    let newdata1 = {serialNum:'tool1', 
                    model: 'leak detector'};
    let newdata2 = {serialNum:'tool2', 
                    model: 'wrench'};
    let newdata3 = {serialNum:'tool3', 
                    model: 'vacuum pump'};
    let tool1 = await dao.create(newdata1);
    let tool2 = await dao.create(newdata2);
    let tool3 = await dao.create(newdata3);

    let lstTools = await dao.readAll();

    expect(lstTools.length).toBe(3);
    expect(lstTools[0]._id).toStrictEqual(tool1._id);
});

test('Update tool', async function(){
    let newdata = {serialNum:'tool1', 
                    model: 'leak detector'};

    let created = await dao.create(newdata);

    let updates = { serialNum: 'updatedtool1', 
                    model: 'vacuum pump'};
    let updated = await dao.update(created._id, updates);

    expect(updated.serialNum).toBe('updatedtool1');
    expect(updated.model).toBe('vacuum pump');
});