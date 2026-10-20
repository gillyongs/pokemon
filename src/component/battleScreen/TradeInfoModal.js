import React, { useState } from 'react';
import styled from 'styled-components';

const HexagonGraph = ({ origin }) => {
  const MAX_STAT = 250;
  const size = 150;
  const center = size / 2;
  const maxRadius = size / 2 - 20; 
  
  const order = ['hp', 'atk', 'def', 'speed', 'cdef', 'catk'];
  const angles = order.map((_, i) => (i * 60 - 90) * (Math.PI / 180));

  const getPoint = (stat, angle) => {
    let val = stat === 'hp' ? origin.hp : origin.stat[stat];
    const r = (Math.min(val, MAX_STAT) / MAX_STAT) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const points = order.map((stat, i) => getPoint(stat, angles[i]));
  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const bgPolygons = [1, 0.66, 0.33].map(scale => {
    return order.map((_, i) => {
      const x = center + (maxRadius * scale) * Math.cos(angles[i]);
      const y = center + (maxRadius * scale) * Math.sin(angles[i]);
      return `${x},${y}`;
    }).join(' ');
  });

  const labels = { hp: 'HP', atk: '공격', def: '방어', speed: '스피드', cdef: '특방', catk: '특공' };

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {bgPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(a)} y2={center + maxRadius * Math.sin(a)} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      ))}
      <polygon points={polygonPoints} fill="rgba(100, 255, 218, 0.5)" stroke="#64ffda" strokeWidth="2" />
      {order.map((stat, i) => {
        const labelR = maxRadius + 15;
        const x = center + labelR * Math.cos(angles[i]);
        const y = center + labelR * Math.sin(angles[i]);
        return (
          <text key={i} x={x} y={y} fill="#aaa" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {labels[stat]}
          </text>
        );
      })}
    </svg>
  );
};

const TradeInfoModal = ({ pokemon, onClose }) => {
  const [infoText, setInfoText] = useState("기술, 특성, 지닌물건을 클릭하면 설명이 나옵니다.");
  const p = pokemon.origin;

  const handleAbilClick = () => {
    const desc = p.abilObj?.text || "특성 설명이 없습니다.";
    setInfoText(`[${p.abil}] ${desc}`);
  };

  const handleItemClick = () => {
    const desc = p.itemText || "아이템 설명이 없습니다.";
    setInfoText(`[${p.item}] ${desc}`);
  };

  const handleSkillClick = (skill) => {
    const desc = skill.text || "기술 설명이 없습니다.";
    setInfoText(`[${skill.name}] ${desc}`);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", alignItems: "stretch", marginBottom: "15px" }}>
          <div style={{ flex: "0 0 100px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px" }}>
            <img src={`/pokemon/img/pokemon/${p.pokemon_id}.webp`} alt={p.name} style={{ width: "95%", height: "95%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: "1", paddingLeft: "15px", lineHeight: "1.6", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <h2 style={{ color: "#fff", margin: "0", fontSize: "1.5rem", whiteSpace: "nowrap" }}>{p.name}</h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#aaa", width: "65px" }}>타입:</span>
              <TypeBadge>{p.type1}</TypeBadge>
              {p.type2 && <TypeBadge>{p.type2}</TypeBadge>}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#aaa", width: "65px" }}>특성:</span>
              <ClickableBadge onClick={handleAbilClick}>{p.abil}</ClickableBadge>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#aaa", width: "65px" }}>지닌물건:</span>
              <ClickableBadge onClick={handleItemClick}>{p.item}</ClickableBadge>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#444", margin: "10px 0" }} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <div style={{ flex: "0 0 160px", display: "flex", justifyContent: "center" }}>
            <HexagonGraph origin={p} />
          </div>
          <div style={{ flex: "1", fontSize: "0.95rem", lineHeight: "1.6", display: "grid", gridTemplateColumns: "auto auto", gap: "5px 10px", textAlign: "left", paddingLeft: "15px", whiteSpace: "nowrap" }}>
            <div><strong style={{ color: "#aaa" }}>HP:</strong> {p.hp}</div>
            <div><strong style={{ color: "#aaa" }}>스피드:</strong> {p.stat.speed}</div>
            <div><strong style={{ color: "#aaa" }}>공격:</strong> {p.stat.atk}</div>
            <div><strong style={{ color: "#aaa" }}>특수공격:</strong> {p.stat.catk}</div>
            <div><strong style={{ color: "#aaa" }}>방어:</strong> {p.stat.def}</div>
            <div><strong style={{ color: "#aaa" }}>특수방어:</strong> {p.stat.cdef}</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
          {[1, 2, 3, 4].map(num => {
            const skill = p.skill[num];
            if (!skill || !skill.name) return null;
            return (
              <SkillButton key={num} onClick={() => handleSkillClick(skill)}>
                <img src={`/pokemon/img/type/${skill.type}.svg`} alt={skill.name} style={{ width: "24px", height: "24px", marginRight: "8px", borderRadius: "4px" }} />
                <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                  <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#fff", whiteSpace: "nowrap" }}>{skill.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "#aaa", whiteSpace: "nowrap" }}>PP {skill.pp}/{skill.pp}</span>
                </div>
              </SkillButton>
            )
          })}
        </div>

        <InfoBox>
          {infoText}
        </InfoBox>

        <ModalButtonContainer style={{ marginTop: "15px" }}>
          <ModalButton $primary $isWin={true} onClick={onClose}>닫기</ModalButton>
        </ModalButtonContainer>

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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
`;

const ModalBox = styled.div`
  background: rgba(15, 20, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px 25px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  width: 90vw;
  max-width: 500px;
  color: #ddd;
`;

const TypeBadge = styled.span`
  background-color: rgba(255,255,255,0.15);
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
`;

const ClickableBadge = styled.div`
  background-color: rgba(100, 255, 218, 0.15);
  color: #64ffda;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid rgba(100, 255, 218, 0.3);
  transition: all 0.2s;
  &:hover {
    background-color: rgba(100, 255, 218, 0.3);
  }
`;

const SkillButton = styled.div`
  display: flex;
  align-items: center;
  background-color: rgba(0,0,0,0.5);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
  transition: all 0.2s;
  overflow: hidden;
  &:hover {
    background-color: rgba(255,255,255,0.1);
    border-color: #64ffda;
  }
`;

const InfoBox = styled.div`
  background-color: rgba(0, 0, 0, 0.5);
  border-left: 4px solid #64ffda;
  padding: 12px 15px;
  border-radius: 4px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #fff;
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
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  font-weight: bold;
  transition: all 0.3s ease;
  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 5px 15px rgba(100, 255, 218, 0.2);
  }
`;
