const API_BASE = "https://kam-backend-phi.vercel.app/api";

export default function renderTransferLeadPage(container) {
  container.innerHTML = `
    <h2>Transfer Lead to Another KAM</h2>
    <div>
      <input type="text" id="leadId" placeholder="Lead ID" />
      <input type="text" id="newKamId" placeholder="New KAM ID" />
      <input type="text" id="newKamName" placeholder="New KAM Name" />
      <button id="transferButton">Transfer Lead</button>
    </div>
  `;

  document
    .getElementById("transferButton")
    .addEventListener("click", async () => {
      const leadId = document.getElementById("leadId").value;
      const newKamId = document.getElementById("newKamId").value;
      const newKamName = document.getElementById("newKamName").value;

      if (!leadId || !newKamId || !newKamName) {
        alert("Please fill in all required fields.");
        return;
      }

      const token = localStorage.getItem("token"); // Assuming user authentication token is stored

      try {
        const response = await fetch(`${API_BASE}/leads/changeKAM`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lead_id: leadId,
            new_kam_id: newKamId,
            new_kam: newKamName,
          }),
        });

        if (response.ok) {
          alert("Lead transferred successfully!");
        } else {
          const errorMessage = await response.text();
          alert(`Error transferring lead: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error transferring lead:", error);
        alert("An error occurred while transferring the lead.");
      }
    });
}
