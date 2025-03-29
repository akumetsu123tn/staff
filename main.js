// Auth and User Management
let currentUser = null;

function login(username) {
    currentUser = {
        username: username,
        credits: 10, // Starting credits
        lastLogin: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
}

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const creditsDisplay = document.getElementById('user-credits');
    const creditsCount = document.getElementById('credits-count');

    if (currentUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        creditsDisplay.classList.remove('hidden');
        creditsCount.textContent = currentUser.credits;
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        creditsDisplay.classList.add('hidden');
    }
}

function checkSession() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        updateAuthUI();
    }
}

// Initialize auth
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    
    // Setup auth event listeners
    document.getElementById('login-btn').addEventListener('click', () => {
        const username = prompt('Enter your username:');
        if (username) login(username);
    });

    document.getElementById('logout-btn').addEventListener('click', logout);
});

// Sample manga data
const mangaData = [
    {
        title: "Lightning Degree",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.8,
        chapters: 120,
        genre: ["Action", "Martial Arts"],
        status: "Ongoing"
    },
    {
        title: "Naruto",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.9,
        chapters: 700,
        genre: ["Action", "Adventure"],
        status: "Completed"
    },
    {
        title: "One Piece",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.95,
        chapters: 1100,
        genre: ["Action", "Adventure"],
        status: "Ongoing"
    },
    {
        title: "Demon Slayer",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.7,
        chapters: 205,
        genre: ["Action", "Supernatural"],
        status: "Completed"
    },
    {
        title: "Jujutsu Kaisen",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.85,
        chapters: 220,
        genre: ["Action", "Supernatural"],
        status: "Ongoing"
    },
    {
        title: "Attack on Titan",
        cover: "https://via.placeholder.com/200x300",
        rating: 4.9,
        chapters: 139,
        genre: ["Action", "Drama"],
        status: "Completed"
    }
];

// Render manga cards
function renderManga(mangas = mangaData) {
    const grid = document.querySelector('.grid');
    grid.innerHTML = mangas.map(manga => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img src="${manga.cover}" alt="${manga.title}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2">${manga.title}</h3>
                <div class="flex flex-wrap gap-1 mb-2">
                    ${manga.genre.map(g => `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">${g}</span>`).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-yellow-500">
                        ${'★'.repeat(Math.floor(manga.rating))}${'☆'.repeat(5-Math.floor(manga.rating))}
                    </span>
                    <span class="text-sm text-gray-600">${manga.chapters} ch</span>
                </div>
                <div class="mt-2">
                    <span class="text-xs ${manga.status === 'Ongoing' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'} px-2 py-1 rounded">
                        ${manga.status}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// Search functionality
function setupSearch() {
    const searchInput = document.querySelector('input[type="text"]');
    const searchButton = document.querySelector('button');
    
    const handleSearch = () => {
        const query = searchInput.value.toLowerCase();
        const filtered = mangaData.filter(manga => 
            manga.title.toLowerCase().includes(query) ||
            manga.genre.some(g => g.toLowerCase().includes(query))
        );
        renderManga(filtered);
    };

    searchInput.addEventListener('keyup', handleSearch);
    searchButton.addEventListener('click', handleSearch);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    renderManga();
    setupSearch();
});
