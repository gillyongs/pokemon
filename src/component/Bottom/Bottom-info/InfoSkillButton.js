import styled from "styled-components";
import { getTypeEffectText } from "../../../util/typeEffectCalculate";

const InfoSkillButton = ({ battle, skillNumber, pokemon, setText }) => {
  if (!pokemon) pokemon = battle.player;
  let skill = pokemon.origin.skill[skillNumber];
  let pp = pokemon.pp[skillNumber];
  const sn = getNumberText(skillNumber);

  return (
    <ButtonContainer className={sn} onClick={() => setText(skill.text)}>
      <SkillTypeIcon src={`/pokemon/img/type/${skill.type}.svg`} alt={skill.name} />
      <SkillName>{skill.name}</SkillName>
      <SkillEffect>{getTypeEffectText(pokemon, skill.type, battle.npc.type1, battle.npc.type2, skill.stype)}</SkillEffect>
      <SkillPP>
        {pp}/{skill.pp}
      </SkillPP>
    </ButtonContainer>
  );
};

const getNumberText = (value) => {
  switch (value) {
    case 1:
      return "one";
    case 2:
      return "two";
    case 3:
      return "three";
    case 4:
      return "four";
    default:
      return "Invalid value";
  }
};

const ButtonContainer = styled.div`
  position: absolute;
  width: 48vw;
  height: 7vh;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 15px;
  &:hover {
    border-color: rgba(100, 255, 218, 0.6);
  }
  &:active {
    transform: scale(0.97);
  }
  &.one {
    top: 40vh;
    left: 1vw;
  }
  &.two {
    top: 40vh;
    right: 1vw;
  }
  &.three {
    top: 48vh;
    left: 1vw;
  }
  &.four {
    top: 48vh;
    right: 1vw;
  }
`;

const SkillTypeIcon = styled.img`
  position: absolute;
  width: 40px;
  height: 80%;
  top: 50%;
  transform: translateY(-50%);
  left: 8px;
  border-radius: 5px;
`;

const SkillName = styled.div`
  position: absolute;
  top: 6px;
  left: 55px;
  right: 6px;
  white-space: nowrap;
  line-height: 1.2;
`;

const SkillEffect = styled.div`
  position: absolute;
  bottom: 5px;
  left: 55px;
  font-size: 10px;
  line-height: 1.2;
`;

const SkillPP = styled.div`
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: 8px;
  padding: 1px 6px;
  background-color: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  border-radius: 10px;
`;

export default InfoSkillButton;
