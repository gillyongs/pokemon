import { typeCheckConsole } from "../util/typeCheck";

const SkillButton = ({ battle, skillNumber, onClick }) => {
  const skill = "sk" + skillNumber;
  const pp = "pp" + skillNumber;
  const sk = battle.player.origin[skill];
  const sn = getNumberText(skillNumber);
  return (
    <div className={`skill ${sn}`} onClick={onClick}>
      <img
        className="type"
        src={`/pokemon/img/type/${sk.type}.svg`}
        alt={sk.name}
      />
      <div className="skill_name">{sk.name}</div>
      <div className="skill_effect">
        {typeCheckConsole(sk.type, battle.npc.type1, battle.npc.type2)}
      </div>
      <div className="skill_pp">
        {battle.player[pp]}/{sk.pp}
      </div>
    </div>
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
      return "Invalid value"; // 값이 1~4가 아닌 경우
  }
};

export default SkillButton;
