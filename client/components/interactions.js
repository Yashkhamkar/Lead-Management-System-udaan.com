const API_BASE = "https://kam-backend-phi.vercel.app/api";
// const API_BASE = "http://localhost:5000/api";/

export default function renderInteractions(container) {
  container.innerHTML = `
    <h2>Interactions</h2>
    <input type="text" id="interactionLeadId" placeholder="Enter Lead ID to fetch interactions">
    <button id="fetchInteractionsButton">Fetch Interactions</button>
    <ul id="interactionList"></ul>
    <h2>Add New Interaction</h2>
    <input type="text" id="interactionLead" placeholder="Lead ID">
    <input type="text" id="interactionType" placeholder="Type (e.g., Call, Visit)">
    <input type="text" id="interactionNotes" placeholder="Notes">
    <input type="number" id="interactionDuration" placeholder="Duration (in minutes)">
    <input type="number" id="interactionOrderValue" placeholder="Order value (optional)">
    <select id="interactionTimezone">
      <option value="" disabled selected>Fetching lead's timezone...</option>
    </select>
    <select id="interactionFollowUp">
      <option value="true">Follow-Up Required</option>
      <option value="false">No Follow-Up Required</option>
    </select>
    <button id="addInteractionButton">Add Interaction</button>
  `;

  document
    .getElementById("fetchInteractionsButton")
    .addEventListener("click", fetchInteractions);

  document
    .getElementById("interactionLead")
    .addEventListener("blur", fetchLeadTimezone);

  document
    .getElementById("addInteractionButton")
    .addEventListener("click", addInteraction);

  async function fetchInteractions() {
    const lead_id = document.getElementById("interactionLeadId").value.trim();
    const token = localStorage.getItem("token");
    if (!lead_id) {
      alert("Please enter a lead ID.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/interactions/${lead_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText);
        return;
      }

      const interactions = await response.json();
      const interactionList = document.getElementById("interactionList");
      interactionList.innerHTML = "";

      interactions.forEach((interaction) => {
        const date = interaction.date_of_interaction;
        const dateObj = new Date(date);

        // Format the date (DD-MM-YYYY)
        const day = String(dateObj.getUTCDate()).padStart(2, "0");
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
        const year = dateObj.getUTCFullYear();
        const formattedDate = `${day}-${month}-${year}`;

        const hours = dateObj.getUTCHours();
        const minutes = dateObj.getUTCMinutes();
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
        const formattedMinutes = minutes.toString().padStart(2, "0");
        const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

        const li = document.createElement("li");
        li.textContent = `${
          interaction.type
        } on ${formattedDate} at ${formattedTime} (Follow-Up: ${
          interaction.follow_up ? "Yes" : "No"
        }) - ${interaction.notes}`;
        interactionList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  }

  async function fetchLeadTimezone() {
    const leadId = document.getElementById("interactionLead").value.trim();
    const token = localStorage.getItem("token");

    if (!leadId) {
      alert("Please enter a valid Lead ID.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/leads/getLead/${leadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response:", response);
      if (!response.ok) {
        const errorText = await response.text();
        alert(errorText);
        return;
      }

      const lead = await response.json();
      const leadTimezoneSelect = document.getElementById("interactionTimezone");

      // Set the lead's timezone in the dropdown
      leadTimezoneSelect.innerHTML = `<option value="${lead.timezone}">${lead.timezone}</option>`;
      leadTimezoneSelect.disabled = true; // Disable to prevent changes
    } catch (error) {
      console.error("Error fetching lead details:", error);
    }
  }

  async function addInteraction() {
    const lead_id = document.getElementById("interactionLead").value.trim();
    const type = document.getElementById("interactionType").value.trim();
    const notes = document.getElementById("interactionNotes").value.trim();
    const follow_up =
      document.getElementById("interactionFollowUp").value === "true";
    const call_duration = document
      .getElementById("interactionDuration")
      .value.trim();
    const order_value = document
      .getElementById("interactionOrderValue")
      .value.trim();
    const leadTimezone = document.getElementById("interactionTimezone").value;

    const token = localStorage.getItem("token");

    if (!lead_id || !type || !notes || !leadTimezone) {
      alert("Please fill in all required fields, including timezone.");
      return;
    }

    if (type === "Call" && (!call_duration || call_duration <= 0)) {
      alert("Call duration must be positive for calls");
      return;
    }
    if (type === "Order" && (!order_value || order_value <= 0)) {
      alert("Order value must be positive for orders");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/interactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lead_id,
          type,
          notes,
          follow_up,
          leadTimezone,
          call_duration,
          order_value,
        }),
      });

      if (response.ok) {
        alert("Interaction added!");
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error("Error adding interaction:", error);
    }
  }
}
