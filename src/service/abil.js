import { rank } from "../function/rank";
import { damage } from "../function/damage";
import { typeCheck } from "../util/typeCheck";
import { statCalculate } from "../function/statCalculate";
export const applyAbilityEffects = (bt, atks, enqueue) => {
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
    if (def.tempStatus.substitute) {
      // 대타출동 상태면 위협 안통함
      enqueue({
        battle: bt,
        text: text + " " + def.name + "에겐 효과가 없는 것 같다...",
      });
    } else {
      rank(bt, enqueue, defs, "atk", -1, text);
    }
  }

  if (atkAbil === "혼연일체(흑)" || atkAbil === "혼연일체(백)") {
    const text = "[특성 혼연일체]";
    enqueue({
      battle: bt,
      text: "[특성 혼연일체] " + atk.names + " 두 가지 특성을 겸비한다!",
    });
    let team;
    if (atk.team === "player") {
      team = "상대";
    } else {
      team = "우리";
    }
    enqueue({
      battle: bt,
      text: "[특성 혼연일체] " + team + " 편은 긴장해서 나무열매를 먹을 수 없게 되었다!",
    });
  }

  const stats = {
    atk: atk.atk,
    def: atk.def,
    catk: atk.catk,
    cdef: atk.cdef,
    speed: atk.speed,
  };

  const statsKr = {
    atk: "공격이",
    def: "방어가",
    catk: "특수공격이",
    cdef: "특수방어가",
    speed: "스피드가",
  };
  statCalculate(bt);
  const maxKey = Object.keys(stats).reduce((a, b) => (stats[a] > stats[b] ? a : b));
  if (atkAbil === "고대활성") {
    if (bt.field.weather === "쾌청") {
      //날씨 쾌청이면 쾌청 먼저
      atk.tempStatus.protosynthesis = maxKey;
      enqueue({
        battle: bt,
        text: "[특성 고대활성] " + atk.names + " 쾌청에 의해 고대활성을 발동했다!",
      });
      enqueue({
        battle: bt,
        text: "[특성 고대활성] " + atk.name + " 의 " + statsKr[maxKey] + " 강화되었다!",
      });
    } else if (atk.item === "부스트에너지") {
      atk.tempStatus.protosynthesis = maxKey;
      enqueue({
        battle: bt,
        text: "[특성 고대활성] " + atk.names + " 부스트에너지에 의해 고대활성을 발동했다!",
      });
      enqueue({
        battle: bt,
        text: "[특성 고대활성] " + atk.name + "의 " + statsKr[maxKey] + " 강화되었다!",
      });
    }
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

  if (atkAbil === "진홍빛고동") {
    if (bt.field.weather === "쾌청") {
      enqueue({
        battle: bt,
        text: "[특성 진홍빛고동] " + atk.names + " 햇살을 받아 고대의 고동을 폭발시켰다!",
      });
    } else {
      bt.field.weather = "쾌청";
      bt.field.weatherTurnRemain = 5;
      enqueue({
        battle: bt,
        text: "[특성 진홍빛고동] " + atk.names + " 햇살을 강하게 하여 고대의 고동을 폭발시켰다!",
      });
    }
  }

  if (bt.field[atks].sRock && atk.item !== "통굽부츠") {
    //스텔스록
    //맞교체일떄 고려하면 함수 따로 파야하긴 하는데
    const text = atk.name + "에게 뾰족한 바위가 박혔다!";
    const typeDamage = typeCheck("바위", atk.type1, atk.type2);
    damage(bt, Math.floor((atk.origin.hp * typeDamage) / 8), atks, enqueue, text);
  }
};
