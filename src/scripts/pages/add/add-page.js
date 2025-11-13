import { addStory } from '../../data/api';
import { validateForm } from '../../utils/index';
import syncHelper from '../../utils/sync-helper';

export default class AddPage {
  async render() {
    return `
      <section class="container">
        <h1>Add New Story</h1>
        <h2>Share Your Story</h2>
        <form id="add-form">
          <label for="name">Title:</label>
          <input type="text" id="name" required aria-describedby="name-error">
          <span id="name-error" class="error" role="alert"></span>

          <label for="description">Description:</label>
          <textarea id="description" required aria-describedby="desc-error"></textarea>
          <span id="desc-error" class="error" role="alert"></span>

          <label for="photo">Photo:</label>
          <input type="file" id="photo" accept="image/*" required aria-describedby="photo-error">
          <button type="button" id="camera-btn">Use Camera</button>
          <span id="photo-error" class="error" role="alert"></span>

          <h3>Select Location</h3>
          <p>Drag the marker to set location:</p>
          <div id="map" style="height: 200px;" role="img" aria-label="Map to select location"></div>

          <label for="latitude">Latitude:</label>
          <input type="number" id="latitude" disabled value="-6.175389">

          <label for="longitude">Longitude:</label>
          <input type="number" id="longitude" disabled value="106.827139">

          <button type="submit">Submit</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add story!');
      location.hash = '#/auth';
      return;
    }

    let lat = -6.175389, lon = 106.827139;
    const map = L.map('map').setView([lat, lon], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    const marker = L.marker([lat, lon], { draggable: true }).addTo(map);

    marker.on('dragend', (event) => {
      const { lat: newLat, lng: newLon } = event.target.getLatLng();
      lat = newLat;
      lon = newLon;
      document.getElementById('latitude').value = lat;
      document.getElementById('longitude').value = lon;
    });

    map.on('click', (event) => {
      marker.setLatLng(event.latlng);
      lat = event.latlng.lat;
      lon = event.latlng.lng;
      document.getElementById('latitude').value = lat;
      document.getElementById('longitude').value = lon;
      map.flyTo(event.latlng);
    });

    const form = document.getElementById('add-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();
      const photo = document.getElementById('photo').files[0];

      if (!validateForm({ name, description, photo })) return;

      const submitButton = form.querySelector('button[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = 'Uploading...';

      try {
        if (!navigator.onLine) {
          const reader = new FileReader();
          reader.readAsDataURL(photo);
          reader.onload = async () => {
            await syncHelper.saveForLaterSync({
              name,
              description,
              photo: reader.result,
              lat,
              lon
            });
            alert('Offline mode: Story will be uploaded when connection returns');
            location.hash = '#/home';
          };
        } else {
          await addStory({ name, description, photo, lat, lon });
          
          await this.#sendPushNotification(name);
          
          alert('Story added successfully!');
          location.hash = '#/home';
        }
      } catch (error) {
        console.error('Error adding story:', error);
        alert('Error: ' + error.message);
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
      }
    });

    document.getElementById('camera-btn').addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          gap: 20px;
        `;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.style.cssText = `
          width: 90%;
          max-width: 400px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
          display: flex;
          gap: 15px;
        `;

        const captureBtn = document.createElement('button');
        captureBtn.textContent = '📸 Capture';
        captureBtn.style.cssText = `
          padding: 15px 30px;
          font-size: 1rem;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '❌ Cancel';
        cancelBtn.style.cssText = `
          padding: 15px 30px;
          font-size: 1rem;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        `;

        buttonContainer.appendChild(captureBtn);
        buttonContainer.appendChild(cancelBtn);
        modal.appendChild(video);
        modal.appendChild(buttonContainer);
        document.body.appendChild(modal);

        captureBtn.addEventListener('click', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d').drawImage(video, 0, 0);
          canvas.toBlob((blob) => {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            const dt = new DataTransfer();
            dt.items.add(file);
            document.getElementById('photo').files = dt.files;
            alert('📸 Image captured successfully!');
          });
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        });

        cancelBtn.addEventListener('click', () => {
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        });
      } catch (err) {
        console.error('Camera error:', err);
        alert('Camera access denied or not available: ' + err.message);
      }
    });
  }

  async #sendPushNotification(storyName) {
    try {
      if (!('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      if (Notification.permission !== 'granted') {
        console.log('Notification permission not granted');
        return;
      }

      await registration.showNotification('🎉 Story Added!', {
        body: `Your story "${storyName}" has been published successfully!`,
        icon: '/favicon.png',
        badge: '/favicon.png',
        vibrate: [200, 100, 200],
        tag: 'story-added',
        requireInteraction: false,
        actions: [
          { action: 'view', title: '👀 View Story', icon: '/favicon.png' },
          { action: 'close', title: '✅ OK', icon: '/favicon.png' }
        ],
        data: {
          url: '/#/home',
          timestamp: Date.now(),
          type: 'story-added'
        }
      });

      console.log('✅ Push notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }
}