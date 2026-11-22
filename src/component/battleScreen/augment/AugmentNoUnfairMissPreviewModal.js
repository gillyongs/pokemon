import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { AugmentIcon } from "./AugmentIcon";

const getSkillCategory = (skill) => {
  if (skill.category) return skill.category;
  if (skill.stype === "atk" || skill.stype === "atk물리특수") return "물리";
  if (skill.stype === "catk") return "특수";
  return "변화";
};

const AugmentNoUnfairMissPreviewModal = ({ pokemon, battle, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // 현재 포켓몬이 장착 중인 기술 중 대상 기술 (명중률 80~99)
  const equippedTargetSkills = useMemo(() => {
    if (!pokemon || !pokemon.skill) return [];
    return [1, 2, 3, 4].map((slot) => pokemon.skill[slot]).filter((s) => s && typeof s.accur === "number" && s.accur >= 80 && s.accur <= 99);
  }, [pokemon]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <ModalHeader>
          <ModalHeaderTop>
            <ModalTitle>
              <AugmentIcon id="noUnfairMiss" size={30} />
              <TitleText>억까 방지 상세정보</TitleText>
            </ModalTitle>
            <CloseButton type="button" onClick={onClose} title="닫기">
              ✕
            </CloseButton>
          </ModalHeaderTop>
          <NoticeBanner>명중률이 80 이상인 기술이 빗나가지 않습니다.</NoticeBanner>
        </ModalHeader>

        {/* 현재 포켓몬 대상 기술 영역 */}
        <ContentArea>
          <SectionHeaderRow>
            <SectionTitle>
              {pokemon ? (
                <>
                  현재 <span style={{ color: "#64ffda" }}>{pokemon.name}</span>의 대상 기술
                </>
              ) : (
                "현재 포켓몬의 대상 기술"
              )}
            </SectionTitle>
            <CountBadge $highlight={equippedTargetSkills.length > 0}>{equippedTargetSkills.length > 0 ? `${equippedTargetSkills.length}개 기술 적용` : "적용 대상 없음"}</CountBadge>
          </SectionHeaderRow>

          {equippedTargetSkills.length > 0 ? (
            <SkillListContainer>
              {equippedTargetSkills.map((sk, idx) => {
                const cat = getSkillCategory(sk);
                const desc = sk.originText || sk.text || "기술 설명이 없습니다.";
                return (
                  <SkillDetailCard key={sk.name || idx}>
                    <CardTopRow>
                      <SkillTypeImg src={`/pokemon/img/type/${sk.type}.svg`} alt={sk.type} />
                      <SkillName>{sk.name}</SkillName>
                      <CategoryBadge $category={cat}>{cat}</CategoryBadge>
                    </CardTopRow>

                    <SkillStatsRow>
                      <StatItem>
                        위력 <strong>{sk.power || "-"}</strong>
                      </StatItem>
                      <StatDot>•</StatDot>
                      <StatItem>
                        명중 <strong>{sk.accur}</strong>
                      </StatItem>
                    </SkillStatsRow>
                  </SkillDetailCard>
                );
              })}
            </SkillListContainer>
          ) : (
            <NoEquippedNotice>현재 장착 중인 기술 중 명중률 80% ~ 99%인 대상 기술이 없습니다.</NoEquippedNotice>
          )}
        </ContentArea>

        {/* 하단 닫기 버튼 */}
        <ModalFooter>
          <CloseActionButton type="button" onClick={onClose}>
            닫기
          </CloseActionButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentNoUnfairMissPreviewModal;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.78);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  animation: fadeIn 0.18s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: #0f172a;
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-radius: 14px;
  width: 90%;
  max-width: 440px;
  max-height: 85vh;
  padding: 16px 18px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(100, 255, 218, 0.1);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;

  @keyframes popIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  flex-shrink: 0;
  margin-bottom: 12px;
`;

const ModalHeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TitleText = styled.h4`
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
  color: #64ffda;
  letter-spacing: 0.5px;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const NoticeBanner = styled.div`
  background: rgba(100, 255, 218, 0.08);
  border: 1px solid rgba(100, 255, 218, 0.25);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.45;
  word-break: keep-all;
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
`;

const SectionTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CountBadge = styled.span`
  font-size: 0.74rem;
  padding: 2px 8px;
  border-radius: 10px;
  background: ${(props) => (props.$highlight ? "rgba(100, 255, 218, 0.2)" : "rgba(255, 255, 255, 0.08)")};
  color: ${(props) => (props.$highlight ? "#64ffda" : "#94a3b8")};
  font-weight: ${(props) => (props.$highlight ? "700" : "500")};
  border: 1px solid ${(props) => (props.$highlight ? "rgba(100, 255, 218, 0.35)" : "transparent")};
`;

const SkillListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkillDetailCard = styled.div`
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const CardTopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`;

const SkillTypeImg = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const SkillName = styled.span`
  font-weight: 700;
  font-size: 0.92rem;
  color: #f8fafc;
`;

const CategoryBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1.5px 5px;
  border-radius: 4px;
  color: white;
  background-color: ${(props) => (props.$category === "물리" ? "#e74c3c" : props.$category === "특수" ? "#3498db" : "#64748b")};
  flex-shrink: 0;
`;

const AppliedBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1.5px 6px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.25);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.45);
  margin-left: auto;
  flex-shrink: 0;
`;

const SkillStatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #94a3b8;
`;

const StatItem = styled.span`
  strong {
    color: #e2e8f0;
  }
  s {
    color: #64748b;
  }
`;

const AccurHighlight = styled.span`
  color: #64ffda;
  font-weight: 800;
`;

const StatDot = styled.span`
  color: #475569;
`;

const SkillDescText = styled.div`
  font-size: 0.8rem;
  color: #cbd5e1;
  line-height: 1.45;
  background: rgba(2, 6, 23, 0.5);
  border-radius: 6px;
  padding: 6px 9px;
  word-break: keep-all;
`;

const NoEquippedNotice = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px 12px;
  font-size: 0.82rem;
  color: #94a3b8;
  text-align: center;
  line-height: 1.5;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  flex-shrink: 0;
`;

const CloseActionButton = styled.button`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 7px 22px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }
`;
