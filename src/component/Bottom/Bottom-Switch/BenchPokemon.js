import styled from "styled-components";
import HpBar from "../../HpBar";

const BenchPokemon = ({
  pokemon,
  selected,
  onClick,
  setBench,
  setBottom,
  index,
}) => {
  return (
    <BenchWrapper
      className={`${index} ${selected === index ? "selected" : ""}`}
      onClick={() => onClick(index)}
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
      {selected === index && (
        <div>
          {index !== "zero" && (
            <PokemonButton className="switch">교체</PokemonButton>
          )}

          <PokemonButton
            className={`info ${index}`}
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

  &.one {
    top: 31vh;
  }

  &.two {
    top: 43vh;
  }

  &.zero {
    top: 19vh;
  }

  &.selected {
    background-color: rgb(27, 228, 68);
  }
`;

const PokemonName = styled.div`
  position: absolute;
  height: 15vh;
  width: 15vh;
  left: 20vh;
  top: 1.5vh;
`;

const PokemonImage = styled.img`
  position: absolute;
  height: 15vh;
  width: 15vh;
  left: 2vh;
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

  &.info.zero {
    right: 50%;
    transform: translateX(50%);
  }
`;
