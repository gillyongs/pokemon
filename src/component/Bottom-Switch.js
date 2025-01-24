import React, { useState } from "react";
import FadeInComponent from "./FadeInComponent"; // 경로에 맞게 수정
import HpBar from "./HpBar";

const BottomSectionSwitch = ({ battle, text, setBottom, setBench }) => {
  const [selected, setSelected] = useState(null);
  const handleClick = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };
  return (
    <div className="bottom-section">
      <div className="text-box">
        <FadeInComponent className="text" text={text} />
      </div>

      <div
        className={`bench one ${selected === "one" ? "selected" : ""}`}
        onClick={() => handleClick("one")}
      >
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
        {selected === "one" && (
          <div>
            <div className="pokemon-bench-button switch">교체</div>
            <div
              className="pokemon-bench-button info"
              onClick={() => {
                setBench(1);
                setBottom("info");
              }}
            >
              상세정보
            </div>
          </div>
        )}
      </div>
      <div
        className={`bench two ${selected === "two" ? "selected" : ""}`}
        onClick={() => handleClick("two")}
      >
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
        {selected === "two" && (
          <div>
            <div className="pokemon-bench-button switch">교체</div>
            <div
              className="pokemon-bench-button info"
              onClick={() => {
                setBench(2);
                setBottom("info");
              }}
            >
              상세정보
            </div>
          </div>
        )}
      </div>

      <div className="change" onClick={() => setBottom("skill")}>
        뒤로가기
      </div>
    </div>
  );
};

export default BottomSectionSwitch;
