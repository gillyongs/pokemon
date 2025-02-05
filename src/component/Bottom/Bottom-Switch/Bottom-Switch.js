import React, { useState } from "react";
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";
import BenchPokemon from "./BenchPokemon";
import { battleStart } from "../../../service/battleStart";
import { switchPlayer, switchNpc } from "../../../service/switchPokemon";
const BottomSectionSwitch = ({
  battle,
  text,
  bottom,
  setBottom,
  setBench,
  queueObject,
}) => {
  const [selected, setSelected] = useState(null);
  const handleSelected = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };

  let handleSwitch;
  if (bottom === "mustSwitch") {
    handleSwitch = (index) => {
      setBottom("skill");
      let bt = structuredClone(battle);
      switchPlayer(bt, index, queueObject.enqueue);
      queueObject.dequeue(); // "누구로 교체할까?"를 dequque를 막아놨기에 직접 해줘야함
      if (bt.npc.faint) {
        if (bt.npcBench1.faint !== true) {
          // 1번이 기절 안했으면 1번 교체
          switchNpc(bt, "npcBench1", queueObject.enqueue);
        } else if (bt.npcBench2.faint !== true && bt.npcBench1.faint === true) {
          //1번 기절했고 2번 기절 안했으면 2번 교체
          switchNpc(bt, "npcBench2", queueObject.enqueue);
        }
      }
    };
  } else {
    handleSwitch = (index) => {
      setBottom("skill");
      battleStart(battle, index, queueObject);
    };
  }

  return (
    <>
      <TextBox text={text} />

      <BenchPokemon
        battle={battle}
        index={"player"}
        selected={selected}
        handleSelected={handleSelected}
        setBench={setBench}
        setBottom={setBottom}
        handleSwitch={handleSwitch}
      />

      <BenchPokemon
        battle={battle}
        index={"playerBench1"}
        selected={selected}
        handleSelected={handleSelected}
        setBench={setBench}
        setBottom={setBottom}
        handleSwitch={handleSwitch}
      />

      <BenchPokemon
        battle={battle}
        index={"playerBench2"}
        selected={selected}
        handleSelected={handleSelected}
        setBench={setBench}
        setBottom={setBottom}
        handleSwitch={handleSwitch}
      />

      {bottom === "switch" && (
        <ChangeButton
          onClick={() => setBottom("skill")}
          innerText={"뒤로가기"}
        />
      )}
    </>
  );
};

export default BottomSectionSwitch;
