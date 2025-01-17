import React from "react";

const HpBar = ({ hp, maxHp }) => {
  // HP 바의 너비를 계산 (hp/maxHp 비율로)
  let hpWidth = (hp / maxHp) * 100; // 비율을 백분율로 계산
  if (hp <= 0) {
    hpWidth = 0;
  }

  return (
    <div
      className="current-hp"
      style={{
        width: `${hpWidth}%`, // HP에 비례한 너비
      }}
    ></div>
  );
};

export default HpBar;
