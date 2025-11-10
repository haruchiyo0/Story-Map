import { getStories, deleteStory } from '../../utils/idb.js';

export default class FavoritePage {
  async render() {
    return `
      <section class="container">
        <h1>Favorite Stories</h1>
        <ul id="favorite-list"></ul>
      </section>
    `;
  }

  async afterRender() {
    const stories = await getStories();
    const list = document.getElementById('favorite-list');
    list.innerHTML = stories.map(story => `
      <li>
        <h4>${story.name}</h4>
        <p>${story.description}</p>
        <button class="delete-btn" data-id="${story.id}">Delete</button>
      </li>
    `).join('');

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        await deleteStory(e.target.dataset.id);
        location.reload();
      });
    });
  }
}