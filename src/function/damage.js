export const damage = (battle, skillDamage, getDamagePokemon, enqueue, text) => {
  // 공격 외 데미지 (반동, 필드, 상태이상)
  damageFunction(battle, skillDamage, getDamagePokemon, enqueue, text, false);
};

export const attackDamage = (battle, skillDamage, getDamagePokemon, enqueue, text) => {
  // 공격으로 준 데미지
  damageFunction(battle, skillDamage, getDamagePokemon, enqueue, text, true);
};

const damageFunction = (battle, skillDamage, getDamagePokemon, enqueue, text, attackYn) => {
  let defPokemon;
  let atkPokemon;

  if (getDamagePokemon === "npc") {
    defPokemon = battle.npc;
    atkPokemon = battle.player;
  } else if (getDamagePokemon === "player") {
    defPokemon = battle.player;
    atkPokemon = battle.npc;
  }

  const useSkill = battle[battle.turn.atk].origin["sk" + battle.turn.atkSN];
  const skDamage = Math.floor(skillDamage);

  if (defPokemon.hp <= 0) {
    return;
  }
  let actualGiveDamage = skDamage; //실제로 준 데미지
  let gdTrigger = false;
  if (defPokemon.item === "기합의띠" && defPokemon.hp === defPokemon.origin.hp && attackYn) {
    gdTrigger = true;
  }
  let hpBackUp = defPokemon.hp;
  defPokemon.hp -= skDamage;
  if (defPokemon.hp <= 0) {
    actualGiveDamage = hpBackUp;
    defPokemon.hp = 0;
    if (gdTrigger) {
      defPokemon.item = null;
      defPokemon.hp = 1;
      actualGiveDamage = hpBackUp - 1;
    }
  }
  if (attackYn) {
    atkPokemon.temp.recentDamageGive = actualGiveDamage;
    defPokemon.temp.recentDamageGet = actualGiveDamage;
    atkPokemon.tempStatus.recentSkillUse = useSkill;
    defPokemon.tempStatus.recentSkillGet = useSkill;
  }

  if (text) {
    enqueue({ battle: battle, text: text });
  }
  if (battle.turn.atk && battle[battle.turn.atk].temp.critical) {
    enqueue({ battle: battle, text: "급소에 맞았다!" });
  }
  if (gdTrigger && defPokemon.item === null) {
    enqueue({ battle: battle, text: defPokemon.names + " 기합의 띠로 버텼다!" });
  }
  if (defPokemon.hp === 0) {
    defPokemon.faint = true;
    Object.keys(defPokemon.status).forEach((key) => {
      defPokemon.status[key] = null;
    });
    //기절시 모든 상태이상 초기화
    enqueue({ battle: battle, text: defPokemon.names + " 쓰러졌다!" });
  }
};
