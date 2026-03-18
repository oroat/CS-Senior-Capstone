const dbcon = require('../dbconnection');
const dao = require('./ShipmentDao');
require("dotenv").config();

// Sample IDs to reuse across tests
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

test('Create new shipment', async function(){
    let newdata = {
        sender: 'Test Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: [mockMaterialId]
    };
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);

    expect(created._id).not.toBeNull();
    expect(created.sender).toBe(found.sender);
    expect(created.dt_recvd).toBe(found.dt_recvd);
});

test('Delete shipment', async function(){
    let newdata = {
        sender: 'Test Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: []
    };
    let created = await dao.create(newdata);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);

    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

test('Read all shipments', async function(){
    let newdata1 = {
        sender: 'Supplier A',
        project: mockProjectId,
        dt_recvd: '2024-01-10',
        recip: mockRecipId,
        materials_recvd: []
    };
    let newdata2 = {
        sender: 'Supplier B',
        project: mockProjectId,
        dt_recvd: '2024-01-11',
        recip: mockRecipId,
        materials_recvd: []
    };
    let newdata3 = {
        sender: 'Supplier C',
        project: mockProjectId,
        dt_recvd: '2024-01-12',
        recip: mockRecipId,
        materials_recvd: []
    };
    let shipment1 = await dao.create(newdata1);
    let shipment2 = await dao.create(newdata2);
    let shipment3 = await dao.create(newdata3);
    let allShipments = await dao.readAll();

    expect(allShipments.length).toBe(3);
    expect(allShipments[0]._id).toStrictEqual(shipment1._id);
});

test('Update shipment', async function(){
    let newdata = {
        sender: 'Old Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: []
    };
    let created = await dao.create(newdata);
    let updates = {
        sender: 'Updated Supplier',
        dt_recvd: '2024-02-01'
    };
    let updated = await dao.update(created._id, updates);

    expect(updated.sender).toBe('Updated Supplier');
    expect(updated.dt_recvd).toBe('2024-02-01');
});

test('Read shipment by ID', async function(){
    let newdata = {
        sender: 'Test Supplier',
        project: mockProjectId,
        dt_recvd: '2024-01-15',
        recip: mockRecipId,
        materials_recvd: [mockMaterialId]
    };
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);

    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.sender).toBe(created.sender);
});

test('Read shipment by ID not found', async function(){
    let fakeId = '000000000000000000000099';
    let found = await dao.read(fakeId);

    expect(found).toBeNull();
});

test('Create shipment with multiple materials', async function(){
    let mockMaterialId2 = '000000000000000000000004';
    let newdata = {
        sender: 'Multi Supplier',
        project: mockProjectId,
        dt_recvd: '2024-03-01',
        recip: mockRecipId,
        materials_recvd: [mockMaterialId, mockMaterialId2]
    };
    let created = await dao.create(newdata);

    expect(created.materials_recvd.length).toBe(2);
});
