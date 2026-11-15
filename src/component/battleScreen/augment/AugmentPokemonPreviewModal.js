import React, { useState, useEffect, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { abilObject } from "../../../entity/Ability";
import { itemText } from "../../../entity/Item";
import { TYPE_COLORS } from "../../../calc/typeEffectCalculate";
import { skillTypeCalculate } from "../../../calc/skillTypeCalculate";
import { AugmentIcon } from "./AugmentIcon";
import { AUGMENT_LIST, hasPokemonName } from "../../../entity/Augment/AugmentData";

const PREVIEW_IMG_ID_MAP = {
  mewtwoStrikesBack: "0150-a",
  veteranPrivilege: "0128-a",
};

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
  const width = 136;
  const height = 136;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 38;

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
      <polygon points={polygonPoints} fill="rgba(100, 255, 218, 0.35)" stroke="#64ffda" strokeWidth="2" />
      {order.map((key, i) => {
        const val = getVal(key);
        const angle = angles[i];
        let x = cx + (maxRadius + 4) * Math.cos(angle);
        let y = cy + (maxRadius + 4) * Math.sin(angle);
        let textAnchor = "middle";
        if (Math.abs(Math.sin(angle)) < 0.8) {
          textAnchor = Math.cos(angle) > 0 ? "start" : "end";
        } else {
          y += Math.sin(angle) > 0 ? 7 : -4;
        }
        return (
          <text key={i} x={x} y={y} fill="#cbd5e1" fontSize="8.2" fontWeight="bold" textAnchor={textAnchor} dominantBaseline="middle">
            <tspan x={x} dy="-0.55em">
              {labels[key]}
            </tspan>
            <tspan x={x} dy="1.15em" fill="#e2e8f0">{`(${val})`}</tspan>
          </text>
        );
      })}
    </svg>
  );
};

