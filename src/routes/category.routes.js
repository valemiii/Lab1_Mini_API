const {Router}=require('express'); const c=require('../controllers/category.controller'); const {authenticateToken,requireRole}=require('../middlewares/auth'); const r=Router();
r.post('/',authenticateToken,requireRole('ADMIN'),c.create); r.get('/',c.list); module.exports=r;
