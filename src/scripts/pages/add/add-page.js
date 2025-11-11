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

    // === Map setup ===
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

    // === Submit form ===
    const form = document.getElementById('add-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const description = document.getElementById('description').value.trim();
      const photo = document.getElementById('photo').files[0];

      if (!validateForm({ name, description, photo })) return;

      try {
        if (!navigator.onLine) {
          // === OFFLINE MODE ===
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
          // === ONLINE MODE ===
          await addStory({ name, description, photo, lat, lon });
          alert('Story added successfully!');

          // === Trigger push notification ===
          if ('serviceWorker' in navigator) {
            const reg = await navigator.serviceWorker.getRegistration();
            if (reg) {
              reg.showNotification('Story Added', {
                body: 'Your story has been added successfully!',
                icon: '/icon-192x192.png'
              });
            }
          }

          location.hash = '#/home';
        }
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });

    // === Camera Feature ===
    document.getElementById('camera-btn').addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '1000';

        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.style.width = '300px';
        video.style.height = '200px';

        const captureBtn = document.createElement('button');
        captureBtn.textContent = 'Capture';
        captureBtn.style.marginTop = '10px';

        modal.appendChild(video);
        modal.appendChild(captureBtn);
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
            alert('Image captured!');
          });
          stream.getTracks().forEach(track => track.stop());
          document.body.removeChild(modal);
        });
      } catch (err) {
        alert('Camera access denied: ' + err.message);
      }
    });
  }
}
