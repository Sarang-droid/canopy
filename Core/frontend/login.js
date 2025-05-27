document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    
    // Clear messages after 3 seconds
    if (errorMessage.textContent) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
    
    if (successMessage.textContent) {
        successMessage.textContent = '';
    }

    // Set up form submission handler
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        
        try {
            // Clear previous messages
            errorMessage.style.display = 'none';
            successMessage.textContent = '';
            
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
            
            // Clear success message after redirect
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            errorMessage.textContent = error.message || 'Login failed';
            errorMessage.style.display = 'block';
            
            // Clear error message after 3 seconds
            setTimeout(() => {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });
});