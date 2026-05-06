// Admin Dashboard JavaScript for FoodLink AI
const API_BASE_URL = 'https://foodlink-admin-backend.onrender.com/api/admin';
let currentRole = '';
let currentUserPage = 1;
let currentListingPage = 1;
let cachedListings = [];

// On Page Load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Admin Dashboard Initializing...');

    // Check if we can reach the backend at all
    const isBackendAlive = await pingBackend();
    if (!isBackendAlive) return;

    checkAdminAuth();
    setupNavigation();

    // Initial data fetch
    showLoader(true);
    await Promise.all([
        fetchStats(),
        fetchUsers(),
        fetchRecentActivity()
    ]);
    showLoader(false);
    console.log('Initialization complete.');
});

// Ping Backend to check connectivity
async function pingBackend() {
    const statusBadge = document.getElementById('connection-status');
    try {
        const response = await fetch('https://foodlink-admin-backend.onrender.com/health', { method: 'GET' });
        if (response.ok) {
            console.log('✅ Backend Health Check: OK');
            if (statusBadge) {
                statusBadge.classList.replace('bg-danger', 'bg-success');
                statusBadge.innerHTML = '<i class="fas fa-circle me-1 small"></i> Online';
            }
            return true;
        }
    } catch (err) {
        console.error('❌ Backend Unreachable:', err);
        if (statusBadge) {
            statusBadge.classList.replace('bg-success', 'bg-danger');
            statusBadge.innerHTML = '<i class="fas fa-circle me-1 small"></i> Offline';
        }
        Swal.fire({
            icon: 'error',
            title: 'Backend Unreachable',
            text: 'The Admin Backend is not responding. Please make sure the Node.js server is running.',
            footer: '<a href="https://foodlink-admin-backend.onrender.com/health" target="_blank">Try visiting health check</a>'
        });
        return false;
    }
    return false;
}

// Authentication Check
function checkAdminAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (user.role !== 'ADMIN') {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Admin privileges required.',
            confirmButtonText: 'Go to Login'
        }).then(() => { window.location.href = 'login.html'; });
        return;
    }

    // Set UI Info
    document.getElementById('admin-name').textContent = user.name || 'Admin User';
    document.getElementById('admin-initials').textContent = (user.name || 'A')[0].toUpperCase();
}

// Setup Sidebar Navigation
function setupNavigation() {
    const links = document.querySelectorAll('.nav-link[data-view]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = link.getAttribute('data-view');

            // UI Update
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // View Switching
            document.getElementById('view-dashboard').style.display = view === 'dashboard' ? 'block' : 'none';
            document.getElementById('view-users').style.display = view === 'users' ? 'block' : 'none';
            document.getElementById('view-listings').style.display = view === 'listings' ? 'block' : 'none';

            // Data Fetching
            if (view === 'users') fetchUsers();
            if (view === 'listings') fetchListings();
        });
    });
}

// Global Headers
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

// Loader
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

// ---- API CALLS ----

