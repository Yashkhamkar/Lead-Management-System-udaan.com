import renderDashboard from "./dashboard.js";
import renderSignup from "./signup.js";

const API_BASE = "https://kam-backend-chi3rk7y5-yashkhamkars-projects.vercel.app/api";

export default function renderLogin(app) {
  app.innerHTML = `
    <div class="container">
      <h2>Login</h2>
      <input type="text" id="username" placeholder="Username">
      <input type="password" id="password" placeholder="Password">
      <button id="loginButton">Login</button>
      <button id="signupKamButton">Sign up as KAM</button>
    </div>
  `;

  const token=localStorage.getItem("token");
  if(token){
    renderDashboard(app);
  }
  
  document.getElementById("loginButton").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert("Login failed!");
        return;
      }

      const { token } = await response.json();
      localStorage.setItem("token", token);
      alert("Login successful!");
      renderDashboard(app);
    } catch (error) {
      console.error("Login error:", error);
    }
  });

  document.getElementById("signupKamButton").addEventListener("click", () => {
    renderSignup(app);
  });
}
