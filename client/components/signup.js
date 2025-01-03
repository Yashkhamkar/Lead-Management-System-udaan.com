import renderDashboard from "./dashboard.js";
const API_BASE = "https://kam-server-1.vercel.app/api";

export default function renderSignup(app) {
  app.innerHTML = `
    <div class="container">
      <h2>Sign Up as KAM</h2>
      <input type="text" id="signupUsername" placeholder="Username">
      <input type="password" id="signupPassword" placeholder="Password">
      <button id="signupButton">Sign Up</button>
      <button id="loginButton">Back to Login</button>
    </div>
  `;
  const token = localStorage.getItem("token");
  if (token) {
    renderDashboard(app);
  }

  // Signup button event listener
  document
    .getElementById("signupButton")
    .addEventListener("click", async () => {
      const username = document.getElementById("signupUsername").value;
      const password = document.getElementById("signupPassword").value;

      if (!username || !password) {
        alert("Please fill in all required fields.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/auth/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          alert(`Signup failed: ${errorText}`);
          return;
        }

        alert("Signup successful! Please log in.");
        // Redirect to login page
        import("./login.js").then(({ default: renderLogin }) => {
          renderLogin(app);
        });
      } catch (error) {
        console.error("Signup error:", error);
      }
    });

  // Back to login button event listener
  document.getElementById("loginButton").addEventListener("click", () => {
    // Redirect to login page
    import("./login.js").then(({ default: renderLogin }) => {
      renderLogin(app);
    });
  });
}
