import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import "./Main.css";
import { useRecoilValue } from "recoil";
import { createBattle } from "../entity/Battle";
import { defaultOption } from "../config/defaultOption";
import { gameOptionState } from "../util/recoilState";
import { testmode, setSelectedNpcAct, subscribeTestMode } from "../config/testMode";
import AugmentModal from "../component/battleScreen/augment/AugmentModal";
import AugmentStatusModal from "../component/battleScreen/augment/AugmentStatusModal";
import AugmentCarryoverModal from "../component/battleScreen/augment/AugmentCarryoverModal";
import RoundOptionsModal from "../component/battleScreen/RoundOptionsModal";
import GameResultModal from "../component/battleScreen/GameResultModal";
import TestingTools from "../component/battleScreen/TestingTools";
import AfterBattleTradeModal from "../component/battleScreen/AfterBattleTradeModal";
import { consoleLog } from "../util/consoleLog";
import { rollAugments } from "../util/augmentRoll";
import { AUGMENT_LIST, getAugmentText } from "../entity/Augment/AugmentData";
import { generate } from "../entity/Pokemon/PokemonInstance";
import { useQueue } from "../util/useQueue";

import PokemonInfo from "../component/battleScreen/top/PokemonInfo";
import PokemonImage from "../component/battleScreen/top/PokemonImage";
import ItemImage from "../component/battleScreen/top/ItemImage";
import BottomSectionSkill from "../component/battleScreen/bottom/skill/Bottom-Skill";
import BottomSectionSwitch from "../component/battleScreen/bottom/switch/Bottom-Switch";
import BottomSectionInfo from "../component/battleScreen/bottom/info/Bottom-Info";
import { speedCheck } from "../util/speedCheck";
import { useLocation, useNavigate } from "react-router-dom";
import { battleStart } from "../service/battleStart";
import { npcChoice, makeNpcChoice } from "../npc/npc";
import { cloneWithMethods } from "../util/cloneWithMethods";
import { applyAbilityEffects } from "../entity/Ability";
import { getRandomTeam, isLegendary } from "../util/randomTeam";

