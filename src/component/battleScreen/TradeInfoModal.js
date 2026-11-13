import React, { useState } from "react";
import styled from "styled-components";
import { skillTypeCalculate } from "../../calc/skillTypeCalculate";
import { getAugmentedStat } from "../../calc/getStat";
import { hpCalculate } from "../../calc/hpCalculate";
import { getMultiplier } from "../../calc/rankStat";
import { TYPE_COLORS } from "../../calc/typeEffectCalculate";
import { abilObject } from "../../entity/Ability";
import { itemText as itemTextDict } from "../../entity/Item";
import { isOnlyPrioritySkillText } from "../customScreen/sampleInfo/SkillSearchModal";
import { isNormalAugment } from "../../entity/Augment/AugmentData";
import AugmentStatusModal from "./augment/AugmentStatusModal";

const statusTexts = {
  독: "매 턴 HP의 1/8의 데미지를 입는다.",
  맹독: "매 턴 점차 강해지는 데미지를 입는다.",
  화상: "매 턴 HP의 1/16 데미지를 입는다. 물리기의 위력이 절반으로 감소한다.",
  마비: "25%의 확률로 행동할 수 없다. 스피드가 절반으로 감소한다.",
  잠듦: "1~3턴 동안 행동을 할 수 없다.",
  얼음: "행동이 불가능하다. 매 턴 20% 확률로 해제된다.",
  기절: "더 이상 싸울 수 없다.",
};

const statusColors = {
  정상: "#64ffda",
  화상: "#ef4444",
  마비: "#facc15",
  잠듦: "#94a3b8",
  독: "#a855f7",
  맹독: "#7e22ce",
  얼음: "#38bdf8",
  기절: "#6b7280",
};

const getPokemonStatusText = (pokemon) => {
  if (!pokemon) return "정상";
  if (pokemon.faint) return "기절";
  if (pokemon.ailment?.burn) return "화상";
  if (pokemon.ailment?.freeze) return "얼음";
  if (pokemon.ailment?.mabi) return "마비";
  if (pokemon.ailment?.poison) return "독";
  if (pokemon.ailment?.mpoison) return "맹독";
  if (pokemon.ailment?.sleep) return "잠듦";
  return "정상";
};

const HexagonGraph = ({ pokemon, battle }) => {
  const MAX_STAT = 250;
  const width = 136;
  const height = 136;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 38;

  const order = ["hp", "atk", "def", "speed", "cdef", "catk"];
  const angles = order.map((_, i) => (i * 60 - 90) * (Math.PI / 180));

  const getStatInfo = (stat) => {
    if (stat === "hp") {
      const base = hpCalculate(pokemon);
      return { val: base, baseVal: base, rank: 0 };
    }
    const rank = Number(pokemon?.tempStatus?.rank?.[stat] ?? 0);
    const mult = getMultiplier(rank);
    const baseVal = getAugmentedStat(pokemon, stat, battle);
    const val = Math.floor(baseVal * mult);
    return { val, baseVal, rank };
  };

  const getPoint = (stat, angle) => {
    const { val } = getStatInfo(stat);
    const r = (Math.min(val, MAX_STAT) / MAX_STAT) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const points = order.map((stat, i) => getPoint(stat, angles[i]));
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
      {order.map((stat, i) => {
        const { val, baseVal, rank } = getStatInfo(stat);
        const isBoosted = val > baseVal;
        const isReduced = val < baseVal;
        const angle = angles[i];
        let x = cx + (maxRadius + 4) * Math.cos(angle);
        let y = cy + (maxRadius + 4) * Math.sin(angle);
        let textAnchor = "middle";
        if (Math.abs(Math.sin(angle)) < 0.8) {
          textAnchor = Math.cos(angle) > 0 ? "start" : "end";
        } else {
          y += Math.sin(angle) > 0 ? 7 : -4;
        }
        const valColor = isBoosted ? "#64ffda" : isReduced ? "#f87171" : "#e2e8f0";
        const labelText = rank !== 0 ? `${labels[stat]} ${rank > 0 ? `+${rank}` : rank}` : labels[stat];
        return (
          <text key={i} x={x} y={y} fill="#cbd5e1" fontSize="8.2" fontWeight="bold" textAnchor={textAnchor} dominantBaseline="middle">
            <tspan x={x} dy="-0.55em">
              {labelText}
            </tspan>
            <tspan x={x} dy="1.15em" fill={valColor}>{`(${val})`}</tspan>
          </text>
        );
      })}
    </svg>
  );
};

