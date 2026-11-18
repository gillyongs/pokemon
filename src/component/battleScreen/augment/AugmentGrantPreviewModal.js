import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { getAugmentDesc, isPermanentBuff } from "../../../entity/Augment/AugmentData";
import { AUGMENT_LIST } from "../../../entity/Augment/AugmentData";
import AugmentPokemonPreviewModal from "./AugmentPokemonPreviewModal";
import sampleList from "../../../entity/Pokemon/pokemonSampleList";

const AugmentGrantPreviewModal = ({ augmentId, grantInfo, pokemon, battle, onClose }) => {
  const [previewPokemon, setPreviewPokemon] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (previewPokemon) {
          setPreviewPokemon(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, previewPokemon]);

  const grantItems = useMemo(() => {
    if (!grantInfo?.items) return [];
    return grantInfo.items.map((id) => AUGMENT_LIST.find((a) => a.id === id)).filter(Boolean);
  }, [grantInfo]);

  const otherTeammates = useMemo(() => {
    if (!battle && !pokemon) return [];
    const side = pokemon?.team === "npc" ? "npc" : "player";
    const team = battle
      ? (side === "npc"
          ? [battle.npc, battle.npcBench1, battle.npcBench2]
          : [battle.player, battle.playerBench1, battle.playerBench2]
        ).filter(Boolean)
      : [];
    return team.filter((p) => p !== pokemon);
  }, [battle, pokemon]);

  const checkCandidateUnavailable = (cand) => {
    if (!otherTeammates || otherTeammates.length === 0) return false;
    const candDex = cand.dexNo || (cand.imgId ? String(cand.imgId).split("-")[0] : null);
    if (!candDex) return false;
    return otherTeammates.some((p) => {
      const pDex = p?.dexNo || (p?.uniqueKey ? String(p.uniqueKey).split("-")[0] : (p?.id ? String(p.id).split("-")[0] : null));
      return pDex === candDex;
    });
  };

  const hasCandidates = Boolean(grantInfo?.candidates && grantInfo.candidates.length > 0);

  return (
    <>
      <ModalOverlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalHeaderTop>
              <ModalTitle>{grantInfo?.modalTitle || "증강 상세 안내"}</ModalTitle>
              <CloseButton type="button" onClick={onClose} title="닫기">
                ✕
              </CloseButton>
            </ModalHeaderTop>
            <ModalNotice>
              {hasCandidates
                ? (grantInfo?.headerNotice || "다음 포켓몬 중 1마리와 교체됩니다.")
                : (grantInfo?.headerNotice || "해당 증강 선택 시 아래 효과를 추가로 획득합니다.")}
            </ModalNotice>
          </ModalHeader>

          {/* 1. 포켓몬 목록 (상단 배치) */}
          {hasCandidates && (
            <CandidatesSection>
              <CandidatesGrid $count={grantInfo.candidates.length}>
                {grantInfo.candidates.map((cand, idx) => {
                  const isUnavailable = checkCandidateUnavailable(cand);
                  return (
                    <CandidateCard
                      key={cand.sampleName || idx}
                      type="button"
                      $isUnavailable={isUnavailable}
                      onClick={() => {
                        const sample = sampleList.getDataBySampleName(cand.sampleName || cand.name);
                        if (sample) setPreviewPokemon(sample);
                      }}
                      title={
                        isUnavailable
                          ? `${cand.name} (팀 내 동일 포켓몬 보유로 획득 불가 - 클릭 시 상세정보 확인)`
                          : `${cand.name} 상세정보 보기`
                      }
                    >
                      <CandidateImgWrapper>
                        <CandidateImg
                          src={`/pokemon/img/pokemon/${cand.imgId}.webp`}
                          alt={cand.name}
                          $isUnavailable={isUnavailable}
                          onError={(e) => {
                            if (!e.currentTarget.src.endsWith(`/img/pokemon/${cand.imgId}.webp`)) {
                              e.currentTarget.src = `/img/pokemon/${cand.imgId}.webp`;
                            } else {
                              e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
                            }
                          }}
                        />
                      </CandidateImgWrapper>
                      <CandidateName $isUnavailable={isUnavailable}>{cand.name}</CandidateName>
                      {isUnavailable ? (
                        <UnavailableBadge>획득 불가</UnavailableBadge>
                      ) : (
                        <CandidatePreviewBadge>상세보기</CandidatePreviewBadge>
                      )}
                    </CandidateCard>
                  );
                })}
              </CandidatesGrid>
            </CandidatesSection>
          )}

          {/* 2. 버프 및 추가 효과 목록 (하단 배치) */}
          {grantItems.length > 0 && (
            <EffectSection>
              {hasCandidates && <EffectSectionTitle>추가 획득 효과</EffectSectionTitle>}
              <AugList>
                {grantItems.map((item, idx) => {
                  const isBuff = Boolean(item.buf);
                  const descText = getAugmentDesc(item, pokemon, battle);
                  return (
                    <AugCard key={item.id || idx} $isBuff={isBuff}>
                      <IconCol>
                        <AugmentIcon id={item.id} size={40} />
                        {!isBuff && item.cost !== "-" && item.cost !== undefined && <CostTag>{item.cost} cost</CostTag>}
                      </IconCol>
                      <AugMeta>
                        <AugNameRow>
                          <AugName>{item.name}</AugName>
                          <CategoryBadge $isBuff={isBuff}>{isPermanentBuff(item) ? "영구 버프" : isBuff ? "버프" : "추가 증강"}</CategoryBadge>
                        </AugNameRow>
                        <AugDesc>{descText}</AugDesc>
                      </AugMeta>
                    </AugCard>
                  );
                })}
              </AugList>
            </EffectSection>
          )}

          <ModalFooter>
            <ConfirmBtn type="button" onClick={onClose}>
              확인
            </ConfirmBtn>
          </ModalFooter>
        </ModalContainer>
      </ModalOverlay>

      {previewPokemon && (
        <AugmentPokemonPreviewModal
          augmentId={augmentId}
          pokemon={previewPokemon}
          onClose={() => setPreviewPokemon(null)}
        />
      )}
    </>
  );
};

