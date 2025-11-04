export const PokemonRecover = {
  _doRecover(battle, recoverValue, { enqueue, text, silent = false } = {}) {
    if (this.hp <= 0) return; // 이미 기절했으면 무시

    // 풀피 상태
    if (this.hp >= this.origin.hp) {
      if (!silent && enqueue) {
        if (text && text.includes("씨뿌리기")) {
          enqueue({ battle, text });
        } else {
          enqueue({ battle, text: "더 이상 회복할 수 없다!" });
        }
      }
      return;
    }

    // 회복량 계산
    const amount = Math.floor(recoverValue || 0);
    if (amount <= 0) return;

    this.hp = Math.min(this.origin.hp, this.hp + amount);

    if (!silent && enqueue) {
      enqueue({
        battle,
        text: text ?? `${this.names} 체력을 회복했다!`,
      });
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
};
