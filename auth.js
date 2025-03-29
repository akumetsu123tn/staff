// Form validation and submission handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const resetPasswordForm = document.getElementById('reset-password-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }

    // Handle social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', handleSocialLogin);
    });

    // Check for email verification token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const verificationToken = urlParams.get('token');
    if (verificationToken) {
        verifyEmail(verificationToken);
    }

    // Check for password reset token in URL
    const resetToken = urlParams.get('reset-token');
    if (resetToken) {
        validateResetToken(resetToken);
    }
});

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('input[name="remember"]').checked;

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, remember }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            // Check if email is verified
            if (!data.emailVerified) {
                showMessage('error', 'Please verify your email before logging in.');
                return;
            }

            // Show success message
            showMessage('success', 'Login successful! Redirecting...');
            
            // Redirect based on user role
            setTimeout(() => {
                if (data.role === 'Admin' || data.role === 'Manager' || data.role === 'Artist') {
                    window.location.href = '/dashboard.html';
                } else {
                    window.location.href = '/';
                }
            }, 1500);
        } else {
            // Show error message
            showMessage('error', data.message || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const username = form.querySelector('#username').value;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('error', 'Passwords do not match');
        return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showMessage('error', 'Password does not meet strength requirements');
        return;
    }

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Show success message
            showMessage('success', 'Registration successful! Please check your email to verify your account.');
            
            // Redirect to login page after 3 seconds
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 3000);
        } else {
            // Show error message
            showMessage('error', data.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    } finally {
        // Reset button state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Handle forgot password form submission
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const email = form.querySelector('#email').value;

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('success', 'Password reset link has been sent to your email.');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            showMessage('error', data.message || 'Failed to send reset link. Please try again.');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Handle reset password form submission
async function handleResetPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('error', 'Passwords do not match');
        return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        showMessage('error', 'Password does not meet strength requirements');
        return;
    }

    // Get reset token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('reset-token');

    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password, resetToken })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('success', 'Password has been reset successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            showMessage('error', data.message || 'Failed to reset password. Please try again.');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
    }
}

// Verify email
async function verifyEmail(token) {
    try {
        const response = await fetch('/api/auth/verify-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('success', 'Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            showMessage('error', data.message || 'Email verification failed. Please try again.');
        }
    } catch (error) {
        console.error('Email verification error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    }
}

// Validate reset token
async function validateResetToken(token) {
    try {
        const response = await fetch('/api/auth/validate-reset-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage('error', data.message || 'Invalid or expired reset token.');
            setTimeout(() => {
                window.location.href = '/forgot-password.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Token validation error:', error);
        showMessage('error', 'An error occurred. Please try again.');
    }
}

// Handle social login
async function handleSocialLogin(e) {
    e.preventDefault();
    
    const button = e.target.closest('.btn-social');
    const provider = button.classList.contains('btn-google') ? 'google' : 'facebook';
    
    // Redirect to social login endpoint
    window.location.href = `/api/auth/${provider}`;
}

// Show message helper function
function showMessage(type, message) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.success-message, .error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message element
    const messageElement = document.createElement('div');
    messageElement.className = `${type}-message`;
    messageElement.textContent = message;

    // Insert message at the top of the form
    const form = document.querySelector('.auth-form');
    form.insertBefore(messageElement, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Password strength validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [
        password.length >= minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
    ].filter(Boolean).length;

    return {
        isValid: strength >= 4,
        strength: strength
    };
}

// Add password strength indicator to register form
const passwordInput = document.querySelector('#password');
if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        const validation = validatePassword(password);
        
        // Update password field styling based on strength
        passwordInput.classList.remove('weak', 'medium', 'strong');
        if (validation.strength <= 2) {
            passwordInput.classList.add('weak');
        } else if (validation.strength <= 3) {
            passwordInput.classList.add('medium');
        } else {
            passwordInput.classList.add('strong');
        }
    });
} 