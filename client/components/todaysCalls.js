const API_BASE = "https://kam-server-1.vercel.app/api";
// const API_BASE = "http://localhost:5000/api";

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
      console.log(response);
      if (response.ok) {
        const data = await response.json();
        const leads = data.leads; // Access the 'leads' array from the response
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
              <p><strong>Contact:</strong> ${lead.contact_number}</p>
              <p><strong>Contact within this Time Range:</strong> ${
                formatTime(lead.available_time_range.start_time)
              } - ${formatTime(lead.available_time_range.end_time)}</p>
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

  // Function to format time (YYYY-MM-DD HH:MM:SS AM/PM)
  function formatTime(dateString) {
    const date = new Date(dateString);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const amPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format

    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${amPm}`;
  }
}
