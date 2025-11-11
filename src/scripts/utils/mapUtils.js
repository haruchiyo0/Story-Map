import L from "leaflet";
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import markerShadowPng from 'leaflet/dist/images/marker-shadow.png';

let map,
  markers = [];

export function initMap(containerId, stories) {
  map = L.map(containerId).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "© Esri",
    },
  );

  L.control
    .layers({
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ),
      Satellite: satellite,
    })
    .addTo(map);

  addMarkers(stories);
}

export function addMarkers(stories) {
  stories.forEach((story) => {
    const marker = L.marker([story.lat, story.lon]).addTo(map);
    marker.bindPopup(`
      <div style="width: 200px;">
        <img src="${story.photoUrl}" alt="${story.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px;">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
      </div>
    `);
    markers.push({ marker, story });
  });
}

export function filterMarkers(query) {
  markers.forEach(({ marker, story }) => {
    if (story.name.toLowerCase().includes(query.toLowerCase())) {
      map.addLayer(marker);
    } else {
      map.removeLayer(marker);
    }
  });
}

export function initMapForLocation(containerId, callback) {
  const map = L.map(containerId).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  map.on("click", (e) => {
    console.log("Map clicked:", e.latlng);
    callback(e.latlng.lat, e.latlng.lng);
  });
}
