import React, { useState, useEffect, useRef } from "react";
import InfoArea from "./InfoArea";
import InfoSkillButton from "./InfoSkillButton";
import InfoButton from "./InfoButton";
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";

const BottomSectionInfo = ({ battle, text, setBottom, bench, setText }) => {
  let pokemon;
  if (bench === "zero") {
    pokemon = battle.player;
  } else if (bench === "one") {
    pokemon = battle.playerBench1;
  } else if (bench === "two") {
    pokemon = battle.playerBench2;
  }
  return (
    <>
      <TextBox text={text} />
      <ChangeButton
        onClick={() => {
          setText(battle.player.origin.names + " 무엇을 할까?");
          setBottom("switch");
        }}
        innerText={"뒤로가기"}
      />

      <InfoArea pokemon={pokemon} />

      <InfoButton pokemon={pokemon} type={"type"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"abil"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"item"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"status"} setText={setText} />

      <InfoSkillButton
        battle={battle}
        skillNumber={1}
        pokemon={pokemon}
        setText={setText}
      />
      <InfoSkillButton
        battle={battle}
        skillNumber={2}
        pokemon={pokemon}
        setText={setText}
      />
      <InfoSkillButton
        battle={battle}
        skillNumber={3}
        pokemon={pokemon}
        setText={setText}
      />
      <InfoSkillButton
        battle={battle}
        skillNumber={4}
        pokemon={pokemon}
        setText={setText}
      />
    </>
  );
};

export default BottomSectionInfo;
