const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    url: String,
    title: String,
    author: String,
    urlToImage: String,
    description: String,
    count: Number
});

const News = mongoose.model('News', NewsSchema);

module.exports = News;