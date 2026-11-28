import React from "react";
import styled, { keyframes, css } from "styled-components";
import { TYPE_COLORS } from "../../../entity/TypeData";

const AILMENT_TINTS = {
  burn: { color: "red", opacity: 0.42, glow: "rgba(255, 40, 40, 0.55)" },
  sleep: { color: "gray", opacity: 0.5, glow: "rgba(128, 128, 128, 0.5)" },
  freeze: { color: "skyblue", opacity: 0.48, glow: "rgba(135, 206, 235, 0.65)" },
  freezeBug: { color: "skyblue", opacity: 0.48, glow: "rgba(135, 206, 235, 0.65)" },
  mabi: { color: "rgb(190, 186, 36)", opacity: 0.45, glow: "rgba(190, 186, 36, 0.6)" },
  poison: { color: "purple", opacity: 0.45, glow: "rgba(160, 32, 240, 0.55)" },
  mpoison: { color: "rgba(83, 14, 99, 1)", opacity: 0.52, glow: "rgba(110, 20, 135, 0.65)" },
};

const PokemonImage = ({ battle, type }) => {
  const pokemon = type === "npc" ? battle.npc : battle.player;

  const isSubstitute = !!pokemon?.tempStatus?.substitute;
  const isEternamax = !isSubstitute && pokemon?.uniqueKey === "0890-m";
  const isDynamax = !isSubstitute && !isEternamax && pokemon?.tempStatus?.dynamax > 0;
  const isTera = !isSubstitute && !isEternamax && !isDynamax && Boolean(pokemon?.isTera);
  const teraType = pokemon?.teraType || pokemon?.type1 || "노말";
  const teraColor = TYPE_COLORS[teraType] || "#64ffda";

  const activeAilment = !isSubstitute && pokemon?.ailment ? Object.entries(pokemon.ailment).find(([, value]) => value != null)?.[0] || null : null;

  const pokeImgId = pokemon.img_id || pokemon.uniqueKey;
  const imageSrc = isSubstitute ? `/pokemon/img/background/substitute_${type === "npc" ? "front" : "back"}.webp` : `/pokemon/img/pokemon/${pokeImgId}.webp`;

  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
        <defs>
          {Object.entries(AILMENT_TINTS).map(([key, { color, opacity }]) => (
            <filter key={key} id={`ailment-tint-${type}-${key}`} colorInterpolationFilters="sRGB">
              <feFlood floodColor={color} floodOpacity={opacity} result="flood" />
              <feComposite in="flood" in2="SourceAlpha" operator="in" result="tint" />
              <feComposite in="tint" in2="SourceGraphic" operator="over" />
            </filter>
          ))}
          {isTera && (
            <filter id={`tera-crystal-${type}`} colorInterpolationFilters="sRGB">
              <feFlood floodColor={teraColor} floodOpacity="0.24" result="teraFlood" />
              <feComposite in="teraFlood" in2="SourceAlpha" operator="in" result="teraTint" />
              <feBlend in="SourceGraphic" in2="teraTint" mode="screen" result="screened" />
              <feFlood floodColor="#ffffff" floodOpacity="0.16" result="shineFlood" />
              <feComposite in="shineFlood" in2="SourceAlpha" operator="in" result="shineMask" />
              <feComposite in="shineMask" in2="screened" operator="over" />
            </filter>
          )}
        </defs>
      </svg>
      <StyledPokemonImage
        className={type}
        src={imageSrc}
        alt={`${type} Pokemon`}
        $isSubstitute={isSubstitute}
        $isEternamax={isEternamax}
        $isDynamax={isDynamax}
        $isTera={isTera}
        $teraColor={teraColor}
        $ailment={activeAilment}
        $type={type}
      />
      {isTera && (
        <TeraCrystalOverlay className={type} $teraColor={teraColor} aria-hidden="true">
          <TeraCrownWrap>
            <svg viewBox="0 0 64 52" width="46" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id={`crownGrad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="45%" stopColor={teraColor} stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              {/* 다면체 보석 왕관 실루엣 */}
              <polygon points="32,2 44,16 32,24 20,16" fill={`url(#crownGrad-${type})`} stroke="#ffffff" strokeWidth="1.2" />
              <polygon points="10,12 20,16 24,36 12,32" fill={teraColor} fillOpacity="0.88" stroke="#ffffff" strokeWidth="1.1" />
              <polygon points="54,12 44,16 40,36 52,32" fill={teraColor} fillOpacity="0.88" stroke="#ffffff" strokeWidth="1.1" />
              <polygon points="20,16 32,24 44,16 40,38 24,38" fill="#ffffff" fillOpacity="0.32" stroke="#ffffff" strokeWidth="1.2" />
              <polygon points="24,38 40,38 32,48" fill={teraColor} fillOpacity="0.95" stroke="#ffffff" strokeWidth="1.1" />
            </svg>
            <TeraCrownTypeIcon src={`/pokemon/img/type/${teraType}.svg`} alt={teraType} />
          </TeraCrownWrap>
          <SparkleDot $delay="0s" style={{ top: "12%", left: "6%" }}>✦</SparkleDot>
          <SparkleDot $delay="0.6s" style={{ top: "24%", right: "4%" }}>✦</SparkleDot>
          <SparkleDot $delay="1.1s" style={{ bottom: "18%", left: "12%" }}>✦</SparkleDot>
          <SparkleDot $delay="0.35s" style={{ bottom: "26%", right: "10%" }}>✦</SparkleDot>
        </TeraCrystalOverlay>
      )}
    </>
  );
};

export default PokemonImage;

const breath = keyframes`
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2.5px) scale(1.02); }
  100% { transform: translateY(0) scale(1); }
`;

const breathFlip = keyframes`
  0% { transform: scaleX(-1) translateY(0) scale(1); }
  50% { transform: scaleX(-1) translateY(-2.5px) scale(1.02); }
  100% { transform: scaleX(-1) translateY(0) scale(1); }
`;

const crownFloat = keyframes`
  0%, 100% { transform: translate(-50%, 0); }
  50% { transform: translate(-50%, -4px); }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0.25; transform: scale(0.75); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const getPokemonFilter = ($ailment, $type, $isDynamax, $isTera, $teraColor) => {
  const parts = [];
  if ($ailment && AILMENT_TINTS[$ailment]) {
    parts.push(`url(#ailment-tint-${$type}-${$ailment})`);
    if (!$isDynamax && !$isTera) {
      parts.push(`drop-shadow(0 0 5px ${AILMENT_TINTS[$ailment].glow})`);
    }
  }
  if ($isTera) {
    parts.push(
      `url(#tera-crystal-${$type})`,
      "brightness(1.12)",
      "contrast(1.14)",
      "saturate(1.22)",
      "drop-shadow(1px 0 0 rgba(255, 255, 255, 0.85))",
      "drop-shadow(-1px 0 0 rgba(255, 255, 255, 0.85))",
      "drop-shadow(0 1px 0 rgba(255, 255, 255, 0.85))",
      "drop-shadow(0 -1px 0 rgba(255, 255, 255, 0.85))",
      `drop-shadow(0 0 7px ${$teraColor})`,
      `drop-shadow(0 0 14px ${$teraColor})`
    );
  }
  if ($isDynamax) {
    parts.push("drop-shadow(1.5px 0 0 #ff1e56)", "drop-shadow(-1.5px 0 0 #ff1e56)", "drop-shadow(0 1.5px 0 #ff1e56)", "drop-shadow(0 -1.5px 0 #ff1e56)", "drop-shadow(0 0 8px rgba(255, 20, 80, 0.85))");
  }
  return parts.length > 0 ? parts.join(" ") : "none";
};