export default AugmentGrantPreviewModal;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.78);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  animation: fadeInOverlay 0.2s ease-out;

  @keyframes fadeInOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: #111827;
  border: 1px solid #374151;
  border-radius: 14px;
  width: 90%;
  max-width: 440px;
  padding: 14px 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  overflow-y: auto;
  box-sizing: border-box;
  animation: popInModal 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes popInModal {
    from {
      transform: scale(0.94);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 8px;
`;

const ModalHeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 800;
  color: #64ffda;
  display: flex;
  align-items: center;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalNotice = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.35;
  word-break: keep-all;
  text-align: left;
`;

const CandidatesSection = styled.div`
  margin-top: 4px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
`;

const CandidatesGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.$count === 4 ? "repeat(4, 1fr)" : "repeat(3, 1fr)")};
  gap: 8px;

  @media (max-width: 380px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const CandidateCard = styled.button`
  background: ${(props) => (props.$isUnavailable ? "rgba(20, 24, 33, 0.75)" : "rgba(30, 41, 59, 0.85)")};
  border: 1px solid ${(props) => (props.$isUnavailable ? "rgba(239, 68, 68, 0.35)" : "rgba(100, 255, 218, 0.25)")};
  border-radius: 8px;
  padding: 6px 4px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: all 0.18s ease;
  position: relative;
  opacity: ${(props) => (props.$isUnavailable ? 0.65 : 1)};

  &:hover {
    background: ${(props) => (props.$isUnavailable ? "rgba(35, 25, 30, 0.9)" : "rgba(45, 60, 85, 0.95)")};
    border-color: ${(props) => (props.$isUnavailable ? "#f87171" : "#64ffda")};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${(props) => (props.$isUnavailable ? "rgba(239, 68, 68, 0.18)" : "rgba(100, 255, 218, 0.15)")};
  }

  &:active {
    transform: translateY(0);
  }
`;

const CandidateImgWrapper = styled.div`
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CandidateImg = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: ${(props) => (props.$isUnavailable ? "grayscale(0.6) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6))" : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))")};
`;

const CandidateName = styled.span`
  font-size: 0.78rem;
  font-weight: 800;
  color: ${(props) => (props.$isUnavailable ? "#94a3b8" : "#f1f5f9")};
  white-space: nowrap;
`;

const CandidatePreviewBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.12);
  border: 1px solid rgba(100, 255, 218, 0.3);
  border-radius: 3px;
  padding: 1px 4px;
`;

const UnavailableBadge = styled.span`
  font-size: 0.62rem;
  font-weight: 700;
  color: #f87171;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.45);
  border-radius: 3px;
  padding: 1px 4px;
`;

const EffectSection = styled.div`
  margin-top: 2px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EffectSectionTitle = styled.h5`
  margin: 0;
  font-size: 0.82rem;
  font-weight: 700;
  color: #94a3b8;
  text-align: left;
`;

const AugList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
`;

const AugCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: ${(props) => (props.$isBuff ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)" : "rgba(30, 41, 59, 0.85)")};
  border: 1px solid ${(props) => (props.$isBuff ? "rgba(100, 255, 218, 0.35)" : "#334155")};
  border-radius: 10px;
  box-shadow: ${(props) => (props.$isBuff ? "0 0 10px rgba(100, 255, 218, 0.08)" : "none")};
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const CostTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.12);
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
`;

const AugMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const AugNameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
`;

const AugName = styled.span`
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  word-break: keep-all;
`;

const CategoryBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  ${(props) =>
    props.$isBuff
      ? `
    background: rgba(254, 240, 138, 0.18);
    color: #fef08a;
    border: 1px solid rgba(254, 240, 138, 0.5);
  `
      : `
    background: rgba(100, 255, 218, 0.16);
    color: #64ffda;
    border: 1px solid rgba(100, 255, 218, 0.45);
  `}
`;

const AugDesc = styled.p`
  margin: 0;
  font-size: 0.76rem;
  color: #94a3b8;
  line-height: 1.35;
  white-space: pre-line;
  word-break: keep-all;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConfirmBtn = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 7px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
