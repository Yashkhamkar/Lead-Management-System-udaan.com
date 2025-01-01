const API_BASE = "https://kam-server-69.vercel.app/api";

export default function renderLeads(container) {
  container.innerHTML = `
    <h2>Leads</h2>
    <ul id="leadList"></ul>
    <h2>Add New Lead</h2>
    <input type="text" id="leadName" placeholder="Lead Name">
    <input type="text" id="leadAddress" placeholder="Address">
    <input type="text" id="leadContact" placeholder="Contact Number">
    <input type="text" id="leadStatus" placeholder="Status (New/Active/Inactive)">
    <input type="number" id="leadFreq" placeholder="Days">
    <button id="addLeadButton">Add Lead</button>
  `;

  fetchLeads();

  document
    .getElementById("addLeadButton")
    .addEventListener("click", async () => {
      const name = document.getElementById("leadName").value;
      const address = document.getElementById("leadAddress").value;
      const contact_number = document.getElementById("leadContact").value;
      const status = document.getElementById("leadStatus").value;
      const call_frequency = document.getElementById("leadFreq").value;

      const token = localStorage.getItem("token");

      if (!name || !address || !contact_number || !status) {
        alert("Please fill in all required fields.");
        return
      }

      try {
        const response = await fetch(`${API_BASE}/leads`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            address,
            contact_number,
            status,
            call_frequency
          }),
        });

        if (response.ok) {
          alert("Lead added!");
          fetchLeads();
        } else {
          alert("Failed to add lead.");
        }
      } catch (error) {
        console.error("Error adding lead:", error);
      }
    });

  async function fetchLeads() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const leads = await response.json();
      console.log(leads);
      const leadList = document.getElementById("leadList");
      leadList.innerHTML = "";


      leads.forEach((lead) => {
        const li = document.createElement("li");
        var total_order_value = lead.total_order_value;
        if (total_order_value==null||total_order_value==undefined) {
          total_order_value = 0;
        }
        li.innerHTML = `
          <div>
            <span>${lead.name} - ${lead.status}</span>
            <button class="editButton">Edit</button>
            <details>
              <summary>Details</summary>
              <p><strong>Address:</strong> ${lead.address}</p>
              <p><strong>Contact:</strong> ${lead.contact_number}</p>
              <p><strong>Id:</strong> ${lead.id}</p>
              <p><strong>Total order value:</strong> ${total_order_value}</p>
            </details>
          </div>
        `;

        // Handle edit button
        li.querySelector(".editButton").addEventListener("click", () => {
          showEditLeadForm(lead);
        });

        leadList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  }

  function showEditLeadForm(lead) {
    const form = document.createElement("div");
    form.innerHTML = `
      <h3>Edit Lead</h3>
      <input type="text" id="editLeadName" value="${lead.name}" placeholder="Restaurant Name">
      <input type="text" id="editLeadAddress" value="${lead.address}" placeholder="Address">
      <input type="text" id="editLeadContact" value="${lead.contact_number}" placeholder="Contact Number">
      <input type="text" id="editLeadStatus" value="${lead.status}" placeholder="Status">
      <button id="updateLeadButton">Update Lead</button>
    `;

    const container = document.getElementById("leadList").parentNode;
    container.appendChild(form);

    document
      .getElementById("updateLeadButton")
      .addEventListener("click", async () => {
        const updatedName = document.getElementById("editLeadName").value;
        const updatedAddress = document.getElementById("editLeadAddress").value;
        const updatedContactNumber =
          document.getElementById("editLeadContact").value;
        const updatedStatus = document.getElementById("editLeadStatus").value;

        const token = localStorage.getItem("token");

        try {
          const response = await fetch(`${API_BASE}/leads/${lead.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: updatedName,
              address: updatedAddress,
              contact_number: updatedContactNumber,
              status: updatedStatus,
            }),
          });

          if (response.ok) {
            alert("Lead updated successfully!");
            fetchLeads();
            container.removeChild(form);
          } else {
            alert("Failed to update lead.");
          }
        } catch (error) {
          console.error("Error updating lead:", error);
        }
      });
  }
}
