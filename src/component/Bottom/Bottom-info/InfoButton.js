import React from "react";
import styled from "styled-components";

const InfoContainer = styled.div`
  position: absolute;
  width: 48vw;
  height: 7vh;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 15px;
  top: ${({ type }) => (type === "type" || type === "status" ? "24vh" : "32vh")};
  left: ${({ type }) => (type === "item" || type === "status" ? "auto" : "1vw")};
  right: ${({ type }) => (type === "item" || type === "status" ? "1vw" : "auto")};
`;

const InfoIcon = styled.img`
  position: absolute;
  width: 40px;
  height: 40px;
  top: 50%;
  transform: translateY(-50%);
  left: 8px;
  border-radius: 5px;
`;

const InfoText = styled.div`
  position: absolute;
  top: 10px;
  left: 55px;
  font-size: 12px;
`;

const InfoTextName = styled.div`
  position: absolute;
  top: 27px;
  left: 55px;
`;

const InfoButton = ({ pokemon, type, setText }) => {
  let imgSrc;
  let innerText;
  let innerContent;
  let handleClick;
  let itemText;
  if (type === "item") {
    imgSrc = `/pokemon/img/item/${pokemon.item}.webp`;
    innerText = "지닌아이템";
    innerContent = pokemon.item;
    itemText = pokemon.itemText;
    if (pokemon.item === null) {
      innerContent = "없음";
      itemText = "지닌 아이템 없음";
    }
    handleClick = () => {
      setText(itemText);
    };
  } else if (type === "type") {
    imgSrc = `/pokemon/img/type/${pokemon.type1}.svg`;
    innerText = "타입";
    let pokemonTypeText = pokemon.type1;
    if (pokemon.origin.type2) {
      pokemonTypeText += ", " + pokemon.type2;
    }
    innerContent = pokemonTypeText;
    handleClick = () => {};
  } else if (type === "abil") {
    imgSrc = `/pokemon/img/background/abil.webp`;
    innerText = "특성";
    innerContent = pokemon.origin.abil;
    handleClick = () => {
      setText(pokemon.abilObj.text);
    };
  } else if (type === "status") {
    if (pokemon.origin.type2) {
      imgSrc = `/pokemon/img/type/${pokemon.type2}.svg`;
    } else {
      imgSrc = `/pokemon/img/type/${pokemon.type1}.svg`;
    }
    innerText = "상태";
    let statusText = "정상";
    if (pokemon.faint) {
      statusText = "기절";
    } else {
      if (pokemon.status.burn) {
        statusText = "화상";
      } else if (pokemon.status.freeze) {
        statusText = "얼음";
      } else if (pokemon.status.mabi) {
        statusText = "마비";
      } else if (pokemon.status.poison) {
        statusText = "독";
      } else if (pokemon.status.mpoison) {
        statusText = "맹독";
      } else if (pokemon.status.sleep) {
        statusText = "잠듦";
      }
    }
    innerContent = statusText;
    handleClick = () => {
      if (statusText !== "정상") {
        setText(statusTexts[statusText]);
      }
    };
  }

  return (
    <InfoContainer type={type} onClick={handleClick}>
      <InfoIcon src={imgSrc} alt={type} />
      <InfoText>{innerText}</InfoText>
      <InfoTextName>{innerContent}</InfoTextName>
    </InfoContainer>
  );
};

const statusTexts = {
  독: "매 턴 HP의 1/8의 데미지를 입는다",
  맹독: "매 턴 점차 강해지는 데미지를 입는다",
  화상: "매 턴 HP의 1/16 데미지를 입는다. 물리기의 위력이 절반으로 감소한다.",
  마비: "25%의 확률로 행동할 수 없다. 스피드가 절반으로 감소한다.",
  잠듦: "1~3턴동안 행동을 할 수 없다.",
  얼음: "행동이 불가능하다. 매 턴 20% 확률로 해제된다.",
  기절: "기절하여 더이상 싸울 수 없다.",
};

export default InfoButton;
