const dao = require('../model/ProjectDao');
const controller = require('./ProjectController');

jest.mock('../model/ProjectDao');

beforeEach(() => {
    jest.clearAllMocks();
});


test('Successful project creation', async () => {
    const req = {
        body: {
            name: 'Project',
            manager: 'managerId',
            location: 'Baltimore',
            workers: ['worker1', 'worker2']
        }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.create.mockResolvedValue(req.body);

    await controller.createProject(req, res);

    expect(dao.create).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        project: req.body
    });
});

test('Create project but DAO throws a error', async () => {
    const req = { body: {} };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.create.mockRejectedValue(new Error('DB error'));

    await controller.createProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to create project'
    });
});


test('Fetch all projects', async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const mockProjects = [
        { name: 'Project1' },
        { name: 'Project2' }
    ];

    dao.readAll.mockResolvedValue(mockProjects);

    await controller.getAllProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProjects);
});

test('Fetch all projects but DAO throws a error', async () => {
    const req = {};
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.readAll.mockRejectedValue(new Error('DB error'));

    await controller.getAllProjects(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch projects'
    });
});


test('Get project by ID', async () => {
    const req = { params: { id: '123' } };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const mockProject = { _id: '123', name: 'Project' };

    dao.read.mockResolvedValue(mockProject);

    await controller.getProjectById(req, res);

    expect(dao.read).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProject);
});

test('Fetch project by ID but DAO throws a error', async () => {
    const req = { params: { id: '123' } };
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.read.mockRejectedValue(new Error('DB error'));

    await controller.getProjectById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch project'
    });
});


test('Update project', async () => {
    const req = {
        params: { id: '123' },
        body: { name: 'Updated Project' }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const updatedProject = { _id: '123', name: 'Updated Project' };

    dao.update.mockResolvedValue(updatedProject);

    await controller.updateProject(req, res);

    expect(dao.update).toHaveBeenCalledWith('123', req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true,
        updatedProject
    });
});

test('Update project but DAO throws a error', async () => {
    const req = {
        params: { id: '123' },
        body: {}
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.update.mockRejectedValue(new Error('DB error'));

    await controller.updateProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to update project'
    });
});


test('Delete project', async () => {
    const req = { params: { id: '123' } };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.del.mockResolvedValue(true);

    await controller.deleteProject(req, res);

    expect(dao.del).toHaveBeenCalledWith('123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
        success: true
    });
});

test('Delete project but DAO throws a error', async () => {
    const req = { params: { id: '123' } };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    dao.del.mockRejectedValue(new Error('DB error'));

    await controller.deleteProject(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to delete project'
    });
});
