import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { pokemonList } from "../entity/Pokemon/PokemonCustom";
import { createBattle } from "../entity/Battle";
// List of available Pokémon IDs

const RandomBattle = () => {
  const navigate = useNavigate();
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);
  // Function to select unique Pokémon from the list
  const selectPokemon = (teamSize = 3) => {
    let team = [];
    while (team.length < teamSize) {
      const randomIndex = Math.floor(Math.random() * pokemonList.length);
      const selectedPokemon = pokemonList[randomIndex];

      // Ensure the selected Pokémon is not already in the team
      if (!team.includes(selectedPokemon)) {
        team.push(selectedPokemon);
      }
    }
    return team;
  };

  // Handle the button click to create the battle
  const handleBattleStart = () => {
    // Select two unique teams
    const team1 = selectPokemon();
    const team2 = selectPokemon();

    // Set the selected teams to the state
    setSelectedTeam1(team1);
    setSelectedTeam2(team2);
    const battleObject = createBattle(team1, team2);

    // Call the createBattle function with the selected teams
    navigate("/battle", { state: { battleObject, isNew: true } });
  };

  return (
    <Container>
      <Button onClick={handleBattleStart}>랜덤 시작</Button>
      <p>Team 1: {selectedTeam1.join(", ")}</p>
      <p>Team 2: {selectedTeam2.join(", ")}</p>
    </Container>
  );
};

export default RandomBattle;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #45a049;
  }
`;
