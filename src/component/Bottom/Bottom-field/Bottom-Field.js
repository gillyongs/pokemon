import React, { useState } from "react";
import TextBox from "../TextBox";
import SwitchButton from "../SwitchButton";
import BenchPokemon from "./FieldButton";

const BottomSectionField = ({ battle, text, bottom, setBottom, setBench, queueObject, setText, btObj }) => {
  const [selected, setSelected] = useState(null);
  const handleSelected = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };

  return (
    <>
      <TextBox text={text} />
      <BenchPokemon battle={battle} index={"player"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} />
      <BenchPokemon battle={battle} index={"playerBench1"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} />
      <BenchPokemon battle={battle} index={"playerBench2"} selected={selected} handleSelected={handleSelected} setBench={setBench} setBottom={setBottom} />
      {bottom === "field" && (
        <SwitchButton
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

export default BottomSectionField;
