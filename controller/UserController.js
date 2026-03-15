const UserDao = require('../model/UserDao');
const hash = require('../util/Hashing');

exports.register = async function(req, res) {
    if (req.body.pass != req.body.confirm_pass){
        res.redirect('/users.html?error=1');
        return;
    }

    let existingEmail = await UserDao.findLogin(req.body.email);
    if (existingEmail == null){
        let userInfo = {
            name: req.body.name,
            email: req.body.email,
            role: 1,
            password: hash.hashString(req.body.pass)
        }

        let user = UserDao.create(userInfo);
        res.redirect('/users.html');
    } else{
        res.redirect('/users.html?error=2');
    }
}

exports.getUserById = async function(req, res) {
    try {
        const user = await UserDao.read(req.params.id);

        res.status(200);
        res.json(user);

    } catch (error) {
        res.status(500);
        res.json({ error: 'Failed to fetch user' });
    }
};

exports.getAllUsers = async function(req, res){
    try{
        let users = await UserDao.readAll();
        res.status(200);
        res.json(users);
    } catch (error){
        res.status(500);
        res.json({error: 'failed to fetch users'});
    }
}

exports.deleteUser = async function(req, res){
    const {id} = req.params;
    try{
        await UserDao.del(id);
        res.status(200).json({success: true})
    } catch (error){
        res.status(500).json({error: "Failed to delete user", details: error.message});
    }
}

exports.updateRole = async function(req, res){
    const {id} = req.params;
    const newRole = req.body.role;
    
    try{
        const updatedUser = await UserDao.update(id, {role: newRole});
        res.status(200).json({success: true, updatedUser});
    } catch (error){
        res.status(500).json({error: "Failed to update user role", details: error.message});
    }
}

exports.login = async function(req, res){
    let login = req.body.email;

    let user = await UserDao.findLogin(login);

    if (user == null){
        res.redirect('/login.html?error=1')
    } else{
        if (hash.compareHash(req.body.pass,user.password)){
            req.session.user = user;
            res.redirect('/landing.html');
        } else{
            res.redirect('/login.html?error=2');
        }
    }
}

exports.logged = function(req, res){
    res.status(200);
    if (req.session.user)
        res.send(req.session.user);
    else
        res.json(null);
    res.end();
}

exports.logout = async function(req, res){
    req.session.user = null;
    res.redirect('/landing.html');
}


