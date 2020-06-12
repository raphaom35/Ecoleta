import { Request, Response, request } from "express";
import kenx from "../database/connection";
class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));
    const points = await kenx("points")
      .join("points_items", "points.id", "=", "points_items.point_id")
      .whereIn("points_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");
    const seralizedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.102:3333/uploads/${point.image}`,
      };
    });
    return response.json(seralizedPoints);
  }
  async show(request: Request, response: Response) {
    const { id } = request.params;
    const point = await kenx("points").where("id", id).first();
    if (!point) {
      return response.status(400).json({ message: "Point nor found" });
    }
    const seralizedPoint = {
      ...point,
      image_url: `http://192.168.0.102:3333/uploads/${point.image}`,
    };
    const itens = await kenx("items")
      .join("points_items", "items.id", "=", "points_items.item_id")
      .where("points_items.point_id", id)
      .select("items.title");
    return response.json({ point: seralizedPoint, itens });
  }
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };
    const trx = await kenx.transaction();
    const insertedIds = await trx("points").insert(point);
    const point_id = insertedIds[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id: point_id,
        };
      });

    await trx("points_items").insert(pointItems);
    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });

    await trx("points_items").insert(pointItems);
    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
}
export default PointsController;
