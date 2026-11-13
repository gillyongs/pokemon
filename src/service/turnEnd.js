import { hpCalculate } from "../calc/hpCalculate";
import { switchNpcAuto } from "./switch";
import { speedCheck } from "../calc/speedCheck";
import { applyAilment } from "./ailment";

export const turnEnd = (battle, enqueue) => {
  // 턴이 종료될때 실행되는 이벤트 모음
  // 화상딜, 독딜, 날개쉬기 타입복구, NPC 기절시 교체
  // turnEnd를 trigger로 사용하여 모든 이벤트가 끝나야 교체화면이 나오게 함

  const fastUser = speedCheck(battle);
  const slowUser = fastUser === "player" ? "npc" : "player";

  // 트릭룸, 날씨, 필드 카운트
  battle.field.room.handleTrickRoomTurnEnd(battle, enqueue);
  battle.field.weather.handleWeatherTurnEnd(battle, enqueue);
  battle.field.terrain.handleTerrainTurnEnd(battle, enqueue);

  // ====================================================================

  // 희망사항
  battle.field[fastUser].handleWishTurnEnd(battle, enqueue);
  battle.field[slowUser].handleWishTurnEnd(battle, enqueue);
  // 희망사항 -> 먹밥 -> 독뎀 순서, 어지간하면 회복이 먼저

  // 순풍
  battle.field[fastUser].handleTailwindTurnEnd(battle, enqueue);
  battle.field[slowUser].handleTailwindTurnEnd(battle, enqueue);

  // 리플렉터, 빛의장막, 오로라베일
  battle.field[fastUser].handleWallTurnEnd(battle, enqueue);
  battle.field[slowUser].handleWallTurnEnd(battle, enqueue);

  // 아이템 (먹밥)
  battle[fastUser].leftOver(battle, enqueue);
  battle[slowUser].leftOver(battle, enqueue);

  // [증강] 워모그의 갑옷 (매 턴 최대 HP의 3% 회복, 데미지를 입지 않은 경우 2배)
  applyWarmogsArmor(battle, enqueue, fastUser);
  applyWarmogsArmor(battle, enqueue, slowUser);

  // 기술 (씨뿌리기, 마그마스톰, 도발, 하품, 역린)
  processSkillEffects(battle, enqueue, fastUser, slowUser);

  // 상태이상 처리
  processAilment(battle, enqueue, fastUser, slowUser);

  // 날씨 데미지 (모래바람)
  // 모래바람이 종료되는 턴엔 데미지를 입지 않는다.
  battle.field.weather.handleWeatherDamageTurnEnd(battle, enqueue, fastUser);
  battle.field.weather.handleWeatherDamageTurnEnd(battle, enqueue, slowUser);

  // [증강] 태양불꽃방패 (매 턴 내 HP의 10%만큼 상대에게 데미지)
  applySunfireAegis(battle, enqueue, fastUser);
  applySunfireAegis(battle, enqueue, slowUser);

  // [증강] 거인의 흡수 (매 턴 상대에게 최대 HP의 1% 데미지 + 해당 수치만큼 추가 HP 획득, 회복 X)
  applyGiantAbsorption(battle, enqueue, fastUser);
  applyGiantAbsorption(battle, enqueue, slowUser);

  [battle[fastUser], battle[slowUser]].forEach((p) => {
    // 능력치 증감은 어차피 damageCalculate, speedCalculate에서 처리하므로 그냥 text만 enqueue하면 됨
    if (!p || p.hp <= 0 || p.faint) return;
    p.tempStatus.turnsOnField = (p.tempStatus.turnsOnField || 0) + 1;
    if (p.abil === "패스트스타트" && p.tempStatus.turnsOnField === 5) {
      enqueue({
        battle,
        text: `[특성: 패스트스타트] ${p.names} 더 강한 힘을 낼 수 있게 되었다!`,
      });
    }
    if (p.abil === "슬로스타트" && p.tempStatus.turnsOnField === 5) {
      enqueue({
        battle,
        text: `[특성: 슬로스타트] ${p.names} 마침내 제 힘을 낼 수 있게 되었다!`,
      });
    }
    if (p.abil === "기어메이킹") {
      p.gearStack = (p.gearStack || 0) + 1;
      const visualStack = Math.min(p.gearStack, 7);
      p.img_id = `0601-${visualStack}`;
      enqueue({
        battle,
        text: `[특성: 기어메이킹] ${p.name}의 새로운 ${p.gearStack}번째 기어가 맞물렸다!`,
      });
    }
  });

  let tempPlayer = battle.player.turn;
  let tempNpc = battle.npc.turn;

  // 공중날기 처리
  if (tempPlayer.roost) {
    tempPlayer.roost = null;
    battle.player.type1 = battle.player.origin.type1;
    battle.player.type2 = battle.player.origin.type2;
  }
  if (tempNpc.roost) {
    tempNpc.roost = null;
    battle.npc.type1 = battle.npc.origin.type1;
    battle.npc.type2 = battle.npc.origin.type2;
  }

  // 첫 턴 여부 false 처리 (속이기, 만나자마자 성공 체크)
  // 교체/유턴으로 나온 다음턴에 속이기/만나자마자 쓰면 성공하는게 맞으모로 예외처리

  const playerSwitched = battle.turn?.playerSwitched || battle.player?.turn?.choice === "playerBench1" || battle.player?.turn?.choice === "playerBench2" || battle.turn?.switchBySkill;
  const npcSwitched = battle.turn?.npcSwitched || battle.npc?.turn?.choice === "npcBench1" || battle.npc?.turn?.choice === "npcBench2";
  if (!playerSwitched) battle.player.tempStatus.firstTurn = false;
  if (!npcSwitched) battle.npc.tempStatus.firstTurn = false;

  // 특성 가속: 매 턴 종료 시 스피드 1랭크 상승 (해당 턴 교체 등장 제외)
  [fastUser, slowUser].forEach((side) => {
    const p = battle[side];
    const switchedIn = side === "player" ? playerSwitched : npcSwitched;
    // 유턴 등 기술로 교체한 턴엔 가속이 발동하지 않음
    if (!p || p.faint || p.hp <= 0 || switchedIn) return;
    if (p.abil === "가속") {
      const canBoost = p.tempStatus.rank.speed < 6;
      if (canBoost) {
        p.rankUp(battle, enqueue, "speed", 1, "[특성 가속]");
      }
    }
  });

  battle.turn.turnEnd = true;
  if (battle.npc.faint && !battle.player.faint) {
    // NPC"만" 기절한 경우
    // 둘다 기절했을 경우엔 플레이어의 교체 UI를 띄우고
    // 플레이어가 교체할 포켓몬을 선택한 다음에 NPC 교체를 진행하여야 함
    // (아니면 NPC가 교체할 포켓몬을 플레이어가 알게 되므로)
    switchNpcAuto(battle, enqueue);
  }

  // 공격기로 적을 쓰러뜨리고 턴 종료까지 해당 포켓몬이 기절하지 않은 경우, turnEnd 마지막에 "증강을 선택하세요", isAugment:true queue 추가
  // (적 포켓몬을 쓰러뜨리고 얻는 증강은 실제로 증강을 선택했을 때만 해당 라운드 1회 제한이 소모됨)
  const playerTeam = [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean);
  const hasSurvivingKnockoutAttacker = playerTeam.some((p) => Boolean(p.turn?.knockedOutNpcThisTurn) && !p.faint && p.hp > 0);

  if (battle.isMayhem && !battle.hasKnockoutAugmentThisRound && hasSurvivingKnockoutAttacker) {
    const hasSlot = playerTeam.some((p) => (p.augments || []).filter((a) => !a.buf).length < 3);
    if (hasSlot) {
      enqueue({
        id: "122fb584-429d-4b41-9558-755143829687",
        battle: battle,
        text: "증강을 선택하세요.",
        logText: "증강을 선택하지 않았습니다.",
        isAugment: true,
        isKnockoutAugment: true,
      });
    }
  }

  if (battle.player.faint) {
    battle.turn.textFreeze = true;
    enqueue({
      id: "bf1b2882-a834-49f8-8ef4-aebc64735142",
      battle: battle,
      text: "누구로 교체 할까?",
      bottomMode: "mustSwitch",
      waitInput: true,
    });
  } else if (battle.player.auto || battle.player.charge || battle.player.recharge) {
    enqueue({
      id: "2ef883d0-9649-4aee-92ae-9e16e5010e62",
      battle: battle,
      text: "",
      autoActTurn: true,
      bottomMode: "auto",
      waitInput: false,
      allowAct: true,
    });
  } else {
    enqueue({
      id: "a5b4b821-d398-45a0-8169-dfad0859a11b",
      battle: battle,
      text: battle.player.origin.names + " 무엇을 할까?",
      bottomMode: "skill",
      waitInput: true,
      allowAct: true,
    });
    //이거 없으면 텍스트 없는게 (enqueue 안한게) 반영이 안됨
  }

  // 주의: turnEnd 내부 로직(roost, choice, switchedIn, knockedOutNpcThisTurn, turnEnd/textFreeze 등)과
  // 마지막 enqueue의 battle 스냅샷 복사가 모두 끝난 뒤 에러가 나지 않도록 반드시 turnEnd 최대한 마지막에 호출할 것
  battle.resetBattleTurn();
};

