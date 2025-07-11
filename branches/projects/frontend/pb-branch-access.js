document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('accessForm');
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.querySelector('.auth-button');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Validating...';

        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/projects/auth/branch-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Successful authentication
            window.location.href = '/branches/projects/frontend/pb.html';

        } catch (error) {
            // Show error message
            errorMessage.textContent = error.message || 'Authentication failed';
            errorMessage.style.display = 'block';
            
            // Re-enable button and reset text
            submitButton.disabled = false;
            submitButton.textContent = 'Access Project';
        }
    });

    // Reset form on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            form.reset();
            errorMessage.style.display = 'none';
            submitButton.disabled = false;
            submitButton.textContent = 'Access Project';
        }
    });
});