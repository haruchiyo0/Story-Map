import { openDB } from 'idb';

const DATABASE_NAME = 'storymap';
const DATABASE_VERSION = 1;
const STORIES_STORE = 'saved-stories';
const PENDING_STORE = 'pending-stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(STORIES_STORE)) {
      const storyStore = database.createObjectStore(STORIES_STORE, {
        keyPath: 'id',
      });
      storyStore.createIndex('name', 'name', { unique: false });
      storyStore.createIndex('createdAt', 'createdAt', { unique: false });
    }

    if (!database.objectStoreNames.contains(PENDING_STORE)) {
      database.createObjectStore(PENDING_STORE, {
        keyPath: 'tempId',
        autoIncrement: true
      });
    }
  },
});

const Database = {
  async saveStory(story) {
    if (!story || !story.id) {
      throw new Error('Story must have an id');
    }
    return (await dbPromise).put(STORIES_STORE, story);
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error('id is required');
    }
    return (await dbPromise).get(STORIES_STORE, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(STORIES_STORE);
  },

  async deleteStory(id) {
    if (!id) {
      throw new Error('id is required');
    }
    return (await dbPromise).delete(STORIES_STORE, id);
  },

  async searchStories(query) {
    const allStories = await this.getAllStories();
    if (!query) return allStories;
    
    const lowerQuery = query.toLowerCase();
    return allStories.filter(story => 
      story.name?.toLowerCase().includes(lowerQuery) ||
      story.description?.toLowerCase().includes(lowerQuery)
    );
  },

  async sortStories(sortBy = 'createdAt', order = 'desc') {
    const stories = await this.getAllStories();
    
    return stories.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  },

  async filterStoriesByDate(startDate, endDate) {
    const allStories = await this.getAllStories();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return allStories.filter(story => {
      const storyDate = new Date(story.createdAt).getTime();
      return storyDate >= start && storyDate <= end;
    });
  },

  async savePendingStory(storyData) {
    const pendingStory = {
      ...storyData,
      timestamp: Date.now(),
      synced: false
    };
    const db = await dbPromise;
    return await db.add(PENDING_STORE, pendingStory);
  },

  async getAllPendingStories() {
    return (await dbPromise).getAll(PENDING_STORE);
  },

  async deletePendingStory(tempId) {
    return (await dbPromise).delete(PENDING_STORE, tempId);
  },

  async clearAllPendingStories() {
    const db = await dbPromise;
    const tx = db.transaction(PENDING_STORE, 'readwrite');
    await tx.objectStore(PENDING_STORE).clear();
    await tx.done;
  },

  
  async getStoriesCount() {
    const db = await dbPromise;
    return await db.count(STORIES_STORE);
  },

  async getPendingCount() {
    const db = await dbPromise;
    return await db.count(PENDING_STORE);
  }
};

export default Database;
export const saveStory = Database.saveStory.bind(Database);