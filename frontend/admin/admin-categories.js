// Admin categories management
let categories = [];

// Load categories
async function loadCategories() {
    try {
        console.log('Loading categories...');
        const data = await apiCall('/categories');
        categories = data.data;
        displayCategories(categories);
        console.log('Categories loaded:', categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categories-table').innerHTML = 
            '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Lỗi tải dữ liệu: ' + error.message + '</td></tr>';
    }
}

function displayCategories(categories) {
    const tbody = document.getElementById('categories-table');
    
    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Không có danh mục nào</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(category => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">${category.danh_muc_id}</td>
            <td class="px-6 py-4">${category.ten_danh_muc}</td>
            <td class="px-6 py-4 text-gray-500">${category.slug}</td>
            <td class="px-6 py-4 text-gray-500">${category.mo_ta || 'Không có mô tả'}</td>
            <td class="px-6 py-4 text-center">${category.so_luong_san_pham || 0}</td>
            <td class="px-6 py-4">
                <button onclick="editCategory(${category.danh_muc_id})" class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-edit"></i> Sửa
                </button>
                <button onclick="deleteCategory(${category.danh_muc_id})" class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </td>
        </tr>
    `).join('');
}

// Show add modal
function showAddModal() {
    document.getElementById('modal-title').textContent = 'Thêm Danh mục';
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal').classList.remove('hidden');
}

// Edit category
async function editCategory(id) {
    try {
        const category = categories.find(cat => cat.danh_muc_id === id);
        if (!category) {
            alert('Không tìm thấy danh mục');
            return;
        }
        
        document.getElementById('modal-title').textContent = 'Sửa Danh mục';
        document.getElementById('category-id').value = category.danh_muc_id;
        document.getElementById('ten_danh_muc').value = category.ten_danh_muc;
        document.getElementById('slug').value = category.slug;
        document.getElementById('mo_ta').value = category.mo_ta || '';
        
        document.getElementById('category-modal').classList.remove('hidden');
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Delete category
async function deleteCategory(id) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ bị ảnh hưởng.')) return;
    
    try {
        await apiCall(`/categories/${id}`, 'DELETE');
        alert('Xóa danh mục thành công!');
        loadCategories();
    } catch (error) {
        alert('Lỗi: ' + error.message);
    }
}

// Close modal
function closeModal() {
    document.getElementById('category-modal').classList.add('hidden');
}

// Generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

// Auto generate slug when typing name
document.addEventListener('DOMContentLoaded', function() {
    const tenDanhMucInput = document.getElementById('ten_danh_muc');
    if (tenDanhMucInput) {
        tenDanhMucInput.addEventListener('input', function() {
            const slug = generateSlug(this.value);
            document.getElementById('slug').value = slug;
        });
    }
});

// Submit form
document.addEventListener('DOMContentLoaded', function() {
    const categoryForm = document.getElementById('category-form');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const categoryId = document.getElementById('category-id').value;
            const formData = {
                ten_danh_muc: document.getElementById('ten_danh_muc').value,
                slug: document.getElementById('slug').value,
                mo_ta: document.getElementById('mo_ta').value
            };

            // Validation
            if (!formData.ten_danh_muc.trim()) {
                alert('Vui lòng nhập tên danh mục');
                return;
            }
            
            if (!formData.slug.trim()) {
                alert('Vui lòng nhập slug');
                return;
            }

            try {
                if (categoryId) {
                    // Update
                    await apiCall(`/categories/${categoryId}`, 'PUT', formData);
                    alert('Cập nhật danh mục thành công!');
                } else {
                    // Create
                    await apiCall('/categories', 'POST', formData);
                    alert('Thêm danh mục thành công!');
                }
                
                closeModal();
                loadCategories();
            } catch (error) {
                alert('Lỗi: ' + error.message);
            }
        });
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
});