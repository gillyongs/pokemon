import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./Main.css";
import { createBattle } from "../entity/Battle";
import { defaultOption } from "../config/defaultOption";
import TradeInfoModal from "../component/TradeInfoModal";
import { useQueue } from "../util/useQueue";

import PokemonInfo from "../component/Top/PokemonInfo";
import PokemonImage from "../component/Top/PokemonImage";
import ItemImage from "../component/Top/ItemImage";
import BottomSectionSkill from "../component/Bottom/Bottom-Skill/Bottom-Skill";
import BottomSectionSwitch from "../component/Bottom/Bottom-Switch/Bottom-Switch";
import BottomSectionInfo from "../component/Bottom/Bottom-info/Bottom-Info";
import BottomSectionField from "../component/Bottom/Bottom-field/Bottom-Field";
import { speedCheck } from "../util/speedCheck";
import { useLocation, useNavigate } from "react-router-dom";
import { battleStart } from "../service/battleStart";
import { npcChoice } from "../npc/npc";
import { cloneWithMethods } from "../util/cloneWithMethods";
import { applyAbilityEffects } from "../entity/Ability";
import { pokemonList } from "../entity/Pokemon/PokemonTemplate";

const Battle = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const battleOrigin = createBattle(["갸라도스", "어써러셔", "어써러셔"], ["코터스", "어써러셔", "어써러셔"]);
  const battleObj = useRef(battleOrigin);
  const [battle, setBattle] = useState(battleOrigin);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradePlayerIdx, setTradePlayerIdx] = useState(null);
  const [tradeNpcIdx, setTradeNpcIdx] = useState(null);
  const [tradeInfoPokemon, setTradeInfoPokemon] = useState(null);
  const [isRoundOptionsOpen, setIsRoundOptionsOpen] = useState(false);
  //개발용 배틀 객체.
  const [text, setText] = useState("");
  //화면에 보여질 텍스트 전역변수
  const { queueObject } = useQueue();
  //게임 진행용 큐 전역변수
  const [bottom, setBottom] = useState("skill");

  const [gameResult, setGameResult] = useState(null); // "win" | "lose" | null

  const getRandomTeam = (size = 3) => {
    let team = [];
    while (team.length < size) {
      const randomId = pokemonList[Math.floor(Math.random() * pokemonList.length)];
      if (!team.includes(randomId)) {
        team.push(randomId);
      }
    }
    return team;
  };

  const handleRestart = () => {
    setGameResult(null);
    queueObject.initQueue();
    const { team1, team2, isNew, difficulty, teamOption, round } = location.state || {};
    navigate("/battle", { state: { team1, team2, isNew: true, difficulty, teamOption, round }, replace: true });
  };

  const handleNextRound = () => {
    const { teamOption = defaultOption.teamOption } = location.state || {};
    if (teamOption === "트레이드" && !isTradeModalOpen) {
      setIsTradeModalOpen(true);
      return;
    }
    proceedNextRound();
  };

  const proceedNextRound = (customTeam1 = null) => {
    setGameResult(null);
    setIsTradeModalOpen(false);
    queueObject.initQueue();
    const { team1, difficulty = defaultOption.difficulty, teamOption = defaultOption.teamOption, round = defaultOption.round } = location.state || {};

    let nextTeam1 = customTeam1 ? customTeam1 : [...team1];
    if (!customTeam1 && teamOption === "랜덤") {
      nextTeam1 = getRandomTeam(3);
    }

    const nextTeam2 = getRandomTeam(3);
    navigate("/battle", { state: { team1: nextTeam1, team2: nextTeam2, isNew: true, difficulty, teamOption, round: round + 1 }, replace: true });
  };

  const submitTrade = () => {
    if (tradePlayerIdx === null || tradeNpcIdx === null) return;
    const { team1 } = location.state || {};
    let nextTeam1 = [...team1];
    const npcTeamFixed = [battle.npc, battle.npcBench1, battle.npcBench2].sort((a, b) => a.originalIndex - b.originalIndex);
    const npcIds = npcTeamFixed.map(p => p.id);
    nextTeam1[tradePlayerIdx] = npcIds[tradeNpcIdx];
    proceedNextRound(nextTeam1);
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

  let screenFix = false;
  useEffect(() => {
    let { team1, team2 } = location.state || {}; // 랜덤 battleObject 가져오기
    screenFix = true;
    queueObject.initQueue();
    setBottom("skill");
    setBench(null);
    const testMode = false;
    if (!testMode && team1 && team2) {
      // battleObj.current = battleObject;
      // setBattle(battleObject); // 상태 업데이트
      battleObj.current = createBattle(team1, team2);
    } else {
      battleObj.current = createBattle(["달투곰", "가이오가", "미라이돈"], ["흑마렉스", "고릴타", "고릴타"]);
    }
    queueObject.enqueue({ battle: battleObj.current, text: "배틀시작!" });
    const fastUser = speedCheck(battleObj.current);
    const slowUser = fastUser === "player" ? "npc" : "player";
    applyAbilityEffects(battleObj.current, fastUser, queueObject.enqueue);
    applyAbilityEffects(battleObj.current, slowUser, queueObject.enqueue);
  }, [location.state]); // location.state가 변경될 때 실행

  useEffect(() => {
    const queue = queueObject.queue;
    if (queue[0]) {
      if (queue[0].isTurnLog) {
        queueObject.dequeue();
        return;
      }
      battleObj.current = cloneWithMethods(queue[0].battle);
      setBattle(queue[0].battle);
      setText(queue[0].text);
      console.log(queue);
      const player = queue[0].battle.player;
      const turnEnd = queue[0].battle.turn.turnEnd;
      let gameEnd = false;
      if (player.faint && turnEnd && !screenFix) {
        // 겜 다시시작할때 자꾸 실행되길래 막을려고 screenFix 추가함
        setBottom("mustSwitch");
      }

      if (queue[0].battle.turn.uturn) {
        setBottom("uturn");
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
      if (battle.player.auto || battle.player.charge) {
        battleStart(battleObj.current, battle.player.autoSN, npcChoice(battle, battle.player.autoSN), queueObject);
      } else {
        setText(battle.player.origin.names + " 무엇을 할까?");
      }
    }
  }, [queueObject.queue]);

  const handleDequeue = () => {
    if (queueObject.queue.length > 0) {
      if (battle.turn.textFreeze) {
        return;
      }
      screenFix = false;
      queueObject.dequeue();
    }
  };

  const battleStartBySkillButton = (skillIndex) => {
    battleStart(battleObj.current, skillIndex, npcChoice(battle, skillIndex), queueObject);
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

      const condition1 = playerFaint && turnEnd && !screenFix;
      const condition2 = b.turn.uturn;
      const condition3 = npcFaint && npcFaint1 && npcFaint2;
      const condition4 = playerFaint && playerFaint1 && playerFaint2;

      // 교체 선택 화면(mustSwitch/uturn)에서 멈추는 경우, 해당 항목은 큐에 남겨둔다.
      // (일반 흐름처럼 Bottom-Switch의 handleSwitch가 직접 dequeue 한다)
      const keepInQueue = (condition1 || condition2) && !condition3 && !condition4;
      if (!keepInQueue) queueObject.dequeue();

      if (condition1 || condition2 || condition3 || condition4 || q.length === 0) {
        // 조건 만족 or 마지막 queue 도달
        found = cur;
        break;
      }
    }

    const last = found;

    // battle/text 반영
    battleObj.current = cloneWithMethods(last.battle);
    setBattle(last.battle);
    setText(last.text);
    // ----- 이후 UI 처리 -----
    if (last.battle.player.faint && last.battle.turn.turnEnd && !screenFix) {
      setBottom("mustSwitch");
    }
    if (last.battle.turn.uturn) {
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
            }}>
            Round {location.state?.round || defaultOption.round}
          </RoundIndicator>
          {isRoundOptionsOpen && (
            <ModalOverlay
              onClick={(e) => {
                e.stopPropagation();
                setIsRoundOptionsOpen(false);
              }}
              style={{ zIndex: 1100, backgroundColor: "rgba(0,0,0,0.5)" }}>
              <ModalBox onClick={(e) => e.stopPropagation()} style={{ width: "300px", padding: "20px" }}>
                <h3 style={{ color: "#fff", marginBottom: "20px", marginTop: "0" }}>현재 게임 옵션</h3>
                <div style={{ color: "#ddd", textAlign: "left", lineHeight: "1.8", fontSize: "1.1rem" }}>
                  <p>
                    <strong>난이도:</strong> {location.state?.difficulty || defaultOption.difficulty}
                    {(() => {
                      const difficulty = location.state?.difficulty || defaultOption.difficulty;
                      const round = location.state?.round || defaultOption.round;
                      const multiplier = (1.0 + (round - 1) * 0.1).toFixed(1); // PokemonInstance의 배율 공식과 동일
                      if (difficulty === "노말") return ` (상대 포켓몬 HP 배율 ${multiplier}배)`;
                      if (difficulty === "하드") return ` (상대 포켓몬 능력치 배율 ${multiplier}배)`;
                      return "";
                    })()}
                  </p>
                  <p>
                    <strong>팀 옵션:</strong> {location.state?.teamOption || defaultOption.teamOption}
                  </p>
                </div>
                <ModalButtonContainer style={{ marginTop: "20px" }}>
                  <ModalButton
                    $primary
                    $isWin={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsRoundOptionsOpen(false);
                    }}>
                    닫기
                  </ModalButton>
                </ModalButtonContainer>
              </ModalBox>
            </ModalOverlay>
          )}
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
          {bottom === "field" && <BottomSectionField battle={battle} text={text} bottom={bottom} setBottom={setBottom} setBench={setBench} queueObject={queueObject} setText={setText} btObj={battleObj.current} />}
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
                  }}>
                  메인으로
                </ModalButton>
                {gameResult === "win" && (
                  <ModalButton
                    $primary
                    $isWin={gameResult === "win"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextRound();
                    }}>
                    다음 라운드
                  </ModalButton>
                )}
              </ModalButtonContainer>
            </ModalBox>
          </ModalOverlay>
        )}

        {isTradeModalOpen && (
          <ModalOverlay>
            <ModalBox onClick={(e) => e.stopPropagation()} style={{ width: "95vw", maxWidth: "600px", maxHeight: "95vh", padding: "15px", display: "flex", flexDirection: "column", gap: "15px", justifyContent: "center", boxSizing: "border-box" }}>
              <ModalTitle $isWin={true} style={{ fontSize: "2.4rem", margin: "10px 0", wordBreak: "keep-all" }}>
                포켓몬 트레이드
              </ModalTitle>
              <TradeContainer>
                <TradeColumn>
                  <h3 style={{ textAlign: "center", color: "#64ffda", margin: "5px 0" }}>내 엔트리</h3>
                  {[battle.player, battle.playerBench1, battle.playerBench2].sort((a, b) => a.originalIndex - b.originalIndex).map((p, idx) => (
                    <TradeCard key={idx} $selected={tradePlayerIdx === idx} onClick={() => setTradePlayerIdx(tradePlayerIdx === idx ? null : idx)}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "7vh", overflow: "hidden" }}>
                        <TradeCardImage src={`/pokemon/img/pokemon/${p.origin.pokemon_id}.webp`} />
                        <TradeCardName>{p.origin.name}</TradeCardName>
                      </div>
                      <TradeInfoButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTradeInfoPokemon(p);
                        }}>
                        상세정보
                      </TradeInfoButton>
                    </TradeCard>
                  ))}
                </TradeColumn>
                <TradeColumn>
                  <h3 style={{ textAlign: "center", color: "#ff5252", margin: "5px 0" }}>상대 엔트리</h3>
                  {[battle.npc, battle.npcBench1, battle.npcBench2].sort((a, b) => a.originalIndex - b.originalIndex).map((p, idx) => (
                    <TradeCard key={idx} $selected={tradeNpcIdx === idx} onClick={() => setTradeNpcIdx(tradeNpcIdx === idx ? null : idx)}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "7vh", overflow: "hidden" }}>
                        <TradeCardImage src={`/pokemon/img/pokemon/${p.origin.pokemon_id}.webp`} />
                        <TradeCardName>{p.origin.name}</TradeCardName>
                      </div>
                      <TradeInfoButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setTradeInfoPokemon(p);
                        }}>
                        상세정보
                      </TradeInfoButton>
                    </TradeCard>
                  ))}
                </TradeColumn>
              </TradeContainer>
              <ModalButtonContainer>
                <ModalButton onClick={() => proceedNextRound()}>건너뛰기</ModalButton>
                <ModalButton
                  $primary
                  $isWin={true}
                  onClick={tradePlayerIdx !== null && tradeNpcIdx !== null ? submitTrade : undefined}
                  style={{
                    backgroundColor: tradePlayerIdx !== null && tradeNpcIdx !== null ? "rgba(100, 255, 218, 0.1)" : "rgba(128, 128, 128, 0.1)",
                    color: tradePlayerIdx !== null && tradeNpcIdx !== null ? "#64ffda" : "#888",
                    borderColor: tradePlayerIdx !== null && tradeNpcIdx !== null ? "rgba(100, 255, 218, 0.5)" : "rgba(128, 128, 128, 0.5)",
                    cursor: tradePlayerIdx !== null && tradeNpcIdx !== null ? "pointer" : "not-allowed",
                  }}>
                  교환 및 진행
                </ModalButton>
              </ModalButtonContainer>
            </ModalBox>
            {tradeInfoPokemon && <TradeInfoModal pokemon={tradeInfoPokemon} onClose={() => setTradeInfoPokemon(null)} />}
          </ModalOverlay>
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
  cursor: pointer;
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

export default Battle;
