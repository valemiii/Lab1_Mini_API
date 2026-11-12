const service = require('../services/review.service');
const HttpError = require('../utils/httpError');
const id = (v) => { const n = Number(v); if (!Number.isInteger(n) || n < 1) throw new HttpError(400, 'El id debe ser numérico'); return n; };
const create = async (req,res,next) => { try { res.status(201).json(await service.create(req.user.id, id(req.params.id), req.body)); } catch(e){next(e);} };
const list = async (req,res,next) => { try { res.json(await service.list(id(req.params.id), req.query.page, req.query.limit)); } catch(e){next(e);} };
const remove = async (req,res,next) => { try { await service.remove(req.user.id, req.user.role, id(req.params.id)); res.status(204).send(); } catch(e){next(e);} };
module.exports = { create, list, remove };
