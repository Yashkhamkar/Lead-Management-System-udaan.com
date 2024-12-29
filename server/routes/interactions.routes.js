const { addInteraction, getInteractionsByLeadId, updateInteraction } = require('../controllers/interactions.controller');
const protect = require('../middleware/authMiddleware');

const router = require('express').Router();


router.route('/').post(protect,addInteraction);
router.route('/:lead_id').get(protect,getInteractionsByLeadId);
router.route('/:id').put(protect,updateInteraction);

module.exports=router;