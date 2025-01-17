const API_KEY = '3509d72a79df1cd55f8a34e9eee8a951';
const BASE_URL = 'https://api.mediastack.com/v1/';  // Changed to HTTPS
const ARTICLES_PER_PAGE = 12;

let currentPage = 1;
let currentQuery = '';
let currentCategory = '';
let currentCountry = '';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const countrySelect = document.getElementById('countrySelect');
const searchBtn = document.getElementById('searchBtn');
const newsContainer = document.getElementById('newsContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const toggleFavoritesBtn = document.getElementById('toggleFavorites');
const favoritesDrawer = document.getElementById('favorites');
const favoritesList = document.getElementById('favoritesList');

// Event Listeners
searchBtn.addEventListener('click', () => {
    currentPage = 1;
    newsContainer.innerHTML = '';
    fetchNews();
});

loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    fetchNews();
});

toggleFavoritesBtn.addEventListener('click', () => {
    favoritesDrawer.classList.toggle('active');
});

// Fetch News Function for Mediastack
async function fetchNews() {
    currentQuery = searchInput.value;
    currentCategory = categorySelect.value;
    currentCountry = countrySelect.value;

    let params = new URLSearchParams({
        access_key: API_KEY,
        limit: ARTICLES_PER_PAGE,
        offset: (currentPage - 1) * ARTICLES_PER_PAGE,
        sources: 'en' // Added English sources filter
    });

    if (currentQuery) params.append('keywords', currentQuery);
    if (currentCategory) params.append('categories', currentCategory);
    if (currentCountry) params.append('countries', currentCountry);

    try {
        const response = await fetch(`${BASE_URL}news?${params}`);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
            displayNews(data.data);
            loadMoreBtn.style.display = data.data.length < ARTICLES_PER_PAGE ? 'none' : 'block';
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = `<p class="error">Error loading news. Please try again later.</p>`;
    }
}

function displayNews(articles) {
    articles.forEach(article => {
        const card = createNewsCard(article);
        newsContainer.appendChild(card);
    });
}

function createNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';

    const isFavorite = favorites.some(fav => fav.title === article.title);

    card.innerHTML = `
        <img src="${article.image || 'https://via.placeholder.com/400x200?text=No+Image'}" 
             alt="${article.title}" 
             class="news-image" 
             onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'"
        >
        <div class="news-content">
            <h3 class="news-title">${article.title}</h3>
            <p class="news-description">${article.description || ''}</p>
            <div class="news-meta">
                <span>${new Date(article.published_at).toLocaleDateString()}</span>
                <a href="${article.url}" target="_blank" class="read-more">Read More</a>
                <button class="bookmark-btn" data-title="${article.title}">
                    <i class="fas fa-bookmark ${isFavorite ? 'active' : ''}"></i>
                </button>
            </div>
        </div>
    `;

    const bookmarkBtn = card.querySelector('.bookmark-btn');
    bookmarkBtn.addEventListener('click', () => toggleFavorite(article));

    return card;
}

function toggleFavorite(article) {
    const index = favorites.findIndex(fav => fav.title === article.title);

    if (index === -1) {
        favorites.push(article);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesList();
    updateBookmarkButtons();
}

function updateFavoritesList() {
    favoritesList.innerHTML = '';

    favorites.forEach(article => {
        const favoriteItem = document.createElement('div');
        favoriteItem.className = 'favorite-item';
        favoriteItem.innerHTML = `
            <h4>${article.title}</h4>
            <button class="bookmark-btn" data-title="${article.title}">
                <i class="fas fa-times"></i>
            </button>
        `;

        favoriteItem.querySelector('.bookmark-btn').addEventListener('click', () => toggleFavorite(article));
        favoritesList.appendChild(favoriteItem);
    });
}

function updateBookmarkButtons() {
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
        const title = btn.dataset.title;
        const isFavorite = favorites.some(fav => fav.title === title);
        const icon = btn.querySelector('i');
        icon.className = `fas fa-bookmark ${isFavorite ? 'active' : ''}`;
    });
}

// Initial Load
fetchNews();
updateFavoritesList();