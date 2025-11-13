import { getStories } from '../../data/api';
import { initMap, filterMarkers } from '../../utils/index';
import Database from '../../utils/idb';

export default class HomePage {
  async render() {
    return `
      <section class="container">
        <h1>Story Map</h1>
        <h2>Explore Stories</h2>
        <input type="text" id="search" placeholder="Search stories..." aria-label="Search stories">
        <div id="map" style="height: 400px;" role="img" aria-label="Interactive map of stories"></div>
        <h3>Story List</h3>
        <ul id="story-list" aria-label="List of stories"></ul>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      location.hash = '#/auth';
      return;
    }

    try {
      const stories = await getStories();
      const storyList = document.getElementById('story-list');
      
      if (stories.length === 0) {
        storyList.innerHTML = '<li>No stories available.</li>';
        return;
      }

      const savedStories = await Database.getAllStories();
      const savedIds = new Set(savedStories.map(s => s.id));

      storyList.innerHTML = stories.map(story => `
        <li>
          <img 
            src="${story.photoUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" 
            alt="${story.name} story image" 
            onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'"
            loading="lazy"
          >
          <h4>${story.name}</h4>
          <p>${story.description}</p>
          <small>${new Date(story.createdAt).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</small>
          <button 
            class="favorite-btn ${savedIds.has(story.id) ? 'active' : ''}" 
            data-id="${story.id}"
            aria-label="${savedIds.has(story.id) ? 'Remove from favorites' : 'Add to favorites'}"
          >
            ${savedIds.has(story.id) ? '❤️ Saved' : '🤍 Save'}
          </button>
        </li>
      `).join('');

      initMap('map', stories);

      document.getElementById('search').addEventListener('input', (e) => {
        filterMarkers(e.target.value);
      });

      document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const button = e.target;
          const id = button.dataset.id;
          const story = stories.find(s => s.id === id);
          
          if (!story) return;

          try {
            const isActive = button.classList.contains('active');
            
            if (isActive) {
              await Database.deleteStory(id);
              button.classList.remove('active');
              button.textContent = '🤍 Save';
              button.setAttribute('aria-label', 'Add to favorites');
              this.#showToast('❌ Removed from favorites', 'error');
            } else {
              await Database.saveStory(story);
              button.classList.add('active');
              button.textContent = '❤️ Saved';
              button.setAttribute('aria-label', 'Remove from favorites');
              this.#showToast('✅ Saved to favorites!', 'success');
            }
          } catch (error) {
            console.error('Error toggling favorite:', error);
            this.#showToast('⚠️ Error: ' + error.message, 'error');
          }
        });
      });

    } catch (error) {
      console.error('Error loading stories:', error);
      alert('Error loading stories: ' + error.message);
    }
  }

  #showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}