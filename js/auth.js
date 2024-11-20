class Auth {
    constructor() {
        this.maxAttempts = 3;
        this.attempts = 0;
        this.initialize();
    }

    initialize() {
        // Clear any existing data for fresh start
        this.resetSystem();

        // Initialize default users and admin
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    nim: 'admin',
                    password: 'admin123',
                    name: 'Lab Administrator',
                    department: 'Teknik Industri',
                    role: 'admin'
                },
                {
                    nim: '21120122140166',
                    password: 'kikipoiu',
                    name: 'Gratia Andrea Sam',
                    department: 'Teknik Komputer',
                    role: 'user'
                },
                {
                    nim: '21070122120032',
                    password: 'password123',
                    name: 'Arya Haitami Sofyan',
                    department: 'Teknik Industri',
                    role: 'user'
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // Ensure admin always exists
        this.ensureAdminExists();

        // Add event listeners
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        const resetBtn = document.getElementById('resetStorage');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForms('register');
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleForms('login');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset the system? This will clear all data.')) {
                    this.resetSystem();
                    location.reload();
                }
            });
        }

        // Check auth status
        this.checkAuthStatus();
    }

    ensureAdminExists() {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const adminExists = users.some(user => user.role === 'admin');
        
        if (!adminExists) {
            users.push({
                nim: 'admin',
                password: 'admin123',
                name: 'Lab Administrator',
                department: 'Teknik Industri',
                role: 'admin'
            });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    resetSystem() {
        const defaultUsers = [
            {
                nim: 'admin',
                password: 'admin123',
                name: 'Lab Administrator',
                department: 'Teknik Industri',
                role: 'admin'
            },
            {
                nim: '21070122120019',
                password: 'password123',
                name: 'Gratia Andrea Sam',
                department: 'Teknik Industri',
                role: 'user'
            },
            {
                nim: '21070122120032',
                password: 'password123',
                name: 'Arya Haitami Sofyan',
                department: 'Teknik Industri',
                role: 'user'
            }
        ];
        
        localStorage.clear();
        localStorage.setItem('users', JSON.stringify(defaultUsers));
        this.attempts = 0;
        this.hideError();
    }

    checkAuthStatus() {
        const currentUser = localStorage.getItem('currentUser');
        const currentPath = window.location.pathname;

        if (currentUser) {
            const user = JSON.parse(currentUser);
            if (currentPath.includes('index.html')) {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }
        } else {
            if (!currentPath.includes('index.html')) {
                window.location.href = 'index.html';
            }
        }
    }

    toggleForms(show) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginToggle = document.getElementById('loginToggle');
        const registerToggle = document.getElementById('registerToggle');
        const welcomeText = document.getElementById('welcomeText');
        const welcomeDescription = document.getElementById('welcomeDescription');
        
        if (show === 'register') {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            loginToggle.classList.add('hidden');
            registerToggle.classList.remove('hidden');
            welcomeText.textContent = 'Welcome!';
            welcomeDescription.textContent = 'Create your account to access the laboratory system';
        } else {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            loginToggle.classList.remove('hidden');
            registerToggle.classList.add('hidden');
            welcomeText.textContent = 'Welcome Back!';
            welcomeDescription.textContent = 'Enter your NIM to access the laboratory management system';
        }

        this.hideError();
    }

    handleLogin(e) {
        e.preventDefault();
        const nim = document.getElementById('nim').value;
        const password = document.getElementById('password').value;

        if (this.attempts >= this.maxAttempts) {
            this.showError('Too many failed attempts. Please reset the system to try again.');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.nim === nim && u.password === password);

        if (user) {
            this.attempts = 0;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('lastLoginTime', new Date().toISOString());
            
            if (user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        } else {
            this.attempts++;
            const remainingAttempts = this.maxAttempts - this.attempts;
            
            if (remainingAttempts > 0) {
                this.showError(`Invalid NIM or password. ${remainingAttempts} attempts remaining.`);
            } else {
                this.showError('Too many failed attempts. Please reset the system to try again.');
            }
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const nim = document.getElementById('regNim').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;
        const department = document.getElementById('regDepartment').value;

        // Validation
        if (!name || !nim || !password || !passwordConfirm || !department) {
            this.showError('All fields are required');
            return;
        }

        if (password !== passwordConfirm) {
            this.showError('Passwords do not match');
            return;
        }

        if (nim.length !== 14 && nim !== 'admin') {
            this.showError('NIM must be 14 digits');
            return;
        }

        // Get existing users
        let users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if NIM already exists
        if (users.some(user => user.nim === nim)) {
            this.showError('NIM already registered');
            return;
        }

        // Add new user
        const newUser = {
            name: name,  // Using input name
            nim: nim,
            password: password,
            department: department,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.showSuccess('Registration successful! Please login.');

        setTimeout(() => {
            this.toggleForms('login');
            document.getElementById('registerForm').reset();
        }, 1500);
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.remove('bg-green-100', 'border-green-500', 'text-green-700');
        errorMessage.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
    }

    showSuccess(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        errorMessage.classList.remove('bg-red-100', 'border-red-500', 'text-red-700');
        errorMessage.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
    }

    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    static logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastLoginTime');
        window.location.href = 'index.html';
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static isAdmin() {
        const currentUser = this.getCurrentUser();
        return currentUser && currentUser.role === 'admin';
    }

    static checkPermission() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return false;
        }

        const currentPath = window.location.pathname;
        if (currentPath.includes('admin.html') && currentUser.role !== 'admin') {
            window.location.href = 'dashboard.html';
            return false;
        }
        return true;
    }
}

// Initialize Auth when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});