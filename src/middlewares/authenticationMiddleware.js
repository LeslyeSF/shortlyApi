import { connection } from '../database.js';

export default async function verifyToken(req, res, next){
  const { authorization } = req.headers;
  const token = authorization?.replace('Bearer ', '');
  if (!token) {
    return res.sendStatus(401);
  }
  try{
    const session = await connection.query(
      `SELECT * FROM sessions WHERE token=$1`
      , [token]);
    if (session.rowCount === 0){
      res.sendStatus(404);
      return;
    }
  } catch (err) {
    res.status(500).send(err);
  }
  res.locals.session = session;
  next();
}