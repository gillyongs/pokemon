import React, { useState } from "react";
import TextBox from "../TextBox";
import SwitchButton from "../SwitchButton";
import TextButton from "../TextButton";
import BenchPokemon from "./BenchPokemon";
import LogModal from "../../LogModal";
import { battleStart } from "../../../service/battleStart";
import { switchPlayer, switchBothFaint } from "../../../service/switch";
import { turnEnd } from "../../../service/turnEnd";
import { attackNpc } from "../../../service/attack";
import { npcChoice } from "../../../npc/npc";
const BottomSectionSwitch = ({ battle, text, bottom, setBottom, setBench, queueObject, setText, btObj }) => {
  const [selected, setSelected] = useState(null);
  const [logOpen, setLogOpen] = useState(false);
  const handleSelected = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };

  let handleSwitch;
  if (bottom === "mustSwitch") {
    // 포켓몬이 쓰러져서 교체하는 화면
    handleSwitch = (index) => {
      setBottom("skill");
      if (btObj.npc.faint) {
        // npc만 쓰러졌을 경우 turnEnd.js에서 처리하지만
        // 양측 포켓몬이 동시에 쓰러졌을경우 플레이어 포켓몬 교체 UI를 띄운 다음 NPC 교체가 진행되어야 하기에
        // bottomSwitch에서 교체한다.

        // 맞교체는 필드 위 포켓몬이 '교체' 행동을 한 것이므로 필드 위 스피드의 포켓몬을 따르지만
        // 양쪽 다 기절하여 교체한 경우 스피드를 비교할 포켓몬이 필드 위에 없기에 그냥 랜덤으로 나온다.
        // 이후 아이템/특성은 스피드가 빠른쪽이 먼저 발동된다
        switchBothFaint(btObj, index, queueObject.enqueue);
      } else {
        switchPlayer(btObj, index, queueObject.enqueue);
      }
      queueObject.dequeue(); // "누구로 교체할까?"를 dequeue를 막아놨기에 직접 해줘야함
    };
  } else if (bottom === "uturn") {
    // 유턴 사용시 교체 화면
    handleSwitch = (index) => {
      setBottom("skill");
      btObj.turn.uturn = null;
      switchPlayer(btObj, index, queueObject.enqueue);
      queueObject.dequeue(); // "누구로 교체할까?"를 dequeue를 막아놨기에 직접 해줘야함
      if (
        btObj.turn.fastActUser === "npc" || // npc가 더 빠른 경우 = 이미 행동을 한 경우
        btObj.npc.faint // npc가 유턴을 맞고 기절한 경우
      ) {
        turnEnd(btObj, queueObject.enqueue);
      } else if (btObj.turn.fastActUser === "player") {
        // 플레이어가 더 빠른 경우
        // 교체를 진행 하고 npc 행동 재개
        // battleStart.js에서 플레이어가 유턴을 쓰면 그냥 리턴 떄려버리고 여기서 마저 진행하는 구조
        attackNpc(btObj, btObj.player.turn.choice, btObj.npc.turn.choice, queueObject.enqueue);
        turnEnd(btObj, queueObject.enqueue);
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
      battleStart(btObj, index, npcChoice(btObj, index), queueObject);
    };
  }

  return (
    <>
      <TextBox text={text} />
      <BenchPokemon battle={battle} index={"player"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      <BenchPokemon battle={battle} index={"playerBench1"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      <BenchPokemon battle={battle} index={"playerBench2"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} handleSwitch={handleSwitch} />
      {bottom === "switch" && (
        <SwitchButton
          // 교체 -> 기술 화면으로 되돌아가는 뒤로가기 버튼
          onClick={() => {
            if (!battle.player.auto && !battle.player.charge && !battle.player.recharge) {
              setText(battle.player.origin.names + " 무엇을 할까?");
            }
            setBottom("skill");
          }}
          innerText={"뒤로가기"}
        />
      )}

      {/* 교체 화면에서는 스킵할 텍스트가 없으므로(큐에 "누구로 교체 할까?"가 남아있어도) 항상 로그 버튼을 보여준다 */}
      <TextButton
        isLog={true}
        onClick={() => {
          setLogOpen(true);
        }}
        innerText={"로그"}
      />

      {logOpen && <LogModal log={queueObject.log} onClose={() => setLogOpen(false)} />}
    </>
  );
};

export default BottomSectionSwitch;
