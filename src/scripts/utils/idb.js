import { openDB } from 'idb';

const dbPromise = openDB('storymap-db', 1, {
  upgrade(db) {
    db.createObjectStore('stories', { keyPath: 'id' });
  }
});

export async function saveStory(story) {
  const db = await dbPromise;
  await db.put('stories', story);
}

export async function getStories() {
  const db = await dbPromise;
  return await db.getAll('stories');
}

export async function deleteStory(id) {
  const db = await dbPromise;
  await db.delete('stories', id);
}

export async function syncStories() {
  const offlineStories = await getStories();
  for (const story of offlineStories) {
    try {
      await fetch('/stories', { method: 'POST', body: JSON.stringify(story) });
      await deleteStory(story.id);
    } catch (e) {
      console.error('Sync failed', e);
    }
  }
}