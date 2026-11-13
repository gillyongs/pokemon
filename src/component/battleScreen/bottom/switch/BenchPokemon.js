import { hpCalculate } from "../../../../calc/hpCalculate";
import styled from "styled-components";
import HpBar from "../../HpBar";

const BenchPokemon = ({ battle, index, selected, handleSelected, setBench, setBottom, handleSwitch }) => {
  const pokemon = battle[index];
  return (
    <BenchWrapper className={`${index} ${selected === index ? "selected" : ""}`} onClick={() => handleSelected(index)}>
      <PokemonName className={`${index}`}>
        {pokemon.origin.name}
        {pokemon.isMega && <BenchMegaBadge src="/pokemon/img/background/mega.webp" alt="mega" />}
      </PokemonName>
      <PokemonImage className={`${index}`} src={`/pokemon/img/pokemon/${pokemon?.img_id || pokemon?.origin?.pokemon_id}.webp`} alt={`bench2`} />
      <SwitchHpBar>
        <HpBar hp={pokemon.hp} maxHp={hpCalculate(pokemon)} />
      </SwitchHpBar>

      {Object.entries(pokemon.ailment).map(([key, value]) =>
        value != null ? (
          <STATUS key={key} status={statusMap[key]}>
            {statusKor[key]}
          </STATUS>
        ) : null
      )}

      {selected === index && (
        <div>
          {index !== "player" && !pokemon.faint && (
            <PokemonButton className="switch" onClick={() => handleSwitch(index)}>
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
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.75);
  box-sizing: border-box;
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  overflow: hidden;
  transition: all 0.2s ease;

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
    background-color: rgba(22, 45, 64, 0.95);
    border: 2px solid #64ffda;
    box-shadow: 0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15);
  }
`;

const PokemonName = styled.div`
  position: absolute;
  height: 15vh;
  width: 300px;
  left: 21vh;
  top: 1.5vh;
  color: #ffffff;
  font-weight: 700;
`;

const BenchMegaBadge = styled.img`
  width: 14px;
  height: 14px;
  margin-left: 5px;
  vertical-align: middle;
`;

const PokemonImage = styled.img`
  position: absolute;
  height: 11vh;
  width: 11vh;
  left: 4vh;
  bottom: 1.4vh;
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
  top: 1.5vh;
  background-color: rgba(15, 23, 42, 0.85);
  border: 1.5px solid #64ffda;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(100, 255, 218, 0.35);
  transition: all 0.2s ease;
  user-select: none;
  z-index: 10;

  &:hover {
    background-color: #64ffda;
    color: #0f172a;
    box-shadow: 0 0 14px rgba(100, 255, 218, 0.6);
  }

  &:active {
    transform: translateY(1px);
  }

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
  top: 10.5px;
  left: 36vh;
  font-size: 15px;
  padding: 2px 4px;
  border-radius: 5px;
  background-color: ${({ status }) => status};
`;

const statusMap = {
  burn: "red",
  sleep: "gray",
  freeze: "skyblue",
  mabi: "rgb(158, 156, 42)",
  poison: "purple",
  mpoison: "rgba(83, 14, 99, 1)",
};

const statusKor = {
  burn: "화상",
  sleep: "잠듦",
  freeze: "얼음",
  mabi: "마비",
  poison: "독",
  mpoison: "맹독",
};