const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameOption = useRecoilValue(gameOptionState);
  const battleOrigin = createBattle(["갸라도스", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
  const battleObj = useRef(battleOrigin);
  const [battle, setBattle] = useState(battleOrigin);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isRoundOptionsOpen, setIsRoundOptionsOpen] = useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [augmentModalOpen, setAugmentModalOpen] = useState(false);
  const [isTitanSelection, setIsTitanSelection] = useState(false);
  const [isTitanPendingStart, setIsTitanPendingStart] = useState(false);
  const [augmentChoices, setAugmentChoices] = useState([]);
  const [augmentTargetPoke, setAugmentTargetPoke] = useState(null);
  const [isInitialBattleStart, setIsInitialBattleStart] = useState(false);
  const [isAugmentStatusOpen, setIsAugmentStatusOpen] = useState(false);
  const [augmentStatusInitialPoke, setAugmentStatusInitialPoke] = useState(null);
  const [isAugmentCarryModalOpen, setIsAugmentCarryModalOpen] = useState(false);
  const [carriedAugmentsData, setCarriedAugmentsData] = useState(null);
  const [pendingNextTeam, setPendingNextTeam] = useState(null);
  //개발용 배틀 객체.
  const [text, setText] = useState("");
  //화면에 보여질 텍스트 전역변수
  const { queueObject } = useQueue();
  //게임 진행용 큐 전역변수
  const [bottom, setBottom] = useState("skill");

  const [selectedNpcChoice, setSelectedNpcChoice] = useState(null);

  const handleNpcActionClick = (act) => {
    const next = selectedNpcChoice === act ? null : act;
    setSelectedNpcChoice(next);
    setSelectedNpcAct(next);
  };

  const [gameResult, setGameResult] = useState(null); // "win" | "lose" | null
  const [isTestMode, setIsTestMode] = useState(() => Boolean(testmode));

  useEffect(() => {
    return subscribeTestMode(({ testmode: tm }) => {
      setIsTestMode(Boolean(tm));
    });
  }, []);

  const handleRestart = () => {
    setGameResult(null);
    setIsTradeModalOpen(false);
    queueObject.initQueue();
    const { team1, team2, isNew, difficulty = gameOption.difficulty, teamOption = gameOption.teamOption, round, fromCustom } = location.state || {};
    navigate("/battle", { state: { team1, team2, isNew: true, difficulty, teamOption, round, fromCustom }, replace: true });
  };

  const handleNextRound = () => {
    const { teamOption = gameOption.teamOption } = location.state || {};
    // 1. 트레이드 모드인 경우 트레이드 모달을 먼저 띄운다.
    if (teamOption === "트레이드") {
      setIsTradeModalOpen(true);
      return;
    }
    // 2. 트레이드 모드가 아닌 경우 다음 라운드 증강 유지 확인 또는 진행
    openCarryoverOrProceed(null);
  };

  const openCarryoverOrProceed = (nextTeam) => {
    setPendingNextTeam(nextTeam);
    const { mayhemMode = gameOption.mayhemMode } = location.state || {};
    const isMayhem = mayhemMode !== undefined ? mayhemMode : gameOption.mayhemMode;
    const currentBattle = battleObj.current || battle;
    const teamHasAugments = [currentBattle?.player, currentBattle?.playerBench1, currentBattle?.playerBench2].some((p) => (p?.augments || []).length > 0);

    if (isMayhem && teamHasAugments) {
      setIsAugmentCarryModalOpen(true);
      return;
    }
    proceedNextRound(nextTeam, null);
  };

  const handleCarryoverConfirm = (carriedMap) => {
    setIsAugmentCarryModalOpen(false);
    proceedNextRound(pendingNextTeam, carriedMap);
  };

  const handleSkipTrade = () => {
    setIsTradeModalOpen(false);
    openCarryoverOrProceed(null);
  };

  const proceedNextRound = (customTeam1 = null, carriedMap = null) => {
    setGameResult(null);
    setIsTradeModalOpen(false);
    setIsAugmentCarryModalOpen(false);
    setCarriedAugmentsData(null);
    setPendingNextTeam(null);
    queueObject.initQueue();
    const { team1, difficulty = gameOption.difficulty, teamOption = gameOption.teamOption, round = defaultOption.round, fromCustom, mayhemMode = gameOption.mayhemMode } = location.state || {};

    const curPlayerTeam = [battleObj.current?.player, battleObj.current?.playerBench1, battleObj.current?.playerBench2].filter(Boolean).sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

    let nextTeam1 = customTeam1
      ? customTeam1
      : teamOption === "랜덤"
      ? getRandomTeam(3)
      : curPlayerTeam.map((p, idx) => {
          const originalCustom = Array.isArray(team1) ? team1[p.originalIndex ?? idx] : null;
          if (originalCustom && typeof originalCustom === "object" && originalCustom.id === p.id) {
            return originalCustom;
          }
          return p.id;
        });

    const nextTeam2 = getRandomTeam(3);

    // 함수(onApply, getDesc 등)가 포함된 증강 객체는 history.replaceState에서 DataCloneError를 유발하므로
    // 직렬화 가능한 plain 객체({ id, replacedSlot })로 변환하여 전달
    const serializedCarried = carriedMap
      ? Object.entries(carriedMap).reduce((acc, [idx, augs]) => {
          acc[idx] = (augs || []).map((aug) => ({
            id: aug.id || aug,
            replacedSlot: aug.replacedSlot,
            selectedType: aug.selectedType,
            revolutionResult: aug.revolutionResult,
            replacedSkillName: aug.replacedSkillName,
            swordLevel: aug.swordLevel,
            swordFailed: aug.swordFailed,
            swordBonusAtk: aug.swordBonusAtk,
            swordName: aug.swordName,
            pickedAbility: aug.pickedAbility,
          }));
          return acc;
        }, {})
      : null;

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
      },
      replace: true,
    });
  };

  const submitTrade = (tradePlayerIdx, tradeNpcIdx) => {
    if (tradePlayerIdx === null || tradeNpcIdx === null) return;
    const curBattle = battleObj.current || battle;
    const playerTeamFixed = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    const npcTeamFixed = [curBattle.npc, curBattle.npcBench1, curBattle.npcBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

    const playerPoke = playerTeamFixed[tradePlayerIdx];
    if (!playerPoke) return;

    const { team1 } = location.state || {};
    let nextTeam1 = playerTeamFixed.length === 3 ? playerTeamFixed.map((p) => p.id) : [...team1];
    const npcIds = npcTeamFixed.map((p) => p.id);
    const tradedId = npcIds[tradeNpcIdx];
    nextTeam1[tradePlayerIdx] = tradedId;

    // 방금 트레이드한 포켓몬은 증강이 없음(augments: [])
    const newPoke = generate(tradedId);
    newPoke.team = "player";
    newPoke.originalIndex = playerPoke.originalIndex ?? tradePlayerIdx;
    newPoke.augments = [];

    // 배틀 객체에 트레이드 결과 반영
    if (curBattle.player === playerPoke) {
      curBattle.player = newPoke;
    } else if (curBattle.playerBench1 === playerPoke) {
      curBattle.playerBench1 = newPoke;
    } else if (curBattle.playerBench2 === playerPoke) {
      curBattle.playerBench2 = newPoke;
    }

    setBattle(cloneWithMethods(curBattle));
    setIsTradeModalOpen(false);
    // 트레이드 완료 후 증강 유지 모달 또는 다음 라운드 진행
    openCarryoverOrProceed(nextTeam1);
  };

  useEffect(() => {
    return () => {
      queueObject.initQueue(); // unmount 시 큐 비우기
    };
  }, []);

  // 밑 화면 상태. 스킬, 교체, 정보
  const [bench, setBench] = useState(null);

  //   샤로다               대타출동:4
  //   어써러셔             방어:2
  //   랜드로스             유턴:4
  //   날개치는머리          도발:4

  const enqueueBattleStart = (bt, options = {}) => {
    if (!options.skipStartText) {
      queueObject.enqueue({ id: "75857006-b1b6-489c-b77b-bb3bfdcf8d78", battle: bt, text: "배틀시작!" });
    }
    if (!options.skipAbilities) {
      const fastUser = speedCheck(bt);
      const slowUser = fastUser === "player" ? "npc" : "player";
      applyAbilityEffects(bt, fastUser, queueObject.enqueue);
      applyAbilityEffects(bt, slowUser, queueObject.enqueue);
    }
  };

  const handleTestSkipNpc = (e) => {
    e.stopPropagation();
    const curBattle = battleObj.current;
    if (!curBattle) return;

    ["npc", "npcBench1", "npcBench2"].forEach((key) => {
      if (curBattle[key]) {
        curBattle[key].hp = 0;
        curBattle[key].faint = true;
        if (curBattle[key].origin) {
          curBattle[key].origin.hp = 0;
          curBattle[key].origin.faint = true;
        }
      }
    });

    const updated = cloneWithMethods(curBattle);
    battleObj.current = updated;
    setBattle(updated);

    queueObject.resetQueue();
    setGameResult("win");
  };

  const handleSelectAugment = (selectedAugment, options = null) => {
    setAugmentModalOpen(false);
    const curBattle = battleObj.current;
    if (!curBattle) return;

    const teamPokes = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].filter(Boolean);
    const targetCandidate = options?.targetPokemon || augmentTargetPoke;
    const target = (targetCandidate && teamPokes.find((p) => p && (p.originalIndex === targetCandidate.originalIndex || p.id === targetCandidate.id || p.name === targetCandidate.name))) || curBattle.player;
    const prevPokeName = target.name || target.origin?.name || "";

    target.applyAugment(selectedAugment, curBattle, options);
    setAugmentTargetPoke(target);

    const gainText = getAugmentText(selectedAugment, target, true, prevPokeName, options);
    const gainLogText = gainText;
    const followUpItems = [];

    const isTitanFirst = selectedAugment.id === "legendaryTitan";
    const isTitanSecond = isTitanSelection;

    if (isTitanFirst) {
      const titanChoices = [
        AUGMENT_LIST.find((a) => a.id === "fastStarter"),
        AUGMENT_LIST.find((a) => a.id === "hugePower"),
        AUGMENT_LIST.find((a) => a.id === "randomAbility"),
      ].filter(Boolean);
      setAugmentChoices(titanChoices);
      setAugmentTargetPoke(target);
      setIsTitanSelection(true);
      setTimeout(() => {
        setAugmentModalOpen(true);
      }, 150);
    } else {
      setIsTitanSelection(false);
    }

    const head = queueObject.queue[0];
    const isStartAugment = Boolean(head?.isBattleStartAugment);

    if (isTitanFirst) {
      // 전설의 거인 첫 선택 시: 특성 선택 증강까지 모두 완료된 뒤에 배틀 시작 특성이 발동되도록 보류
      if (isStartAugment) {
        setIsTitanPendingStart(true);
      }
    } else {
      // 특성 선택(2차) 또는 일반 증강 선택 시: 모든 증강 로직이 끝났으므로 배틀 시작 특성 발동
      const shouldTriggerStart = isStartAugment || (isTitanSecond && isTitanPendingStart);
      if (shouldTriggerStart) {
        const fastUser = speedCheck(curBattle);
        const slowUser = fastUser === "player" ? "npc" : "player";
        applyAbilityEffects(curBattle, fastUser, (item) => followUpItems.push(item));
        applyAbilityEffects(curBattle, slowUser, (item) => followUpItems.push(item));
        setIsTitanPendingStart(false);
      }
    }

    const appliedAug = target.augments?.find((a) => a.id === selectedAugment.id) || selectedAugment;
    const isReplacement = selectedAugment.id === "legendaryTitan" || selectedAugment.id === "rouletteWheel" || selectedAugment.id === "soaring";
    const logTargetName = isReplacement ? prevPokeName : (target.name || target.names);

    const augmentData = {
      targetName: logTargetName,
      augment: {
        id: appliedAug.id,
        name: appliedAug.name,
        shortName: appliedAug.shortName,
        desc: getAugmentText(selectedAugment, target, false, prevPokeName, options),
        cost: appliedAug.cost,
      },
    };

    if (isTitanSecond) {
      // 전설의 거인 후속 특성 증강: 헤드(전설의 거인) 바로 뒤에 삽입되고, 그 뒤에 배틀 시작 특성(모래날림 등)이 순차적으로 배치됨
      const secondItem = {
        id: "titan-second-" + (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11)),
        battle: curBattle,
        text: gainText,
        logText: gainLogText,
        augmentData,
      };
      queueObject.insertAfterHead([secondItem, ...followUpItems]);
    } else if (queueObject.queue[0]?.isAugment) {
      queueObject.updateHead(
        (prev) => ({
          ...prev,
          battle: curBattle,
          text: gainText,
          logText: gainLogText,
          augmentData,
          isAugment: false,
        }),
        curBattle,
        followUpItems
      );
      setText(gainText);
    } else {
      queueObject.enqueue({
        id: "d7391e86-25e9-459f-abc7-588560b20d83",
        battle: curBattle,
        text: gainText,
        logText: gainLogText,
        augmentData,
      });
      followUpItems.forEach((item) => queueObject.enqueue(item));
    }
    setBattle(cloneWithMethods(curBattle));
  };

  const handleCloseAugment = () => {
    setAugmentModalOpen(false);
    setIsTitanSelection(false);
    const curBattle = battleObj.current;
    if (!curBattle) return;

    const head = queueObject.queue[0];
    const shouldTriggerStart = Boolean(head?.isBattleStartAugment) || isTitanPendingStart;
    setIsTitanPendingStart(false);
    const followUpItems = [];

    if (shouldTriggerStart) {
      const fastUser = speedCheck(curBattle);
      const slowUser = fastUser === "player" ? "npc" : "player";
      applyAbilityEffects(curBattle, fastUser, (item) => followUpItems.push(item));
      applyAbilityEffects(curBattle, slowUser, (item) => followUpItems.push(item));
    }

    const noAugText = "증강을 선택하지 않았습니다.";

    if (head?.isAugment) {
      queueObject.updateHead(
        (prev) => ({
          ...prev,
          battle: curBattle,
          text: noAugText,
          logText: noAugText,
          isAugment: false,
        }),
        curBattle,
        followUpItems
      );
      setText(noAugText);
    } else {
      queueObject.enqueue({
        id: "no-augment-selected-msg",
        battle: curBattle,
        text: noAugText,
        logText: noAugText,
      });
      followUpItems.forEach((item) => queueObject.enqueue(item));
    }
    setBattle(cloneWithMethods(curBattle));
  };

  useEffect(() => {
    let { team1, team2, difficulty = gameOption.difficulty, round = defaultOption.round, mayhemMode = gameOption.mayhemMode, carriedAugments } = location.state || {}; // 랜덤 battleObject 가져오기

    queueObject.initQueue();
    setBottom("skill");
    setBench(null);
    setIsTradeModalOpen(false);
    setIsAugmentCarryModalOpen(false);
    setCarriedAugmentsData(null);

    const isMayhem = mayhemMode !== undefined ? mayhemMode : gameOption.mayhemMode;
    battleObj.current = createBattle(team1, team2, { difficulty, round, mayhemMode: isMayhem });
    if (isMayhem && carriedAugments) {
      // 이전 라운드에서 선택하여 유지한 증강 복원 (AUGMENT_LIST에서 완전한 객체 매핑)
      const teamPokes = [battleObj.current.player, battleObj.current.playerBench1, battleObj.current.playerBench2];
      teamPokes.forEach((p, idx) => {
        const targetIdx = p?.originalIndex ?? idx;
        if (p && Array.isArray(carriedAugments[targetIdx])) {
          carriedAugments[targetIdx].forEach((savedAug) => {
            const augId = typeof savedAug === "string" ? savedAug : savedAug?.id;
            const fullAug = AUGMENT_LIST.find((a) => a.id === augId);
            if (fullAug) {
              p.applyAugment(fullAug, battleObj.current, {
                replaceSlot: savedAug?.replacedSlot,
                selectedType: savedAug?.selectedType,
                targetStat: savedAug?.revolutionResult,
                replacedSkillName: savedAug?.replacedSkillName,
                swordLevel: savedAug?.swordLevel,
                swordFailed: savedAug?.swordFailed,
                swordBonusAtk: savedAug?.swordBonusAtk,
                swordName: savedAug?.swordName,
                pickedAbility: savedAug?.pickedAbility,
              });
            }
          });
        }
      });
    }

    if (isMayhem) {
      // 무조건 "배틀시작!"이 먼저 나오고 그 다음에 "증강을 선택하세요"가 나옴
      const target = [battleObj.current.player, battleObj.current.playerBench1, battleObj.current.playerBench2].find((p) => p && (p.augments || []).length < 3);
      if (target) {
        enqueueBattleStart(battleObj.current, { skipAbilities: true });
        queueObject.enqueue({
          id: "82c455ab-c426-4986-80c4-f030b3742f94",
          battle: battleObj.current,
          text: "증강을 선택하세요.",
          logText: "증강을 선택하지 않았습니다.",
          isAugment: true,
          isBattleStartAugment: true,
        });
      } else {
        enqueueBattleStart(battleObj.current);
      }
    } else {
      enqueueBattleStart(battleObj.current);
    }
  }, [location.state]); // location.state가 변경될 때 실행

  useEffect(() => {
    const queue = queueObject.queue;
    if (queue[0]) {
      if (queue[0].onlyLog) {
        // "N번쨰 턴" 로그는 화면에 출력하지 않고 로그 기록에만 남게
        queueObject.dequeue();
        return;
      }
      battleObj.current = cloneWithMethods(queue[0].battle);
      setBattle(queue[0].battle);
      if (queue[0].autoActTurn) {
        const nextBattle = battleObj.current;
        queueObject.dequeue();
        if (nextBattle.player.auto || nextBattle.player.charge || nextBattle.player.recharge) {
          battleStart(nextBattle, nextBattle.player.autoSN, npcChoice(nextBattle, nextBattle.player.autoSN), queueObject);
        }
        return;
      }
      setText(queue[0].text);
      consoleLog(queue);
      const player = queue[0].battle.player;
      const turnEnd = queue[0].battle.turn.turnEnd;
      let gameEnd = false;
      if (queue[0].bottomMode) {
        setBottom(queue[0].bottomMode);
      }
      if (!queue[0].bottomMode && player.faint && turnEnd) {
        setBottom("mustSwitch");
      }

      if (!queue[0].bottomMode && queue[0].battle.turn.uturn) {
        setBottom("uturn");
      }

      if (queue[0].isAugment) {
        const curB = battleObj.current;
        const target = [curB.player, curB.playerBench1, curB.playerBench2].find((p) => p && (p.augments || []).length < 3);
        if (target) {
          const choices = rollAugments(target, 3, curB);
          if (choices && choices.length > 0) {
            setAugmentChoices(choices);
            setAugmentTargetPoke(target);
            setAugmentModalOpen(true);
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
      const npcFaint = qBattle.npc.faint;
      const npcFaint1 = qBattle.npcBench1.faint;
      const npcFaint2 = qBattle.npcBench2.faint;
      const playerFaint = qBattle.player.faint;
      const playerFaint1 = qBattle.playerBench1.faint;
      const playerFaint2 = qBattle.playerBench2.faint;
      if (npcFaint && npcFaint1 && npcFaint2 && queue.length === 1) {
        setGameResult("win");
        gameEnd = true;
      }
      if (playerFaint && playerFaint1 && playerFaint2 && queue.length === 1) {
        setGameResult("lose");
        gameEnd = true;
      }
    }
    if (queue.length === 0) {
      const curBattle = battleObj.current;
      if (curBattle && (curBattle.player.auto || curBattle.player.charge || curBattle.player.recharge)) {
        battleStart(curBattle, curBattle.player.autoSN, npcChoice(curBattle, curBattle.player.autoSN), queueObject);
      } else if (curBattle) {
        setText(curBattle.player.origin.names + " 무엇을 할까?");
      }
    }
  }, [queueObject.queue]);

  const handleDequeue = () => {
    if (augmentModalOpen || isTitanSelection || isDebugModalOpen || queueObject.queue[0]?.isAugment) return;
    if (queueObject.queue.length > 0) {
      if (battle.turn.textFreeze || queueObject.queue[0]?.waitInput) {
        return;
      }
      if (queueObject.queue[0]?.autoActTurn) {
        return;
      }

      queueObject.dequeue();
    } else {
      if (bottom === "skill") {
        const curBattle = battleObj.current;
        if (curBattle && !curBattle.player.auto && !curBattle.player.charge && !curBattle.player.recharge) {
          setText(curBattle.player.origin.names + " 무엇을 할까?");
        }
      }
    }
  };

  const battleStartBySkillButton = (skillIndex) => {
    battleStart(battleObj.current, skillIndex, npcChoice(battle, skillIndex), queueObject);
    setSelectedNpcChoice(null);
  };

  const textSkip = () => {
    const q = [...queueObject.queue]; // 원본 보존
    let found = null; // 조건이 만족된 queue 요소

    while (q.length > 0) {
      const cur = q.shift(); // 앞에서부터 하나씩 제거
      const b = cur.battle;

      // ----- 조건 체크 -----
      const playerFaint = b.player.faint;
      const playerFaint1 = b.playerBench1.faint;
      const playerFaint2 = b.playerBench2.faint;

      const npcFaint = b.npc.faint;
      const npcFaint1 = b.npcBench1.faint;
      const npcFaint2 = b.npcBench2.faint;

      const turnEnd = b.turn.turnEnd;

      const condition1 = playerFaint && turnEnd;
      const condition2 = b.turn.uturn;
      const condition3 = npcFaint && npcFaint1 && npcFaint2;
      const condition4 = playerFaint && playerFaint1 && playerFaint2;

      // 교체 선택 화면(mustSwitch/uturn)에서 멈추는 경우, 해당 항목은 큐에 남겨둔다.
      // (일반 흐름처럼 Bottom-Switch의 handleSwitch가 직접 dequeue 한다)
      const isInputPending = cur.waitInput || cur.bottomMode === "mustSwitch" || cur.bottomMode === "uturn" || condition1 || condition2;
      const keepInQueue = isInputPending && !condition3 && !condition4;
      if (!keepInQueue) queueObject.dequeue();

      if (isInputPending || condition3 || condition4 || q.length === 0) {
        // 조건 만족 or 마지막 queue 도달
        found = cur;
        break;
      }
    }

    const last = found;

    // battle/text 반영
    battleObj.current = cloneWithMethods(last.battle);
    setBattle(battleObj.current);
    if (!last.autoActTurn) {
      setText(last.text);
    }
    // ----- 이후 UI 처리 -----
    if (last.bottomMode) {
      setBottom(last.bottomMode);
    } else if (!last.bottomMode && last.battle.player.faint && last.battle.turn.turnEnd) {
      setBottom("mustSwitch");
    } else if (!last.bottomMode && last.battle.turn.uturn) {
      setBottom("uturn");
    }

    // 승/패 체크
    const b = last.battle;
    const npcFaint = b.npc.faint && b.npcBench1.faint && b.npcBench2.faint;
    const playerFaint = b.player.faint && b.playerBench1.faint && b.playerBench2.faint;

    if (npcFaint) setGameResult("win");
    if (playerFaint) setGameResult("lose");
  };

  return (
    <>
      <GlobalStyle />
      <BATTLE onClick={handleDequeue}>
        <TOP>
          <RoundIndicator
            onClick={(e) => {
              e.stopPropagation();
              setIsRoundOptionsOpen(true);
            }}
          >
            Round {location.state?.round || defaultOption.round}
          </RoundIndicator>
          <RoundOptionsModal
            isOpen={isRoundOptionsOpen}
            onClose={() => setIsRoundOptionsOpen(false)}
            difficulty={location.state?.difficulty || gameOption.difficulty}
            round={location.state?.round || defaultOption.round}
            teamOption={location.state?.teamOption || gameOption.teamOption}
          />
          {testmode &&
            battle?.npc &&
            (() => {
              const validChoices = makeNpcChoice(battle);
              return (
                <NpcActionSelector onClick={(e) => e.stopPropagation()}>
                  {[1, 2, 3, 4].map((num) => {
                    const skill = battle.npc.origin.skill[num];
                    const name = skill?.name || `기술${num}`;
                    const isSelected = selectedNpcChoice === num;
                    const isAvailable = validChoices.includes(num);
                    return (
                      <NpcActionItem key={num} $selected={isSelected} $disabled={!isAvailable} onClick={() => handleNpcActionClick(num)}>
                        {name}
                      </NpcActionItem>
                    );
                  })}
                  {[1, 2].map((num) => {
                    const benchKey = `npcBench${num}`;
                    const benchPoke = battle[benchKey];
                    const name = `교체(${benchPoke?.origin?.name || `포켓몬${num}`})`;
                    const isSelected = selectedNpcChoice === benchKey;
                    const isAvailable = validChoices.includes(benchKey);
                    return (
                      <NpcActionItem key={benchKey} $selected={isSelected} $disabled={!isAvailable} onClick={() => handleNpcActionClick(benchKey)}>
                        {name}
                      </NpcActionItem>
                    );
                  })}
                </NpcActionSelector>
              );
            })()}
          <IMAGE>
            <PokemonImage battle={battle} type="npc" />
            <PokemonImage battle={battle} type="plr" />
            <ItemImage battle={battle} type="plr" />
          </IMAGE>
          <PokemonInfo battle={battle} type="npc" />
          <PokemonInfo battle={battle} type="plr" />
        </TOP>
        <BOTTOM>
          {bottom === "skill" && <BottomSectionSkill battle={battle} text={text} setText={setText} setBottom={setBottom} queueObject={queueObject} battleStartBySkillButton={battleStartBySkillButton} textSkip={textSkip} btObj={battleObj.current} />}
          {(bottom === "switch" || bottom === "mustSwitch" || bottom === "uturn") && <BottomSectionSwitch battle={battle} text={text} bottom={bottom} setBottom={setBottom} setBench={setBench} queueObject={queueObject} setText={setText} btObj={battleObj.current} />}
          {bottom === "info" && (
            <BottomSectionInfo
              battle={battle}
              text={text}
              setText={setText}
              setBottom={setBottom}
              bench={bench}
              setBench={setBench}
              onOpenAugmentStatus={(poke) => {
                setAugmentStatusInitialPoke(poke || null);
                setIsAugmentStatusOpen(true);
              }}
            />
          )}
          {bottom === "skill" && (
            <AugmentStatusButton
              onClick={(e) => {
                e.stopPropagation();
                setAugmentStatusInitialPoke(null);
                setIsAugmentStatusOpen(true);
              }}
            >
              증강
            </AugmentStatusButton>
          )}
        </BOTTOM>
        <GameResultModal
          gameResult={!isTradeModalOpen ? gameResult : null}
          onMainMenu={() => navigate("/")}
          onNextRound={handleNextRound}
        />
        <AfterBattleTradeModal
          isOpen={isTradeModalOpen}
          battle={battleObj.current || battle}
          onConfirmTrade={submitTrade}
          onSkipTrade={handleSkipTrade}
        />
        {augmentModalOpen && <AugmentModal team={isTitanSelection && augmentTargetPoke ? [augmentTargetPoke] : [battleObj.current?.player, battleObj.current?.playerBench1, battleObj.current?.playerBench2].filter(Boolean)} initialTarget={augmentTargetPoke || battleObj.current?.player} augments={augmentChoices} targetPokemon={augmentTargetPoke || battleObj.current?.player} battle={battleObj.current || battle} onSelect={handleSelectAugment} onClose={handleCloseAugment} isTestMode={testmode} isTitanSelection={isTitanSelection} />}
        {isAugmentStatusOpen && <AugmentStatusModal battle={battle} initialPokemon={augmentStatusInitialPoke} onClose={() => setIsAugmentStatusOpen(false)} />}
        {isAugmentCarryModalOpen && <AugmentCarryoverModal battle={battle} round={location.state?.round || defaultOption.round} onConfirm={handleCarryoverConfirm} />}
        <TestingTools
          visible={(testmode || isTestMode) && !gameResult}
          isDebugOpen={isDebugModalOpen}
          setIsDebugOpen={setIsDebugModalOpen}
          onBack={() => {
            queueObject.initQueue();
            if (location.state?.fromCustom) {
              const { team1, team2 } = location.state || {};
              navigate("/custom", { state: { team1, team2 } });
            } else {
              navigate(-1);
            }
          }}
          onSkip={handleTestSkipNpc}
        />
      </BATTLE>
    </>
  );
};

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "CustomFont"; /* 폰트 이름 정의 */
    src: url("/pokemon/font/esamanru Medium.ttf") format("truetype"); /* .ttf 파일 경로 지정 */
  }

  body {
    font-family: "CustomFont", sans-serif; /* 기본 폰트로 'CustomFont' 사용 */
  }
`;

const BATTLE = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const TOP = styled.div`
  width: 100%;
  height: 43%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("/pokemon/img/background/top.gif");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

const IMAGE = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const BOTTOM = styled.div`
  width: 100vw;
  height: 57vh;
  background-color: #6e7e7c;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 20px;
  position: relative;
  background-image: url("/pokemon/img/background/bottom.gif");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
`;

const RoundIndicator = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 1.1rem;
  z-index: 10;
  border: 1px solid rgba(255, 255, 255, 0.4);
  text-shadow: 1px 1px 2px black;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
    transform: scale(1.05);
  }
