import Kenex from "knex";
export async function seed(kenx: Kenex) {
  await kenx("items").insert([
    { title: "lampadas", image: "lampadas.svg" },
    { title: "Plias e Baterias", image: "baterias.svg" },
    { title: "Resido Elektronicos", image: "eletronicos.svg" },
    { title: "Residos Organicos", image: "organicos.svg" },
    { title: "Oleo de cozinha", image: "oleo.svg" },
  ]);
}
