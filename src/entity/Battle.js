import { generate } from "./Pokemon/Pokemon";

class Battle {
  constructor(player, npc, playerBench1, playerBench2, npcBench1, npcBench2) {
    this.player = player;
    this.npc = npc;
    this.playerBench1 = playerBench1;
    this.npcBench1 = npcBench1;
    this.playerBench2 = playerBench2;
    this.npcBench2 = npcBench2;

    this.player.team = "player";
    this.npc.team = "npc";
    this.playerBench1.team = "player";
    this.npcBench1.team = "npc";
    this.playerBench2.team = "player";
    this.npcBench2.team = "npc";

    this.turn = {
      fastActUser: null, // 먼저 '행동'한 쪽. 교체도 포함한다. 기습과 방어 성공여부 체크에 사용.
      atkSN: null,
      defSN: null,
      atk: null, //battle[battle.turn.atk] = player or npc
      def: null,
      playerSN: null, // 우선도 체크에 사용
      npcSN: null,
      turnEnd: null,
      textFreeze: null, // 화면 넘어가지 않음. 유턴이나 교체
    };
    //turnEnd 같은 변수때문에 턴이 시작될때 = battleStart.js에서 초기화된다
    this.field = {
      field: null,
      fieldTurnRemain: null,
      weather: null,
      weatherTurnRemain: null,
      trickRoom: null,
      //공간변화는 중첩가능
      player: {
        sRock: null, //스텔스록
        spikes: null, // 압정뿌리기
        poisonSpikes: null, // 독압정 (1 = 독, 2 = 맹독)
      },
      npc: {
        sRock: null, //스텔스록
        spikes: null, // 압정뿌리기
        poisonSpikes: null, // 독압정 (1 = 독, 2 = 맹독)
      },
      noClean: {
        // 고속스핀 등으로 인해 없어지지 않는 필드 요소
        player: {
          healingWish: null, // 치유소원 -> 필드에 적용 후 교체해 나올떄 = field.js에서 처리
          wish: null, //희망사항 -> 다음턴 종료시 필드에 있는 포켓몬 = turnEnd.js에서 처리
          reflect: null, // 리플렉터
          lightScreen: null, // 빛의장막
        },
        npc: {
          healingWish: null, // 치유소원
          wish: null, // { name: "맘복치", amount: 시전자체력절반, turnRemain: 1 };
          reflect: null, // 리플렉터
          lightScreen: null, // 빛의장막
        },
      },
    };

    this.common = {
      player: {
        teamKr: "우리",
        teamKrReverse: "상대",
      },
      npc: {
        teamKr: "상대",
        teamKrReverse: "우리",
      },
      temp: {
        // 매 턴 초기화 필요
        uturn: null, // 플레이어 유턴 사용 여부
      },
    };

    // this.player.status.poison = true;
    // this.playerBench1.status.poison = true;
    // this.playerBench2.status.poison = true;
    // this.npc.status.poison = true;
    // this.npcBench1.status.poison = true;
    // this.npcBench2.status.poison = true;
  }
}

export function createBattle(plyayerArray, npcArray) {
  const player = generate(plyayerArray[0]);
  const npc = generate(npcArray[0]);
  npc.name = "상대 " + npc.name;
  npc.names = "상대 " + npc.names;

  const playerBench1 = generate(plyayerArray[1]);
  const npcBench1 = generate(npcArray[1]);
  npcBench1.name = "상대 " + npcBench1.name;
  npcBench1.names = "상대 " + npcBench1.names;

  const playerBench2 = generate(plyayerArray[2]);
  const npcBench2 = generate(npcArray[2]);
  npcBench2.name = "상대 " + npcBench2.name;
  npcBench2.names = "상대 " + npcBench2.names;

  return new Battle(player, npc, playerBench1, playerBench2, npcBench1, npcBench2);
}

export default Battle;
