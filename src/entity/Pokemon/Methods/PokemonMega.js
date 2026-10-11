import { josa } from "josa";
import { abilObject } from "../../Ability";

export const PokemonMega = {
  isMegaEvolveAble(battle) {
    if (this.faint) return false;
    if (this.isMega) return false;
    if (battle.megaUsed?.[this.team]) return false;
    if (!this.origin.megaData) return false;
    if (this.item !== this.origin.megaData.stone) return false;
    return true;
  },

  // 하위 호환 유지
  canMega(battle) {
    return this.isMegaEvolveAble(battle);
  },

  megaEvolve(battle, enqueue) {
    if (!this.isMegaEvolveAble(battle)) return;
    battle.megaUsed[this.team] = true;

    const mega = this.origin.megaData;

    // 1. 도구 반응 텍스트 (진화 전 원본 상태)
    enqueue({
      battle,
      text: `${this.name}의 ${this.item}이(가) 반응했다!`,
    });

    // 2. 메가진화 데이터 반영 (상태, 이미지, 스탯, 특성 등 변경 - 이름은 원래 이름 유지)
    this.isMega = true;
    this.type1 = mega.type1;
    this.type2 = mega.type2;
    this.origin.pokemon_id = mega.pokemon_id;

    // 체력은 변하지 않는다
    this.origin.stat.atk = mega.stat.atk;
    this.origin.stat.def = mega.stat.def;
    this.origin.stat.catk = mega.stat.catk;
    this.origin.stat.cdef = mega.stat.cdef;
    this.origin.stat.speed = mega.stat.speed;

    this.abil = mega.abil;
    this.abilObj = abilObject[mega.abil] || { name: mega.abil };
    this.origin.abil = mega.abil;
    this.origin.abilObj = this.abilObj;

    // 3. 메가진화 완료 텍스트 (메가진화 후 이미지/아이콘이 적용된 상태로 큐에 등록)
    enqueue({
      battle,
      text: `${this.names} ${mega.name}로 메가진화했다!`,
    });
  },
};
