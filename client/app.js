import renderLogin from "./components/login.js";
import renderDashboard from "./components/dashboard.js";

const app = document.getElementById("app");

// Check if user is logged in
if (localStorage.getItem("token")) {
  renderDashboard(app); // Show dashboard if authenticated
} else {
  renderLogin(app); // Show login screen otherwise
}
