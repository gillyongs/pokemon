// npm test -- src/test/scratch/randomMockBattle.test.js
import sampleList from "../../entity/Pokemon/SamplePokemon";
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";

describe("랜덤 샘플 포켓몬 모의 배틀 테스트", () => {
  it("임의의 샘플 포켓몬 6마리를 골라 배틀을 세팅하고 단순 에러 무시가 아닌 실제 턴 로직(로그, PP/HP 감소 등)이 실행되어야 한다", () => {
    // 1. 랜덤 샘플 포켓몬 6마리 추출
    const items = sampleList.items;
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);
    expect(selected.length).toBeGreaterThan(0);
    
    // 2. 포켓몬 객체 생성
    const player = generate(selected[0].id);
    const npc = generate(selected[1].id);
    const playerBench1 = generate(selected[2].id);
    const playerBench2 = generate(selected[3].id);
    const npcBench1 = generate(selected[4].id);
    const npcBench2 = generate(selected[5].id);
    
    // 초기 상태 기억
    const playerInitialHP = player.hp;
    const npcInitialHP = npc.hp;
    const playerInitialPP = player.pp[1];
    const npcInitialPP = npc.pp[1];
    
    // 3. Battle 인스턴스 초기화
    const mockBattle = new Battle(player, npc, playerBench1, playerBench2, npcBench1, npcBench2);
    
    // 4. 모의 queueObject 구성 (출력되는 텍스트 로그들을 수집)
    const queue = [];
    const queueObject = {
      resetQueue: () => { queue.length = 0; },
      enqueue: (action) => { queue.push(action); }
    };
    
    // 5. battleStart 실행 (에러 없이 동작하는지 우선 검증)
    // 플레이어 1번 기술, NPC 1번 기술 사용
    expect(() => {
      battleStart(mockBattle, 1, 1, queueObject);
    }).not.toThrow();
    
    // 6. 결과 검증 (단순히 에러가 안 나는 걸 넘어 실제 로직이 수행되었는지 확인)
    
    // 최소한 한 줄 이상의 배틀 텍스트 로그(공격 텍스트, 데미지 텍스트, 날씨 등)가 큐에 담겨야 함
    expect(queue.length).toBeGreaterThan(0);
    
    // 실제 텍스트가 담겨있는지 확인
    const hasText = queue.some(q => q.text && typeof q.text === "string" && q.text.length > 0);
    expect(hasText).toBe(true);

    // 기술 사용, 풀죽음 등의 로직이 돌았으므로,
    // 최소한 둘 중 한 명의 PP가 줄었거나 (정상 공격), 체력이 깎였거나 (데미지), 상태이상/랭크업 등이 일어났어야 함
    const isStateChanged = 
      player.hp < playerInitialHP || 
      npc.hp < npcInitialHP ||
      player.pp[1] < playerInitialPP ||
      npc.pp[1] < npcInitialPP ||
      Object.values(player.ailment).some(v => v !== null) ||
      Object.values(npc.ailment).some(v => v !== null) ||
      Object.values(player.tempStatus.rank).some(v => v !== 0) ||
      Object.values(npc.tempStatus.rank).some(v => v !== 0);

    // 아무런 상태 변화도 없는 빈 턴은 포켓몬 배틀 로직상 성립할 수 없음을 검증
    expect(isStateChanged).toBe(true);
  });
});
