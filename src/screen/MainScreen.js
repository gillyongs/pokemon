import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import { pokemonList } from "../entity/Pokemon/PokemonTemplate";

const MainScreen = () => {
  const navigate = useNavigate();

  const selectPokemon = (teamSize = 3) => {
    let team = [];
    while (team.length < teamSize) {
      const randomIndex = Math.floor(Math.random() * pokemonList.length);
      const selectedPokemon = pokemonList[randomIndex];
      if (!team.includes(selectedPokemon)) {
        team.push(selectedPokemon);
      }
    }
    return team;
  };

  const handleQuickStart = () => {
    const team1 = selectPokemon();
    const team2 = selectPokemon();
    navigate("/battle", { state: { team1, team2, isNew: true } });
  };

  return (
    <>
      <GlobalStyle />
      <BackgroundWrapper>
        <PokeballBackground />
        <Container>
          <TitleWrapper>
            <Title>
              포켓몬 배틀
              <br className="mobile-break" /> 시뮬레이터
            </Title>
          </TitleWrapper>
          <MenuContainer>
            <MenuButton onClick={handleQuickStart}>
              <IconWrapper>
                <PokeballIcon />
              </IconWrapper>
              빠른 배틀 시작
            </MenuButton>
            <MenuButton onClick={() => navigate("/custom")}>
              <IconWrapper>
                <PokeballIcon />
              </IconWrapper>
              커스텀 배틀
            </MenuButton>
          </MenuContainer>
        </Container>
      </BackgroundWrapper>
    </>
  );
};

export default MainScreen;

// --- Keyframes ---
const bgMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// --- Global Style ---
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "CustomFont";
    src: url("/pokemon/font/esamanru Medium.ttf") format("truetype");
  }
  body {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    overflow-y: auto;
    font-family: "CustomFont", sans-serif;
  }
`;

// --- Styled Components ---
const BackgroundWrapper = styled.div`
  position: relative;
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  /* 기존 그라데이션 배경을 유지하면서 */
  background: linear-gradient(-45deg, #2b5876, #4e4376, #141e30, #243b55);
  background-size: 400% 400%;
  animation: ${bgMove} 15s ease infinite;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 2rem 0; /* 상하 여백 보장 */

  @media (max-width: 768px) {
    /* 모바일 브라우저 하단 배너를 스크롤해서 숨길 수 있도록 최소 높이를 살짝 키움 */
    min-height: calc(100vh + 20px);
    min-height: calc(100dvh + 20px);
    padding-bottom: 0;
  }

  /* main.png를 반투명하게 깔아주는 가상 요소 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("/pokemon/img/background/main.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.4; /* 반투명 조절 */
    z-index: 0;
    pointer-events: none;
  }
`;

const PokeballBackground = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  height: 80vw;
  max-width: 800px;
  max-height: 800px;
  border-radius: 50%;
  border: 40px solid rgba(255, 255, 255, 0.05);
  background: transparent;
  z-index: 0;
  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 40px;
    background: rgba(255, 255, 255, 0.05);
    transform: translateY(-50%);
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 40px solid rgba(255, 255, 255, 0.05);
    background: transparent;
  }
`;

const Container = styled.div`
  position: relative;
  z-index: 1;
  margin: auto; /* 내용이 적을 때는 정중앙 배치, 길어지면 위에서부터 스크롤되도록 보장 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  padding: 4rem 6rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.18);
  /* 타이틀이 2줄로 접히는 구간(1100px 이하)에서 컨테이너가 글씨 길이에 맞춰 
     정사각형처럼 좁아지지 않도록 너비를 강제로 넓혀줍니다 */
  @media (max-width: 1100px) {
    padding: 3.5rem 4rem;
    width: 85vw;
    max-width: 700px;
  }
  @media (max-width: 768px) {
    width: 90%;
    max-width: 400px;
    border-radius: 20px;
    padding: 3.5rem 1.5rem;\n    transform: translateY(-4vh);
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
`;

const TitleWrapper = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  width: 100%;
  animation: ${float} 4s ease-in-out infinite;

  @media (max-width: 768px) {
    margin-bottom: 2.7rem;
  }
`;

const Title = styled.h1`
  font-size: 4.1rem;
  margin: 0;
  color: #ffcb05; /* Pokemon Yellow */
  -webkit-text-stroke: 2px #3b4cca; /* Pokemon Blue */
  text-shadow:
    4px 4px 0 #3b4cca,
    8px 8px 12px rgba(0, 0, 0, 0.6);
  letter-spacing: 2px;
  line-height: 1.25;
  white-space: nowrap;

  br.mobile-break {
    display: none;
  }

  @media (max-width: 1100px) {
    br.mobile-break {
      display: block;
    }
    white-space: normal;
  }

  @media (max-width: 768px) {
    font-size: 3.6rem;
  }

  @media (max-width: 480px) {
    font-size: 2.64rem;
    -webkit-text-stroke: 1.5px #3b4cca;
    text-shadow:
      3px 3px 0 #3b4cca,
      6px 6px 10px rgba(0, 0, 0, 0.6);
  }
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin: 10px 0 0 0;
  color: white;
  letter-spacing: 5px;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 400px;

  @media (max-width: 768px) {
    gap: 1.08rem;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    margin-right: 11px;
  }
`;

const PokeballIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid currentColor;
  position: relative;
  background: linear-gradient(to bottom, currentColor 50%, transparent 50%);

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: -2px;
    right: -2px;
    height: 2px;
    background: currentColor;
    transform: translateY(-50%);
  }

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 2px solid currentColor;
    background: white; /* inside is always solid */
    transform: translate(-50%, -50%);
  }

  @media (max-width: 768px) {
    width: 17px;
    height: 17px;

    &::after {
      width: 4.3px;
      height: 4.3px;
    }
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 2rem;
  font-size: 1.5rem;
  font-family: inherit;
  color: #333;
  background: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.2),
    inset 0 -4px 0 rgba(0, 0, 0, 0.1);
  font-weight: bold;

  @media (max-width: 768px) {
    padding: 0.86rem 1.44rem;
    font-size: 1.08rem;
  }

  &:hover:not(:disabled) {
    background: #ffcb05;
    color: #3b4cca;
    transform: translateY(-4px);
    box-shadow:
      0 8px 15px rgba(0, 0, 0, 0.3),
      inset 0 -4px 0 rgba(0, 0, 0, 0.1);

    ${IconWrapper} {
      animation: ${spin} 1s linear infinite;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0px);
    box-shadow:
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 -2px 0 rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.4);
    color: rgba(0, 0, 0, 0.4);
    cursor: not-allowed;
    box-shadow: none;

    ${PokeballIcon} {
      border-color: rgba(0, 0, 0, 0.4);
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 50%, transparent 50%);
    }
    ${PokeballIcon}::before {
      background: rgba(0, 0, 0, 0.4);
    }
    ${PokeballIcon}::after {
      border-color: rgba(0, 0, 0, 0.4);
      background: rgba(255, 255, 255, 0.2);
    }
  }
`;
