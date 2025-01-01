const router = require('express').Router();
const {addLead, getAllLeads, updateLead,getLeadById,changeKAM}=require('../controllers/leads.controller');
const protect = require('../middleware/authMiddleware');

router.route('/addLead').post(protect,addLead);
router.route('/getLeads').get(protect,getAllLeads);
router.route('/updateLead/:id').put(protect,updateLead);
router.route('/getLead/:id').get(protect,getLeadById);
router.route('/changeKAM').put(protect,changeKAM);

module.exports=router;