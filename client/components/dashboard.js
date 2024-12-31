import renderLeads from "./leads.js";
import renderContacts from "./contacts.js";
import renderInteractions from "./interactions.js";
import renderLogin from "./login.js";
import renderPerformance from "./performance.js";
import renderOrderingPatterns from "./order_and_freq.js";
export default function renderDashboard(app) {
  const token = localStorage.getItem("token");
  if (!token) {
    renderLogin(app);
    return;
  }
  app.innerHTML = `
    <header>
      <h1>KAM Dashboard</h1>
    </header>
    <div class="container">
      <button id="logoutButton">Logout</button>
      <div id="navButtons">
        <button id="manageLeads">Manage Leads</button>
        <button id="manageContacts">Manage Contacts</button>
        <button id="manageInteractions">Manage Interactions</button>
        <button id="viewPerformance">View Performance</button>
        <button id="viewOrderAndFreq">View ordering patterns and frequency</button>
      </div>
      <div id="content"></div>
    </div>
  `;

  document.getElementById("logoutButton").addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload();
  });

  document.getElementById("manageLeads").addEventListener("click", () => {
    renderLeads(document.getElementById("content"));
  });

  document.getElementById("manageContacts").addEventListener("click", () => {
    renderContacts(document.getElementById("content"));
  });

  document
    .getElementById("manageInteractions")
    .addEventListener("click", () => {
      renderInteractions(document.getElementById("content"));
    });

  document.getElementById("viewPerformance").addEventListener("click", () => {
    renderPerformance(document.getElementById("content"));
  });
  document.getElementById("viewOrderAndFreq").addEventListener("click", () => {
    renderOrderingPatterns(document.getElementById("content"));
  });

  // Load default section
  renderLeads(document.getElementById("content"));
}
