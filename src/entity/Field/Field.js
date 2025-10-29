import { Weather } from "./Weather";

export class Field {
  constructor() {
    this.reset();
  }

  reset() {
    this.field = null; // 일렉트릭필드, 그래스필드
    this.fieldTurnRemain = 0;

    this.weather = new Weather();
    this.trickRoom = null;
    //공간변화는 중첩가능

    this.player = {
      sRock: null, //스텔스록
      spikes: null, // 압정뿌리기
      poisonSpikes: null, // 독압정 (1 = 독, 2 = 맹독)
    };

    this.npc = {
      sRock: null, //스텔스록
      spikes: null, // 압정뿌리기
      poisonSpikes: null, // 독압정 (1 = 독, 2 = 맹독)
    };

    this.noClean = {
      // 고속스핀 등으로 인해 없어지지 않는 필드 요소
      player: {
        healingWish: null, // 치유소원 -> 필드에 적용 후 교체해 나올떄 = field.js에서 처리
        lunarDance: null, // 초승달춤
        wish: null, //희망사항 -> 다음턴 종료시 필드에 있는 포켓몬 = turnEnd.js에서 처리
        reflect: null, // 리플렉터
        lightScreen: null, // 빛의장막
      },
      npc: {
        healingWish: null,
        lunarDance: null,
        wish: null,
        reflect: null,
        lightScreen: null,
      },
    };
  }
}
