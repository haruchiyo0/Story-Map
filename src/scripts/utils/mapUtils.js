import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

let map = null;
let markers = [];

/**
 * Inisialisasi peta utama di halaman Home
 */
export function initMap(containerId, stories) {
  // Bersihkan map sebelumnya kalau ada
  if (map) {
    map.remove();
    map = null;
    markers = [];
  }

  // Cegah error leaflet ID nempel di DOM
  const container = L.DomUtil.get(containerId);
  if (container && container._leaflet_id) {
    container._leaflet_id = null;
  }

  // Inisialisasi map baru
  map = L.map(containerId).setView([0, 0], 2);

  // Tambahkan tile default (OpenStreetMap)
  const openStreet = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(map);

  // Tambahkan opsi tampilan satelit
  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "© Esri",
    }
  );

  // Tambahkan kontrol layer
  L.control
    .layers(
      {
        "OpenStreetMap": openStreet,
        "Satellite": satellite,
      },
      null,
      { collapsed: false }
    )
    .addTo(map);

  // Tambahkan marker dari data stories
  addMarkers(stories);
}

/**
 * Menambahkan marker dari daftar story
 */
export function addMarkers(stories) {
  if (!map) return;

  markers.forEach(({ marker }) => map.removeLayer(marker));
  markers = [];

  stories.forEach((story) => {
    if (!story.lat || !story.lon) return;

    const marker = L.marker([story.lat, story.lon], {
      icon: L.icon({
        iconUrl: markerIconPng,
        shadowUrl: markerShadowPng,
      }),
    }).addTo(map);

    marker.bindPopup(`
      <div style="width: 200px;">
        <img src="${story.photoUrl}" alt="${story.name}" 
          style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px;">
        <h3 style="margin: 5px 0;">${story.name}</h3>
        <p style="font-size: 0.9rem;">${story.description}</p>
      </div>
    `);

    markers.push({ marker, story });
  });
}

/**
 * Filter marker sesuai query pencarian
 */
export function filterMarkers(query) {
  if (!map) return;

  markers.forEach(({ marker, story }) => {
    const match = story.name.toLowerCase().includes(query.toLowerCase());
    if (match) {
      map.addLayer(marker);
    } else {
      map.removeLayer(marker);
    }
  });
}

/**
 * Inisialisasi peta untuk halaman tambah lokasi (Add Story)
 */
export function initMapForLocation(containerId, callback) {
  // Hapus map lama kalau ada
  if (map) {
    map.remove();
    map = null;
  }

  const container = L.DomUtil.get(containerId);
  if (container && container._leaflet_id) {
    container._leaflet_id = null;
  }

  const selectMap = L.map(containerId).setView([0, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }).addTo(selectMap);

  selectMap.on("click", (e) => {
    console.log("Map clicked:", e.latlng);
    callback(e.latlng.lat, e.latlng.lng);
  });
}
