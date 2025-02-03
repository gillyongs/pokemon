import React from "react";

const LongInfoButton = ({ pokemon, type }) => {
  let imgSrc;
  let innerText;
  let innerContent;

  if (type === "item") {
    imgSrc = `/pokemon/img/item/${pokemon.item}.webp`;
    innerText = "지닌아이템";
    innerContent = pokemon.item;
  } else if (type === "type") {
    imgSrc = `/pokemon/img/type/${pokemon.origin.type1}.svg`;
    innerText = "타입";
    let pokemonTypeText = pokemon.origin.type1;
    if (pokemon.origin.type2 !== null || pokemon.origin.type2 !== undefined) {
      pokemonTypeText += ", " + pokemon.origin.type2;
    }
    innerContent = pokemonTypeText;
  } else if (type === "abil") {
    imgSrc = `/pokemon/img/background/abil.webp`;
    innerText = "특성";
    innerContent = pokemon.origin.abil;
  }
  return (
    <div
      className={`pokemon-benchinfo-${type}`}
      onClick={() => {
        console.log("a");
      }}
    >
      <img
        className={`pokemon-benchinfo-${type}-icon`}
        src={imgSrc}
        alt="item"
      />
      <div className={`pokemon-benchinfo-${type}-text`}>{innerText}</div>
      <div className={`pokemon-benchinfo-${type}-text-name`}>
        {innerContent}
      </div>
    </div>
  );
};

export default LongInfoButton;
