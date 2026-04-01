const dbcon = require('../dbconnection');
const dao = require('./PurchaseOrderDao');
const projectDao = require('./ProjectDao');
const userDao = require('./UserDao');
require("dotenv").config();

beforeAll(async function () { await dbcon.connect('test'); });
afterAll(async function () {
    await dao.deleteAll();
    await projectDao.deleteAll();
    await userDao.deleteAll();
    await dbcon.disconnect();
});
beforeEach(async function () {
    await dao.deleteAll();
    await projectDao.deleteAll();
    await userDao.deleteAll();
});

async function setupTestData() {
    const manager = await userDao.create({ name: 'Manager User', role: 1, email: 'manager@test.com', password: 'pass' });
    const project = await projectDao.create({ name: 'Test Project', manager: manager._id, location: 'Baltimore', workers: [] });
    return { manager, project };
}

test('Create new purchase order', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({
        poNumber: 'PO-001', vendor: 'Acme Supply', project: project._id, status: 'Pending',
        materials: [
            { name: 'Steel Beam', quantity: 10, unit: 'units' },
            { name: 'Concrete',   quantity: 50, unit: 'm3'    }
        ]
    });
    const found = await dao.read(created._id);
    expect(created._id).toBeDefined();
    expect(found.poNumber).toBe('PO-001');
    expect(found.vendor).toBe('Acme Supply');
    expect(found.materials.length).toBe(2);
    expect(found.project.name).toBe('Test Project');
});

test('Create PO defaults to Pending status', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({ poNumber: 'PO-002', vendor: 'Test Vendor', project: project._id, materials: [] });
    expect(created.status).toBe('Pending');
});

test('Read all purchase orders', async function () {
    const { project } = await setupTestData();
    await dao.create({ poNumber: 'PO-001', vendor: 'Vendor A', project: project._id, materials: [] });
    await dao.create({ poNumber: 'PO-002', vendor: 'Vendor B', project: project._id, materials: [] });
    const all = await dao.readAll();
    expect(all.length).toBe(2);
});

test('Update purchase order status to Verified', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({ poNumber: 'PO-003', vendor: 'Vendor C', project: project._id, materials: [{ name: 'Steel', quantity: 5, unit: 'kg' }] });
    const updated = await dao.update(created._id, { status: 'Verified' });
    expect(updated.status).toBe('Verified');
});

test('Update purchase order status to Missing Materials', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({ poNumber: 'PO-004', vendor: 'Vendor D', project: project._id,
        materials: [{ name: 'Steel', quantity: 5, unit: 'kg' }, { name: 'Timber', quantity: 10, unit: 'm' }]
    });
    const updated = await dao.update(created._id, { status: 'Missing Materials' });
    expect(updated.status).toBe('Missing Materials');
});

test('Delete purchase order', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({ poNumber: 'PO-005', vendor: 'Vendor E', project: project._id, materials: [] });
    await dao.del(created._id);
    const found = await dao.read(created._id);
    expect(found).toBeNull();
});

test('Delete all purchase orders', async function () {
    const { project } = await setupTestData();
    await dao.create({ poNumber: 'PO-006', vendor: 'Vendor F', project: project._id, materials: [] });
    await dao.create({ poNumber: 'PO-007', vendor: 'Vendor G', project: project._id, materials: [] });
    await dao.deleteAll();
    const all = await dao.readAll();
    expect(all.length).toBe(0);
});

test('PO with embedded materials persists correctly', async function () {
    const { project } = await setupTestData();
    const created = await dao.create({
        poNumber: 'PO-008', vendor: 'Vendor H', project: project._id,
        materials: [{ name: 'Copper Pipe', quantity: 20, unit: 'm' }, { name: 'Bolts', quantity: 100, unit: 'units' }]
    });
    const found = await dao.read(created._id);
    expect(found.materials[0].name).toBe('Copper Pipe');
    expect(found.materials[1].name).toBe('Bolts');
    expect(found.materials[1].quantity).toBe(100);
});