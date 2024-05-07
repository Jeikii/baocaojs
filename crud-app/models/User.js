const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});



// Phương pháp so sánh mật khẩu dưới dạng văn bản thuần túy
userSchema.methods.comparePassword = function (password) {
    return password === this.password;
};

const User = mongoose.model('User', userSchema);

module.exports = User;