import { getStories } from '../../data/api';
import { initMap, addMarkers, filterMarkers } from '../../utils/index';
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
      } else {
        storyList.innerHTML = stories.map(story => `
          <li>
            <img src="${story.photoUrl || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${story.name} story image" onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'">
            <h4>${story.name}</h4>
            <p>${story.description}</p>
            <small>${new Date(story.createdAt).toLocaleDateString()}</small>
            <button class="favorite-btn" data-id="${story.id}">Favorite</button>
          </li>
        `).join('');
        initMap('map', stories);
        document.getElementById('search').addEventListener('input', (e) => {
          filterMarkers(e.target.value);
        });
        document.querySelectorAll('.favorite-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            const story = stories.find(s => s.id === id);
            await saveStory(story);
            alert('Story saved offline');
          });
        });
      }
    } catch (error) {
      alert('Error loading stories: ' + error.message);
    }
  }
}