import Database from '../../utils/idb';
import { initMap, addMarkers } from '../../utils/index';

export default class FavoritePage {
  #allStories = [];
  #filteredStories = [];
  #currentSort = 'createdAt';
  #currentOrder = 'desc';

  async render() {
    return `
      <section class="container">
        <h1>Favorite Stories</h1>
        <p>Your saved stories for offline access</p>
        
        <!-- Filter & Sort Controls -->
        <div class="filter-controls" style="margin: 20px 0; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
          <input 
            type="text" 
            id="search-favorites" 
            placeholder="Search favorites..." 
            style="flex: 1; min-width: 200px; max-width: 400px;"
            aria-label="Search favorite stories"
          >
          
          <select id="sort-by" style="padding: 12px; border-radius: 8px;" aria-label="Sort by">
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <select id="sort-order" style="padding: 12px; border-radius: 8px;" aria-label="Sort order">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          
          <button id="clear-all" style="background: #e74c3c; padding: 12px 20px;" aria-label="Clear all favorites">
            Clear All
          </button>
        </div>

        <!-- Stats -->
        <div id="favorite-stats" style="text-align: center; margin: 20px 0; color: #555;">
          Loading...
        </div>

        <!-- Map View -->
        <div id="map" style="height: 300px; margin: 20px 0; border-radius: 10px;"></div>

        <!-- Stories List -->
        <div id="favorite-list-container">
          <div id="loading-indicator" style="text-align: center; padding: 40px;">
            <p>Loading your favorites...</p>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to view favorites!');
      location.hash = '#/auth';
      return;
    }

    await this.#loadStories();
    this.#setupEventListeners();
    this.#renderStats();
  }

  async #loadStories() {
    try {
      this.#allStories = await Database.getAllStories();
      this.#filteredStories = [...this.#allStories];
      await this.#renderStories();
      this.#initializeMap();
    } catch (error) {
      console.error('Error loading stories:', error);
      this.#showError('Failed to load favorites');
    }
  }

  #initializeMap() {
    if (this.#filteredStories.length > 0) {
      try {
        initMap('map', this.#filteredStories);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
  }

  async #renderStories() {
    const container = document.getElementById('favorite-list-container');
    
    if (this.#filteredStories.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p style="font-size: 1.2rem; color: #666;">
            ${this.#allStories.length === 0 
              ? 'No favorite stories yet. Go to Home to save some!' 
              : 'No stories match your search.'}
          </p>
        </div>
      `;
      return;
    }

