// Load featured manga
async function loadFeaturedManga() {
    try {
        const response = await fetch('/api/manga/featured');
        const mangaList = await response.json();
        
        const featuredContainer = document.getElementById('featured-manga');
        featuredContainer.innerHTML = mangaList.map(manga => `
            <div class="manga-card">
                <img src="${manga.coverImageURL}" alt="${manga.title}">
                <div class="manga-info">
                    <h3>${manga.title}</h3>
                    <p>Rating: ${manga.rating}/5</p>
                    <p>Views: ${manga.totalViews}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load featured manga:', error);
    }
}

// Load popular manga
async function loadPopularManga() {
    try {
        const response = await fetch('/api/manga/popular');
        const mangaList = await response.json();
        
        const popularContainer = document.getElementById('popular-manga');
        popularContainer.innerHTML = mangaList.map(manga => `
            <div class="manga-card">
                <img src="${manga.coverImageURL}" alt="${manga.title}">
                <div class="manga-info">
                    <h3>${manga.title}</h3>
                    <p>Rating: ${manga.rating}/5</p>
                    <p>Views: ${manga.totalViews}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load popular manga:', error);
    }
}

// Load latest chapters
async function loadLatestChapters() {
    try {
        const response = await fetch('/api/chapters/latest');
        const chapterList = await response.json();
        
        const latestContainer = document.getElementById('latest-chapters');
        latestContainer.innerHTML = chapterList.map(chapter => `
            <div class="chapter-item">
                <div class="chapter-info">
                    <h3>${chapter.mangaTitle}</h3>
                    <p>Chapter ${chapter.chapterNumber}: ${chapter.title}</p>
                    <p>Views: ${chapter.views}</p>
                </div>
                <a href="/manga/${chapter.mangaID}/chapter/${chapter.chapterID}" class="btn-primary">Read</a>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load latest chapters:', error);
    }
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const categoryContainer = document.getElementById('category-list');
        categoryContainer.innerHTML = categories.map(category => `
            <a href="/category/${category.id}" class="category-item">
                ${category.name}
            </a>
        `).join('');

        // Also update footer categories
        const footerCategories = document.getElementById('footer-categories');
        footerCategories.innerHTML = categories.map(category => `
            <li><a href="/category/${category.id}">${category.name}</a></li>
        `).join('');
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Handle navigation
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Handle login/register buttons
function handleAuthButtons() {
    const loginBtn = document.querySelector('.btn-login');
    const registerBtn = document.querySelector('.btn-register');
    
    loginBtn.addEventListener('click', () => {
        window.location.href = '/login.html';
    });
    
    registerBtn.addEventListener('click', () => {
        window.location.href = '/register.html';
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedManga();
    loadPopularManga();
    loadLatestChapters();
    loadCategories();
    handleNavigation();
    handleAuthButtons();
}); 