function applySunfireAegis(battle, enqueue, user) {
  const p = battle[user];
  if (!p || p.faint) return;
  if (!p.hasAugment?.("sunfireAegis")) return;

  const opponentSide = user === "player" ? "npc" : "player";
  const opponent = battle[opponentSide];
  if (!opponent || opponent.faint) return;

  const damage = Math.max(1, Math.floor(hpCalculate(p) * 0.1));
  const text = `[증강: 태양불꽃방패] ${opponent.names} 불사르기 데미지를 입었다!`;
  opponent.getDamage(battle, enqueue, damage, text);
}

function applyGiantAbsorption(battle, enqueue, user) {
  const p = battle[user];
  if (!p || p.faint || p.hp <= 0) return;
  if (!p.hasAugment?.("giantAbsorption")) return;

  const opponentSide = user === "player" ? "npc" : "player";
  const opponent = battle[opponentSide];
  if (!opponent || opponent.faint || opponent.hp <= 0) return;

  const damage = Math.max(1, Math.floor(hpCalculate(p) * 0.01));
  const gain = Math.min(opponent.hp, damage);

  // 체력 최대치(giantBonusHp)만 늘리고 현재 HP는 회복하지 않음 (텍스트 enqueue 스냅샷에 즉시 반영되도록 데미지 전 처리)
  if (gain > 0) {
    const giantAug = p.augments?.find((a) => a.id === "giantAbsorption");
    const nextBonus = Number(p.giantBonusHp ?? giantAug?.giantBonusHp ?? 0) + gain;
    p.giantBonusHp = nextBonus;
    p._appliedGiantBonusHp = nextBonus;
    if (giantAug) {
      giantAug.giantBonusHp = nextBonus;
    }
  }

  const text = `[증강 거인의흡수] ${p.names} ${opponent.name}의 체력을 흡수했다!`;
  opponent.getDamage(battle, enqueue, damage, text);
}

