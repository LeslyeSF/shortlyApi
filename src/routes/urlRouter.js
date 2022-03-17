import { Router } from "express";
import { deleteShortUrl, findShortUrl, shortenUrl } from "../controllers/urlController.js";

const urlRouter = Router();
urlRouter.post('/urls/shorten', shortenUrl);
urlRouter.get('/urls/:shortUrl', findShortUrl);
urlRouter.delete('/urls/:id', deleteShortUrl);
export default urlRouter;