async function fetchStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats`, { headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const stats = await response.json();
        document.getElementById('stat-total-users').textContent = stats.totalUsers || 0;
        document.getElementById('stat-total-ngos').textContent = stats.totalNGOs || 0;
        if(document.getElementById('stat-total-gaushalas')) {
            document.getElementById('stat-total-gaushalas').textContent = stats.totalGaushalas || 0;
        }
        document.getElementById('stat-total-listings').textContent = stats.totalListings || 0;
        document.getElementById('stat-pending-ngos').textContent = stats.pendingUsers || 0;
    } catch (err) {
        console.error('Stats Error:', err);
    }
}

async function fetchUsers(page = 1) {
    currentUserPage = page;
    const searchInput = document.getElementById('user-search');
    const search = searchInput ? searchInput.value : '';

    try {
        const url = new URL(`${API_BASE_URL}/users`);
        url.searchParams.append('page', page);
        url.searchParams.append('limit', 10);
        if (currentRole) url.searchParams.append('role', currentRole);
        if (search) url.searchParams.append('search', search);

        const response = await fetch(url, { headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        renderUserTable(data.users);
        renderPagination('user-pagination', data.totalPages, data.currentPage, fetchUsers);
    } catch (err) {
        console.error('Fetch Users Error:', err);
        Swal.fire('Error', 'Failed to fetch users.', 'error');
    }
}

function renderUserTable(users) {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;

    tbody.innerHTML = users.length ? '' : '<tr><td colspan="5" class="text-center text-muted py-5">No users found.</td></tr>';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="d-flex align-items-center gap-3">
                    <div class="user-avatar">${(user.name || '?')[0].toUpperCase()}</div>
                    <div>
                        <div class="fw-bold">${user.name}</div>
                        <small class="text-muted">${user.email}</small>
                    </div>
                </div>
            </td>
            <td><span class="badge badge-role-${(user.role || '').toLowerCase()}">${user.role}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>
                ${user.isVerified ?
                '<span class="badge badge-verified"><i class="fas fa-check-circle me-1"></i>Yes</span>' :
                '<span class="badge badge-pending">No</span>'}
            </td>
            <td>
                <div class="d-flex gap-2">
                    ${user.role !== 'ADMIN' ? `
                    <button class="action-btn text-success" title="Approve/Verify" onclick="approveUser(${user.id})">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="action-btn text-warning" title="Suspend/Reject" onclick="showStatusModal(${user.id}, '${user.status}')">
                        <i class="fas fa-user-slash"></i>
                    </button>
                    <button class="action-btn text-danger" title="Delete" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                    ` : '<span class="text-muted small">Restricted</span>'}
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function fetchListings(page = 1) {
    currentListingPage = page;
    showLoader(true);
    try {
        const response = await fetch(`${API_BASE_URL}/listings?page=${page}&limit=10`, { headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        cachedListings = data.listings || [];
        renderListingsTable(cachedListings);
        renderPagination('listings-pagination', data.totalPages, data.currentPage, fetchListings);
    } catch (err) {
        console.error('Listings Error:', err);
    } finally {
        showLoader(false);
    }
}

function renderListingsTable(listings) {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;
    tbody.innerHTML = listings.length ? '' : '<tr><td colspan="6" class="text-center py-5">No listings found.</td></tr>';

    listings.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="fw-bold">${item.title}</div></td>
            <td><small>${item.location}</small></td>
            <td><span class="badge bg-light text-dark">${item.quantity || 0} kg</span></td>
            <td>
                <div class="small fw-bold">${item.creator?.name || 'Unknown User'}</div>
            </td>
            <td>
                <span class="badge badge-role-${(item.creator?.role || '').toLowerCase()} x-small">${item.creator?.role || 'N/A'}</span>
            </td>
            <td>
                <button class="action-btn text-info" title="View Details" onclick="showListingDetails(${item.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// USER MANAGEMENT ACTIONS
async function approveUser(userId) {
    const result = await Swal.fire({
        title: 'Approve User?',
        text: 'This will activate the user and mark them as verified.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2e7d32'
    });
    if (result.isConfirmed) {
        try {
            const resp = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
                method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status: 'ACTIVE' })
            });
            if (resp.ok) {
                Swal.fire('Activated!', 'Account is now verified and active.', 'success');
                fetchUsers(currentUserPage);
                fetchStats();
            }
        } catch (err) { Swal.fire('Error', 'Operation failed', 'error'); }
    }
}

async function deleteUser(userId) {
    const result = await Swal.fire({
        title: 'Confirm Delete',
        text: "Are you sure you want to remove this user?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33'
    });
    if (result.isConfirmed) {
        try {
            const resp = await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE', headers: getHeaders() });
            if (resp.ok) {
                Swal.fire('Deleted!', 'User removed successfully.', 'success');
                fetchUsers(currentUserPage);
                fetchStats();
            }
        } catch (err) { Swal.fire('Error', 'Delete failed', 'error'); }
    }
}

async function showStatusModal(userId, currentStatus) {
    const { value: status } = await Swal.fire({
        title: 'Manage Status',
        input: 'select',
        inputOptions: { 'PENDING': 'Pending Verification', 'SUSPENDED': 'Suspended', 'REJECTED': 'Rejected' },
        inputValue: currentStatus,
        showCancelButton: true,
        confirmButtonColor: '#f39c12'
    });
    if (status) {
        try {
            const resp = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
                method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status })
            });
            if (resp.ok) {
                Swal.fire('Updated!', `Status changed to ${status}.`, 'success');
                fetchUsers(currentUserPage);
            }
        } catch (err) { Swal.fire('Error', 'Update failed', 'error'); }
    }
}

function filterUsers(role) {
    currentRole = role === 'ALL' ? '' : role;
    fetchUsers(1);
    
    const buttons = document.querySelectorAll('#userTabs .nav-link');
    buttons.forEach(btn => {
        const btnText = btn.textContent.trim().toUpperCase();
        // Match GAUSHALA, NGO, DONORS (HOSTEL), ALL
        if (role === 'ALL' && btnText === 'ALL USERS') btn.classList.add('active');
        else if (role === 'NGO' && btnText === 'NGOS') btn.classList.add('active');
        else if (role === 'HOSTEL' && btnText === 'DONORS') btn.classList.add('active');
        else if (role === 'GAUSHALA' && btnText === "GAUSHALA'S") btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function renderPagination(containerId, totalPages, currentPage, callback) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm m-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${currentPage - 1})">Previous</a>
                </li>
    `;

    // Show at most 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${i})">${i}</a>
            </li>
        `;
    }

    html += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" onclick="event.preventDefault(); ${callback.name}(${currentPage + 1})">Next</a>
                </li>
            </ul>
        </nav>
    `;

    container.innerHTML = html;
}

