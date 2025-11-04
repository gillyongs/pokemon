export const PokemonGetDamage = {
  getDamage(battle, enqueue, damageValue, text) {
    // 기준 = 급소 없음, 탈 안 까임, 멀스 적용 안됨
    // field: 스텔스록
    // onHit: 특성(철가시), 울멧
    // turnEnd: 상태이상(독, 화상), 씨뿌리기, 마그마스톰
    // skillEffect: 생구, 무릎차기 빗나감, 반동, 대다출동
    const actualDamage = this._applyDamage(Math.floor(damageValue));

    if (text) {
      enqueue({ battle, text });
    }

    if (this.hp <= 0) {
      this.handleFaint(battle, enqueue);
    } else {
      this.tryBerry(battle, enqueue);
    }

    return actualDamage;
  },

  _applyDamage(damage) {
    const prevHp = this.hp;
    this.hp = Math.max(this.hp - damage, 0);
    return prevHp - this.hp; // 실제 입은 데미지 (흡혈 계산용)
  },

  // 기절 처리
  handleFaint(battle, enqueue) {
    // attackDmage, 초승달춤에서도 사용
    this.hp = 0;
    this.faint = true;
    this.resetStatus();
    this.resetTemp();
    this.resetTempStatus();
    enqueue({
      battle,
      text: `${this.names} 쓰러졌다!`,
    });
  },

  tryBerry(battle, enqueue) {
    // attackDmage에서도 사용
    const atkTeam = this.team === "npc" ? "player" : "npc";
    const atkPokemon = battle[atkTeam];
    const atkAbil = atkPokemon.abil;

    const noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];
    if (noBerryAbil.includes(atkAbil)) return;

    if (this.item === "자뭉열매" && this.hp <= this.origin.hp / 2) {
      this.item = null;
      this.recover(battle, Math.floor(this.origin.hp / 4), enqueue, `${this.names} 자뭉열매로 체력을 회복했다!`);
    }
  },
};
