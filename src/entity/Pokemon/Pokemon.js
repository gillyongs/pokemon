import BattlePokemonRepository from "./PokemonCustomRepository";
//실제 배틀에 사용되는 포켓몬 객체
// 능력치, pp, 상태이상여부, 랭크업, 기절 여부 등 가변 값을 지닌다.
// 불변 값은 origin에서 관리한다
class PokemonOnBattle {
  constructor(id) {
    this.team = ""; // player or npc
    this.id = id;
    const pokemon = BattlePokemonRepository.getItemById(id);
    this.origin = pokemon;
    this.name = pokemon.name; // 메타몽때문에 이름도 가변값이 필요
    this.names = pokemon.names;
    this.hp = pokemon.hp; // 현재 체력
    this.atk = pokemon.atk;
    this.def = pokemon.def;
    this.catk = pokemon.catk;
    this.cdef = pokemon.cdef;
    this.speed = pokemon.speed;
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;
    this.item = pokemon.item;
    this.abil = pokemon.abil;
    this.pp1 = pokemon.sk1.pp;
    this.pp2 = pokemon.sk2.pp;
    this.pp3 = pokemon.sk3.pp;
    this.pp4 = pokemon.sk4.pp;
    this.status = {
      // 기절시 damage.js에서만 초기화된다
      burn: null,
      freeze: null,
      poison: null, //독
      mpoison: null, //맹독
      mabi: null,
      sleep: null,
    };
    this.temp = {
      // 매 턴 초기화
      // turnEnd.js에서 초기화된다
      fullDeath: null, //풀죽음
      miss: null, // 무릎차기
      roost: null, //날개쉬기
      critical: null, //이번 턴 급소 여부
      recentDamageGive: null,
      recentDamageGet: null,
    };
    this.tempStatus = {
      //교체시 초기화
      //switchPokemon.js에서 초기화된다
      rank: {
        // 랭크업
        atk: 0,
        def: 0,
        catk: 0,
        cdef: 0,
        speed: 0,
        critical: 0,
      },
      confuse: null,
      confuseTurnRemain: null, // 별개로 skillUseCheck에서 혼란 턴 끝나면 초기화된다
      onlySkill: null, // 스카프 등 스킬 고정
    };
    this.faint = null; //기절 여부
  }
}

export function generate(id) {
  return new PokemonOnBattle(id);
}
