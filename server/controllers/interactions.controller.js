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

  console.log(req.body);
  if (!lead_id || !type || !notes || !leadTimezone) {
    res.status(400).send("Please fill in all required fields");
    console.log(req.body);
    return;
  }

  if (!moment.tz.names().includes(leadTimezone)) {
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

  const date_of_interaction = moment()
    .tz(leadTimezone)
    .format("YYYY-MM-DDTHH:mm:ssZ");
  const utcTime = moment().utc().format("YYYY-MM-DDTHH:mm:ssZ");
  console.log("Date of interaction:", date_of_interaction);
  console.log("UTC time:", utcTime);

  if (type === "Call") {
    const businessStartHour = 9; // 9 AM
    const businessEndHour = 17; // 5 PM
    const nowInLeadTimezone = moment().tz(leadTimezone);
    const leadHour = nowInLeadTimezone.hour();
    console.log("Lead hour:", leadHour);
    if (leadHour < businessStartHour || leadHour >= businessEndHour) {
      res
        .status(400)
        .send("Calls can only be placed during business hours of leadtimezone (9 AM to 5 PM)");
      return;
    }
  }

  const sql = "INSERT INTO interactions SET ?";
  const newInteraction = {
    id,
    lead_id,
    date_of_interaction,
    utcTime,
    type,
    notes,
    follow_up,
    call_duration,
    order_value,
    assigned_kam_id,
  };

  try {
    await db.query(sql, newInteraction);

    if (type === "Call") {
      // Calculate next_call_date within business hours
      let nextCallDate = moment()
        .tz(leadTimezone)
        .add(req.body.call_frequency, "days")
        .startOf("day")
        .hour(9); // Default to 9 AM
      const businessStartHour = 9;
      const businessEndHour = 17;

      // Adjust if the calculated time is outside business hours
      const calculatedHour = nextCallDate.hour();
      if (calculatedHour < businessStartHour) {
        nextCallDate.hour(businessStartHour);
      } else if (calculatedHour >= businessEndHour) {
        nextCallDate.add(1, "day").hour(businessStartHour);
      }

      const nextCallDateUTC = nextCallDate.utc().format("YYYY-MM-DDTHH:mm:ssZ");

      const leadSql = `
        UPDATE leads
        SET last_call_date = ?, next_call_date = ?, status = 'Active'
        WHERE id = ? AND assigned_kam_id = ?`;
      await db.query(leadSql, [
        date_of_interaction,
        nextCallDateUTC,
        lead_id,
        assigned_kam_id,
      ]);
    }

    if (type === "Order") {
      const ordersSql = `
        INSERT INTO orders (id, lead_id, order_date, order_value, assigned_kam_id)
        VALUES (?, ?, ?, ?, ?)`;
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
  console.log(result);
  if (result.length === 0) {
    res.status(404).send("Interactions not found for this lead");
    return;
  }
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
