import { getStatName } from "../../../calc/rankStat.js";
import { abilObject } from "../../Ability.js";
export const PokemonAbil = {
  changeAbil(abilityName, fallbackText = "") {
    if (!abilityName) return null;
    const baseObj = abilObject[abilityName] ? { ...abilObject[abilityName] } : { text: fallbackText || "설명이 없습니다." };
    baseObj.name = abilityName;
    baseObj.used = false;
    baseObj.usedOnce = false;

    this.abil = { ...baseObj };
    this.o.abil = { ...baseObj };
    // 트레이스 등을 고려하여 포켓몬이 교체하여 나올때 p.abil은 p.o.abil로 덮어씌워진다

    return baseObj;
  },
  // 고대활성 발동
  handleProtosynthesis(battle, enqueue) {
    // 특성이 고대활성이 아니거나 이미 고대활성이 적용된 경우 발동하지 않음
    if (this.abil?.name !== "고대활성" || this.tempStatus.protosynthesis !== null) return;

    // 고대활성: 가장 높은 능력치가 1랭크 업
    const maxKey = this.maxStat();

    // 쾌청에 의한 발동
    // 부스트에너지보다 쾌청이 우선 발동됨
    if (battle.isSunny) {
      this.tempStatus.protosynthesis = maxKey;
      this.tempStatus.protosynthesisBySun = true; // 쾌청으로 발동한 경우 쾌청 끝나면 고대활성 종료됨
      enqueue(battle, `[특성 고대활성] ${this.names("는")} 쾌청에 의해 고대활성을 발동했다!`, "proto_sun");
    }
    // 부스트에너지에 의한 발동
    else if (this.item === "부스트에너지") {
      this.tempStatus.protosynthesis = maxKey;
      this.consumeItem();
      enqueue(battle, `[아이템 부스트에너지] ${this.names("는")} 부스트에너지에 의해 고대활성을 발동했다!`, "proto_energy");
    }

    // 발동 성공 시 강화 텍스트 출력
    if (this.tempStatus.protosynthesis) {
      enqueue(battle, `[특성 고대활성] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`, "proto_stat");
    }
  },

  // 쾌청 해제 시 이로인한 고대활성 종료 처리
  handleProtosynthesisEnd(battle, enqueue) {
    if (this.abil?.name !== "고대활성" || this.tempStatus.protosynthesis === null) return;
    if (!this.tempStatus.protosynthesisBySun) return; // 쾌청 기반이 아니면 무시

    this.tempStatus.protosynthesis = null;
    this.tempStatus.protosynthesisBySun = null;
    enqueue(battle, `${this.name}에게서 고대활성의 효과가 사라졌다!`, "proto_end");

    // 부스트에너지를 지니고있을시 즉시 재발동
    if (this.item === "부스트에너지") {
      this.consumeItem();
      enqueue(battle, `[아이템 부스트에너지] ${this.names("는")} 부스트에너지에 의해 고대활성을 발동했다!`, "proto_re_energy");
      const maxKey = this.maxStat();
      this.tempStatus.protosynthesis = maxKey;
      enqueue(battle, `[특성 고대활성] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`, "proto_re_stat");
    }
  },

  // 쿼크차지 발동
  handleQuarkDrive(battle, enqueue) {
    // 특성이 쿼크차지가 아니거나 이미 쿼크차지가 적용된 경우 발동하지 않음
    if (this.abil?.name !== "쿼크차지" || this.tempStatus.quarkDrive !== null) return;

    // 쿼크차지: 가장 높은 능력치가 강화
    const maxKey = this.maxStat();

    // 일렉트릭필드에 의한 발동
    // 부스트에너지보다 일렉트릭필드가 우선 발동됨
    if (battle.field.terrain.isElectricField) {
      this.tempStatus.quarkDrive = maxKey;
      this.tempStatus.quarkDriveByField = true; // 일렉트릭필드로 발동한 경우 필드 끝나면 쿼크차지 종료됨
      enqueue(battle, `[특성 쿼크차지] ${this.names("는")} 일렉트릭필드에 의해 쿼크차지를 발동했다!`, "quark_field");
    }
    // 부스트에너지에 의한 발동
    else if (this.item === "부스트에너지") {
      this.tempStatus.quarkDrive = maxKey;
      this.consumeItem();
      enqueue(battle, `[아이템 부스트에너지] ${this.names("는")} 부스트에너지에 의해 쿼크차지를 발동했다!`, "quark_energy");
    }

    // 발동 성공 시 강화 텍스트 출력
    if (this.tempStatus.quarkDrive) {
      enqueue(battle, `[특성 쿼크차지] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`, "quark_stat");
    }
  },

  // 일렉트릭필드 해제 시 이로인한 쿼크차지 종료 처리
  handleQuarkDriveEnd(battle, enqueue) {
    if (this.abil?.name !== "쿼크차지" || this.tempStatus.quarkDrive === null) return;
    if (!this.tempStatus.quarkDriveByField) return; // 필드 기반이 아니면 무시

    this.tempStatus.quarkDrive = null;
    this.tempStatus.quarkDriveByField = null;
    enqueue(battle, `${this.name}에게서 쿼크차지의 효과가 사라졌다!`, "quark_end");

    // 부스트에너지를 지니고있을시 즉시 재발동
    if (this.item === "부스트에너지") {
      this.consumeItem();
      enqueue(battle, `[아이템 부스트에너지] ${this.names("는")} 부스트에너지에 의해 쿼크차지를 발동했다!`, "quark_re_energy");
      const maxKey = this.maxStat();
      this.tempStatus.quarkDrive = maxKey;
      enqueue(battle, `[특성 쿼크차지] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`, "quark_re_stat");
    }
  },
};
