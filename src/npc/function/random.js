export function isTimeOfDead(bt) {
  const npc = bt.npc;
  const player = bt.player;
  const st = player.status;
  const tst = player.tempStatus;

  if (st.burn || st.poison || st.mpoison || tst.confuse || tst.seed) {
    // 화상, 독, 맹독, 혼란, 씨뿌리기
    return 100;
  }
  if (npc.item === "먹다남은음식") {
    return 50;
  }
  return 0;
}
