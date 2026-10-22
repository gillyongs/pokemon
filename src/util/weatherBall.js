export const getWeatherBallType = (weather) => {
  if (!weather) return "노말";
  if (weather.isSunny) return "불꽃";
  if (weather.isRainy) return "물";
  if (weather.isSandstorm) return "바위";
  const w = typeof weather.get === "function" ? weather.get() : weather.get;
  if (w === "설경" || w === "눈") return "얼음";
  return "노말";
};
