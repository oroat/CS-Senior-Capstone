const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    location: { type: String, required: true },
    workers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
    materials: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "materials"
    }]  
});

const projectModel = mongoose.model('projects', projectSchema);

exports.readAll = async function(){
    return await projectModel.find()
        .populate('manager')
        .populate('workers')
        .populate('materials');
}

exports.read = async function(id){
    return await projectModel.findById(id)
        .populate('manager')
        .populate('workers')
        .populate('materials');
}

exports.create = async (data) => await new projectModel(data).save();
exports.update = async (id, updates) => await projectModel.findByIdAndUpdate(id, updates, { new: true });
exports.del = async (id) => await projectModel.findByIdAndDelete(id);