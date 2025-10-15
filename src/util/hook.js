import { damage } from "../function/damage";
export const items = {
  생명의구슬: {
    onAfterAttack(battle, pokemon, enqueue) {
      if (pokemon.faint) return;
      const stype = pokemon.origin["sk" + battle.turn.atkSN]?.stype;
      if (stype === "atk" || stype === "catk") {
        const text = `${pokemon.name}의 생명이 조금 깎였다?`;
        damage(battle, pokemon.origin.hp / 10, pokemon.team, enqueue, text);
      }
    },
    onDamageCalculate(battle, pokemon, baseDamage) {
      pokemon.log.damage1 += " * 1.3 (생구)";
      return baseDamage * 1.3;
    },
  },
  펀치글러브: {
    onDamageCalculate(battle, pokemon, baseDamage) {
      const skillNumber = battle.turn.atkSN;
      const attackPokemon = battle[battle.turn.atk];
      const skillKey = `sk${skillNumber}`;
      const sk = attackPokemon.origin[skillKey]; // 시전 스킬
      if (sk.feature?.punch) {
        pokemon.log.damage1 += " * 1.1 (펀치글러브)";
        return baseDamage * 1.1;
      }
      return baseDamage;
    },
  },
};

export function triggerItemEvent(pokemon, eventName, battle, enqueue, opponent) {
  const itemName = pokemon.item;
  if (!itemName) return;

  const eventHandler = items[itemName]?.[eventName];
  if (typeof eventHandler === "function") {
    eventHandler(battle, pokemon, enqueue, opponent);
  }
}

export function getItemDamageModifier(pokemon, battle, baseDamage) {
  const itemName = pokemon.item;
  if (!itemName) return baseDamage;

  const modifyFn = items[itemName]?.onDamageCalculate;
  if (typeof modifyFn === "function") {
    return modifyFn(battle, pokemon, baseDamage);
  }

  return baseDamage;
}
