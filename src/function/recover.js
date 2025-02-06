export const recover = (
  battle,
  recoverValue,
  recoveredPokemon,
  enqueue,
  text
) => {
  let pokemon;
  if (recoveredPokemon === "npc") {
    pokemon = battle.npc;
  } else if (recoveredPokemon === "player") {
    pokemon = battle.player;
  }

  if (pokemon.hp >= pokemon.origin.hp) {
    enqueue({ battle, text: "더 이상 회복할 수 없다!" });
    return;
  }
  pokemon.hp += Math.floor(recoverValue);
  if (pokemon.hp >= pokemon.origin.hp) {
    pokemon.hp = pokemon.origin.hp;
  }
  if (text) {
    enqueue({ battle: battle, text: text });
  } else {
    enqueue({ battle: battle, text: pokemon.names + " 체력을 회복했다!" });
  }
};
