const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    manager:  { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    location: { type: String, required: true },
    workers:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
});

const projectModel = mongoose.model('projects', projectSchema);

exports.readAll = async function(){
    return await projectModel.find()
        .populate('manager')
        .populate('workers')
        
}

exports.read = async function(id){
    return await projectModel.findById(id)
        .populate('manager')
        .populate('workers')
        
}

exports.create = async (data) => await new projectModel(data).save();

exports.update = async (id, updates) => await projectModel.findByIdAndUpdate(id, updates, { new: true });

exports.del = async (id) => await projectModel.findByIdAndDelete(id);

exports.deleteAll = async function(){
    await projectModel.deleteMany();
}

// needed for test teardown
exports.deleteAll = async function(){
    await projectModel.deleteMany();
}
