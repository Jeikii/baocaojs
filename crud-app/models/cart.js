const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
});

const cartSchema = new mongoose.Schema({
    // Loại bỏ trường 'user' hoặc thay đổi 'required: true' thành 'required: false'
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Nếu muốn giữ trường user nhưng không bắt buộc
    },
    items: [cartItemSchema]
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;