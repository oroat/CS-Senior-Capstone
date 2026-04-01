const dbcon = require('../dbconnection');
const dao = require('./ShipmentDao');

require('./ProjectDao');
require('./UserDao');
require('./PurchaseOrderDao');

require("dotenv").config();

const mockProjectId = '000000000000000000000001';
const mockRecipId   = '000000000000000000000002';
const mockPOId      = '000000000000000000000003';

beforeAll(async function () { await dbcon.connect('test'); });
afterAll(async function () { await dao.deleteAll(); await dbcon.disconnect(); });
beforeEach(async function () { await dao.deleteAll(); });

test('Create new shipment', async function () {
    let created = await dao.create({
        sender: 'Test Supplier', project: mockProjectId, po: mockPOId,
        dt_recvd: '2024-01-15', recip: mockRecipId,
        materials_recvd: [{ materialId: 'mat1', name: 'Steel', unit: 'kg', quantity: 10 }]
    });
    let found = await dao.read(created._id);
    expect(created._id).not.toBeNull();
    expect(created.sender).toBe(found.sender);
    expect(created.dt_recvd).toBe(found.dt_recvd);
});

test('Delete shipment', async function () {
    let created = await dao.create({
        sender: 'Test Supplier', project: mockProjectId, po: mockPOId,
        dt_recvd: '2024-01-15', recip: mockRecipId, materials_recvd: []
    });
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

test('Read all shipments', async function () {
    let base = { project: mockProjectId, po: mockPOId, recip: mockRecipId, materials_recvd: [] };
    let s1 = await dao.create({ sender: 'Supplier A', dt_recvd: '2024-01-10', ...base });
             await dao.create({ sender: 'Supplier B', dt_recvd: '2024-01-11', ...base });
             await dao.create({ sender: 'Supplier C', dt_recvd: '2024-01-12', ...base });
    let all = await dao.readAll();
    expect(all.length).toBe(3);
    expect(all[0]._id).toStrictEqual(s1._id);
});

test('Update shipment', async function () {
    let created = await dao.create({
        sender: 'Old Supplier', project: mockProjectId, po: mockPOId,
        dt_recvd: '2024-01-15', recip: mockRecipId, materials_recvd: []
    });
    let updated = await dao.update(created._id, { sender: 'Updated Supplier', dt_recvd: '2024-02-01' });
    expect(updated.sender).toBe('Updated Supplier');
    expect(updated.dt_recvd).toBe('2024-02-01');
});

test('Read shipment by ID', async function () {
    let created = await dao.create({
        sender: 'Test Supplier', project: mockProjectId, po: mockPOId,
        dt_recvd: '2024-01-15', recip: mockRecipId,
        materials_recvd: [{ materialId: 'mat1', name: 'Steel', unit: 'kg', quantity: 5 }]
    });
    let found = await dao.read(created._id);
    expect(found).not.toBeNull();
    expect(found._id).toEqual(created._id);
    expect(found.sender).toBe(created.sender);
});

test('Read shipment by ID not found', async function () {
    let found = await dao.read('000000000000000000000099');
    expect(found).toBeNull();
});

test('Create shipment with multiple materials', async function () {
    let created = await dao.create({
        sender: 'Multi Supplier', project: mockProjectId, po: mockPOId,
        dt_recvd: '2024-03-01', recip: mockRecipId,
        materials_recvd: [
            { materialId: 'mat1', name: 'Steel',  unit: 'kg', quantity: 10 },
            { materialId: 'mat2', name: 'Timber', unit: 'm',  quantity: 5  }
        ]
    });
    expect(created.materials_recvd.length).toBe(2);
});