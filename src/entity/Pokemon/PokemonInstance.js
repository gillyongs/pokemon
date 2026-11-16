import { josa } from "josa";
import { hpCalculate } from "../../calc/hpCalculate";
import sampleList from "./pokemonSampleList";
import { cloneWithMethods } from "../../util/cloneWithMethods";

import { PokemonRecover } from "./Methods/PokemonRecover";
import { PokemonAbil } from "./Methods/PokemonAbil.js";
import { PokemonGetDamage } from "./Methods/PokemonGetDamage.js";
import { PokemonRank } from "./Methods/PokemonRank.js";
import { PokemonMega } from "./Methods/PokemonMega.js";
import { PokemonAugment } from "./Methods/PokemonAugment.js";
import { PokemonInstanceAccess } from "./Methods/PokemonInstanceAccess.js";

// 실제 배틀에 사용되는 포켓몬 객체
// samplePokmon 객체를 받아 현재 체력, 상태이상여부, 기절 여부 등 배틀 중에 바뀌는 가변적인 프로퍼티를 추가한다.
// 최대 체력, 도감번호 등 불변 값은 origin에서만 가지고있고 getter로 접근한다.
class PokemonInstance {
  constructor(sample, team, options = { difficulty: "이지", round: 1 }) {
    this.team = team; // "player" or "npc", 인스턴스 만들때 인자로 받는다

    this.o = cloneWithMethods(sample);

    // 난이도 및 라운드에 따른 NPC 스탯 보정 =============================================
    if (team === "npc" && options.difficulty !== "이지") {
      const multiplier = 1.0 + (options.round - 1) * 0.1;
      this.o.hp = Math.floor(this.o.hp * multiplier);
      if (options.difficulty === "하드") {
        this.o.stat.atk = Math.floor(this.o.stat.atk * multiplier);
        this.o.stat.def = Math.floor(this.o.stat.def * multiplier);
        this.o.stat.catk = Math.floor(this.o.stat.catk * multiplier);
        this.o.stat.cdef = Math.floor(this.o.stat.cdef * multiplier);
        this.o.stat.speed = Math.floor(this.o.stat.speed * multiplier);
      }
    }

    // origin에서 전달받은 값 중 가변 값 ========================================================
    this.name = this.o.name;
    if (team === "npc") {
      this.name = "상대 " + this.name;
    }

    this.hp = this.o.hp; // 현재 체력
    this.type1 = this.o.type1;
    this.type2 = this.o.type2;
    this.item = this.o.item;
    this.abil = {
      ...this.o.abil,
      used: false,
    };

    this.pp = {
      1: this.o.skill[1].pp,
      2: this.o.skill[2].pp,
      3: this.o.skill[3].pp,
      4: this.o.skill[4].pp,
      5: 9999,
    };

    // instance에서 새로 추가되는 가변값 ===============================================================

    this.ailment = {
      // 상태이상
      burn: null,
      freeze: null,
      freezeBug: null, //영구동결 (1세대 눈보라 증강)
      poison: null, //독
      mpoison: null, //맹독
      mabi: null,
      sleep: null,
    };

    this.turn = {
      // 매 턴 초기화
      // turnEnd.js에서 초기화된다
      choice: null, // 이번턴 행동 선택 ('1','2','3','4','playerBench1', ...)
      fullDeath: null, // 풀죽음
      jumpKickFail: null, // 무릎차기 실패 여부 -> 1.빗나감 2.방어 3.상성(고스트)
      roost: null, //날개쉬기
      critical: null, // 공격의 급소 여부. damageCalculate 호출 직전에 skillUser에서 계산하여 적용. 연속기에선 매 공격 직전마다 계산
      recentDamageGive: null, // 최근 준 데미지 -> 반동, 흡수 계산에 사용
      recentDamageGet: null, // 최근 받은 데미지 -> 카운터에 사용
      protect: null, //방어
      useSkill: null, //이번턴 사용한 (사용할) 스킬
      substitute: null, // 이번 턴에 대타출동 상태였는지 여부. 대타출동을 깨뜨린 공격의 부가효과도 막기 위함
      lastHitSubstitute: null, // 직전 타격이 대타에 맞았는지 여부 (연속기 타격별 판정용)
      knockedOutNpcThisTurn: null, // 이번 턴 공격기로 상대 포켓몬을 쓰러뜨렸는지 여부
      damagedThisTurn: null, // 이번 턴 데미지 받았는지 여부 (워모그)
      skillLaunched: null, // 이번 턴 기술이 실제로 시전 단계(afterSkillCheck 발동부)에 진입했는지 여부
    };
    this.tempStatus = {
      //교체시 초기화
      //switch.js(switchPokemon)에서 초기화된다
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
      noSound: null, // 지옥찌르기 -> 소리 기술 사용 금지
      protectUse: null, //방어 연속 사용 횟수 -> 방어 성공률 계산에 사용
      taunt: null, //도발
      protosynthesis: null, //고대활성
      protosynthesisBySun: null, //고대활성 쾌청 여부 -> 쾌청으로 발동된 고대활성은 날씨 바뀌면 꺼진다
      quarkDrive: null, //쿼크차지
      quarkDriveByField: null, //쿼크차지 일렉트릭필드 여부 -> 일렉트릭필드로 발동된 쿼크차지는 필드 바뀌면 꺼진다
      seed: null, //씨뿌리기
      substitute: null, // 대타출동
      substituteHp: null, // 대타출동 인형 남은 체력
      flashFire: null, // 타오르는불꽃
      switchLock: null, // 교체불가 (교체불가로 만든 기술명이 들어간다)
      switchLockTurnRemain: null, // 교체불가 남은 턴
      disable: null, // 저주받은바디/사술묶기로 봉인된 기술명
      disableTurnRemain: null, // 기술 봉인 남은 턴
      glaiveRush: null, // 대검돌격 디메리트
      destinyBond: false, // 길동무 상태
      hitCount: 0, // 피격 횟수 (분노의주먹 위력계산) * 교체하면 초기화되게 너프됐음
      firstTurn: true, // 배틀 등장 첫 턴 여부 (속이기, 만나자마자 성공 판정)
      turnsOnField: 0, // 필드에 나온 턴 수 (슬로스타트)
      unburden: false, // 곡예: 도구 소모/상실 시 true, 교체 시 초기화
    };
    this.img_id = null; // 포켓몬 스프라이트만 바꾸고 싶을때 사용 (기기기어르, 1세대 뮤츠)
    this.faint = null; //기절 여부
    this.isMega = false; //메가진화 여부
    this.auto = null; //자동 행동 여부 (역린)
    this.autoSN = null;
    this.charge = null; //충전중 여부 (파워풀허브 없이 충전 기술을 썼을때)
    this.recharge = null; //반동휴식 여부 (파괴광선 등)
    this.augments = [];
    this.agument = {
      dragonKillCount: 0, // 용용죽겠지
      mejaiStack: 0, // 메자이
      practiceCritStack: 0, // 윤탈
      giantBonusHp: 0, // 거인의 흡수
      nimbleSkillName: null, // 민첩한 몸놀림으로 강화된 기술명
      pickedAbility: null, // 특성 야바위 뽑은 특성 (증강 유지시 필요)
      sword: {
        level: 0, // 검 강화 레벨
        failed: false, // 검 강화 실패 여부
        bonusAtk: 0, // 검 강화 공격/특공 보너스
        name: null, // 검 강화 명칭
      },
      // 영혼의주사위 스탯
      soulDiceStats: {
        atk: 0,
        def: 0,
        catk: 0,
        cdef: 0,
        speed: 0,
      },
      // 모루능력치 스탯
      anvilStats: {
        atk: 0,
        def: 0,
        catk: 0,
        cdef: 0,
        speed: 0,
      },
    };
    this.log = {
      getAugmentedStat: null, // 증강으로 인한 능력치 변화
      hpCalculate: null, // 증강으로 인한 최대 HP 변화
      damage1: null,
      damage2: null,
      speedCalculate: null,
      speedVS: null,
    };
  }

