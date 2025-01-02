const API_BASE = "https://kam-backend-phi.vercel.app/api";

export default function renderLeads(container) {
  container.innerHTML = `
    <div class="lead-container">
      <section class="lead-list-section">
        <h3>Existing Leads</h3>
        <ul id="leadList" class="lead-list"></ul>
      </section>

      <section class="add-lead-section">
        <h3>Add New Lead</h3>
        <form id="addLeadForm" class="add-lead-form">
          <div class="form-group">
            <input type="text" id="leadName" placeholder="Lead Name" required>
          </div>
          <div class="form-group">
            <input type="text" id="leadAddress" placeholder="Address" required>
          </div>
          <div class="form-group">
            <input type="text" id="leadContact" placeholder="Contact Number" required>
          </div>
          <div class="form-group">
            <input type="number" id="leadFreq" placeholder="Call Frequency (Days)" min="1">
          </div>
          <button type="button" id="addLeadButton" class="btn-primary">Add Lead</button>
        </form>
      </section>
    </div>
  `;

  fetchLeads();

  document
    .getElementById("addLeadButton")
    .addEventListener("click", async () => {
      const name = document.getElementById("leadName").value.trim();
      const address = document.getElementById("leadAddress").value.trim();
      const contact_number = document
        .getElementById("leadContact")
        .value.trim();
      const call_frequency = document.getElementById("leadFreq").value;

      const token = localStorage.getItem("token");

      if (!name || !address || !contact_number) {
        alert("Please fill in all required fields.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/leads/addLead`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            address,
            contact_number,
            call_frequency,
          }),
        });

        if (response.ok) {
          alert("Lead added successfully!");
          fetchLeads();
          document.getElementById("addLeadForm").reset();
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
      const response = await fetch(`${API_BASE}/leads/getLeads`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const leads = await response.json();
      const leadList = document.getElementById("leadList");
      leadList.innerHTML = "";

      leads.forEach((lead) => {
        const li = document.createElement("li");
        li.className = "lead-item";
        li.innerHTML = `
          <div class="lead-details">
            <h4>${lead.name} <span class="lead-status">(${lead.status})</span></h4>
            <button class="btn-secondary edit-button">Edit</button>
            <details>
              <summary>View Details</summary>
              <p><strong>Address:</strong> ${lead.address}</p>
              <p><strong>Contact:</strong> ${lead.contact_number}</p>
              <p><strong>Lead ID:</strong> ${lead.id}</p>
            </details>
          </div>
        `;

        li.querySelector(".edit-button").addEventListener("click", () => {
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
    form.className = "edit-lead-form";
    form.innerHTML = `
      <h3>Edit Lead</h3>
      <form>
        <div class="form-group">
          <input type="text" id="editLeadName" value="${lead.name}" placeholder="Lead Name">
        </div>
        <div class="form-group">
          <input type="text" id="editLeadAddress" value="${lead.address}" placeholder="Address">
        </div>
        <div class="form-group">
          <input type="text" id="editLeadContact" value="${lead.contact_number}" placeholder="Contact Number">
        </div>
        <div class="form-group">
          <input type="text" id="editLeadStatus" value="${lead.status}" placeholder="Status">
        </div>
        <button type="button" id="updateLeadButton" class="btn-primary">Update Lead</button>
      </form>
    `;

    const container = document.querySelector(".lead-container");
    container.appendChild(form);

    document
      .getElementById("updateLeadButton")
      .addEventListener("click", async () => {
        const updatedName = document.getElementById("editLeadName").value;
        const updatedAddress = document.getElementById("editLeadAddress").value;
        const updatedContact = document.getElementById("editLeadContact").value;
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
              contact_number: updatedContact,
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
