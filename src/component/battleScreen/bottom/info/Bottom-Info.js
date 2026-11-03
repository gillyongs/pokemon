// 배틀 중 포켓몬 상세 정보 화면 (SampleInfoModal 레이아웃 참고)
import React, { useRef } from "react";
import styled from "styled-components";
import TextBox from "../common/TextBox";
import { TYPE_COLORS } from "../../../customScreen/sampleInfo/SampleInfoModal";
import { isOnlyPrioritySkillText } from "../../../customScreen/sampleInfo/SkillSearchModal";
import { getAugmentedStat } from "../../../../util/damageCalculate";
import { getMultiplier } from "../../../../function/rankStat";
import { getTypeEffectText } from "../../../../util/typeEffectCalculate";
import { getWeatherBallType } from "../../../../util/weatherBall";
import { abilObject } from "../../../../entity/Ability";
import { itemText as itemTextDict } from "../../../../entity/Item";

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

const HexagonGraph = ({ pokemon }) => {
  const MAX_STAT = 250;
  const width = 136;
  const height = 136;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 40;

  const order = ["hp", "atk", "def", "speed", "cdef", "catk"];
  const angles = order.map((_, i) => (i * 60 - 90) * (Math.PI / 180));

  const getStatInfo = (stat) => {
    if (stat === "hp") {
      const base = pokemon?.origin?.hp ?? 0;
      return { val: base, baseVal: base, rank: 0 };
    }
    const rank = Number(pokemon?.tempStatus?.rank?.[stat] ?? 0);
    const mult = getMultiplier(rank);
    let baseVal = 0;
    if (stat === "atk" || stat === "catk") {
      baseVal = getAugmentedStat(pokemon, stat);
    } else {
      baseVal = pokemon?.origin?.stat?.[stat] ?? 0;
    }
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

const BottomSectionInfo = ({ battle, text, setBottom, bench, setBench, setText, onOpenAugmentStatus }) => {
  const teamKeys = ["player", "playerBench1", "playerBench2"].filter((k) => battle && battle[k]);
  const currentKey = teamKeys.includes(bench) ? bench : "player";
  const pokemon = battle[currentKey] || battle.player;
  const clickCountRef = useRef(0);
  const isMayhem = Boolean(battle?.isMayhem);
  const augmentCount = (pokemon?.augments || []).length;

  const handlePrevPokemon = (e) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    const currentIndex = teamKeys.indexOf(currentKey);
    const prevIndex = (currentIndex - 1 + teamKeys.length) % teamKeys.length;
    const nextKey = teamKeys[prevIndex];
    if (setBench) setBench(nextKey);
  };

  const handleNextPokemon = (e) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    const currentIndex = teamKeys.indexOf(currentKey);
    const nextIndex = (currentIndex + 1) % teamKeys.length;
    const nextKey = teamKeys[nextIndex];
    if (setBench) setBench(nextKey);
  };

  const statusText = getPokemonStatusText(pokemon);
  const hpRatio = Math.max(0, (pokemon.hp || 0) / (pokemon.origin?.hp || 1));
  let hpColor = "#4ade80";
  if (hpRatio <= 0.25) hpColor = "#ef4444";
  else if (hpRatio <= 0.5) hpColor = "#facc15";

  const handleAbilClick = (e) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    const desc = pokemon.abilObj?.text || abilObject[pokemon.abil]?.text || "설명이 없습니다.";
    setText(`[${pokemon.abil}] ${desc}`);
  };

  const handleItemClick = (e) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    const hasItem = Boolean(pokemon.item && pokemon.item !== "");
    if (!hasItem) {
      setText("지닌 아이템이 없습니다.");
      return;
    }
    const desc = pokemon.itemText || itemTextDict[pokemon.item] || `${pokemon.item}`;
    setText(`[${pokemon.item}] ${desc}`);
  };

  const handleStatusClick = (e) => {
    e.stopPropagation();
    if (statusText === "정상") {
      clickCountRef.current += 1;
      if (clickCountRef.current === 5) {
        setText("나는 정점이다.");
      } else {
        setText("정상이다.");
      }
    } else {
      clickCountRef.current = 0;
      setText(`[${statusText}] ${statusTexts[statusText] || ""}`);
    }
  };

  const handleStatClick = (e) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    const hp = pokemon.origin?.hp ?? 0;
    const getStatSummary = (stat) => {
      const rank = Number(pokemon?.tempStatus?.rank?.[stat] ?? 0);
      const mult = getMultiplier(rank);
      const base = stat === "atk" || stat === "catk" ? getAugmentedStat(pokemon, stat) : (pokemon?.origin?.stat?.[stat] ?? 0);
      const finalVal = Math.floor(base * mult);
      const rankStr = rank !== 0 ? `(${rank > 0 ? `+${rank}` : rank})` : "";
      return `${finalVal}${rankStr}`;
    };
    const atk = getStatSummary("atk");
    const def = getStatSummary("def");
    const catk = getStatSummary("catk");
    const cdef = getStatSummary("cdef");
    const speed = getStatSummary("speed");
    setText(`HP ${pokemon.hp}/${hp} | 공격 ${atk} | 방어 ${def} | 특공 ${catk} | 특방 ${cdef} | 스피드 ${speed}`);
  };

  const handleSkillClick = (e, skill) => {
    e.stopPropagation();
    clickCountRef.current = 0;
    if (!skill) return;
    const isOnlyPriority = isOnlyPrioritySkillText(skill.text);
    const desc = isOnlyPriority || !skill.text ? "설명이 없습니다." : skill.text;
    setText(`[${skill.name}] ${desc}`);
  };

  return (
    <>
      <TextBox text={text} />
      <InfoCard onClick={(e) => e.stopPropagation()}>
        {teamKeys.length > 1 && (
          <>
            <NavArrowBtn $dir="left" type="button" onClick={handlePrevPokemon} title="이전 포켓몬">
              ‹
            </NavArrowBtn>
            <NavArrowBtn $dir="right" type="button" onClick={handleNextPokemon} title="다음 포켓몬">
              ›
            </NavArrowBtn>
          </>
        )}
        <TopRow>
          <SpriteBox>
            <SpriteImg src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`} alt={pokemon.origin.name} />
            <HpBarTrack>
              <HpBarFill style={{ width: `${hpRatio * 100}%`, backgroundColor: hpColor }} />
              <HpBarLabel>
                {pokemon.hp}/{pokemon.origin.hp}
              </HpBarLabel>
            </HpBarTrack>
          </SpriteBox>

          <MetaColumn>
            <HeaderLine>
              <NameWrap>
                <PokemonTitle>{pokemon.origin.name}</PokemonTitle>
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
              <ClickableBadge onClick={handleAbilClick}>{pokemon.abil}</ClickableBadge>
            </MetaRow>

            <MetaRow>
              <MetaLabel>아이템:</MetaLabel>
              <ClickableBadge onClick={handleItemClick}>{pokemon.item && pokemon.item !== "" ? pokemon.item : "없음"}</ClickableBadge>
            </MetaRow>

            <MetaRow>
              <MetaLabel>타입:</MetaLabel>
              <TypeBadge $type={pokemon.type1}>{pokemon.type1}</TypeBadge>
              {pokemon.type2 && <TypeBadge $type={pokemon.type2}>{pokemon.type2}</TypeBadge>}
            </MetaRow>
          </MetaColumn>

          <BackBtn
            type="button"
            onClick={() => {
              setText(" 누구로 교체할까?");
              setBottom(battle.player.faint || battle.turn.uturn ? "mustSwitch" : "switch");
            }}
          >
            뒤로가기
          </BackBtn>
        </TopRow>

        <Divider />

        <BottomRow>
          {isMayhem ? (
            <LeftCol>
              <GraphBox $isMayhem={true} onClick={handleStatClick} title="클릭하여 능력치 상세 보기">
                <HexagonGraph pokemon={pokemon} />
              </GraphBox>
              <AugmentCheckBtn
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenAugmentStatus) onOpenAugmentStatus(pokemon);
                }}
                title="증강 현황 보기"
              >
                증강 ({augmentCount}/3)
              </AugmentCheckBtn>
            </LeftCol>
          ) : (
            <GraphBox onClick={handleStatClick} title="클릭하여 능력치 상세 보기">
              <HexagonGraph pokemon={pokemon} />
            </GraphBox>
          )}

          <SkillsBox>
            {[1, 2, 3, 4].map((skillNumber) => {
              const skill = pokemon.origin?.skill?.[skillNumber];
              if (!skill || !skill.name) return null;
              const pp = pokemon.pp?.[skillNumber] ?? skill.pp;
              const displayType = skill.name === "웨더볼" ? getWeatherBallType(battle.field?.weather) : skill.type;
              const effectText = getTypeEffectText(pokemon, displayType, battle.npc.type1, battle.npc.type2, skill.stype, skill.name);

              return (
                <SkillRowButton key={skillNumber} onClick={(e) => handleSkillClick(e, skill)}>
                  <SkillTypeImg src={`/pokemon/img/type/${displayType}.svg`} alt={displayType} />
                  <SkillMainInfo>
                    <SkillNameText>{skill.name}</SkillNameText>
                  </SkillMainInfo>
                  <SkillMetaBox>
                    <SkillEffectText>{effectText || ""}</SkillEffectText>
                    <SkillPpText>
                      PP {pp}/{skill.pp}
                    </SkillPpText>
                  </SkillMetaBox>
                </SkillRowButton>
              );
            })}
          </SkillsBox>
        </BottomRow>
      </InfoCard>
    </>
  );
};

export default BottomSectionInfo;

const InfoCard = styled.div`
  position: absolute;
  top: 10.5vh;
  left: 1.5vw;
  right: 1.5vw;
  bottom: 1vh;
  background-color: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 1.2vh 3vw;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
  z-index: 15;
  color: #f1f5f9;
`;

const NavArrowBtn = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${({ $dir }) => ($dir === "left" ? "left: 4px;" : "right: 4px;")}
  width: 31px;
  height: 52px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(100, 255, 218, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  border-radius: 6px;
  color: #64ffda;
  font-size: 24px;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 25;
  user-select: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(30, 41, 59, 0.95);
    border-color: #64ffda;
    color: #ffffff;
    box-shadow: 0 0 12px rgba(100, 255, 218, 0.5);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  @media (max-width: 480px) {
    width: 26px;
    height: 46px;
    font-size: 20px;
    ${({ $dir }) => ($dir === "left" ? "left: 2px;" : "right: 2px;")}
  }
`;

const TopRow = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
`;

const SpriteBox = styled.div`
  flex: 0 0 100px;
  height: 14.5vh;
  min-height: 86px;
  max-height: 112px;
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
  height: 76%;
  object-fit: contain;
  transform: scale(1.12);
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
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
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

const BackBtn = styled.button`
  position: absolute;
  top: -6px;
  right: -8px;
  width: 25vw;
  max-width: 120px;
  height: 6.2vh;
  min-height: 36px;
  max-height: 52px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.9), rgba(0, 0, 0, 0.8));
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  padding: 0 8px;
  font-size: 15px;
  font-family: inherit;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  z-index: 5;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(100, 255, 218, 0.6);
  }
  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 400px) {
    font-size: 13px;
  }
`;

const LeftCol = styled.div`
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;

  @media (max-width: 380px) {
    flex: 0 0 118px;
  }
`;

const GraphBox = styled.div`
  flex: ${({ $isMayhem }) => ($isMayhem ? "1" : "0 0 132px")};
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

  @media (max-width: 380px) {
    flex: ${({ $isMayhem }) => ($isMayhem ? "1" : "0 0 118px")};
  }
`;

const AugmentCheckBtn = styled.button`
  width: 100%;
  height: 5.3vh;
  min-height: 36px;
  max-height: 50px;
  background: linear-gradient(135deg, rgba(20, 30, 40, 0.9), rgba(0, 0, 0, 0.8));
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  border-radius: 7px;
  padding: 0 8px;
  font-size: 14px;
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
    border-color: rgba(255, 255, 255, 0.45);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 400px) {
    font-size: 12px;
    height: 4.8vh;
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  white-space: nowrap;
`;

const MetaLabel = styled.span`
  color: #94a3b8;
  width: 40px;
  font-size: 0.72rem;
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
  margin: 0.6vh 0;
  width: 100%;
`;

const BottomRow = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: stretch;
  gap: 8px;
`;

const SkillsBox = styled.div`
  flex: 1;
  min-width: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  box-sizing: border-box;
`;

const SkillRowButton = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 6px;
  padding: 3px 7px;
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
  width: 20px;
  height: 20px;
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
  font-size: 0.78rem;
  color: #f8fafc;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SkillMetaBox = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  margin-left: 6px;
  line-height: 1.15;
`;

const SkillEffectText = styled.span`
  font-size: 0.52rem;
  color: #94a3b8;
  white-space: nowrap;
`;

const SkillPpText = styled.span`
  font-size: 0.43rem;
  color: #cbd5e1;
  white-space: nowrap;
  margin-top: 3px;
`;