  names(postposition) {
    return josa(`${this.name}#{${postposition}}`);
  }

  // 원본 이름 기반 조사 헬퍼 (로그 출력 시 "상대 " 접두사 방지 등)
  baseNames(postposition) {
    return josa(`${this.o.name}#{${postposition}}`);
  }

  // 도구 소모/상실 전용 메서드 (곡예 특성 발동 포함)
  consumeItem() {
    if (!this.item) return null;
    const lostItem = this.item;
    this.item = null;
    if (this.abil?.name === "곡예" && this.tempStatus) {
      this.tempStatus.unburden = true;
    }
    return lostItem;
  }

  // --- 원본 복원 전용 메서드 ---
  resetType() {
    if (this.isMega && this.o.megaData) {
      this.type1 = this.o.megaData.type1;
      this.type2 = this.o.megaData.type2;
    } else {
      this.type1 = this.o.type1;
      this.type2 = this.o.type2;
    }
  }

  resetAbil() {
    this.abil = {
      ...this.o.abil,
      used: false,
    };
  }

  // 상태이상 초기화
  // 기절, 부활, 초승달춤, 치유소원, 회복약 (증강)
  resetAilment() {
    // 초승달춤에서도 사용
    Object.keys(this.ailment).forEach((key) => {
      this.ailment[key] = null;
    });
  }

