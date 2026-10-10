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
        <polygon key={i} points={pts} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line key={i} x1={center} y1={center} x2={center + maxRadius * Math.cos(a)} y2={center + maxRadius * Math.sin(a)} stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
      ))}
      <polygon points={polygonPoints} fill="rgba(76, 175, 80, 0.5)" stroke="#4caf50" strokeWidth="2" />
      {order.map((stat, i) => {
        const labelR = maxRadius + 15;
        const x = center + labelR * Math.cos(angles[i]);
        const y = center + labelR * Math.sin(angles[i]);
        return (
          <text key={i} x={x} y={y} fill="#777" fontSize="11" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
            {labels[stat]}
          </text>
        );
      })}
    </svg>
  );
};

const SampleInfoModal = ({ pokemon, onClose }) => {
  const [infoText, setInfoText] = useState("특성, 아이템, 기술을 클릭하면 설명이 나옵니다.");
  const p = pokemon; // CustomScreen에서는 객체 자체가 origin 형태임

  const handleAbilClick = () => {
    const desc = p.abilObj?.text || "설명이 없습니다.";
    setInfoText(`[${p.abil}] ${desc}`);
  };

  const handleItemClick = () => {
    const desc = p.itemText || "설명이 없습니다.";
    setInfoText(`[${p.item}] ${desc}`);
  };

  const handleSkillClick = (skill) => {
    const desc = skill.text || "설명이 없습니다.";
    setInfoText(`[${skill.name}] ${desc}`);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        
        <div style={{ display: "flex", alignItems: "stretch", marginBottom: "15px" }}>
          <div style={{ flex: "0 0 100px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5", borderRadius: "10px", padding: "10px", border: "1px solid #eee" }}>
            <img src={`/pokemon/img/pokemon/${p.pokemon_id}.webp`} alt={p.name} style={{ width: "95%", height: "95%", objectFit: "contain" }} />
          </div>
          <div style={{ flex: "1", paddingLeft: "15px", lineHeight: "1.6", textAlign: "left", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <h2 style={{ color: "#333", margin: "0", fontSize: "1.5rem", whiteSpace: "nowrap" }}>{p.name}</h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "65px" }}>타입:</span>
              <TypeBadge>{p.type1}</TypeBadge>
              {p.type2 && <TypeBadge>{p.type2}</TypeBadge>}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "65px" }}>특성:</span>
              <ClickableBadge onClick={handleAbilClick}>{p.abil}</ClickableBadge>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
              <span style={{ color: "#777", width: "65px" }}>아이템:</span>
              <ClickableBadge onClick={handleItemClick}>{p.item}</ClickableBadge>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: "#eee", margin: "10px 0" }} />

        <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
          <div style={{ flex: "0 0 160px", display: "flex", justifyContent: "center" }}>
            <HexagonGraph origin={p} />
          </div>
          <div style={{ flex: "1", fontSize: "0.95rem", lineHeight: "1.6", display: "grid", gridTemplateColumns: "auto auto", gap: "5px 10px", textAlign: "left", paddingLeft: "15px", whiteSpace: "nowrap" }}>
            <div><strong style={{ color: "#777" }}>HP:</strong> {p.hp}</div>
            <div><strong style={{ color: "#777" }}>스피드:</strong> {p.stat.speed}</div>
            <div><strong style={{ color: "#777" }}>공격:</strong> {p.stat.atk}</div>
            <div><strong style={{ color: "#777" }}>특공:</strong> {p.stat.catk}</div>
            <div><strong style={{ color: "#777" }}>방어:</strong> {p.stat.def}</div>
            <div><strong style={{ color: "#777" }}>특방:</strong> {p.stat.cdef}</div>
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
                  <span style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#333", whiteSpace: "nowrap" }}>{skill.name}</span>
                  <span style={{ fontSize: "0.75rem", color: "#777", whiteSpace: "nowrap" }}>PP {skill.pp}/{skill.pp}</span>
                </div>
              </SkillButton>
            )
          })}
        </div>

        <InfoBox>
          {infoText}
        </InfoBox>

        <ModalButtonContainer style={{ marginTop: "15px" }}>
          <ModalButton onClick={onClose}>닫기</ModalButton>
        </ModalButtonContainer>

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
  background: white;
  border-radius: 12px;
  padding: 20px 25px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90vw;
  max-width: 500px;
  color: #333;
`;

const TypeBadge = styled.span`
  background-color: #f0f0f0;
  color: #555;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: bold;
`;

const ClickableBadge = styled.div`
  background-color: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  border: 1px solid rgba(76, 175, 80, 0.3);
  transition: all 0.2s;
  &:hover {
    background-color: rgba(76, 175, 80, 0.25);
  }
`;

const SkillButton = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s;
  overflow: hidden;
  &:hover {
    background-color: #f0f0f0;
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
  cursor: pointer;
  background: #4caf50;
  color: white;
  font-weight: bold;
  transition: all 0.3s ease;
  &:hover {
    background: #45a049;
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.2);
  }
`;
