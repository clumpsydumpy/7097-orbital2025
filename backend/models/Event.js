const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    date: { // Store the date of the event
        type: Date,
        required: true
    }
});

const EventModel = mongoose.model('events', EventSchema);

module.exports = EventModel;