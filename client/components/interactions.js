const API_BASE = "http://localhost:5000/api";

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
    .getElementById("addInteractionButton")
    .addEventListener("click", async () => {
      const lead_id = document.getElementById("interactionLead").value;
      const type = document.getElementById("interactionType").value;
      const notes = document.getElementById("interactionNotes").value;
      const follow_up =
        document.getElementById("interactionFollowUp").value === "true";

      // Retrieve the user's device timezone
      const leadTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const token = localStorage.getItem("token");

      if(!lead_id || !type || !notes) {
        alert("Please fill in all required fields.");
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
          }),
        });

        if (response.ok) {
          alert("Interaction added!");
          fetchInteractions();
        } else {
          alert("Failed to add interaction.");
        }
      } catch (error) {
        console.error("Error adding interaction:", error);
      }
    });

  async function fetchInteractions() {
    const lead_id = document.getElementById("interactionLeadId").value;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/interactions/${lead_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        alert("Failed to fetch interactions.");
        return;
      }

      const interactions = await response.json();
      const interactionList = document.getElementById("interactionList");
      interactionList.innerHTML = "";

      interactions.forEach((interaction) => {
        const localDateTime = new Date(
          interaction.date_of_interaction
        ).toLocaleString();
        const li = document.createElement("li");
        li.textContent = `${interaction.type} on ${localDateTime} - ${
          interaction.notes
        } (Follow-Up: ${interaction.follow_up ? "Yes" : "No"})`;
        interactionList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching interactions:", error);
    }
  }
}
