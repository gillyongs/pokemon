import React from "react";
import "./Main.css";
import pob from "./component/POBRepository";
import { checkTypes, checkTypesConsole } from "./util/checkTypes";

const Battle = () => {
  const pokemon1 = pob.generate("0001");
  const pokemon2 = pob.generate("0001");
  const player = pokemon1;
  const npc = pokemon2;
  console.log(player);
  console.log(npc);
  console.log(checkTypesConsole);

  return (
    <div className="battle-container">
      <div className="top-section">
        <div className="pokemon-info npc">
          <div className="pokemon-name npc">{npc.origin.name}</div>
          <div className="hp-bar npc"></div>
        </div>
        <img
          className="pokemon-img npc"
          src={`/img/pokemon/${npc.origin.pokemon_id}.webp`}
          alt="Pokemon 0890"
        />
        <div className="pokemon-info plr">
          <div className="pokemon-name plr">{player.origin.name}</div>
          <div className="hp-bar plr"></div>
        </div>
        <img
          className="pokemon-img plr"
          src={`/img/pokemon/${player.origin.pokemon_id}.webp`}
          alt="Pokemon 0890"
        />
      </div>
      <div className="bottom-section">
        <div className="skill one">
          <img
            className="type one"
            src={`/img/type/${player.origin.sk1.type}.svg`}
            alt="sk1"
          />
          <div className="skill_name one">{player.origin.sk1.name}</div>
          <div className="skill_effect one">
            {checkTypesConsole(player.origin.sk1.type, npc.type1, npc.type2)}
          </div>
          <div className="skill_pp one">
            {player.pp1}/{player.origin.sk1.pp}
          </div>
        </div>
        <div className="skill two">
          <img
            className="type two"
            src={`/img/type/${player.origin.sk2.type}.svg`}
            alt="sk2"
          />
          <div className="skill_name two">{player.origin.sk2.name}</div>
          <div className="skill_effect two">
            {checkTypesConsole(player.origin.sk2.type, npc.type1, npc.type2)}
          </div>
          <div className="skill_pp two">
            {" "}
            {player.pp2}/{player.origin.sk2.pp}
          </div>
        </div>
        <div className="skill three">
          <img
            className="type three"
            src={`/img/type/${player.origin.sk3.type}.svg`}
            alt="sk3"
          />
          <div className="skill_name three">{player.origin.sk3.name}</div>
          <div className="skill_effect three">
            {checkTypesConsole(player.origin.sk3.type, npc.type1, npc.type2)}
          </div>
          <div className="skill_pp three">
            {" "}
            {player.pp3}/{player.origin.sk3.pp}
          </div>
        </div>
        <div className="skill four">
          <img
            className="type four"
            src={`/img/type/${player.origin.sk4.type}.svg`}
            alt="sk4"
          />
          <div className="skill_name four">{player.origin.sk4.name}</div>
          <div className="skill_effect four">
            {checkTypesConsole(player.origin.sk4.type, npc.type1, npc.type2)}
          </div>
          <div className="skill_pp four">
            {" "}
            {player.pp4}/{player.origin.sk4.pp}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battle;
