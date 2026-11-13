import React, { useState } from "react";
import styled from "styled-components";
import { isLegendary } from "../../calc/randomTeam";
import TradeInfoModal from "./TradeInfoModal";

const AfterBattleTradeModal = ({ isOpen, battle, onConfirmTrade, onSkipTrade }) => {
  const [tradePlayerIdx, setTradePlayerIdx] = useState(null);
  const [tradeNpcIdx, setTradeNpcIdx] = useState(null);
  const [tradeInfoPokemon, setTradeInfoPokemon] = useState(null);
  const [tradeAlertMessage, setTradeAlertMessage] = useState(null);

  if (!isOpen || !battle) return null;

  const playerTeamFixed = [battle.player, battle.playerBench1, battle.playerBench2]
    .filter(Boolean)
    .sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));
  const npcTeamFixed = [battle.npc, battle.npcBench1, battle.npcBench2]
    .filter(Boolean)
    .sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0));

  const selectedPlayerPoke = tradePlayerIdx !== null ? playerTeamFixed[tradePlayerIdx] : null;
  const selectedNpcPoke = tradeNpcIdx !== null ? npcTeamFixed[tradeNpcIdx] : null;
  const hasPlayerLegendary = playerTeamFixed.some((p) => isLegendary(p?.origin));
  const canTrade = (playerPoke, npcPoke) =>
    !hasPlayerLegendary || isLegendary(playerPoke?.origin) === isLegendary(npcPoke?.origin);

  const isTradeValid =
    tradePlayerIdx !== null &&
    tradeNpcIdx !== null &&
    canTrade(playerTeamFixed[tradePlayerIdx], npcTeamFixed[tradeNpcIdx]);

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

  const handleSubmit = () => {
    if (!isTradeValid) return;
    onConfirmTrade(tradePlayerIdx, tradeNpcIdx);
  };

  return (
    <ModalOverlay>
      <ModalBox
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "95vw",
          maxWidth: "600px",
          maxHeight: "95vh",
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        <div>
          <ModalTitle $isWin={true} style={{ fontSize: "2.4rem", margin: "10px 0 5px", wordBreak: "keep-all" }}>
            포켓몬 트레이드
          </ModalTitle>
          <div style={{ textAlign: "center", color: "#aaa", fontSize: "0.85rem" }}>
            * 팀 내 초전설 포켓몬은 최대 1마리까지 보유할 수 있습니다.
          </div>
        </div>
        <TradeContainer>
          <TradeColumn>
            <h3 style={{ textAlign: "center", color: "#64ffda", margin: "5px 0" }}>내 엔트리</h3>
            {playerTeamFixed.map((p, idx) => {
              const isDisabled = selectedNpcPoke ? !canTrade(p, selectedNpcPoke) : false;
              return (
                <TradeCard
                  key={idx}
                  $selected={tradePlayerIdx === idx}
                  $disabled={isDisabled}
                  onClick={() => handlePlayerCardClick(idx, p)}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "7vh",
                      overflow: "hidden",
                    }}
                  >
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
              const isDisabled = selectedPlayerPoke ? !canTrade(selectedPlayerPoke, p) : false;
              return (
                <TradeCard
                  key={idx}
                  $selected={tradeNpcIdx === idx}
                  $disabled={isDisabled}
                  onClick={() => handleNpcCardClick(idx, p)}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "7vh",
                      overflow: "hidden",
                    }}
                  >
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
          <ModalButton onClick={onSkipTrade}>건너뛰기</ModalButton>
          <ModalButton
            $primary
            $isWin={true}
            onClick={isTradeValid ? handleSubmit : undefined}
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
            <div style={{ color: "#e0e0e0", fontSize: "1rem", lineHeight: "1.6", wordBreak: "keep-all" }}>
              {tradeAlertMessage}
            </div>
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
};

export default AfterBattleTradeModal;
export { AfterBattleTradeModal, AfterBattleTradeModal as AfterBattleTradeModel };

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
