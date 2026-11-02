import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, css } from "styled-components";
import "./Main.css";
import { useRecoilValue } from "recoil";
import { createBattle } from "../entity/Battle";
import { defaultOption } from "../config/defaultOption";
import { gameOptionState } from "../util/recoilState";
import { testmode, setSelectedNpcAct } from "../config/testMode";
import TradeInfoModal from "../component/battleScreen/TradeInfoModal";
import AugmentModal from "../component/battleScreen/AugmentModal";
import AugmentStatusModal from "../component/battleScreen/AugmentStatusModal";
import AugmentCarryoverModal from "../component/battleScreen/AugmentCarryoverModal";
import { rollAugments, grantRandomAugment } from "../util/augmentRoll";
import { AUGMENT_LIST } from "../entity/Augment/AugmentData";
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
  const [tradePlayerIdx, setTradePlayerIdx] = useState(null);
  const [tradeNpcIdx, setTradeNpcIdx] = useState(null);
  const [tradeInfoPokemon, setTradeInfoPokemon] = useState(null);
  const [tradeAlertMessage, setTradeAlertMessage] = useState(null);
  const [isRoundOptionsOpen, setIsRoundOptionsOpen] = useState(false);
  const [augmentModalOpen, setAugmentModalOpen] = useState(false);
  const [augmentChoices, setAugmentChoices] = useState([]);
  const [augmentTargetPoke, setAugmentTargetPoke] = useState(null);
  const [isInitialBattleStart, setIsInitialBattleStart] = useState(false);
  const [isAugmentStatusOpen, setIsAugmentStatusOpen] = useState(false);
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

  const handleRestart = () => {
    setGameResult(null);
    setIsTradeModalOpen(false);
    setTradePlayerIdx(null);
    setTradeNpcIdx(null);
    setTradeInfoPokemon(null);
    setTradeAlertMessage(null);
    queueObject.initQueue();
    const { team1, team2, isNew, difficulty = gameOption.difficulty, teamOption = gameOption.teamOption, round, fromCustom } = location.state || {};
    navigate("/battle", { state: { team1, team2, isNew: true, difficulty, teamOption, round, fromCustom }, replace: true });
  };

  const handleNextRound = () => {
    const { teamOption = gameOption.teamOption } = location.state || {};
    // 1. 트레이드 모드인 경우 트레이드 모달을 먼저 띄운다.
    if (teamOption === "트레이드") {
      setTradePlayerIdx(null);
      setTradeNpcIdx(null);
      setTradeInfoPokemon(null);
      setTradeAlertMessage(null);
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
    const teamHasAugments = [currentBattle?.player, currentBattle?.playerBench1, currentBattle?.playerBench2].some(
      (p) => (p?.augments || []).length > 0
    );

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
    setTradePlayerIdx(null);
    setTradeNpcIdx(null);
    setTradeInfoPokemon(null);
    setTradeAlertMessage(null);
    queueObject.initQueue();
    const { team1, difficulty = gameOption.difficulty, teamOption = gameOption.teamOption, round = defaultOption.round, fromCustom, mayhemMode = gameOption.mayhemMode } = location.state || {};

    const curPlayerTeam = [battleObj.current?.player, battleObj.current?.playerBench1, battleObj.current?.playerBench2]
      .filter(Boolean)
      .sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    const curTeamIds = curPlayerTeam.map((p) => p.id);

    let nextTeam1 = customTeam1
      ? customTeam1
      : teamOption === "랜덤"
      ? getRandomTeam(3)
      : curTeamIds.length === 3
      ? curTeamIds
      : [...team1];

    const nextTeam2 = getRandomTeam(3);

    // 함수(onApply, getDesc 등)가 포함된 증강 객체는 history.replaceState에서 DataCloneError를 유발하므로
    // 직렬화 가능한 plain 객체({ id, replacedSlot })로 변환하여 전달
    const serializedCarried = carriedMap
      ? Object.entries(carriedMap).reduce((acc, [idx, augs]) => {
          acc[idx] = (augs || []).map((aug) => ({
            id: aug.id || aug,
            replacedSlot: aug.replacedSlot ?? aug._danceReplacedSlot ?? aug._salamenceReplacedSlot ?? aug._teraBlastReplacedSlot,
            selectedType: aug.selectedType ?? aug._nullifyType ?? aug._teraBlastType,
            revolutionResult: aug.revolutionResult ?? aug._revolutionResult,
            replacedSkillName: aug.replacedSkillName ?? aug._replacedSkillName ?? aug._teraBlastReplacedSkillName,
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

  const submitTrade = () => {
    if (tradePlayerIdx === null || tradeNpcIdx === null) return;
    const curBattle = battleObj.current || battle;
    const playerTeamFixed = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
    const npcTeamFixed = [curBattle.npc, curBattle.npcBench1, curBattle.npcBench2].sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

    const playerPoke = playerTeamFixed[tradePlayerIdx];
    const npcPoke = npcTeamFixed[tradeNpcIdx];
    const hasPlayerLegendary = playerTeamFixed.some((p) => isLegendary(p?.origin));

    if (hasPlayerLegendary && isLegendary(playerPoke?.origin) !== isLegendary(npcPoke?.origin)) {
      setTradeAlertMessage("초전설 포켓몬은 초전설 포켓몬끼리만 교환할 수 있습니다.");
      return;
    }

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
    const fastUser = speedCheck(bt);
    const slowUser = fastUser === "player" ? "npc" : "player";
    applyAbilityEffects(bt, fastUser, queueObject.enqueue);
    applyAbilityEffects(bt, slowUser, queueObject.enqueue);
  };

  const handleSelectAugment = (selectedAugment, options = null) => {
    setAugmentModalOpen(false);
    const curBattle = battleObj.current;
    if (!curBattle) return;

    const teamPokes = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2].filter(Boolean);
    const targetCandidate = options?.targetPokemon || augmentTargetPoke;
    const target =
      (targetCandidate &&
        teamPokes.find(
          (p) =>
            p &&
            (p.originalIndex === targetCandidate.originalIndex ||
              p.id === targetCandidate.id ||
              p.name === targetCandidate.name)
        )) ||
      curBattle.player;
    target.applyAugment(selectedAugment, curBattle, options);
    setAugmentTargetPoke(target);

    const typeNote = options?.selectedType ? (selectedAugment.id === "teraBlast" ? ` (${options.selectedType} 타입)` : ` (${options.selectedType} 무효)`) : "";
    const gainText = `[증강] ${target.names} "${selectedAugment.name}"${typeNote} 효과를 얻었다!`;

    const gainLogText = gainText;
    if (queueObject.queue[0]?.isAugment) {
      queueObject.updateHead(
        (prev) => ({
          ...prev,
          battle: curBattle,
          text: gainText,
          logText: gainLogText,
          isAugment: false,
        }),
        curBattle
      );
      setText(gainText);
    } else {
      queueObject.enqueue({
        id: "d7391e86-25e9-459f-abc7-588560b20d83",
        battle: curBattle,
        text: gainText,
        logText: gainLogText,
      });
    }

    if (selectedAugment.id === "rebellionOrRevolution" || selectedAugment.id === "revolution") {
      const statName = target._revolutionResult === "catk" ? "특수공격" : "공격";
      const detailText = `${statName}이 2배가 되었다!`;
      queueObject.enqueue({
        id: "rev-stat-doubled-msg",
        battle: curBattle,
        text: detailText,
        logText: detailText,
      });
    }

    enqueueBattleStart(curBattle, { skipStartText: true });
    setBattle(cloneWithMethods(curBattle));
  };

  const handleCloseAugment = () => {
    setAugmentModalOpen(false);
    const curBattle = battleObj.current;
    if (!curBattle) return;

    if (queueObject.queue[0]?.isAugment) {
      queueObject.dequeue();
    }
    enqueueBattleStart(curBattle);
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
    setTradePlayerIdx(null);
    setTradeNpcIdx(null);
    setTradeInfoPokemon(null);
    setTradeAlertMessage(null);

    const isMayhem = mayhemMode !== undefined ? mayhemMode : gameOption.mayhemMode;
    battleObj.current = createBattle(team1, team2, { difficulty, round, mayhemMode: isMayhem });
    if (isMayhem && carriedAugments) {
      // 이전 라운드에서 선택하여 유지한 증강 복원 (AUGMENT_LIST에서 완전한 객체 매핑)
      const teamPokes = [battleObj.current.player, battleObj.current.playerBench1, battleObj.current.playerBench2];
      teamPokes.forEach((p, idx) => {
        if (p && Array.isArray(carriedAugments[idx])) {
          carriedAugments[idx].forEach((savedAug) => {
            const augId = typeof savedAug === "string" ? savedAug : savedAug?.id;
            const fullAug = AUGMENT_LIST.find((a) => a.id === augId);
            if (fullAug) {
              const augToApply = { ...fullAug };
              if (savedAug?.replacedSlot) {
                augToApply.replacedSlot = savedAug.replacedSlot;
              }
              if (savedAug?.selectedType) {
                augToApply.selectedType = savedAug.selectedType;
              }
              p.applyAugment(augToApply, battleObj.current, {

                replaceSlot: savedAug?.replacedSlot,

                selectedType: savedAug?.selectedType,

                targetStat: savedAug?.revolutionResult,
                replacedSkillName: savedAug?.replacedSkillName,

              });
            }
          });
        }
      });
    }

    if (isMayhem) {
      // 배틀 시작 전에 증강 선택 큐를 먼저 추가
      const target = [battleObj.current.player, battleObj.current.playerBench1, battleObj.current.playerBench2].find(
        (p) => p && (p.augments || []).length < 3
      );
      if (target) {
        queueObject.enqueue({
          id: "82c455ab-c426-4986-80c4-f030b3742f94",
          battle: battleObj.current,
          text: "증강을 선택하세요",
          isAugment: true,
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
      console.log(queue);
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
        const target = [curB.player, curB.playerBench1, curB.playerBench2].find(
          (p) => p && (p.augments || []).length < 3
        );
        if (target) {
          const choices = rollAugments(target, 3);
          if (choices && choices.length > 0) {
            setAugmentChoices(choices);
            setAugmentTargetPoke(target);
            setAugmentModalOpen(true);
          } else {
            queueObject.dequeue();
            enqueueBattleStart(curB);
          }
        } else {
          queueObject.dequeue();
          enqueueBattleStart(curB);
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
    if (augmentModalOpen || queueObject.queue[0]?.isAugment) return;
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
    setBattle(last.battle);
    if (!last.autoActTurn) {
      setText(last.text);
    }
    // ----- 이후 UI 처리 -----
    if (last.bottomMode) {
      setBottom(last.bottomMode);
    }
    else if (!last.bottomMode && last.battle.player.faint && last.battle.turn.turnEnd) {
      setBottom("mustSwitch");
    }
    else if (!last.bottomMode && last.battle.turn.uturn) {
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
          {isRoundOptionsOpen && (
            <ModalOverlay
              onClick={(e) => {
                e.stopPropagation();
                setIsRoundOptionsOpen(false);
              }}
              style={{ zIndex: 1100, backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <ModalBox onClick={(e) => e.stopPropagation()} style={{ width: "300px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "20px", marginTop: "0" }}>현재 게임 옵션</h3>
                <div style={{ color: "#ddd", textAlign: "left", lineHeight: "1.8", fontSize: "1.1rem" }}>
                  <p>
                    <strong>난이도:</strong> {location.state?.difficulty || gameOption.difficulty}
                    {(() => {
                      const difficulty = location.state?.difficulty || gameOption.difficulty;
                      const round = location.state?.round || defaultOption.round;
                      const multiplier = (1.0 + (round - 1) * 0.1).toFixed(1); // PokemonInstance의 배율 공식과 동일
                      if (difficulty === "노말") return ` (상대 포켓몬 HP 배율 ${multiplier}배)`;
                      if (difficulty === "하드") return ` (상대 포켓몬 능력치 배율 ${multiplier}배)`;
                      return "";
                    })()}
                  </p>
                  <p>
                    <strong>팀 옵션:</strong> {location.state?.teamOption || gameOption.teamOption}
                  </p>
                </div>
                <ModalButtonContainer style={{ marginTop: "20px" }}>
                  <ModalButton
                    $primary
                    $isWin={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRoundOptionsOpen(false);
                    }}
                  >
                    닫기
                  </ModalButton>
                </ModalButtonContainer>
              </ModalBox>
            </ModalOverlay>
          )}
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
          {bottom === "info" && <BottomSectionInfo battle={battle} text={text} setText={setText} setBottom={setBottom} bench={bench} />}
          <AugmentStatusButton
            onClick={(e) => {
              e.stopPropagation();
              setIsAugmentStatusOpen(true);
            }}
          >
            증강 {(() => {
              const count = [battle?.player, battle?.playerBench1, battle?.playerBench2].reduce(
                (sum, p) => sum + (p?.augments?.length || 0),
                0
              );
              return count > 0 ? `(${count})` : "";
            })()}
          </AugmentStatusButton>
          {testmode && location.state?.fromCustom && (
            <CustomBackButton
              onClick={(e) => {
                e.stopPropagation();
                queueObject.initQueue();
                const { team1, team2 } = location.state || {};
                navigate("/custom", { state: { team1, team2 } });
              }}
            >
              &#8592;
            </CustomBackButton>
          )}
        </BOTTOM>
        {gameResult && !isTradeModalOpen && (
          <ModalOverlay>
            <ModalBox onClick={(e) => e.stopPropagation()}>
              <ModalTitle $isWin={gameResult === "win"}>{gameResult === "win" ? "승리!" : "패배..."}</ModalTitle>
              <ModalButtonContainer>
                <ModalButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/");
                  }}
                >
                  메인으로
                </ModalButton>
                {gameResult === "win" && (
                  <ModalButton
                    $primary
                    $isWin={gameResult === "win"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextRound();
                    }}
                  >
                    다음 라운드
                  </ModalButton>
                )}
              </ModalButtonContainer>
            </ModalBox>
          </ModalOverlay>
        )}

        {isTradeModalOpen &&
          (() => {
            const playerTeamFixed = [battle.player, battle.playerBench1, battle.playerBench2].sort((a, b) => a.originalIndex - b.originalIndex);
            const npcTeamFixed = [battle.npc, battle.npcBench1, battle.npcBench2].sort((a, b) => a.originalIndex - b.originalIndex);

            const selectedPlayerPoke = tradePlayerIdx !== null ? playerTeamFixed[tradePlayerIdx] : null;
            const selectedNpcPoke = tradeNpcIdx !== null ? npcTeamFixed[tradeNpcIdx] : null;
            const hasPlayerLegendary = playerTeamFixed.some((p) => isLegendary(p?.origin));
            const canTrade = (playerPoke, npcPoke) => !hasPlayerLegendary || isLegendary(playerPoke?.origin) === isLegendary(npcPoke?.origin);

            const isTradeValid = tradePlayerIdx !== null && tradeNpcIdx !== null && canTrade(playerTeamFixed[tradePlayerIdx], npcTeamFixed[tradeNpcIdx]);

            const handlePlayerCardClick = (idx, p) => {
              if (tradePlayerIdx === idx) {
                setTradePlayerIdx(null);
                return;
              }
              if (selectedNpcPoke && !canTrade(p, selectedNpcPoke)) {
                setTradeAlertMessage("초전설 포켓몬은 초전설 포켓몬끼리만 교환할 수 있습니다.");
                return;
              }
              setTradePlayerIdx(idx);
            };

            const handleNpcCardClick = (idx, p) => {
              if (tradeNpcIdx === idx) {
                setTradeNpcIdx(null);
                return;
              }
              if (selectedPlayerPoke && !canTrade(selectedPlayerPoke, p)) {
                setTradeAlertMessage("초전설 포켓몬은 초전설 포켓몬끼리만 교환할 수 있습니다.");
                return;
              }
              setTradeNpcIdx(idx);
            };

            return (
              <ModalOverlay>
                <ModalBox onClick={(e) => e.stopPropagation()} style={{ width: "95vw", maxWidth: "600px", maxHeight: "95vh", padding: "15px", display: "flex", flexDirection: "column", gap: "15px", justifyContent: "center", boxSizing: "border-box" }}>
                  <div>
                    <ModalTitle $isWin={true} style={{ fontSize: "2.4rem", margin: "10px 0 5px", wordBreak: "keep-all" }}>
                      포켓몬 트레이드
                    </ModalTitle>
                    <div style={{ textAlign: "center", color: "#aaa", fontSize: "0.85rem" }}>* 팀 내 초전설 포켓몬은 최대 1마리까지 보유할 수 있습니다.</div>
                  </div>
                  <TradeContainer>
                    <TradeColumn>
                      <h3 style={{ textAlign: "center", color: "#64ffda", margin: "5px 0" }}>내 엔트리</h3>
                      {playerTeamFixed.map((p, idx) => {
                        const isLeg = isLegendary(p?.origin);
                        const isDisabled = selectedNpcPoke ? !canTrade(p, selectedNpcPoke) : false;
                        return (
                          <TradeCard key={idx} $selected={tradePlayerIdx === idx} $disabled={isDisabled} onClick={() => handlePlayerCardClick(idx, p)}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "7vh", overflow: "hidden" }}>
                              <TradeCardImage src={`/pokemon/img/pokemon/${p.origin.pokemon_id}.webp`} />
                              <TradeCardName>{p.origin.name}</TradeCardName>
                            </div>
                            <TradeInfoButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeInfoPokemon(p);
                              }}
                            >
                              상세정보
                            </TradeInfoButton>
                          </TradeCard>
                        );
                      })}
                    </TradeColumn>
                    <TradeColumn>
                      <h3 style={{ textAlign: "center", color: "#ff5252", margin: "5px 0" }}>상대 엔트리</h3>
                      {npcTeamFixed.map((p, idx) => {
                        const isLeg = isLegendary(p?.origin);
                        const isDisabled = selectedPlayerPoke ? !canTrade(selectedPlayerPoke, p) : false;
                        return (
                          <TradeCard key={idx} $selected={tradeNpcIdx === idx} $disabled={isDisabled} onClick={() => handleNpcCardClick(idx, p)}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "7vh", overflow: "hidden" }}>
                              <TradeCardImage src={`/pokemon/img/pokemon/${p.origin.pokemon_id}.webp`} />
                              <TradeCardName>{p.origin.name}</TradeCardName>
                            </div>
                            <TradeInfoButton
                              onClick={(e) => {
                                e.stopPropagation();
                                setTradeInfoPokemon(p);
                              }}
                            >
                              상세정보
                            </TradeInfoButton>
                          </TradeCard>
                        );
                      })}
                    </TradeColumn>
                  </TradeContainer>
                  <ModalButtonContainer>
                    <ModalButton onClick={handleSkipTrade}>건너뛰기</ModalButton>
                    <ModalButton
                      $primary
                      $isWin={true}
                      onClick={isTradeValid ? submitTrade : undefined}
                      style={{
                        backgroundColor: isTradeValid ? "rgba(100, 255, 218, 0.1)" : "rgba(128, 128, 128, 0.1)",
                        color: isTradeValid ? "#64ffda" : "#888",
                        borderColor: isTradeValid ? "rgba(100, 255, 218, 0.5)" : "rgba(128, 128, 128, 0.5)",
                        cursor: isTradeValid ? "pointer" : "not-allowed",
                      }}
                    >
                      교환 및 진행
                    </ModalButton>
                  </ModalButtonContainer>
                </ModalBox>
                {tradeInfoPokemon && <TradeInfoModal pokemon={tradeInfoPokemon} onClose={() => setTradeInfoPokemon(null)} />}
                {tradeAlertMessage && (
                  <ModalOverlay
                    onClick={(e) => {
                      e.stopPropagation();
                      setTradeAlertMessage(null);
                    }}
                    style={{ zIndex: 1200, backgroundColor: "rgba(0, 0, 0, 0.65)" }}
                  >
                    <ModalBox
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "85vw",
                        maxWidth: "380px",
                        padding: "28px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        boxSizing: "border-box",
                      }}
                    >
                      <ModalTitle $isWin={false} style={{ fontSize: "1.8rem", margin: "0", wordBreak: "keep-all" }}>
                        교환 불가
                      </ModalTitle>
                      <div style={{ color: "#e0e0e0", fontSize: "1rem", lineHeight: "1.6", wordBreak: "keep-all" }}>{tradeAlertMessage}</div>
                      <ModalButtonContainer>
                        <ModalButton
                          $primary
                          $isWin={true}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTradeAlertMessage(null);
                          }}
                          style={{ padding: "12px 0" }}
                        >
                          확인
                        </ModalButton>
                      </ModalButtonContainer>
                    </ModalBox>
                  </ModalOverlay>
                )}
              </ModalOverlay>
            );
          })()}
        {augmentModalOpen && (
          <AugmentModal
            team={[
              battleObj.current?.player,
              battleObj.current?.playerBench1,
              battleObj.current?.playerBench2,
            ].filter(Boolean)}
            initialTarget={augmentTargetPoke || battleObj.current?.player}
            augments={augmentChoices}
            targetPokemon={augmentTargetPoke || battleObj.current?.player}
            battle={battleObj.current || battle}
            onSelect={handleSelectAugment}
            onClose={handleCloseAugment}
            isTestMode={testmode}
          />
        )}
        {isAugmentStatusOpen && (
          <AugmentStatusModal
            battle={battle}
            onClose={() => setIsAugmentStatusOpen(false)}
          />
        )}
        {isAugmentCarryModalOpen && (
          <AugmentCarryoverModal
            battle={battle}
            round={location.state?.round || defaultOption.round}
            onConfirm={handleCarryoverConfirm}
          />
        )}
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: rgba(15, 20, 28, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 45px 40px;
  text-align: center;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.05);
  animation: fadeInScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 320px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);

  @keyframes fadeInScale {
    0% {
      transform: scale(0.95);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalTitle = styled.h2`
  font-size: 3.2rem;
  color: ${(props) => (props.$isWin ? "#64ffda" : "#ff5252")};
  margin-top: 0;
  margin-bottom: 35px;
  font-family: "CustomFont", sans-serif;
  text-shadow: 0 0 15px ${(props) => (props.$isWin ? "rgba(100, 255, 218, 0.5)" : "rgba(255, 82, 82, 0.5)")};
  letter-spacing: 2px;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 16px 0;
  font-size: 1.1rem;
  font-family: "CustomFont", sans-serif;
  border: 1px solid ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.5)" : "rgba(255, 82, 82, 0.5)") : "rgba(255, 255, 255, 0.2)")};
  border-radius: 12px;
  cursor: pointer;
  background: ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.1)" : "rgba(255, 82, 82, 0.1)") : "rgba(255, 255, 255, 0.05)")};
  color: ${(props) => (props.$primary ? (props.$isWin ? "#64ffda" : "#ff5252") : "#e0e0e0")};
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.25)" : "rgba(255, 82, 82, 0.25)") : "rgba(255, 255, 255, 0.15)")};
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${(props) => (props.$primary ? (props.$isWin ? "rgba(100, 255, 218, 0.2)" : "rgba(255, 82, 82, 0.2)") : "rgba(0, 0, 0, 0.3)")};
  }

  &:active {
    transform: translateY(0);
  }
`;

const TradeCard = styled.div`
  position: relative;
  width: 100%;
  height: 9vh;
  border-radius: 5px;
  background-color: ${(props) => (props.$selected ? "rgba(100, 255, 218, 0.15)" : "rgba(0, 0, 0, 0.7)")};
  overflow: hidden;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.35 : 1)};
  filter: ${(props) => (props.$disabled ? "grayscale(0.7)" : "none")};
  border: ${(props) => (props.$selected ? "2px solid #64ffda" : "2px solid transparent")};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1vh;
  box-sizing: border-box;
`;

const TradeCardImage = styled.img`
  height: 5vh;
  width: 5vh;
  object-fit: contain;
  flex-shrink: 0;
`;

const TradeCardName = styled.div`
  font-size: 1.3vh;
  color: white;
  font-weight: bold;
  text-align: center;
  white-space: nowrap;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 0.3vh;
`;

const TradeContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 2vw;
  box-sizing: border-box;
`;

const TradeColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1vh;
`;

const TradeInfoButton = styled.div`
  flex-shrink: 0;
  height: 6vh;
  padding: 0 1vh;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
  font-size: 1.8vh;
  z-index: 5;
  border: 1px solid rgba(255, 255, 255, 0.2);
  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
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

const CustomBackButton = styled.div`
  position: absolute;
  top: 49.5vh;
  left: 16vw;
  width: 14vw;
  height: 6vh;
  border-radius: 5px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.85), rgba(0, 0, 0, 0.7));
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  box-sizing: border-box;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(100, 255, 218, 0.6);
  }

  &:active {
    transform: scale(0.97);
  }
`;

export default Battle;