  // 턴 종료시 turn 초기화
  resetTurn() {
    const t = this.turn;
    Object.keys(t).forEach((key) => {
      t[key] = null;
    });
  }

  // 교체시 tempStatus 초기화
  resetTempStatus() {
    const ts = this.tempStatus;
    Object.keys(ts).forEach((key) => {
      if (key === "firstTurn") {
        ts[key] = true;
      } else if (key !== "rank") {
        ts[key] = null;
      } else {
        Object.keys(ts.rank).forEach((rk) => {
          ts.rank[rk] = 0;
        });
      }
    });
  }

  // 떠있음 여부 체크
  // 그래스필드 회복(terrian.js), 필드 데미지 보정 (damageCalculate.js)
  // 미스트필드 상태이상 방지 (ailment.js)
  // 일렉트릭필드 잠듦 가능여부(ailment.js), 일렉트릭필드 하품 가능 여부(skillEffect.js),
  // 압정, 독압정, 끈적끈적네트(field.js), 교체시 장판 체크 (npc/easy.js),
  // 땅타입 상성 계산(typeEffectCalculate.js)에서 사용
  isFlying(battle, isSkill) {
    // isSkill: 상대방의 기술에 의한것인지 여부. 특성 틀깨기로 인한 부유 차단을 위해 사용
    // 땅타입 상성계산, 장판기, 하품 및 상태이상 가능 여부 체크할때 true
    const pokemon = this;
    const enemy = pokemon.team === "player" ? battle.npc : battle.player;

    // 부유 특성
    if (pokemon.abil?.name === "부유") {
      if (isSkill && enemy?.abil?.feature?.tgg === true) {
        // 상대 특성이 틀깨기이면 압정, 독압정, 끈적끈적네트에 맞는다. (압정을 깐 포켓몬이 아니라, 압정을 밟았을때 상대 포켓몬이 틀깨기여야한다.)
        // 일렉트릭필드일때 상대(틀깨기)가 하품/최면술을 쓴다 = 부유 판정 못받음 = 필드 효과 받음 = 잠들지 않음
      } else {
        // 필드 데미지 보정, 그래스필드 회복은 틀깨기 적용 안됨 = 부유 판정 받음 = 필드 효과 못받음
        return true;
      }
    }

    // 틀깨기 적용: 압정, 독압정, 끈적끈적네트
    // 틀깨기 미적용: 그래스필드 회복,

    // 풍선
    if (pokemon.item === "풍선") {
      return true;
    }

    // 비행 타입
    if (pokemon.type1 === "비행" || pokemon.type2 === "비행") {
      if (pokemon.turn.roost) {
        return false; // 날개쉬기 사용 중이면 지상으로 간주 ==========================================================
      }
      return true;
    }

    // 그 외에는 지상
    return false;
  }

  leftOver(battle, enqueue) {
    if (this.faint) return;
    const maxHp = hpCalculate(this);

    if (this.item === "먹다남은음식") {
      if (this.hp < maxHp) {
        this.recover(battle, Math.floor(maxHp / 16), enqueue, `${this.names("는")} 먹다남은음식으로 인해 조금 회복했다.`);
      }
    } else if (this.item === "검은진흙") {
      const isPoison = this.type1 === "독" || this.type2 === "독";
      if (isPoison) {
        if (this.hp < maxHp) {
          this.recover(battle, Math.floor(maxHp / 16), enqueue, `${this.names("는")} 검은진흙으로 인해 조금 회복했다.`);
        }
      } else {
        const text = `${this.names("는")} 검은진흙으로 인해 데미지를 입었다!`;
        this.getDamage(battle, enqueue, Math.floor(maxHp / 8), text);
      }
    }

    // 증강: 회복 (매 턴 최대 HP의 1/16만큼 회복)
    if (this.hasAugment("recovery")) {
      if (this.hp < maxHp) {
        this.recover(battle, Math.floor(maxHp / 16), enqueue, `[증강 회복] ${this.names("는")} 체력을 조금 회복했다.`);
      }
    }
  }
}

Object.assign(PokemonInstance.prototype, PokemonRecover, PokemonAbil, PokemonGetDamage, PokemonRank, PokemonMega, PokemonAugment);
Object.defineProperties(PokemonInstance.prototype, Object.getOwnPropertyDescriptors(PokemonInstanceAccess));

// entry: sampleName 문자열 또는 커스텀 슬롯 엔트리 객체
export function generatePokemonInstance(entry, team = "player", options = { difficulty: "노말", round: 1 }) {
  return new PokemonInstance(sampleList.buildSample(entry), team, options);
}

export default PokemonInstance;
