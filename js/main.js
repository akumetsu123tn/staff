// API configuration
const API_URL = 'http://localhost:3000/api';

// State management
let currentUser = null;
let mangaList = [];

// DOM Elements
const mangaGrid = document.querySelector('.grid');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userCredits = document.getElementById('user-credits');
const creditsCount = document.getElementById('credits-count');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadManga();
    checkAuthStatus();
});

loginBtn.addEventListener('click', showLoginModal);
logoutBtn.addEventListener('click', logout);

// Authentication Functions
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        currentUser = userData;
        updateAuthUI(true);
    } else {
        updateAuthUI(false);
    }
}

function updateAuthUI(isLoggedIn) {
    loginBtn.classList.toggle('hidden', isLoggedIn);
    logoutBtn.classList.toggle('hidden', !isLoggedIn);
    userCredits.classList.toggle('hidden', !isLoggedIn);
    if (isLoggedIn) {
        creditsCount.textContent = currentUser.credits;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) throw new Error('Login failed');

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        currentUser = data.user;
        updateAuthUI(true);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        return false;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    currentUser = null;
    updateAuthUI(false);
}

// Manga Functions
async function loadManga() {
    try {
        const response = await fetch(`${API_URL}/manga`);
        if (!response.ok) throw new Error('Failed to load manga');
        
        mangaList = await response.json();
        displayManga(mangaList);
    } catch (error) {
        console.error('Error loading manga:', error);
    }
}

function displayManga(manga) {
    mangaGrid.innerHTML = manga.map(manga => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <img src="${manga.CoverImageURL}" alt="${manga.Title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold mb-2">${manga.Title}</h3>
                <p class="text-gray-600 text-sm mb-2">${manga.Description.substring(0, 100)}...</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        <span>${manga.Rating}</span>
                    </div>
                    <span class="text-sm text-gray-500">${manga.TotalViews} views</span>
                </div>
                <div class="mt-2 flex flex-wrap gap-1">
                    ${manga.Tags.split(', ').map(tag => `
                        <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Modal Functions
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    modal.innerHTML = `
        <div class="bg-white p-6 rounded-lg w-96">
            <h2 class="text-2xl font-bold mb-4">Login</h2>
            <form id="login-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                </div>
                <div class="flex justify-end space-x-2">
                    <button type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200" onclick="this.closest('.fixed').remove()">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                        Login
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;
        const password = e.target.elements[1].value;

        if (await login(email, password)) {
            modal.remove();
        }
    });
} 