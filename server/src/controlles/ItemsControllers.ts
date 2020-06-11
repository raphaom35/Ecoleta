import { Request, Response } from "express";
import kenx from "../database/connection";
class ItemsController {
  async index(request: Request, response: Response) {
    const items = await kenx("items").select("*");
    const seralizedItems = items.map((item) => {
      return {
        id: item.id,
        name: item.title,
        image_url: `http://192.168.0.103:3333/uploads/${item.image}`,
      };
    });
    return response.json(seralizedItems);
  }
}
export default ItemsController;
