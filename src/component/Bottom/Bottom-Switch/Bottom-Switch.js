import React, { useState } from "react";
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";
import BenchPokemon from "./BenchPokemon";
import { battleStart } from "../../../service/battleStart";
import { switchPlayer, switchNpc } from "../../../service/switch";
import { turnEnd } from "../../../service/turnEnd";
import { attackNpc } from "../../../service/attack";
import { npcChoice } from "../../../npc/npc";
const BottomSectionSwitch = ({ battle, text, bottom, setBottom, setBench, queueObject, setText }) => {
  const [selected, setSelected] = useState(null);
  const handleSelected = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };

  let handleSwitch;
  if (bottom === "mustSwitch") {
    // 포켓몬이 쓰러져서 교체하는 화면
    handleSwitch = (index) => {
      setBottom("skill");
      let bt = structuredClone(battle);
      switchPlayer(bt, index, queueObject.enqueue);
      queueObject.dequeue(); // "누구로 교체할까?"를 dequque를 막아놨기에 직접 해줘야함

      if (bt.npc.faint) {
        // npc만 쓰러졌을 경우 turnEnd.js에서 교체하지만
        // player와 npc 양측 포켓몬이 동시에 쓰러졌을경우
        // 사용자가 교체할 포켓몬을 정한 이후 교체해야 하기에
        // bottomSwitch에서 교체한다.
        if (bt.npcBench1.faint !== true) {
          // 1번이 기절 안했으면 1번 교체
          switchNpc(bt, "npcBench1", queueObject.enqueue);
        } else if (bt.npcBench2.faint !== true && bt.npcBench1.faint === true) {
          //1번 기절했고 2번 기절 안했으면 2번 교체
          switchNpc(bt, "npcBench2", queueObject.enqueue);
        }
      }
    };
  } else if (bottom === "uturn") {
    // 유턴 사용시 교체 화면
    handleSwitch = (index) => {
      setBottom("skill");
      let bt = structuredClone(battle);
      bt.common.temp.uturn = null;
      switchPlayer(bt, index, queueObject.enqueue);
      queueObject.dequeue(); // "누구로 교체할까?"를 dequque를 막아놨기에 직접 해줘야함
      if (
        bt.turn.fastActUser === "npc" || // npc가 더 빠른 경우 = 이미 행동을 한 경우
        bt.npc.faint // npc가 유턴을 맞고 기절한 경우
      ) {
        turnEnd(bt, queueObject.enqueue);
      } else if (bt.turn.fastActUser === "player") {
        //플레이어가 더 빠른 경우
        // 교체 하고 npc 행동 재개
        attackNpc(bt, bt.turn.playerSN, bt.turn.npcSN, queueObject.enqueue);
        turnEnd(bt, queueObject.enqueue);
      }
    };
  } else if (bottom === "switch") {
    // 행동으로 교체를 고른 경우
    handleSwitch = (index) => {
      if (battle.player.tempStatus.switchLock !== null) {
        // 교체불가 상태 (마그마스톰)
        // 유턴이나 기절로 인한 교체는 가능
        setText("교체할 수 없다!");
        return;
      }
      setBottom("skill");
      battleStart(battle, index, npcChoice(battle, index), queueObject);
    };
  }

  return (
    <>
      <TextBox text={text} />
      <BenchPokemon battle={battle} index={"player"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      <BenchPokemon battle={battle} index={"playerBench1"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      <BenchPokemon battle={battle} index={"playerBench2"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      {bottom === "switch" && (
        <ChangeButton
          onClick={() => {
            setText(battle.player.origin.names + " 무엇을 할까?");
            setBottom("skill");
          }}
          innerText={"뒤로가기"}
        />
      )}
    </>
  );
};

export default BottomSectionSwitch;