const AugmentPokemonPreviewModal = ({ augmentId = null, pokemon, onClose }) => {
  const [showAugmentModal, setShowAugmentModal] = useState(false);
  const hasMegaForm = Boolean(pokemon?.megaData);
  const [showMegaForm, setShowMegaForm] = useState(hasMegaForm);

  const isEternatusPokemon = hasPokemonName(pokemon, "무한다이노") || augmentId === "blackNight" || augmentId === "eternamax";
  const isMewtwoPokemon = hasPokemonName(pokemon, "뮤츠") || augmentId === "mewtwoStrikesBack";
  const isTitanPokemon = hasPokemonName(pokemon, "레지기가스") || augmentId === "legendaryTitan";
  const isTaurosPokemon = hasPokemonName(pokemon, "켄타로스") || augmentId === "veteranPrivilege";

  const replacementAugmentInfo = useMemo(() => {
    if (isMewtwoPokemon) {
      const augs = [AUGMENT_LIST.find((a) => a.id === "specialSwordAndShield"), AUGMENT_LIST.find((a) => a.id === "lostTechnologyBlizzard"), AUGMENT_LIST.find((a) => a.id === "lostTechnologyPsychic")].filter(Boolean);
      const synAug = AUGMENT_LIST.find((a) => a.id === "lostTechnologyCritical");
      return {
        type: "mewtwo",
        btnLabel: "증강 확인 (3종)",
        modalTitle: "뮤츠 전용 증강 & 시너지",
        headerNotice: "교체 시 아래 전용 증강 3개를 모두 획득하며, 시너지가 즉시 활성화됩니다.",
        augs,
        connectorText: "✨ 3종 공명 달성 시 활성화 ✨",
        synAug,
      };
    }

    if (isEternatusPokemon) {
      const augs = [AUGMENT_LIST.find((a) => a.id === "eternamax")].filter(Boolean);
      return {
        type: "blackNight",
        btnLabel: "증강 확인 (1종)",
        modalTitle: "무한다이노 전용 증강",
        headerNotice: "교체 시 아래 전용 증강을 추가로 획득합니다.",
        augs,
      };
    }

    if (isTaurosPokemon) {
      const augs = [AUGMENT_LIST.find((a) => a.id === "specialSwordAndShield"), AUGMENT_LIST.find((a) => a.id === "lostTechnologyBlizzard"), AUGMENT_LIST.find((a) => a.id === "lostTechnologyHyperBeam")].filter(Boolean);
      const synAug = AUGMENT_LIST.find((a) => a.id === "lostTechnologyCritical");
      return {
        type: "tauros",
        btnLabel: "증강 확인 (3종)",
        modalTitle: "켄타로스 전용 증강 & 시너지",
        headerNotice: "교체 시 아래 전용 증강 3개를 모두 획득하며, 시너지가 즉시 활성화됩니다.",
        augs,
        connectorText: "✨ 3종 공명 달성 시 활성화 ✨",
        synAug,
      };
    }

    if (isTitanPokemon) {
      const augs = [AUGMENT_LIST.find((a) => a.id === "fastStarter"), AUGMENT_LIST.find((a) => a.id === "hugePower"), AUGMENT_LIST.find((a) => a.id === "randomAbility")].filter(Boolean);
      return {
        type: "legendaryTitan",
        btnLabel: "증강 확인 (3택 1)",
        modalTitle: "레지기가스 전용 특성 증강",
        headerNotice: "교체 시 아래 3개의 특성 증강 중 하나를 선택하여 획득합니다.",
        augs,
      };
    }

    return null;
  }, [isMewtwoPokemon, isEternatusPokemon, isTitanPokemon, isTaurosPokemon]);

  const eternamaxData = useMemo(() => {
    if (!isEternatusPokemon) return null;
    return {
      name: "무한다이맥스",
      dexNo: "0890",
      uniqueKey: "0890-m",
      type1: "독",
      type2: "드래곤",
      abil: "프레셔",
      hp: 331,
      stat: {
        atk: 108,
        def: 270,
        catk: 177,
        cdef: 270,
        speed: 200,
      },
    };
  }, [isEternatusPokemon]);

  const [showEternamaxForm, setShowEternamaxForm] = useState(() => Boolean(isEternatusPokemon));
  const [infoText, setInfoText] = useState(() => getDefaultInfoText(pokemon));

  useEffect(() => {
    setShowMegaForm(Boolean(pokemon?.megaData));
    setShowEternamaxForm(Boolean(isEternatusPokemon));
    setInfoText(getDefaultInfoText(pokemon));
  }, [pokemon, augmentId, isEternatusPokemon]);

  if (!pokemon) return null;

  const isMegaView = hasMegaForm && showMegaForm;
  const isEternamaxView = Boolean(eternamaxData) && showEternamaxForm;

  const displayName = isMegaView ? pokemon.megaData.name : isEternamaxView ? eternamaxData.name : pokemon.name;

  const displayPokemonId = isMegaView ? pokemon.megaData.uniqueKey : isEternamaxView ? eternamaxData.uniqueKey : (pokemon.img_id || PREVIEW_IMG_ID_MAP[augmentId] || pokemon.uniqueKey);

  const displayType1 = isMegaView ? pokemon.megaData.type1 : isEternamaxView ? eternamaxData.type1 : pokemon.type1;

  const displayType2 = isMegaView ? pokemon.megaData.type2 : isEternamaxView ? eternamaxData.type2 : pokemon.type2;

  const displayAbil = isMegaView ? pokemon.megaData.abil : isEternamaxView ? eternamaxData.abil : (pokemon.abil?.name || pokemon.abil);

  const displayHp = isEternamaxView ? eternamaxData.hp : pokemon.hp;
  const displayStat = isMegaView ? pokemon.megaData.stat : isEternamaxView ? eternamaxData.stat : pokemon.stat || {};
  const displayItem = pokemon.item;
  const skills = [1, 2, 3, 4].map((num) => pokemon.skill?.[num]).filter((s) => s && s.name);

  const handleAbilClick = (e) => {
    e.stopPropagation();
    if (displayAbil === "없음" || !displayAbil) {
      setInfoText("특성이 없습니다.");
      return;
    }
    const desc = abilObject[displayAbil]?.text || (!isMegaView && pokemon.abil?.text) || "특성 설명이 없습니다.";
    setInfoText(`[${displayAbil}] ${desc}`);
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    if (!displayItem) {
      setInfoText("지닌 아이템이 없습니다.");
      return;
    }
    const desc = itemText[displayItem] || "아이템 설명이 없습니다.";
    setInfoText(`[${displayItem}] ${desc}`);
  };

  const handleSkillClick = (e, skill) => {
    e.stopPropagation();
    const isOnlyPriority = isOnlyPrioritySkillText(skill.text);
    const desc = isOnlyPriority || !skill.text ? "설명이 없습니다." : skill.text;
    setInfoText(`[${skill.name}] ${desc}`);
  };

  const handleStatClick = (e) => {
    e.stopPropagation();
    setInfoText(`[능력치] HP: ${displayHp} / 스피드: ${displayStat.speed ?? 0} / 공격: ${displayStat.atk ?? 0} / 특수공격: ${displayStat.catk ?? 0} / 방어: ${displayStat.def ?? 0} / 특수방어: ${displayStat.cdef ?? 0}`);
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

        {Boolean(eternamaxData) && (
          <FormToggleRow>
            <FormToggleButton
              type="button"
              $active={showEternamaxForm}
              onClick={(e) => {
                e.stopPropagation();
                setShowEternamaxForm(true);
              }}
            >
              무한다이맥스 (변환)
            </FormToggleButton>
            <FormToggleButton
              type="button"
              $active={!showEternamaxForm}
              onClick={(e) => {
                e.stopPropagation();
                setShowEternamaxForm(false);
              }}
            >
              무한다이노 (기본)
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

        <BottomRow>
          <LeftCol>
            <GraphBox onClick={handleStatClick} title="클릭하여 능력치 상세 보기">
              <PreviewHexagonGraph hp={displayHp} stat={displayStat} />
            </GraphBox>
            {replacementAugmentInfo && (
              <AugmentCheckBtn
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAugmentModal(true);
                }}
                title="획득 증강 확인"
              >
                {replacementAugmentInfo.btnLabel}
              </AugmentCheckBtn>
            )}
          </LeftCol>

          <SkillsBox>
            {skills.map((skill, idx) => {
              const displayType = skillTypeCalculate(null, skill, { abil: displayAbil }) || skill.type || skill.stype;
              return (
                <SkillRowButton key={skill.name || idx} type="button" onClick={(e) => handleSkillClick(e, skill)}>
                  <SkillTypeImg
                    src={`/pokemon/img/type/${displayType}.svg`}
                    alt={skill.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <SkillMainInfo>
                    <SkillNameText>
                      {skill.name}
                      {skill.nimbleMoves ? " +1" : ""}
                    </SkillNameText>
                  </SkillMainInfo>
                </SkillRowButton>
              );
            })}
          </SkillsBox>
        </BottomRow>

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

      {showAugmentModal && replacementAugmentInfo && (
        <ModalOverlay
          style={{ zIndex: 10025 }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAugmentModal(false);
          }}
        >
          <SubModalContainer onClick={(e) => e.stopPropagation()}>
            <SubModalHeader>
              <SubModalHeaderTop>
                <SubModalTitleRow>
                  <SubModalTitle>{replacementAugmentInfo.modalTitle}</SubModalTitle>
                </SubModalTitleRow>
                <CloseButton
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAugmentModal(false);
                  }}
                  title="닫기"
                >
                  ✕
                </CloseButton>
              </SubModalHeaderTop>
              <SubModalNotice>{replacementAugmentInfo.headerNotice}</SubModalNotice>
            </SubModalHeader>

            <SubModalAugList>
              {replacementAugmentInfo.augs.map((aug, idx) => (
                <SubModalAugCard key={aug.id || idx}>
                  <SubModalIconCol>
                    <AugmentIcon id={aug.id} size={36} />
                    {aug.cost !== "-" && aug.cost !== undefined && <SubModalCostTag>{aug.cost} cost</SubModalCostTag>}
                  </SubModalIconCol>
                  <SubModalAugMeta>
                    <SubModalAugNameRow>
                      <SubModalAugName>{aug.name}</SubModalAugName>
                    </SubModalAugNameRow>
                    <SubModalAugDesc>{aug.desc}</SubModalAugDesc>
                  </SubModalAugMeta>
                </SubModalAugCard>
              ))}
            </SubModalAugList>

            {replacementAugmentInfo.connectorText && (
              <SubModalConnectorRow>
                <SubModalConnectorLine />
                <SubModalConnectorBadge>{replacementAugmentInfo.connectorText}</SubModalConnectorBadge>
                <SubModalConnectorLine />
              </SubModalConnectorRow>
            )}

            {replacementAugmentInfo.synAug && (
              <SubModalBuffCard>
                <SubModalBuffHeader>
                  <SubModalIconCol>
                    <AugmentIcon id={replacementAugmentInfo.synAug.id} size={40} />
                  </SubModalIconCol>
                  <SubModalBuffMeta>
                    <SubModalBuffNameRow>
                      <SubModalBuffName>{replacementAugmentInfo.synAug.name}</SubModalBuffName>
                      <SubModalSynergyPill>시너지</SubModalSynergyPill>
                    </SubModalBuffNameRow>
                    <SubModalBuffDesc>{replacementAugmentInfo.synAug.getDesc ? replacementAugmentInfo.synAug.getDesc(pokemon) : replacementAugmentInfo.synAug.desc}</SubModalBuffDesc>
                  </SubModalBuffMeta>
                </SubModalBuffHeader>
              </SubModalBuffCard>
            )}

            <SubModalFooter>
              <SubModalConfirmBtn
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAugmentModal(false);
                }}
              >
                확인
              </SubModalConfirmBtn>
            </SubModalFooter>
          </SubModalContainer>
        </ModalOverlay>
      )}
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

const BottomRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-height: 145px;
  width: 100%;
  margin-bottom: 10px;
  box-sizing: border-box;
`;

const LeftCol = styled.div`
  flex: 0 0 136px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  @media (max-width: 480px) {
    flex: 0 0 128px;
  }
`;

const GraphBox = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;

  &:hover {
    background: rgba(100, 255, 218, 0.08);
    border-color: rgba(100, 255, 218, 0.45);
  }
`;

const SkillsBox = styled.div`
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  box-sizing: border-box;
`;

const SkillRowButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  user-select: none;
  font-family: inherit;

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: rgba(100, 255, 218, 0.55);
  }
  &:active {
    transform: scale(0.98);
  }
`;

const SkillTypeImg = styled.img`
  width: 22px;
  height: 22px;
  margin-right: 6px;
  border-radius: 3px;
  flex-shrink: 0;
`;

const SkillMainInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

const SkillNameText = styled.span`
  font-weight: bold;
  font-size: 0.82rem;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

const AugmentCheckBtn = styled.button`
  width: 100%;
  height: 32px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.95), rgba(10, 15, 20, 0.9));
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  border-radius: 7px;
  padding: 0 6px;
  font-size: 11.5px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  margin-top: 5px;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, rgba(30, 45, 60, 0.95), rgba(10, 15, 20, 0.9));
    border-color: rgba(100, 255, 218, 0.7);
    box-shadow: 0 0 10px rgba(100, 255, 218, 0.3);
  }
  &:active {
    transform: scale(0.97);
  }
`;

