const connection = require("../utils/db");
const { v4: uuidv4 } = require("uuid");

const addContact = async (req, res) => {
  const id = uuidv4();
  const { lead_id, name, role, phone_number, email } = req.body;
  const assigned_kam_id = req.user.id;
  if (!lead_id || !name || !role || !phone_number || !email) {
    res.status(400).send("Please fill in all required fields");
    return;
  }
  const phoneRegex = /^\+(\d{1,3})[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/;
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

  if (!email.match(emailRegex)) {
    res.status(400).send("Please provide a valid email address");
    return;
  }
  if (!phone_number.match(phoneRegex)) {
    res.status(400).send("Please provide a valid phone number");
    return;
  }
  const sql = "INSERT INTO contacts SET ?";
  const newContact = {
    id,
    lead_id,
    name,
    role,
    phone_number,
    email,
    assigned_kam_id,
  };

  const result = await connection.query(sql, newContact);
  if (result.error) {
    console.log("Error adding a new contact:", result.error);
    res.status(500).send("Failed to add a new contact");
    return;
  }
  res.status(201).send({ id, ...newContact });
};

const getContactsByLeadId = async (req, res) => {
  const lead_id = req.params.lead_id;
  const assigned_kam_id = req.user.id;
  console.log("lead_id", lead_id);
  if (!lead_id) {
    res.status(400).send("Please provide a lead_id");
    return;
  }
  const sql = "SELECT * FROM contacts WHERE lead_id=? AND assigned_kam_id=?";
  const result = await connection.query(sql, [lead_id, assigned_kam_id]);
  if (result.error) {
    console.log("Error getting contacts:", result.error);
    res.status(500).send("Failed to get contacts");
    return;
  }
  res.status(200).send(result);
};

const updateContact = async (req, res) => {
  const id = req.params.id;
  const assigned_kam_id = req.user.id;
  const { lead_id, name, role, phone_number, email } = req.body;
  if (!id) {
    res.status(400).send("Please provide an id");
    return;
  }
  const sql = "UPDATE contacts SET ? WHERE id=? AND assigned_kam_id=?";
  const updatedContact = { lead_id, name, role, phone_number, email };

  const result = await connection.query(sql, [
    updatedContact,
    id,
    assigned_kam_id,
  ]);
  if (result.error) {
    console.log("Error updating a contact:", result.error);
    res.status(500).send("Failed to update a contact");
    return;
  }
  res.status(200).send({ id, ...updatedContact });
};

const getLeadsRequiringCallsToday = async (req, res) => {
  const assigned_kam_id = req.user.id; // Get the KAM ID from the logged-in user
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
  const sql = `
        SELECT 
          id, 
          name, 
          contact_number, 
          status, 
          last_call_date, 
          next_call_date
        FROM leads
        WHERE assigned_kam_id = ? 
          AND (DATE(next_call_date) = DATE(?) OR last_call_date IS NOT NULL)
        ORDER BY next_call_date
      `;

  try {
    // Pass the full date-time string for proper matching
    const results = await connection.query(sql, [assigned_kam_id, new Date()]);

    if (results.length === 0) {
      res.status(200).send([]);
      return;
    }

    res.status(200).send(results);
  } catch (error) {
    console.error("Error fetching leads requiring calls today:", error);
    res.status(500).send("Failed to fetch leads requiring calls today.");
  }
};

module.exports = {
  addContact,
  getContactsByLeadId,
  updateContact,
  getLeadsRequiringCallsToday,
};
