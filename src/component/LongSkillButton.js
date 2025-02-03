import { typeCheckConsole } from "../util/typeCheck";

const LongSkillButton = ({ battle, skillNumber, setText, pokemon }) => {
  const skill = "sk" + skillNumber;
  const pp = "pp" + skillNumber;
  let sk;
  if (pokemon === undefined || pokemon === null) {
    sk = battle.player.origin[skill];
  } else {
    sk = pokemon.origin[skill];
  }
  const sn = getNumberText(skillNumber);
  return (
    <div
      className={`long-skill-button ${sn}`}
      onClick={() => {
        setText(sk.text);
        console.log(sk);
      }}
    >
      <img
        className="long-skill-button-type"
        src={`/pokemon/img/type/${sk.type}.svg`}
        alt={sk.name}
      />
      <div className="long-skill-button-skill-name">{sk.name}</div>
      <div className="long-skill-button-skill-effect">
        {typeCheckConsole(sk.type, battle.npc.type1, battle.npc.type2)}
      </div>
      <div className="long-skill-button-skill-pp">
        {pokemon[pp]}/{sk.pp}
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

export default LongSkillButton;
