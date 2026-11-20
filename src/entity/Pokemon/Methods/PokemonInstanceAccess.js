import { hpCalculate } from "../../../calc/hpCalculate";

export const PokemonInstanceAccess = {
  // --- 불변 식별자 및 스펙 Getter (외부 직접 o 접근 방지 및 캡슐화) ---
  get sampleName() {
    return this.o.sampleName;
  },

  get id() {
    return this.o.sampleName;
  },

  get dexNo() {
    return this.o.dexNo;
  },

  get uniqueKey() {
    return this.o.uniqueKey;
  },

  get skill() {
    return this.o.skill;
  },

  get feature() {
    return this.o.feature;
  },

  get role() {
    return this.o.role;
  },

  get stat() {
    return this.o.stat;
  },

  get evs() {
    return this.o.evs;
  },

  get megaData() {
    return this.o.megaData;
  },

  get megaAbil() {
    return this.o?.megaData?.abil;
  },
  set megaAbil(v) {
    if (this.o?.megaData) {
      this.o.megaData.abil = v;
    }
  },

  get megaDataAbil() {
    return this.megaAbil;
  },
  set megaDataAbil(v) {
    this.megaAbil = v;
  },

  get baseHp() {
    return this.o.hp;
  },

  get baseName() {
    return this.o.name;
  },

  get originalItem() {
    return this.o.item;
  },

  get originalAbil() {
    return this.o.abil;
  },

  // --- 증강(agument / augment) 상태 프로퍼티 및 하위 호환 게터/세터 ---
  get augment() {
    return this.agument;
  },
  set augment(v) {
    this.agument = v;
  },

  get dragonKillCount() {
    return this.agument?.dragonKillCount ?? 0;
  },
  set dragonKillCount(v) {
    if (!this.agument) this.agument = {};
    this.agument.dragonKillCount = v;
  },

  get mejaiStack() {
    return this.agument?.mejaiStack ?? 0;
  },
  set mejaiStack(v) {
    if (!this.agument) this.agument = {};
    this.agument.mejaiStack = v;
  },

  get practiceCritStack() {
    return this.agument?.practiceCritStack ?? 0;
  },
  set practiceCritStack(v) {
    if (!this.agument) this.agument = {};
    this.agument.practiceCritStack = v;
  },

  get giantBonusHp() {
    return this.agument?.giantBonusHp ?? 0;
  },
  set giantBonusHp(v) {
    if (!this.agument) this.agument = {};
    this.agument.giantBonusHp = v;
  },

  get nimbleSkillName() {
    return this.agument?.nimbleSkillName ?? null;
  },
  set nimbleSkillName(v) {
    if (!this.agument) this.agument = {};
    this.agument.nimbleSkillName = v;
  },

  get anvilStats() {
    return this.agument?.anvilStats;
  },
  set anvilStats(v) {
    if (!this.agument) this.agument = {};
    this.agument.anvilStats = v;
  },

  get soulDiceStats() {
    return this.agument?.soulDiceStats;
  },
  set soulDiceStats(v) {
    if (!this.agument) this.agument = {};
    this.agument.soulDiceStats = v;
  },

  get sword() {
    return this.agument?.sword;
  },
  set sword(v) {
    if (!this.agument) this.agument = {};
    this.agument.sword = v;
  },

  get swordLevel() {
    return this.agument?.sword?.level ?? 0;
  },
  set swordLevel(v) {
    if (!this.agument) this.agument = {};
    if (!this.agument.sword) this.agument.sword = { level: 0, failed: false, bonusAtk: 0, name: null };
    this.agument.sword.level = v;
  },

  get swordFailed() {
    return this.agument?.sword?.failed ?? false;
  },
  set swordFailed(v) {
    if (!this.agument) this.agument = {};
    if (!this.agument.sword) this.agument.sword = { level: 0, failed: false, bonusAtk: 0, name: null };
    this.agument.sword.failed = v;
  },

  get swordBonusAtk() {
    return this.agument?.sword?.bonusAtk ?? 0;
  },
  set swordBonusAtk(v) {
    if (!this.agument) this.agument = {};
    if (!this.agument.sword) this.agument.sword = { level: 0, failed: false, bonusAtk: 0, name: null };
    this.agument.sword.bonusAtk = v;
  },

  get swordName() {
    return this.agument?.sword?.name ?? null;
  },
  set swordName(v) {
    if (!this.agument) this.agument = {};
    if (!this.agument.sword) this.agument.sword = { level: 0, failed: false, bonusAtk: 0, name: null };
    this.agument.sword.name = v;
  },

  // =========================================================================
  // 아케인셰이드 투핸드소드, 스타포스, 위대한 엄니의 소울, 큐브 관련 명시적 접근자
  // =========================================================================
  get arcaneSword() {
    if (!this.agument) this.agument = {};
    if (!this.agument.arcaneSword) {
      this.agument.arcaneSword = {
        successCount: 0,
        starCount: 0,
        scrollAtk: 0,
        scrollCatk: 0,
        scrollSpeed: 0,
        name: null,
        hasSoul: false,
        cubeLines: null,
        cubeStats: {
          defIgnore: 0, // 몬스터 방어율 무시 (%)
          atkRate: 0, // 공격 (%)
          catkRate: 0, // 특수공격 (%)
          speedRate: 0, // 스피드 (%)
          defRate: 0, // 방어 (%)
          cdefRate: 0, // 특수방어 (%)
          atkFlat: 0, // 공격 (+)
          catkFlat: 0, // 특수공격 (+)
          defFlat: 0, // 방어 (+)
          cdefFlat: 0, // 특수방어 (+)
          speedFlat: 0, // 스피드 (+)
          damageRate: 0, // 데미지 (%)
          critRate: 0, // 급소 확률 증가 (%)
          poisonRate: 0, // 공격 시 맹독 부여 (%)
          freezeRate: 0, // 공격 시 빙결 부여 (%)
        },
        hasRolledCube: false,
      };
    }
    return this.agument.arcaneSword;
  },
  set arcaneSword(v) {
    if (!this.agument) this.agument = {};
    if (v && typeof v === "object") {
      this.agument.arcaneSword = {
        ...this.arcaneSword,
        ...v,
      };
    } else {
      this.agument.arcaneSword = v;
    }
  },

  get arcaneSuccessCount() {
    return this.arcaneSword.successCount ?? this._arcaneSuccessCount ?? this.agument?.arcaneSuccessCount ?? 0;
  },
  set arcaneSuccessCount(v) {
    const val = Number(v || 0);
    this._arcaneSuccessCount = val;
    this.arcaneSword.successCount = val;
    if (this.agument) this.agument.arcaneSuccessCount = val;
  },

  get arcaneStarCount() {
    if (this.arcaneSword?.starCount) return this.arcaneSword.starCount;
    if (this._arcaneStarCount) return this._arcaneStarCount;
    if (this.agument?.arcaneStarCount) return this.agument.arcaneStarCount;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.arcaneStarCount) return swordAug.arcaneStarCount;
    return 0;
  },
  set arcaneStarCount(v) {
    const val = Number(v || 0);
    this._arcaneStarCount = val;
    this.arcaneSword.starCount = val;
    if (this.agument) this.agument.arcaneStarCount = val;
  },

  get arcaneScrollAtk() {
    if (this.arcaneSword?.scrollAtk !== undefined && this.arcaneSword?.scrollAtk !== null) return this.arcaneSword.scrollAtk;
    if (this._arcaneScrollAtk) return this._arcaneScrollAtk;
    if (this.agument?.arcaneScrollAtk) return this.agument.arcaneScrollAtk;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.arcaneScrollAtk) return swordAug.arcaneScrollAtk;
    return 0;
  },
  set arcaneScrollAtk(v) {
    const val = Number(v || 0);
    this._arcaneScrollAtk = val;
    this.arcaneSword.scrollAtk = val;
    if (this.agument) this.agument.arcaneScrollAtk = val;
  },

  get arcaneScrollCatk() {
    if (this.arcaneSword?.scrollCatk !== undefined && this.arcaneSword?.scrollCatk !== null) return this.arcaneSword.scrollCatk;
    if (this._arcaneScrollCatk) return this._arcaneScrollCatk;
    if (this.agument?.arcaneScrollCatk) return this.agument.arcaneScrollCatk;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.arcaneScrollCatk) return swordAug.arcaneScrollCatk;
    return 0;
  },
  set arcaneScrollCatk(v) {
    const val = Number(v || 0);
    this._arcaneScrollCatk = val;
    this.arcaneSword.scrollCatk = val;
    if (this.agument) this.agument.arcaneScrollCatk = val;
  },

  get arcaneScrollSpeed() {
    if (this.arcaneSword?.scrollSpeed !== undefined && this.arcaneSword?.scrollSpeed !== null) return this.arcaneSword.scrollSpeed;
    if (this._arcaneScrollSpeed) return this._arcaneScrollSpeed;
    if (this.agument?.arcaneScrollSpeed) return this.agument.arcaneScrollSpeed;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.arcaneScrollSpeed) return swordAug.arcaneScrollSpeed;
    return 0;
  },
  set arcaneScrollSpeed(v) {
    const val = Number(v || 0);
    this._arcaneScrollSpeed = val;
    this.arcaneSword.scrollSpeed = val;
    if (this.agument) this.agument.arcaneScrollSpeed = val;
  },

  get arcaneSwordName() {
    if (this.arcaneSword?.name) return this.arcaneSword.name;
    if (this._arcaneSwordName) return this._arcaneSwordName;
    if (this.agument?.arcaneSwordName) return this.agument.arcaneSwordName;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.arcaneSwordName) return swordAug.arcaneSwordName;
    return null;
  },
  set arcaneSwordName(v) {
    this._arcaneSwordName = v;
    this.arcaneSword.name = v;
    if (this.agument) this.agument.arcaneSwordName = v;
  },

  get hasGreatTuskSoul() {
    if (this.arcaneSword?.hasSoul) return true;
    if (this._hasGreatTuskSoul) return true;
    if (this.agument?.hasGreatTuskSoul) return true;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.hasGreatTuskSoul) return true;
    return false;
  },
  set hasGreatTuskSoul(v) {
    const val = Boolean(v);
    this._hasGreatTuskSoul = val;
    this.arcaneSword.hasSoul = val;
    if (this.agument) this.agument.hasGreatTuskSoul = val;
  },

  get cubeLines() {
    if (this.arcaneSword?.cubeLines) return this.arcaneSword.cubeLines;
    if (this._cubeLines) return this._cubeLines;
    if (this.agument?.cubeLines) return this.agument.cubeLines;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.cubeLines) return swordAug.cubeLines;
    return null;
  },
  set cubeLines(v) {
    this._cubeLines = v;
    this.arcaneSword.cubeLines = v;
    if (this.agument) this.agument.cubeLines = v;
  },

  get cubeStats() {
    if (this.arcaneSword?.cubeStats) return this.arcaneSword.cubeStats;
    if (this._cubeStats) return this._cubeStats;
    if (this.agument?.cubeStats) return this.agument.cubeStats;
    const swordAug = this.augments?.find?.((a) => (typeof a === "string" ? a === "arcaneShadeSword" : a?.id === "arcaneShadeSword"));
    if (swordAug?.cubeStats) return swordAug.cubeStats;
    return null;
  },
  set cubeStats(v) {
    this._cubeStats = v;
    this.arcaneSword.cubeStats = v;
    if (this.agument) this.agument.cubeStats = v;
  },

  get hasRolledCube() {
    return Boolean(this.arcaneSword.hasRolledCube ?? this._hasRolledCube ?? this.agument?.hasRolledCube);
  },
  set hasRolledCube(v) {
    const val = Boolean(v);
    this._hasRolledCube = val;
    this.arcaneSword.hasRolledCube = val;
    if (this.agument) this.agument.hasRolledCube = val;
  },

  get pickedAbility() {
    return this.agument?.pickedAbility ?? null;
  },
  set pickedAbility(v) {
    if (!this.agument) this.agument = {};
    this.agument.pickedAbility = v;
  },

  get maxHp() {
    return hpCalculate(this);
  },

  // 곡예 등 원래 아이템이 있었으나 현재 소모되었는지 여부
  get hasConsumedItem() {
    return Boolean(this.o.item && !this.item);
  },
};

export default PokemonInstanceAccess;
