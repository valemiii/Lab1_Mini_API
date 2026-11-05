const { Router } = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticateToken } = require('../middlewares/auth');

const router = Router();

router.post('/products/:id/reviews', authenticateToken, reviewController.create);
router.get('/products/:id/reviews', reviewController.list);
router.delete('/reviews/:id', authenticateToken, reviewController.remove);

module.exports = router;