function applyWarmogsArmor(battle, enqueue, user) {
  const p = battle[user];
  const maxHp = hpCalculate(p);
  if (!p || p.faint || p.hp <= 0 || p.hp >= maxHp) return;
  if (!p.hasAugment?.("warmogsArmor")) return;

  const undamaged = !p.turn?.damagedThisTurn;
  const ratio = undamaged ? 0.06 : 0.03;
  const heal = Math.max(1, Math.floor(maxHp * ratio));
  const text = undamaged ? `[증강: 워모그의 갑옷] ${p.names} 체력을 크게 회복했다!` : `[증강: 워모그의 갑옷] ${p.names} 체력을 조금 회복했다!`;
  p.recover(battle, heal, enqueue, text);
}

function processSkillEffects(battle, enqueue, fastUser, slowUser) {
  // 씨뿌리기
  seed(battle, enqueue, fastUser, slowUser);
  seed(battle, enqueue, slowUser, fastUser);

  // 묶기
  switchLock(battle, enqueue, fastUser);
  switchLock(battle, enqueue, slowUser);

  // 도발
  taunt(battle, enqueue, fastUser);
  taunt(battle, enqueue, slowUser);

  // 하품
  hapum(battle, enqueue, fastUser);
  hapum(battle, enqueue, slowUser);

  // 역린 등 자동행동
  autoEnd(battle, enqueue, fastUser);
  autoEnd(battle, enqueue, slowUser);

  // 지옥찌르기 소리 기술 금지
  noSound(battle, enqueue, fastUser);
  noSound(battle, enqueue, slowUser);

  // 저주받은바디 기술 봉인
  disable(battle, enqueue, fastUser);
  disable(battle, enqueue, slowUser);
}

