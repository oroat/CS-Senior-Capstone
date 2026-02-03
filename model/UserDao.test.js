const dbcon = require('./') //add db connection file
const dao = require('./UserDao');

beforeAll(async function(){
    await dbcon.connect('') //add test db connection
});
afterAll(async function(){
    await dao.deleteAll();
    dbcon.disconnect();
});

beforeEach(async function(){
    await dao.deleteAll();
});

test('Create new user test', async function(){
    let newdata = {name:'Test Test', 
                    role: 1, 
                    email: 'test@coolsys.com',
                    password: 'test123'};
    let created = await dao.create(newdata);
    let found = await dao.read(created._id);

    expect(created._id).not.toBeNull();
    expect(created.email).toBe(found.email); 
});

test('Delete User', async function(){
    let newdata = {name:'Test Test', 
        role: 2, 
        email: 'test@coolsys.com',
        password: 'test123'};
    let created = await dao.create(newdata);
    let deleted = await dao.del(created._id);
    let found = await dao.read(created._id);
    
    expect(found).toBeNull();
    expect(deleted._id).toEqual(created._id);
});

test('Read All', async function(){
    let newdata1 = {name:'Test1 Test', 
        role: 1, 
        email: 'test1@coolsys.com',
        password: 'test123'};
    let newdata2 = {name:'Test2 Test', 
        role: 2, 
        email: 'test2@coolsys.com',
        password: 'test123'};
    let newdata3 = {name:'Test3 Test', 
        role: 3, 
        email: 'test3@coolsys.com',
        password: 'test123'};

    let user1 = await dao.create(newdata1);
    let user2 = await dao.create(newdata2);
    let user3 = await dao.create(newdata3);

    let lstUsers = await dao.readAll();

    expect(lstUsers.length).toBe(3);
    expect(lstUsers[0].email).toBe(user1.email);
});

test('Find Login username', async function(){
    let newdata = {name:'Test Test', 
        role: 1, 
        email: 'test@coolsys.com',
        password: 'test123'};

    let created = await dao.create(newdata);
    let logged = await dao.findLogin(newdata.username);

    expect(logged).not.toBeNull();
    expect(logged._id).toEqual(created._id);
    expect(logged.email).toEqual(created.email);
});

test('Login not found', async function(){
    let newdata = {name:'Test Test', 
        role: 2, 
        email: 'test@coolsys.com',
        password: 'test123'};
    
        let created = await dao.create(newdata);
        let badLogged = await dao.findLogin('not the login', 'not the password');

        expect(badLogged).toBeNull();
});

test('Update user', async function(){
    let newdata = {name:'Test Test', 
        role: 2, 
        email: 'test@coolsys.com',
        password: 'test123'};

    let created = await dao.create(newdata);

    let updates = { name: 'Updated Test', 
                    role: 1};
    let updated = await dao.update(created._id, updates);

    expect(updated.name).toBe('Updated Test');
    expect(updated.role).toBe(1);
});

test('Find user by role', async function(){
    let newdata = {name:'Test Test', 
        role: 2, 
        email: 'test@coolsys.com',
        password: 'test123'};

    let created = await dao.create(newdata);
    let foundUsers = await dao.findByRole(2);
    expect(foundUsers.length).toBe(1);
});