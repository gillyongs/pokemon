// random 함수 정의 및 export
export function flyingCheck(battle, poke) {
  //필드 적용 여부
  //비행타입이나 부유 포켓몬은 필드 영향을 받지 않는다

  let pokemon;
  if (poke === "npc") {
    pokemon = battle.npc;
  } else if (poke === "player") {
    pokemon = battle.player;
  } else if (typeof poke === "object" && poke !== null) {
    pokemon = poke; // 이미 포켓몬 객체일 경우 그대로 할당
  }

  if (pokemon.abil === "부유") {
    return true;
  }

  if (pokemon.type1 === "비행" || pokemon.type2 === "비행") {
    if (pokemon.temp.roost) {
      //날개쉬기
      return false;
    }
    return true;
  }

  return false;
}
