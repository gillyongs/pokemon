import React, { useState, useEffect, useRef } from "react";
import HpBar from "./HpBar";
import LongSkillButton from "./LongSkillButton";
import LongInfoButton from "./LongInfoButton";
import TextBox from "./TextBox";

const BottomSectionInfo = ({ battle, text, setBottom, bench, setText }) => {
  let pokemon;
  if (bench === 1) {
    pokemon = battle.playerBench1;
  }
  if (bench === 2) {
    pokemon = battle.playerBench2;
  }
  let pokemonTypeText = pokemon.origin.type1;
  if (pokemon.origin.type2 !== null || pokemon.origin.type2 !== undefined) {
    pokemonTypeText += ", " + pokemon.origin.type2;
  }
  return (
    <div className="bottom-section">
      <TextBox text={text} />
      <div className="change" onClick={() => setBottom("switch")}>
        뒤로가기
      </div>

      <div className={`pokemon-benchinfo-name `}>{pokemon.origin.name}</div>
      <img
        className={`pokemon-benchinfo-img`}
        src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
        alt={`benchinfoImage`}
      />
      <div className={`pokemon-benchinfo-hp-bar`}>
        <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
      </div>

      <LongInfoButton pokemon={pokemon} type={"type"} />

      <LongInfoButton pokemon={pokemon} type={"abil"} />

      <LongInfoButton pokemon={pokemon} type={"item"} />

      <LongSkillButton
        battle={battle}
        skillNumber={1}
        pokemon={pokemon}
        setText={setText}
      />
      <LongSkillButton
        battle={battle}
        skillNumber={2}
        pokemon={pokemon}
        setText={setText}
      />

      <LongSkillButton
        battle={battle}
        skillNumber={3}
        pokemon={pokemon}
        setText={setText}
      />

      <LongSkillButton
        battle={battle}
        skillNumber={4}
        pokemon={pokemon}
        setText={setText}
      />
    </div>
  );
};

export default BottomSectionInfo;
