import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";
import { applyAbilityEffects } from "../service/abil";

import PokemonInfo from "../component/Top/PokemonInfo";
import PokemonImage from "../component/Top/PokemonImage";
import BottomSectionSkill from "../component/Bottom/Bottom-Skill/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom/Bottom-Switch/Bottom-Switch";
import BottomSectionInfo from "../component/Bottom/Bottom-info/Bottom-Info";
import { speedCheck } from "../util/speedCheck";
import { useLocation } from "react-router-dom";
import { battleStart } from "../service/battleStart";
import { npcChoice } from "../npc/npc";

const Battle = () => {
  const location = useLocation();
  const [battle, setBattle] = useState(createBattle(["어써러셔", "어써러셔", "어써러셔"], ["어써러셔", "어써러셔", "어써러셔"]));
  //개발용 배틀 객체.
  const [text, setText] = useState("");
  //화면에 보여질 텍스트 전역변수
  const { queueObject } = useQueue();
  //게임 진행용 큐 전역변수
  const [bottom, setBottom] = useState("skill");
  // 밑 화면 상태. 스킬, 교체, 정보
  const [bench, setBench] = useState(null);

  // 0130  갸라도스
  // 0145  썬더
  // 0149  망나뇽
  // 0205  쏘콘
  // 0250  칠색조
  // 0382  가이오가
  // 0497  샤로다               대타출동:4
  // 0644  블랙큐레무
  // 0645  랜드로스
  // 0716  제르네아스
  // 0717  이벨타르
  // 0778  따라큐
  // 0793  텅비드
  // 0812  고릴타
  // 0815  에이스번
  // 0888  자시안
  // 0889  자마젠타
  // 0890  무한다이노
  // 0892  물라오스
  // 0896  백마렉스
  // 0897  흑마렉스
  // 0901  다투곰
  // 0902  달투곰
  // 0970  킬라플로르
  // 0977  어써러셔             방어:2
  // 0987  날개치는머리
  // 1002  파오젠
  // 1003  딩루
  // 1004  위유이
  // 1007  코라이돈
  // 1008  미라이돈

  useEffect(() => {
    let { battleObject } = location.state || {}; // 랜덤 battleObject 가져오기
    queueObject.resetQueue();
    const testMode = true;
    if (!testMode && battleObject) {
      setBattle(battleObject); // 상태 업데이트
    } else {
      battleObject = createBattle(["고릴타", "코라이돈", "어써러셔"], ["샤로다", "코라이돈", "파오젠"]);
    }
    queueObject.enqueue({ battle: battleObject, text: "배틀시작!" });
    const fastUser = speedCheck(battleObject);
    const slowUser = fastUser === "player" ? "npc" : "player";
    let bt = structuredClone(battleObject);
    applyAbilityEffects(bt, fastUser, queueObject.enqueue);
    applyAbilityEffects(bt, slowUser, queueObject.enqueue);

    if (queueObject.queue.length === 0) {
      setText(battleObject.player.origin.names + " 무엇을 할까?");
    }
  }, [location.state]); // location.state가 변경될 때 실행

  useEffect(() => {
    const queue = queueObject.queue;
    if (queue[0]) {
      setBattle(queue[0].battle);
      setText(queue[0].text);
      console.log(queue);
      const player = queue[0].battle.player;
      const turnEnd = queue[0].battle.turn.turnEnd;

      if (player.faint && turnEnd) {
        setBottom("mustSwitch");
      }

      if (queue[0].battle.uturn) {
        setBottom("uturn");
      }

      const npcFaint = battle.npc.faint;
      const npcFaint1 = battle.npcBench1.faint;
      const npcFaint2 = battle.npcBench2.faint;
      const playerFaint = battle.player.faint;
      const playerFaint1 = battle.playerBench1.faint;
      const playerFaint2 = battle.playerBench2.faint;
      if (npcFaint && npcFaint1 && npcFaint2 && queue.length === 1) {
        alert("승리!");
      }
      if (playerFaint && playerFaint1 && playerFaint2 && queue.length === 1) {
        alert("패배!");
      }
    }
    if (queue.length === 0) {
      if (battle.player.auto || battle.player.charge) {
        battleStart(battle, battle.player.autoSN, npcChoice(battle, battle.player.autoSN), queueObject);
      } else {
        setText(battle.player.origin.names + " 무엇을 할까?");
      }
    }
  }, [queueObject.queue]);

  const handleDequeue = () => {
    if (queueObject.queue.length > 0) {
      if (battle.turn.textFreeze) {
        return;
      }
      queueObject.dequeue();
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
          {bottom === "skill" && <BottomSectionSkill battle={battle} text={text} setText={setText} setBottom={setBottom} queueObject={queueObject} />}
          {(bottom === "switch" || bottom === "mustSwitch" || bottom === "uturn") && <BottomSectionSwitch battle={battle} text={text} bottom={bottom} setBottom={setBottom} setBench={setBench} queueObject={queueObject} setText={setText} />}
          {bottom === "info" && <BottomSectionInfo battle={battle} text={text} setText={setText} setBottom={setBottom} bench={bench} />}
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
