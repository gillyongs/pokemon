export const SWORD_ENHANCE_TIERS = [
  { level: 0, name: "낡은 단검", bladeColor: "#94a3b8", edgeColor: "#cbd5e1", hiltColor: "#78350f", auraColor: "transparent", glow: false },
  { level: 1, name: "수련용 목검", bladeColor: "#b45309", edgeColor: "#d97706", hiltColor: "#451a03", auraColor: "transparent", glow: false },
  { level: 2, name: "돌검", bladeColor: "#64748b", edgeColor: "#94a3b8", hiltColor: "#334155", auraColor: "transparent", glow: false },
  { level: 3, name: "청동검", bladeColor: "#d97706", edgeColor: "#fbbf24", hiltColor: "#78350f", auraColor: "rgba(245, 158, 11, 0.2)", glow: false },
  { level: 4, name: "강철 롱소드", bladeColor: "#cbd5e1", edgeColor: "#f8fafc", hiltColor: "#475569", auraColor: "rgba(148, 163, 184, 0.25)", glow: false },
  { level: 5, name: "기사의 브로드소드", bladeColor: "#e2e8f0", edgeColor: "#ffffff", hiltColor: "#eab308", auraColor: "rgba(250, 204, 21, 0.3)", glow: true },
  { level: 6, name: "은빛 레이피어", bladeColor: "#bae6fd", edgeColor: "#f0f9ff", hiltColor: "#0284c7", auraColor: "rgba(56, 189, 248, 0.35)", glow: true },
  { level: 7, name: "피의 카타나", bladeColor: "#ef4444", edgeColor: "#fecaca", hiltColor: "#7f1d1d", auraColor: "rgba(239, 68, 68, 0.4)", glow: true },
  { level: 8, name: "룬 블레이드", bladeColor: "#38bdf8", edgeColor: "#e0f2fe", hiltColor: "#1d4ed8", auraColor: "rgba(59, 130, 246, 0.45)", glow: true },
  { level: 9, name: "작열하는 화염검", bladeColor: "#f97316", edgeColor: "#fef08a", hiltColor: "#9a3412", auraColor: "rgba(249, 115, 22, 0.5)", glow: true },
  { level: 10, name: "혹한의 빙결검", bladeColor: "#22d3ee", edgeColor: "#ecfeff", hiltColor: "#155e75", auraColor: "rgba(34, 211, 238, 0.55)", glow: true },
  { level: 11, name: "뇌전의 천둥검", bladeColor: "#facc15", edgeColor: "#ffffff", hiltColor: "#854d0e", auraColor: "rgba(250, 204, 21, 0.6)", glow: true },
  { level: 12, name: "용살자의 대검", bladeColor: "#dc2626", edgeColor: "#fde047", hiltColor: "#1e293b", auraColor: "rgba(220, 38, 38, 0.65)", glow: true },
  { level: 13, name: "심연의 마검", bladeColor: "#9333ea", edgeColor: "#f3e8ff", hiltColor: "#3b0764", auraColor: "rgba(168, 85, 247, 0.65)", glow: true },
  { level: 14, name: "천상의 빛의 검", bladeColor: "#fef08a", edgeColor: "#ffffff", hiltColor: "#ca8a04", auraColor: "rgba(254, 240, 138, 0.7)", glow: true },
  { level: 15, name: "성검 엑스칼리버", bladeColor: "#fde047", edgeColor: "#ffffff", hiltColor: "#2563eb", auraColor: "rgba(56, 189, 248, 0.75)", glow: true },
  { level: 16, name: "신검 그람", bladeColor: "#34d399", edgeColor: "#ecfdf5", hiltColor: "#065f46", auraColor: "rgba(52, 211, 153, 0.75)", glow: true },
  { level: 17, name: "마검 레바테인", bladeColor: "#fb7185", edgeColor: "#fff1f2", hiltColor: "#881337", auraColor: "rgba(244, 63, 94, 0.8)", glow: true },
  { level: 18, name: "차원절단도", bladeColor: "#c084fc", edgeColor: "#ffffff", hiltColor: "#1e1b4b", auraColor: "rgba(192, 132, 252, 0.85)", glow: true },
  { level: 19, name: "창세의 신검", bladeColor: "#67e8f9", edgeColor: "#ffffff", hiltColor: "#f59e0b", auraColor: "rgba(103, 232, 249, 0.9)", glow: true },
  { level: 20, name: "태초의 집행검", bladeColor: "#fef08a", edgeColor: "#ffffff", hiltColor: "#ec4899", auraColor: "rgba(244, 114, 182, 0.95)", glow: true },
];

export const getSwordEnhanceTier = (level = 0) => {
  const idx = Math.max(0, Math.min(SWORD_ENHANCE_TIERS.length - 1, Number(level) || 0));
  return SWORD_ENHANCE_TIERS[idx];
};

export const getSwordEnhanceProb = (level = 0) => {
  return Math.max(1, 95 - (Number(level) || 0) * 5);
};
