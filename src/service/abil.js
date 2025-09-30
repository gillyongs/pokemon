import { rank } from "../function/rank";
import { damage } from "../function/damage";
import { typeCheck } from "../util/typeCheck";
export const abil = (bt, atks, enqueue) => {
  //특성 발동
  //배틀이 시작될때, 교체해서 나올때 발동
  //전자는 battleScrren.js에 useEffect
  //후자는 switch.js에

  let defs;

  if (atks === "player") {
    defs = "npc";
  } else if (atks === "npc") {
    defs = "player";
  }

  const atk = bt[atks];
  const def = bt[defs];
  const atkAbil = atk.abil;
  const defAbil = def.abil;

  const calamityMessages = {
    재앙의검: "주위의 방어가 약해졌다!",
    재앙의그릇: "주위의 특수공격이 약해졌다!",
    재앙의구슬: "주위의 특수방어가 약해졌다!",
    재앙의목간: "주위의 공격이 약해졌다!",
  };
  Object.entries(calamityMessages).forEach(([abil, message]) => {
    if (atkAbil === abil) {
      enqueue({
        battle: bt,
        text: `[특성 ${abil}] ${atk.name} ${message}`,
      });
    }
  });
  // 능력치 깎는건 어차피 statCalculate에서 작동하므로 text만 띄어주며됨

  if (atkAbil === "불요의검") {
    const text = "[특성 불요의검]";
    rank(bt, enqueue, atks, "atk", 1, text);
  }

  if (atkAbil === "불굴의방패") {
    const text = "[특성 불굴의방패]";
    rank(bt, enqueue, atks, "def", 1, text);
  }

  if (atkAbil === "위협") {
    const text = "[특성 위협]";
    rank(bt, enqueue, defs, "atk", -1, text);
  }

  if (atkAbil === "잔비" && bt.field.weather !== "비") {
    bt.field.weather = "비";
    bt.field.weatherTurnRemain = 5;
    enqueue({
      battle: bt,
      text: "[특성 잔비] " + atk.name + " 주변에 비가 내리기 시작했다!",
    });
  }

  if (atkAbil === "그래스메이커" && bt.field.field !== "그래스필드") {
    bt.field.field = "그래스필드";
    bt.field.fieldTurnRemain = 5;
    enqueue({
      battle: bt,
      text: "[특성 그래스메이커] " + atk.name + " 발밑에 풀이 무성해졌다!",
    });
  }

  if (atkAbil === "하드론엔진" && bt.field.field !== "일렉트릭필드") {
    bt.field.field = "일렉트릭필드";
    bt.field.fieldTurnRemain = 5;
    enqueue({
      battle: bt,
      text: "[특성 하드론엔진] " + atk.names + " 일렉트릭필드를 전개하여 미래 기관을 가동했다!",
    });
  }

  if (bt.field[atks].sRock && atk.item !== "통굽부츠") {
    //스텔스록
    const text = atk.name + "에게 뾰족한 바위가 박혔다!";
    const typeDamage = typeCheck("바위", atk.type1, atk.type2);
    damage(bt, Math.floor((atk.origin.hp * typeDamage) / 8), atks, enqueue, text);
  }
};