const SubModalContainer = styled.div`
  background: rgba(15, 23, 42, 0.98);
  border: 1.5px solid rgba(100, 255, 218, 0.4);
  border-radius: 14px;
  padding: 18px 18px 14px;
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.9);
  position: relative;
  box-sizing: border-box;
  cursor: default;

  @media (max-width: 480px) {
    padding: 14px 12px 12px;
    width: 95%;
  }
`;

const SubModalHeader = styled.div`
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`;

const SubModalHeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SubModalTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SubModalEmoji = styled.span`
  font-size: 1.3rem;
`;

const SubModalTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
`;

const SubModalNotice = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: keep-all;
`;

const SubModalAugList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;

const SubModalAugCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
`;

const SubModalIconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
`;

const SubModalCostTag = styled.span`
  font-size: 0.65rem;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  white-space: nowrap;
`;

const SubModalAugMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const SubModalAugNameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 2px;
`;

const SubModalAugName = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  word-break: keep-all;
`;

const SubModalBadge = styled.span`
  font-size: 0.66rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  white-space: nowrap;
  ${(props) =>
    props.$isChoice
      ? `
    background: rgba(245, 158, 11, 0.18);
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.45);
  `
      : `
    background: rgba(100, 255, 218, 0.16);
    color: #64ffda;
    border: 1px solid rgba(100, 255, 218, 0.45);
  `}
`;

const SubModalAugDesc = styled.p`
  margin: 0;
  font-size: 0.74rem;
  color: #94a3b8;
  line-height: 1.35;
  white-space: pre-line;
  word-break: keep-all;
`;

const SubModalConnectorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0 10px;
`;

const SubModalConnectorLine = styled.div`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.5), rgba(255, 215, 0, 0.1));
`;

const SubModalConnectorBadge = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #ffd700;
  letter-spacing: 0.3px;
  white-space: nowrap;
`;

const SubModalBuffCard = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(50, 42, 16, 0.95) 0%, rgba(22, 45, 64, 0.95) 100%);
  border: 1.5px solid #ffd700;
  box-shadow: 0 0 14px rgba(255, 215, 0, 0.25);
  margin-bottom: 12px;
  text-align: left;
`;

const SubModalBuffHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const SubModalBuffMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const SubModalBuffNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  flex-wrap: wrap;
`;

const SubModalBuffName = styled.span`
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
`;

const SubModalSynergyPill = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
  border: 1px solid rgba(255, 215, 0, 0.5);
`;

const SubModalActiveTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #64ffda;
`;

const SubModalBuffDesc = styled.p`
  margin: 0;
  font-size: 0.74rem;
  color: #fde68a;
  line-height: 1.35;
  white-space: pre-line;
  word-break: keep-all;
`;

const SubModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const SubModalConfirmBtn = styled.button`
  width: 100%;
  padding: 8px 0;
  font-size: 0.92rem;
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.12);
  color: #64ffda;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.24);
    box-shadow: 0 4px 12px rgba(100, 255, 218, 0.2);
  }
`;
