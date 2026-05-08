const API_URL = 'https://foodlinkapp.onrender.com/api';

function getStoredItem(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
}

function getToken() {
    return getStoredItem('token');
}

function getUser() {
    const userStr = getStoredItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (err) {
            console.warn('Stored user session is invalid, falling back to token claims.');
        }
    }

    const token = getToken();
    return token ? getUserFromToken(token) : null;
}

function setAuth(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

function getUserFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return {
            email: payload.sub,
            role: (payload.role || '').replace('ROLE_', ''),
            name: payload.sub || 'User'
        };
    } catch (err) {
        return null;
    }
}

function requireRole(allowedRoles) {
    const token = getToken();
    const user = getUser();
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!token || !user || !roles.includes(user.role)) {
        window.location.replace('login.html');
        return null;
    }

    return user;
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
