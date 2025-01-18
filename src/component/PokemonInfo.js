import React from "react";
import HpBar from "./HpBar";

const PokemonInfo = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  return (
    <div className={`pokemon-info ${type}`}>
      <div className={`pokemon-name ${type}`}>{pokemon.origin.name}</div>
      <div className={`hp-bar ${type}`}>
        <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
      </div>
      <div className="hp">
        {pokemon.hp}/{pokemon.origin.hp}
      </div>
    </div>
  );
};

export default PokemonInfo;
