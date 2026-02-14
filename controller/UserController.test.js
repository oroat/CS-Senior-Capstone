const dbcon = require('../dbconnection') //add db connection file
const dao = require('../model/UserDao');
const controller = require('./UserController');

require("dotenv").config();

jest.mock('../model/UserDao');

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

test('Successful registration', async function(){
    let req = { body: {
        name: 'Test Test',
        email: 'test@coolsys.com',
        password: 'password'
    }}
    let res = {redirect: jest.fn()}

    await controller.register(req, res);
    
    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(dao.create).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/users.html')
});

test('Registration fails because email already exists in database', async function(){
    let req = { body: {
        name: 'Test Test',
        email: 'test@coolsys.com',
        password: 'password'
    }}
    let res = {redirect: jest.fn()}

    dao.findLogin = jest.fn().mockResolvedValueOnce({email: 'test@coolsys.com'});
    console.log = jest.fn();

    await controller.register(req, res);

    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(console.log).toHaveBeenCalledWith('User already exists with that email');
    expect(res.redirect).toHaveBeenCalledWith('/users.html');
});

test('Successfully fetch all users', async function(){
    let req = {};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    let mockUsers = [
        {_id: 'u1', name: 'User A', role: 1, email: 'a@coolsys.com', password: 'passA'},
        {_id: 'u2', name: 'User B', role: 2, email: 'b@coolsys.com', password: 'passB'}
    ]

    dao.readAll = jest.fn().mockResolvedValue(mockUsers);

    await controller.getAllUsers(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
});

test('Delete user', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    await controller.deleteUser(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true});
});

test('Update role', async function(){
    let req = {
        params: {id: 'id'}, 
        body: {role: 2}
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    let updatedUser = await controller.updateRole(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.params.id, req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true, updatedUser});
});

test('Successful login', async function(){
    let req = {body: {email: 'test@coolsys.com', pass: 'test123'},
                session: {user: null}};
    let res = {redirect: jest.fn()};
    dao.findLogin = jest.fn(async() => ({email: 'test@coolsys.com', password: 'test123'}));

    await controller.login(req, res);
    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(req.session.user).not.toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('/landing.html');
});

test('Login w/ wrong password', async function(){
    let req = {body: {email: 'test@coolsys.com', pass: 'wrong password'},
                session: {user: null}};
    let res = {redirect: jest.fn()};
    dao.findLogin = jest.fn(async() => ({email: 'test@coolsys.com', password: 'test123'}));

    await controller.login(req, res);
    
    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(req.session.user).toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('/login.html?error=2');
});

test('Incorrect email', async function(){
    let req = {body: {email: 'wrongemail@coolsys.com', pass: 'test123'},
                session: {user: null}};
    let res = {redirect: jest.fn()};
    dao.findLogin = jest.fn(async() => null);

    await controller.login(req, res);

    expect(dao.findLogin).toHaveBeenCalled();
    expect(req.session.user).toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('/login.html?error=1');
});

test('Fetch logged user', async function(){
    let req = {session: {user: {_id: '1a', role:1}}};
    let res = {status: jest.fn(),
                send: jest.fn(),
                end: jest.fn()
            };

    await controller.logged(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({_id: '1a', role:1});
    expect(res.end).toHaveBeenCalled();
});

test('Fetch no logged user', async function(){
    let req = {session: {user: null}};
    let res = {status: jest.fn(),
                json: jest.fn(),
                end: jest.fn()
            };

    await controller.logged(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(null);
    expect(res.end).toHaveBeenCalled();
});

test('Logout user', async function(){
    let req = {session: {user: {_id: '1a', role:1}}};
    let res = {redirect: jest.fn()};

    await controller.logout(req, res);

    expect(req.session.user).toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('/landing.html');
});
    



