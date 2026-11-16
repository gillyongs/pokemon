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

  get baseHp() {
    return this.o.hp;
  },

  get baseName() {
    return this.o.name;
  },

  get baseItem() {
    return this.o.item;
  },

  get baseAbil() {
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

  get pickedAbility() {
    return this.agument?.pickedAbility ?? null;
  },
  set pickedAbility(v) {
    if (!this.agument) this.agument = {};
    this.agument.pickedAbility = v;
  },

  get enhancedSkillName() {
    return this.nimbleSkillName;
  },
  set enhancedSkillName(v) {
    this.nimbleSkillName = v;
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
