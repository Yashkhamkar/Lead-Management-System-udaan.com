const db = require("../utils/db");

const calculateOverallPerformance = async (req, res) => {
  const { lead_id } = req.params;
  const assigned_kam_id = req.user.id;

  console.log(lead_id, assigned_kam_id);
  // Validate input
  if (!lead_id || !assigned_kam_id) {
    res.status(400).send("Please provide both lead_id and assigned_kam_id.");
    return;
  }
  console.log(lead_id, assigned_kam_id);

  const sql = `
      SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        SUM(order_value) AS monthly_sales
      FROM orders
      WHERE lead_id = ? AND assigned_kam_id = ?
      GROUP BY DATE_FORMAT(order_date, '%Y-%m')
      ORDER BY month DESC
    `;

  try {
    const results = await db.query(sql, [lead_id, assigned_kam_id]);

    if (!results.length) {
      res.status(404).send("No orders found for the given lead.");
      return;
    }

    // Calculate average monthly sales
    const totalSales = results.reduce(
      (sum, row) => sum + parseFloat(row.monthly_sales || 0),
      0
    );
    const monthsCount = results.length;
    const averageSales = totalSales / monthsCount;

    // Determine overall performance
    let overallPerformance = "Bad";
    if (averageSales > 25000) {
      overallPerformance = "Good";
    } else if (averageSales >= 10000) {
      overallPerformance = "Medium";
    }

    res.status(200).send({
      lead_id,
      assigned_kam_id,
      average_monthly_sales: parseFloat(averageSales.toFixed(2)),
      overall_performance: overallPerformance,
    });
  } catch (error) {
    console.error("Error calculating overall performance:", error);
    res.status(500).send("Failed to calculate overall performance.");
  }
};

const getOrderingPatternsAndFrequency = async (req, res) => {
  const { lead_id } = req.params;
  const assigned_kam_id = req.user.id;

  // Validate input
  if (!lead_id) {
    res.status(400).send("Please provide a lead_id.");
    return;
  }

  const sqlOrders = `
      SELECT 
        DATE_FORMAT(order_date, '%Y-%m') AS month,
        COUNT(*) AS order_count,
        SUM(order_value) AS total_sales,
        order_date
      FROM orders 
      WHERE lead_id = ? AND assigned_kam_id = ?
      GROUP BY DATE_FORMAT(order_date, '%Y-%m')
      ORDER BY order_date ASC
    `;

  const sqlAllDates = `
      SELECT 
        order_date 
      FROM orders 
      WHERE lead_id = ? AND assigned_kam_id = ?
      ORDER BY order_date ASC
    `;

  try {
    // Fetch monthly order patterns
    const monthlyData = await db.query(sqlOrders, [lead_id, assigned_kam_id]);

    // Fetch all order dates for frequency calculation
    const dateData = await db.query(sqlAllDates, [lead_id,assigned_kam_id]);

    if (dateData.length < 2) {
      res.status(200).send({
        lead_id,
        monthly_orders: monthlyData,
        average_frequency: "Not enough orders to calculate frequency",
      });
      return;
    }

    // Calculate frequency
    const timestamps = dateData.map((row) =>
      new Date(row.order_date).getTime()
    );
    const firstOrderDate = timestamps[0];
    const lastOrderDate = timestamps[timestamps.length - 1];
    const totalDays = (lastOrderDate - firstOrderDate) / (1000 * 60 * 60 * 24); // Convert ms to days
    const averageFrequency = totalDays / (timestamps.length - 1);

    res.status(200).send({
      lead_id,
      monthly_orders: monthlyData,
      average_frequency: averageFrequency.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching ordering patterns and frequency:", error);
    res.status(500).send("Failed to fetch ordering patterns and frequency.");
  }
};

module.exports = { calculateOverallPerformance,getOrderingPatternsAndFrequency };
