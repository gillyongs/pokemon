// 그림자밟기: 상대 특성이 그림자밟기이면 교체할 수 없다
// 고스트 타입이거나 자신도 그림자밟기 특성이면 영향을 받지 않는다
// 맞교체했을때, 그림자밟기 포켓몬이 먼저 교체하면 교체가 된다
export const isShadowTagged = (battle, team) => {
  const self = battle?.[team];
  const opponent = battle?.[team === "player" ? "npc" : "player"];
  if (!self || !opponent || opponent.faint) return false;
  if (opponent.abil !== "그림자밟기") return false;
  if (self.abil === "그림자밟기") return false;
  if (self.type1 === "고스트" || self.type2 === "고스트") return false;
  return true;
};
