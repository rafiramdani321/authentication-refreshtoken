import { Router } from "express";
import routerAuth from "./auth.route";
import routerUser from "./user.route";

const routes = Router();

routes.use("/auth", routerAuth);
routes.use("/users", routerUser);

export default routes;
