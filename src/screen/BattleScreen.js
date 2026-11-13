import React, { useState, useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./Main.css";
import { useRecoilValue } from "recoil";
import { defaultOption } from "../config/defaultOption";
import { gameOptionState } from "../store/recoilState";
import { testmode, subscribeTestMode } from "../config/testMode";
import AugmentModal from "../component/battleScreen/augment/AugmentModal";
import AugmentStatusModal from "../component/battleScreen/augment/AugmentStatusModal";
import AugmentCarryoverModal from "../component/battleScreen/augment/AugmentCarryoverModal";
import RoundOptionsModal from "../component/battleScreen/RoundOptionsModal";
import GameResultModal from "../component/battleScreen/GameResultModal";
import TestingTools from "../component/battleScreen/TestingTools";
import AfterBattleTradeModal from "../component/battleScreen/AfterBattleTradeModal";
import { useQueue } from "../store/useQueue";
import PokemonInfo from "../component/battleScreen/top/PokemonInfo";
import PokemonImage from "../component/battleScreen/top/PokemonImage";
import ItemImage from "../component/battleScreen/top/ItemImage";
import BottomSectionSkill from "../component/battleScreen/bottom/skill/Bottom-Skill";
import BottomSectionSwitch from "../component/battleScreen/bottom/switch/Bottom-Switch";
import BottomSectionInfo from "../component/battleScreen/bottom/info/Bottom-Info";
import { useLocation, useNavigate } from "react-router-dom";
import { makeNpcChoice } from "../npc/npc";
import { useBattleStore } from "../store/battleStore";

const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameOption = useRecoilValue(gameOptionState);
  const { queueObject } = useQueue();

  // Store 상태 구독 (필요한 slice만 구독)
  const battle = useBattleStore((s) => s.battle);
  const battleLive = useBattleStore((s) => s.battleLive);
  const text = useBattleStore((s) => s.text);
  const bottom = useBattleStore((s) => s.bottom);
  const bench = useBattleStore((s) => s.bench);
  const gameResult = useBattleStore((s) => s.gameResult);
  const selectedNpcChoice = useBattleStore((s) => s.selectedNpcChoice);

  const isTradeModalOpen = useBattleStore((s) => s.isTradeModalOpen);
  const isRoundOptionsOpen = useBattleStore((s) => s.isRoundOptionsOpen);
  const isDebugModalOpen = useBattleStore((s) => s.isDebugModalOpen);
  const augmentModalOpen = useBattleStore((s) => s.augmentModalOpen);
  const isTitanSelection = useBattleStore((s) => s.isTitanSelection);
  const augmentChoices = useBattleStore((s) => s.augmentChoices);
  const augmentTargetPoke = useBattleStore((s) => s.augmentTargetPoke);
  const isAugmentStatusOpen = useBattleStore((s) => s.isAugmentStatusOpen);
  const augmentStatusInitialPoke = useBattleStore((s) => s.augmentStatusInitialPoke);
  const isAugmentCarryModalOpen = useBattleStore((s) => s.isAugmentCarryModalOpen);
  const pendingNextTeam = useBattleStore((s) => s.pendingNextTeam);

  // Store 액션
  const setText = useBattleStore((s) => s.setText);
  const setBottom = useBattleStore((s) => s.setBottom);
  const setBench = useBattleStore((s) => s.setBench);
  const setIsRoundOptionsOpen = useBattleStore((s) => s.setIsRoundOptionsOpen);
  const setIsDebugModalOpen = useBattleStore((s) => s.setIsDebugModalOpen);
  const setIsTradeModalOpen = useBattleStore((s) => s.setIsTradeModalOpen);
  const openAugmentStatus = useBattleStore((s) => s.openAugmentStatus);
  const closeAugmentStatus = useBattleStore((s) => s.closeAugmentStatus);
  const toggleNpcAction = useBattleStore((s) => s.toggleNpcAction);

  const [isTestMode, setIsTestMode] = useState(() => Boolean(testmode));

  useEffect(() => {
    return subscribeTestMode(({ testmode: tm }) => {
      setIsTestMode(Boolean(tm));
    });
  }, []);

  useEffect(() => {
    return () => {
      queueObject.initQueue(); // unmount 시 큐 비우기
      useBattleStore.getState().resetStore();
    };
  }, []);

  useEffect(() => {
    useBattleStore.getState().initBattleRound({
      locationState: location.state,
      gameOption,
      queueObject,
    });
  }, [location.state]);

  useEffect(() => {
    useBattleStore.getState().syncFromQueueHead(queueObject);
  }, [queueObject.queue]);

  const handleNextRound = () => {
    const { teamOption = gameOption.teamOption } = location.state || {};
    if (teamOption === "트레이드") {
      setIsTradeModalOpen(true);
      return;
    }
    useBattleStore.getState().openCarryoverOrProceed({
      nextTeam: null,
      locationState: location.state,
      gameOption,
      queueObject,
      navigate,
    });
  };

  const handleCarryoverConfirm = (carriedMap) => {
    useBattleStore.getState().proceedNextRound({
      customTeam1: pendingNextTeam,
      carriedMap,
      locationState: location.state,
      gameOption,
      queueObject,
      navigate,
    });
  };

  const handleSkipTrade = () => {
    setIsTradeModalOpen(false);
    useBattleStore.getState().openCarryoverOrProceed({
      nextTeam: null,
      locationState: location.state,
      gameOption,
      queueObject,
      navigate,
    });
  };

  const submitTrade = (tradePlayerIdx, tradeNpcIdx) => {
    useBattleStore.getState().submitTrade({
      tradePlayerIdx,
      tradeNpcIdx,
      locationState: location.state,
      gameOption,
      queueObject,
      navigate,
    });
  };

  const handleDequeue = () => {
    useBattleStore.getState().handleDequeue(queueObject, isDebugModalOpen);
  };

  const battleStartBySkillButton = (skillIndex) => {
    useBattleStore.getState().battleStartBySkillButton(skillIndex, queueObject);
  };

  const textSkip = () => {
    useBattleStore.getState().textSkip(queueObject);
  };

  const handleSelectAugment = (selectedAugment, options = null) => {
    useBattleStore.getState().handleSelectAugment(selectedAugment, options, queueObject);
  };

  const handleCloseAugment = () => {
    useBattleStore.getState().handleCloseAugment(queueObject);
  };

  const handleTestSkipNpc = (e) => {
    e.stopPropagation();
    useBattleStore.getState().handleTestSkipNpc(queueObject);
  };

  const activeBattle = battleLive || battle;

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
                      <NpcActionItem key={num} $selected={isSelected} $disabled={!isAvailable} onClick={() => toggleNpcAction(num)}>
                        {name}
                      </NpcActionItem>
                    );
                  })}
                  {validChoices.includes(5) && (
                    <NpcActionItem key={5} $selected={selectedNpcChoice === 5} $disabled={false} onClick={() => toggleNpcAction(5)}>
                      발버둥
                    </NpcActionItem>
                  )}
                  {[1, 2].map((num) => {
                    const benchKey = `npcBench${num}`;
                    const benchPoke = battle[benchKey];
                    const name = `교체(${benchPoke?.origin?.name || `포켓몬${num}`})`;
                    const isSelected = selectedNpcChoice === benchKey;
                    const isAvailable = validChoices.includes(benchKey);
                    return (
                      <NpcActionItem key={benchKey} $selected={isSelected} $disabled={!isAvailable} onClick={() => toggleNpcAction(benchKey)}>
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
          {bottom === "skill" && (
            <BottomSectionSkill
              battle={battle}
              text={text}
              setText={setText}
              setBottom={setBottom}
              queueObject={queueObject}
              battleStartBySkillButton={battleStartBySkillButton}
              textSkip={textSkip}
              btObj={battleLive}
            />
          )}
          {(bottom === "switch" || bottom === "mustSwitch" || bottom === "switchBySkill") && (
            <BottomSectionSwitch
              battle={battle}
              text={text}
              bottom={bottom}
              setBottom={setBottom}
              setBench={setBench}
              queueObject={queueObject}
              setText={setText}
              btObj={battleLive}
            />
          )}
          {bottom === "info" && (
            <BottomSectionInfo
              battle={battle}
              text={text}
              setText={setText}
              setBottom={setBottom}
              bench={bench}
              setBench={setBench}
              onOpenAugmentStatus={(poke) => openAugmentStatus(poke || null)}
            />
          )}
          {bottom === "skill" && (
            <AugmentStatusButton
              onClick={(e) => {
                e.stopPropagation();
                openAugmentStatus(null);
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
          battle={activeBattle}
          onConfirmTrade={submitTrade}
          onSkipTrade={handleSkipTrade}
        />
        {augmentModalOpen && (
          <AugmentModal
            team={
              isTitanSelection && augmentTargetPoke
                ? [augmentTargetPoke]
                : [battleLive?.player, battleLive?.playerBench1, battleLive?.playerBench2].filter(Boolean)
            }
            initialTarget={augmentTargetPoke || battleLive?.player}
            augments={augmentChoices}
            targetPokemon={augmentTargetPoke || battleLive?.player}
            battle={activeBattle}
            onSelect={handleSelectAugment}
            onClose={handleCloseAugment}
            isTestMode={testmode}
            isTitanSelection={isTitanSelection}
          />
        )}
        {isAugmentStatusOpen && <AugmentStatusModal battle={battle} initialPokemon={augmentStatusInitialPoke} onClose={closeAugmentStatus} />}
        {isAugmentCarryModalOpen && (
          <AugmentCarryoverModal
            battle={battle}
            round={location.state?.round || defaultOption.round}
            onConfirm={handleCarryoverConfirm}
          />
        )}
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
