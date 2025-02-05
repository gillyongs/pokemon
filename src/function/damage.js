export const damage = (
  battle,
  skillDamage,
  getDamagePokemon,
  enqueue,
  text
) => {
  let pokemon;
  if (getDamagePokemon === "npc") {
    pokemon = battle.npc;
  } else if (getDamagePokemon === "player") {
    pokemon = battle.player;
  }
  const skDamage = Math.floor(skillDamage);

  if (pokemon.hp <= 0) {
    return;
  }

  let gdTrigger = false;
  if (pokemon.item === "기합의띠" && pokemon.hp === pokemon.origin.hp) {
    gdTrigger = true;
  }
  pokemon.hp -= skDamage;
  if (pokemon.hp <= 0) {
    pokemon.hp = 0;
    if (gdTrigger) {
      pokemon.item = null;
      pokemon.hp = 1;
    }
  }
  if (text) {
    enqueue({ battle: battle, text: text });
  }
  if (battle[battle.turn.atk].temp.critical) {
    enqueue({ battle: battle, text: "급소에 맞았다!" });
  }
  if (gdTrigger && pokemon.item === null) {
    enqueue({ battle: battle, text: pokemon.names + " 기합의 띠로 버텼다!" });
  }
  if (pokemon.hp === 0) {
    pokemon.faint = true;
    Object.keys(pokemon.status).forEach((key) => {
      pokemon.status[key] = null;
    });
    //기절시 모든 상태이상 초기화
    enqueue({ battle: battle, text: pokemon.names + " 쓰러졌다!" });
  }
};
