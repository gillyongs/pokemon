import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { battleStart } from "../service/battle";

import PokemonInfo from "../component/PokemonInfo";
import PokemonImage from "../component/PokemonImage";
import BottomSectionSkill from "../component/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom-Switch";

const Battle = () => {
  const [battle, setBattle] = useState(
    createBattle(["0001", "0002", "0003"], ["0004", "0003", "0002"])
  );
  const [text, setText] = useState("");

  const { queue, enqueue, dequeue, resetQueue } = useQueue();

  const [bottom, setBottom] = useState("skill");

  useEffect(() => {
    if (queue[0]) {
      setBattle(queue[0].battle);
      setText(queue[0].text);
      console.log(queue);
    }
    if (queue.length === 0) {
      setText(battle.player.origin.names + " 무엇을 할까?");
    }
  }, [queue]);

  const handleDequeue = () => {
    if (queue.length > 0) {
      dequeue();
    }
  };

  const handleSkillClick = (skillIndex) => {
    if (queue.length > 0) {
      return;
    }
    battleStart(battle, skillIndex, enqueue, dequeue, resetQueue);
  };

  return (
    <div className="battle-container" onClick={handleDequeue}>
      <div className="top-section">
        <PokemonInfo battle={battle} type="npc" />
        <PokemonImage battle={battle} type="npc" />
        <PokemonInfo battle={battle} type="plr" />
        <PokemonImage battle={battle} type="plr" />
      </div>
      {bottom === "skill" && (
        <BottomSectionSkill
          battle={battle}
          text={text}
          handleSkillClick={handleSkillClick}
          setBottom={setBottom}
        ></BottomSectionSkill>
      )}
      {bottom === "switch" && (
        <BottomSectionSwitch
          battle={battle}
          text={text}
          handleSkillClick={handleSkillClick}
          setBottom={setBottom}
        ></BottomSectionSwitch>
      )}
    </div>
  );
};

export default Battle;
