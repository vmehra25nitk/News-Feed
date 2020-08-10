const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    news: [{
        title: String,
        author:String,
        description: String,
        urlToImage: String
    }]
})

const User = mongoose.model('User', UserSchema);

module.exports = User;