// RECENT ACTIVITY FEED
async function fetchRecentActivity() {
    try {
        const response = await fetch(`${API_BASE_URL}/recent-activity`, { headers: getHeaders() });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        renderRecentActivity(data);
    } catch (err) {
        console.error('Recent Activity Error:', err);
        const container = document.getElementById('activity-feed');
        if (container) container.innerHTML = '<div class="text-center py-4 text-danger small">Failed to load activity feed</div>';
    }
}

function renderRecentActivity(activities) {
    const container = document.getElementById('activity-feed');
    if (!container) return;

    if (!activities.length) {
        container.innerHTML = '<div class="text-center py-5 text-muted small">No recent activity detected.</div>';
        return;
    }

    container.innerHTML = activities.map(act => {
        const isUser = act.type === 'USER';
        const icon = isUser ? 'fa-user-plus' : 'fa-box-open';
        const bgColor = isUser ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success';
        const statusClass = act.status === 'PENDING' ? 'text-warning' : 'text-success';

        return `
            <div class="activity-item d-flex align-items-center gap-3">
                <div class="activity-icon ${bgColor}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-center">
                        <strong class="small d-block">${act.title}</strong>
                        <span class="x-small ${statusClass} fw-bold">${act.status}</span>
                    </div>
                    <small class="text-muted x-small">${act.meta}</small>
                </div>
            </div>
        `;
    }).join('');
}

async function showListingDetails(listingId) {
    const listing = cachedListings.find(l => l.id === listingId);
    if (!listing) return;

    Swal.fire({
        title: `<span class="text-success">${listing.title}</span>`,
        html: `
            <div class="text-start mt-3">
                <div class="mb-3">
                    <small class="text-muted d-block mb-1"><i class="fas fa-align-left me-1"></i>Description:</small>
                    <p class="mb-0 border p-2 rounded-3 bg-light">${listing.description || 'No description provided.'}</p>
                </div>
                <div class="row g-3">
                    <div class="col-6">
                        <small class="text-muted d-block mb-1"><i class="fas fa-weight-hanging me-1"></i>Quantity:</small>
                        <div class="fw-bold">${listing.quantity || 0} kg</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted d-block mb-1"><i class="fas fa-map-marker-alt me-1"></i>Location:</small>
                        <div class="fw-bold">${listing.location || 'N/A'}</div>
                    </div>
                    <div class="col-12">
                        <small class="text-muted d-block mb-1"><i class="fas fa-user-circle me-1"></i>Posted By:</small>
                        <div class="p-2 border rounded-3 d-flex align-items-center gap-2">
                             <div class="badge badge-role-${(listing.creator?.role || 'hostel').toLowerCase()}">${listing.creator?.role || 'USER'}</div>
                             <span class="fw-bold">${listing.creator?.name || 'Unknown User'}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted d-block mb-1"><i class="fas fa-clock me-1"></i>Created At:</small>
                        <div>${new Date(listing.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="col-6">
                        <small class="text-muted d-block mb-1"><i class="fas fa-hourglass-end me-1"></i>Expiry:</small>
                        <div>${listing.expiry_time ? new Date(listing.expiry_time).toLocaleString() : 'N/A'}</div>
                    </div>
                </div>
            </div>
        `,
        width: '600px',
        confirmButtonText: 'Close',
        confirmButtonColor: '#2e7d32',
        showCloseButton: true,
        customClass: {
            container: 'listing-detail-swal'
        }
    });
}
