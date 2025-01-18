import React, { useState, useEffect,useRef } from "react";
import "./Main.css";
import HpBar from "./component/HpBar"; // 위에서 작성한 HpBar 컴포넌트
import { checkTypes, checkTypesConsole } from "./util/checkTypes";
import { createBattle } from "./component/Battle";
import { battleStart } from "./util/battleStart";
import { useQueue } from "./util/useQueue";
import FadeInComponent from "./component/FadeInComponent";


const Battle = () => {
  const [battle, setBattle] = useState(createBattle("0001", "0002"));
  const [text, setText] = useState("");
  const player = battle.player;
  const npc = battle.npc;
  const { queue, enqueue, dequeue } = useQueue();
  const isFirstRender = useRef(true); // 🔹 최초 실행 여부를 저장
  useEffect(() => {
    if (isFirstRender.current) {
      enqueue({battle,text}); // ✅ 최초 1회만 실행
      isFirstRender.current = false; // 🔹 이후에는 실행되지 않도록 변경
    }
  }, []);

  useEffect(() => {
    if(queue[0]){
    console.log(queue[0].battle);
    setBattle(queue[0].battle);
    setText(queue[0].text);
    }
  }, [queue]);


  const handleClick = () => {
    if (queue.length > 0) {
      dequeue();
    }
  };

  return (
    <div className="battle-container">
      <div className="top-section">
        <div className="pokemon-info npc">
          <div className="pokemon-name npc">{npc.origin.name}</div>
          <div className="hp-bar npc">
            <HpBar hp={npc.hp} maxHp={npc.origin.hp} />
          </div>
          <div className="hp">
            {npc.hp}/{npc.origin.hp}
          </div>
        </div>
        <img
          className="pokemon-img npc"
          src={`/img/pokemon/${npc.origin.pokemon_id}.webp`}
          alt="npc Pokemon"
        />
        <div className="pokemon-info plr">
          <div className="pokemon-name plr">{player.origin.name}</div>

          <div className="hp-bar plr">
            <HpBar hp={player.hp} maxHp={player.origin.hp} />
          </div>
          <div className="hp">
            {player.hp}/{player.origin.hp}
          </div>
        </div>
        <img
          className="pokemon-img plr"
          src={`/img/pokemon/${player.origin.pokemon_id}.webp`}
          alt="player pokemon"
        />
      </div>
      
      <div className="bottom-section">

  <div className="text-box" onClick={handleClick}>
  <FadeInComponent  className = "text" text={text} />
  </div>


        <div
          className="skill one"
          onClick={()=> battleStart(battle, 1, enqueue, dequeue)}
        >
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
        <div
          className="skill two"
          onClick={() => battleStart(battle, setBattle, 2,text, setText)}
        >
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
        <div
          className="skill three"
          onClick={() => battleStart(battle, setBattle, 3,text, setText)}
        >
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
        <div
          className="skill four"
          onClick={() => battleStart(battle, setBattle, 4,text, setText)}
        >
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
