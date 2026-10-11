import { getStatName, getStatName2, getMultiplier } from "../../../function/rankStat";
export const PokemonRank = {
  applyRankChange(battle, enqueue, rankType, rankValue, abilText, isOpponent = false) {
    // 부가효과(skillEffect.js), 끈적끈적네트(field.js), 메테오빔(skillUse.js)
    // 위협/불굴의검/방패(ability.js), 자기과신(damage.js), 지구력(onHit.js) 에서 사용
    const rank = this.tempStatus.rank;

    if (this.abil === "심술꾸러기") {
      rankValue = -rankValue;
    }

    // 클리어바디: 상대방에 의한 랭크 감소를 막음
    // 부가효과, 위협, 끈끈넷
    if (isOpponent && rankValue < 0 && this.abil === "클리어바디") {
      enqueue({ battle, text: `[특성 클리어바디] ${this.name}의 ${getStatName2(rankType)} 떨어지지 않았다!` });
      return;
    }

    // 상한/하한 검사
    let rankText2 = `${this.name}의 ${getStatName2(rankType)}`; //공격'은' 더 이상 올라갈 수 없다!
    if (rankValue < 0 && rank[rankType] <= -6) {
      enqueue({ battle, text: `${rankText2} 더 이상 떨어질 수 없다!` });
      return;
    }
    if (rankValue > 0 && rank[rankType] >= 6) {
      enqueue({ battle, text: `${rankText2} 더 이상 올라갈 수 없다!` });
      return;
    }

    // ✏️ 실제 변화 적용
    rank[rankType] += rankValue;
    if (rank[rankType] > 6) rank[rankType] = 6;
    if (rank[rankType] < -6) rank[rankType] = -6;

    let rankText = `${this.name}의 ${getStatName(rankType)}`; //공격'이' 크게 올랐다!

    if (rankValue > 2 || rankValue < -2) rankText += " 매우";
    else if (rankValue >= 2 || rankValue <= -2) rankText += " 크게";

    if (rankValue > 0) rankText += " 올라갔다!";
    if (rankValue < 0) rankText += " 떨어졌다!";

    if (abilText) rankText = `${abilText} ${rankText}`;

    enqueue({ battle, text: rankText });
  },

  rankUp(battle, enqueue, rankType, rankValue, abilText, isOpponent) {
    this.applyRankChange(battle, enqueue, rankType, rankValue, abilText, isOpponent);
    this.checkWhiteHerb(battle, enqueue);
  },

  // 인파이트로 방,특방 떨군거 하양허브로 한번에 회복되게 하려고 함수 따로 팜
  rankUpMulti(battle, enqueue, rankArr, abilText, isOpponent) {
    rankArr.forEach(({ stat, value }) => {
      this.applyRankChange(battle, enqueue, stat, value, abilText, isOpponent);
    });

    this.checkWhiteHerb(battle, enqueue);
  },

  checkWhiteHerb(battle, enqueue) {
    // 하양허브: 마이너스가 된 능력치를 0으로 되돌린다 (발동 후 소모)
    // 인파이트처럼 여러 능력치가 동시에 떨어지는 경우 전부 되돌림
    if (this.item !== "하양허브" || this.faint) return;
    const rank = this.tempStatus.rank;
    const dropped = Object.keys(rank).filter((key) => rank[key] < 0);
    if (dropped.length === 0) return;
    dropped.forEach((key) => {
      rank[key] = 0;
    });
    this.item = null;
    enqueue({ battle, text: `${this.names} 하양허브로 떨어진 능력을 원래대로 되돌렸다!` });
    // 디버프를 받기 전 상태로 되돌리는게 아니라, 랭크다운된 능력치를 제로로 만드는게 맞음
  },

  maxStat() {
    // 가장 높은 능력치 종류를 리턴하는 함수 (ex: "speed")
    // 아이템, 특성은 반영되지 않고 기본 능력치와 랭크 변화만 적용된다
    // 고대활성, 비스트부스트에 사용
    const stat = this.origin.stat;
    const ranks = this.tempStatus.rank;

    // 각 능력치별 랭크 보정값 반영
    const statWithMultiplier = {
      atk: stat.atk * getMultiplier(ranks.atk),
      def: stat.def * getMultiplier(ranks.def),
      catk: stat.catk * getMultiplier(ranks.catk),
      cdef: stat.cdef * getMultiplier(ranks.cdef),
      speed: stat.speed * getMultiplier(ranks.speed),
    };
    // 가장 큰 값의 key 리턴
    const [maxKey] = Object.entries(statWithMultiplier).reduce((prev, curr) => (curr[1] > prev[1] ? curr : prev));

    return maxKey;
  },

  resetRank() {
    Object.keys(this.tempStatus.rank).forEach((key) => {
      this.tempStatus.rank[key] = 0;
    });
  },
};
