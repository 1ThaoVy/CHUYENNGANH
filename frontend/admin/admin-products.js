// Admin products management
let currentPage = 1;
let categories = [];

// Load categories
async function loadCategories() {
    try {
        const data = await apiCall('/categories');
        categories = data.data;
        
        const select = document.getElementById('danh_muc_id');
        select.innerHTML = '<option value="">Chọn thương hiệu</option>' +
            categories.map(cat => `<option value="${cat.danh_muc_id}">${cat.ten_danh_muc}</option>`).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load products
async function loadProducts(page = 1) {
    currentPage = page;
    console.log('Loading products...');
    try {
        const data = await apiCall(`/products?page=${page}&limit=10`);
        console.log('Products loaded:', data);
        displayProducts(data.data);
        displayPagination(data.pagination);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-table').innerHTML = 
            '<p class="p-6 text-red-500">Lỗi tải dữ liệu: ' + error.message + '</p>';
    }
}

function displayProducts(products) {
    const table = document.getElementById('products-table');
    
    if (products.length === 0) {
        table.innerHTML = '<p class="p-6 text-gray-500">Không có sản phẩm nào</p>';
        return;
    }

    table.innerHTML = `
        <table class="min-w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thương hiệu</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${products.map(product => `
                    <tr>
                        <td class="px-6 py-4">${product.san_pham_id}</td>
                        <td class="px-6 py-4">${product.ten_san_pham}</td>
                        <td class="px-6 py-4">${product.ten_danh_muc}</td>
                        <td class="px-6 py-4">${formatCurrency(product.gia_ban)}</td>
                        <td class="px-6 py-4">${product.so_luong_ton}</td>
                        <td class="px-6 py-4">
                            <button onclick="editProduct(${product.san_pham_id})" class="text-blue-600 hover:underline mr-3">Sửa</button>
                            <button onclick="deleteProduct(${product.san_pham_id})" class="text-red-600 hover:underline">Xóa</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function displayPagination(pagination) {
    const container = document.getElementById('pagination');
    if (pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
    container.innerHTML = pages.map(page => `
        <button onclick="loadProducts(${page})" 
                class="px-4 py-2 rounded ${page == currentPage ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}">
            ${page}
        </button>
    `).join('');
}

// Show add modal
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Thêm sản phẩm';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal').classList.remove('hidden');
}

// Edit product
async function editProduct(id) {
    try {
        const data = await apiCall(`/products/${id}`);
        const product = data.data;
        
        document.getElementById('modal-title').textContent = 'Sửa sản phẩm';
        document.getElementById('product-id').value = product.san_pham_id;
        document.getElementById('ten_san_pham').value = product.ten_san_pham;
        document.getElementById('danh_muc_id').value = product.danh_muc_id;
        document.getElementById('gia_ban').value = product.gia_ban;
        document.getElementById('so_luong_ton').value = product.so_luong_ton;
        document.getElementById('dung_tich').value = product.dung_tich || '';
        document.getElementById('mo_ta').value = product.mo_ta || '';
        document.getElementById('url_hinh_anh_chinh').value = product.url_hinh_anh_chinh || '';
        
        // Show current image
        if (product.url_hinh_anh_chinh) {
            document.getElementById('image-preview').innerHTML = `
                <img src="http://localhost:3001${product.url_hinh_anh_chinh}" class="w-32 h-32 object-cover rounded border">
            `;
        }
        
        document.getElementById('product-modal').classList.remove('hidden');
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
        await apiCall(`/products/${id}`, 'DELETE');
        alert('Xóa thành công!');
        loadProducts(currentPage);
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

// Handle image upload
document.getElementById('image-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        e.target.value = '';
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh (JPG, PNG, GIF)');
        e.target.value = '';
        return;
    }

    const formData = new FormData();
    formData.append('image', file);
    // Không cần folder parameter, sử dụng thư mục image gốc

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/upload/image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            document.getElementById('url_hinh_anh_chinh').value = data.imageUrl;
            document.getElementById('image-preview').innerHTML = `
                <div class="relative">
                    <img src="http://localhost:3001${data.imageUrl}" class="w-32 h-32 object-cover rounded border">
                    <button type="button" onclick="removeImage()" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                        ×
                    </button>
                </div>
            `;
            alert('Upload ảnh thành công!');
        } else {
            alert('Lỗi upload: ' + data.message);
        }
    } catch (error) {
        alert('Lỗi upload ảnh: ' + error.message);
    }
});

// Remove image
function removeImage() {
    document.getElementById('url_hinh_anh_chinh').value = '';
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('image-upload').value = '';
}

// Submit form
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const formData = {
        ten_san_pham: document.getElementById('ten_san_pham').value,
        danh_muc_id: parseInt(document.getElementById('danh_muc_id').value),
        gia_ban: parseFloat(document.getElementById('gia_ban').value),
        so_luong_ton: parseInt(document.getElementById('so_luong_ton').value),
        dung_tich: document.getElementById('dung_tich').value,
        mo_ta: document.getElementById('mo_ta').value,
        url_hinh_anh_chinh: document.getElementById('url_hinh_anh_chinh').value
    };

    try {
        if (productId) {
            // Update
            await apiCall(`/products/${productId}`, 'PUT', formData);
            alert('Cập nhật thành công!');
        } else {
            // Create
            await apiCall('/products', 'POST', formData);
            alert('Thêm sản phẩm thành công!');
        }
        
        closeModal();
        loadProducts(currentPage);
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
});

// Initialize
loadCategories();
loadProducts();
