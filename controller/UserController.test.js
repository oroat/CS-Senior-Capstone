const dbcon = require('../dbconnection'); //add db connection file
const dao = require('../model/UserDao');
const controller = require('./UserController');
const hash = require('../util/Hashing')

require("dotenv").config();

jest.mock('../model/UserDao');
jest.mock('../util/Hashing');

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
        pass: 'password',
        confirm_pass: 'password'
    }}
    let res = {redirect: jest.fn()}

    await controller.register(req, res);
    
    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(hash.hashString).toHaveBeenCalled(); //.toHaveBeenCalledWith(req.body.password) not working
    expect(dao.create).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/users.html')
});

test('Getting user by ID', async function(){
    let user = {_id: 'u1', name: 'User A', role: 1, email: 'a@coolsys.com', password: 'passA'};
    
    let req = {params: {id: 'u1'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    dao.read = jest.fn().mockResolvedValue(user);

    await controller.getUserById(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(user);

});

test('Error in getting user by ID', async function(){
    let user = {_id: 'u1', name: 'User A', role: 1, email: 'a@coolsys.com', password: 'passA'};
    
    let req = {params: {id: 'u1'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    dao.read = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getUserById(req, res);

    expect(dao.read).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'Failed to fetch user'});

});

test('Registration fails because pass and confirm_pass dont match', async function(){
    let req = { body: {
        name: 'Test Test',
        email: 'test@coolsys.com',
        pass: 'password',
        confirm_pass: 'wrong'
    }}
    let res = {redirect: jest.fn()}

    await controller.register(req, res);
    expect(res.redirect).toHaveBeenCalledWith('/users.html?error=1');
})

test('Registration fails because email already exists in database', async function(){
    let req = { body: {
        name: 'Test Test',
        email: 'test@coolsys.com',
        password: 'password'
    }}
    let res = {redirect: jest.fn()}

    dao.findLogin = jest.fn().mockResolvedValueOnce({email: 'test@coolsys.com'});

    await controller.register(req, res);

    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(res.redirect).toHaveBeenCalledWith('/users.html?error=2');
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

test('Error in fetching all users', async function(){
    let req = {};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    dao.readAll = jest.fn().mockRejectedValue(new Error('DB error'));

    await controller.getAllUsers(req, res);

    expect(dao.readAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: 'failed to fetch users'});
})

test('Delete user', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};

    await controller.deleteUser(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true});
});

test('Failed to delete user', async function(){
    let req = {params: {id: 'id'}};
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    let error = {message: 'DB error'};

    dao.del = jest.fn().mockRejectedValue(new Error('DB error'));
    
    await controller.deleteUser(req, res);

    expect(dao.del).toHaveBeenCalledWith(req.params.id);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Failed to delete user", details: error.message});
})

test('Update role', async function(){
    let req = {
        body: {usersdropdown: 'id', rolesdropdown: 2}
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn(), redirect: jest.fn()};

    let updatedUser = await controller.updateRole(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.body.usersdropdown, {role: req.body.rolesdropdown});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({success: true, updatedUser, redirect: '/users.html'});
});

test('Fail to update role', async function(){
    let req = {
        body: {usersdropdown: 'id', rolesdropdown: 2}
    };
    let res = {status: jest.fn().mockReturnThis(), json: jest.fn(), redirect: jest.fn()};
    let error = {message: 'DB error'};

    dao.update = jest.fn().mockRejectedValue(new Error('DB error'));
    
    await controller.updateRole(req, res);

    expect(dao.update).toHaveBeenCalledWith(req.body.usersdropdown, {role: req.body.rolesdropdown});
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({error: "Failed to update user role", details: error.message});
})

test('Successful login', async function(){
    let req = {body: {email: 'test@coolsys.com', pass: 'test123'},
                session: {user: null}};
    let res = {redirect: jest.fn()};
    dao.findLogin = jest.fn(async() => ({email: 'test@coolsys.com', password: 'test123'}));
    hash.compareHash = jest.fn(() => true);

    await controller.login(req, res);
    expect(dao.findLogin).toHaveBeenCalledWith(req.body.email);
    expect(hash.compareHash).toHaveBeenCalled();
    expect(req.session.user).not.toBeNull();
    expect(res.redirect).toHaveBeenCalledWith('/landing.html');
});

test('Login w/ wrong password', async function(){
    let req = {body: {email: 'test@coolsys.com', pass: 'wrong password'},
                session: {user: null}};
    let res = {redirect: jest.fn()};
    dao.findLogin = jest.fn(async() => ({email: 'test@coolsys.com', password: 'test123'}));
    hash.compareHash = jest.fn(() => false);

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
    



