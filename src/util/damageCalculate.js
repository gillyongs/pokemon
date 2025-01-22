import { typeCheck } from "./typeCheck";
export const damageCalculate = (battle) => {
  const skillNumber = battle.turn.atkSN;
  const atk = battle[battle.turn.atk];
  const def = battle[battle.turn.def];
  const skillKey = `sk${skillNumber}`;
  const sk = atk.origin[skillKey];
  let dtype = "";
  if (sk.stype === "atk") {
    dtype = "def";
  } else if (sk.stype === "catk") {
    dtype = "cdef";
  }

  let damage = (22 * sk.power * atk[sk.stype]) / 50 / def[dtype];
  if (atk.status.burn != null && sk.stype === "atk") {
    damage /= 2;
  }
  damage += 2;
  if (sk.type == atk.type1 || sk.type === atk.type2) {
    damage *= 1.5;
  }
  damage *= typeCheck(sk.type, def.type1, def.type2);
  return Math.floor(damage);
};

export const confuseDamageCalculate = (battle) => {
  const pokemon = battle[battle.turn.atk];
  let damage = (22 * 40 * pokemon.atk) / 50 / pokemon.def;
  if (pokemon.status.burn != null) {
    damage /= 2;
  }
  damage += 2;
  return Math.floor(damage);
};
