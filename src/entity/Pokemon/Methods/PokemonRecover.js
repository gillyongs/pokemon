import { hpCalculate } from "../../../calc/hpCalculate";

export const PokemonRecover = {
  _doRecover(battle, recoverValue, { enqueue, text, silent = false } = {}) {
    if (this.hp <= 0) return; // 이미 기절했으면 무시

    const maxHp = hpCalculate(this);

    // 풀피 상태
    if (this.hp >= maxHp) {
      if (!silent && enqueue) {
        if (text && text.includes("씨뿌리기")) {
          enqueue({ id: "ca583d1b-b96c-4942-8d91-52795f0093fe", battle, text });
        } else {
          enqueue({ id: "1649b88d-4742-4b07-905d-fee185f68335", battle, text: "더 이상 회복할 수 없다!" });
        }
      }
      return;
    }

    // 회복량 계산
    const amount = Math.floor(recoverValue || 0);
    if (amount <= 0) return;

    this.hp = Math.min(maxHp, this.hp + amount);

    if (!silent && enqueue) {
      enqueue({
        id: "45f9331b-d45f-4425-9cad-c1249947a90b",
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

  handleResurrection(battle, recoverValue = 0.5, enqueue, option = {}) {
    const maxHp = hpCalculate(this);
    const targetHp = recoverValue <= 1 ? Math.max(1, Math.floor(maxHp * recoverValue)) : Math.min(maxHp, Math.floor(recoverValue));

    this.faint = false;
    this.hp = targetHp;

    this.resetAilment();
    this.resetTurn();
    this.resetTempStatus();

    if (enqueue && !option.silent) {
      enqueue({
        id: "resurrection-on-pokemonRecover",
        battle,
        text: option.text ?? `${this.names} 다시 싸울 수 있게 되었다!`,
      });
    }

    return targetHp;
  },
};
