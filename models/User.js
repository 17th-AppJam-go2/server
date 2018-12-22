const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: {type: String, unique: true},
    password: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'shops'}],
    type: String // Admin, User
});

const User = mongoose.model('users', UserSchema);

module.exports = User;
