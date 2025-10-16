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
    this.type1 = pokemon.type1;
    this.type2 = pokemon.type2;
    this.item = pokemon.item;
    this.itemText = pokemon.itemText;
    this.abil = pokemon.abil;
    this.abilObj = pokemon.abilObj;
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
      jumpKickFail: null, // 무릎차기 실패 여부 -> 1.빗나감 2.방어 3.상성(고스트)
      roost: null, //날개쉬기
      critical: null, //이번 턴 급소 여부 아 근데 이거 다단히트 생기면 바꿔야하는데
      recentDamageGive: null, // 최근 준 데미지 -> 반동, 흡수 계산에 사용
      recentDamageGet: null,
      protect: null, //방어
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
      onlySkill: null, // 스카프 등 고정된 스킬
      recentSkillUse: null, // 최근 사용 스킬 -> 연속사용불가스킬 (블러드문) 체크에 사용.
      recentSkillGet: null,
      hapum: null, //하품
      protectUse: null, //방어 연속 사용 횟수 -> 방어 성공률 계산에 사용
      taunt: null, //도발
      protosynthesis: null, //고대활성
      seed: null, //씨뿌리기
      substitute: null, //대타출동
      substituteHp: null, //대타출동 인형 남은 체력
    };
    this.faint = null; //기절 여부
    this.auto = null; //자동 행동 여부 (역린)
    this.autoSN = null;
    this.charge = null; //충전중 여부 (파워풀허브 없이 충전 기술을 썼을때)
    this.log = {
      damage1: null,
      damage2: null,
      speedCalculate: null,
      speedVS: null,
    };
  }
}

export function generate(id) {
  return new PokemonOnBattle(id);
}
