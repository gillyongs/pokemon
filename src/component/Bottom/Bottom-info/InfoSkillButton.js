import styled from "styled-components";
import { typeCheckConsole } from "../../../util/typeCheck";

const InfoSkillButton = ({ battle, skillNumber, pokemon, setText }) => {
  const skill = "sk" + skillNumber;
  const pp = "pp" + skillNumber;
  let sk;
  if (!pokemon) {
    pokemon = battle.player;
  }
  sk = pokemon.origin[skill];

  const sn = getNumberText(skillNumber);

  return (
    <ButtonContainer className={sn} onClick={() => setText(sk.text)}>
      <SkillTypeIcon src={`/pokemon/img/type/${sk.type}.svg`} alt={sk.name} />
      <SkillName>{sk.name}</SkillName>
      <SkillEffect>{typeCheckConsole(pokemon, sk.type, battle.npc.type1, battle.npc.type2, sk.stype)}</SkillEffect>
      <SkillPP>
        {pokemon[pp]}/{sk.pp}
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
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  font-size: 15px;
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
`;

const SkillEffect = styled.div`
  position: absolute;
  top: 25px;
  left: 54px;
  font-size: 10px;
`;

const SkillPP = styled.div`
  position: absolute;
  bottom: 4px;
  right: 3px;
  font-size: 10px;
  background-color: #665f5f;
  border-radius: 5px;
`;

export default InfoSkillButton;
