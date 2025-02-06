import { rank } from "../function/rank";

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

  if (atkAbil === "재앙의검") {
    enqueue({
      battle: bt,
      text: "[특성 재앙의검] " + atk.name + " 주위의 방어가 약해졌다!",
    });
  }
  // 방어 깎는건 어차피 statCalculate에서 작동하므로 text만 띄어주며됨

  if (atkAbil === "불요의검") {
    const text = "[특성 불요의검]";
    rank(bt, enqueue, atks, "atk", 1, text);
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
};
