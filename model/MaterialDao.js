const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 0
    },
    unit: {
        type: String, 
        required: true 
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true
    }
});

const materialModel = mongoose.model('materials', materialSchema);

exports.readAll = async function(){
    let materials = await materialModel.find()
        .populate('project'); 
    return materials;
}

exports.read = async function(id){
    let material = await materialModel.findById(id)
        .populate('project');
    return material;
}

exports.create = async function(newMaterial){
    let material = new materialModel(newMaterial);
    await material.save();
    return material;
}

exports.update = async function(id, updates){
    let material = await materialModel.findByIdAndUpdate(
        id,
        updates,
        { new: true }
    );
    return material;
}

exports.del = async function(id){
    let material = await materialModel.findByIdAndDelete(id);
    return material;
}

exports.deleteAll = async function(){
    await materialModel.deleteMany();
}