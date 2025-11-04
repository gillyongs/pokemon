export class userField {
  constructor(team) {
    this.team = team; // player or npc
    this.sRock = null; // 스텔스록
    this.spikes = null; // 압정뿌리기
    this.poisonSpikes = null; // 독압정 (1 = 독, 2 = 맹독)
    this.noClean = {
      // 고속스핀 등으로 인해 없어지지 않는 필드 요소
      healingWish: null, // 치유소원 -> 필드에 적용 후 교체해 나올떄 = field.js에서 처리
      lunarDance: null, // 초승달춤
      wish: null, //희망사항 -> 다음턴 종료시 필드에 있는 포켓몬 = turnEnd.js에서 처리
      reflect: null, // 리플렉터
      lightScreen: null, // 빛의장막
    };
  }

  handleWish(battle, enqueue, obj) {
    if (this.noClean.wish !== null) {
      //연속사용 안됨
      enqueue({
        battle,
        text: "하지만 실패했다!",
      });
      return;
    }

    this.noClean.wish = obj;
    // 희망사항의 회복량은 시전자 체력의 절반
    // {name: '맘복치', amount: 120, turnRemain: 1}
  }

  handleWishTurnEnd(battle, enqueue) {
    const wish = this.noClean.wish;
    if (wish === null) return;

    const target = battle[this.team];
    if (wish.turnRemain === 0) {
      this.noClean.wish = null;
      if (target.hp < target.origin.hp && !target.faint) {
        // 풀피면 아예 발동 안하고 사라짐
        target.recover(battle, Math.floor(wish.amount), enqueue, `${wish.name}의 희망사항이 이루어졌다!`);
      }
    } else if (wish.turnRemain === 1) {
      wish.turnRemain = 0;
    }
  }

  handleHealingWish(battle, enqueue) {
    // 연속 사용해도 실패하지 않는다 (하지만 효과가 중첩되지는 않는다)
    this.noClean.healingWish = true;
    battle[this.team].handleFaint(battle, enqueue);
  }

  handleLunarDance(battle, enqueue) {
    this.noClean.lunarDance = true;
    battle[this.team].handleFaint(battle, enqueue);
  }
}
