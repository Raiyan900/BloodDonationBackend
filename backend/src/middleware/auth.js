const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = { id: payload.id, role: payload.role };
    next();
  }catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}
