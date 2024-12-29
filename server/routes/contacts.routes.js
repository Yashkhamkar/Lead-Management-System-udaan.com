const router = require('express').Router();
const {addContact, getContactsByLeadId, updateContact}=require('../controllers/contacts.controller');
const protect = require('../middleware/authMiddleware');

router.route('/').post(protect,addContact);
router.route('/:lead_id').get(protect,getContactsByLeadId);
router.route('/:id').put(protect,updateContact);

module.exports=router;