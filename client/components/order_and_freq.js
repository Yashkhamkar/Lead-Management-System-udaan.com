const API_BASE = "https://kam-backend-chi3rk7y5-yashkhamkars-projects.vercel.app/api";

export default function renderOrderingPatterns(container) {
  container.innerHTML = `
    <div class="ordering-patterns-container">
      <h2 class="ordering-title">Ordering Patterns and Frequency</h2>
      <input type="text" id="leadIdInput" class="ordering-input" placeholder="Enter Lead ID">
      <button id="fetchDataButton" class="ordering-button">Fetch Data</button>
      <div id="frequencyContainer" class="frequency-container"></div>
      <div id="chartsContainer" class="charts-container">
        <canvas id="ordersChart"></canvas>
      </div>
    </div>
  `;

  document
    .getElementById("fetchDataButton")
    .addEventListener("click", async () => {
      const leadId = document.getElementById("leadIdInput").value;

      if (!leadId) {
        alert("Please provide a Lead ID.");
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/performance/ordersAndFrequency/${leadId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          alert("Failed to fetch data.");
          return;
        }

        const data = await response.json();
        console.log("Ordering Patterns Data:", data);

        // Display frequency
        const frequencyContainer =
          document.getElementById("frequencyContainer");
        frequencyContainer.innerHTML = `
          <p class="frequency-text">
            <strong>Average Frequency:</strong> ${data.average_frequency} days
          </p>
        `;

        // Prepare data for charts
        const months = data.monthly_orders.map((month) => month.month);
        const orderCounts = data.monthly_orders.map(
          (month) => month.order_count
        );
        const totalSales = data.monthly_orders.map(
          (month) => month.total_sales
        );

        // Render Bar Chart for monthly orders
        const ordersCtx = document
          .getElementById("ordersChart")
          .getContext("2d");
        new Chart(ordersCtx, {
          type: "bar",
          data: {
            labels: months,
            datasets: [
              {
                label: "Order Count",
                data: orderCounts,
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false, // Allow the chart to grow bigger
            plugins: {
              title: {
                display: true,
                text: "Monthly Orders Pattern",
                font: {
                  size: 20,
                },
              },
              legend: {
                position: "top",
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => value, // Keep simple numbers for order counts
                },
              },
            },
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    });
}
