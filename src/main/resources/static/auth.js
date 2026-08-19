// ================================
// FakeShield Authentication
// ================================

const API_URL = window.location.origin;

// ================================
// Utility Functions
// ================================

function showMessage(type, text) {
    const message = document.getElementById('message');
    message.className = 'message ' + type;
    message.textContent = text;
    setTimeout(() => {
        message.className = 'message';
    }, 5000);
}

function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    field.type = field.type === 'password' ? 'text' : 'password';
}

function setLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');

    if (isLoading) {
        btn.disabled = true;
        text.style.display = 'none';
        loader.style.display = 'inline';
    } else {
        btn.disabled = false;
        text.style.display = 'inline';
        loader.style.display = 'none';
    }
}

// ================================
// Save/Load Token
// ================================

function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
        id: data.userId,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: data.role
    }));
}

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

function isLoggedIn() {
    return !!getToken();
}

// ================================
// Login Handler
// ================================

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading('loginBtn', true);

        const data = {
            usernameOrEmail: document.getElementById('usernameOrEmail').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                saveAuth(result);
                showMessage('success', '✅ Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                showMessage('error', '❌ ' + (result.error || 'Login failed'));
                setLoading('loginBtn', false);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('error', '❌ Network error. Please try again.');
            setLoading('loginBtn', false);
        }
    });
}

// ================================
// Signup Handler
// ================================

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showMessage('error', '❌ Passwords do not match');
            return;
        }

        setLoading('signupBtn', true);

        const data = {
            fullName: document.getElementById('fullName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: password
        };

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                saveAuth(result);
                showMessage('success', '🎉 Account created! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                showMessage('error', '❌ ' + (result.error || 'Registration failed'));
                setLoading('signupBtn', false);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('error', '❌ Network error. Please try again.');
            setLoading('signupBtn', false);
        }
    });

    // Real-time username check
    const usernameInput = document.getElementById('username');
    let usernameTimeout;
    usernameInput.addEventListener('input', () => {
        clearTimeout(usernameTimeout);
        const hint = document.getElementById('usernameHint');
        const username = usernameInput.value;

        if (username.length < 3) {
            hint.textContent = '';
            hint.className = 'input-hint';
            return;
        }

        usernameTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/check-username?username=${username}`);
                const result = await response.json();

                if (result.available) {
                    hint.textContent = '✅ Username available';
                    hint.className = 'input-hint success';
                } else {
                    hint.textContent = '❌ Username already taken';
                    hint.className = 'input-hint error';
                }
            } catch (error) {
                console.error('Check error:', error);
            }
        }, 500);
    });

    // Real-time email check
    const emailInput = document.getElementById('email');
    let emailTimeout;
    emailInput.addEventListener('input', () => {
        clearTimeout(emailTimeout);
        const hint = document.getElementById('emailHint');
        const email = emailInput.value;

        if (!email.includes('@')) {
            hint.textContent = '';
            hint.className = 'input-hint';
            return;
        }

        emailTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`${API_URL}/api/user/check-email?email=${email}`);
                const result = await response.json();

                if (result.available) {
                    hint.textContent = '✅ Email available';
                    hint.className = 'input-hint success';
                } else {
                    hint.textContent = '❌ Email already registered';
                    hint.className = 'input-hint error';
                }
            } catch (error) {
                console.error('Check error:', error);
            }
        }, 500);
    });

    // Password strength meter
    const passwordInput = document.getElementById('password');
    const strengthMeter = document.getElementById('passwordStrength');

    // Create strength bars
    strengthMeter.innerHTML = '<div class="bar"></div><div class="bar"></div><div class="bar"></div>';

    passwordInput.addEventListener('input', () => {
        const pw = passwordInput.value;
        let strength = 0;

        if (pw.length >= 6) strength++;
        if (pw.length >= 10 && /[A-Z]/.test(pw)) strength++;
        if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) strength++;

        strengthMeter.className = 'password-strength';
        if (strength === 1) strengthMeter.classList.add('weak');
        if (strength === 2) strengthMeter.classList.add('medium');
        if (strength >= 3) strengthMeter.classList.add('strong');
    });

    // Password match check
    const confirmInput = document.getElementById('confirmPassword');
    confirmInput.addEventListener('input', () => {
        const hint = document.getElementById('passwordMatchHint');
        const pw = passwordInput.value;
        const confirm = confirmInput.value;

        if (confirm.length === 0) {
            hint.textContent = '';
            hint.className = 'input-hint';
        } else if (pw === confirm) {
            hint.textContent = '✅ Passwords match';
            hint.className = 'input-hint success';
        } else {
            hint.textContent = '❌ Passwords don\'t match';
            hint.className = 'input-hint error';
        }
    });
}

// ================================
// Guest Mode
// ================================

function continueAsGuest() {
    window.location.href = '/';
}

// ================================
// Auto-redirect if already logged in
// ================================

if (window.location.pathname === '/login.html' || window.location.pathname === '/signup.html') {
    if (isLoggedIn()) {
        window.location.href = '/';
    }
}