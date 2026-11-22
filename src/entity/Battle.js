import { generatePokemonInstance } from "./Pokemon/PokemonInstance";
import { Field } from "./Field/Field";
import { BattleAccess } from "./BattleAccess";

class Battle {
  constructor(player, npc, playerBench1, playerBench2, npcBench1, npcBench2) {
    this.player = player;
    this.npc = npc;
    this.playerBench1 = playerBench1;
    this.npcBench1 = npcBench1;
    this.playerBench2 = playerBench2;
    this.npcBench2 = npcBench2;

    this.turn = {
      fastActUser: null, // 먼저 '행동'한 쪽. 교체도 포함한다.
      // battleStart.js 에서 값을 넣고
      // SkillRequirements.js 에서 기습과 방어 성공여부 체크,
      // SkillEffect.js 에서 도발 턴 계산 (교체로 나온 상대에겐 해당 턴 포함 3턴이 적용된다)
      // Bottom-Switch.js 에서 유턴 교체 후 남은 행동 파악 (선 교체면 npc가 공격을 하고 그 외엔 turnEnd만 호출)
      // damageCalculate.js 에서 아가미물기 데미지 보정 계산
      atk: null, //battle[battle.turn.atk] = player or npc
      def: null,
      atkSN: null,
      defSN: null,
      turnEnd: null,
      // 플레이어가 쓰러졌을때 남은 이벤트(turnend) 마친 다음에 교체 화면이 나오게 하기위해 쓰는 변수
      //if (player.faint && turnEnd) { setBottom("mustSwitch");}
      textFreeze: null, // 텍스트가 넘어가지 않게 막음. "누구로 교체할까?"나 "무엇을 할까?" 텍스트 고정
      switchBySkill: null, // 기술 효과로 인한 플레이어 교체 대기 여부
      batonPass: null, // 플레이어 배턴터치 사용 여부
      playerSwitched: null, // 이번 턴 플레이어 교체 여부 (속이기 판정용)
      npcSwitched: null, // 이번 턴 NPC 교체 여부 (속이기 판정용)
      destinyBondUser: null, // 길동무 발동
      //battleStart.js에서 해당 값이 true면 진행을 끊고 교체화면을 띄운다.
      //선 유턴이면 skillUseNpc를 실행하고 그 외엔 turnEnd를 실행한다
    };
    //turnEnd 같은 변수때문에 턴이 시작될때 = battleStart.js에서 초기화된다
    this.field = new Field();

    this.common = {
      player: {
        teamKr: "우리", // 리플렉터 및 빛의장막, 긴장감(상대편은 긴장해서 열매를 먹을 수 없다!)
        teamKrReverse: "상대",
      },
      npc: {
        teamKr: "상대",
        teamKrReverse: "우리",
      },
    };

    this.turnCount = 1; // "N번째 턴" 로그용
    this.megaUsed = { player: false, npc: false }; // 해당 배틀 메가진화 사용 여부
    this.megaTrigger = { player: false, npc: false }; // 해당 턴 메가진화 선택 여부
    this.hasKnockoutAugmentThisRound = false; // 해당 라운드 적 처치 증강 획득 여부 (최대 1회)

    this._events = {};
    this.initEventListeners();
  }

  // 턴 초기화 (battle.turn 및 필드/벤치 포켓몬 6마리의 turn 전부 초기화)
  resetBattleTurn() {
    const t = this.turn;
    Object.keys(t).forEach((key) => {
      t[key] = null;
    });
    [this.player, this.playerBench1, this.playerBench2, this.npc, this.npcBench1, this.npcBench2].forEach((p) => {
      p?.resetTurn?.();
    });
  }

  // 해당 진영("player" | "npc")의 필드 포켓몬이 팀에서 유일하게 생존한 마지막 포켓몬인지 여부
  isLastPokemon(side) {
    if (side !== "npc" && side !== "player") return false;
    const active = side === "npc" ? this.npc : this.player;
    if (!active || active.faint || active.hp <= 0) return false;
    const benches = side === "npc" ? [this.npcBench1, this.npcBench2].filter(Boolean) : [this.playerBench1, this.playerBench2].filter(Boolean);
    return benches.length > 0 && benches.every((p) => p.faint || p.hp <= 0);
  }

  // 해당 진영("player" | "npc")의 남은 생존 포켓몬 수가 상대보다 적은지 여부
  hasFewerPokemonThanOpponent(side) {
    if (side !== "npc" && side !== "player") return false;
    const mySide = side === "npc" ? [this.npc, this.npcBench1, this.npcBench2] : [this.player, this.playerBench1, this.playerBench2];
    const oppSide = side === "npc" ? [this.player, this.playerBench1, this.playerBench2] : [this.npc, this.npcBench1, this.npcBench2];
    const myCount = mySide.filter(Boolean).filter((p) => !p.faint && p.hp > 0).length;
    const oppCount = oppSide.filter(Boolean).filter((p) => !p.faint && p.hp > 0).length;
    return myCount < oppCount;
  }
}

Object.defineProperties(Battle.prototype, Object.getOwnPropertyDescriptors(BattleAccess));

export function createBattle(playerArray, npcArray, options = { difficulty: "이지", round: 1 }) {
  const player = generatePokemonInstance(playerArray[0], "player");
  player.originalIndex = 0;
  player.isFirst = true;
  const npc = generatePokemonInstance(npcArray[0], "npc", options);
  npc.originalIndex = 0;
  npc.isFirst = true;

  const playerBench1 = generatePokemonInstance(playerArray[1], "player");
  playerBench1.originalIndex = 1;
  const npcBench1 = generatePokemonInstance(npcArray[1], "npc", options);
  npcBench1.originalIndex = 1;

  const playerBench2 = generatePokemonInstance(playerArray[2], "player");
  playerBench2.originalIndex = 2;
  const npcBench2 = generatePokemonInstance(npcArray[2], "npc", options);
  npcBench2.originalIndex = 2;

  const b = new Battle(player, npc, playerBench1, playerBench2, npcBench1, npcBench2);
  b.isMayhem = Boolean(options.mayhemMode);
  b.teamOption = options.teamOption || null;
  return b;
}
