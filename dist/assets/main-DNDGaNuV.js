var ge=n=>{throw TypeError(n)};var Q=(n,e,t)=>e.has(n)||ge("Cannot "+t);var s=(n,e,t)=>(Q(n,e,"read from private field"),t?t.call(n):e.get(n)),w=(n,e,t)=>e.has(n)?ge("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(n):e.set(n,t),p=(n,e,t,o)=>(Q(n,e,"write to private field"),o?o.call(n,t):e.set(n,t),t),c=(n,e,t)=>(Q(n,e,"access private method"),t);import{r as qe,g as Ve}from"./leaflet-cHD0dS3v.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerPolicy&&(i.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?i.credentials="include":r.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}})();const z={BASE_URL:"https://story-api.dicoding.dev/v1"},U={REGISTER:`${z.BASE_URL}/register`,LOGIN:`${z.BASE_URL}/login`,STORIES:`${z.BASE_URL}/stories`,SUBSCRIBE:`${z.BASE_URL}/notifications/subscribe`,UNSUBSCRIBE:`${z.BASE_URL}/notifications/subscribe`},we=()=>{const n=localStorage.getItem("token");return n?{Authorization:`Bearer ${n}`}:{}};async function He(n){const t=await(await fetch(U.REGISTER,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).json();if(t.error)throw new Error(t.message);return t}async function _e(n){const t=await(await fetch(U.LOGIN,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).json();if(t.error)throw new Error(t.message);return localStorage.setItem("token",t.loginResult.token),localStorage.setItem("name",t.loginResult.name),t}async function Ge(){const e=await(await fetch(`${U.STORIES}?location=1`,{headers:we()})).json();if(e.error)throw new Error(e.message);return e.listStory}async function ve(n){const e=new FormData;e.append("description",`${n.name}: ${n.description}`),e.append("photo",n.photo),n.lat&&e.append("lat",n.lat),n.lon&&e.append("lon",n.lon);const o=await(await fetch(U.STORIES,{method:"POST",headers:we(),body:e})).json();if(o.error)throw new Error(o.message);return o}async function Ye({endpoint:n,keys:{p256dh:e,auth:t}}){const o=JSON.stringify({endpoint:n,keys:{p256dh:e,auth:t}}),r=await fetch(U.SUBSCRIBE,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:o});return{...await r.json(),ok:r.ok}}async function Ke({endpoint:n}){const e=JSON.stringify({endpoint:n}),t=await fetch(U.UNSUBSCRIBE,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("token")}`},body:e});return{...await t.json(),ok:t.ok}}var Je=qe();const M=Ve(Je);let R,Se=[];function xe(n,e){R=M.map(n).setView([0,0],2),M.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(R);const t=M.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{attribution:"© Esri"});M.control.layers({OpenStreetMap:M.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),Satellite:t}).addTo(R),Xe(e)}function Xe(n){n.forEach(e=>{const t=M.marker([e.lat,e.lon]).addTo(R);t.bindPopup(`
      <div style="width: 200px;">
        <img src="${e.photoUrl}" alt="${e.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 5px;">
        <h3>${e.name}</h3>
        <p>${e.description}</p>
      </div>
    `),Se.push({marker:t,story:e})})}function Qe(n){Se.forEach(({marker:e,story:t})=>{t.name.toLowerCase().includes(n.toLowerCase())?R.addLayer(e):R.removeLayer(e)})}function Ze(n){let e=!0;return document.getElementById("name-error").textContent="",document.getElementById("desc-error").textContent="",document.getElementById("photo-error").textContent="",n.name||(document.getElementById("name-error").textContent="Name is required.",e=!1),n.description||(document.getElementById("desc-error").textContent="Description is required.",e=!1),n.photo||(document.getElementById("photo-error").textContent="Photo is required.",e=!1),e}function et(n=1e3){return new Promise(e=>setTimeout(e,n))}function de(){return"serviceWorker"in navigator}async function tt(){if(!de())return console.log("Service Worker API not supported"),null;try{const n=await navigator.serviceWorker.getRegistrations();for(const t of n)await t.unregister(),console.log("Unregistered old service worker");await et(100);const e=await navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"});return console.log("✅ Service Worker registered successfully"),console.log("Scope:",e.scope),console.log("State:",e.installing||e.waiting||e.active),await navigator.serviceWorker.ready,console.log("✅ Service Worker is ready"),e.addEventListener("updatefound",()=>{const t=e.installing;console.log("🔄 New Service Worker found, installing..."),t.addEventListener("statechange",()=>{console.log("Service Worker state:",t.state),t.state==="installed"&&navigator.serviceWorker.controller&&confirm("New version available! Reload to update?")&&(t.postMessage({type:"SKIP_WAITING"}),window.location.reload())})}),navigator.serviceWorker.addEventListener("controllerchange",()=>{console.log("Controller changed, reloading..."),window.location.reload()}),setInterval(()=>{e.update(),console.log("Checking for Service Worker updates...")},60*60*1e3),e}catch(n){return console.error("❌ Service Worker registration failed:",n),null}}typeof window<"u"&&(window.addEventListener("online",()=>{console.log("🌐 App is online"),nt(),de()&&navigator.serviceWorker.ready.then(n=>{"sync"in n&&n.sync.register("sync-stories")})}),window.addEventListener("offline",()=>{console.log("📡 App is offline"),pe()}),navigator.onLine||pe());function pe(){if(document.getElementById("offline-indicator"))return;const e=document.createElement("div");e.id="offline-indicator",e.style.cssText=`
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
    animation: slideDown 0.3s ease;
  `,e.textContent="📡 You are offline - Some features may be limited",document.body.appendChild(e)}function nt(){const n=document.getElementById("offline-indicator");n&&(n.style.animation="slideUp 0.3s ease",setTimeout(()=>n.remove(),300))}if(typeof document<"u"){const n=document.createElement("style");n.textContent=`
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
      }
      to {
        transform: translateY(0);
      }
    }
    
    @keyframes slideUp {
      from {
        transform: translateY(0);
      }
      to {
        transform: translateY(-100%);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `,document.head.appendChild(n)}const ne=(n,e)=>e.some(t=>n instanceof t);let me,fe;function ot(){return me||(me=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function rt(){return fe||(fe=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const oe=new WeakMap,Z=new WeakMap,J=new WeakMap;function it(n){const e=new Promise((t,o)=>{const r=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t($(n.result)),r()},a=()=>{o(n.error),r()};n.addEventListener("success",i),n.addEventListener("error",a)});return J.set(e,n),e}function at(n){if(oe.has(n))return;const e=new Promise((t,o)=>{const r=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),r()},a=()=>{o(n.error||new DOMException("AbortError","AbortError")),r()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});oe.set(n,e)}let re={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return oe.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return $(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Ee(n){re=n(re)}function st(n){return rt().includes(n)?function(...e){return n.apply(ie(this),e),$(this.request)}:function(...e){return $(n.apply(ie(this),e))}}function ct(n){return typeof n=="function"?st(n):(n instanceof IDBTransaction&&at(n),ne(n,ot())?new Proxy(n,re):n)}function $(n){if(n instanceof IDBRequest)return it(n);if(Z.has(n))return Z.get(n);const e=ct(n);return e!==n&&(Z.set(n,e),J.set(e,n)),e}const ie=n=>J.get(n);function lt(n,e,{blocked:t,upgrade:o,blocking:r,terminated:i}={}){const a=indexedDB.open(n,e),u=$(a);return o&&a.addEventListener("upgradeneeded",l=>{o($(a.result),l.oldVersion,l.newVersion,$(a.transaction),l)}),t&&a.addEventListener("blocked",l=>t(l.oldVersion,l.newVersion,l)),u.then(l=>{i&&l.addEventListener("close",()=>i()),r&&l.addEventListener("versionchange",g=>r(g.oldVersion,g.newVersion,g))}).catch(()=>{}),u}const dt=["get","getKey","getAll","getAllKeys","count"],ut=["put","add","delete","clear"],ee=new Map;function he(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(ee.get(e))return ee.get(e);const t=e.replace(/FromIndex$/,""),o=e!==t,r=ut.includes(t);if(!(t in(o?IDBIndex:IDBObjectStore).prototype)||!(r||dt.includes(t)))return;const i=async function(a,...u){const l=this.transaction(a,r?"readwrite":"readonly");let g=l.store;return o&&(g=g.index(u.shift())),(await Promise.all([g[t](...u),r&&l.done]))[0]};return ee.set(e,i),i}Ee(n=>({...n,get:(e,t,o)=>he(e,t)||n.get(e,t,o),has:(e,t)=>!!he(e,t)||n.has(e,t)}));const gt=["continue","continuePrimaryKey","advance"],ye={},ae=new WeakMap,Le=new WeakMap,pt={get(n,e){if(!gt.includes(e))return n[e];let t=ye[e];return t||(t=ye[e]=function(...o){ae.set(this,Le.get(this)[e](...o))}),t}};async function*mt(...n){let e=this;if(e instanceof IDBCursor||(e=await e.openCursor(...n)),!e)return;e=e;const t=new Proxy(e,pt);for(Le.set(t,e),J.set(t,ie(e));e;)yield t,e=await(ae.get(t)||e.continue()),ae.delete(t)}function be(n,e){return e===Symbol.asyncIterator&&ne(n,[IDBIndex,IDBObjectStore,IDBCursor])||e==="iterate"&&ne(n,[IDBIndex,IDBObjectStore])}Ee(n=>({...n,get(e,t,o){return be(e,t)?mt:n.get(e,t,o)},has(e,t){return be(e,t)||n.has(e,t)}}));const ft="storymap",ht=1,P="saved-stories",B="pending-stories",I=lt(ft,ht,{upgrade(n){if(!n.objectStoreNames.contains(P)){const e=n.createObjectStore(P,{keyPath:"id"});e.createIndex("name","name",{unique:!1}),e.createIndex("createdAt","createdAt",{unique:!1})}n.objectStoreNames.contains(B)||n.createObjectStore(B,{keyPath:"tempId",autoIncrement:!0})}}),b={async saveStory(n){if(!n||!n.id)throw new Error("Story must have an id");return(await I).put(P,n)},async getStoryById(n){if(!n)throw new Error("id is required");return(await I).get(P,n)},async getAllStories(){return(await I).getAll(P)},async deleteStory(n){if(!n)throw new Error("id is required");return(await I).delete(P,n)},async searchStories(n){const e=await this.getAllStories();if(!n)return e;const t=n.toLowerCase();return e.filter(o=>{var r,i;return((r=o.name)==null?void 0:r.toLowerCase().includes(t))||((i=o.description)==null?void 0:i.toLowerCase().includes(t))})},async sortStories(n="createdAt",e="desc"){return(await this.getAllStories()).sort((o,r)=>{let i=o[n],a=r[n];return n==="createdAt"?(i=new Date(i).getTime(),a=new Date(a).getTime()):typeof i=="string"&&(i=i.toLowerCase(),a=a.toLowerCase()),e==="asc"?i>a?1:-1:i<a?1:-1})},async filterStoriesByDate(n,e){const t=await this.getAllStories(),o=new Date(n).getTime(),r=new Date(e).getTime();return t.filter(i=>{const a=new Date(i.createdAt).getTime();return a>=o&&a<=r})},async savePendingStory(n){const e={...n,timestamp:Date.now(),synced:!1};return await(await I).add(B,e)},async getAllPendingStories(){return(await I).getAll(B)},async deletePendingStory(n){return(await I).delete(B,n)},async clearAllPendingStories(){const e=(await I).transaction(B,"readwrite");await e.objectStore(B).clear(),await e.done},async getStoriesCount(){return await(await I).count(P)},async getPendingCount(){return await(await I).count(B)}};b.saveStory.bind(b);var W,V;class yt{constructor(){w(this,W)}async render(){return`
      <section class="container">
        <h1>Story Map</h1>
        <h2>Explore Stories</h2>
        <input type="text" id="search" placeholder="Search stories..." aria-label="Search stories">
        <div id="map" style="height: 400px;" role="img" aria-label="Interactive map of stories"></div>
        <h3>Story List</h3>
        <ul id="story-list" aria-label="List of stories"></ul>
      </section>
    `}async afterRender(){if(!localStorage.getItem("token")){alert("Please login first!"),location.hash="#/auth";return}try{const t=await Ge(),o=document.getElementById("story-list");if(t.length===0){o.innerHTML="<li>No stories available.</li>";return}const r=await b.getAllStories(),i=new Set(r.map(a=>a.id));o.innerHTML=t.map(a=>`
        <li>
          <img 
            src="${a.photoUrl||"https://via.placeholder.com/300x200?text=No+Image"}" 
            alt="${a.name} story image" 
            onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'"
            loading="lazy"
          >
          <h4>${a.name}</h4>
          <p>${a.description}</p>
          <small>${new Date(a.createdAt).toLocaleDateString("id-ID",{year:"numeric",month:"long",day:"numeric"})}</small>
          <button 
            class="favorite-btn ${i.has(a.id)?"active":""}" 
            data-id="${a.id}"
            aria-label="${i.has(a.id)?"Remove from favorites":"Add to favorites"}"
          >
            ${i.has(a.id)?"❤️ Saved":"🤍 Save"}
          </button>
        </li>
      `).join(""),xe("map",t),document.getElementById("search").addEventListener("input",a=>{Qe(a.target.value)}),document.querySelectorAll(".favorite-btn").forEach(a=>{a.addEventListener("click",async u=>{const l=u.target,g=l.dataset.id,v=t.find(h=>h.id===g);if(v)try{l.classList.contains("active")?(await b.deleteStory(g),l.classList.remove("active"),l.textContent="🤍 Save",l.setAttribute("aria-label","Add to favorites"),c(this,W,V).call(this,"❌ Removed from favorites","error")):(await b.saveStory(v),l.classList.add("active"),l.textContent="❤️ Saved",l.setAttribute("aria-label","Remove from favorites"),c(this,W,V).call(this,"✅ Saved to favorites!","success"))}catch(h){console.error("Error toggling favorite:",h),c(this,W,V).call(this,"⚠️ Error: "+h.message,"error")}})})}catch(t){console.error("Error loading stories:",t),alert("Error loading stories: "+t.message)}}}W=new WeakSet,V=function(e,t="info"){const o=document.createElement("div");o.textContent=e,o.style.cssText=`
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${t==="success"?"linear-gradient(135deg, #27ae60, #2ecc71)":"linear-gradient(135deg, #e74c3c, #c0392b)"};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      font-weight: 500;
    `,document.body.appendChild(o),setTimeout(()=>{o.style.animation="slideOut 0.3s ease",setTimeout(()=>o.remove(),300)},3e3)};var k,D,m,Ie,T,ke,Ce,se,Be;class bt{constructor(){w(this,m);w(this,k,!1);w(this,D,[]);c(this,m,Ie).call(this)}async saveForLaterSync(e){try{const t=await b.savePendingStory(e);return console.log("📦 Story saved for later sync:",t),c(this,m,T).call(this,{type:"pending-added",data:{tempId:t,storyData:e}}),{success:!0,tempId:t,offline:!0}}catch(t){throw console.error("Error saving for sync:",t),t}}async syncPendingStories(){if(s(this,k))return console.log("⏳ Sync already in progress"),{success:!1,message:"Sync already in progress"};if(!navigator.onLine)return console.log("📡 Cannot sync - offline"),{success:!1,message:"Device is offline"};if(!localStorage.getItem("token"))return console.log("🔒 Cannot sync - not logged in"),{success:!1,message:"User not logged in"};p(this,k,!0),c(this,m,T).call(this,{type:"sync-started"});try{const t=await b.getAllPendingStories();if(t.length===0)return console.log("✅ No stories to sync"),p(this,k,!1),{success:!0,synced:0,message:"No stories to sync"};console.log(`🔄 Syncing ${t.length} pending stories...`);const o={total:t.length,success:0,failed:0,errors:[]};for(const i of t)try{const a=c(this,m,ke).call(this,i.photo,"story-photo.jpg");await ve({name:i.name,description:i.description,photo:a,lat:i.lat,lon:i.lon}),await b.deletePendingStory(i.tempId),o.success++,console.log(`✅ Synced story ${o.success}/${o.total}`),c(this,m,T).call(this,{type:"story-synced",data:{tempId:i.tempId,progress:{current:o.success,total:o.total}}})}catch(a){o.failed++,o.errors.push({tempId:i.tempId,error:a.message}),console.error("❌ Failed to sync story:",a)}p(this,k,!1);const r={success:o.failed===0,synced:o.success,failed:o.failed,total:o.total,message:`Synced ${o.success}/${o.total} stories`};return c(this,m,T).call(this,{type:"sync-completed",data:r}),o.success>0&&c(this,m,Be).call(this,r),r}catch(t){return p(this,k,!1),console.error("❌ Sync failed:",t),c(this,m,T).call(this,{type:"sync-failed",data:{error:t.message}}),{success:!1,message:"Sync failed: "+t.message}}}async getPendingCount(){return await b.getPendingCount()}async getPendingStories(){return await b.getAllPendingStories()}async clearPendingStories(){await b.clearAllPendingStories(),c(this,m,T).call(this,{type:"pending-cleared"})}isSyncing(){return s(this,k)}isOnline(){return navigator.onLine}onSyncEvent(e){return s(this,D).push(e),()=>{p(this,D,s(this,D).filter(t=>t!==e))}}}k=new WeakMap,D=new WeakMap,m=new WeakSet,Ie=function(){window.addEventListener("online",()=>{console.log("🌐 Back online - triggering sync"),c(this,m,Ce).call(this),this.syncPendingStories()}),window.addEventListener("offline",()=>{console.log("📡 Offline mode activated"),c(this,m,se).call(this)}),navigator.onLine||c(this,m,se).call(this)},T=function(e){s(this,D).forEach(t=>{try{t(e)}catch(o){console.error("Sync listener error:",o)}})},ke=function(e,t){if(e instanceof File)return e;const o=e.split(","),r=o[0].match(/:(.*?);/)[1],i=atob(o[1]);let a=i.length;const u=new Uint8Array(a);for(;a--;)u[a]=i.charCodeAt(a);return new File([u],t,{type:r})},Ce=function(){const e=document.createElement("div");e.style.cssText=`
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
    `,e.innerHTML="🌐 Back online!",document.body.appendChild(e),setTimeout(()=>{e.style.animation="slideOut 0.3s ease",setTimeout(()=>e.remove(),300)},3e3)},se=function(){if(document.getElementById("offline-indicator"))return;const t=document.createElement("div");t.id="offline-indicator",t.style.cssText=`
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
    `,t.innerHTML="📡 You are offline - Changes will sync when connection returns",document.body.appendChild(t);const o=()=>{t.remove(),window.removeEventListener("online",o)};window.addEventListener("online",o)},Be=async function(e){const t=document.createElement("div");t.style.cssText=`
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
    `,t.innerHTML=`
      <strong>✅ Sync Complete</strong><br>
      <span style="font-size: 0.9rem;">
        ${e.synced} of ${e.total} stories synced
        ${e.failed>0?`<br>${e.failed} failed`:""}
      </span>
    `,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOut 0.3s ease",setTimeout(()=>t.remove(),300)},5e3)};const wt=new bt;var K,Ae;class vt{constructor(){w(this,K)}async render(){return`
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
    `}async afterRender(){if(!localStorage.getItem("token")){alert("Please login to add story!"),location.hash="#/auth";return}let t=-6.175389,o=106.827139;const r=L.map("map").setView([t,o],15);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(r);const i=L.marker([t,o],{draggable:!0}).addTo(r);i.on("dragend",u=>{const{lat:l,lng:g}=u.target.getLatLng();t=l,o=g,document.getElementById("latitude").value=t,document.getElementById("longitude").value=o}),r.on("click",u=>{i.setLatLng(u.latlng),t=u.latlng.lat,o=u.latlng.lng,document.getElementById("latitude").value=t,document.getElementById("longitude").value=o,r.flyTo(u.latlng)});const a=document.getElementById("add-form");a.addEventListener("submit",async u=>{u.preventDefault();const l=document.getElementById("name").value.trim(),g=document.getElementById("description").value.trim(),v=document.getElementById("photo").files[0];if(!Ze({name:l,description:g,photo:v}))return;const h=a.querySelector('button[type="submit"]');h.disabled=!0,h.textContent="Uploading...";try{if(navigator.onLine)await ve({name:l,description:g,photo:v,lat:t,lon:o}),await c(this,K,Ae).call(this,l),alert("Story added successfully!"),location.hash="#/home";else{const x=new FileReader;x.readAsDataURL(v),x.onload=async()=>{await wt.saveForLaterSync({name:l,description:g,photo:x.result,lat:t,lon:o}),alert("Offline mode: Story will be uploaded when connection returns"),location.hash="#/home"}}}catch(x){console.error("Error adding story:",x),alert("Error: "+x.message),h.disabled=!1,h.textContent="Submit"}}),document.getElementById("camera-btn").addEventListener("click",async()=>{try{const u=await navigator.mediaDevices.getUserMedia({video:!0}),l=document.createElement("div");l.style.cssText=`
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
        `;const g=document.createElement("video");g.srcObject=u,g.autoplay=!0,g.style.cssText=`
          width: 90%;
          max-width: 400px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;const v=document.createElement("div");v.style.cssText=`
          display: flex;
          gap: 15px;
        `;const h=document.createElement("button");h.textContent="📸 Capture",h.style.cssText=`
          padding: 15px 30px;
          font-size: 1rem;
          background: linear-gradient(135deg, #27ae60, #2ecc71);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        `;const x=document.createElement("button");x.textContent="❌ Cancel",x.style.cssText=`
          padding: 15px 30px;
          font-size: 1rem;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        `,v.appendChild(h),v.appendChild(x),l.appendChild(g),l.appendChild(v),document.body.appendChild(l),h.addEventListener("click",()=>{const O=document.createElement("canvas");O.width=g.videoWidth,O.height=g.videoHeight,O.getContext("2d").drawImage(g,0,0),O.toBlob(X=>{const ze=new File([X],"capture.jpg",{type:"image/jpeg"}),ue=new DataTransfer;ue.items.add(ze),document.getElementById("photo").files=ue.files,alert("📸 Image captured successfully!")}),u.getTracks().forEach(X=>X.stop()),document.body.removeChild(l)}),x.addEventListener("click",()=>{u.getTracks().forEach(O=>O.stop()),document.body.removeChild(l)})}catch(u){console.error("Camera error:",u),alert("Camera access denied or not available: "+u.message)}})}}K=new WeakSet,Ae=async function(e){try{if(!("serviceWorker"in navigator)){console.log("Service Worker not supported");return}const t=await navigator.serviceWorker.ready;if(Notification.permission!=="granted"){console.log("Notification permission not granted");return}await t.showNotification("🎉 Story Added!",{body:`Your story "${e}" has been published successfully!`,icon:"/favicon.png",badge:"/favicon.png",vibrate:[200,100,200],tag:"story-added",requireInteraction:!1,actions:[{action:"view",title:"👀 View Story",icon:"/favicon.png"},{action:"close",title:"✅ OK",icon:"/favicon.png"}],data:{url:"/#/home",timestamp:Date.now(),type:"story-added"}}),console.log("✅ Push notification sent successfully")}catch(t){console.error("❌ Error sending notification:",t)}};class St{async render(){return`
      <section class="container">
        <h1>Authentication</h1>
        <div id="auth-container">
          <h2 id="form-title">Login</h2>
          <form id="auth-form">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
            <label for="password">Password:</label>
            <input type="password" id="password" required>
            <button type="submit" id="submit-btn">Login</button>
          </form>
          <p>Belum punya akun? <a href="#" id="toggle-link">Register</a></p>
        </div>
      </section>
    `}async afterRender(){let e=!0;const t=document.getElementById("form-title"),o=document.getElementById("auth-form"),r=document.getElementById("toggle-link"),i=()=>{e?(t.textContent="Login",o.innerHTML=`
      <label for="email">Email:</label>
      <input type="email" id="email" required>
      <label for="password">Password:</label>
      <input type="password" id="password" required>
      <button type="submit" id="submit-btn">Login</button>
    `,r.textContent="Register",r.previousSibling.textContent="Belum punya akun? "):(t.textContent="Register",o.innerHTML=`
      <label for="reg-name">Name:</label>
      <input type="text" id="reg-name" required>
      <label for="reg-email">Email:</label>
      <input type="email" id="reg-email" required>
      <label for="reg-password">Password:</label>
      <input type="password" id="reg-password" required>
      <button type="submit" id="submit-btn">Register</button>
    `,r.textContent="Login",r.previousSibling.textContent="Sudah punya akun? "),document.getElementById("submit-btn").addEventListener("click",a)},a=async u=>{if(u.preventDefault(),e){const l=document.getElementById("email").value,g=document.getElementById("password").value;try{await _e({email:l,password:g}),alert("Login successful!"),location.hash="#/home"}catch(v){alert("Login failed: "+v.message)}}else{const l=document.getElementById("reg-name").value,g=document.getElementById("reg-email").value,v=document.getElementById("reg-password").value;try{await He({name:l,email:g,password:v}),alert("Register successful! Now login."),e=!0,i()}catch(h){alert("Register failed: "+h.message)}}};r.addEventListener("click",u=>{u.preventDefault(),e=!e,i()}),i()}}var S,y,A,j,d,Te,H,q,Pe,De,Ne,$e,_,Oe,G,ce,Y;class xt{constructor(){w(this,d);w(this,S,[]);w(this,y,[]);w(this,A,"createdAt");w(this,j,"desc")}async render(){return`
      <section class="container">
        <h1>Favorite Stories</h1>
        <p>Your saved stories for offline access</p>
        
        <!-- Filter & Sort Controls -->
        <div class="filter-controls" style="margin: 20px 0; display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
          <input 
            type="text" 
            id="search-favorites" 
            placeholder="Search favorites..." 
            style="flex: 1; min-width: 200px; max-width: 400px;"
            aria-label="Search favorite stories"
          >
          
          <select id="sort-by" style="padding: 12px; border-radius: 8px;" aria-label="Sort by">
            <option value="createdAt">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
          
          <select id="sort-order" style="padding: 12px; border-radius: 8px;" aria-label="Sort order">
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
          
          <button id="clear-all" style="background: #e74c3c; padding: 12px 20px;" aria-label="Clear all favorites">
            Clear All
          </button>
        </div>

        <!-- Stats -->
        <div id="favorite-stats" style="text-align: center; margin: 20px 0; color: #555;">
          Loading...
        </div>

        <!-- Map View -->
        <div id="map" style="height: 300px; margin: 20px 0; border-radius: 10px;"></div>

        <!-- Stories List -->
        <div id="favorite-list-container">
          <div id="loading-indicator" style="text-align: center; padding: 40px;">
            <p>Loading your favorites...</p>
          </div>
        </div>
      </section>
    `}async afterRender(){if(!localStorage.getItem("token")){alert("Please login to view favorites!"),location.hash="#/auth";return}await c(this,d,Te).call(this),c(this,d,Ne).call(this),c(this,d,G).call(this)}}S=new WeakMap,y=new WeakMap,A=new WeakMap,j=new WeakMap,d=new WeakSet,Te=async function(){try{p(this,S,await b.getAllStories()),p(this,y,[...s(this,S)]),await c(this,d,q).call(this),c(this,d,H).call(this)}catch(e){console.error("Error loading stories:",e),c(this,d,Y).call(this,"Failed to load favorites")}},H=function(){if(s(this,y).length>0)try{xe("map",s(this,y))}catch(e){console.error("Error initializing map:",e)}},q=async function(){const e=document.getElementById("favorite-list-container");if(s(this,y).length===0){e.innerHTML=`
        <div style="text-align: center; padding: 40px;">
          <p style="font-size: 1.2rem; color: #666;">
            ${s(this,S).length===0?"No favorite stories yet. Go to Home to save some!":"No stories match your search."}
          </p>
        </div>
      `;return}const t=s(this,y).map(o=>`
      <li data-story-id="${o.id}">
        <img 
          src="${o.photoUrl||"https://via.placeholder.com/300x200?text=No+Image"}" 
          alt="${o.name} story image" 
          onerror="this.src='https://via.placeholder.com/300x200?text=Image+Error'"
          loading="lazy"
        >
        <h4>${o.name||"Untitled Story"}</h4>
        <p>${o.description||"No description"}</p>
        <small>${new Date(o.createdAt).toLocaleDateString("id-ID",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}</small>
        <div style="margin-top: 10px; display: flex; gap: 10px;">
          <button 
            class="delete-btn" 
            data-id="${o.id}"
            style="flex: 1; background: #e74c3c;"
            aria-label="Delete ${o.name}"
          >
            Delete
          </button>
          <button 
            class="view-location-btn" 
            data-lat="${o.lat}" 
            data-lon="${o.lon}"
            style="flex: 1; background: #3498db;"
            aria-label="View ${o.name} on map"
          >
            View on Map
          </button>
        </div>
      </li>
    `).join("");e.innerHTML=`
      <ul id="favorite-list" style="list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 20px;">
        ${t}
      </ul>
    `,c(this,d,Pe).call(this)},Pe=function(){document.querySelectorAll(".delete-btn").forEach(e=>{e.addEventListener("click",async t=>{const o=t.target.dataset.id,r=s(this,S).find(i=>i.id===o);confirm(`Delete "${(r==null?void 0:r.name)||"this story"}" from favorites?`)&&await c(this,d,De).call(this,o)})}),document.querySelectorAll(".view-location-btn").forEach(e=>{e.addEventListener("click",t=>{const o=parseFloat(t.target.dataset.lat),r=parseFloat(t.target.dataset.lon);document.getElementById("map").scrollIntoView({behavior:"smooth",block:"center"}),console.log("Viewing location:",{lat:o,lon:r})})})},De=async function(e){try{await b.deleteStory(e),p(this,S,s(this,S).filter(t=>t.id!==e)),p(this,y,s(this,y).filter(t=>t.id!==e)),await c(this,d,q).call(this),c(this,d,G).call(this),c(this,d,H).call(this),c(this,d,ce).call(this,"Story removed from favorites")}catch(t){console.error("Error deleting story:",t),c(this,d,Y).call(this,"Failed to delete story")}},Ne=function(){document.getElementById("search-favorites").addEventListener("input",async i=>{const a=i.target.value.trim();await c(this,d,$e).call(this,a)}),document.getElementById("sort-by").addEventListener("change",async i=>{p(this,A,i.target.value);const a=document.getElementById("sort-order");s(this,A)==="name"?a.innerHTML=`
          <option value="asc">A to Z</option>
          <option value="desc">Z to A</option>
        `:a.innerHTML=`
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        `,a.value=s(this,j),await c(this,d,_).call(this)}),document.getElementById("sort-order").addEventListener("change",async i=>{p(this,j,i.target.value),await c(this,d,_).call(this)}),document.getElementById("clear-all").addEventListener("click",async()=>{if(s(this,S).length===0){alert("No favorites to clear");return}confirm(`Clear all ${s(this,S).length} favorite stories?`)&&await c(this,d,Oe).call(this)})},$e=async function(e=""){try{e?p(this,y,await b.searchStories(e)):p(this,y,[...s(this,S)]),await c(this,d,_).call(this)}catch(t){console.error("Error applying filters:",t)}},_=async function(){try{p(this,y,s(this,y).sort((e,t)=>{let o=e[s(this,A)],r=t[s(this,A)];return s(this,A)==="createdAt"?(o=new Date(o).getTime(),r=new Date(r).getTime()):typeof o=="string"&&(o=o.toLowerCase(),r=r.toLowerCase()),s(this,j)==="asc"?o>r?1:-1:o<r?1:-1})),await c(this,d,q).call(this),c(this,d,H).call(this)}catch(e){console.error("Error sorting:",e)}},Oe=async function(){try{for(const e of s(this,S))await b.deleteStory(e.id);p(this,S,[]),p(this,y,[]),await c(this,d,q).call(this),c(this,d,G).call(this),c(this,d,ce).call(this,"All favorites cleared")}catch(e){console.error("Error clearing favorites:",e),c(this,d,Y).call(this,"Failed to clear favorites")}},G=async function(){try{const e=await b.getStoriesCount(),t=await b.getPendingCount(),o=document.getElementById("favorite-stats");o.innerHTML=`
        <p style="font-size: 1.1rem;">
          📚 <strong>${e}</strong> favorite ${e===1?"story":"stories"}
          ${t>0?`| 📤 <strong>${t}</strong> pending sync`:""}
        </p>
        ${s(this,y).length!==e?`<p style="color: #3498db;">Showing ${s(this,y).length} of ${e}</p>`:""}
      `}catch(e){console.error("Error rendering stats:",e)}},ce=function(e){const t=document.createElement("div");t.textContent=e,t.style.cssText=`
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)},Y=function(e){const t=document.createElement("div");t.textContent=e,t.style.cssText=`
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #e74c3c;
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),3e3)};const Et={"/home":new yt,"/add":new vt,"/auth":new St,"/favorite":new xt};function Lt(n){const e=n.split("/");return{resource:e[1]||null,id:e[2]||null}}function It(n){let e="";return n.resource&&(e=e.concat(`/${n.resource}`)),n.id&&(e=e.concat("/:id")),e||"/"}function kt(){return location.hash.replace("#","")||"/"}function Ct(){const n=kt(),e=Lt(n);return It(e)}function Bt(n){const e="=".repeat((4-n.length%4)%4),t=(n+e).replace(/-/g,"+").replace(/_/g,"/"),o=window.atob(t),r=new Uint8Array(o.length);for(let i=0;i<o.length;++i)r[i]=o.charCodeAt(i);return r}const At="BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";function Tt(){return"Notification"in window}function Pt(){return Notification.permission==="granted"}async function Dt(){if(!Tt())return console.error("Notification API unsupported."),!1;if(Pt())return!0;const n=await Notification.requestPermission();return n==="denied"?(alert("Izin notifikasi ditolak."),!1):n==="default"?(alert("Izin notifikasi ditutup atau diabaikan."),!1):!0}async function Me(){const n=await navigator.serviceWorker.getRegistration();return n?await n.pushManager.getSubscription():(console.log("Service worker not registered yet"),null)}async function Re(){return!!await Me()}async function We(){if(!await navigator.serviceWorker.getRegistration()){alert("Service worker not ready, please reload the page");return}if(!await Dt())return;if(await Re()){alert("Sudah berlangganan push notification.");return}console.log("Mulai berlangganan push notification...");const e="Langganan push notification gagal diaktifkan.",t="Langganan push notification berhasil diaktifkan.";let o;try{o=await(await navigator.serviceWorker.getRegistration()).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:Bt(At)});const{endpoint:i,keys:a}=o.toJSON(),u=await Ye({endpoint:i,keys:a});if(!u.ok){console.error("subscribe: response:",u),alert(e),await o.unsubscribe();return}alert(t)}catch(r){console.error("subscribe: error:",r),alert(e),o&&await o.unsubscribe()}}async function Nt(){const n="Langganan push notification gagal dinonaktifkan.",e="Langganan push notification berhasil dinonaktifkan.";try{const t=await Me();if(!t){alert("Tidak bisa memutus langganan push notification karena belum berlangganan sebelumnya.");return}const{endpoint:o}=t.toJSON(),r=await Ke({endpoint:o});if(!r.ok){alert(n),console.error("unsubscribe: response:",r);return}if(!await t.unsubscribe()){alert(n);return}alert(e)}catch(t){alert(n),console.error("unsubscribe: error:",t)}}window.subscribeNotif=We;var N,F,C,f,E,je,Fe,Ue,le;class $t{constructor({navigationDrawer:e,drawerButton:t,content:o}){w(this,E);w(this,N,null);w(this,F,null);w(this,C,null);w(this,f,null);p(this,N,o),p(this,F,t),p(this,C,e),c(this,E,je).call(this),c(this,E,Ue).call(this),c(this,E,Fe).call(this)}async renderPage(){console.log("Rendering page...");const e=Ct(),t=Et[e];if(!t){console.error("Page not found for route:",e);return}const o=localStorage.getItem("token"),r=document.getElementById("nav-list");o?(r.innerHTML=`
        <li><a href="#/home">Home</a></li>
        <li><a href="#/add">Add Story</a></li>
        <li><a href="#/favorite">Favorite</a></li>
        <li><a href="#/" id="logout">Logout</a></li>
      `,setTimeout(()=>{document.getElementById("logout").addEventListener("click",a=>{a.preventDefault(),localStorage.removeItem("token"),localStorage.removeItem("name"),alert("Logout berhasil!"),location.hash="#/auth"})},0)):(r.innerHTML=`
        <li><a href="#/home" id="home-link">Home</a></li>
        <li><a href="#/add" id="add-link">Add Story</a></li>
        <li><a href="#/auth">Login</a></li>
      `,setTimeout(()=>{var a,u;(a=document.getElementById("home-link"))==null||a.addEventListener("click",l=>{l.preventDefault(),alert("Silakan login dulu!"),location.hash="#/auth"}),(u=document.getElementById("add-link"))==null||u.addEventListener("click",l=>{l.preventDefault(),alert("Silakan login dulu!"),location.hash="#/auth"})},0));const i=async()=>{s(this,N).innerHTML=await t.render(),await t.afterRender(),de()&&o&&c(this,E,le).call(this)};document.startViewTransition?document.startViewTransition(i):(s(this,N).style.opacity="0",setTimeout(async()=>{await i(),s(this,N).style.opacity="1"},300))}}N=new WeakMap,F=new WeakMap,C=new WeakMap,f=new WeakMap,E=new WeakSet,je=function(){s(this,F).addEventListener("click",()=>{s(this,C).classList.toggle("open")}),document.body.addEventListener("click",e=>{!s(this,C).contains(e.target)&&!s(this,F).contains(e.target)&&s(this,C).classList.remove("open"),s(this,C).querySelectorAll("a").forEach(t=>{t.contains(e.target)&&s(this,C).classList.remove("open")})})},Fe=function(){"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").then(()=>console.log("✅ Service Worker registered")).catch(e=>console.error("❌ SW registration failed:",e))})},Ue=function(){let e;window.addEventListener("beforeinstallprompt",t=>{if(t.preventDefault(),e=t,document.getElementById("install-app-btn"))return;const o=document.createElement("button");o.id="install-app-btn",o.textContent="📱 Install App",o.style.cssText=`
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
      `,o.addEventListener("mouseover",()=>{o.style.transform="scale(1.05)"}),o.addEventListener("mouseout",()=>{o.style.transform="scale(1)"}),o.addEventListener("click",async()=>{e.prompt();const{outcome:r}=await e.userChoice;r==="accepted"?(console.log("✅ User accepted the install prompt"),o.remove()):console.log("❌ User dismissed the install prompt"),e=null}),document.body.appendChild(o)}),window.addEventListener("appinstalled",()=>{var t;(t=document.getElementById("install-app-btn"))==null||t.remove(),console.log("✅ PWA was installed")})},le=async function(){s(this,f)&&(s(this,f).remove(),p(this,f,null));try{const e=await navigator.serviceWorker.ready;console.log("✅ Service Worker is ready");const t=await Re();p(this,f,document.createElement("button")),s(this,f).id="notification-toggle-btn",s(this,f).style.cssText=`
        position: fixed;
        bottom: 80px;
        right: 20px;
        padding: 15px 25px;
        background: ${t?"linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)":"linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)"};
        color: white;
        border: none;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 9998;
        transition: all 0.3s;
        font-size: 14px;
      `,s(this,f).textContent=t?"🔕 Unsubscribe Notification":"🔔 Subscribe Notification",s(this,f).addEventListener("mouseover",()=>{s(this,f).style.transform="scale(1.05)"}),s(this,f).addEventListener("mouseout",()=>{s(this,f).style.transform="scale(1)"}),s(this,f).addEventListener("click",async()=>{s(this,f).disabled=!0,s(this,f).textContent="⏳ Processing...";try{t?await Nt():await We(),await c(this,E,le).call(this)}catch(o){console.error("Error toggling notification:",o),alert("Failed to toggle notification: "+o.message),s(this,f).disabled=!1}}),document.body.appendChild(s(this,f))}catch(e){console.error("❌ Service Worker not ready:",e)}};let te;document.addEventListener("DOMContentLoaded",async()=>{if(console.log("App initializing..."),te=new $t({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")}),await tt(),!location.hash||location.hash==="#/"){const n=localStorage.getItem("token");location.hash=n?"#/home":"#/auth"}await te.renderPage(),window.addEventListener("hashchange",async()=>{console.log("Hash changed to:",location.hash),await te.renderPage()}),console.log("App initialized successfully")});
//# sourceMappingURL=main-DNDGaNuV.js.map
