import sampleList from "../Pokemon/SamplePokemon";
import { generate } from "../Pokemon/PokemonInstance";

export const AUGMENT_LIST = [
  {
    id: "noUnfairMiss",
    name: "억까 방지",
    desc: "명중률이 80% 이상인 기술이 절대 빗나가지 않습니다.",
  },
  {
    id: "mandoocornEndure",
    name: "만두콘은 이왕걸을 슬프게 하지 않게 하려고 버텼다",
    desc: "기절할 공격을 받을 때 10% 확률로 HP 1로 버팁니다.",
  },
  {
    id: "gamblingAddict",
    name: "도박 중독",
    desc: "모든 공격기(물리/특수)의 명중률이 절반이 되지만, 기술 위력이 2배가 됩니다.",
  },
  {
    id: "rouletteWheel",
    name: "돌려 돌려 돌림판",
    desc: "현재 포켓몬을 임의의 포켓몬으로 교체합니다.",
    onApply: (pokemon, battle) => {
      if (!battle) return;
      const allItems = sampleList.items || [];
      const filtered = allItems.filter((item) => item.id !== pokemon.id);
      if (filtered.length === 0) return;
      const picked = filtered[Math.floor(Math.random() * filtered.length)];
      const newPoke = generate(picked.id);

      newPoke.team = pokemon.team || "player";
      newPoke.originalIndex = pokemon.originalIndex !== undefined ? pokemon.originalIndex : 0;
      newPoke.augments = [...(pokemon.augments || [])];

      if (battle.player === pokemon) {
        battle.player = newPoke;
      } else if (battle.playerBench1 === pokemon) {
        battle.playerBench1 = newPoke;
      } else if (battle.playerBench2 === pokemon) {
        battle.playerBench2 = newPoke;
      }
      Object.assign(pokemon, newPoke);
    },
  },
  {
    id: "swordAndShield",
    name: "오른손에 방패 왼손엔 검",
    desc: "공격과 방어, 특수공격과 특수방어 능력치를 서로 맞바꿉니다.",
    onApply: (pokemon) => {
      if (!pokemon?.origin?.stat) return;
      const stat = pokemon.origin.stat;
      const tempAtk = stat.atk;
      stat.atk = stat.def;
      stat.def = tempAtk;

      const tempCatk = stat.catk;
      stat.catk = stat.cdef;
      stat.cdef = tempCatk;
    },
  },
];
