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
        id: "242870a8-c92d-4282-933d-a6e07a751f8a",
        battle,
        text: `[특성 고대활성] ${this.names} 쾌청에 의해 고대활성을 발동했다!`,
      });
    }
    // 부스트에너지에 의한 발동
    else if (this.item === "부스트에너지") {
      this.tempStatus.protosynthesis = maxKey;
      this.item = null;
      enqueue({
        id: "ba65c986-1270-49c7-b195-91251dad5ec1",
        battle,
        text: `[특성 고대활성] ${this.names} 부스트에너지에 의해 고대활성을 발동했다!`,
      });
    }

    // 발동 성공 시 강화 텍스트 출력
    if (this.tempStatus.protosynthesis) {
      enqueue({
        id: "8b42b9a7-a195-4c97-8f94-44a23098c434",
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
      id: "f5ee436e-8964-4848-9275-5ddb05c9f21b",
      battle,
      text: `${this.name}에게서 고대활성의 효과가 사라졌다!`,
    });

    // 부스트에너지를 지니고있을시 즉시 재발동
    if (this.item === "부스트에너지") {
      this.item = null;
      enqueue({
        id: "fd7b98f0-a2ef-4a7d-90e0-9f649e088fb4",
        battle,
        text: `[특성 고대활성] ${this.names} 부스트에너지에 의해 고대활성을 발동했다!`,
      });
      const maxKey = this.maxStat();
      this.tempStatus.protosynthesis = maxKey;
      enqueue({
        id: "ba9adba5-74a9-40c9-8163-55859a70c8cf",
        battle,
        text: `[특성 고대활성] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`,
      });
    }
  },

  // 쿼크차지 발동
  handleQuarkDrive(battle, enqueue) {
    // 특성이 쿼크차지가 아니거나 이미 쿼크차지가 적용된 경우 발동하지 않음
    if (this.abil !== "쿼크차지" || this.tempStatus.quarkDrive !== null) return;

    // 쿼크차지: 가장 높은 능력치가 강화
    const maxKey = this.maxStat();

    // 일렉트릭필드에 의한 발동
    // 부스트에너지보다 일렉트릭필드가 우선 발동됨
    if (battle.field.terrain.isElectricField) {
      this.tempStatus.quarkDrive = maxKey;
      this.tempStatus.quarkDriveByField = true; // 일렉트릭필드로 발동한 경우 필드 끝나면 쿼크차지 종료됨
      enqueue({
        id: "0245a415-51eb-4a72-bed6-d900831afcfa",
        battle,
        text: `[특성 쿼크차지] ${this.names} 일렉트릭필드에 의해 쿼크차지를 발동했다!`,
      });
    }
    // 부스트에너지에 의한 발동
    else if (this.item === "부스트에너지") {
      this.tempStatus.quarkDrive = maxKey;
      this.item = null;
      enqueue({
        id: "59a4af2d-968f-4950-a53b-ee1a633d589d",
        battle,
        text: `[특성 쿼크차지] ${this.names} 부스트에너지에 의해 쿼크차지를 발동했다!`,
      });
    }

    // 발동 성공 시 강화 텍스트 출력
    if (this.tempStatus.quarkDrive) {
      enqueue({
        id: "b1ea5efa-9ac0-4324-a216-e7c9a9ad5e4b",
        battle,
        text: `[특성 쿼크차지] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`,
      });
    }
  },

  // 일렉트릭필드 해제 시 이로인한 쿼크차지 종료 처리
  handleQuarkDriveEnd(battle, enqueue) {
    if (this.abil !== "쿼크차지" || this.tempStatus.quarkDrive === null) return;
    if (!this.tempStatus.quarkDriveByField) return; // 필드 기반이 아니면 무시

    this.tempStatus.quarkDrive = null;
    this.tempStatus.quarkDriveByField = null;
    enqueue({
      id: "263bd5ba-e88c-4896-8d19-fa5a89d77157",
      battle,
      text: `${this.name}에게서 쿼크차지의 효과가 사라졌다!`,
    });

    // 부스트에너지를 지니고있을시 즉시 재발동
    if (this.item === "부스트에너지") {
      this.item = null;
      enqueue({
        id: "121869a7-a593-4660-84da-15134b3b9dd8",
        battle,
        text: `[특성 쿼크차지] ${this.names} 부스트에너지에 의해 쿼크차지를 발동했다!`,
      });
      const maxKey = this.maxStat();
      this.tempStatus.quarkDrive = maxKey;
      enqueue({
        id: "244365f8-1ef3-4425-a349-59068985aa8c",
        battle,
        text: `[특성 쿼크차지] ${this.name}의 ${getStatName(maxKey)} 강화되었다!`,
      });
    }
  },
};
