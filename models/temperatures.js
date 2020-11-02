const mongoose  = require('mongoose');
const Schema = mongoose.Schema;

const temperatureSchema = new Schema({
    sensor_id: String,
    sensor_room: String,
    temperature: Number
}, { timestamps: true });

const Temperature = mongoose.model('Temperature', temperatureSchema);

module.exports = Temperature;