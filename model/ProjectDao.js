const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    location: {
        type: String,
        required: true
    },
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    //once matrials is contructed remove comments
    /** 
    materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "materials"
    }]  
    */
});

const projectModel = mongoose.model('projects', projectSchema);


exports.readAll = async function(){
    let projects = await projectModel.find()
        .populate('manager')
        .populate('workers');
        // .populate('materials');  //remove the comments once materials is constructed
    return projects;
}

exports.read = async function(id){
    let project = await projectModel.findById(id)
        .populate('manager')
        .populate('workers');
        // .populate('materials');  //remove the comments once materials is constructed
    return project;
}

exports.create = async function(newProject){
    let project = new projectModel(newProject);
    await project.save();
    return project;
}

exports.update = async function(id, updates){
    let project = await projectModel.findByIdAndUpdate(
        id,
        updates,
        { new: true }
    );
    return project;
}

exports.del = async function(id){
    let project = await projectModel.findByIdAndDelete(id);
    return project;
}

exports.deleteAll = async function(){
    await projectModel.deleteMany();
}


