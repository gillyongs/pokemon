import { damage } from "./damage";
import { speedCheck } from "./speedCheck";
import skillEffect from "../component/SkilleEffect";

class Attack {
  constructor(battle, atk, def, skillNumber) {
    this.battle = battle;
    this.atk = atk;
    this.def = def;
    this.skillNumber = skillNumber;
  }
}

export const battleStart = (battle, setBattle, skillNumber) => {
  let bt = structuredClone(battle);
  let speedVs = speedCheck(bt);
  const pton = new Attack(bt, "player", "npc", skillNumber);
  const ntop = new Attack(bt, "npc", "player", skillNumber);
  let firstAttack;
  let lastAttack;

  if (speedVs === "player") {
    firstAttack = pton;
    lastAttack = ntop;
  } else if (speedVs === "npc") {
    firstAttack = ntop;
    lastAttack = pton;
  }
  bt = attack(firstAttack);
  if (bt[firstAttack.def].hp === 0) {
    setBattle(bt); // 상태 업데이트
    return;
  }

  bt = attack(lastAttack);

  setBattle(bt); // 상태 업데이트
};

const attack = (Attack) => {
  const { battle, skillNumber, atk, def } = Attack;
  let skillDamage = damage(battle, skillNumber, atk);
  battle[def].hp -= skillDamage; // 받은 데미지를 반영한 후의 HP
  if (battle[def].hp < 0) {
    battle[def].hp = 0;
  }
  const ppKey = `pp${skillNumber}`;
  const skKey = `sk${skillNumber}`;
  battle[atk][ppKey] -= 1;
  const skillFunction = skillEffect(battle[atk].origin[skKey].skillEffect);
  if (typeof skillFunction === "function") {
    skillFunction(Attack);
  } else {
  }
  return battle;
};
