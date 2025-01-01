const API_BASE = "https://kam-backend-hazel.vercel.app/api";

export default function renderPerformance(container) {
  container.innerHTML = `
    <h2>Performance Overview</h2>
    <input type="text" id="performanceLeadId" placeholder="Enter Lead ID">
    <button id="fetchPerformanceButton">Fetch Performance</button>
    <div id="performanceSummary"></div>
  `;

  document
    .getElementById("fetchPerformanceButton")
    .addEventListener("click", async () => {
      const leadId = document.getElementById("performanceLeadId").value;
      const token = localStorage.getItem("token");

      if (!leadId) {
        alert("Please provide a Lead ID.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/performance/${leadId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          alert("Failed to fetch performance data.");
          return;
        }

        const data = await response.json();
        console.log("Performance Data:", data);

        // Get performance level for styling
        let performanceClass = "bad";
        if (data.overall_performance === "Good") {
          performanceClass = "good";
        } else if (data.overall_performance === "Medium") {
          performanceClass = "average";
        }

        // Display summary details with cards
        const performanceSummary =
          document.getElementById("performanceSummary");
        performanceSummary.innerHTML = `
          <div class="performance-card ${performanceClass}">
            <p><strong>Lead ID:</strong> ${data.lead_id}</p>
            <p><strong>Assigned KAM ID:</strong> ${data.assigned_kam_id}</p>
            <p><strong>Average Monthly Sales:</strong> ₹${data.average_monthly_sales}</p>
            <p><strong>Overall Performance:</strong> ${data.overall_performance}</p>
          </div>
        `;
      } catch (error) {
        console.error("Error fetching performance data:", error);
      }
    });
}
