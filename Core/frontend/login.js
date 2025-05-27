document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    try {
        const response = await fetch('/api/core/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('jwtToken', data.token);
        successMessage.textContent = 'Login successful! Redirecting...';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        errorMessage.textContent = error.message || 'An error occurred';
        errorMessage.style.display = 'block';
    }
});

// Clear messages after 3 seconds
document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    if (errorMessage.textContent) {
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }
    
    if (successMessage.textContent) {
        setTimeout(() => {
            successMessage.textContent = '';
        }, 3000);
    }
});