import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import PokemonColetions from "./components/PokemonColetions";
import type { Pokemon } from "./interface";

interface Pokemons {
  name: string;
  url: string;
}

export interface Detail {
  id: number;
  isOpened: boolean;
}

const App: React.FC = () => {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]); // do là mảng nên <string[]>,<Pokemon[]>
  const [nextUrl, setNextUrl] = useState<string>(""); // load more
  const [loading, setLoading] = useState<boolean>(true); // loading
  const [viewDetail, setDetail] = useState<Detail>({
    id: 0,
    isOpened: false,
  });
  //
  useEffect(() => {
    const getPokemon = async () => {
      const res = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=20&offset=20");
      setNextUrl(res.data.next);

      const promises = res.data.results.map((pokemon: Pokemons) =>
        axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
      );

      const responses = await Promise.all(promises);
      const data = responses.map((r) => r.data);
      console.log(data);
      setPokemons(data); // ✅ chỉ setState 1 lần, đúng thứ tự
      setLoading(false); //loading
    };
    getPokemon();
  }, []);

  //
  const nextPage = async () => {
    setLoading(true); //loading

    const res = await axios.get(nextUrl);
    setNextUrl(res.data.next);

    const promises = res.data.results.map(async (pokemon: Pokemons) => {
      const poke = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
      return poke.data;
    });

    const results = await Promise.all(promises);
    setPokemons((prev) => [...prev, ...results]);

    setLoading(false); //loading
  };

  return (
    <>
      <div className="container">
        <header className="pokemon-header">POKEMON</header>
        <PokemonColetions pokemons={pokemons} viewDetail={viewDetail} setDetail={setDetail} />
        {!viewDetail.isOpened && (
          <div className="btn">
            <button onClick={nextPage}> {loading ? "Loading..." : "Load More"}</button>
          </div>
        )}
      </div>
    </>
  );
};

export default App;
