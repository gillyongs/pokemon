import React, { useState, useEffect, useRef } from "react";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { battleStart } from "../util/battle";

import SkillButton from "../component/SkillButton";
import PokemonInfo from "../component/PokemonInfo";
import PokemonImage from "../component/PokemonImage";
import FadeInComponent from "../component/FadeInComponent";

const Battle = () => {
  const [battle, setBattle] = useState(createBattle("0001", "0002"));
  const [text, setText] = useState("");

  const { queue, enqueue, dequeue } = useQueue();
  const isFirstRender = useRef(true); // 🔹 최초 실행 여부를 저장
  useEffect(() => {
    if (isFirstRender.current) {
      enqueue({ battle, text }); // ✅ 최초 1회만 실행
      isFirstRender.current = false; // 🔹 이후에는 실행되지 않도록 변경
    }
  }, []);

  useEffect(() => {
    if (queue[0]) {
      setBattle(queue[0].battle);
      setText(queue[0].text);
    }
  }, [queue]);

  const handleDequeue = () => {
    if (queue.length > 0) {
      dequeue();
    }
  };

  const handleSkillClick = (skillIndex) => {
    battleStart(battle, skillIndex, enqueue, dequeue);
  };

  return (
    <div className="battle-container">
      <div className="top-section">
        <PokemonInfo battle={battle} type="npc" />
        <PokemonImage battle={battle} type="npc" />
        <PokemonInfo battle={battle} type="plr" />
        <PokemonImage battle={battle} type="plr" />
      </div>

      <div className="bottom-section">
        <div className="text-box" onClick={handleDequeue}>
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
