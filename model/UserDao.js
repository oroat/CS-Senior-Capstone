const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        requried: true
    },
    role: {
        type: Int32,
        requried: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model('users', userSchema);

exports.readAll = async function(){
    let users = await userModel.find();
    return users;
}

exports.read = async function(id){
    let user = await userModel.findById(id);
    return user;
}

exports.create = async function(newuser){
    let user = new userModel(newuser);
    await user.save();
    return user;
}

exports.update = async function(id, updates){
    let user = await userModel.findByIdAndUpdate(id, updates, { new: true});
    return user;
}

exports.del = async function(id){
    let user = await userModel.findByIdAndDelete(id);
    return user;
}

exports.deleteAll = async function(){
    await userModel.deleteMany();
}

exports.findLogin = async function(emailToFind){
    let user = await userModel.findOne({email: emailToFind});
    return user;
}

exports.findByRole = async function(roleToFind){
    let users = await userModel.find({role: roleToFind});
    return users;
}