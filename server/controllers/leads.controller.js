const db = require("../utils/db");
const { v4: uuidv4 } = require("uuid");

const addLead = async (req, res) => {
  const id = uuidv4();
  const { name, address, contact_number, call_frequency, timezone } =
    req.body;
  const assigned_kam_id = req.user.id;
  const assigned_kam = req.user.username;
  if (
    !name ||
    !address ||
    !contact_number ||
    !call_frequency ||
    !timezone
  ) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  const phoneRegex = /^\+(\d{1,3})[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const status = "New";
  if (!contact_number.match(phoneRegex)) {
    res.status(400).send("Please provide a valid phone number");
    return;
  }
  const sql = "INSERT INTO leads SET ?";
  const newLead = {
    id,
    name,
    address,
    contact_number,
    timezone,
    status,
    assigned_kam,
    assigned_kam_id,
    call_frequency,
  };

  const result = await db.query(sql, newLead);
  console.log(result);
  if (result.error) {
    console.log("Error adding a new lead:", result.error);
    res.status(500).send("Failed to add a new lead");
    return;
  }
  res.status(201).send({ id, ...newLead });
};

const getAllLeads = async (req, res) => {
  assigned_kam_id = req.user.id;
  const sql = "SELECT * FROM leads WHERE assigned_kam_id = ? ";
  const result = await db.query(sql, [assigned_kam_id]);
  if (result.error) {
    console.log("Error getting leads:", result.error);
    res.status(500).send("Failed to get leads");
    return;
  }
  res.status(200).send(result);
};

const getLeadById = async (req, res) => {
  const id = req.params.id;
  const assigned_kam_id = req.user.id;
  if (!id) {
    res.status(400).send("Please provide an id");
    return;
  }
  const sql = "SELECT * FROM leads WHERE id = ? AND assigned_kam_id = ?";
  const result = await db.query(sql, [id, assigned_kam_id]);
  if (result.error) {
    console.log("Error getting a lead:", result.error);
    res.status(500).send("Failed to get a lead");
    return;
  }
  if (result.length === 0) {
    res.status(404).send("Lead not found");
    return;
  }
  res.status(200).send(result[0]);
};

const updateLead = async (req, res) => {
  const id = req.params.id;
  const assigned_kam_id = req.user.id;
  if (!id) {
    res.status(400).send("Please provide an id");
    return;
  }
  if (!assigned_kam_id) {
    res.status(400).send("Please provide an assigned kam");
    return;
  }
  const { name, address, contact_number, status } = req.body;
  if (!name || !address || !contact_number || !status) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  const phoneRegex = /^\+(\d{1,3})[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
  if (!contact_number.match(phoneRegex)) {
    res.status(400).send("Please provide a valid phone number");
    return;
  }
  const sql = "UPDATE leads SET ? WHERE id = ? AND assigned_kam_id = ?";
  const updatedLead = { name, address, contact_number, status };
  const result = await db.query(sql, [updatedLead, id, assigned_kam_id]);
  if (result.error) {
    console.log("Error updating a lead:", result.error);
    res.status(500).send("Failed to update a lead");
    return;
  }
  if (result.affectedRows === 0) {
    res.status(404).send("Lead not found");
    return;
  }
  res.status(200).send({ id, ...updatedLead });
};

const changeKAM = async (req, res) => {
  const { new_kam_id, lead_id, new_kam } = req.body; // New KAM ID
  const current_kam_id = req.user.id; // Current KAM ID from the token
  if (!lead_id || !new_kam_id) {
    res.status(400).send("Please provide both lead ID and new KAM ID.");
    return;
  }

  try {
    // Verify lead belongs to the current KAM
    const leadCheckQuery = `SELECT * FROM leads WHERE id = ? AND assigned_kam_id = ?`;
    const lead = await db.query(leadCheckQuery, [lead_id, current_kam_id]);

    if (lead.length === 0) {
      res.status(404).send("Lead not found or you are not authorized.");
      return;
    }

    // Update KAM for the lead
    const updateLeadQuery = `UPDATE leads SET assigned_kam_id = ?,assigned_kam=? WHERE id = ?`;
    await db.query(updateLeadQuery, [new_kam_id, new_kam, lead_id]);

    // Update KAM for associated contacts, interactions, and orders
    const updateContactsQuery = `UPDATE contacts SET assigned_kam_id = ? WHERE lead_id = ?`;
    const updateInteractionsQuery = `UPDATE interactions SET assigned_kam_id = ? WHERE lead_id = ?`;
    const updateOrdersQuery = `UPDATE orders SET assigned_kam_id = ? WHERE lead_id = ?`;

    await db.query(updateContactsQuery, [new_kam_id, lead_id]);
    await db.query(updateInteractionsQuery, [new_kam_id, lead_id]);
    await db.query(updateOrdersQuery, [new_kam_id, lead_id]);

    res.status(200).send({
      message: "KAM changed successfully.",
      lead_id,
      old_kam_id: current_kam_id,
      new_kam_id,
    });
  } catch (error) {
    console.error("Error changing KAM:", error);
    res.status(500).send("Failed to change KAM.");
  }
};

module.exports = { addLead, getAllLeads, updateLead, getLeadById, changeKAM };
