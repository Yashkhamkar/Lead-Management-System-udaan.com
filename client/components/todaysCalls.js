const API_BASE = "https://kam-servers-1.vercel.app/api";

export default function renderCallsToday(container) {
  container.innerHTML = `
    <h2>Leads Requiring Calls Today</h2>
    <ul id="callTodayList"></ul>
  `;

  fetchLeadsRequiringCallsToday();

  async function fetchLeadsRequiringCallsToday() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/contacts/todaysCalls`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const leads = await response.json();
        console.log(leads);
        const callTodayList = document.getElementById("callTodayList");
        callTodayList.innerHTML = "";

        if (leads.length === 0) {
          callTodayList.innerHTML = `<li>No leads require calls today.</li>`;
          return;
        }

        leads.forEach((lead) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <div>
              <strong>${lead.name}</strong>
              <p><strong>Last Call Date & Time:</strong> ${
                lead.last_call_date
                  ? formatDateTime(lead.last_call_date)
                  : "Not Available"
              }</p>
              <p><strong>Today's Call Time:</strong> ${
                lead.next_call_date
                  ? formatTime(lead.next_call_date)
                  : "Not Available"
              }</p>
              <p><strong>Contact:</strong> ${lead.contact_number}</p>
              <p><strong>Status:</strong> ${lead.status}</p>
            </div>
          `;
          callTodayList.appendChild(li);
        });
      } else {
        console.error("Failed to fetch leads requiring calls today.");
        alert("Error fetching data.");
      }
    } catch (error) {
      console.error("Error fetching leads requiring calls today:", error);
    }
  }

  // Function to format date and time (YYYY-MM-DD HH:MM:SS AM/PM) for Last Call
  function formatDateTime(dateString) {
    const date = new Date(dateString);

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${year}-${month}-${day} ${String(hours).padStart(
      2,
      "0"
    )}:${minutes}:${seconds} ${amPm}`;
  }

  // Function to extract time only (HH:MM:SS AM/PM) for Today's Call
  function formatTime(dateString) {
    const date = new Date(dateString);

    let hours = date.getUTCHours();
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${amPm}`;
  }
}
