const { Router } = require('express');
const c = require('../controllers/review.controller');
const { authenticateToken } = require('../middlewares/auth');
const router = Router();
router.post('/products/:id/reviews', authenticateToken, c.create);
router.get('/products/:id/reviews', c.list);
router.delete('/reviews/:id', authenticateToken, c.remove);
module.exports = router;
