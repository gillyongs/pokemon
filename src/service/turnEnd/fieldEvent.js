import { weatherChange } from "../../function/weatherField";
import { recover } from "../../function/recover";
import { flyingCheck } from "../../util/flyingCheck";
import { speedCheck } from "../../util/speedCheck";

// 🧩 메인 엔트리 포인트
export function processFieldEffects(battle, enqueue) {
  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";

  // 트릭룸 카운트
  processTrickRoom(battle, enqueue);

  // 날씨 카운트
  processWeather(battle, enqueue);

  // 필드 카운트
  processField(battle, enqueue, fastUser, slowUser);
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

/* -------------------------------------------------------------------------------------------------
   2️⃣ 날씨 처리
------------------------------------------------------------------------------------------------- */
function processWeather(battle, enqueue) {
  if (battle.field.weather === null) return;

  battle.field.weatherTurnRemain--;
  if (battle.field.weatherTurnRemain <= 0) {
    weatherChange(battle, null, enqueue, null);
    return;
  }

  const msgMap = {
    쾌청: "햇볕이 쨍쩅하다.",
    비: "비가 내리고있다.",
    모래바람: "모래바람이 거세게 분다.",
    싸라기눈: "싸라기눈이 내리고있다.",
  };

  const text = msgMap[battle.field.weather];
  if (text) enqueue({ battle, text });
}

/* -------------------------------------------------------------------------------------------------
   3️⃣ 필드(그래스필드, 일렉트릭필드 등)
------------------------------------------------------------------------------------------------- */
function processField(battle, enqueue, fastUser, slowUser) {
  const bf = battle.field;
  const field = bf.field;
  if (field === null) return;

  let fieldEndText = "";

  // 그래스필드 효과
  if (field === "그래스필드") {
    fieldEndText = "발밑의 풀이 사라졌다!";
    const healText = "의 체력이 회복되었다!";

    // ✅ 빠른 쪽 먼저 회복 → 느린 쪽 순서
    for (const user of [fastUser, slowUser]) {
      const p = battle[user];
      if (!p.faint && p.hp < p.origin.hp && !flyingCheck(battle, p)) {
        recover(battle, Math.floor(p.origin.hp / 16), user, enqueue, `[그래스필드] ${p.name}${healText}`);
      }
    }
  }

  // 일렉트릭필드 효과 (회복 없음)
  else if (field === "일렉트릭필드") {
    fieldEndText = "발밑의 전기가 사라졌다!";
  }

  // 턴 종료 시 지속 시간 차감
  bf.fieldTurnRemain--;
  if (bf.fieldTurnRemain === 0) {
    bf.fieldTurnRemain = null;
    bf.field = null;
    enqueue({ battle, text: fieldEndText });
  }
}
