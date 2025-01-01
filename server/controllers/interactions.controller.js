const db = require("../utils/db");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");

const addInteraction = async (req, res) => {
  const id = uuidv4();
  const {
    lead_id,
    type,
    notes,
    follow_up,
    leadTimezone,
    order_value,
    call_duration,
  } = req.body;
  const assigned_kam_id = req.user.id;

  if (!lead_id || !type || !notes) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  // Validate timezone
  if (!leadTimezone || !moment.tz.names().includes(leadTimezone)) {
    res.status(400).send("Invalid or missing timezone");
    return;
  }
  if (type === "Call" && (!call_duration || call_duration <= 0)) {
    res.status(400).send("Call duration must be positive for calls");
    return;
  }
  if (type === "Order" && (!order_value || order_value <= 0)) {
    res.status(400).send("Order value must be positive for orders");
    return;
  }

  // Set the date with the timezone
  const date_of_interaction = moment()
    .tz(leadTimezone)
    .format("YYYY-MM-DDTHH:mm:ssZ");

  // const date_of_interaction = moment().tz(leadTimezone).format();
  const sql = "INSERT INTO interactions SET ?";
  const newInteraction = {
    id,
    lead_id,
    date_of_interaction,
    type,
    notes,
    follow_up,
    call_duration,
    order_value,
    assigned_kam_id,
  };
  console.log(newInteraction)
  try {
    await db.query("INSERT INTO interactions SET ?", newInteraction);

    if (type === "Call") {
      // Update last_call_date and next_call_date for the lead
      const leadSql = `
        UPDATE leads
        SET last_call_date = ?, next_call_date = DATE_ADD(?, INTERVAL call_frequency DAY), status = 'Active'
        WHERE id = ? AND assigned_kam_id = ?`;
      await db.query(leadSql, [
        date_of_interaction,
        date_of_interaction,
        lead_id,
        assigned_kam_id,
      ]);
    }
    if (type === "Order") {
      const ordersSql = `INSERT INTO orders (id,lead_id, order_date, order_value, assigned_kam_id)
      VALUES (?, ?, ?, ?,?)`;
      const order_id = uuidv4();
      await db.query(ordersSql, [
        order_id,
        lead_id,
        date_of_interaction,
        order_value,
        assigned_kam_id,
      ]);
    }
    
    res.status(201).send(newInteraction);
  } catch (error) {
    console.error("Error adding interaction:", error);
    res.status(500).send("Failed to add interaction");
  }
};

const getInteractionsByLeadId = async (req, res) => {
  const lead_id = req.params.lead_id;
  const assigned_kam_id = req.user.id;
  if (!lead_id) {
    res.status(400).send("Please provide a lead_id");
    return;
  }
  const sql =
    "SELECT * FROM interactions WHERE lead_id = ? AND assigned_kam_id = ?";
  const result = await db.query(sql, [lead_id, assigned_kam_id]);
  console.log(result)
  if (result.error) {
    console.log("Error getting interactions:", result.error);
    res.status(500).send("Failed to get interactions");
    return;
  }
  res.status(200).send(result);
};

const updateInteraction = async (req, res) => {
  const id = req.params.id;
  const assigned_kam_id = req.user.id;
  if (!id) {
    res.status(400).send("Please provide an id");
    return;
  }
  const date_of_interaction = new Date().toISOString();
  const { lead_id, type, notes, follow_up } = req.body;
  const sql = "UPDATE interactions SET ? WHERE id = ? AND assigned_kam_id = ?";
  const updatedInteraction = {
    lead_id,
    type,
    notes,
    follow_up,
    date_of_interaction,
  };

  const result = await db.query(sql, [updatedInteraction, id, assigned_kam_id]);
  if (result.error) {
    console.log("Error updating an interaction:", result.error);
    res.status(500).send("Failed to update an interaction");
    return;
  }
  res.status(200).send({ id, ...updatedInteraction });
};

module.exports = { addInteraction, getInteractionsByLeadId, updateInteraction };
