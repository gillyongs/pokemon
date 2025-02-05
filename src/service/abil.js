export const abil = (bt, atks, enqueue) => {
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
};
