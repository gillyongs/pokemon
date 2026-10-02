import { getStatName } from "../../../function/rankStat.js";
export const PokemonAbil = {
  // 고대활성 발동
  handleProtosynthesis(battle, enqueue) {
    // 특성이 고대활성이 아니거나 이미 고대활성이 적용된 경우 발동하지 않음
    if (this.abil !== "고대활성" || this.tempStatus.protosynthesis !== null) return;

    // 고대활성: 가장 높은 능력치가 1랭크 업
    const maxKey = this.maxStat();

    // 쾌청에 의한 발동
    // 부스트에너지보다 쾌청이 우선 발동됨
    if (battle.field.weather.isSunny) {
      this.tempStatus.protosynthesis = maxKey;
      this.tempStatus.protosynthesisBySun = true; // 쾌청으로 발동한 경우 쾌청 끝나면 고대활성 종료됨
      enqueue({
        battle,
        text: `[특성 고대활성] ${this.names} 쾌청에 의해 고대활성을 발동했다!`,
      });
    }
    // 부스트에너지에 의한 발동
    else if (this.item === "부스트에너지") {
      this.tempStatus.protosynthesis = maxKey;
      this.item = null;
      enqueue({
        battle,
        text: `[특성 고대활성] ${this.names} 부스트에너지에 의해 고대활성을 발동했다!`,
      });
    }

    // 발동 성공 시 강화 텍스트 출력
    if (this.tempStatus.protosynthesis) {
      enqueue({
        battle,
        text: `[특성 고대활성] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`,
      });
    }
  },

  // 쾌청 해제 시 이로인한 고대활성 종료 처리
  handleProtosynthesisEnd(battle, enqueue) {
    if (this.abil !== "고대활성" || this.tempStatus.protosynthesis === null) return;
    if (!this.tempStatus.protosynthesisBySun) return; // 쾌청 기반이 아니면 무시

    this.tempStatus.protosynthesis = null;
    this.tempStatus.protosynthesisBySun = null;
    enqueue({
      battle,
      text: `${this.name}에게서 고대활성의 효과가 사라졌다!`,
    });

    // 부스트에너지를 지니고있을시 즉시 재발동
    if (this.item === "부스트에너지") {
      this.item = null;
      enqueue({
        battle,
        text: `[특성 고대활성] ${this.names} 부스트에너지에 의해 고대활성을 발동했다!`,
      });
      const maxKey = this.maxStat();
      this.tempStatus.protosynthesis = maxKey;
      enqueue({
        battle,
        text: `[특성 고대활성] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`,
      });
    }
  },
};
