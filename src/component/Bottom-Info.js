import React, { useState, useEffect, useRef } from "react";
import FadeInComponent from "./FadeInComponent"; // 경로에 맞게 수정
import HpBar from "./HpBar";
import LongSkillButton from "./LongSkillButton";

const BottomSectionInfo = ({ battle, text, setBottom, bench, setText }) => {
  let pokemon;
  if (bench === 1) {
    pokemon = battle.playerBench1;
  }
  if (bench === 2) {
    pokemon = battle.playerBench2;
  }
  return (
    <div className="bottom-section">
      <div className="text-box">
        <div className="text-layer">
          <FadeInComponent className="text" text={text} />
        </div>
      </div>
      <div className="change" onClick={() => setBottom("switch")}>
        뒤로가기
      </div>

      <div className={`pokemon-benchinfo-name `}>{pokemon.origin.name}</div>
      <div className={`pokemon-benchinfo-abil `}>
        <img
          className="pokemon-benchinfo-abil-icon"
          src={`/pokemon/img/background/abil.webp`}
          alt={"abilicon"}
        />
        <div className={`pokemon-benchinfo-abil-text `}>특성</div>
        <div className={`pokemon-benchinfo-abil-text-name `}>
          {pokemon.origin.abil}
        </div>
      </div>
      <div className={`pokemon-benchinfo-item `}>
        <img
          className="pokemon-benchinfo-item-icon"
          src={`/pokemon/img/item/${pokemon.item}.webp`}
          alt={"item"}
        />
        <div className={`pokemon-benchinfo-item-text `}>지닌아이템</div>
        <div className={`pokemon-benchinfo-item-text-name `}>
          {pokemon.item}
        </div>
      </div>
      <img
        className={`pokemon-benchinfo-img`}
        src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
        alt={`benchinfoImage`}
      />
      <div className={`pokemon-benchinfo-hp-bar`}>
        <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
      </div>
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
