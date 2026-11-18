export const PokemonRecover = {
  _doRecover(battle, recoverValue, { enqueue, text, silent = false } = {}) {
    if (this.hp <= 0) return; // 이미 기절했으면 무시

    const maxHp = this.maxHp;

    // 풀피 상태
    if (this.hp >= maxHp) {
      if (!silent && enqueue) {
        if (text && text.includes("씨뿌리기")) {
          enqueue(battle, text, "heal_seed_full");
        } else {
          enqueue(battle, "더 이상 회복할 수 없다!", "heal_already_full");
        }
      }
      return;
    }

    // 회복량 계산
    let amount = Math.floor(recoverValue || 0);
    if (amount <= 0) return;

    // 정령의 형상: 해당 포켓몬이 받는 모든 회복 효과가 25% 증가합니다.
    if (this.hasAugment?.("spiritVisage")) {
      amount = Math.round(amount * 1.5);
    }

    this.hp = Math.min(maxHp, this.hp + amount);

    if (!silent && enqueue) {
      enqueue(battle, text ?? `${this.names("는")} 체력을 회복했다!`, "heal_recover");
    }
  },

  recover(battle, recoverValue, enqueue, text) {
    // turnEnd: 그래스필드, 희망사항, 씨뿌리기, 먹다남은음식
    // skillEffect: 회복, 아침햇살, 흡수(데스윙)
    this._doRecover(battle, recoverValue, { enqueue, text, silent: false });
  },

  recoverNoText(battle, recoverValue, enqueue) {
    // 회복 텍스트가 화면에 뜨지 않는 경우
    // ex: 특성 재생력
    this._doRecover(battle, recoverValue, { silent: true });
  },

  handleResurrection(battle, recoverValue = 0.5, enqueue, option = {}) {
    const maxHp = this.maxHp;
    const targetHp = recoverValue <= 1 ? Math.max(1, Math.floor(maxHp * recoverValue)) : Math.min(maxHp, Math.floor(recoverValue));

    this.faint = false;
    this.hp = targetHp;

    this.resetAilment();
    this.resetTurn();
    this.resetTempStatus();

    if (enqueue && !option.silent) {
      enqueue(battle, option.text ?? `${this.names("는")} 다시 싸울 수 있게 되었다!`, "heal_resurrect");
    }

    return targetHp;
  },
};
