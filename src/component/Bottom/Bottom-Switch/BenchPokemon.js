import styled from "styled-components";
import HpBar from "../../HpBar";

const BenchPokemon = ({
  battle,
  index,
  selected,
  handleSelected,
  setBench,
  setBottom,
  handleSwitch,
}) => {
  const pokemon = battle[index];
  return (
    <BenchWrapper
      className={`${index} ${selected === index ? "selected" : ""}`}
      onClick={() => handleSelected(index)}
    >
      <PokemonName className={`${index}`}>{pokemon.origin.name}</PokemonName>
      <PokemonImage
        className={`${index}`}
        src={`/pokemon/img/pokemon/${pokemon.origin.pokemon_id}.webp`}
        alt={`bench2`}
      />
      <SwitchHpBar>
        <HpBar hp={pokemon.hp} maxHp={pokemon.origin.hp} />
      </SwitchHpBar>

      {Object.entries(pokemon.status).map(([key, value]) =>
        value != null ? (
          <STATUS key={key} status={statusMap[key]}>
            {statusKor[key]}
          </STATUS>
        ) : null
      )}

      {selected === index && (
        <div>
          {index !== "player" && !pokemon.faint && (
            <PokemonButton
              className="switch"
              onClick={() => handleSwitch(index)}
            >
              교체
            </PokemonButton>
          )}

          <PokemonButton
            className={`info ${index} ${pokemon.faint}`}
            onClick={(e) => {
              e.stopPropagation();
              setBench(index);
              setBottom("info");
            }}
          >
            상세정보
          </PokemonButton>
        </div>
      )}
    </BenchWrapper>
  );
};

export default BenchPokemon;

// Styled Components

const BenchWrapper = styled.div`
  position: absolute;
  width: 96vw;
  height: 11vh;
  left: 2vw;
  border-radius: 5px; /* 모서리 둥글게 */
  background-color: rgba(0, 0, 0, 0.7);
  overflow: hidden; /* 넘치는 부분 숨김 */

  &.playerBench1 {
    top: 31vh;
  }

  &.playerBench2 {
    top: 43vh;
  }

  &.player {
    top: 19vh;
  }

  &.selected {
    background-color: rgb(27, 228, 68);
  }
`;

const PokemonName = styled.div`
  position: absolute;
  height: 15vh;
  width: 300px;
  left: 21vh;
  top: 1.5vh;
`;

const PokemonImage = styled.img`
  position: absolute;
  height: 12vh;
  width: 12vh;
  left: 2vh;
  bottom: 0.3vh;
`;

const SwitchHpBar = styled.div`
  position: absolute;
  left: 20vh;
  bottom: 13vh;
`;

const PokemonButton = styled.div`
  position: absolute;
  height: 8vh;
  width: 15vh;
  top: 2vh;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;

  &.switch {
    left: 6vh;
  }

  &.info {
    right: 6vh;
  }

  &.info.player {
    right: 50%;
    transform: translateX(50%);
  }
  &.info.true {
    right: 50%;
    transform: translateX(50%);
  }
`;

const STATUS = styled.div`
  position: absolute;
  color: white;
  top: 14px;
  left: 36vh;
  font-size: 10px;
  padding: 2px 4px;
  border-radius: 5px;
  background-color: ${({ status }) => status};
`;

const statusMap = {
  burn: "red",
  sleep: "gray",
  freeze: "skyblue",
  mabi: "rgb(158, 156, 42)",
  poision: "purple",
  mpoision: "darkpurple",
};

const statusKor = {
  burn: "화상",
  sleep: "잠듦",
  freeze: "얼음",
  mabi: "마비",
  poision: "독",
  mpoision: "맹독",
};
