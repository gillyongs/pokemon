import { josa } from "josa";
import { abilObject, applyAbilityEffects } from "../../Ability";
import { cloneWithMethods } from "../../../util/cloneWithMethods";

export const PokemonMega = {
  isMegaEvolveAble(battle) {
    if (this.faint) return false;
    if (this.isMega) return false;
    if (this.isTera || this.tempStatus?.dynamax > 0) return false;
    if (battle.system?.megaUsed?.[this.team]) return false;
    if (!this.o.megaData) return false;
    if (this.o.megaData.isPrimal) return false; // 원시회귀는 등장 시 자동 발동
    if (this.o.megaData.requiredSkill) {
      const hasRequiredSkill = [1, 2, 3, 4].some((num) => this.skill?.[num]?.name === this.o.megaData.requiredSkill);
      if (!hasRequiredSkill) return false;
    } else if (this.item !== this.o.megaData.stone) {
      return false;
    }
    return true;
  },

  // 하위 호환 유지
  canMega(battle) {
    return this.isMegaEvolveAble(battle);
  },

  // 원시회귀 가능 여부
  isPrimalRevertAble() {
    if (this.faint) return false;
    if (this.isMega || this.isPrimal) return false;
    if (!this.o.megaData?.isPrimal) return false;
    if (this.item !== this.o.megaData.stone) return false;
    return true;
  },

  // 원시회귀 실행 (등장 시 applyAbilityEffects 내에서 자동 호출)
  primalRevert(battle, enqueue) {
    if (!this.isPrimalRevertAble()) return;

    const primal = this.o.megaData;

    // 1. 도구 반응 텍스트 (원시회귀 전 일반 모습)
    enqueue(cloneWithMethods(battle), josa(`${this.name}의 ${this.item}#{이} 눈부신 빛을 발산했다!`), "primal_orb_react");

    // 2. 원시회귀 데이터 반영 (이미지, 스탯, 특성 등)
    this.isPrimal = true;
    this.isMega = true;
    this.type1 = primal.type1;
    this.type2 = primal.type2;
    this.o.type1 = primal.type1;
    this.o.type2 = primal.type2;
    this.o.dexNo = primal.dexNo;
    this.o.uniqueKey = primal.uniqueKey;

    this.o.stat.atk = primal.stat.atk;
    this.o.stat.def = primal.stat.def;
    this.o.stat.catk = primal.stat.catk;
    this.o.stat.cdef = primal.stat.cdef;
    this.o.stat.speed = primal.stat.speed;

    const primalAbilObj = {
      ...(abilObject[primal.abil] || {}),
      name: primal.abil,
      used: false,
    };
    this.abil = primalAbilObj;
    this.o.abil = { ...primalAbilObj };

    // 3. 원시회귀 완료 텍스트 (원시 모습으로 변신)
    enqueue(battle, `${this.names("는")} 원시회귀하여 원시의 모습으로 돌아갔다!`, "primal_revert_done");
  },

  megaEvolve(battle, enqueue) {
    if (!this.isMegaEvolveAble(battle)) return;
    battle.system.megaUsed[this.team] = true;

    const mega = this.o.megaData;

    // 1. 도구/기도 반응 텍스트 (진화 전 원본 상태)
    const reactText = mega.requiredSkill ? `강한 기도가 ${this.name}에게 닿았다!` : josa(`${this.name}의 ${this.item}#{이} 반응했다!`);
    enqueue(cloneWithMethods(battle), reactText, "mega_stone_react");

    // 2. 메가진화 데이터 반영 (상태, 이미지, 스탯, 특성 등 변경 - 이름은 원래 이름 유지)
    this.isMega = true;
    this.type1 = mega.type1;
    this.type2 = mega.type2;
    this.o.type1 = mega.type1;
    this.o.type2 = mega.type2;
    this.o.dexNo = mega.dexNo;
    this.o.uniqueKey = mega.uniqueKey;

    // 체력은 변하지 않는다
    this.o.stat.atk = mega.stat.atk;
    this.o.stat.def = mega.stat.def;
    this.o.stat.catk = mega.stat.catk;
    this.o.stat.cdef = mega.stat.cdef;
    this.o.stat.speed = mega.stat.speed;

    const megaAbilObj = {
      ...(abilObject[mega.abil] || {}),
      name: mega.abil,
      used: false,
    };
    this.abil = megaAbilObj;
    this.o.abil = { ...megaAbilObj };

    // 3. 메가진화 완료 텍스트 (메가진화 후 이미지/아이콘이 적용된 상태로 큐에 등록)
    enqueue(battle, `${this.names("는")} ${josa(`${mega.name}#{으로}`)} 메가진화했다!`, "mega_evolve_done");

    // 4. 메가진화 후 특성 발동 (가뭄 등 등장 특성)
    applyAbilityEffects(battle, this.team, enqueue);
  },
};
