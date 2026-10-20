import React, { useState, useRef } from "react";
import styled from "styled-components";
import { abilObject } from "../entity/Ability";
import { itemText } from "../entity/Item";
import skillList from "../entity/Skill/skillList";
import ItemSearchModal from "./ItemSearchModal";
import AbilSearchModal from "./AbilSearchModal";
import SkillSearchModal from "./SkillSearchModal";
import StatAdjustmentModal from "./StatAdjustmentModal";

const HexagonGraph = ({ origin }) => {
  const MAX_STAT = 250;
  const width = 130;
  const height = 130;
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = 39;

  const order = ["hp", "atk", "def", "speed", "cdef", "catk"];
  const angles = order.map((_, i) => (i * 60 - 90) * (Math.PI / 180));

  const getPoint = (stat, angle) => {
    let val = stat === "hp" ? origin.hp : origin.stat[stat];
    const r = (Math.min(val, MAX_STAT) / MAX_STAT) * maxRadius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const points = order.map((stat, i) => getPoint(stat, angles[i]));
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const bgPolygons = [1, 0.66, 0.33].map((scale) => {
    return order
      .map((_, i) => {
        const x = cx + maxRadius * scale * Math.cos(angles[i]);
        const y = cy + maxRadius * scale * Math.sin(angles[i]);
        return `${x},${y}`;
      })
      .join(" ");
  });

  const labels = { hp: "HP", atk: "공격", def: "방어", speed: "스피드", cdef: "특방", catk: "특공" };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible", maxWidth: `${width}px`, maxHeight: `${height}px` }}>
      {bgPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + maxRadius * Math.cos(a)} y2={cy + maxRadius * Math.sin(a)} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      ))}
      <polygon points={polygonPoints} fill="rgba(76, 175, 80, 0.5)" stroke="#4caf50" strokeWidth="2" />
      {order.map((stat, i) => {
        const val = stat === "hp" ? origin.hp : (origin.stat?.[stat] ?? 0);
        const angle = angles[i];
        let x = cx + (maxRadius + 3) * Math.cos(angle);
        let y = cy + (maxRadius + 3) * Math.sin(angle);
        let textAnchor = "middle";
        if (Math.abs(Math.sin(angle)) < 0.8) {
          textAnchor = Math.cos(angle) > 0 ? "start" : "end";
        } else {
          y += Math.sin(angle) > 0 ? 7 : -4;
        }
        return (
          <text key={i} x={x} y={y} fill="#555" fontSize="8.0" fontWeight="bold" textAnchor={textAnchor} dominantBaseline="middle">
            <tspan x={x} dy="-0.55em">
              {labels[stat]}
            </tspan>
            <tspan x={x} dy="1.15em">{`(${val})`}</tspan>
          </text>
        );
      })}
    </svg>
  );
};

