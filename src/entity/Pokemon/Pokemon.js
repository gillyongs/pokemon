import BattlePokemonRepository from "./PokemonCustomRepository";
import { maxStatFinder, getStatName } from "../../function/rankStat";
import { PokemonRecover } from "./Methods/PokemonRecover";
import { PokemonAbil } from "./Methods/PokemonAbil.js";
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
      useSkill: null, //이번턴 사용한 (사용할) 스킬
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
      protosynthesisBySun: null, //고대활성 쾌청 여부 -> 쾌청으로 발동된 고대활성은 날씨 바뀌면 꺼진다
      seed: null, //씨뿌리기
      substitute: null, // 대타출동
      substituteHp: null, // 대타출동 인형 남은 체력
      flashFire: null, // 타오르는불꽃
      switchLock: null, // 교체불가 (교체불가로 만든 기술명이 들어간다)
      switchLockTurnRemain: null, // 교체불가 남은 턴
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

  // 기절시 상태이상 초기화
  resetStatus() {
    // 초승달춤에서도 사용
    Object.keys(this.status).forEach((key) => {
      this.status[key] = null;
    });
  }

  // 턴 종료시 temp 초기화
  resetTemp() {
    const t = this.temp;
    Object.keys(t).forEach((key) => {
      t[key] = null;
    });
  }

  // 교체시 tempStatus 초기화
  resetTempStatus() {
    const ts = this.tempStatus;
    Object.keys(ts).forEach((key) => {
      if (key !== "rank") {
        ts[key] = null;
      } else {
        Object.keys(ts.rank).forEach((rk) => {
          ts.rank[rk] = 0;
        });
      }
    });
  }

  getDamage(battle, enqueue, damageValue, text) {
    // 기준 = 급소 없음, 탈 안 까임, 멀스 적용 안됨
    // field: 스텔스록
    // onHit: 특성(철가시), 울멧
    // turnEnd: 상태이상(독, 화상), 씨뿌리기, 마그마스톰
    // skillEffect: 생구, 무릎차기 빗나감, 반동, 대다출동
    const actualDamage = this.#applyDamage(Math.floor(damageValue));
    if (text) enqueue({ battle, text });
    if (this.hp <= 0) {
      this.handleFaint(battle, enqueue);
    } else {
      this.tryBerry(battle, enqueue);
    }
    return actualDamage;
  }

  #applyDamage(damage) {
    const prevHp = this.hp;
    this.hp = Math.max(this.hp - damage, 0);
    return prevHp - this.hp; // 실제 입은 데미지 (씨뿌리기 흡혈뎀 계산에 사용)
  }

  handleFaint(battle, enqueue) {
    // attackDmage, 초승달춤에서도 사용
    this.hp = 0;
    this.faint = true;
    this.resetStatus();
    this.resetTemp();
    this.resetTempStatus();
    enqueue({ battle, text: this.names + " 쓰러졌다!" });
  }

  tryBerry(battle, enqueue) {
    // attackDmage에서도 사용
    const atkTeam = this.team === "npc" ? "player" : "npc";
    const atkPokemon = battle[atkTeam];
    const atkAbil = atkPokemon.abil;
    let noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];
    if (noBerryAbil.includes(atkAbil)) {
      return;
    }

    if (this.item === "자뭉열매" && this.hp <= this.origin.hp / 2) {
      this.item = null;
      this.recover(battle, Math.floor(this.origin.hp / 4), enqueue, this.names + " 자뭉열매로 체력을 회복했다!");
    }
  }

  isFlying(battle) {
    const pokemon = this;
    const enemy = pokemon.team === "player" ? battle.npc : battle.player;

    // 부유 특성 (상대가 틀깨기면 무시)
    if (pokemon.abil === "부유" && enemy?.abilObj?.feature?.tgg !== true) {
      return true;
    }

    // 풍선
    if (pokemon.item === "풍선") {
      return true;
    }

    // 비행 타입
    if (pokemon.type1 === "비행" || pokemon.type2 === "비행") {
      if (pokemon.temp.roost) {
        return false; // 날개쉬기 사용 중이면 지상으로 간주 ==========================================================
      }
      return true;
    }

    // 그 외에는 지상
    return false;
  }
}

Object.assign(PokemonOnBattle.prototype, PokemonRecover, PokemonAbil);

export function generate(id) {
  return new PokemonOnBattle(id);
}
