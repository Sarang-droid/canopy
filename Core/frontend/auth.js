// Authentication state management
let isAuthenticated = false;

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/register.html';
        return false;
    }
    isAuthenticated = true;
    return true;
}

// Handle logout
function logout() {
    localStorage.removeItem('authToken');
    isAuthenticated = false;
    window.location.href = '/register.html';
}

// Export authentication status check
export { checkAuth, logout };