const SampleInfoModal = ({ pokemon, onClose, onAdd, isFull, submitText = "팀에 추가" }) => {
  const [infoText, setInfoText] = useState("특성, 아이템, 능력치, 기술배치를 클릭하여 수정할 수 있습니다.");
  const p = pokemon; // CustomScreen에서는 객체 자체가 origin 형태임
  const [selectedItem, setSelectedItem] = useState(p.item || "없음");
  const [selectedAbil, setSelectedAbil] = useState(p.abil || "");
  const [selectedSkills, setSelectedSkills] = useState({
    1: p.skill?.[1]?.name || "",
    2: p.skill?.[2]?.name || "",
    3: p.skill?.[3]?.name || "",
    4: p.skill?.[4]?.name || "",
  });
  const [customStats, setCustomStats] = useState({
    hp: p.hp,
    stat: { ...p.stat },
    evs: p.evs || { hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 },
    nature: p.nature || { up: null, down: null },
    gacha: p.gacha || "6V",
    megaData: p.megaData,
  });
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);
  const [isAbilSearchOpen, setIsAbilSearchOpen] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);

  const longPressRef = useRef({ timer: null, triggered: false, startX: 0, startY: 0 });

  const bindLongPress = (onClick, onLongPress) => {
    return {
      onMouseDown: (e) => {
        if (e.button !== 0) return;
        longPressRef.current.triggered = false;
        if (longPressRef.current.timer) clearTimeout(longPressRef.current.timer);
        longPressRef.current.timer = setTimeout(() => {
          longPressRef.current.triggered = true;
          onLongPress();
        }, 400);
      },
      onMouseUp: () => {
        if (longPressRef.current.timer) {
          clearTimeout(longPressRef.current.timer);
          longPressRef.current.timer = null;
        }
      },
      onMouseLeave: () => {
        if (longPressRef.current.timer) {
          clearTimeout(longPressRef.current.timer);
          longPressRef.current.timer = null;
        }
      },
      onTouchStart: (e) => {
        longPressRef.current.triggered = false;
        if (e.touches && e.touches[0]) {
          longPressRef.current.startX = e.touches[0].clientX;
          longPressRef.current.startY = e.touches[0].clientY;
        }
        if (longPressRef.current.timer) clearTimeout(longPressRef.current.timer);
        longPressRef.current.timer = setTimeout(() => {
          longPressRef.current.triggered = true;
          onLongPress();
        }, 400);
      },
      onTouchMove: (e) => {
        if (e.touches && e.touches[0]) {
          const dx = Math.abs(e.touches[0].clientX - longPressRef.current.startX);
          const dy = Math.abs(e.touches[0].clientY - longPressRef.current.startY);
          if (dx > 10 || dy > 10) {
            if (longPressRef.current.timer) {
              clearTimeout(longPressRef.current.timer);
              longPressRef.current.timer = null;
            }
          }
        }
      },
      onTouchEnd: () => {
        if (longPressRef.current.timer) {
          clearTimeout(longPressRef.current.timer);
          longPressRef.current.timer = null;
        }
      },
      onClick: (e) => {
        if (longPressRef.current.triggered) {
          longPressRef.current.triggered = false;
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (onClick) onClick(e);
      },
      onContextMenu: (e) => {
        if (longPressRef.current.triggered) {
          e.preventDefault();
        }
      },
    };
  };

  const showAbilDesc = () => {
    const desc = abilObject[selectedAbil]?.text || (selectedAbil === p.abil ? p.abilObj?.text : "") || "설명이 없습니다.";
    setInfoText(`[${selectedAbil}] ${desc}`);
  };

  const showMegaAbilDesc = () => {
    const desc = (p.megaData?.abil && abilObject[p.megaData.abil]?.text) || "설명이 없습니다.";
    setInfoText(`[${p.megaData?.abil}] ${desc}`);
  };

  const showItemDesc = () => {
    const desc = itemText[selectedItem] || (selectedItem === "없음" ? "지닌 도구가 없습니다." : "설명이 없습니다.");
    setInfoText(`[${selectedItem}] ${desc}`);
  };

  const showSkillDesc = (skill) => {
    const desc = skill.text || "설명이 없습니다.";
    setInfoText(`[${skill.name}] ${desc}`);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="닫기">
          ✕
        </CloseButton>

        <div style={{ display: "flex", alignItems: "stretch", marginBottom: "15px" }}>
          <div style={{ flex: "0 0 90px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: "10px", padding: "8px", border: "1px solid #eee", boxSizing: "border-box" }}>
            <img src={`/pokemon/img/pokemon/${p.megaData?.pokemon_id || p.pokemon_id}.webp`} alt={p.name} style={{ width: "95%", height: "95%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: "1", minWidth: 0, paddingLeft: "12px", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px" }}>
            <h2 style={{ color: "#333", margin: "0 0 2px 0", fontSize: "1.4rem", whiteSpace: "nowrap" }}>{p.name}</h2>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "48px" }}>타입:</span>
              <TypeBadge $type={p.type1}>{p.type1}</TypeBadge>
              {p.type2 && <TypeBadge $type={p.type2}>{p.type2}</TypeBadge>}
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "48px" }}>특성:</span>
              <ClickableBadge {...bindLongPress(() => setIsAbilSearchOpen(true), showAbilDesc)} title="클릭하여 특성 변경 / 꾹 눌러서 설명 보기">
                {selectedAbil}
              </ClickableBadge>
              {p.megaData && (
                <ClickableBadge {...bindLongPress(showMegaAbilDesc, showMegaAbilDesc)} title="클릭 또는 꾹 눌러서 설명 보기">
                  {p.megaData.abil}
                </ClickableBadge>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "48px" }}>아이템:</span>
              <ClickableBadge {...bindLongPress(() => setIsItemSearchOpen(true), showItemDesc)} title="클릭하여 아이템 변경 / 꾹 눌러서 설명 보기">
                {selectedItem}
              </ClickableBadge>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#eee", margin: "10px 0" }} />

        <div style={{ display: "flex", alignItems: "stretch", gap: "8px", marginBottom: "15px" }}>
          <GraphBox onClick={() => setIsStatModalOpen(true)} title="클릭하여 능력치(노력치/성격) 조절">
            <HexagonGraph origin={{ ...p, hp: customStats.hp, stat: customStats.stat }} />
          </GraphBox>

          <SkillsBox>
            {[1, 2, 3, 4].map((num) => {
              const skillName = selectedSkills[num] || p.skill[num]?.name;
              if (!skillName) return null;
              const skill = skillList.search(skillName);
              return (
                <SkillButton
                  key={num}
                  {...bindLongPress(
                    () => setIsSkillModalOpen(true),
                    () => showSkillDesc(skill)
                  )}
                  title="클릭하여 기술 변경 / 꾹 눌러서 설명 보기"
                >
                  <img src={`/pokemon/img/type/${skill.type}.svg`} alt={skill.name} style={{ width: "17px", height: "17px", marginRight: "5px", borderRadius: "3px", flexShrink: 0 }} />
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "0.70rem",
                      color: "#333",
                      whiteSpace: "nowrap",
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textAlign: "left",
                    }}
                  >
                    {skill.name}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: "38px",
                      textAlign: "right",
                      fontSize: "0.60rem",
                      color: "#888",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PP {skill.pp}/{skill.pp}
                  </span>
                </SkillButton>
              );
            })}
          </SkillsBox>
        </div>

        <InfoBox>{infoText}</InfoBox>

        <ModalButtonContainer style={{ marginTop: "15px" }}>
          <ModalButton
            disabled={isFull}
            $disabled={isFull}
            onClick={() => {
              if (isFull) return;
              if (onAdd) {
                onAdd(p, selectedItem, selectedAbil, selectedSkills, customStats);
              }
              onClose();
            }}
          >
            {submitText}
          </ModalButton>
        </ModalButtonContainer>

        {isAbilSearchOpen && (
          <AbilSearchModal
            pokemon={p}
            currentAbil={selectedAbil}
            onSelect={(newAbil) => {
              setSelectedAbil(newAbil);
              const desc = abilObject[newAbil]?.text || "설명이 없습니다.";
              setInfoText(`[${newAbil}] ${desc}`);
            }}
            onClose={() => setIsAbilSearchOpen(false)}
          />
        )}

        {isItemSearchOpen && (
          <ItemSearchModal
            pokemon={{
              ...p,
              abil: selectedAbil,
              skill: {
                1: skillList.getDataById(selectedSkills[1]) || p.skill?.[1],
                2: skillList.getDataById(selectedSkills[2]) || p.skill?.[2],
                3: skillList.getDataById(selectedSkills[3]) || p.skill?.[3],
                4: skillList.getDataById(selectedSkills[4]) || p.skill?.[4],
              },
            }}
            currentItem={selectedItem}
            onSelect={(newItem) => {
              setSelectedItem(newItem);
              const desc = itemText[newItem] || (newItem === "없음" ? "지닌 도구가 없습니다." : "설명이 없습니다.");
              setInfoText(`[${newItem}] ${desc}`);
            }}
            onClose={() => setIsItemSearchOpen(false)}
          />
        )}

        {isSkillModalOpen && (
          <SkillSearchModal
            pokemon={p}
            equippedSkills={selectedSkills}
            onSave={(newSkills) => {
              setSelectedSkills(newSkills);
              setIsSkillModalOpen(false);
            }}
            onClose={() => setIsSkillModalOpen(false)}
          />
        )}

        {isStatModalOpen && (
          <StatAdjustmentModal
            pokemon={p}
            currentHp={customStats.hp}
            currentStat={customStats.stat}
            currentEvs={customStats.evs}
            currentNature={customStats.nature}
            currentGacha={customStats.gacha}
            onSave={(newStats) => {
              setCustomStats((prev) => ({
                ...prev,
                ...newStats,
              }));
              setIsStatModalOpen(false);
              setInfoText(`능력치가 변경되었습니다: HP ${newStats.hp}, 공격 ${newStats.stat.atk}, 방어 ${newStats.stat.def}, 특공 ${newStats.stat.catk}, 특방 ${newStats.stat.cdef}, 스피드 ${newStats.stat.speed}`);
            }}
            onClose={() => setIsStatModalOpen(false)}
          />
        )}
      </ModalBox>
    </ModalOverlay>
  );
};