function seed(battle, enqueue, getter, user) {
  const skillUser = battle[user]; // 씨뿌리기 쓴 놈
  const skillGetter = battle[getter]; // 씨뿌리기 맞은놈
  if (skillGetter.faint) return;

  // 씨뿌리기
  if (skillGetter.tempStatus.seed) {
    const dmg = skillGetter.getDamage(battle, enqueue, Math.floor(hpCalculate(skillGetter) / 8));
    skillUser.recover(battle, Math.floor(dmg), enqueue, `씨뿌리기가 ${skillGetter.name}의 체력을 빼앗는다!`);
  }
}

function switchLock(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 마그마스톰 맞은놈
  if (skillGetter.faint) return;

  // 묶기 (ex: 마그마스톰)
  if (skillGetter.tempStatus.switchLock) {
    const skillName = skillGetter.tempStatus.switchLock;
    skillGetter.tempStatus.switchLockTurnRemain--;
    if (skillGetter.tempStatus.switchLockTurnRemain === 0) {
      skillGetter.tempStatus.switchLock = null;
      skillGetter.tempStatus.switchLockTurnRemain = null;
      enqueue({ id: "8c6a1aa2-f25d-45bf-bbe3-f5aea20fdb22", battle, text: `${skillGetter.names} ${skillName}에게서 벗어났다!` });
    } else {
      skillGetter.getDamage(battle, enqueue, Math.floor(hpCalculate(skillGetter) / 8), `${skillGetter.names} ${skillName}의 데미지를 입고 있다.`);
    }
  }
}

function taunt(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 도발 맞은놈
  if (skillGetter.faint) return;
  // 도발 해제는 턴이 종료될때 실행된다 (연속 도발을 막기 위해서일듯 함)

  if (skillGetter.tempStatus.taunt > 0) {
    skillGetter.tempStatus.taunt--;
  }

  if (skillGetter.tempStatus.taunt === 0) {
    let wakeUpText = skillGetter.names + " 도발의 효과가 풀렸다!";
    skillGetter.tempStatus.taunt = null;
    enqueue({ id: "e40f7ddc-71fe-4cd9-b3ac-36031dbbdf26", battle: battle, text: wakeUpText });
  }
}

