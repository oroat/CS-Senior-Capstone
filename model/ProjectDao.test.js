const dbcon = require('../dbconnection');
const projectDao = require('./ProjectDao');
const userDao = require('./UserDao');

require("dotenv").config();

beforeAll(async function(){
    await dbcon.connect('test');
});

afterAll(async function(){
    await projectDao.deleteAll();
    await userDao.deleteAll();
    await dbcon.disconnect();
});

beforeEach(async function(){
    await projectDao.deleteAll();
    await userDao.deleteAll();
});


async function createTestUsers() {
    const manager = await userDao.create({
        name: 'Manager User',
        role: 1,
        email: 'manager@test.com',
        password: 'pass'
    });

    const worker1 = await userDao.create({
        name: 'Worker One',
        role: 2,
        email: 'worker1@test.com',
        password: 'pass'
    });

    const worker2 = await userDao.create({
        name: 'Worker Two',
        role: 2,
        email: 'worker2@test.com',
        password: 'pass'
    });

    return { manager, worker1, worker2 };
}


test('Create new project', async function(){
    const { manager, worker1, worker2 } = await createTestUsers();

    const newProject = {
        name: 'Project',
        manager: manager._id,
        location: 'Baltimore',
        workers: [worker1._id, worker2._id]
    };

    const created = await projectDao.create(newProject);
    const found = await projectDao.read(created._id);

    expect(created._id).not.toBeNull();
    expect(found.name).toBe('Project');
    expect(found.workers.length).toBe(2);
});


test('Read all projects', async function(){
    const { manager } = await createTestUsers();

    await projectDao.create({
        name: 'Project1',
        manager: manager._id,
        location: 'Baltimore',
        workers: []
    });

    await projectDao.create({
        name: 'Project2',
        manager: manager._id,
        location: 'New Jersey',
        workers: []
    });

    const projects = await projectDao.readAll();

    expect(projects.length).toBe(2);
});


test('Update project', async function(){
    const { manager } = await createTestUsers();

    const created = await projectDao.create({
        name: 'Old Name',
        manager: manager._id,
        location: 'New Jersey',
        workers: []
    });

    const updated = await projectDao.update(created._id, {
        name: 'Updated Name'
    });

    expect(updated.name).toBe('Updated Name');
});


test('Delete project', async function(){
    const { manager } = await createTestUsers();

    const created = await projectDao.create({
        name: 'Test Delete',
        manager: manager._id,
        location: 'Baltimore',
        workers: []
    });

    const deleted = await projectDao.del(created._id);
    const found = await projectDao.read(created._id);

    expect(found).toBeNull();
    expect(deleted._id.toString()).toBe(created._id.toString());
});


test('Delete all projects', async function(){
    const { manager } = await createTestUsers();

    await projectDao.create({
        name: 'Project1',
        manager: manager._id,
        location: 'Baltimore',
        workers: []
    });

    await projectDao.create({
        name: 'Project2',
        manager: manager._id,
        location: 'CA',
        workers: []
    });

    await projectDao.deleteAll();

    const projects = await projectDao.readAll();

    expect(projects.length).toBe(0);
});
