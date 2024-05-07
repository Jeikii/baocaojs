// Lấy các phần tử từ DOM
const searchButton = document.getElementById('search-button');
const searchQueryInput = document.getElementById('search-query');
const productContainer = document.getElementById('product-container');

// Gọi hàm để hiển thị toàn bộ sản phẩm khi trang web được tải
document.addEventListener('DOMContentLoaded', fetchAllProducts);

// Sự kiện khi nhấn nút tìm kiếm
searchButton.addEventListener('click', handleSearch);

// Sự kiện khi nhập và nhấn phím Enter
searchQueryInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});
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
}

// Hàm để hiển thị toàn bộ sản phẩm
async function fetchAllProducts() {

    try {
        const response = await fetch('http://localhost:5000/products');
        if (!response.ok) {
            throw new Error('Không thể tải toàn bộ sản phẩm.');
        }
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Đã xảy ra lỗi khi tải sản phẩm:', error);
        alert('Đã xảy ra lỗi khi tải toàn bộ sản phẩm.');
    }
}

// Hàm hiển thị danh sách sản phẩm
function displayProducts(products) {
    // Xóa nội dung hiện tại của productContainer
    productContainer.innerHTML = '';
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
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
        productContainer.appendChild(productDiv);
    });
}

// Hàm để xử lý tìm kiếm
async function handleSearch() {
    const query = searchQueryInput.value.trim().toLowerCase(); // Chuyển đổi từ khóa thành chữ thường
    if (query === '') {
        alert('Vui lòng nhập từ khóa tìm kiếm.');
        fetchAllProducts(); // Nếu ô tìm kiếm trống, hiển thị toàn bộ sản phẩm
        return;
    }


    // Gửi yêu cầu tìm kiếm đến API
    try {
        const response = await fetch(`http://localhost:5000/products?search=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error('Không thể tìm kiếm sản phẩm.');
        }

        const products = await response.json();

        // Lọc sản phẩm theo một phần từ khóa trong tên sản phẩm
        const filteredProducts = products.filter(product => product.name.toLowerCase().includes(query));

        // Hiển thị danh sách sản phẩm tìm kiếm được
        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Đã xảy ra lỗi khi tìm kiếm sản phẩm:', error);
        alert('Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại.');
    }
}
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
                    window.location.href = '../Aptech-web-TMDT/products.html';
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