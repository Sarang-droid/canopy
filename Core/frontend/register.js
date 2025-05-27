// Helper function to generate secure password
function generatePassword() {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const department = document.getElementById('department').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');

    try {
        // Validate form data
        if (!name || name.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        if (!email || !email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
        if (!department) {
            throw new Error('Please select a department');
        }
        if (!role) {
            throw new Error('Please select a role');
        }

        // Ensure department is in the allowed list
        const allowedDepartments = ['Technical', 'Financial', 'Project', 'Legal', 'Compliance', 'Marketing', 'Canopy'];
        if (!allowedDepartments.includes(department)) {
            throw new Error('Invalid department selected');
        }

        const response = await fetch('/api/core/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name,
                email,
                department,
                role
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const data = await response.json();
        
        // Generate a secure password
        const password = generatePassword();
        
        // Store credentials in localStorage
        localStorage.setItem('registrationCredentials', JSON.stringify({
            userId: data.userId,
            password: password
        }));
        
        // Show credentials in a modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Registration Successful!</h2>
                <p>Your credentials have been generated:</p>
                <p><strong>User ID:</strong> ${data.userId}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please keep these credentials safe.</p>
                <button onclick="window.location.href='login.html'">Proceed to Login</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                window.location.href = 'login.html';
            }
        };
    } catch (error) {
        errorMessage.textContent = error.message || 'An error occurred';
        errorMessage.style.display = 'block';
        
        // Clear error message after 3 seconds
        setTimeout(() => {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }, 3000);
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

// Add modal styles
const style = document.createElement('style');
style.textContent = `
.modal {
    display: block;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: white;
    margin: 15% auto;
    padding: 2rem;
    border-radius: 10px;
    width: 80%;
    max-width: 500px;
    text-align: center;
}

.modal-content h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.modal-content button {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
}
`;
document.head.appendChild(style);