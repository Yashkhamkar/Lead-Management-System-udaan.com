const API_BASE = "https://lead-management-system-udaan-com.onrender.com/api";

export default function renderContacts(container) {
  container.innerHTML = `
    <h2>Contacts</h2>
    <input type="text" id="leadId" placeholder="Enter Lead ID to fetch contacts">
    <button id="fetchContactsButton">Fetch Contacts</button>
    <ul id="contactList"></ul>
    <h2>Add New Contact</h2>
    <input type="text" id="contactLeadId" placeholder="Lead ID">
    <input type="text" id="contactName" placeholder="Contact Name">
    <input type="text" id="contactRole" placeholder="Role (e.g., Owner, Manager)">
    <input type="text" id="contactPhone" placeholder="Phone Number">
    <input type="text" id="contactEmail" placeholder="Email">
    <button id="addContactButton">Add Contact</button>
  `;

  document
    .getElementById("fetchContactsButton")
    .addEventListener("click", fetchContacts);

  document
    .getElementById("addContactButton")
    .addEventListener("click", async () => {
      const lead_id = document.getElementById("contactLeadId").value;
      const name = document.getElementById("contactName").value;
      const role = document.getElementById("contactRole").value;
      const phone_number = document.getElementById("contactPhone").value;
      const email = document.getElementById("contactEmail").value;

      const token = localStorage.getItem("token");

      if (!lead_id || !name || !role || !phone_number || !email) {
        alert("Please fill in all required fields.");
        return;
      }
      try {
        const response = await fetch(`${API_BASE}/contacts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lead_id, name, role, phone_number, email }),
        });

        if (response.ok) {
          alert("Contact added!");
          fetchContacts();
        } else {
          alert("Failed to add contact.");
        }
      } catch (error) {
        console.error("Error adding contact:", error);
      }
    });

  async function fetchContacts() {
    const lead_id = document.getElementById("leadId").value;
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/contacts/${lead_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        alert("Failed to fetch contacts.");
        return;
      }

      const contacts = await response.json();
      const contactList = document.getElementById("contactList");
      contactList.innerHTML = "";

      contacts.forEach((contact) => {
        const li = document.createElement("li");
        li.textContent = `${contact.name} (${contact.role}) - ${contact.phone_number}, ${contact.email}`;
        contactList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }
}
