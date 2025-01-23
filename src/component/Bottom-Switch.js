import React from "react";
import FadeInComponent from "./FadeInComponent"; // 경로에 맞게 수정
import HpBar from "./HpBar";

const BottomSectionSwitch = ({ battle, text, handleSkillClick, setBottom }) => {
  return (
    <div className="bottom-section">
      <div className="text-box">
        <FadeInComponent className="text" text={text} />
      </div>

      <div className="bench one">
        <div className={`pokemon-bench-name one`}>
          {battle.playerBench1.origin.name}
        </div>
        <img
          className={`pokemon-bench-img one`}
          src={`/pokemon/img/pokemon/${battle.playerBench1.origin.pokemon_id}.webp`}
          alt={`bench1`}
        />
        <div className={`pokemon-switch-hp-bar`}>
          <HpBar
            hp={battle.playerBench1.hp}
            maxHp={battle.playerBench1.origin.hp}
          />
        </div>
      </div>
      <div className="bench two">
        <div className={`pokemon-bench-name two`}>
          {battle.playerBench2.origin.name}
        </div>
        <img
          className={`pokemon-bench-img two`}
          src={`/pokemon/img/pokemon/${battle.playerBench2.origin.pokemon_id}.webp`}
          alt={`bench2`}
        />
        <div className={`pokemon-switch-hp-bar`}>
          <HpBar
            hp={battle.playerBench2.hp}
            maxHp={battle.playerBench2.origin.hp}
          />
        </div>
      </div>

      <div className="change" onClick={() => setBottom("skill")}>
        뒤로가기
      </div>
    </div>
  );
};

export default BottomSectionSwitch;
