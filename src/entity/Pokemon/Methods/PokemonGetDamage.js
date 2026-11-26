import { checkPassiveEndure } from "../../../service/damage/endure";

export const PokemonGetDamage = {
  getDamage(battle, enqueue, damageValue, text) {
    // 기준 = 급소 없음, 탈 안 까임, 멀스 적용 안됨
    // field: 스텔스록
    // onHit: 특성(철가시), 울멧
    // turnEnd: 상태이상(독, 화상), 씨뿌리기, 마그마스톰
    // skillEffect: 생구, 무릎차기 빗나감, 반동, 대다출동
    const damage = Math.floor(damageValue);
    const prevHp = this.hp;
    let actualDamage = 0;
    let endureResult = null;

    if (this.hp - damage <= 0) {
      endureResult = checkPassiveEndure(this);
    }

    if (endureResult) {
      // [증강] 하지만 버텨냈다(사전발동), 아무일도 없었다, 에어맨이 쓰러지지않아
      actualDamage = Math.max(0, prevHp - 1);
    } else {
      actualDamage = this._applyDamage(damage);
    }

    if (actualDamage > 0 && this.turn) {
      this.turn.damagedThisTurn = true; // 워모그
    }

    if (text) {
      enqueue(battle, text, "poke_get_dmg");
    }

    if (endureResult) {
      enqueue(battle, endureResult.endureText, endureResult.endureKey);
    }

    if (this.hp <= 0) {
      this.handleFaint(battle, enqueue);
    }
    if (this.hp > 0) {
      this.tryJamung(battle, enqueue);
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
    // damage (attack, confuse, getDamage)
    // 길동무, 치유소원 & 초승달춤, 자폭, 목숨걸기, [증강] 러시안룰렛/동귀어진에서도 사용
    this.hp = 0;
    this.faint = true;
    // resetTurn은 하지 않는다
    this.resetAilment();
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
    enqueue(battle, `${this.names("는")} 쓰러졌다!`, "poke_faint");

    // 델타스트림 / 시작의바다 / 끝의대지 기절 시 날씨 종료 처리
    battle.emit("pokemonLeave", { leavingPokemon: this, enqueue, reason: "faint" });
  },

  tryJamung(battle, enqueue) {
    // attackDmage에서도 사용
    const atkTeam = this.team === "npc" ? "player" : "npc";
    const atkPokemon = battle[atkTeam];
    const atkAbil = atkPokemon.abil?.name;

    const noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];
    if (noBerryAbil.includes(atkAbil)) return;

    if (this.item === "자뭉열매" && !this.tempStatus?.healBlock) {
      const maxHp = this.maxHp;
      if (this.hp <= Math.floor(maxHp / 2)) {
        this.recover(battle, Math.floor(maxHp / 4), enqueue, `[아이템 자뭉열매] ${this.names("는")} 자뭉열매로 인해 조금 회복했다!`);
        this.consumeItem();
      }
    }
  },
};