    const storiesHTML = this.#filteredStories.map(story => `
      <li data-story-id="${story.id}">
        <img 
          src="${story.photoUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
          alt="${story.name} story image" 
          onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'"
          loading="lazy"
        >
        <h4>${story.name || 'Untitled Story'}</h4>
        <p>${story.description || 'No description'}</p>
        <small>${new Date(story.createdAt).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</small>
        <div style="margin-top: 10px; display: flex; gap: 10px;">
          <button 
            class="delete-btn" 
            data-id="${story.id}"
            style="flex: 1; background: #e74c3c;"
            aria-label="Delete ${story.name}"
          >
            Delete
          </button>
          <button 
            class="view-location-btn" 
            data-lat="${story.lat}" 
            data-lon="${story.lon}"
            style="flex: 1; background: #3498db;"
            aria-label="View ${story.name} on map"
          >
            View on Map
          </button>
        </div>
      </li>
    `).join('');

    container.innerHTML = `
      <ul id="favorite-list" style="list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
        ${storiesHTML}
      </ul>
    `;

    this.#attachStoryEventListeners();
  }

  #attachStoryEventListeners() {
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const story = this.#allStories.find(s => s.id === id);
        
        if (confirm(`Delete "${story?.name || 'this story'}" from favorites?`)) {
          await this.#deleteStory(id);
        }
      });
    });

    // View location buttons
    document.querySelectorAll('.view-location-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lat = parseFloat(e.target.dataset.lat);
        const lon = parseFloat(e.target.dataset.lon);
        
        // Scroll to map and focus on location
        const mapElement = document.getElementById('map');
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // You can add more map interaction here if needed
        console.log('Viewing location:', { lat, lon });
      });
    });
  }

  async #deleteStory(id) {
    try {
      await Database.deleteStory(id);
      
      // Update local arrays
      this.#allStories = this.#allStories.filter(s => s.id !== id);
      this.#filteredStories = this.#filteredStories.filter(s => s.id !== id);
      
      // Re-render
      await this.#renderStories();
      this.#renderStats();
      this.#initializeMap();
      
      this.#showSuccess('Story removed from favorites');
    } catch (error) {
      console.error('Error deleting story:', error);
      this.#showError('Failed to delete story');
    }
  }

  #setupEventListeners() {
    // Search
    const searchInput = document.getElementById('search-favorites');
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      await this.#applyFilters(query);
    });

    // Sort by
    const sortBySelect = document.getElementById('sort-by');
    sortBySelect.addEventListener('change', async (e) => {
      this.#currentSort = e.target.value;
      
      // Update order options based on sort type
      const orderSelect = document.getElementById('sort-order');
      if (this.#currentSort === 'name') {
        orderSelect.innerHTML = `
          <option value="asc">A to Z</option>
          <option value="desc">Z to A</option>
        `;
      } else {
        orderSelect.innerHTML = `
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        `;
      }
      orderSelect.value = this.#currentOrder;
      
      await this.#applySort();
    });

    // Sort order
    const sortOrderSelect = document.getElementById('sort-order');
    sortOrderSelect.addEventListener('change', async (e) => {
      this.#currentOrder = e.target.value;
      await this.#applySort();
    });

    // Clear all
    const clearAllBtn = document.getElementById('clear-all');
    clearAllBtn.addEventListener('click', async () => {
      if (this.#allStories.length === 0) {
        alert('No favorites to clear');
        return;
      }
      
      if (confirm(`Clear all ${this.#allStories.length} favorite stories?`)) {
        await this.#clearAllFavorites();
      }
    });
  }

  async #applyFilters(query = '') {
    try {
      if (!query) {
        this.#filteredStories = [...this.#allStories];
      } else {
        this.#filteredStories = await Database.searchStories(query);
      }
      
      await this.#applySort();
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  async #applySort() {
    try {
      // Sort the filtered stories
      this.#filteredStories = this.#filteredStories.sort((a, b) => {
        let aVal = a[this.#currentSort];
        let bVal = b[this.#currentSort];
        
        if (this.#currentSort === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (this.#currentOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      await this.#renderStories();
      this.#initializeMap();
    } catch (error) {
      console.error('Error sorting:', error);
    }
  }

  async #clearAllFavorites() {
    try {
      // Delete all stories one by one
      for (const story of this.#allStories) {
        await Database.deleteStory(story.id);
      }
      
      this.#allStories = [];
      this.#filteredStories = [];
      
      await this.#renderStories();
      this.#renderStats();
      
      this.#showSuccess('All favorites cleared');
    } catch (error) {
      console.error('Error clearing favorites:', error);
      this.#showError('Failed to clear favorites');
    }
  }

  async #renderStats() {
    try {
      const count = await Database.getStoriesCount();
      const pendingCount = await Database.getPendingCount();
      
      const statsElement = document.getElementById('favorite-stats');
      statsElement.innerHTML = `
        <p style="font-size: 1.1rem;">
          📚 <strong>${count}</strong> favorite ${count === 1 ? 'story' : 'stories'}
          ${pendingCount > 0 ? `| 📤 <strong>${pendingCount}</strong> pending sync` : ''}
        </p>
        ${this.#filteredStories.length !== count ? 
          `<p style="color: #3498db;">Showing ${this.#filteredStories.length} of ${count}</p>` : 
          ''}
      `;
    } catch (error) {
      console.error('Error rendering stats:', error);
    }
  }

  #showSuccess(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  #showError(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}