const mongoose = require('mongoose');

const FormDataSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'singleton'
    },
    userId: String,
    password: String
}, { _id: false }); // Stop MongoDB from generating its own _id

const FormDataModel = mongoose.model('registration_form', FormDataSchema);

module.exports = FormDataModel;