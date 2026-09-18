import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";
import { pokemonList } from "../entity/Pokemon/PokemonCustom";

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
      <Container>
        <Title>포켓몬 배틀 시뮬레이터</Title>
        <MenuContainer>
          <MenuButton onClick={handleQuickStart}>빠른 시작</MenuButton>
          <MenuButton onClick={() => navigate("/custom")}>커스텀 배틀</MenuButton>
          <MenuButton disabled title="준비 중입니다">포켓몬 도감</MenuButton>
        </MenuContainer>
        <Footer>React Pokemon Battle Simulator</Footer>
      </Container>
    </>
  );
};

export default MainScreen;

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: "CustomFont";
    src: url("/pokemon/font/esamanru Medium.ttf") format("truetype");
  }

  body {
    font-family: "CustomFont", sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #71b7e6, #9b59b6);
  color: white;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 4rem;
  margin-bottom: 4rem;
  text-shadow: 4px 4px 8px rgba(0,0,0,0.4);
  letter-spacing: 2px;
  text-align: center;
  font-weight: bold;
`;

const MenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 320px;
`;

const MenuButton = styled.button`
  padding: 15px 30px;
  font-size: 1.5rem;
  font-family: "CustomFont", sans-serif;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;

  &:hover {
    background-color: white;
    color: #71b7e6;
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.2);
    font-weight: bold;
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    &:hover {
      background-color: rgba(0, 0, 0, 0.2);
      color: white;
      transform: none;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      font-weight: normal;
    }
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 1rem;
  opacity: 0.6;
`;