`;

const NpcActionSelector = styled.div`
  position: absolute;
  top: 60px;
  right: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  z-index: 20;
`;

const NpcActionItem = styled.div`
  font-size: 13px;
  color: ${(props) => (props.$selected ? "#111" : props.$disabled ? "#888888" : "#ffffff")};
  background-color: ${(props) => (props.$selected ? "#ffe600" : props.$disabled ? "rgba(30, 30, 30, 0.45)" : "rgba(0, 0, 0, 0.5)")};
  font-weight: ${(props) => (props.$selected ? "bold" : "normal")};
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.$selected ? "#d4af37" : props.$disabled ? "rgba(120, 120, 120, 0.3)" : "rgba(255, 255, 255, 0.25)")};
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  text-shadow: ${(props) => (props.$selected || props.$disabled ? "none" : "1px 1px 2px black")};
  box-shadow: ${(props) => (props.$selected ? "0 0 8px rgba(255, 230, 0, 0.8)" : "none")};
  transition: all 0.15s ease;

  &:hover {
    background-color: ${(props) => (props.$selected ? "#ffe600" : props.$disabled ? "rgba(60, 60, 60, 0.65)" : "rgba(0, 0, 0, 0.75)")};
  }
`;

const AugmentStatusButton = styled.div`
  position: absolute;
  top: 49.5vh;
  left: 1vw;
  width: 14vw;
  height: 6vh;
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  font-weight: bold;
  color: #cbd5e1;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(30, 45, 60, 0.95), rgba(10, 15, 20, 0.9));
    border-color: rgba(100, 255, 218, 0.5);
    color: #64ffda;
  }
`;

export default Battle;
