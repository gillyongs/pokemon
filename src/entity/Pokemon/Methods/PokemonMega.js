import { josa } from "josa";
import { abilObject, applyAbilityEffects } from "../../Ability";

export const PokemonMega = {
  isMegaEvolveAble(battle) {
    if (this.faint) return false;
    if (this.isMega) return false;
    if (battle.megaUsed?.[this.team]) return false;
    if (!this.o.megaData) return false;
    if (this.item !== this.o.megaData.stone) return false;
    return true;
  },

  // 하위 호환 유지
  canMega(battle) {
    return this.isMegaEvolveAble(battle);
  },

  megaEvolve(battle, enqueue) {
    if (!this.isMegaEvolveAble(battle)) return;
    battle.megaUsed[this.team] = true;

    const mega = this.o.megaData;

    // 1. 도구 반응 텍스트 (진화 전 원본 상태)
    enqueue({
      id: "eb794c41-0d86-4f58-9812-5391b3ffcef0",
      battle,
      text: josa(`${this.name}의 ${this.item}#{이} 반응했다!`),
    });

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
    enqueue({
      id: "0c2dbb7e-c2bc-4509-b8c1-dcd41ddafc1e",
      battle,
      text: `${this.names("는")} ${josa(`${mega.name}#{으로}`)} 메가진화했다!`,
    });

    // 4. 메가진화 후 특성 발동 (가뭄 등 등장 특성)
    applyAbilityEffects(battle, this.team, enqueue);
  },
};
