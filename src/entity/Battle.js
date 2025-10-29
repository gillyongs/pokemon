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
      fastActUser: null, // 먼저 '행동'한 쪽. 교체도 포함한다.
      // battleStart.js 에서 값을 넣고
      // SkillRequirements.js 에서 기습과 방어 성공여부 체크,
      // SkillEfect.js 에서 도발 턴 계산 (교체로 나온 상대에겐 해당 턴 포함 3턴이 적용된다)
      // Bottom-Switch.js 에서 유턴 교체 후 남은 행동 파악 (선 교체면 npc가 공격을 하고 그 외엔 turnEnd만 호출)
      // damageCalculate.js 에서 아가미물기 데미지 보정 계산
      atk: null, //battle[battle.turn.atk] = player or npc
      def: null,
      atkSN: null,
      defSN: null,
      playerSN: null, // 유턴으로 battleStart 함수가 끊겼을때 Bottom-swirch.js에서 남은 행동을 계속 진행하기 위해 사용
      npcSN: null, // attackNpc(bt, bt.turn.playerSN, bt.turn.npcSN, queueObject.enqueue);
      turnEnd: null,
      // 플레이어가 쓰러졌을때 남은 이벤트(turnend) 마친 다음에 교체 화면이 나오게 하기위해 쓰는 변수
      //if (player.faint && turnEnd) { setBottom("mustSwitch");}
      textFreeze: null, // 텍스트가 넘어가지 않게 막음. "누구로 교체할까?"나 "무엇을 할까?" 텍스트 고정
      //
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
          lunarDance: null, // 초승달춤
          wish: null, //희망사항 -> 다음턴 종료시 필드에 있는 포켓몬 = turnEnd.js에서 처리
          reflect: null, // 리플렉터
          lightScreen: null, // 빛의장막
        },
        npc: {
          healingWish: null, // 치유소원
          lunarDance: null, // 초승달춤
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
        //battleStart.js에서 해당 값이 true면 진행을 끊고 교체화면을 띄운다.
        //선 유턴이면 attackNpc를 실행하고 그 외엔 turnEnd를 실행한다
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
