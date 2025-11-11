import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import 'leaflet/dist/leaflet.css';
import { isServiceWorkerAvailable } from "../utils/index";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #notificationButton = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#setupDrawer();
    this.#setupInstallPrompt();
    this.#registerServiceWorker(); 
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

  // 🔧 Tambahan untuk register SW
  #registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => console.log("✅ Service Worker registered"))
          .catch((err) =>
            console.error("❌ SW registration failed:", err)
          );
      });
    }
  }

  #setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      if (document.getElementById("install-app-btn")) return;

      const installBtn = document.createElement("button");
      installBtn.id = "install-app-btn";
      installBtn.textContent = "📱 Install App";
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 25px;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
        z-index: 9999;
        transition: transform 0.2s;
      `;

      installBtn.addEventListener("mouseover", () => {
        installBtn.style.transform = "scale(1.05)";
      });

      installBtn.addEventListener("mouseout", () => {
        installBtn.style.transform = "scale(1)";
      });

      installBtn.addEventListener("click", async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          console.log("✅ User accepted the install prompt");
          installBtn.remove();
        } else {
          console.log("❌ User dismissed the install prompt");
        }
        deferredPrompt = null;
      });

      document.body.appendChild(installBtn);
    });

    window.addEventListener("appinstalled", () => {
      document.getElementById("install-app-btn")?.remove();
      console.log("✅ PWA was installed");
    });
  }

  async renderPage() {
    console.log("Rendering page...");
    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      console.error("Page not found for route:", url);
      return;
    }

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
          localStorage.removeItem("name");
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
        document.getElementById("home-link")?.addEventListener("click", (e) => {
          e.preventDefault();
          alert("Silakan login dulu!");
          location.hash = "#/auth";
        });
        document.getElementById("add-link")?.addEventListener("click", (e) => {
          e.preventDefault();
          alert("Silakan login dulu!");
          location.hash = "#/auth";
        });
      }, 0);
    }

    const renderContent = async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      if (isServiceWorkerAvailable() && token) {
        this.#setupPushNotification();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderContent);
    } else {
      this.#content.style.opacity = "0";
      setTimeout(async () => {
        await renderContent();
        this.#content.style.opacity = "1";
      }, 300);
    }
  }

  async #setupPushNotification() {
    if (this.#notificationButton) {
      this.#notificationButton.remove();
      this.#notificationButton = null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker is ready");

      const isSubscribed = await isCurrentPushSubscriptionAvailable();

      this.#notificationButton = document.createElement("button");
      this.#notificationButton.id = "notification-toggle-btn";
      this.#notificationButton.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 15px 25px;
        background: ${
          isSubscribed
            ? "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)"
            : "linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)"
        };
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 9998;
        transition: all 0.3s;
        font-size: 14px;
      `;

      this.#notificationButton.textContent = isSubscribed
        ? "🔕 Unsubscribe Notification"
        : "🔔 Subscribe Notification";

      this.#notificationButton.addEventListener("mouseover", () => {
        this.#notificationButton.style.transform = "scale(1.05)";
      });

      this.#notificationButton.addEventListener("mouseout", () => {
        this.#notificationButton.style.transform = "scale(1)";
      });

      this.#notificationButton.addEventListener("click", async () => {
        this.#notificationButton.disabled = true;
        this.#notificationButton.textContent = "⏳ Processing...";
        try {
          if (isSubscribed) {
            await unsubscribe();
          } else {
            await subscribe();
          }
          await this.#setupPushNotification();
        } catch (error) {
          console.error("Error toggling notification:", error);
          alert("Failed to toggle notification: " + error.message);
          this.#notificationButton.disabled = false;
        }
      });

      document.body.appendChild(this.#notificationButton);
    } catch (error) {
      console.error("❌ Service Worker not ready:", error);
    }
  }
}

export default App;