const TradeInfoModal = ({ pokemon, battle, onClose }) => {
  const [infoText, setInfoText] = useState("기술, 특성, 지닌물건, 능력치를 클릭하면 설명이 나옵니다.");
  const [isAugmentStatusOpen, setIsAugmentStatusOpen] = useState(false);

  if (!pokemon) return null;

  const p = pokemon.origin || pokemon;
  const pokemonName = p?.name || pokemon.name || "포켓몬";
  const pokemonId = pokemon?.img_id || p?.pokemon_id || pokemon?.pokemon_id;
  const statusText = getPokemonStatusText(pokemon);
  const maxHp = hpCalculate(pokemon);
  const hpRatio = Math.max(0, (pokemon.hp || 0) / (maxHp || 1));

  let hpColor = "#4ade80";
  if (hpRatio <= 0.25) hpColor = "#ef4444";
  else if (hpRatio <= 0.5) hpColor = "#facc15";

  const normalAugmentCount = (pokemon?.augments || []).filter((a) => isNormalAugment(a)).length;

  const handleAbilClick = () => {
    const abilName = pokemon.abil || p.abil || "없음";
    const desc = pokemon.abilObj?.text || p.abilObj?.text || abilObject[abilName]?.text || "특성 설명이 없습니다.";
    setInfoText(`[특성: ${abilName}] ${desc}`);
  };

  const handleItemClick = () => {
    const itemName = pokemon.item || p.item;
    if (!itemName) {
      setInfoText("지닌 아이템이 없습니다.");
      return;
    }
    const desc = pokemon.itemText || p.itemText || itemTextDict[itemName] || `${itemName}`;
    setInfoText(`[아이템: ${itemName}] ${desc}`);
  };

  const handleSkillClick = (skill) => {
    if (!skill) return;
    const isOnlyPriority = isOnlyPrioritySkillText(skill.text);
    const desc = isOnlyPriority || !skill.text ? "설명이 없습니다." : skill.text;
    setInfoText(`[${skill.name}] ${desc}`);
  };

  const handleStatusClick = () => {
    if (statusText === "정상") {
      setInfoText("정상 상태입니다.");
    } else {
      setInfoText(`[${statusText}] ${statusTexts[statusText] || ""}`);
    }
  };

  const handleStatClick = () => {
    const getStatSummary = (stat) => {
      const rank = Number(pokemon?.tempStatus?.rank?.[stat] ?? 0);
      const mult = getMultiplier(rank);
      const base = getAugmentedStat(pokemon, stat, battle);
      const finalVal = Math.floor(base * mult);
      const rankStr = rank !== 0 ? `(${rank > 0 ? `+${rank}` : rank})` : "";
      return `${finalVal}${rankStr}`;
    };
    const hp = maxHp;
    const atk = getStatSummary("atk");
    const def = getStatSummary("def");
    const catk = getStatSummary("catk");
    const cdef = getStatSummary("cdef");
    const speed = getStatSummary("speed");
    setInfoText(`HP ${pokemon.hp ?? hp}/${hp} | 공격 ${atk} | 방어 ${def} | 특공 ${catk} | 특방 ${cdef} | 스피드 ${speed}`);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>포켓몬 정보</ModalTitle>
          <CloseButton type="button" onClick={onClose} title="닫기">
            ✕
          </CloseButton>
        </ModalHeader>

        <TopRow>
          <SpriteBox>
            <SpriteImg
              src={`/pokemon/img/pokemon/${pokemonId}.webp`}
              alt={pokemonName}
              onError={(e) => {
                e.currentTarget.src = "/pokemon/img/pokemon/0000.webp";
              }}
            />
            <HpBarTrack>
              <HpBarFill style={{ width: `${hpRatio * 100}%`, backgroundColor: hpColor }} />
              <HpBarLabel>
                {pokemon.hp ?? maxHp}/{maxHp}
              </HpBarLabel>
            </HpBarTrack>
          </SpriteBox>

          <MetaColumn>
            <HeaderLine>
              <NameWrap>
                <PokemonTitle>{pokemonName}</PokemonTitle>
                {pokemon.isMega && <MegaIcon src="/pokemon/img/background/mega.webp" alt="mega" />}
                {statusText !== "정상" && (
                  <StatusBadge $color={statusColors[statusText] || "#64ffda"} onClick={handleStatusClick}>
                    {statusText}
                  </StatusBadge>
                )}
              </NameWrap>
            </HeaderLine>

            <MetaRow>
              <MetaLabel>특성:</MetaLabel>
              <ClickableBadge onClick={handleAbilClick}>
                {pokemon.abil || p.abil || "없음"}
                {pokemon.abilObj?.used ? " (사용됨)" : ""}
              </ClickableBadge>
            </MetaRow>

            <MetaRow>
              <MetaLabel>아이템:</MetaLabel>
              <ClickableBadge onClick={handleItemClick}>
                {pokemon.item || p.item || "없음"}
              </ClickableBadge>
            </MetaRow>

            <MetaRow>
              <MetaLabel>타입:</MetaLabel>
              <TypeBadge $type={pokemon.type1 || p.type1}>{pokemon.type1 || p.type1}</TypeBadge>
              {(pokemon.type2 || p.type2) && <TypeBadge $type={pokemon.type2 || p.type2}>{pokemon.type2 || p.type2}</TypeBadge>}
            </MetaRow>
          </MetaColumn>
        </TopRow>

        <Divider />

        <BottomRow>
          <LeftCol>
            <GraphBox onClick={handleStatClick} title="클릭하여 능력치 상세 보기">
              <HexagonGraph pokemon={pokemon} battle={battle} />
            </GraphBox>
            <AugmentCheckBtn
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAugmentStatusOpen(true);
              }}
              title="증강 현황 보기"
            >
              증강 ({normalAugmentCount}/3)
            </AugmentCheckBtn>
          </LeftCol>

          <SkillsBox>
            {[1, 2, 3, 4].map((skillNumber) => {
              const skill = p?.skill?.[skillNumber] || pokemon?.skill?.[skillNumber];
              if (!skill || !skill.name) return null;
              const displayType = skillTypeCalculate(battle, skill, pokemon) || skill.type || skill.stype;

              return (
                <SkillRowButton key={skillNumber} onClick={() => handleSkillClick(skill)}>
                  <SkillTypeImg src={`/pokemon/img/type/${displayType}.svg`} alt={skill.name} />
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

        <ModalButtonContainer>
          <ModalButton $primary $isWin={true} onClick={onClose}>
            닫기
          </ModalButton>
        </ModalButtonContainer>

        {isAugmentStatusOpen && (
          <AugmentStatusModal
            battle={battle}
            team={[pokemon]}
            initialPokemon={pokemon}
            onClose={() => setIsAugmentStatusOpen(false)}
          />
        )}
      </ModalBox>
    </ModalOverlay>
  );
};

export default TradeInfoModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
  padding: 14px;
  box-sizing: border-box;
`;

const ModalBox = styled.div`
  background: rgba(15, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 16px 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  width: 92vw;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  color: #ddd;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 4px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: bold;
  color: #64ffda;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s ease;

  &:hover {
    color: #ffffff;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
`;

const SpriteBox = styled.div`
  flex: 0 0 92px;
  height: 98px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 4px 6px 5px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-sizing: border-box;
  overflow: hidden;
`;

const SpriteImg = styled.img`
  width: 100%;
  height: 74%;
  object-fit: contain;
  transform: scale(1.1);
`;

const HpBarTrack = styled.div`
  position: relative;
  width: 100%;
  height: 14px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 7px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  overflow: hidden;
  flex-shrink: 0;
`;

const HpBarFill = styled.div`
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
`;

const HpBarLabel = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
  line-height: 1;
`;

const MetaColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 3px;
  text-align: left;
`;

const HeaderLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;

const NameWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const PokemonTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MegaIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const StatusBadge = styled.span`
  background-color: ${({ $color }) => $color};
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1px 6px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  white-space: nowrap;
`;

const MetaLabel = styled.span`
  color: #94a3b8;
  width: 45px;
  font-size: 0.75rem;
  flex-shrink: 0;
`;

const TypeBadge = styled.span`
  background-color: ${({ $type }) => TYPE_COLORS[$type] || "#475569"};
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.76rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const ClickableBadge = styled.div`
  background-color: rgba(100, 255, 218, 0.14);
  color: #64ffda;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid rgba(100, 255, 218, 0.35);
  transition: all 0.2s;
  user-select: none;
  font-size: 0.78rem;

  &:hover {
    background-color: rgba(100, 255, 218, 0.26);
  }
  &:active {
    transform: scale(0.97);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  margin: 2px 0;
  width: 100%;
`;

const BottomRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-height: 180px;
`;

const LeftCol = styled.div`
  flex: 0 0 136px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 6px;
`;

const GraphBox = styled.div`
  flex: 1;
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

const AugmentCheckBtn = styled.button`
  width: 100%;
  height: 36px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.9), rgba(0, 0, 0, 0.8));
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.4);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  border-radius: 7px;
  padding: 0 8px;
  font-size: 13.5px;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
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

const SkillRowButton = styled.div`
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
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.45;
  color: #e2e8f0;
  min-height: 42px;
  display: flex;
  align-items: center;
  text-align: left;
  word-break: keep-all;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 10px 0;
  font-size: 1rem;
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  font-weight: bold;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 4px 14px rgba(100, 255, 218, 0.2);
  }
`;
