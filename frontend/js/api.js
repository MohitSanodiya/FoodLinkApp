const API_URL = 'https://foodlinkapp.onrender.com/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    // 401 means token missing/expired -> clear session and send user to login.
    // 403 can also happen for role/status restrictions; do not force logout on that.
    if (response.status === 401) {
        if (!window.location.href.includes('login.html') && !window.location.href.includes('register.html')) {
            logout();
        }
        throw new Error('Unauthorized');
    }
    if (response.status === 403) {
        const err = await response.text();
        throw new Error(err || 'Forbidden');
    }

    if (!response.ok) {
        const err = await response.text();
        throw new Error(err || 'Request failed');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    } else {
        return response.text();
    }
}