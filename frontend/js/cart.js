// Cart management
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.san_pham_id === product.san_pham_id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    saveCart(cart);
    alert('Đã thêm vào giỏ hàng!');
}

function removeFromCart(san_pham_id) {
    const cart = getCart().filter(item => item.san_pham_id !== san_pham_id);
    saveCart(cart);
}

function updateQuantity(san_pham_id, quantity) {
    if (quantity <= 0) {
        removeFromCart(san_pham_id);
        return;
    }

    const cart = getCart().map(item => 
        item.san_pham_id === san_pham_id ? { ...item, quantity } : item
    );
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    return getCart().reduce((total, item) => 
        total + parseFloat(item.gia_ban) * item.quantity, 0
    );
}

function getCartCount() {
    return getCart().reduce((count, item) => count + item.quantity, 0);
}

function updateCartCount() {
    const count = getCartCount();
    const cartCountEl = document.getElementById('cart-count');
    
    if (cartCountEl) {
        if (count > 0) {
            cartCountEl.textContent = count;
            cartCountEl.classList.remove('hidden');
        } else {
            cartCountEl.classList.add('hidden');
        }
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);
