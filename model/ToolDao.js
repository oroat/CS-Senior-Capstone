const { Int32 } = require('mongodb');
const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
    serialNum: {
        type: String,
        requried: true
    },
    model: {
        type: String,
        requried: true
    },
    inUse: {
        type: Boolean,
        default: false
    },
    usedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
});

const toolModel = mongoose.model('tools', toolSchema);

exports.readAll = async function(){
    let tools = await toolModel.find();
    return tools;
}

exports.read = async function(id){
    let tool = await toolModel.findById(id);
    return tool;
}

exports.create = async function(newtool){
    let tool = new toolModel(newtool);
    await tool.save();
    return tool;
}

exports.update = async function(id, updates){
    let tool = await toolModel.findByIdAndUpdate(id, updates, {returnDocument: 'after'});
    return tool;
}

exports.del = async function(id){
    let tool = await toolModel.findByIdAndDelete(id);
    return tool;
}

exports.deleteAll = async function(){
    await toolModel.deleteMany();
}

exports.findBySerial = async function(serialToFind){
    let tool = await toolModel.findOne({serialNum: serialToFind});
    return tool;
}