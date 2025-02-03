import React, { useState } from "react";
import TextBox from "../TextBox";
import ChangeButton from "../ChangeButton";
import BenchPokemon from "./BenchPokemon";

const BottomSectionSwitch = ({ battle, text, setBottom, setBench }) => {
  const [selected, setSelected] = useState(null);
  const handleClick = (bench) => {
    setSelected((prev) => (prev === bench ? null : bench));
  };
  return (
    <>
      <TextBox text={text} />

      <BenchPokemon
        pokemon={battle.player}
        selected={selected}
        onClick={handleClick}
        setBench={setBench}
        setBottom={setBottom}
        index={"zero"}
      />

      <BenchPokemon
        pokemon={battle.playerBench1}
        selected={selected}
        onClick={handleClick}
        setBench={setBench}
        setBottom={setBottom}
        index={"one"}
      />

      <BenchPokemon
        pokemon={battle.playerBench2}
        selected={selected}
        onClick={handleClick}
        setBench={setBench}
        setBottom={setBottom}
        index={"two"}
      />

      <ChangeButton onClick={() => setBottom("skill")} innerText={"뒤로가기"} />
    </>
  );
};

export default BottomSectionSwitch;
