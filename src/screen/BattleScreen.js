import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { battleStart } from "../service/battle";

import PokemonInfo from "../component/PokemonInfo";
import PokemonImage from "../component/PokemonImage";
import BottomSectionSkill from "../component/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom-Switch";
import BottomSectionInfo from "../component/Bottom-Info";

const Battle = () => {
  const [battle, setBattle] = useState(
    createBattle(["0001", "0004", "0003"], ["0004", "0003", "0002"])
  );
  const [text, setText] = useState("");

  const { queue, enqueue, dequeue, resetQueue } = useQueue();

  const [bottom, setBottom] = useState("skill");
  const [bench, setBench] = useState(null);

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

  const queueCheck = () => {
    if (queue.length > 1) {
      return false;
    }
    return true;
  };

  const handleSkillClick = (skillIndex) => {
    if (queueCheck()) {
      battleStart(battle, skillIndex, enqueue, dequeue, resetQueue);
    }
  };

  return (
    <div className="battle-container" onClick={handleDequeue}>
      <div className="top-section">
        <div className="pokemon-image">
          <PokemonImage battle={battle} type="npc" />
          <PokemonImage battle={battle} type="plr" />
        </div>
        <PokemonInfo battle={battle} type="npc" />
        <PokemonInfo battle={battle} type="plr" />
      </div>
      {bottom === "skill" && (
        <BottomSectionSkill
          battle={battle}
          text={text}
          handleSkillClick={handleSkillClick}
          setBottom={setBottom}
          queueCheck={queueCheck}
        ></BottomSectionSkill>
      )}
      {bottom === "switch" && (
        <BottomSectionSwitch
          battle={battle}
          text={text}
          setBottom={setBottom}
          setBench={setBench}
        ></BottomSectionSwitch>
      )}
      {bottom === "info" && (
        <BottomSectionInfo
          battle={battle}
          text={text}
          setText={setText}
          setBottom={setBottom}
          bench={bench}
        ></BottomSectionInfo>
      )}
    </div>
  );
};

export default Battle;
