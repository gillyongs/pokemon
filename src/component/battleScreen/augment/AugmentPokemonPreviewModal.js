import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { abilObject } from "../../../entity/Ability";
import { itemText } from "../../../entity/Item";
import { TYPE_COLORS } from "../../../calc/typeEffectCalculate";
import { skillTypeCalculate } from "../../../calc/skillTypeCalculate";

const isOnlyPrioritySkillText = (text) => {
  if (!text || typeof text !== "string") return false;
  return /^우선도\s*[+-]?\d+\.?$/i.test(text.trim());
};

const getDefaultInfoText = (pokemon) => {
  if (pokemon?.tip && pokemon.tip.trim() !== "") {
    return `[TIP] ${pokemon.tip}`;
  }
  return "특성, 지닌물건, 기술을 클릭하면 설명이 나옵니다.";
};

const PreviewHexagonGraph = ({ hp, stat }) => {
  const MAX_STAT = 250;
  const width = 140;
  const height = 140;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 42;

  const order = ["hp", "atk", "def", "speed", "cdef", "catk"];
  const angles = order.map((_, i) => (i * 60 - 90) * (Math.PI / 180));

  const getVal = (key) => (key === "hp" ? (hp ?? 0) : (stat?.[key] ?? 0));

  const points = order.map((key, i) => {
    const val = getVal(key);
    const r = (Math.min(val, MAX_STAT) / MAX_STAT) * maxRadius;
    return {
      x: cx + r * Math.cos(angles[i]),
      y: cy + r * Math.sin(angles[i]),
    };
  });
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const bgPolygons = [1, 0.66, 0.33].map((scale) =>
    order
      .map((_, i) => {
        const x = cx + maxRadius * scale * Math.cos(angles[i]);
        const y = cy + maxRadius * scale * Math.sin(angles[i]);
        return `${x},${y}`;
      })
      .join(" ")
  );

  const labels = { hp: "HP", atk: "공격", def: "방어", speed: "스피드", cdef: "특방", catk: "특공" };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", maxWidth: `${width}px`, maxHeight: `${height}px` }}>
      {bgPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + maxRadius * Math.cos(a)} y2={cy + maxRadius * Math.sin(a)} stroke="rgba(255, 255, 255, 0.16)" strokeWidth="1" />
      ))}
      <polygon points={polygonPoints} fill="rgba(100, 255, 218, 0.4)" stroke="#64ffda" strokeWidth="2" />
      {order.map((key, i) => {
        const labelR = maxRadius + 16;
        const x = cx + labelR * Math.cos(angles[i]);
        const y = cy + labelR * Math.sin(angles[i]);
        return (
          <text key={key} x={x} y={y} fill="#cbd5e1" fontSize="9.5" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
            {labels[key]}
          </text>
        );
      })}
    </svg>
  );
};

