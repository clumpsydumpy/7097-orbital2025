const mongoose = require('mongoose');

const FormDataSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const FormDataModel = mongoose.model('registration_form', FormDataSchema);

module.exports = FormDataModel;
