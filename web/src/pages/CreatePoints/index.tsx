import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "./styles.css";
import { Link, useHistory } from "react-router-dom";

import { FiArrowLeft } from "react-icons/fi";
import logo from "../../assets/logo.svg";
import { Map, TileLayer, Marker } from "react-leaflet";
import api from "../../services/api";
import { LeafletMouseEvent } from "leaflet";
import axios from "axios";
interface Item {
  id: number;
  name: string;
  image_url: string;
}
interface UFs {
  sigla: string;
}
interface Citys {
  nome: string;
}

const CreatePoints = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setufs] = useState<string[]>([]);
  const [selecteduf, setselectduf] = useState("0");
  const [initialPosition, setinitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setfromData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [citys, setcitys] = useState<string[]>([]);
  const [selectedcity, setselectdcity] = useState("0");
  const [selectedItens, setselectdItens] = useState<number[]>([]);
  const [selectedPosition, setselectdPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const History = useHistory();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setinitialPosition([latitude, longitude]);
    });
  }, []);
  useEffect(() => {
    api.get("items").then((response) => {
      setItems(response.data);
    });
  }, []);
  useEffect(() => {
    axios
      .get<UFs[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        const ufinitial = response.data.map((uf) => uf.sigla);
        setufs(ufinitial);
      });
  }, []);
  useEffect(() => {
    if (selecteduf === "0") {
      return;
    }
    axios
      .get<Citys[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selecteduf}/municipios`
      )
      .then((response) => {
        const cytyname = response.data.map((city) => city.nome);
        setcitys(cytyname);
      });
  }, [selecteduf]);
  function handlesSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    const uf = event.target.value;
    setselectduf(uf);
  }
  function handlesSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    const city = event.target.value;
    setselectdcity(city);
  }
  function handlesMapClick(event: LeafletMouseEvent) {
    setselectdPosition([event.latlng.lat, event.latlng.lng]);
  }
  function handlesImputEvent(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setfromData({ ...formData, [name]: value });
  }

  function handleSelectetItens(id: number) {
    const alredySelected = selectedItens.findIndex((item) => item === id);
    if (alredySelected >= 0) {
      const filterItens = selectedItens.filter((item) => item !== id);
      setselectdItens(filterItens);
    } else {
      setselectdItens([...selectedItens, id]);
    }
  }
  async function hadleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selecteduf;
    const city = selectedcity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItens;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };
    console.log(items);
    await api.post("points", data);
    alert("Ponto de coleta criado");
    History.push("/");
  }
  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para Home
        </Link>
      </header>
      <form onSubmit={hadleSubmit}>
        <h1>Cadastro do ponto de Coleta</h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              onChange={handlesImputEvent}
              name="name"
              id="name"
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                onChange={handlesImputEvent}
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                onChange={handlesImputEvent}
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
            <Map center={initialPosition} zoom={15} onClick={handlesMapClick}>
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={selectedPosition} />
            </Map>
          </legend>
          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (uf)</label>
              <select
                name="uf"
                value={selecteduf}
                id="uf"
                onChange={handlesSelectUf}
              >
                <option>Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                value={selectedcity}
                onChange={handlesSelectCity}
                id="city"
              >
                <option>Selecione uma cidade</option>
                {citys.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectetItens(item.id)}
                className={selectedItens.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} alt={item.name} />
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        </fieldset>
        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};
export default CreatePoints;
