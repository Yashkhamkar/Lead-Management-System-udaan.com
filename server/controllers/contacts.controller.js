const connection = require("../utils/db");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment-timezone");
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
  if (result.length === 0) {
    res.status(404).send("Contacts not found for this lead");
    return;
  }
  if (result.error) {
    console.log("Error getting contacts:", result.error);
    res.status(500).send(result.error);
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
  const assigned_kam_id = req.user.id;

  try {
    // Fetch all leads assigned to the KAM
    const leadsQuery = `
      SELECT id, name, contact_number, timezone, next_call_date
      FROM leads
      WHERE assigned_kam_id = ?
    `;
    const leads = await connection.query(leadsQuery, [assigned_kam_id]);

    if (!leads || leads.length === 0) {
      res.status(200).send({
        message: "No leads found",
        leads: [],
      });
      return;
    }

    const businessStartHour = 9; // 9 AM
    const businessEndHour = 17; // 5 PM
    const kamTimezone = "Asia/Kolkata"; // KAM's timezone

    // Build the response for each lead
    const responseLeads = leads
      .map((lead) => {
        if (!lead.next_call_date) {
          return null; // Skip leads without a next_call_date
        }

        const leadTimezone = lead.timezone;
        // Compare the date part of next_call_date with today's date in the lead's timezone
        const nextCallDate = moment(lead.next_call_date).startOf("day");
        const today = moment().startOf("day");

        if (!nextCallDate.isSame(today, "day")) {
          return null; // Skip if next_call_date is not today
        }

        // Calculate business hours for the lead in their timezone
        const startTime = moment()
          .tz(leadTimezone)
          .startOf("day")
          .hour(businessStartHour);
        const endTime = moment()
          .tz(leadTimezone)
          .startOf("day")
          .hour(businessEndHour);

        const startTimeInKamTimezone = startTime.clone().tz(kamTimezone);
        const endTimeInKamTimezone = endTime.clone().tz(kamTimezone);
        
        return {
          id: lead.id,
          name: lead.name,
          contact_number: lead.contact_number,
          lead_timezone: leadTimezone,
          requires_call_today: true,
          available_time_range: {
            start_time: startTimeInKamTimezone.format("YYYY-MM-DD HH:mm:ss"),
            end_time: endTimeInKamTimezone.format("YYYY-MM-DD HH:mm:ss"),
          },
        };
      })
      .filter((lead) => lead !== null); // Remove null leads

    res.status(200).send({
      message: "Today's calls retrieved successfully",
      leads: responseLeads,
    });
  } catch (error) {
    console.error("Error fetching today's calls:", error);
    res.status(500).send("Failed to fetch today's calls.");
  }
};

module.exports = {
  addContact,
  getContactsByLeadId,
  updateContact,
  getLeadsRequiringCallsToday,
};
