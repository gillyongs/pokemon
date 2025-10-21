import React from "react";
import styled from "styled-components";

const HpBar = ({ hp, maxHp }) => {
  // HP 비율 계산
  const ratio = Math.max(0, hp / maxHp);
  let hpWidth = ratio * 100;

  // 색상 결정 (초록 → 노랑 → 빨강)
  let barColor = "#81ff47"; // 기본: 초록
  if (ratio <= 0.25) barColor = "#ff4747"; // 빨강
  else if (ratio <= 0.5) barColor = "#ffd447"; // 노랑

  return (
    <HpBarWrapper>
      <CurrentHp style={{ width: `${hpWidth}%`, backgroundColor: barColor }} />
      <HpBarText>
        <HpBarTextMargin>
          {hp}/{maxHp}
        </HpBarTextMargin>
      </HpBarText>
    </HpBarWrapper>
  );
};

export default HpBar;

// Styled Components

const HpBarWrapper = styled.div`
  position: absolute;
  width: 18vh;
  height: 3.5vh;
  background-color: #ffffff;
  transform: translate(4%, 7.5vh);
  border: 2px solid #665f5f;
`;

const HpBarText = styled.div`
  position: absolute;
  width: 18vh;
  height: 3.5vh;
  margin-right: 1.5vw;
  margin-bottom: 0.5vh;
  color: black;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  font-size: 2vh;
`;

const HpBarTextMargin = styled.div`
  margin-right: 2%;
  margin-bottom: 2%;
`;

const CurrentHp = styled.div`
  position: absolute;
  height: 3.5vh;
  transition: width 0.3s ease, background-color 0.3s ease; /* 부드러운 변화 */
`;
