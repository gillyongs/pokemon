import React from "react";
import HpBar from "./HpBar";

const PokemonInfo = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  return (
    <div className={`pokemon-info ${type}`}>
      <div className={`pokemon-name ${type}`}>{pokemon.origin.name}</div>
      {pokemon.status.burn != null && (
        <div className={`pokemon-status burn`}>화상</div>
      )}
      {pokemon.status.sleep != null && (
        <div className={`pokemon-status sleep`}>수면</div>
      )}
      {pokemon.status.freeze != null && (
        <div className={`pokemon-status freeze`}>얼음</div>
      )}
      {pokemon.status.poision != null && (
        <div className={`pokemon-status poision`}>맹독</div>
      )}
      {pokemon.status.mabi != null && (
        <div className={`pokemon-status mabi`}>마비</div>
      )}
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
