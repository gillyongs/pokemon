import { typeCheck } from "../util/typeEffectCalculate";
import { poison, mPoison, pokemonNoStatusCheck } from "../function/statusCondition";
export const applyFieldEffects = (bt, atks, enqueue) => {
  //교체해서 나올때 장판(스텔스록, 독압정) 체크
  //switch.js에서 호출

  let defs;

  if (atks === "player") {
    defs = "npc";
  } else if (atks === "npc") {
    defs = "player";
  }

  const atk = bt[atks];
  const def = bt[defs];

  //초승달춤
  if (bt.field[atks].noClean.lunarDance) {
    const isFullHP = atk.hp === atk.origin.hp;
    const noStatus = pokemonNoStatusCheck(atk);

    const isFullPP = [1, 2, 3, 4].every((n) => atk.pp[n] === atk.origin.skill[n].pp);
    if (isFullHP && noStatus && isFullPP) {
      // 회복할게 없는 경우
      // 기술이 사용되지 않고 필드에 남아있는다
    } else {
      enqueue({ battle: bt, text: atk.names + " 신비한 달빛에 둘러싸였다!" });
      bt.field[atks].noClean.lunarDance = null;
      atk.resetStatus(); // 상태이상 회복
      atk.pp[1] = atk.origin.skill[1].pp;
      atk.pp[2] = atk.origin.skill[2].pp;
      atk.pp[3] = atk.origin.skill[3].pp;
      atk.pp[4] = atk.origin.skill[4].pp;
      // 메타몽 나오면 로직 고려해봐야겠는데
      atk.recover(bt, atk.origin.hp, enqueue, atk.name + "의 체력과 상태이상과 PP가 회복됐다!");
    }
  }

  if (bt.field[atks].noClean.healingWish) {
    //치유소원 -> 교체로 나온 포켓몬의 체력과 상태이상을 회복한다
    //교체로 나온 포켓몬한테 치유할게 없으면 필드에 남는다
    //치유소원 발동하고 스텔스록이 터진다
    //공중판정 없음
    if (atk.hp === atk.origin.hp && pokemonNoStatusCheck(atk)) {
      // 회복할게 없는 경우
    } else {
      enqueue({ battle: bt, text: "치유소원이 " + atk.name + "에게 전해졌다!" });
      bt.field[atks].noClean.healingWish = null;
      atk.resetStatus(); // 상태이상 회복
      atk.recover(bt, atk.origin.hp, enqueue, atk.name + "의 체력과 상태이상이 회복됐다!");
    }
  }

  if (atk.item === "통굽부츠") {
    return;
  }

  // 스텔스록
  if (bt.field[atks].sRock) {
    // 공중 판정 안받음 (풍선도)
    const text = atk.name + "에게 뾰족한 바위가 박혔다!";
    const typeDamage = typeCheck("바위", atk.type1, atk.type2);
    atk.getDamage(bt, enqueue, Math.floor((atk.origin.hp / 8) * typeDamage), text);
  }

  if (atk.isFlying(bt)) {
    return;
  }
  // 독압정
  let poisonSpikes = bt.field[atks].poisonSpikes;
  if (poisonSpikes !== null) {
    if (atk.type1 === "독" || atk.type2 === "독") {
      bt.field[atks].poisonSpikes = null;
      enqueue({ battle: bt, text: "바닥의 독압정이 제거되었다!" });
    }
    if (poisonSpikes === 1) {
      poison(bt, atks, enqueue);
    } else if (poisonSpikes === 2) {
      mPoison(bt, atks, enqueue);
    } else {
      console.error("독압정 에러");
    }
  }
};
