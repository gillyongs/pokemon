import React from "react";

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  return (
    <img
      className={`pokemon-img ${type}`}
      src={`/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
      alt={`${type} Pokemon`}
    />
  );
};

export default PokemonImage;