const AugmentPokemonPreviewModal = ({ augmentId = null, pokemon, onClose }) => {
  const hasMegaForm = Boolean(pokemon?.megaData);
  const [showMegaForm, setShowMegaForm] = useState(hasMegaForm);
  const [infoText, setInfoText] = useState(() => getDefaultInfoText(pokemon));

  useEffect(() => {
    setShowMegaForm(Boolean(pokemon?.megaData));
    setInfoText(getDefaultInfoText(pokemon));
  }, [pokemon, augmentId]);

  if (!pokemon) return null;

  const isMegaView = hasMegaForm && showMegaForm;
  const displayName = isMegaView ? pokemon.megaData.name : pokemon.name;
  const displayPokemonId = isMegaView ? pokemon.megaData.pokemon_id : pokemon.img_id || pokemon.pokemon_id;
  const displayType1 = isMegaView ? pokemon.megaData.type1 : pokemon.type1;
  const displayType2 = isMegaView ? pokemon.megaData.type2 : pokemon.type2;
  const displayAbil = isMegaView ? pokemon.megaData.abil : pokemon.abil;
  const displayHp = pokemon.hp;
  const displayStat = (isMegaView ? pokemon.megaData.stat : pokemon.stat) || {};
  const displayItem = pokemon.item;
  const skills = [1, 2, 3, 4].map((num) => pokemon.skill?.[num]).filter((s) => s && s.name);

  const handleAbilClick = (e) => {
    e.stopPropagation();
    const desc = abilObject[displayAbil]?.text || (!isMegaView && pokemon.abilObj?.text) || "특성 설명이 없습니다.";
    setInfoText(`[${displayAbil}] ${desc}`);
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (!displayItem) {
      setInfoText("지닌 아이템이 없습니다.");
      return;
    }
    const desc = itemText[displayItem] || pokemon.itemText || "아이템 설명이 없습니다.";
    setInfoText(`[${displayItem}] ${desc}`);
  };

  const handleSkillClick = (e, skill) => {
    e.stopPropagation();
    const isOnlyPriority = isOnlyPrioritySkillText(skill.text);
    const desc = isOnlyPriority || !skill.text ? "설명이 없습니다." : skill.text;
    setInfoText(`[${skill.name}] ${desc}`);
  };

  return (
    <ModalOverlay
      onClick={(e) => {
        e.stopPropagation();
        if (onClose) onClose();
      }}
    >
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderArea>
          <HeaderTopRow>
            <Title>{displayName} 정보</Title>
            <CloseButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onClose) onClose();
              }}
              aria-label="닫기"
              title="닫기"
            >
              ✕
            </CloseButton>
          </HeaderTopRow>
        </HeaderArea>

        {hasMegaForm && (
          <FormToggleRow>
            <FormToggleButton
              type="button"
              $active={showMegaForm}
              onClick={(e) => {
                e.stopPropagation();
                setShowMegaForm(true);
              }}
            >
              메가플라이곤 (메가진화)
            </FormToggleButton>
            <FormToggleButton
              type="button"
              $active={!showMegaForm}
              onClick={(e) => {
                e.stopPropagation();
                setShowMegaForm(false);
              }}
            >
              플라이곤 (진화 전)
            </FormToggleButton>
          </FormToggleRow>
        )}

        <TopProfileRow>
          <SpriteBox>
            <SpriteImg
              src={`/pokemon/img/pokemon/${displayPokemonId}.webp`}
              alt={displayName}
              onError={(e) => {
                e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
              }}
            />
          </SpriteBox>

          <MetaCol>
            <NameRow>
              <PokemonName>{displayName}</PokemonName>
              {isMegaView && <MegaIcon src="/pokemon/img/background/mega.webp" alt="mega" />}
            </NameRow>

            <MetaRow>
              <MetaLabel>타입:</MetaLabel>
              <TypeBadge $type={displayType1}>{displayType1}</TypeBadge>
              {displayType2 && <TypeBadge $type={displayType2}>{displayType2}</TypeBadge>}
            </MetaRow>

            <MetaRow>
              <MetaLabel>특성:</MetaLabel>
              <ClickableBadge type="button" onClick={handleAbilClick}>
                {displayAbil}
              </ClickableBadge>
            </MetaRow>

            <MetaRow>
              <MetaLabel>도구:</MetaLabel>
              <ClickableBadge type="button" onClick={handleItemClick}>
                {displayItem || "없음"}
              </ClickableBadge>
            </MetaRow>
          </MetaCol>
        </TopProfileRow>

        <SectionDivider />

        <StatsRow>
          <GraphWrap>
            <PreviewHexagonGraph hp={displayHp} stat={displayStat} />
          </GraphWrap>
          <StatGrid>
            <StatItem>
              <StatLabel>HP:</StatLabel> <StatVal>{displayHp}</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>스피드:</StatLabel> <StatVal>{displayStat.speed ?? 0}</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>공격:</StatLabel> <StatVal>{displayStat.atk ?? 0}</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>특수공격:</StatLabel> <StatVal>{displayStat.catk ?? 0}</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>방어:</StatLabel> <StatVal>{displayStat.def ?? 0}</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>특수방어:</StatLabel> <StatVal>{displayStat.cdef ?? 0}</StatVal>
            </StatItem>
          </StatGrid>
        </StatsRow>

        <SkillsGrid>
          {skills.map((skill, idx) => {
            const displayType = skillTypeCalculate(null, skill, { abil: displayAbil });
            return (
              <SkillCardButton key={skill.name || idx} type="button" onClick={(e) => handleSkillClick(e, skill)}>
                <SkillIcon
                  src={`/pokemon/img/type/${displayType}.svg`}
                  alt={displayType}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <SkillMetaCol>
                  <SkillNameText>
                    {skill.name}
                    {skill.nimbleMoves ? " +1" : ""}
                  </SkillNameText>
                  <SkillPpText>
                    PP {skill.pp}/{skill.pp}
                  </SkillPpText>
                </SkillMetaCol>
              </SkillCardButton>
            );
          })}
        </SkillsGrid>

        <InfoBox>{infoText}</InfoBox>

        <ButtonGroup>
          <CloseActionButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
          >
            닫기
          </CloseActionButton>
        </ButtonGroup>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentPokemonPreviewModal;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10015;
  animation: ${fadeIn} 0.18s ease-out;
  padding: 14px;
  box-sizing: border-box;
  cursor: pointer;

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 16px 16px 14px;
  width: 100%;
  max-width: 440px;
  max-height: 92vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.88);
  position: relative;
  box-sizing: border-box;
  cursor: default;
  color: #e2e8f0;

  @media (max-width: 480px) {
    padding: 14px 12px 12px;
    width: 96%;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64ffda, #38bdf8, #64ffda);
  }
