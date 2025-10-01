import React, { useState, useEffect, useRef } from "react";
import InfoArea from "./InfoArea";
import InfoSkillButton from "./InfoSkillButton";
import InfoButton from "./InfoButton";
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";

const BottomSectionInfo = ({ battle, text, setBottom, bench, setText }) => {
  const pokemon = battle[bench];

  return (
    <>
      <TextBox text={text} />
      <ChangeButton
        // 상태창 들어갔다가 다시 나올때 뜨는 텍스트
        onClick={() => {
          setText(" 누구로 교체할까?");
          setBottom("switch");
        }}
        innerText={"뒤로가기"}
      />

      <InfoArea pokemon={pokemon} />

      <InfoButton pokemon={pokemon} type={"type"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"abil"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"item"} setText={setText} />

      <InfoButton pokemon={pokemon} type={"status"} setText={setText} />

      <InfoSkillButton battle={battle} skillNumber={1} pokemon={pokemon} setText={setText} />
      <InfoSkillButton battle={battle} skillNumber={2} pokemon={pokemon} setText={setText} />
      <InfoSkillButton battle={battle} skillNumber={3} pokemon={pokemon} setText={setText} />
      <InfoSkillButton battle={battle} skillNumber={4} pokemon={pokemon} setText={setText} />
    </>
  );
};

export default BottomSectionInfo;
