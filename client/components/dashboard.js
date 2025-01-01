import renderLeads from "./leads.js";
import renderContacts from "./contacts.js";
import renderInteractions from "./interactions.js";
import renderLogin from "./login.js";
import renderPerformance from "./performance.js";
import renderOrderingPatterns from "./order_and_freq.js";
import renderCallsToday from "./todaysCalls.js";
import renderTransferLeadPage from "./lead_transfer.js";
export default function renderDashboard(app) {
  const token = localStorage.getItem("token");
  if (!token) {
    renderLogin(app);
    return;
  }
  app.innerHTML = `
    <header class="dashboard-header">
      <h1>KAM Dashboard</h1>
      <button id="logoutButton" class="btn-logout">Logout</button>
    </header>
    <div class="dashboard-container">
      <nav class="dashboard-nav">
        <button id="manageLeads" class="nav-button">Manage Leads</button>
        <button id="manageContacts" class="nav-button">Manage Contacts</button>
        <button id="manageInteractions" class="nav-button">Manage Interactions</button>
        <button id="viewPerformance" class="nav-button">View Performance</button>
        <button id="viewOrderAndFreq" class="nav-button">Ordering Patterns</button>
        <button id="viewTodaysCalls" class="nav-button">Today's Calls</button>
        <button id="transferLead" class="nav-button">Transfer Lead</button>
      </nav>
      <main id="content" class="dashboard-content"></main>
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
  document.getElementById("viewTodaysCalls").addEventListener("click", () => {
    renderCallsToday(document.getElementById("content"));
  });
  document.getElementById("transferLead").addEventListener("click", () => {
    renderTransferLeadPage(document.getElementById("content"));
  });

  // Load default section
  renderLeads(document.getElementById("content"));
}
