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
                  ? formatDateTimeToUserTimezone(lead.last_call_date)
                  : "Not Available"
              }</p>
              <p><strong>Today's Call Time:</strong> ${
                lead.next_call_date
                  ? formatTimeToUserTimezone(lead.next_call_date)
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

  // Function to format date and time (MM/DD/YYYY, HH:MM:SS AM/PM) for last call
  function formatDateTimeToUserTimezone(dateString) {
    const date = new Date(dateString); // Parse UTC date string into a Date object
    return date.toLocaleString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  // Function to extract time only (HH:MM:SS AM/PM) for today's call
  function formatTimeToUserTimezone(dateString) {
    const date = new Date(dateString); // Parse UTC date string into a Date object
    return date.toLocaleTimeString("en-US", {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }
}
