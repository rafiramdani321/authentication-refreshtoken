import { Router } from "express";
import UserController from "../controllers/user.controller";

const routerUser = Router();

routerUser.get("/", UserController.getUser);

export default routerUser;
