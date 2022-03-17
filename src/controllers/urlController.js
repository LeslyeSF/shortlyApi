import { v4 as uuid } from 'uuid';
import { connection } from '../database.js';

export async function shortenUrl(req, res){
  const { url } = req.body;
  const { user } = req.locals;
  try {
    let [ shortUrl ] = uuid().split("-");
    await connection.query(
      `INSERT INTO "shortUrls" (url, "shortUrl", "userId", "visitCount") VALUES ($1, $2, $3, 0)`,
    [url, shortUrl, user.id]);
    res.status(201).send({ shortUrl });
  } catch (err) {
    res.status(500).send(err);
  }
  
}

export async function findShortUrl(req,res){
  const { shortUrl } = req.params;
  try {
    const urlDate = await connection.query(
      `SELECT * FROM "shortUrls" WHERE "shortUrl"=$1`,
      [shortUrl]);
    if (urlDate.rowCount === 0){
      res.sendStatus(404);
      return;
    }
    res.status(200).send(urlDate.rows[0]);
  } catch (err) {
    res.status(500).send(err);
  }
}

export async function deleteShortUrl(req, res){
  const { id } = req.params;
  const { user } = res.locals;
  try {
    const { rows: shortUrl } = await connection.query(
      `SELECT * FROM "shortUrls" WHERE id=$1`, [id]
    );
    if (user.id !== shortUrl.userId) {
      res.sendStatus(401);
      return;
    }
    await connection.query(`DELETE FROM "shortUrls" WHERE id=$1`,
    [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err);
  }
}