`;

const HeaderArea = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.08rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.3px;
`;

const CloseButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 0;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }
`;

const FormToggleRow = styled.div`
  display: flex;
  gap: 6px;
  width: 100%;
  margin-bottom: 10px;
`;

const FormToggleButton = styled.button`
  flex: 1;
  padding: 6px 8px;
  border-radius: 7px;
  font-size: 0.78rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${(props) => (props.$active ? "rgba(20, 48, 64, 0.95)" : "rgba(255, 255, 255, 0.05)")};
  border: ${(props) => (props.$active ? "1.5px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.14)")};
  color: ${(props) => (props.$active ? "#64ffda" : "#94a3b8")};
  box-shadow: ${(props) => (props.$active ? "0 0 10px rgba(100, 255, 218, 0.22)" : "none")};

  &:hover {
    border-color: #64ffda;
    color: #ffffff;
  }
`;

const NoticeBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #bae6fd;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.35;
  text-align: left;
  word-break: keep-all;
`;

const TopProfileRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 12px;
  width: 100%;
`;

const SpriteBox = styled.div`
  flex: 0 0 92px;
  min-height: 92px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 6px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex: 0 0 82px;
    min-height: 82px;
  }
`;

const SpriteImg = styled.img`
  width: 82px;
  height: 82px;
  object-fit: contain;

  @media (max-width: 480px) {
    width: 72px;
    height: 72px;
  }
`;

const MetaCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  text-align: left;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
`;

const PokemonName = styled.span`
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  white-space: nowrap;
`;

const MegaIcon = styled.img`
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.84rem;
  white-space: nowrap;
  flex-wrap: wrap;
`;

const MetaLabel = styled.span`
  color: #94a3b8;
  width: 38px;
  font-weight: 600;
  flex-shrink: 0;
`;

const TypeBadge = styled.span`
  background-color: ${({ $type }) => TYPE_COLORS[$type] || "#475569"};
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.78rem;
  line-height: 1.3;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
`;

const ClickableBadge = styled.button`
  background-color: rgba(100, 255, 218, 0.14);
  color: #64ffda;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid rgba(100, 255, 218, 0.35);
  transition: all 0.2s ease;
  line-height: 1.25;

  &:hover {
    background-color: rgba(100, 255, 218, 0.26);
    color: #ffffff;
    border-color: #64ffda;
  }
`;

const SectionDivider = styled.hr`
  width: 100%;
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin: 12px 0 10px;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 10px;
`;

const GraphWrap = styled.div`
  flex: 0 0 140px;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 480px) {
    flex: 0 0 128px;
  }
`;

const StatGrid = styled.div`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px 8px;
  text-align: left;
  font-size: 0.83rem;

  @media (max-width: 480px) {
    font-size: 0.76rem;
    gap: 4px 5px;
  }
`;

const StatItem = styled.div`
  white-space: nowrap;
  color: #f8fafc;
`;

const StatLabel = styled.strong`
  color: #94a3b8;
  font-weight: 700;
`;

const StatVal = styled.span`
  font-weight: 700;
  color: #f8fafc;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
  margin-bottom: 10px;
  box-sizing: border-box;
`;

const SkillCardButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 8px 9px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-family: inherit;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #64ffda;
  }
`;

const SkillIcon = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: contain;
  flex-shrink: 0;
`;

const SkillMetaCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const SkillNameText = styled.span`
  font-weight: 700;
  font-size: 0.88rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SkillPpText = styled.span`
  font-size: 0.74rem;
  color: #94a3b8;
  white-space: nowrap;
`;

const InfoBox = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  border-left: 4px solid #64ffda;
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 0.83rem;
  line-height: 1.45;
  color: #f1f5f9;
  min-height: 44px;
  display: flex;
  align-items: center;
  text-align: left;
  word-break: keep-all;
  white-space: pre-wrap;
  width: 100%;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  margin-top: 12px;
`;

const CloseActionButton = styled.button`
  width: 100%;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.16);
    border-color: #64ffda;
    color: #64ffda;
  }
`;
