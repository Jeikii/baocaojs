const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Kết nối tới cơ sở dữ liệu MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/my-databases', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Kết nối cơ sở dữ liệu thất bại:'));
db.once('open', () => {
    console.log('Kết nối thành công đến cơ sở dữ liệu');
});

// Sử dụng bodyParser và cors
app.use(bodyParser.json());
app.use(cors());

// Tải mô hình Product
const Product = require('./models/product');
const User = require('./models/User');  // Đảm bảo bạn đã import đúng đường dẫn
const Cart = require('./models/cart');


// Tạo route để tạo sản phẩm mới
app.post('/products', async (req, res) => {
    try {
        const { name, price, description, image } = req.body;
        const newProduct = new Product({ name, price, description, image });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Đã xảy ra lỗi khi tạo sản phẩm mới.', error: error.message });
    }
});

// Tạo route để lấy danh sách sản phẩm
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách sản phẩm.', error: error.message });
    }
});

// Tạo route để lấy một sản phẩm theo ID
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy sản phẩm.', error: error.message });
    }
});

// Tạo route để cập nhật một sản phẩm theo ID
app.patch('/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: 'Đã xảy ra lỗi khi cập nhật sản phẩm.', error: error.message });
    }
});

// Tạo route để xóa sản phẩm
app.delete('/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }
        res.json({ message: 'Sản phẩm đã được xóa thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa sản phẩm.', error: error.message });
    }
});

//account


// Xử lý yêu cầu đăng nhập

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
        }

        const passwordMatch = user.comparePassword(password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Lỗi xảy ra khi xử lý yêu cầu đăng nhập:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi xử lý yêu cầu đăng nhập.' });
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra người dùng đã tồn tại hay chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email đã được sử dụng.' });
        }

        // Tạo người dùng mới và lưu trữ trong cơ sở dữ liệu
        const newUser = new User({ email, password });
        await newUser.save();

        // Đăng ký thành công
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Đã xảy ra lỗi trong quá trình đăng ký.', error: error.message });
    }
});


// Thêm sản phẩm vào giỏ hàng
// Thêm sản phẩm vào giỏ hàng
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    // Thêm các thuộc tính khác của sản phẩm nếu cần
});



const CartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
});

const CartSchema = new mongoose.Schema({
    items: [CartItemSchema],
});



// Sử dụng middleware để parse JSON trong yêu cầu
app.use(express.json());

// Thêm sản phẩm vào giỏ hàng
app.post('/cart', async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Tìm giỏ hàng
        let cart = await Cart.findOne();
        
        if (!cart) {
            // Nếu chưa có giỏ hàng, tạo mới
            cart = new Cart({ items: [] });
        }

        // Tìm sản phẩm trong giỏ hàng
        const cartItem = cart.items.find(item => item.product.equals(productId));

        if (cartItem) {
            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
            cartItem.quantity += quantity;
        } else {
            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            cart.items.push({ product: productId, quantity });
        }

        // Lưu giỏ hàng
        await cart.save();
        
        res.json({ message: 'Sản phẩm đã được thêm vào giỏ hàng', cart });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi trong quá trình thêm sản phẩm vào giỏ hàng', error });
    }
});

// Cập nhật số lượng của một sản phẩm trong giỏ hàng
app.put('/cart/:productId', async (req, res) => {
    const { productId } = req.params;
    const { newQuantity } = req.body;

    try {
        // Tìm giỏ hàng
        const cart = await Cart.findOne();

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Tìm sản phẩm trong giỏ hàng
        const cartItem = cart.items.find(item => item.product.equals(productId));

        if (cartItem) {
            // Cập nhật số lượng
            cartItem.quantity = newQuantity;
            await cart.save();
            res.json({ message: 'Số lượng sản phẩm đã được cập nhật', cart });
        } else {
            res.status(404).json({ message: `Không tìm thấy sản phẩm '${productId}' trong giỏ hàng` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi trong quá trình cập nhật giỏ hàng', error });
    }
});

// Hiển thị nội dung giỏ hàng và sử dụng populate để lấy thông tin sản phẩm đầy đủ
app.get('/cart', async (req, res) => {
    try {
        // Tìm giỏ hàng và sử dụng populate để lấy thông tin sản phẩm đầy đủ
        const cart = await Cart.findOne().populate('items.product');

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Tính tổng giá trị của giỏ hàng
        let totalPrice = 0;
        for (const item of cart.items) {
            totalPrice += item.quantity * item.product.price;
        }

        res.json({ cart, totalPrice });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi trong quá trình hiển thị giỏ hàng', error });
    }
});

// Xóa một sản phẩm khỏi giỏ hàng
app.delete('/cart/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        // Tìm giỏ hàng
        const cart = await Cart.findOne();

        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
        }

        // Tìm chỉ số của sản phẩm trong giỏ hàng và xóa nó
        const index = cart.items.findIndex(item => item.product.equals(productId));
        if (index !== -1) {
            cart.items.splice(index, 1);
            await cart.save();
            res.json({ message: `Sản phẩm '${productId}' đã được xóa khỏi giỏ hàng`, cart });
        } else {
            res.status(404).json({ message: `Không tìm thấy sản phẩm '${productId}' trong giỏ hàng` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi trong quá trình xóa sản phẩm khỏi giỏ hàng', error });
    }
});

app.post('/checkout', async (req, res) => {
    try {
        // Xóa tất cả các mặt hàng trong giỏ hàng
        await Cart.deleteMany();

        // Trả về thông báo thanh toán thành công
        res.json({ message: 'Thanh toán thành công!' });
    } catch (error) {
        console.error('Đã xảy ra lỗi khi thực hiện thanh toán:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thực hiện thanh toán.' });
    }
});

app.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        const isOldPasswordValid = await user.comparePassword(oldPassword);
        if (!isOldPasswordValid) {
            return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
        }

        // Lưu mật khẩu mới trực tiếp mà không mã hóa
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Thay đổi mật khẩu thành công!' });
    } catch (error) {
        console.error('Lỗi xảy ra khi thay đổi mật khẩu:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi thay đổi mật khẩu.' });
    }
});
// Khởi động máy chủ
app.listen(PORT, () => {
    console.log(`Máy chủ đang chạy trên cổng ${PORT}`);
});
