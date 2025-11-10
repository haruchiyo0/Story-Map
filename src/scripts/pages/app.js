import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { isServiceWorkerAvailable } from "../utils/index";
import { isCurrentPushSubscriptionAvailable, subscribe, unsubscribe } from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#setupDrawer();
    this.#setupInstallPrompt();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });
    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.createElement('button');
      installBtn.textContent = 'Install App';
      installBtn.style.position = 'fixed';
      installBtn.style.bottom = '20px';
      installBtn.style.right = '20px';
      installBtn.addEventListener('click', () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          deferredPrompt = null;
          installBtn.remove();
        });
      });
      document.body.appendChild(installBtn);
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];
    const token = localStorage.getItem("token");
    const navList = document.getElementById("nav-list");
    if (token) {
      navList.innerHTML = `
        <li><a href="#/home">Home</a></li>
        <li><a href="#/add">Add Story</a></li>
        <li><a href="#/favorite">Favorite</a></li>
        <li><a href="#/" id="logout">Logout</a></li>
      `;
      setTimeout(() => {
        document.getElementById("logout").addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("token");
          alert("Logout berhasil!");
          location.hash = "#/auth";
        });
      }, 0);
    } else {
      navList.innerHTML = `
        <li><a href="#/home" id="home-link">Home</a></li>
        <li><a href="#/add" id="add-link">Add Story</a></li>
        <li><a href="#/auth">Login</a></li>
      `;
      setTimeout(() => {
        document.getElementById("home-link").addEventListener("click", (e) => {
          e.preventDefault();
          alert("Silakan login dulu!");
          location.hash = "#/auth";
        });
        document.getElementById("add-link").addEventListener("click", (e) => {
          e.preventDefault();
          alert("Silakan login dulu!");
          location.hash = "#/auth";
        });
      }, 0);
    }
    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification();
        }
      });
    } else {
      this.#content.style.opacity = "0";
      setTimeout(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification();
        }
        this.#content.style.opacity = "1";
      }, 300);
    }
  }

  async #setupPushNotification() {
    setTimeout(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('Service worker not ready, retrying...');
        setTimeout(() => this.#setupPushNotification(), 2000);
        return;
      }
      const isSubscribed = await isCurrentPushSubscriptionAvailable();
      if (isSubscribed) {
        const unsubscribeBtn = document.createElement('button');
        unsubscribeBtn.textContent = 'Unsubscribe Notification';
        unsubscribeBtn.addEventListener('click', () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
        document.body.appendChild(unsubscribeBtn);
      } else {
        const subscribeBtn = document.createElement('button');
        subscribeBtn.textContent = 'Subscribe Notification';
        subscribeBtn.addEventListener('click', () => {
          subscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
        document.body.appendChild(subscribeBtn);
      }
    }, 2000);
  }
}

export default App;