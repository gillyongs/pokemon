import { hpCalculate } from "../../../util/hpCalculate";
export const PokemonGetDamage = {
  getDamage(battle, enqueue, damageValue, text) {
    // 기준 = 급소 없음, 탈 안 까임, 멀스 적용 안됨
    // field: 스텔스록
    // onHit: 특성(철가시), 울멧
    // turnEnd: 상태이상(독, 화상), 씨뿌리기, 마그마스톰
    // skillEffect: 생구, 무릎차기 빗나감, 반동, 대다출동
    const actualDamage = this._applyDamage(Math.floor(damageValue));
    if (actualDamage > 0 && this.turn) {
      this.turn.damagedThisTurn = true; // 워모그
    }

    if (text) {
      enqueue({ id: "7ca5ce1a-303b-4665-b41d-48905926319b", battle, text });
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
    // attackDmage, 길동무, 초승달춤에서도 사용
    this.hp = 0;
    this.faint = true;
    this.resetAilment();
    this.resetTurn();
    this.resetTempStatus();

    // 메자이의 영혼약탈자: 기절 시 중첩 1 감소 (스냅샷 반영을 위해 enqueue 직전에 처리)
    if (this.hasAugment?.("mejaisSoulstealer")) {
      const mejaiAug = this.augments?.find((a) => a.id === "mejaisSoulstealer");
      const curStack = Number(this.mejaiStack ?? mejaiAug?.mejaiStack ?? 0);
      const nextStack = Math.max(0, curStack - 1);
      this.mejaiStack = nextStack;
      if (mejaiAug) {
        mejaiAug.mejaiStack = nextStack;
      }
    }
    enqueue({
      id: "04606dda-a370-46f8-97d6-155e4f7722c2",
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

    if (this.item === "자뭉열매") {
      const maxHp = hpCalculate(this);
      if (this.hp <= Math.floor(maxHp / 2)) {
        this.recover(battle, Math.floor(maxHp / 4), enqueue, `${this.names} 자뭉열매로 인해 조금 회복했다.`);
        this.item = null;
      }
    }
  },
};
