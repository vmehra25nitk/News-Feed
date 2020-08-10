const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
    newsId: String,
    userId: String
});

const Connection = mongoose.model('Connections', ConnectionSchema);

module.exports = Connection;