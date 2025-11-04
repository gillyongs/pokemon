import { getStatName, getStatName2, getMultiplier } from "../../../function/rankStat";
export const PokemonRank = {
  rankUp(battle, enqueue, rankType, rankValue, text) {
    // skillEffect: 능력치 증감
    // damage: 자기과신
    // abil: 위협
    // skillUse: 메테오빔
    const rank = this.tempStatus.rank;

    if (this.abil === "심술꾸러기") {
      rankValue = -rankValue;
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

    if (text) rankText = `${text} ${rankText}`;

    enqueue({ battle, text: rankText });
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
