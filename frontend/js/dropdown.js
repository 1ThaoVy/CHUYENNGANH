// Dropdown functionality for user menu

// Toggle user dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('user-dropdown');
    const button = e.target.closest('button[onclick="toggleUserDropdown()"]');
    
    if (dropdown && !button && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});

// Close dropdown when pressing Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
});