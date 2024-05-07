// Xử lý sự kiện DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
    // Lấy phần tử HTML có ID 'create-form' để xử lý tạo sản phẩm mới
    const createForm = document.getElementById('create-form');

    // Xử lý sự kiện submit của biểu mẫu tạo sản phẩm
    if (createForm) {
        createForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            const image = document.getElementById('image').value;

            try {
                const response = await fetch('http://localhost:5000/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, price, description, image })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    alert(`Đã xảy ra lỗi khi tạo sản phẩm mới: ${errorData.message}`);
                    return;
                }

                // Thông báo sản phẩm mới đã được tạo thành công
                alert('Sản phẩm mới đã được tạo thành công!');
                window.location.href = '../products.html'; // Điều hướng đến trang index
            } catch (error) {
                alert('Đã xảy ra lỗi khi tạo sản phẩm mới: Vui lòng thử lại.');
            }
        });
    }

    // Lấy phần tử HTML có ID 'product-slick-1' để hiển thị danh sách sản phẩm
    const productContainer = document.getElementById('product-slick-1');

    // Xử lý lấy danh sách sản phẩm
    if (productContainer) {
        productContainer.addEventListener('click', function (event) {
            const target = event.target;

            // Kiểm tra xem phần tử được click có phải là nút "Add to Cart" không
            if (target.classList.contains('add-to-cart')) {
                // Lấy ID sản phẩm từ thuộc tính data-id của nút
                const productId = target.getAttribute('data-id');
                
                // Lấy số lượng từ một phần tử nhập liệu có liên quan, giả sử có input với class "quantity-input"
                const quantityInput = target.closest('.product-body').querySelector('.quantity-input');
                const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1; // Nếu không tìm thấy input hoặc giá trị không hợp lệ, mặc định là 1
            
                // Gửi yêu cầu POST để thêm sản phẩm vào giỏ hàng
                fetch('http://localhost:5000/cart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        productId: productId,
                        quantity: quantity, // Gửi số lượng kèm theo
                    }),
                })
                .then(response => {
                    if (response.ok) {
                        // Cập nhật giao diện giỏ hàng hoặc hiển thị thông báo thành công
                        alert('Sản phẩm đã được thêm vào giỏ hàng.');
                        // Gọi một hàm để cập nhật giao diện giỏ hàng nếu cần
                    } else {
                        // Xử lý lỗi dựa trên mã trạng thái phản hồi
                        response.json().then(errorData => {
                            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', errorData);
                            alert(`Lỗi: ${errorData.message}`);
                        });
                    }
                })
                .catch(error => {
                    console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
                    alert('Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
                });
            }
        });
        try {
            const response = await fetch('http://localhost:5000/products');

            if (!response.ok) {
                throw new Error('Không thể lấy danh sách sản phẩm.');
            }

            const products = await response.json();

            // Xóa nội dung hiện tại của danh sách sản phẩm
            productContainer.innerHTML = '';

            // Lặp qua danh sách sản phẩm và hiển thị chúng trong trang HTML
            products.forEach(product => {
                // Tạo một div chứa sản phẩm
                const productDiv = document.createElement('div');


                // Thiết lập nội dung HTML cho div chứa sản phẩm
                productDiv.innerHTML = `
                    <div class="items_pr" >
                    <div class="product-thumb">
                    <button class="main-btn delete-product" data-id="${product._id}">Delete</button>
                    <button class="main-btn edit-product" data-id="${product._id}">Edit</button> <br>
                        <img src="${product.image}" alt="" width="200px">
                    </div>
                    <div class="product-body">
                        <h3 class="product-price">${product.price} VND</h3>
                        <div class="product-rating">
                            <i class="fa fa-star"></i>
                            <i class="fa fa-star"></i>
                            <i class="fa fa-star"></i>
                            <i class="fa fa-star"></i>
                            <i class="fa fa-star-o empty"></i>
                        </div>
                        <h2 class="product-name"><a href="product-page.html?id=${product._id}">${product.name}</a></h2>
                        <div style="display: flex;" class="product-btns">
                            <button class="main-btn icon-btn"><i class="fa fa-heart"></i></button>
                            <button class="main-btn icon-btn"><i class="fa fa-exchange"></i></button>
                            <button class="primary-btn add-to-cart" data-id="${product._id}"><i class="fa fa-shopping-cart"></i> Add to Cart</button>
                            
                        </div>
                    </div>
                    </div>
                `;

                // Thêm div sản phẩm vào container
                productContainer.appendChild(productDiv);
            });
            // Thêm sự kiện click cho các tên sản phẩm
            productContainer.addEventListener('click', function (event) {
                const target = event.target;

                // Kiểm tra xem phần tử được click có phải là tên sản phẩm không
                if (target.classList.contains('product-name')) {
                    // Lấy ID của sản phẩm từ thuộc tính data-id
                    const productId = target.closest('.items_pr').querySelector('.edit-product').dataset.id;

                    // Điều hướng đến trang chi tiết sản phẩm với ID sản phẩm
                    window.location.href = `./crud-app/product-details.html?id=${productId}`;
                }
            });

            // Thêm sự kiện click cho các nút chỉnh sửa sản phẩm
            productContainer.addEventListener('click', function (event) {
                const target = event.target;

                // Kiểm tra xem phần tử được click có phải là nút chỉnh sửa không
                if (target.classList.contains('edit-product')) {
                    const productId = target.getAttribute('data-id');

                    // Chuyển hướng đến trang chỉnh sửa sản phẩm với ID sản phẩm
                    window.location.href = `./crud-app/edit-product.html?id=${productId}`;
                }
            });
            productContainer.addEventListener('click', function (event) {
                const target = event.target;

                // Kiểm tra xem phần tử được click có phải là nút chỉnh sửa không
                if (target.classList.contains('edit-product')) {
                    const productId = target.getAttribute('data-id');

                    // Chuyển hướng đến trang chỉnh sửa sản phẩm với ID sản phẩm
                    window.location.href = `./crud-app/edit-product.html?id=${productId}`;
                }

                // Kiểm tra xem phần tử được click có phải là nút delete không
                if (target.classList.contains('delete-product')) {
                    const productId = target.getAttribute('data-id');

                    // Hiển thị thông báo xác nhận
                    const confirmation = window.confirm('Bạn có chắc muốn xóa sản phẩm này không?');

                    if (confirmation) {
                        // Gửi yêu cầu DELETE đến máy chủ
                        fetch(`http://localhost:5000/products/${productId}`, {
                            method: 'DELETE'
                        }).then(response => {
                            if (response.ok) {
                                alert('Sản phẩm đã được xóa.');
                                // Chuyển hướng về trang chủ
                                window.location.href = './Products.html';
                            } else {
                                alert('Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.');
                            }
                        }).catch(error => {
                            console.error('Lỗi khi xóa sản phẩm:', error);
                            alert('Đã xảy ra lỗi khi xóa sản phẩm. Vui lòng thử lại.');
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Đã xảy ra lỗi khi lấy danh sách sản phẩm:', error);
            alert('Đã xảy ra lỗi khi lấy danh sách sản phẩm. Vui lòng thử lại sau.');
        }
    } else {
        console.error('Không tìm thấy phần tử HTML với ID "product-slick-1".');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Lấy tham số 'id' từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    // Nếu không có ID sản phẩm, thông báo lỗi và dừng thực hiện


    // Lấy biểu mẫu chỉnh sửa sản phẩm
    const editForm = document.getElementById('edit-form');

    // Kiểm tra nếu biểu mẫu tồn tại
    if (editForm) {
        event.preventDefault();
        // Gửi yêu cầu lấy thông tin sản phẩm từ máy chủ
        try {
            const response = await fetch(`http://localhost:5000/products/${productId}`);

            // Kiểm tra phản hồi của máy chủ
            if (!response.ok) {
                alert('Không thể lấy thông tin sản phẩm.');
                return;
            }

            // Nhận dữ liệu sản phẩm từ phản hồi
            const product = await response.json();

            // Điền thông tin sản phẩm vào biểu mẫu
            document.getElementById('product-id').value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('description').value = product.description;
            document.getElementById('image').value = product.image;
        } catch (error) {
            console.error('Đã xảy ra lỗi khi lấy thông tin sản phẩm:', error);
            alert('Đã xảy ra lỗi khi lấy thông tin sản phẩm. Vui lòng thử lại sau.');
        }

        // Xử lý sự kiện submit của biểu mẫu
        editForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Ngăn chặn hành vi mặc định

            // Lấy thông tin từ biểu mẫu
            const name = document.getElementById('name').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            const image = document.getElementById('image').value;

            // Gửi yêu cầu cập nhật sản phẩm đến máy chủ
            try {
                const response = await fetch(`http://localhost:5000/products/${productId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, price, description, image })
                });

                if (!response.ok) {
                    // Kiểm tra nếu phản hồi không phải là JSON
                    const errorText = await response.text();
                    console.error('Lỗi server:', errorText);
                    alert(`Đã xảy ra lỗi khi cập nhật sản phẩm: ${errorText}`);
                    return;
                }

                // Tiếp tục xử lý dữ liệu JSON
                const data = await response.json();
                alert('Sản phẩm đã được cập nhật thành công!');
                window.location.href = '../products.html';
            } catch (error) {
                console.error('Đã xảy ra lỗi khi cập nhật sản phẩm:', error);
                alert('Đã xảy ra lỗi khi cập nhật sản phẩm: Vui lòng thử lại.');
            }
        });
    } else {
        console.error('Không tìm thấy biểu mẫu chỉnh sửa sản phẩm.');
    }
});

// Accounts
document.getElementById('register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Lấy giá trị từ form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Gửi yêu cầu POST đến endpoint /register
        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Xử lý phản hồi từ server
        if (response.ok) {
            const data = await response.json();
            alert(`Đăng ký thành công!!!${email}!`);
            window.location.href = '../crud-app/login.html'; // Điều hướng đến trang chủ
        } else {
            const errorData = await response.json();
            alert(`Đăng Ký Không Thành Công: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Lỗi xảy ra khi gửi yêu cầu đăng ký:', error);
        alert('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    }
});

// Lắng nghe sự kiện submit của biểu mẫu đăng nhập
// Xử lý sự kiện submit của biểu mẫu đăng nhập

//serch





