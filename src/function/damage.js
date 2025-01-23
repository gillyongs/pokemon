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
  pokemon.hp -= skDamage;
  if (pokemon.hp <= 0) {
    pokemon.hp = 0;
  }
  if (text) {
    enqueue({ battle: battle, text: text });
  }
  if (pokemon.hp === 0) {
    pokemon.faint = true;
    enqueue({ battle: battle, text: pokemon.names + " 쓰러졌다!" });
  }
};
