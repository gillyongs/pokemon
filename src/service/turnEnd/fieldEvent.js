import { speedCheck } from "../../util/speedCheck";

// 🧩 메인 엔트리 포인트
export function processFieldEffects(battle, enqueue) {
  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";

  // 트릭룸 카운트
  processTrickRoom(battle, enqueue);

  battle.field.weather.handleWeatherTurnEnd(battle, enqueue);

  // 필드 카운트
  battle.field.terrain.handleTerrainTurnEnd(battle, enqueue);
}

/* -------------------------------------------------------------------------------------------------
   1️⃣ 트릭룸 처리
------------------------------------------------------------------------------------------------- */
function processTrickRoom(battle, enqueue) {
  if (battle.field.trickRoom !== null) {
    // 선후공 상관없이 사용한 턴 포함 5턴
    battle.field.trickRoom--;
    if (battle.field.trickRoom === 0) {
      battle.field.trickRoom = null;
      enqueue({ battle, text: "뒤틀린 시공이 원래대로 되돌아왔다!" });
    }
  }
}
