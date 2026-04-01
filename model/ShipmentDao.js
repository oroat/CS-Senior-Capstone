const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    sender:   { type: String, required: true },
    project:  { type: mongoose.Schema.Types.ObjectId, ref: 'projects', required: true },
    po:       { type: mongoose.Schema.Types.ObjectId, ref: 'purchaseorders', required: true },
    dt_recvd: { type: String, required: true },
    recip:    { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    // Materials are stored as plain objects (snapshot from the PO at time of shipment)
    materials_recvd: [{
        materialId: { type: String },
        name:       { type: String },
        unit:       { type: String },
        quantity:   { type: Number, default: 0 }
    }]
});

const shipmentModel = mongoose.model('shipments', shipmentSchema);

exports.readAll = async function () {
    return await shipmentModel.find()
        .populate('project')
        .populate('recip')
        .populate('po');
};

exports.read = async function (id) {
    return await shipmentModel.findById(id)
        .populate('project')
        .populate('recip')
        .populate('po');
};

exports.create = async function (newShipment) {
    let shipment = new shipmentModel(newShipment);
    await shipment.save();
    return shipment;
};

exports.update = async function (id, updates) {
    return await shipmentModel.findByIdAndUpdate(id, updates, { new: true });
};

exports.del = async function (id) {
    return await shipmentModel.findByIdAndDelete(id);
};

exports.deleteAll = async function () {
    await shipmentModel.deleteMany();
};