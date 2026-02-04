const UserDao = require('../model/UserDao');

exports.register = async function(req, res) {
    //ADD CONFIRM PASSWORD
    let existingEmail = await UserDao.findLogin(req.body.email);
    if (existingEmail == null){
        let userInfo = {
            name: req.body.name,
            email: req.body.email,
            role: 1,
            password: req.body.pass
        }

        let user = UserDao.create(userInfo);
        console.log('Successfully registered user');
        res.redirect('/landing.html');
    } else{
        console.log('User already exists with that email');
        res.redirect('/landing.html');
    }
}

exports.getAllUsers = async function(req, res){
    try{
        let users = await UserDao.readAll();
        res.status(200);
        res.json(users);
    } catch (error){
        console.error('error in getAllUsers: ', error);
        res.status(500);
        res.json({error: 'failed to fetch users'});
    }
    

}


