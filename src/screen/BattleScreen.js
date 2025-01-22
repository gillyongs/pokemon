import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { battleStart } from "../service/battle";

import SkillButton from "../component/SkillButton";
import PokemonInfo from "../component/PokemonInfo";
import PokemonImage from "../component/PokemonImage";
import FadeInComponent from "../component/FadeInComponent";

const Battle = () => {
  const [battle, setBattle] = useState(createBattle("0001", "0002"));
  const [text, setText] = useState("");

  const { queue, enqueue, dequeue, resetQueue } = useQueue();

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

      <div className="bottom-section">
        <div className="text-box">
          <FadeInComponent className="text" text={text} />
        </div>

        <SkillButton
          battle={battle}
          skillNumber={1}
          onClick={() => handleSkillClick(1)}
        />

        <SkillButton
          battle={battle}
          skillNumber={2}
          onClick={() => handleSkillClick(2)}
        />

        <SkillButton
          battle={battle}
          skillNumber={3}
          onClick={() => handleSkillClick(3)}
        />

        <SkillButton
          battle={battle}
          skillNumber={4}
          onClick={() => handleSkillClick(4)}
        />
      </div>
    </div>
  );
};

export default Battle;
