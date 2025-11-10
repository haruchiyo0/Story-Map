import { login, register } from "../../data/api";

export default class AuthPage {
  async render() {
    return `
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
    `;
  }

  async afterRender() {
    let isLogin = true;
    const formTitle = document.getElementById("form-title");
    const form = document.getElementById("auth-form");
    const toggleLink = document.getElementById("toggle-link");

    const updateForm = () => {
      if (isLogin) {
        formTitle.textContent = "Login";
        form.innerHTML = `
      <label for="email">Email:</label>
      <input type="email" id="email" required>
      <label for="password">Password:</label>
      <input type="password" id="password" required>
      <button type="submit" id="submit-btn">Login</button>
    `;
        toggleLink.textContent = "Register";
        toggleLink.previousSibling.textContent = "Belum punya akun? ";
      } else {
        formTitle.textContent = "Register";
        form.innerHTML = `
      <label for="reg-name">Name:</label>
      <input type="text" id="reg-name" required>
      <label for="reg-email">Email:</label>
      <input type="email" id="reg-email" required>
      <label for="reg-password">Password:</label>
      <input type="password" id="reg-password" required>
      <button type="submit" id="submit-btn">Register</button>
    `;
        toggleLink.textContent = "Login";
        toggleLink.previousSibling.textContent = "Sudah punya akun? ";
      }
      const submitBtn = document.getElementById("submit-btn");
      submitBtn.addEventListener("click", handleSubmit);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (isLogin) {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        try {
          await login({ email, password });
          alert("Login successful!");
          location.hash = "#/home";
        } catch (error) {
          alert("Login failed: " + error.message);
        }
      } else {
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        try {
          await register({ name, email, password });
          alert("Register successful! Now login.");
          isLogin = true;
          updateForm();
        } catch (error) {
          alert("Register failed: " + error.message);
        }
      }
    };

    toggleLink.addEventListener("click", (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      updateForm();
    });

    updateForm();
  }
}
