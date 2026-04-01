const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unit:     { type: String, required: true }
}, { _id: true });

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, unique: true, required: true },
    vendor:    { type: String, required: true },
    status:    { type: String, enum: ['Draft', 'Pending', 'Approved', 'Received', 'Cancelled'], default: 'Draft' },
    project:   { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },
    materials: [materialSchema],
    notes:     { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});


const purchaseOrderModel = mongoose.model('purchaseorders', purchaseOrderSchema);

exports.readAll = async function () {
    return await purchaseOrderModel.find()
        .populate('project');
};

exports.read = async function (id) {
    return await purchaseOrderModel.findById(id)
        .populate('project');
};

exports.create = async (data) => await new purchaseOrderModel(data).save();

exports.update = async (id, updates) => await purchaseOrderModel.findByIdAndUpdate(id, updates, { new: true });

exports.del = async (id) => await purchaseOrderModel.findByIdAndDelete(id);

exports.deleteAll = async function () {
    await purchaseOrderModel.deleteMany();
};