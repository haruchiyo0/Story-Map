import '../styles/styles.css';
import App from './pages/app';
import { registerServiceWorker } from './utils/index';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await registerServiceWorker();
  if (!location.hash) {
    const token = localStorage.getItem('token');
    location.hash = token ? '#/home' : '#/auth';
  }
  await app.renderPage();
  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });
});