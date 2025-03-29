// Check authentication and role
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = '/login.html';
            return;
        }

        const data = await response.json();
        const userRole = data.role;

        // Show/hide admin sections based on role
        const adminSections = document.querySelectorAll('.admin-only');
        adminSections.forEach(section => {
            section.style.display = userRole === 'Admin' ? 'block' : 'none';
        });

        // Update staff info
        document.getElementById('staff-name').textContent = data.username;
        document.getElementById('staff-role').textContent = data.role;

        // Load dashboard data
        loadDashboardData();
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/login.html';
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load overview stats
        const statsResponse = await fetch('/api/dashboard/stats');
        const stats = await statsResponse.json();
        
        document.getElementById('total-manga').textContent = stats.totalManga;
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-views').textContent = stats.totalViews;
        document.getElementById('recent-updates').textContent = stats.recentUpdates;

        // Load manga list
        loadMangaList();
        
        // Load chapter list
        loadChapterList();
        
        // Load user list (admin only)
        if (document.querySelector('.admin-only').style.display !== 'none') {
            loadUserList();
            loadStaffList();
        }

        // Load analytics
        loadAnalytics();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    }
}

// Load manga list
async function loadMangaList() {
    try {
        const response = await fetch('/api/manga');
        const mangaList = await response.json();
        
        const mangaListContainer = document.querySelector('.manga-list');
        mangaListContainer.innerHTML = mangaList.map(manga => `
            <div class="manga-item">
                <img src="${manga.coverImageURL}" alt="${manga.title}">
                <div class="manga-info">
                    <h3>${manga.title}</h3>
                    <p>Status: ${manga.status}</p>
                    <p>Views: ${manga.totalViews}</p>
                </div>
                <div class="manga-actions">
                    <button onclick="editManga(${manga.mangaID})" class="btn-edit">Edit</button>
                    <button onclick="deleteManga(${manga.mangaID})" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load manga list:', error);
    }
}

// Load chapter list
async function loadChapterList() {
    try {
        const response = await fetch('/api/chapters');
        const chapterList = await response.json();
        
        const chapterListContainer = document.querySelector('.chapter-list');
        chapterListContainer.innerHTML = chapterList.map(chapter => `
            <div class="chapter-item">
                <div class="chapter-info">
                    <h3>${chapter.title}</h3>
                    <p>Manga: ${chapter.mangaTitle}</p>
                    <p>Chapter: ${chapter.chapterNumber}</p>
                    <p>Views: ${chapter.views}</p>
                </div>
                <div class="chapter-actions">
                    <button onclick="editChapter(${chapter.chapterID})" class="btn-edit">Edit</button>
                    <button onclick="deleteChapter(${chapter.chapterID})" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load chapter list:', error);
    }
}

// Load user list (admin only)
async function loadUserList() {
    try {
        const response = await fetch('/api/users');
        const userList = await response.json();
        
        const userListContainer = document.querySelector('.user-list');
        userListContainer.innerHTML = userList.map(user => `
            <div class="user-item">
                <div class="user-info">
                    <h3>${user.username}</h3>
                    <p>Email: ${user.email}</p>
                    <p>Role: ${user.role}</p>
                    <p>Credits: ${user.credits}</p>
                </div>
                <div class="user-actions">
                    <button onclick="editUser(${user.userID})" class="btn-edit">Edit</button>
                    <button onclick="deleteUser(${user.userID})" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load user list:', error);
    }
}

// Load staff list (admin only)
async function loadStaffList() {
    try {
        const response = await fetch('/api/staff');
        const staffList = await response.json();
        
        const staffListContainer = document.querySelector('.staff-list');
        staffListContainer.innerHTML = staffList.map(staff => `
            <div class="staff-item">
                <div class="staff-info">
                    <h3>${staff.username}</h3>
                    <p>Email: ${staff.email}</p>
                    <p>Role: ${staff.role}</p>
                </div>
                <div class="staff-actions">
                    <button onclick="editStaff(${staff.userID})" class="btn-edit">Edit</button>
                    <button onclick="deleteStaff(${staff.userID})" class="btn-delete">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load staff list:', error);
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch('/api/dashboard/analytics');
        const analytics = await response.json();
        
        // Update popular manga chart
        updatePopularMangaChart(analytics.popularManga);
        
        // Update user growth chart
        updateUserGrowthChart(analytics.userGrowth);
    } catch (error) {
        console.error('Failed to load analytics:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    });

    // Add manga button
    document.getElementById('add-manga-btn').addEventListener('click', () => {
        // Implement add manga functionality
        console.log('Add manga clicked');
    });

    // Add chapter button
    document.getElementById('add-chapter-btn').addEventListener('click', () => {
        // Implement add chapter functionality
        console.log('Add chapter clicked');
    });

    // Add staff button
    document.getElementById('add-staff-btn').addEventListener('click', () => {
        // Implement add staff functionality
        console.log('Add staff clicked');
    });

    // Profile settings form
    document.getElementById('profile-settings-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        // Implement profile update functionality
        console.log('Profile settings submitted');
    });
}); 