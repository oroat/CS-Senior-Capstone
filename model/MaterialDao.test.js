const dbcon = require('../dbconnection');
const materialDao = require('./MaterialDao');
const projectDao = require('./ProjectDao');
const userDao = require('./UserDao');

require("dotenv").config();

beforeAll(async function(){
    await dbcon.connect('test');
});

afterAll(async function(){
    await materialDao.deleteAll();
    await projectDao.deleteAll();
    await userDao.deleteAll();
    await dbcon.disconnect();
});

beforeEach(async function(){
    await materialDao.deleteAll();
    await projectDao.deleteAll();
    await userDao.deleteAll();
});

/**
 * setup to create user/manager and also a project since matrial contains both
 */
async function setupTestData() {
    const manager = await userDao.create({
        name: 'Manager User',
        role: 1,
        email: 'manager@test.com',
        password: 'pass'
    });

    const project = await projectDao.create({
        name: 'Test Project Site',
        manager: manager._id,
        location: 'Baltimore',
        workers: []
    });

    return { manager, project };
}


test('Create new material', async function(){
    const { project } = await setupTestData();

    const newMaterial = {
        name: 'Concrete',
        quantity: 100,
        unit: 'm3',
        project: project._id
    };

    const created = await materialDao.create(newMaterial);
    const found = await materialDao.read(created._id);

    expect(created._id).toBeDefined();
    expect(found.name).toBe('Concrete');
    expect(found.project.name).toBe('Test Project Site'); 
});

test('Read all materials', async function(){
    const { project } = await setupTestData();

    await materialDao.create({ name: 'Steel', quantity: 10, unit: 'Tons', project: project._id });
    await materialDao.create({ name: 'Timber', quantity: 50, unit: 'Planks', project: project._id });

    const materials = await materialDao.readAll();

    expect(materials.length).toBe(2);
});

test('Update material quantity', async function(){
    const { project } = await setupTestData();

    const created = await materialDao.create({
        name: 'Bricks',
        quantity: 1000,
        unit: 'units',
        project: project._id
    });

    const updated = await materialDao.update(created._id, {
        quantity: 1500
    });

    expect(updated.quantity).toBe(1500);
});

test('Delete material', async function(){
    const { project } = await setupTestData();

    const created = await materialDao.create({
        name: 'Copper Pipe',
        quantity: 5,
        unit: 'm',
        project: project._id
    });

    const deleted = await materialDao.del(created._id);
    const found = await materialDao.read(created._id);

    expect(found).toBeNull();
    expect(deleted.name).toBe('Copper Pipe');
});

test('Delete all materials', async function(){
    const { project } = await setupTestData();

    await materialDao.create({ name: 'Mat1', quantity: 1, unit: 'pc', project: project._id });
    await materialDao.create({ name: 'Mat2', quantity: 1, unit: 'pc', project: project._id });

    await materialDao.deleteAll();

    const materials = await materialDao.readAll();
    expect(materials.length).toBe(0);
});