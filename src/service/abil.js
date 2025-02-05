export const abil = (bt, atks, enqueue) => {
  //특성 발동
  //배틀이 시작될때, 교체해서 나올때 발동
  //전자는 battleScrren.js에 useEffect
  //후자는 battleStart.js에
  //(맞교체시 교체가 전부 된 다음 특성이 발동하므로 switch.js에 있어선 안됨)

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
      text: "[특성 재앙의검] 주위의 방어가 약해졌다!",
    });
  }
  // 방어 깎는건 어차피 statCalculate에서 작동하므로 text만 띄어주며노딤
};
