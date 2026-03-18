const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
    dt_recvd: { type: String, required: true },
    recip: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    materials_recvd: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "materials"
    }]
});

const shipmentModel = mongoose.model('shipments', shipmentSchema);

exports.readAll = async function() {
    let shipments = await shipmentModel.find()
        .populate('project')
        .populate('recip')
        .populate('materials_recvd');
    return shipments;
}

exports.read = async function(id) {
    let shipment = await shipmentModel.findById(id)
        .populate('project')
        .populate('recip')
        .populate('materials_recvd');
    return shipment;
}

exports.create = async function(newShipment) {
    let shipment = new shipmentModel(newShipment);
    await shipment.save();
    return shipment;
}

exports.update = async function(id, updates) {
    let shipment = await shipmentModel.findByIdAndUpdate(
        id,
        updates,
        { new: true }
    );
    return shipment;
}

exports.del = async function(id) {
    let shipment = await shipmentModel.findByIdAndDelete(id);
    return shipment;
}

exports.deleteAll = async function() {
    await shipmentModel.deleteMany();
}

