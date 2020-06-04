import express from "express";
import kenx from "./database/connection";
import Knex from "knex";
import PointsController from "./controlles/PointsControllers";
import ItemsController from "./controlles/ItemsControllers";
const routes = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();
routes.get("/items", itemsController.index);
routes.post("/points", pointsController.create);
routes.get("/points", pointsController.index);
routes.get("/points/:id", pointsController.show);

export default routes;