const StyledPokemonImage = styled.img`
  width: ${({ $isEternamax, $isDynamax }) => ($isEternamax ? "60vw" : $isDynamax ? "90vw" : "30vw")};
  height: ${({ $isEternamax, $isDynamax }) => ($isEternamax ? "60vw" : $isDynamax ? "90vw" : "30vw")};
  max-width: ${({ $isEternamax, $isDynamax }) => ($isEternamax ? "240px" : $isDynamax ? "360px" : "120px")};
  max-height: ${({ $isEternamax, $isDynamax }) => ($isEternamax ? "240px" : $isDynamax ? "360px" : "120px")};
  position: absolute;
  filter: ${({ $ailment, $type, $isDynamax, $isTera, $teraColor }) => getPokemonFilter($ailment, $type, $isDynamax, $isTera, $teraColor)};
  transition:
    filter 0.2s ease,
    width 0.25s ease,
    height 0.25s ease,
    right 0.25s ease,
    top 0.25s ease,
    left 0.25s ease,
    bottom 0.25s ease;

  ${({ className, $isSubstitute, $isEternamax, $isDynamax }) =>
    className === "plr"
      ? css`
          right: ${$isEternamax ? "1vw" : $isDynamax ? "calc(8.5vw - min(30vw, 120px))" : "8.5vw"};
          top: ${$isEternamax ? "-17vh" : $isDynamax ? "calc(-3vh - min(60vw, 240px))" : "-3vh"};
          ${!$isSubstitute &&
          css`
            transform: scaleX(-1);
            animation: ${breathFlip} 2s infinite ease-in-out;
          `}
          ${$isSubstitute &&
          css`
            top: 1vh;
            animation: ${breath} 2s infinite ease-in-out;
          `}
          animation-delay: 0.3s;
        `
      : css`
          left: ${$isEternamax ? "3vw" : $isDynamax ? "calc(8.5vw - min(30vw, 120px))" : "8.5vw"};
          bottom: ${$isEternamax ? "10vh" : "-2vh"};
          animation: ${breath} 3s infinite ease-in-out;

          ${$isSubstitute &&
          css`
            top: -9.5vh;
            bottom: auto; /* bottom 대신 top 적용을 위해 초기화 */
          `}
        `}
`;

const TeraCrystalOverlay = styled.div`
  position: absolute;
  width: 30vw;
  height: 30vw;
  max-width: 120px;
  max-height: 120px;
  pointer-events: none;
  z-index: 2;

  &.plr {
    right: 8.5vw;
    top: -3vh;
  }

  &.npc {
    left: 8.5vw;
    bottom: -2vh;
  }
`;

const TeraCrownWrap = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.85));
  animation: ${crownFloat} 2.2s infinite ease-in-out;
`;

const TeraCrownTypeIcon = styled.img`
  position: absolute;
  width: 14px;
  height: 14px;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
`;

const SparkleDot = styled.span`
  position: absolute;
  font-size: 13px;
  line-height: 1;
  color: #ffffff;
  text-shadow: 0 0 6px #ffffff, 0 0 10px #bae6fd;
  animation: ${twinkle} 1.6s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay || "0s"};
`;