export default SampleInfoModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 18px 14px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 92vw;
  max-width: 480px;
  box-sizing: border-box;
  color: #333;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  z-index: 10;

  &:hover {
    color: #111;
    background-color: #f0f0f0;
  }
`;

export const TYPE_COLORS = {
  노말: "#A0A29F",
  불꽃: "#E73B3C",
  물: "#3390F8",
  풀: "#56B13F",
  전기: "#F3C523",
  얼음: "#3BD2DA",
  격투: "#EB812A",
  독: "#9E4ED7",
  땅: "#A76735",
  비행: "#8FA8DD",
  에스퍼: "#E44B79",
  벌레: "#9DB922",
  바위: "#B5B08C",
  고스트: "#664082",
  드래곤: "#4A6DE0",
  악: "#4B4242",
  강철: "#6093A8",
  페어리: "#F37CE6",
};

const TypeBadge = styled.span`
  background-color: ${({ $type }) => TYPE_COLORS[$type] || "#f0f0f0"};
  color: ${({ $type }) => (TYPE_COLORS[$type] ? "#ffffff" : "#555")};
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const ClickableBadge = styled.div`
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  padding: 3px 7px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid rgba(76, 175, 80, 0.3);
  transition: all 0.2s;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  font-size: 0.85rem;
  &:hover {
    background-color: rgba(76, 175, 80, 0.25);
  }
`;

const GraphBox = styled.div`
  flex: 0 0 130px;
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: all 0.2s;

  &:hover {
    background-color: #f5faf5;
    border-color: #4caf50;
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.15);
  }

  @media (max-width: 380px) {
    flex: 0 0 120px;
  }
`;

const SkillsBox = styled.div`
  flex: 1;
  min-width: 0;
  background-color: #fcfcfc;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 4px;
  box-sizing: border-box;
`;

const SkillButton = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 6px;
  padding: 4px 5px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  &:hover {
    background-color: #f5faf5;
    border-color: #4caf50;
  }
`;

const InfoBox = styled.div`
  background-color: #f9f9f9;
  border-left: 4px solid #4caf50;
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #333;
  min-height: 48px;
  display: flex;
  align-items: center;
  text-align: left;
`;

const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
  width: 100%;
  padding: 12px 0;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  background: ${({ $disabled }) => ($disabled ? "#ccc" : "#4caf50")};
  color: ${({ $disabled }) => ($disabled ? "#666" : "white")};
  font-weight: bold;
  transition: all 0.3s ease;

  ${({ $disabled }) =>
    !$disabled &&
    `
    &:hover {
      background: #45a049;
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
    }
  `}
`;
