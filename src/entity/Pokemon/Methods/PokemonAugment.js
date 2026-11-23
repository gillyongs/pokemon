export const PokemonAugment = {
  hasAugment(nameOrId) {
    if (!this.augments || !Array.isArray(this.augments)) return false;
    const cleanTarget = typeof nameOrId === "string" ? nameOrId.replace(/\s/g, "") : null;
    return this.augments.some((aug) => {
      if (typeof aug === "string") return aug === nameOrId || (cleanTarget && aug.replace(/\s/g, "") === cleanTarget);
      return aug.id === nameOrId || aug.name === nameOrId || (cleanTarget && aug.name && aug.name.replace(/\s/g, "") === cleanTarget);
    });
  },

  hasAugmentOnTeam(nameOrId, battleOrTeam = null) {
    if (this.hasAugment(nameOrId)) return true;

    let augId = nameOrId;
    if (typeof nameOrId === "string") {
      try {
        const { AUGMENT_LIST } = require("../../Augment/AugmentData");
        const cleanTarget = nameOrId.replace(/\s/g, "");
        const found = AUGMENT_LIST?.find((a) => a.id === nameOrId || a.name === nameOrId || (a.name && a.name.replace(/\s/g, "") === cleanTarget));
        if (found) augId = found.id;
      } catch (e) {
        // ignore
      }
    }

    const buffProp = typeof augId === "string" ? `has${augId.charAt(0).toUpperCase()}${augId.slice(1)}Buff` : null;
    if (buffProp && Boolean(this[buffProp])) return true;
    if (Boolean(this.teamBuffs?.[augId])) return true;

    let team = null;
    if (Array.isArray(battleOrTeam)) {
      team = battleOrTeam;
    } else if (battleOrTeam) {
      if (this.team === "npc") {
        team = [battleOrTeam.npc, battleOrTeam.npcBench1, battleOrTeam.npcBench2];
      } else if (this.team === "player") {
        team = [battleOrTeam.player, battleOrTeam.playerBench1, battleOrTeam.playerBench2];
      } else {
        const isPlayerSide = [battleOrTeam.player, battleOrTeam.playerBench1, battleOrTeam.playerBench2].includes(this);
        team = isPlayerSide ? [battleOrTeam.player, battleOrTeam.playerBench1, battleOrTeam.playerBench2] : [battleOrTeam.npc, battleOrTeam.npcBench1, battleOrTeam.npcBench2];
      }
    }

    if (team) {
      return team.filter(Boolean).some((p) => p.hasAugment?.(nameOrId) || (buffProp && Boolean(p[buffProp])) || Boolean(p.teamBuffs?.[augId]));
    }

    return false;
  },

  checkAugmentSynergies(battle) {
    const { AUGMENT_LIST, AUGMENT_SYNERGY_MAP, getSynergyThreshold, syncTeamEchoOfHeroBuff, syncTeamMapleWarriorBuff, syncTeamBearBuffs } = require("../../Augment/AugmentData");
    const team = battle ? (this.team === "npc" ? [battle.npc, battle.npcBench1, battle.npcBench2] : [battle.player, battle.playerBench1, battle.playerBench2]) : [];

    Object.entries(AUGMENT_SYNERGY_MAP).forEach(([synergyId, requiredIds]) => {
      const existingAug = (this.augments || []).find((a) => (typeof a === "string" ? a === synergyId : a.id === synergyId));
      if (existingAug?.isForced) {
        // testMode 등에서 직접 선택된 시너지는 조건 없이 무조건 활성화 유지
        if (synergyId === "echoOfHero" && typeof syncTeamEchoOfHeroBuff === "function") {
          syncTeamEchoOfHeroBuff(battle, this);
        }
        if (synergyId === "mapleWarrior" && typeof syncTeamMapleWarriorBuff === "function") {
          syncTeamMapleWarriorBuff(battle, this);
        }
        return;
      }

      const threshold = typeof getSynergyThreshold === "function" ? getSynergyThreshold(synergyId, requiredIds) : requiredIds.length;
      const ownedCount = requiredIds.filter((reqId) => this.hasAugment(reqId)).length;
      const hasAllConditions = ownedCount >= threshold;
      const hasSynergyNow = Boolean(existingAug);

      if (hasAllConditions) {
        // 활성화 조건 만족: 아직 활성화되지 않았다면 추가
        if (!hasSynergyNow) {
          // 영메 및 메용은 팀 단위 버프이므로 한 명만 활성화
          const alreadyHasEchoOnTeam = synergyId === "echoOfHero" && team.some((p) => p !== this && (p?.hasAugment?.("echoOfHero") || p?.hasEchoOfHeroBuff));
          if (alreadyHasEchoOnTeam) return;

          const alreadyHasMapleWarriorOnTeam = synergyId === "mapleWarrior" && team.some((p) => p !== this && (p?.hasAugment?.("mapleWarrior") || p?.hasMapleWarriorBuff));
          if (alreadyHasMapleWarriorOnTeam) return;

          const synergyAug = AUGMENT_LIST.find((a) => a.id === synergyId);
          if (synergyAug) {
            const augObj = { ...synergyAug, id: synergyId, synergy: true };
            delete augObj.buf;
            delete augObj.curse;
            if (synergyId === "dragonDie") augObj.dragonKillCount = Number(this.dragonKillCount || 0);
            if (synergyId === "mejaisSoulstealer") augObj.mejaiStack = Number(this.mejaiStack || 0);
            if (synergyId === "practiceMakesCritical") augObj.practiceCritStack = Number(this.practiceCritStack || 0);
            if (synergyId === "giantAbsorption") augObj.giantBonusHp = Number(this.giantBonusHp || 0);
            if (!this.augments) this.augments = [];
            this.augments.push(augObj);
            if (typeof augObj.onApply === "function") {
              augObj.onApply(this, battle, {
                isHiddenGrant: true,
                isCarryover: true,
                dragonKillCount: this.dragonKillCount,
                mejaiStack: this.mejaiStack,
                practiceCritStack: this.practiceCritStack,
                giantBonusHp: this.giantBonusHp,
              });
            }
            if (synergyId === "echoOfHero" && typeof syncTeamEchoOfHeroBuff === "function") {
              syncTeamEchoOfHeroBuff(battle, this);
            }
            if (synergyId === "mapleWarrior" && typeof syncTeamMapleWarriorBuff === "function") {
              syncTeamMapleWarriorBuff(battle, this);
            }
          }
        }
      } else {
        // 활성화 조건 불만족: 기존에 활성화되어 있었다면 비활성화 (제거만 하고 스택/중첩은 유지)
        if (hasSynergyNow) {
          this.augments = (this.augments || []).filter((a) => (typeof a === "string" ? a !== synergyId : a.id !== synergyId));
          if (synergyId === "echoOfHero") {
            delete this.hasEchoOfHeroBuff;
            if (typeof syncTeamEchoOfHeroBuff === "function") {
              syncTeamEchoOfHeroBuff(battle, this);
            }
          }
          if (synergyId === "mapleWarrior") {
            delete this.hasMapleWarriorBuff;
            if (typeof syncTeamMapleWarriorBuff === "function") {
              syncTeamMapleWarriorBuff(battle, this);
            }
          }
        }
      }
    });
    if (typeof syncTeamBearBuffs === "function") {
      syncTeamBearBuffs(battle);
    }
  },

  checkEchoOfHeroSynergy(battle) {
    this.checkAugmentSynergies(battle);
  },

  removeAugment(nameOrId, battle) {
    if (!this.augments || !Array.isArray(this.augments)) return null;
    const targetId = typeof nameOrId === "object" ? nameOrId?.id : nameOrId;
    const index = this.augments.findIndex((a) => (typeof a === "string" ? a === targetId : a.id === targetId || a.name === targetId));
    if (index === -1) return null;
    const [removed] = this.augments.splice(index, 1);
    this.checkAugmentSynergies(battle);
    return removed;
  },

  applyAugment(augment, battle, options) {
    if (!this.augments) {
      this.augments = [];
    }
    const augId = typeof augment === "string" ? augment : augment.id;
    const { AUGMENT_LIST, AUGMENT_SYNERGY_MAP, isCurseAugment, isBuffAugment, isSynergyAugment, isNormalAugment } = require("../../Augment/AugmentData");
    const fullAug = AUGMENT_LIST.find((a) => a.id === augId);
    const augObj = typeof augment === "object" ? { ...(fullAug || {}), ...augment } : { ...(fullAug || {}), id: augment };
    const isInstant = augObj.cost === "-";

    if (fullAug?.curse || augObj.curse || isCurseAugment(augObj)) {
      augObj.curse = true;
      delete augObj.buf;
      delete augObj.synergy;
    } else if (fullAug?.synergy || augObj.synergy || isSynergyAugment(augObj) || AUGMENT_SYNERGY_MAP?.[augId]) {
      augObj.synergy = true;
      augObj.isForced = true; // 직접 선택되거나 적용된 시너지는 조건 없이 무조건 활성화
      delete augObj.buf;
      delete augObj.curse;
    } else if (fullAug?.buf || augObj.buf || isBuffAugment(augObj)) {
      augObj.buf = true;
      delete augObj.curse;
      delete augObj.synergy;
    }

    // 일반 증강만 3개 슬롯 제한 적용 (버프, 저주, 시너지는 슬롯 제한 없음)
    if (isNormalAugment(augObj)) {
      const normalCount = this.augments.filter((a) => isNormalAugment(a)).length;
      if (normalCount >= 3 && !isInstant) return false;
    }
    if (!isInstant && this.hasAugment(augId)) {
      if ((augObj.buf || augObj.synergy) && (options?.dragonKillCount !== undefined || options?.mejaiStack !== undefined || options?.practiceCritStack !== undefined || options?.giantBonusHp !== undefined)) {
        const existingBuf = this.augments.find((a) => a.id === augId);
        if (existingBuf && typeof existingBuf.onApply === "function") {
          existingBuf.onApply(this, battle, options);
        }
      }
      return false;
    }

    // 코스트 '-'인 일반 즉발형 증강은 누적되지 않음 (단, 버프는 라운드 동안 유지)
    if (!isInstant || augObj.buf) {
      if (Array.isArray(this.augments) && Object.isExtensible(this.augments)) {
        this.augments.push(augObj);
      } else {
        this.augments = [...(this.augments || []), augObj];
      }
    }

    if (typeof augObj === "object" && augObj.onApply) {
      augObj.onApply(this, battle, options);
    }

    // 3종 증강 세트 공명 시너지 체크 (조건 충족 시 활성화, 미충족 시 비활성화)
    this.checkAugmentSynergies(battle);

    return true;
  },
};
