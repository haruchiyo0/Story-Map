import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils/index';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let app;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('App initializing...');
  
  app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await registerServiceWorker();

  if (!location.hash || location.hash === '#/') {
    const token = localStorage.getItem('token');
    location.hash = token ? '#/home' : '#/auth';
  }

  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    console.log('Hash changed to:', location.hash);
    await app.renderPage();
  });

  console.log('App initialized successfully');
});