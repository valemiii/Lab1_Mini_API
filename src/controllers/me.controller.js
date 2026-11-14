const s=require('../services/me.service'); const run=(fn,status)=>(req,res,next)=>Promise.resolve(fn(req.body,req.user.id)).then(x=>status?res.status(status).json(x):x===undefined?res.status(204).send():res.json(x)).catch(next);
module.exports={get:run((_,id)=>s.profile(id)),update:run((b,id)=>s.update(id,b)),password:run((b,id)=>s.password(id,b))};
