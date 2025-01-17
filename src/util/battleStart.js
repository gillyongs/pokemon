import { damage } from "./damage";
import { speedCheck } from "./speedCheck";

export const battleStart = (battle, setBattle, skillNumber) => {
  let speedVs = speedCheck(battle);
  console.log(speedVs);

  let first;
  let late;
  let firstStr;
  let lateStr;

  if (speedVs === "player") {
    first = battle.player;
    late = battle.npc;
    firstStr = "player";
    lateStr = "npc";
  } else if (speedVs === "npc") {
    first = battle.npc;
    late = battle.player;
    firstStr = "npc";
    lateStr = "player";
  }

  let firstDamage = damage(battle, skillNumber, firstStr);
  console.log(firstDamage);
  let lateHp = late.hp - firstDamage; // 받은 데미지를 반영한 후의 HP
  console.log(lateHp);
  // HP가 0보다 작으면 0으로 설정
  if (lateHp < 0) {
    lateHp = 0;
  }

  // late.hp가 0이 되면 setBattle 호출하여 상태 업데이트

  const updatedBattle = {
    ...battle, // 기존 battle 객체를 복사
    [lateStr]: {
      // late에 해당하는 객체 (player 또는 npc)만 업데이트
      ...late, // 기존 late 객체를 복사
      hp: lateHp, // hp를 0으로 설정
    },
  };

  setBattle(updatedBattle); // 상태 업데이트
};
