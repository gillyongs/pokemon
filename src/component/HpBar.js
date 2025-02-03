import React from "react";
import styled from "styled-components";

const HpBar = ({ hp, maxHp }) => {
  // HP bar width calculation based on hp/maxHp ratio
  let hpWidth = (hp / maxHp) * 100; // Calculate the percentage
  if (hp <= 0) {
    hpWidth = 0;
  }

  return (
    <HpBarWrapper>
      <CurrentHp style={{ width: `${hpWidth}%` }} />
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
  width: 18vh; /* Rectangle width */
  height: 3.5vh; /* Rectangle height */
  background-color: #ffffff; /* Background color */
  transform: translate(4%, 7.5vh);
  border: 2px solid #665f5f; /* Border color */
`;

const HpBarText = styled.div`
  position: absolute;
  width: 18vh; /* Rectangle width */
  height: 3.5vh; /* Rectangle height */
  margin-right: 1.5vw;
  margin-bottom: 0.5vh;
  color: black;
  text-align: right;
  display: flex;
  justify-content: flex-end; /* Align text to the right */
  align-items: flex-end; /* Align text vertically */
  font-size: 2vh;
`;

const HpBarTextMargin = styled.div`
  margin-right: 2%;
  margin-bottom: 2%;
`;

const CurrentHp = styled.div`
  position: absolute;
  width: 18vh; /* Rectangle width */
  height: 3.5vh; /* Rectangle height */
  background-color: #81ff47; /* Light green color for the HP bar */
`;
