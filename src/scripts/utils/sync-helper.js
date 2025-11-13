import Database from './idb';
import { addStory } from '../data/api';

class SyncHelper {
  #isSyncing = false;
  #syncListeners = [];

  constructor() {
    this.#setupEventListeners();
  }

  #setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Back online - triggering sync');
      this.#showOnlineNotification();
      this.syncPendingStories();
    });

    window.addEventListener('offline', () => {
      console.log('📡 Offline mode activated');
      this.#showOfflineNotification();
    });

    if (!navigator.onLine) {
      this.#showOfflineNotification();
    }
  }

  async saveForLaterSync(storyData) {
    try {
      const tempId = await Database.savePendingStory(storyData);
      console.log('📦 Story saved for later sync:', tempId);
      
      this.#notifyListeners({
        type: 'pending-added',
        data: { tempId, storyData }
      });
      
      return { success: true, tempId, offline: true };
    } catch (error) {
      console.error('Error saving for sync:', error);
      throw error;
    }
  }

  async syncPendingStories() {
    if (this.#isSyncing) {
      console.log('⏳ Sync already in progress');
      return { success: false, message: 'Sync already in progress' };
    }

    if (!navigator.onLine) {
      console.log('📡 Cannot sync - offline');
      return { success: false, message: 'Device is offline' };
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('🔒 Cannot sync - not logged in');
      return { success: false, message: 'User not logged in' };
    }

    this.#isSyncing = true;
    this.#notifyListeners({ type: 'sync-started' });

    try {
      const pendingStories = await Database.getAllPendingStories();
      
      if (pendingStories.length === 0) {
        console.log('✅ No stories to sync');
        this.#isSyncing = false;
        return { success: true, synced: 0, message: 'No stories to sync' };
      }

      console.log(`🔄 Syncing ${pendingStories.length} pending stories...`);
      
      const results = {
        total: pendingStories.length,
        success: 0,
        failed: 0,
        errors: []
      };

      for (const pendingStory of pendingStories) {
        try {
          const photoFile = this.#base64ToFile(
            pendingStory.photo,
            'story-photo.jpg'
          );

          await addStory({
            name: pendingStory.name,
            description: pendingStory.description,
            photo: photoFile,
            lat: pendingStory.lat,
            lon: pendingStory.lon
          });

          await Database.deletePendingStory(pendingStory.tempId);
          
          results.success++;
          console.log(`✅ Synced story ${results.success}/${results.total}`);
          
          this.#notifyListeners({
            type: 'story-synced',
            data: { 
              tempId: pendingStory.tempId,
              progress: { current: results.success, total: results.total }
            }
          });

        } catch (error) {
          results.failed++;
          results.errors.push({
            tempId: pendingStory.tempId,
            error: error.message
          });
          console.error(`❌ Failed to sync story:`, error);
        }
      }

      this.#isSyncing = false;
      
      const finalResult = {
        success: results.failed === 0,
        synced: results.success,
        failed: results.failed,
        total: results.total,
        message: `Synced ${results.success}/${results.total} stories`
      };

      this.#notifyListeners({
        type: 'sync-completed',
        data: finalResult
      });

      if (results.success > 0) {
        this.#showSyncNotification(finalResult);
      }

      return finalResult;

    } catch (error) {
      this.#isSyncing = false;
      console.error('❌ Sync failed:', error);
      
      this.#notifyListeners({
        type: 'sync-failed',
        data: { error: error.message }
      });
      
      return { 
        success: false, 
        message: 'Sync failed: ' + error.message 
      };
    }
  }

  async getPendingCount() {
    return await Database.getPendingCount();
  }

  async getPendingStories() {
    return await Database.getAllPendingStories();
  }

  async clearPendingStories() {
    await Database.clearAllPendingStories();
    this.#notifyListeners({ type: 'pending-cleared' });
  }

  isSyncing() {
    return this.#isSyncing;
  }

  isOnline() {
    return navigator.onLine;
  }

  onSyncEvent(callback) {
    this.#syncListeners.push(callback);
    return () => {
      this.#syncListeners = this.#syncListeners.filter(cb => cb !== callback);
    };
  }

  #notifyListeners(event) {
    this.#syncListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Sync listener error:', error);
      }
    });
  }

  #base64ToFile(base64String, filename) {
    if (base64String instanceof File) {
      return base64String;
    }

    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  }

  #showOnlineNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #27ae60, #2ecc71);
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
      z-index: 10000;
      font-weight: bold;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = '🌐 Back online!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  #showOfflineNotification() {
    const existingIndicator = document.getElementById('offline-indicator');
    if (existingIndicator) return;

    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      padding: 12px;
      text-align: center;
      z-index: 10000;
      font-weight: bold;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    indicator.innerHTML = '📡 You are offline - Changes will sync when connection returns';
    document.body.appendChild(indicator);

    const removeIndicator = () => {
      indicator.remove();
      window.removeEventListener('online', removeIndicator);
    };
    window.addEventListener('online', removeIndicator);
  }

  async #showSyncNotification(result) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
      z-index: 10000;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <strong>✅ Sync Complete</strong><br>
      <span style="font-size: 0.9rem;">
        ${result.synced} of ${result.total} stories synced
        ${result.failed > 0 ? `<br>${result.failed} failed` : ''}
      </span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

const syncHelper = new SyncHelper();

export default syncHelper;