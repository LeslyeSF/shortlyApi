import bcrypt from 'bcrypt';
import { connection } from '../database.js';

export async function createUser(req, res) {
  const user = req.body;

  try {
    const existingUsers = await connection.query('SELECT * FROM users WHERE email=$1', [user.email])
    if (existingUsers.rowCount > 0) {
      return res.sendStatus(409);
    }

    const passwordHash = bcrypt.hashSync(user.password, 10);

    await connection.query(`
      INSERT INTO 
        users(name, email, password) 
      VALUES ($1, $2, $3)
    `, [user.name, user.email, passwordHash])

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function getUser(req, res) {
  const { user } = res.locals;

  try {
    res.send(user);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export async function findUser(req, res){
  const { id } = req.params;
  try {
    const { rows: user } = await connection.query(
      `SELECT (id, name), COUNT(s."visitCount") AS "visitCount" 
      FROM users JOIN "shortUrls" s ON id=s."userId"
      WHERE id=$1
      GROUP BY users.id`, [id]);
    
    const { rows: shortenedUrls } = await connection.query(
      `SELECT (id, "shortUrl", url, "visitCount") FROM "shortUrls"
      WHERE "userId"=$1`, [id]
    );
    res.status(200).send({...user, shortenedUrls});
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function ranking(req, res){
  try{
    const { rows: user } = await connection.query(
      `SELECT (id, name), COUNT(s.id) AS "linksCount", COUNT(s."visitCount") AS "visitCount" 
      FROM users JOIN "shortUrls" s ON users.id=s."userId"
      GROUP BY users.id ORDER BY "visitCount" DESC LIMIT 10`);
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send(err);
  }
}