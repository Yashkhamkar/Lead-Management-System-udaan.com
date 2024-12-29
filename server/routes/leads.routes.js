const router = require('express').Router();
const {addLead, getAllLeads, updateLead,getLeadById}=require('../controllers/leads.controller');
const protect = require('../middleware/authMiddleware');

router.route('/').post(protect,addLead);
router.route('/').get(protect,getAllLeads);
router.route('/:id').put(protect,updateLead);
router.route('/:id').get(protect,getLeadById);

module.exports=router;