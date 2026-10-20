import React, { useEffect } from "react";
import styled from "styled-components";

const InfoContainer = styled.div`
  position: absolute;
  width: 48vw;
  height: 7vh;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(100, 255, 218, 0.18);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  cursor: ${({ type }) => (type === "type" ? "default" : "pointer")};
  transition: all 0.2s ease;
  font-size: 15px;
  top: ${({ type }) => (type === "type" || type === "status" ? "24vh" : "32vh")};
  left: ${({ type }) => (type === "item" || type === "status" ? "auto" : "1vw")};
  right: ${({ type }) => (type === "item" || type === "status" ? "1vw" : "auto")};

  ${({ type }) =>
    type !== "type" &&
    `
    &:hover {
      border-color: rgba(100, 255, 218, 0.6);
      background: linear-gradient(135deg, rgba(30, 50, 60, 0.9), rgba(0, 0, 0, 0.75));
    }
    &:active {
      transform: scale(0.97);
    }
  `}
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

const InfoTextWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 55px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
`;

const InfoText = styled.div`
  font-size: 12px;
  color: #fff;
  opacity: 0.85;
`;

const InfoTextName = styled.div``;

let consecutiveClickCount = 0;

const InfoButton = ({ pokemon, type, setText, bench }) => {
  useEffect(() => {
    const handleGlobalClick = () => {
      consecutiveClickCount = 0;
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

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
    handleClick = (e) => {
      e.stopPropagation();
      consecutiveClickCount = 0;
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
    handleClick = (e) => {
      e.stopPropagation();
      consecutiveClickCount = 0;
    };
  } else if (type === "abil") {
    imgSrc = `/pokemon/img/background/abil.webp`;
    innerText = "특성";
    innerContent = pokemon.origin.abil;
    handleClick = (e) => {
      e.stopPropagation();
      consecutiveClickCount = 0;
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
      if (pokemon.ailment.burn) {
        statusText = "화상";
      } else if (pokemon.ailment.freeze) {
        statusText = "얼음";
      } else if (pokemon.ailment.mabi) {
        statusText = "마비";
      } else if (pokemon.ailment.poison) {
        statusText = "독";
      } else if (pokemon.ailment.mpoison) {
        statusText = "맹독";
      } else if (pokemon.ailment.sleep) {
        statusText = "잠듦";
      }
    }
    innerContent = statusText;
    handleClick = (e) => {
      e.stopPropagation();
      if (statusText === "정상") {
        consecutiveClickCount++;
        if (consecutiveClickCount === 5) {
          setText("나는 정점이다.");
        } else {
          setText("정상이다.");
        }
      } else {
        consecutiveClickCount = 0;
        setText(statusTexts[statusText]);
      }
    };
  }

  return (
    <InfoContainer type={type} onClick={handleClick}>
      <InfoIcon src={imgSrc} alt={type} />
      <InfoTextWrapper>
        <InfoText>{innerText}</InfoText>
        <InfoTextName>{innerContent}</InfoTextName>
      </InfoTextWrapper>
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
