const service=require('../services/category.service'); const HttpError=require('../utils/httpError'); const pid=v=>{const n=Number(v);if(!Number.isInteger(n)||n<1)throw new HttpError(400,'El id debe ser numérico');return n;};
const create=async(req,res,next)=>{try{res.status(201).json(await service.create(req.body||{}));}catch(e){next(e);}};
const list=async(req,res,next)=>{try{res.json(await service.list());}catch(e){next(e);}};
const set=async(req,res,next)=>{try{res.json(await service.setProductCategories(pid(req.params.id),req.body?.categoryIds));}catch(e){next(e);}};
const search=async(req,res,next)=>{try{res.json(await service.search(req.query));}catch(e){next(e);}};
module.exports={create,list,set,search};
