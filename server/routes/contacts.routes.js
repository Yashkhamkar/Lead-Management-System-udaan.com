const router = require('express').Router();
const {addContact, getContactsByLeadId, updateContact, getLeadsRequiringCallsToday}=require('../controllers/contacts.controller');
const protect = require('../middleware/authMiddleware');

router.route('/').post(protect,addContact);
router.route('/leads/:lead_id').get(protect,getContactsByLeadId);
router.route('/:id').put(protect,updateContact);
router.route('/todaysCalls').get(protect,getLeadsRequiringCallsToday);

module.exports=router;