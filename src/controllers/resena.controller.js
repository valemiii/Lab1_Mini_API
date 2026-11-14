const resenaService = require("../services/resena.service");

const crear = async (req, res, next) => {
  try {
    const resena = await resenaService.crear(req.body);
    res.status(201).json(resena);
  } catch (error) {
    next(error);
  }
};

module.exports = { crear };
