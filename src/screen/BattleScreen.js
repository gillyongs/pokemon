import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { useQueue } from "../util/useQueue";

import PokemonInfo from "../component/Top/PokemonInfo";
import PokemonImage from "../component/Top/PokemonImage";
import ItemImage from "../component/Top/ItemImage";
import BottomSectionSkill from "../component/Bottom/Bottom-Skill/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom/Bottom-Switch/Bottom-Switch";
import BottomSectionInfo from "../component/Bottom/Bottom-info/Bottom-Info";
import { speedCheck } from "../util/speedCheck";
import { useLocation } from "react-router-dom";
import { battleStart } from "../service/battleStart";
import { npcChoice } from "../npc/npc";
import { cloneWithMethods } from "../util/cloneWithMethods";
import { applyAbilityEffects } from "../entity/Abillity";

const Battle = () => {
  const location = useLocation();
  const battleOrigin = createBattle(["갸라도스", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
  const battleObj = useRef(battleOrigin);
  const [battle, setBattle] = useState(battleOrigin);
  //개발용 배틀 객체.
  const [text, setText] = useState("");
  //화면에 보여질 텍스트 전역변수
  const { queueObject } = useQueue();
  //게임 진행용 큐 전역변수
  const [bottom, setBottom] = useState("skill");

  // 밑 화면 상태. 스킬, 교체, 정보
  const [bench, setBench] = useState(null);

  //   샤로다               대타출동:4
  //   어써러셔             방어:2
  //   랜드로스             유턴:4
  //   날개치는머리          도발:4

  let screenFix = false;
  useEffect(() => {
    let { battleObject } = location.state || {}; // 랜덤 battleObject 가져오기
    screenFix = true;
    queueObject.resetQueue();
    const testMode = true;
    if (!testMode && battleObject) {
      battleObj.current = battleObject;
      setBattle(battleObject); // 상태 업데이트
    } else {
      battleObj.current = createBattle(["달투곰", "가이오가", "미라이돈"], ["흑마렉스", "고릴타", "고릴타"]);
    }
    queueObject.enqueue({ battle: battleObj.current, text: "배틀시작!" });
    const fastUser = speedCheck(battleObj.current);
    const slowUser = fastUser === "player" ? "npc" : "player";
    applyAbilityEffects(battleObj.current, fastUser, queueObject.enqueue);
    applyAbilityEffects(battleObj.current, slowUser, queueObject.enqueue);
    if (queueObject.queue.length === 0) {
      setText(battleObj.current.player.origin.names + " 무엇을 할까?");
    }
  }, [location.state]); // location.state가 변경될 때 실행

  useEffect(() => {
    const queue = queueObject.queue;
    if (queue[0]) {
      battleObj.current = cloneWithMethods(queue[0].battle);
      setBattle(queue[0].battle);
      setText(queue[0].text);
      console.log(queue);
      const player = queue[0].battle.player;
      const turnEnd = queue[0].battle.turn.turnEnd;
      let gameEnd = false;
      if (player.faint && turnEnd && !screenFix) {
        // 겜 다시시작할때 자꾸 실행되길래 막을려고 screenFix 추가함
        setBottom("mustSwitch");
      }

      if (queue[0].battle.turn.uturn) {
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
        gameEnd = true;
      }
      if (playerFaint && playerFaint1 && playerFaint2 && queue.length === 1) {
        alert("패배!");
        gameEnd = true;
      }
    }
    if (queue.length === 0) {
      if (battle.player.auto || battle.player.charge) {
        battleStart(battleObj.current, battle.player.autoSN, npcChoice(battle, battle.player.autoSN), queueObject);
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
      screenFix = false;
      queueObject.dequeue();
    }
  };

  const battleStartBySkillButton = (skillIndex) => {
    battleStart(battleObj.current, skillIndex, npcChoice(battle, skillIndex), queueObject);
  };

  return (
    <>
      <GlobalStyle />
      <BATTLE onClick={handleDequeue}>
        <TOP>
          <IMAGE>
            <PokemonImage battle={battle} type="npc" />
            <PokemonImage battle={battle} type="plr" />
            <ItemImage battle={battle} type="plr" />
          </IMAGE>
          <PokemonInfo battle={battle} type="npc" />
          <PokemonInfo battle={battle} type="plr" />
        </TOP>
        <BOTTOM>
          {bottom === "skill" && <BottomSectionSkill battle={battle} text={text} setText={setText} setBottom={setBottom} queueObject={queueObject} battleStartBySkillButton={battleStartBySkillButton} />}
          {(bottom === "switch" || bottom === "mustSwitch" || bottom === "uturn") && <BottomSectionSwitch battle={battle} text={text} bottom={bottom} setBottom={setBottom} setBench={setBench} queueObject={queueObject} setText={setText} btObj={battleObj.current} />}
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