function noSound(battle, enqueue, getter) {
  const skillGetter = battle[getter]; // 도발 맞은놈
  if (skillGetter.faint) return;
  // 도발 해제는 턴이 종료될때 실행된다 (연속 도발을 막기 위해서일듯 함)

  if (skillGetter.tempStatus.noSound > 0) {
    skillGetter.tempStatus.noSound--;
  }

  if (skillGetter.tempStatus.noSound === 0) {
    let wakeUpText = skillGetter.names + " 다시 소리 기술을 사용할 수 있게 됐다!";
    skillGetter.tempStatus.noSound = null;
    enqueue({ id: "10facab5-d501-4e07-a21d-ab5d777c55db", battle: battle, text: wakeUpText });
  }
}

function disable(battle, enqueue, getter) {
  const skillGetter = battle[getter];
  if (skillGetter.faint) return;

  if (skillGetter.tempStatus.disableTurnRemain > 0) {
    skillGetter.tempStatus.disableTurnRemain--;
  }

  if (skillGetter.tempStatus.disableTurnRemain === 0) {
    const disabledSkill = skillGetter.tempStatus.disable;
    skillGetter.tempStatus.disable = null;
    skillGetter.tempStatus.disableTurnRemain = null;
    let wakeUpText = `${skillGetter.name}의 ${disabledSkill} 봉인이 풀렸다!`;
    enqueue({ id: "3f8a9c1b-7d2e-4f5a-8b3c-9e1d2f3a4b5c", battle: battle, text: wakeUpText });
  }
}

function hapum(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.tempStatus.hapum === 0) {
    p.tempStatus.hapum = null;
    applyAilment("잠듦", battle, p.team, enqueue, false);
  }
  if (p.tempStatus.hapum === 1) {
    p.tempStatus.hapum = 0;
  }
}

function autoEnd(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  let autoConfuseText = p.names + " 몹시 지쳐서 혼란에 빠졌다!";
  if (p.auto > 0) {
    p.auto--;
  }

  if (p.auto === 0) {
    p.auto = null;
    p.autoSN = null;
    applyAilment("혼란", battle, user, enqueue, null, autoConfuseText);
  }
}

function processAilment(battle, enqueue, fastUser, slowUser) {
  applyStatusDamage(battle, enqueue, fastUser);
  applyStatusDamage(battle, enqueue, slowUser);

  // 화염구슬로 화상을 입은 턴엔 화상 데미지가 들어가지 않음
  flameOrb(battle, enqueue, fastUser);
  flameOrb(battle, enqueue, slowUser);
}

function applyStatusDamage(battle, enqueue, user) {
  const p = battle[user];

  if (p.faint) return;
  const maxHp = hpCalculate(p);

  if (p.ailment.poison) {
    p.getDamage(battle, enqueue, Math.floor(maxHp / 8), `${p.names} 독에 의한 데미지를 입었다!`);
  }
  if (p.ailment.mpoison) {
    p.getDamage(battle, enqueue, Math.floor((maxHp * p.ailment.mpoison) / 16), `${p.names} 맹독에 의한 데미지를 입었다!`);
    p.ailment.mpoison++;
  }
  if (p.ailment.burn) {
    const opponentSide = user === "player" ? "npc" : "player";
    const opponent = battle[opponentSide];

    // [증강] 할머니의 고추기름
    const hasChiliOil = Boolean(opponent?.hasAugment?.("grandmasChiliOil"));

    const baseBurn = Math.max(1, Math.floor(maxHp / 16));
    const burnDamage = hasChiliOil ? baseBurn * 5 : baseBurn;
    const text = hasChiliOil ? `[증강: 할머니의 고추기름] ${p.names} 극심한 화상 데미지를 입었다!` : `${p.names} 화상 데미지를 입었다!`;

    p.getDamage(battle, enqueue, burnDamage, text);
  }
}

function flameOrb(battle, enqueue, user) {
  const p = battle[user];
  if (p.faint) return;

  if (p.item === "화염구슬") {
    applyAilment("화상", battle, p.team, enqueue, false, `${p.names} 화염구슬로 화상을 입었다!`);
  }
}
