import CONFIG from "../utils/config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  ADD_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function register(user) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.message);
  return data;
}

export async function login(user) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.message);
  localStorage.setItem("token", data.loginResult.token);
  localStorage.setItem("name", data.loginResult.name);
  return data;
}

export async function getStories() {
  const response = await fetch(`${ENDPOINTS.STORIES}?location=1`, {
    headers: getAuthHeader(),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.message);
  return data.listStory;
}

export async function addStory(story) {
  const formData = new FormData();
  formData.append("description", `${story.name}: ${story.description}`);
  formData.append("photo", story.photo);
  if (story.lat) formData.append("lat", story.lat);
  if (story.lon) formData.append("lon", story.lon);
  const response = await fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
  });
  const data = await response.json();
  if (data.error) throw new Error(data.message);
  return data;
}

export async function subscribePushNotification({ endpoint, keys: { p256dh, auth } }) {
    const data = JSON.stringify({
      endpoint,
      keys: { p256dh, auth },
    });
    const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: data,
    });
    const json = await fetchResponse.json();
    return {
      ...json,
      ok: fetchResponse.ok,
  };
}

export async function unsubscribePushNotification({ endpoint }) {
    const data = JSON.stringify({ endpoint });
    const fetchResponse = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: data,
    });
    const json = await fetchResponse.json();
    return {
      ...json,
      ok: fetchResponse.ok,
  };
}