import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { battleStart } from "../service/battle";

import PokemonInfo from "../component/Top/PokemonInfo";
import PokemonImage from "../component/Top/PokemonImage";
import BottomSectionSkill from "../component/Bottom/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom/Bottom-Switch/Bottom-Switch";
import BottomSectionInfo from "../component/Bottom/Bottom-info/Bottom-Info";

const Battle = () => {
  const [battle, setBattle] = useState(
    createBattle(["0001", "0002", "0003"], ["0004", "0003", "0002"])
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
    <>
      <GlobalStyle />
      <BATTLE onClick={handleDequeue}>
        <TOP>
          <IMAGE>
            <PokemonImage battle={battle} type="npc" />
            <PokemonImage battle={battle} type="plr" />
          </IMAGE>
          <PokemonInfo battle={battle} type="npc" />
          <PokemonInfo battle={battle} type="plr" />
        </TOP>
        <BOTTOM>
          {bottom === "skill" && (
            <BottomSectionSkill
              battle={battle}
              text={text}
              handleSkillClick={handleSkillClick}
              setBottom={setBottom}
              queueCheck={queueCheck}
            />
          )}
          {bottom === "switch" && (
            <BottomSectionSwitch
              battle={battle}
              text={text}
              setBottom={setBottom}
              setBench={setBench}
            />
          )}
          {bottom === "info" && (
            <BottomSectionInfo
              battle={battle}
              text={text}
              setText={setText}
              setBottom={setBottom}
              bench={bench}
            />
          )}
        </BOTTOM>
      </BATTLE>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "CustomFont"; /* 폰트 이름 정의 */
    src: url("/pokemon/font/esamanru Medium.ttf") format("truetype"); /* .ttf 파일 경로 지정 */
  }

  body {
    font-family: "CustomFont", sans-serif; /* 기본 폰트로 'CustomFont' 사용 */
  }
`;

const BATTLE = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TOP = styled.div`
  width: 100%;
  height: 43%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("/pokemon/img/background/top.gif");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

const IMAGE = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const BOTTOM = styled.div`
  width: 100vw;
  height: 57vh;
  background-color: #6e7e7c;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  position: relative;
  background-image: url("/pokemon/img/background/bottom.gif");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

export default Battle;
