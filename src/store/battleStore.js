import { createStore } from "./createStore";
import { createBattle } from "../entity/Battle";
import { defaultOption } from "../config/defaultOption";
import { setSelectedNpcAct } from "../config/testMode";
import { consoleLog } from "../util/consoleLog";
import { rollAugments } from "../calc/augmentRoll";
import { AUGMENT_LIST, AUGMENT_SYNERGY_MAP, getAugmentScreenText, getAugmentLogModalText, getAugmentStatusModalText, getAugmentSelDesc, isBuffAugment, isCurseAugment, isSynergyAugment, isNormalAugment, syncTeamEchoOfHeroBuff, stripEmoji, isReplacementAugment } from "../entity/Augment/AugmentData";
import { generatePokemonInstance } from "../entity/Pokemon/PokemonInstance";
import { switchNpcAuto } from "../service/switch";
import { speedCheck } from "../calc/speedCheck";
import { battleStart } from "../service/battleStart";
import { npcChoice } from "../npc/npc";
import { cloneWithMethods } from "../util/cloneWithMethods";
import { applyAbilityEffects } from "../entity/Ability";
import { getRandomTeam } from "../calc/randomTeam";

const initialBattle = createBattle(["갸라도스", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);

const getInitialDataState = () => ({
  battle: initialBattle,
  battleLive: initialBattle,
  isTradeModalOpen: false,
  isRoundOptionsOpen: false,
  isDebugModalOpen: false,
  augmentModalOpen: false,
  isTitanSelection: false,
  isTitanPendingStart: false,
  augmentChoices: [],
  augmentTargetPoke: null,
  isAugmentStatusOpen: false,
  augmentStatusInitialPoke: null,
  isAugmentCarryModalOpen: false,
  pendingNextTeam: null,
  text: "",
  bottom: "skill",
  selectedNpcChoice: null,
  gameResult: null,
  bench: null,
});

export const useBattleStore = createStore((set, get) => ({
  ...getInitialDataState(),

  setText: (next) => set((s) => ({ text: typeof next === "function" ? next(s.text) : next })),
  setBottom: (next) => set((s) => ({ bottom: typeof next === "function" ? next(s.bottom) : next })),
  setBench: (next) => set((s) => ({ bench: typeof next === "function" ? next(s.bench) : next })),
  setGameResult: (gameResult) => set({ gameResult }),
  setIsRoundOptionsOpen: (isRoundOptionsOpen) => set({ isRoundOptionsOpen }),
  setIsDebugModalOpen: (isDebugModalOpen) => set({ isDebugModalOpen }),
  setIsTradeModalOpen: (isTradeModalOpen) => set({ isTradeModalOpen }),
  setIsAugmentCarryModalOpen: (isAugmentCarryModalOpen) => set({ isAugmentCarryModalOpen }),

  openAugmentStatus: (poke = null) => set({ augmentStatusInitialPoke: poke, isAugmentStatusOpen: true }),
  closeAugmentStatus: () => set({ isAugmentStatusOpen: false }),

  toggleNpcAction: (act) => {
    const next = get().selectedNpcChoice === act ? null : act;
    set({ selectedNpcChoice: next });
    setSelectedNpcAct(next);
  },

  enqueueBattleStart: (bt, queueObject, options = {}) => {
    if (!options.skipStartText) {
      queueObject.enqueue(bt, "배틀 시작!", "bs_battle_start");
    }
    if (!options.skipAbilities) {
      const fastUser = speedCheck(bt);
      const slowUser = fastUser === "player" ? "npc" : "player";
      applyAbilityEffects(bt, fastUser, queueObject.enqueue);
      applyAbilityEffects(bt, slowUser, queueObject.enqueue);
    }
  },

  initBattleRound: ({ locationState, gameOption, queueObject }) => {
    const { team1, team2, difficulty = gameOption.difficulty, round = defaultOption.round, mayhemMode = gameOption.mayhemMode, carriedAugments, carriedAnvilStats } = locationState || {};

    queueObject.initQueue();
    set({
      bottom: "skill",
      bench: null,
      isTradeModalOpen: false,
      isAugmentCarryModalOpen: false,
      pendingNextTeam: null,
      gameResult: null,
      selectedNpcChoice: null,
    });

    const isMayhem = mayhemMode !== undefined ? mayhemMode : gameOption.mayhemMode;
    const nextBattle = createBattle(team1, team2, { difficulty, round, mayhemMode: isMayhem });
    set({ battleLive: nextBattle, battle: nextBattle });

    // 모루 능력치(carriedAnvilStats) 직접 복원
    const teamPokes = [nextBattle.player, nextBattle.playerBench1, nextBattle.playerBench2];
    if (carriedAnvilStats) {
      teamPokes.forEach((p, idx) => {
        const targetIdx = p?.originalIndex ?? idx;
        const saved = carriedAnvilStats[targetIdx] || carriedAnvilStats[String(targetIdx)];
        if (saved && p) {
          p.anvilStats = {
            atk: Number(saved.atk || 0),
            def: Number(saved.def || 0),
            catk: Number(saved.catk || 0),
            cdef: Number(saved.cdef || 0),
            speed: Number(saved.speed || 0),
          };
        }
      });
    }

    if (isMayhem && carriedAugments) {
      // 이전 라운드에서 선택하여 유지한 증강 복원

      // 1. 포켓몬 객체에 스택 필드 선복원 (시너지 조건 만족 시 즉시 기존 누적 스택 반영)
      teamPokes.forEach((p, idx) => {
        const targetIdx = p?.originalIndex ?? idx;
        if (p && Array.isArray(carriedAugments[targetIdx])) {
          carriedAugments[targetIdx].forEach((savedAug) => {
            if (savedAug?.dragonKillCount !== undefined) {
              p.dragonKillCount = Math.max(Number(p.dragonKillCount || 0), Number(savedAug.dragonKillCount || 0));
            }
            if (savedAug?.mejaiStack !== undefined) {
              p.mejaiStack = Math.max(Number(p.mejaiStack || 0), Number(savedAug.mejaiStack || 0));
            }
            if (savedAug?.practiceCritStack !== undefined) {
              p.practiceCritStack = Math.max(Number(p.practiceCritStack || 0), Number(savedAug.practiceCritStack || 0));
            }
            if (savedAug?.giantBonusHp !== undefined) {
              p.giantBonusHp = Math.max(Number(p.giantBonusHp || 0), Number(savedAug.giantBonusHp || 0));
            }
            if (savedAug?.anvilStats) {
              if (!p.anvilStats) {
                p.anvilStats = { atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 };
              }
              Object.keys(savedAug.anvilStats).forEach((k) => {
                p.anvilStats[k] = Math.max(Number(p.anvilStats[k] || 0), Number(savedAug.anvilStats[k] || 0));
              });
            }
          });
        }
      });

      // 2. 버프/저주 복원 후 일반 증강 복원 (일반 증강이 복원되면서 checkAugmentSynergies에 의해 시너지가 스택을 유지하며 활성화됨)
      [true, false].forEach((isBufPass) => {
        teamPokes.forEach((p, idx) => {
          const targetIdx = p?.originalIndex ?? idx;
          if (p && Array.isArray(carriedAugments[targetIdx])) {
            carriedAugments[targetIdx].forEach((savedAug) => {
              if (savedAug?.isStackMeta || savedAug?.id === "__synergy_stacks__") return;
              const augId = typeof savedAug === "string" ? savedAug : savedAug?.id;
              const fullAug = AUGMENT_LIST.find((a) => a.id === augId);
              if (fullAug && isSynergyAugment(fullAug)) {
                if (savedAug?.isForced && isBufPass) {
                  p.applyAugment(fullAug, nextBattle, {
                    replaceSlot: savedAug?.replacedSlot,
                    selectedType: savedAug?.selectedType,
                    targetStat: savedAug?.allOrNothingResult,
                    replacedSkillName: savedAug?.replacedSkillName,
                    swordLevel: savedAug?.swordLevel,
                    swordFailed: savedAug?.swordFailed,
                    swordBonusAtk: savedAug?.swordBonusAtk,
                    swordName: savedAug?.swordName,
                    pickedAbility: savedAug?.pickedAbility,
                    nimbleSkillName: savedAug?.nimbleSkillName,
                    dragonKillCount: savedAug?.dragonKillCount ?? p.dragonKillCount,
                    mejaiStack: savedAug?.mejaiStack ?? p.mejaiStack,
                    practiceCritStack: savedAug?.practiceCritStack ?? p.practiceCritStack,
                    giantBonusHp: savedAug?.giantBonusHp ?? p.giantBonusHp,
                    soulDiceStats: savedAug?.soulDiceStats,
                    isForced: true,
                    isCarryover: true,
                  });
                }
                return;
              }
              const isBufOrCurse = fullAug ? Boolean(isBuffAugment(fullAug) || isCurseAugment(fullAug)) : Boolean(savedAug?.buf || savedAug?.curse);
              if (fullAug && isBufOrCurse === isBufPass) {
                p.applyAugment(fullAug, nextBattle, {
                  replaceSlot: savedAug?.replacedSlot,
                  selectedType: savedAug?.selectedType,
                  targetStat: savedAug?.allOrNothingResult,
                  replacedSkillName: savedAug?.replacedSkillName,
                  swordLevel: savedAug?.swordLevel,
                  swordFailed: savedAug?.swordFailed,
                  swordBonusAtk: savedAug?.swordBonusAtk,
                  swordName: savedAug?.swordName,
                  pickedAbility: savedAug?.pickedAbility,
                  nimbleSkillName: savedAug?.nimbleSkillName,
                  dragonKillCount: savedAug?.dragonKillCount ?? p.dragonKillCount,
                  mejaiStack: savedAug?.mejaiStack ?? p.mejaiStack,
                  practiceCritStack: savedAug?.practiceCritStack ?? p.practiceCritStack,
                  giantBonusHp: savedAug?.giantBonusHp ?? p.giantBonusHp,
                  soulDiceStats: savedAug?.soulDiceStats,
                  isCarryover: true,
                });
              }
            });
          }
        });
      });
    }

    const initialSnapshot = cloneWithMethods(nextBattle);
    set({ battleLive: initialSnapshot, battle: initialSnapshot });

    if (isMayhem) {
      // 무조건 "배틀시작!"이 먼저 나오고 그 다음에 "증강을 선택하세요"가 나옴
      const target = [nextBattle.player, nextBattle.playerBench1, nextBattle.playerBench2].find((p) => p && (p.augments || []).filter((a) => isNormalAugment(a)).length < 3);
      if (target) {
        get().enqueueBattleStart(nextBattle, queueObject, { skipAbilities: true });
        queueObject.enqueue(nextBattle, "증강을 선택하세요.", "bs_start_augment", {
          logText: "증강을 선택하지 않았습니다.",
          isAugment: true,
          isBattleStartAugment: true,
        });
      } else {
        get().enqueueBattleStart(nextBattle, queueObject);
      }
    } else {
      get().enqueueBattleStart(nextBattle, queueObject);
    }
  },

  syncFromQueueHead: (queueObject) => {
    const queue = queueObject.queue;
    if (queue[0]) {
      if (queue[0].onlyLog) {
        // "N번쨰 턴" 로그는 화면에 출력하지 않고 로그 기록에만 남게
        queueObject.dequeue();
        return;
      }

      const clonedLive = cloneWithMethods(queue[0].battle);
      set({ battleLive: clonedLive, battle: queue[0].battle });

      if (queue[0].autoActTurn) {
        queueObject.dequeue();
        if (clonedLive.player.auto || clonedLive.player.charge || clonedLive.player.recharge) {
          battleStart(clonedLive, clonedLive.player.autoSN, npcChoice(clonedLive, clonedLive.player.autoSN), queueObject);
        }
        return;
      }

      set({ text: queue[0].text });
      consoleLog(queue);
      const player = queue[0].battle.player;
      const turnEnd = queue[0].battle.turn.turnEnd;
      if (queue[0].bottomMode) {
        set({ bottom: queue[0].bottomMode });
      }
      if (!queue[0].bottomMode && player.faint && turnEnd) {
        set({ bottom: "mustSwitch" });
      }
      if (!queue[0].bottomMode && queue[0].battle.turn.switchBySkill) {
        set({ bottom: "switchBySkill" });
      }

      if (queue[0].isAugment) {
        const curB = get().battleLive;
        const target = [curB.player, curB.playerBench1, curB.playerBench2].find((p) => p && !p.faint && (p.augments || []).filter((a) => isNormalAugment(a)).length < 3) || [curB.player, curB.playerBench1, curB.playerBench2].find((p) => p && !p.faint) || curB.player;
        if (target) {
          const choices = rollAugments(target, 3, curB);
          if (choices && choices.length > 0) {
            set({
              augmentChoices: choices,
              augmentTargetPoke: target,
              augmentModalOpen: true,
            });
          } else {
            const isStart = Boolean(queue[0]?.isBattleStartAugment);
            queueObject.dequeue();
            if (isStart) {
              const fastUser = speedCheck(curB);
              const slowUser = fastUser === "player" ? "npc" : "player";
              applyAbilityEffects(curB, fastUser, queueObject.enqueue);
              applyAbilityEffects(curB, slowUser, queueObject.enqueue);
            }
          }
        } else {
          const isStart = Boolean(queue[0]?.isBattleStartAugment);
          queueObject.dequeue();
          if (isStart) {
            const fastUser = speedCheck(curB);
            const slowUser = fastUser === "player" ? "npc" : "player";
            applyAbilityEffects(curB, fastUser, queueObject.enqueue);
            applyAbilityEffects(curB, slowUser, queueObject.enqueue);
          }
        }
      }

      const qBattle = queue[0].battle;
      const npcAllFaint = qBattle.npc.faint && qBattle.npcBench1.faint && qBattle.npcBench2.faint;
      const playerAllFaint = qBattle.player.faint && qBattle.playerBench1.faint && qBattle.playerBench2.faint;
      if (npcAllFaint && queue.length === 1) {
        set({ gameResult: "win" });
      }
      if (playerAllFaint && queue.length === 1) {
        set({ gameResult: "lose" });
      }
    } else {
      const curBattle = get().battleLive;
      if (curBattle && (curBattle.player.auto || curBattle.player.charge || curBattle.player.recharge)) {
        battleStart(curBattle, curBattle.player.autoSN, npcChoice(curBattle, curBattle.player.autoSN), queueObject);
      } else if (curBattle) {
        set({ text: curBattle.player.names("는") + " 무엇을 할까?" });
      }
    }
  },

  handleDequeue: (queueObject, isTestModeOpen) => {
    const { augmentModalOpen, isTitanSelection, battle, bottom, battleLive } = get();
    if (augmentModalOpen || isTitanSelection || isTestModeOpen || queueObject.queue[0]?.isAugment) return;

    if (queueObject.queue.length > 0) {
      if (battle.turn.textFreeze || queueObject.queue[0]?.waitInput) {
        return;
      }
      if (queueObject.queue[0]?.autoActTurn) {
        return;
      }
      queueObject.dequeue();
    } else if (bottom === "skill") {
      if (battleLive && !battleLive.player.auto && !battleLive.player.charge && !battleLive.player.recharge) {
        set({ text: battleLive.player.names("는") + " 무엇을 할까?" });
      }
    }
  },

  battleStartBySkillButton: (skillIndex, queueObject) => {
    const { battleLive, battle } = get();
    battleStart(battleLive, skillIndex, npcChoice(battle, skillIndex), queueObject);
    set({ selectedNpcChoice: null });
  },

  textSkip: (queueObject) => {
    const q = [...queueObject.queue];
    let found = null;

    while (q.length > 0) {
      const cur = q.shift();
      const b = cur.battle;

      const condition1 = b.player.faint && b.turn.turnEnd;
      const condition2 = b.turn.switchBySkill;
      const condition3 = b.npc.faint && b.npcBench1.faint && b.npcBench2.faint;
      const condition4 = b.player.faint && b.playerBench1.faint && b.playerBench2.faint;

      const isInputPending = cur.waitInput || cur.isAugment || cur.bottomMode === "mustSwitch" || cur.bottomMode === "switchBySkill" || condition1 || condition2;
      const keepInQueue = isInputPending && !condition3 && !condition4;
      if (!keepInQueue) queueObject.dequeue();

      if (isInputPending || condition3 || condition4 || q.length === 0) {
        found = cur;
        break;
      }
    }

    const last = found;
    if (!last) return;

    const nextLive = cloneWithMethods(last.battle);
    set({ battleLive: nextLive, battle: nextLive });

    if (!last.autoActTurn) {
      set({ text: last.text });
    }
    if (last.bottomMode) {
      set({ bottom: last.bottomMode });
    } else if (last.battle.player.faint && last.battle.turn.turnEnd) {
      set({ bottom: "mustSwitch" });
    } else if (last.battle.turn.switchBySkill) {
      set({ bottom: "switchBySkill" });
    }

    const b = last.battle;
    if (b.npc.faint && b.npcBench1.faint && b.npcBench2.faint) set({ gameResult: "win" });
    if (b.player.faint && b.playerBench1.faint && b.playerBench2.faint) set({ gameResult: "lose" });
  },

  handleSelectAugment: (selectedAugment, options = null, queueObject) => {
    set({ augmentModalOpen: false });
    const { battleLive: curBattle, augmentTargetPoke, isTitanSelection, isTitanPendingStart } = get();
    if (!curBattle) return;

    const head = queueObject.queue[0];
    const isStartAugment = Boolean(head?.isBattleStartAugment);
    const isKnockoutPrompt = Boolean(head?.isKnockoutAugment || (head?.isAugment && !head?.isBattleStartAugment));
    if (isKnockoutPrompt) {
      curBattle.hasKnockoutAugmentThisRound = true;
    }

    const teamPokes = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].filter(Boolean);
    const targetCandidate = options?.targetPokemon || augmentTargetPoke;
    const target = (targetCandidate && teamPokes.find((p) => p && (p.originalIndex === targetCandidate.originalIndex || p.id === targetCandidate.id || p.name === targetCandidate.name))) || curBattle.player;
    const prevPokeName = target.name || "";
    const prevAbilName = target.abil?.name;

    const synergyBuffIds = Object.keys(AUGMENT_SYNERGY_MAP);
    const hadSynergyBefore = {};
    synergyBuffIds.forEach((buffId) => {
      hadSynergyBefore[buffId] = Boolean(target.hasAugment?.(buffId));
    });

    const followUpItems = [];
    const collectEnqueue = (battle, text, id, option = {}) => {
      followUpItems.push(cloneWithMethods({ battle, text, id, ...option }));
    };
    const shouldDeferFaint = selectedAugment?.id === "russianRoulette";
    const augOptions = {
      ...(options || {}),
      enqueue: collectEnqueue,
      ...(shouldDeferFaint ? { deferFaint: true } : {}),
    };

    target.applyAugment(selectedAugment, curBattle, augOptions);
    set({ augmentTargetPoke: target });

    const appliedAug = augOptions?.resolvedGrantedAug || target.augments?.find((a) => a.id === selectedAugment.id) || selectedAugment;

    const headBattle = cloneWithMethods(curBattle);
    const gainText = getAugmentScreenText(appliedAug, target, prevPokeName, augOptions);
    const gainLogText = gainText;

    const rawAfterText = selectedAugment?.afterText ?? AUGMENT_LIST.find((a) => a.id === selectedAugment?.id)?.afterText;
    const resolvedAfterText = typeof rawAfterText === "function" ? rawAfterText(target, curBattle) : rawAfterText;
    if (resolvedAfterText) {
      collectEnqueue(curBattle, resolvedAfterText, `bs_aug_after_${selectedAugment.id}`, {
        logText: resolvedAfterText,
      });
    }

    synergyBuffIds.forEach((buffId) => {
      const buffAug = AUGMENT_LIST.find((a) => a.id === buffId || a.name === buffId);
      const buffName = stripEmoji(buffAug?.shortName || buffAug?.name || buffId);
      if (!hadSynergyBefore[buffId] && target.hasAugment?.(buffId) && selectedAugment.id !== buffId) {
        const synergyText = `3개의 증강이 공명하여 "${buffName}" 시너지가 활성화되었다!`;
        collectEnqueue(curBattle, synergyText, `bs_synergy_gain_${buffId}`, {
          logText: synergyText,
          augmentData: {
            targetName: target.name,
            augment: {
              id: buffAug?.id || buffId,
              name: buffAug?.name || buffName,
              desc: buffAug?.desc || "",
              synergy: true,
            },
          },
        });
        if (buffAug?.synergyEffectText) {
          collectEnqueue(curBattle, buffAug.synergyEffectText, `bs_synergy_eff_${buffId}`, {
            logText: buffAug.synergyEffectText,
          });
        }
      } else if (selectedAugment.id === buffId && buffAug?.synergyEffectText) {
        collectEnqueue(curBattle, buffAug.synergyEffectText, `bs_synergy_sel_${buffId}`, {
          logText: buffAug.synergyEffectText,
        });
      }
    });

    const isTitanFirst = selectedAugment.id === "legendaryTitan";
    const isTitanSecond = isTitanSelection;

    if (isTitanFirst) {
      const titanChoices = [AUGMENT_LIST.find((a) => a.id === "fastStarter"), AUGMENT_LIST.find((a) => a.id === "hugePower"), AUGMENT_LIST.find((a) => a.id === "randomAbility")].filter(Boolean);
      set({
        augmentChoices: titanChoices,
        augmentTargetPoke: target,
        isTitanSelection: true,
      });
      setTimeout(() => {
        set({ augmentModalOpen: true });
      }, 150);
    } else {
      set({ isTitanSelection: false });
    }

    let dropRemaining = false;
    let handledStartAbilities = false;

    if (selectedAugment.id === "russianRoulette" && augOptions.resolvedFaintTarget) {
      const faintTarget = augOptions.resolvedFaintTarget;
      const faintSide = augOptions.resolvedFaintSide;
      if (faintSide === "player" && curBattle.turn) {
        curBattle.turn.turnEnd = null;
      }
      faintTarget.handleFaint?.(curBattle, collectEnqueue);

      const shouldTriggerStart = isStartAugment || (isTitanSecond && isTitanPendingStart);
      if (faintSide === "npc") {
        const hasNpcBench = [curBattle.npcBench1, curBattle.npcBench2].some((p) => p && !p.faint);
        if (hasNpcBench) {
          switchNpcAuto(curBattle, collectEnqueue);
          if (shouldTriggerStart) {
            applyAbilityEffects(curBattle, "player", collectEnqueue);
            handledStartAbilities = true;
            set({ isTitanPendingStart: false });
          }
        } else {
          dropRemaining = true;
          if (shouldTriggerStart) {
            handledStartAbilities = true;
            set({ isTitanPendingStart: false });
          }
        }
      } else if (faintSide === "player") {
        dropRemaining = true;
        const hasPlayerBench = [curBattle.playerBench1, curBattle.playerBench2].some((p) => p && !p.faint);
        if (hasPlayerBench) {
          if (shouldTriggerStart) {
            if (curBattle.npc && !curBattle.npc.faint) {
              applyAbilityEffects(curBattle, "npc", collectEnqueue);
            }
            handledStartAbilities = true;
            set({ isTitanPendingStart: false });
          }
          curBattle.turn.turnEnd = true;
          curBattle.turn.textFreeze = true;
          collectEnqueue(curBattle, "누구로 교체할까?", "bs_roulette_switch", {
            bottomMode: "mustSwitch",
            waitInput: true,
          });
        } else if (shouldTriggerStart) {
          handledStartAbilities = true;
          set({ isTitanPendingStart: false });
        }
      }
    }

    if (isTitanFirst) {
      if (isStartAugment) {
        set({ isTitanPendingStart: true });
      }
    } else if (!handledStartAbilities) {
      const shouldTriggerStart = isStartAugment || (isTitanSecond && isTitanPendingStart);
      if (shouldTriggerStart) {
        const fastUser = speedCheck(curBattle);
        const slowUser = fastUser === "player" ? "npc" : "player";
        applyAbilityEffects(curBattle, fastUser, collectEnqueue);
        applyAbilityEffects(curBattle, slowUser, collectEnqueue);
        set({ isTitanPendingStart: false });
      } else {
        const userSide = target.team === "npc" ? "npc" : "player";
        const activeSidePoke = curBattle[userSide];
        const isActivePoke = activeSidePoke === target || activeSidePoke?.originalIndex === target.originalIndex;
        const enemySide = userSide === "player" ? "npc" : "player";
        const enemyPoke = curBattle[enemySide];
        const isReplacement = isReplacementAugment(selectedAugment);
        if (isActivePoke && (target.abil?.name !== prevAbilName || isReplacement)) {
          curBattle.emit("pokemonChange", {
            target,
            prevAbilName,
            prevPokeName,
            enqueue: collectEnqueue,
            reason: "augment",
          });
        }
        if (isActivePoke && activeSidePoke && !activeSidePoke.faint && enemyPoke && !enemyPoke.faint) {

          if (target.abil?.name !== prevAbilName || isReplacement || isTitanSecond) {
            applyAbilityEffects(curBattle, userSide, collectEnqueue);
          }
        }
      }
    }

    const isReplacement = isReplacementAugment(selectedAugment);
    const logTargetName = isReplacement ? prevPokeName : target.name;

    const isSelectedCurse = Boolean(appliedAug.curse || isCurseAugment(appliedAug));
    const isSelectedSynergy = Boolean(appliedAug.synergy || isSynergyAugment(appliedAug));
    const isSelectedBuf = Boolean((appliedAug.buf || isBuffAugment(appliedAug)) && !isSelectedCurse && !isSelectedSynergy);
    const augmentData = {
      targetName: logTargetName,
      augment: {
        id: appliedAug.id,
        name: appliedAug.name,
        shortName: appliedAug.shortName,
        desc: getAugmentLogModalText(appliedAug, target, prevPokeName, augOptions),
        logModalText: getAugmentLogModalText(appliedAug, target, prevPokeName, augOptions),
        screenText: gainText,
        statusModalText: getAugmentStatusModalText(appliedAug, target, curBattle, augOptions),
        selDesc: getAugmentSelDesc(appliedAug, target, curBattle),
        cost: appliedAug.cost,
        buf: isSelectedBuf,
        curse: isSelectedCurse,
        synergy: isSelectedSynergy,
      },
    };

    if (isTitanSecond) {
      const secondItem = {
        battle: headBattle,
        text: gainText,
        id: "bs_titan_second",
        logText: gainLogText,
        augmentData,
      };
      queueObject.insertAfterHead([secondItem, ...followUpItems]);
    } else if (queueObject.queue[0]?.isAugment) {
      queueObject.updateHead(
        (prev) => ({
          ...prev,
          battle: headBattle,
          text: gainText,
          logText: gainLogText,
          augmentData,
          isAugment: false,
          isKnockoutAugment: false,
        }),
        curBattle,
        followUpItems,
        { dropRemaining }
      );
      set({ text: gainText });
    } else {
      queueObject.enqueue(headBattle, gainText, "bs_aug_gain", {
        logText: gainLogText,
        augmentData,
      });
      followUpItems.forEach(({ battle, text, id, ...option }) => queueObject.enqueue(battle, text, id, option));
    }

    set({ battle: cloneWithMethods(headBattle) });
  },

  handleCloseAugment: (queueObject) => {
    const { isTitanSelection, isTitanPendingStart, battleLive: curBattle } = get();
    set({ augmentModalOpen: false, isTitanSelection: false });
    if (!curBattle) return;

    const headBattle = cloneWithMethods(curBattle);

    const head = queueObject.queue[0];
    if (!isTitanSelection && (head?.isKnockoutAugment || (head?.isAugment && !head?.isBattleStartAugment))) {
      curBattle.hasKnockoutAugmentThisRound = false;
    }
    const shouldTriggerStart = Boolean(head?.isBattleStartAugment) || isTitanPendingStart;
    set({ isTitanPendingStart: false });
    const followUpItems = [];
    const collectEnqueue = (battle, text, id, option = {}) => {
      followUpItems.push(cloneWithMethods({ battle, text, id, ...option }));
    };

    if (shouldTriggerStart) {
      const fastUser = speedCheck(curBattle);
      const slowUser = fastUser === "player" ? "npc" : "player";
      applyAbilityEffects(curBattle, fastUser, collectEnqueue);
      applyAbilityEffects(curBattle, slowUser, collectEnqueue);
    }

    const noAugText = "증강을 선택하지 않았습니다.";

    if (head?.isAugment) {
      queueObject.updateHead(
        (prev) => ({
          ...prev,
          battle: headBattle,
          text: noAugText,
          logText: noAugText,
          isAugment: false,
          isKnockoutAugment: false,
        }),
        curBattle,
        followUpItems
      );
      set({ text: noAugText });
    } else {
      queueObject.enqueue(headBattle, noAugText, "bs_aug_skip", {
        logText: noAugText,
      });
      followUpItems.forEach(({ battle, text, id, ...option }) => queueObject.enqueue(battle, text, id, option));
    }
    set({ battle: cloneWithMethods(headBattle) });
  },

  openCarryoverOrProceed: ({ nextTeam = null, locationState, gameOption, queueObject, navigate }) => {
    set({ pendingNextTeam: nextTeam });
    const { mayhemMode = gameOption.mayhemMode } = locationState || {};
    const isMayhem = mayhemMode !== undefined ? mayhemMode : gameOption.mayhemMode;
    const currentBattle = get().battleLive || get().battle;
    const teamHasSelectableAugments = [currentBattle?.player, currentBattle?.playerBench1, currentBattle?.playerBench2].some((p) => (p?.augments || []).some((a) => isNormalAugment(a)));

    if (isMayhem && teamHasSelectableAugments) {
      set({ isAugmentCarryModalOpen: true });
      return;
    }
    get().proceedNextRound({ customTeam1: nextTeam, carriedMap: null, locationState, gameOption, queueObject, navigate });
  },

  proceedNextRound: ({ customTeam1 = null, carriedMap = null, locationState, gameOption, queueObject, navigate }) => {
    set({
      gameResult: null,
      isTradeModalOpen: false,
      isAugmentCarryModalOpen: false,
      pendingNextTeam: null,
    });
    queueObject.initQueue();

    const { team1, difficulty = gameOption.difficulty, teamOption = gameOption.teamOption, round = defaultOption.round, fromCustom, mayhemMode = gameOption.mayhemMode } = locationState || {};

    const curBattle = get().battleLive;
    const curPlayerTeam = [curBattle?.player, curBattle?.playerBench1, curBattle?.playerBench2].filter(Boolean).sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

    let nextTeam1 = customTeam1
      ? customTeam1
      : teamOption === "랜덤"
        ? getRandomTeam(3)
        : curPlayerTeam.map((p, idx) => {
            const originalCustom = Array.isArray(team1) ? team1[p.originalIndex ?? idx] : null;
            const sName = p.sampleName || p.id;
            if (originalCustom && typeof originalCustom === "object" && (originalCustom.sampleName === sName || originalCustom.id === sName)) {
              return originalCustom;
            }
            return sName;
          });

    const nextTeam2 = getRandomTeam(3);

    const effectiveCarriedMap = carriedMap ? { ...carriedMap } : { 0: [], 1: [], 2: [] };
    curPlayerTeam.forEach((p, idx) => {
      const pIdx = p.originalIndex ?? idx;
      if (!effectiveCarriedMap[pIdx]) effectiveCarriedMap[pIdx] = [];
      (p.augments || []).forEach((aug) => {
        const isBuf = isBuffAugment(aug);
        const isCurse = isCurseAugment(aug);
        const isSyn = isSynergyAugment(aug);
        if ((isBuf || isCurse || isSyn) && !effectiveCarriedMap[pIdx].some((a) => (a.id || a) === aug.id)) {
          effectiveCarriedMap[pIdx].push({
            id: aug.id,
            name: aug.name,
            cost: aug.cost,
            buf: isBuf,
            curse: isCurse,
            synergy: isSyn,
            isForced: Boolean(aug.isForced),
            dragonKillCount: aug.dragonKillCount ?? p.dragonKillCount ?? 0,
            mejaiStack: aug.mejaiStack ?? p.mejaiStack ?? 0,
            practiceCritStack: aug.practiceCritStack ?? p.practiceCritStack ?? 0,
            giantBonusHp: aug.giantBonusHp ?? p.giantBonusHp ?? 0,
          });
        }
      });
      // 비활성화 상태여도 누적 스택이 있다면 보존
      const hasAnvil = p.anvilStats && Object.values(p.anvilStats).some((v) => Number(v) > 0);
      if ((p.dragonKillCount || p.mejaiStack || p.practiceCritStack || p.giantBonusHp) && !effectiveCarriedMap[pIdx].some((a) => a.synergy || isSynergyAugment(a))) {
        effectiveCarriedMap[pIdx].push({
          id: "__synergy_stacks__",
          isStackMeta: true,
          dragonKillCount: p.dragonKillCount || 0,
          mejaiStack: p.mejaiStack || 0,
          practiceCritStack: p.practiceCritStack || 0,
          giantBonusHp: p.giantBonusHp || 0,
          anvilStats: p.anvilStats ? { ...p.anvilStats } : undefined,
        });
      }
      if (hasAnvil && !effectiveCarriedMap[pIdx].some((a) => a.id === "__anvil_stats__" || (a.isStackMeta && a.anvilStats))) {
        effectiveCarriedMap[pIdx].push({
          id: "__anvil_stats__",
          isStackMeta: true,
          anvilStats: { ...p.anvilStats },
        });
      }
    });

    const serializedCarried = Object.entries(effectiveCarriedMap).reduce((acc, [idx, augs]) => {
      acc[idx] = (augs || []).map((aug) => ({
        id: aug.id || aug,
        buf: Boolean(aug.buf),
        curse: Boolean(aug.curse),
        synergy: Boolean(aug.synergy),
        isForced: Boolean(aug.isForced),
        isStackMeta: Boolean(aug.isStackMeta),
        replacedSlot: aug.replacedSlot,
        selectedType: aug.selectedType,
        targetStat: aug.targetStat ?? aug.allOrNothingResult,
        allOrNothingResult: aug.allOrNothingResult,
        replacedSkillName: aug.replacedSkillName,
        swordLevel: aug.swordLevel,
        swordFailed: aug.swordFailed,
        swordBonusAtk: aug.swordBonusAtk,
        swordName: aug.swordName,
        pickedAbility: aug.pickedAbility,
        nimbleSkillName: aug.nimbleSkillName,
        dragonKillCount: aug.dragonKillCount,
        mejaiStack: aug.mejaiStack,
        practiceCritStack: aug.practiceCritStack,
        giantBonusHp: aug.giantBonusHp,
        anvilStats: aug.anvilStats ? { ...aug.anvilStats } : undefined,
        soulDiceStats: aug.soulDiceStats ? { ...aug.soulDiceStats } : undefined,
      }));
      return acc;
    }, {});

    const serializedAnvilStats = {};
    curPlayerTeam.forEach((p, idx) => {
      const pIdx = p.originalIndex ?? idx;
      if (p.anvilStats) {
        serializedAnvilStats[pIdx] = { ...p.anvilStats };
      }
    });

    navigate("/battle", {
      state: {
        team1: nextTeam1,
        team2: nextTeam2,
        isNew: true,
        difficulty,
        teamOption,
        round: round + 1,
        fromCustom,
        mayhemMode,
        carriedAugments: serializedCarried,
        carriedAnvilStats: serializedAnvilStats,
      },
      replace: true,
    });
  },

  submitTrade: ({ tradePlayerIdx, tradeNpcIdx, locationState, gameOption, queueObject, navigate }) => {
    if (tradePlayerIdx === null || tradeNpcIdx === null) return;
    const curBattle = get().battleLive || get().battle;
    const playerTeamFixed = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    const npcTeamFixed = [curBattle.npc, curBattle.npcBench1, curBattle.npcBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

    const playerPoke = playerTeamFixed[tradePlayerIdx];
    if (!playerPoke) return;

    const { team1 } = locationState || {};
    let nextTeam1 = playerTeamFixed.length === 3 ? playerTeamFixed.map((p) => p.sampleName || p.id) : [...team1];
    const npcIds = npcTeamFixed.map((p) => p.sampleName || p.id);
    const tradedId = npcIds[tradeNpcIdx];
    nextTeam1[tradePlayerIdx] = tradedId;

    const newPoke = generatePokemonInstance(tradedId, "player");
    newPoke.originalIndex = playerPoke.originalIndex ?? tradePlayerIdx;
    newPoke.augments = [];

    if (curBattle.player === playerPoke) {
      curBattle.player = newPoke;
    } else if (curBattle.playerBench1 === playerPoke) {
      curBattle.playerBench1 = newPoke;
    } else if (curBattle.playerBench2 === playerPoke) {
      curBattle.playerBench2 = newPoke;
    }
    syncTeamEchoOfHeroBuff(curBattle, newPoke);

    set({
      battle: cloneWithMethods(curBattle),
      isTradeModalOpen: false,
    });
    get().openCarryoverOrProceed({ nextTeam: nextTeam1, locationState, gameOption, queueObject, navigate });
  },

  handleTestSkipNpc: (queueObject) => {
    const curBattle = get().battleLive;
    if (!curBattle) return;

    ["npc", "npcBench1", "npcBench2"].forEach((key) => {
      if (curBattle[key]) {
        curBattle[key].hp = 0;
        curBattle[key].faint = true;
      }
    });

    const updated = cloneWithMethods(curBattle);
    queueObject.resetQueue();
    set({
      battleLive: updated,
      battle: updated,
      gameResult: "win",
    });
  },

  resetStore: () => set(getInitialDataState()),
}));
