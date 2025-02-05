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
  if (gdTrigger && pokemon.item === null) {
    enqueue({ battle: battle, text: pokemon.names + " 기합의 띠로 버텼다!" });
  }
  if (pokemon.hp === 0) {
    pokemon.faint = true;
    enqueue({ battle: battle, text: pokemon.names + " 쓰러졌다!" });
  }
};
