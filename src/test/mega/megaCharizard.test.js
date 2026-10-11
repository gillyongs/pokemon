// npm test -- src/test/mega/megaCharizard.test.js
import { generate } from "../../entity/Pokemon/PokemonInstance";
import Battle from "../../entity/Battle";
import { battleStart } from "../../service/battleStart";
import { switchPokemon } from "../../function/switchPokemon";

describe("리자몽 메가진화(X / Y) 테스트", () => {
  let mockQueue;
  let queueObject;

  beforeEach(() => {
    mockQueue = [];
    queueObject = {
      queue: mockQueue,
      enqueue: jest.fn((item) => mockQueue.push(item)),
      dequeue: jest.fn(() => mockQueue.shift()),
      resetQueue: jest.fn(() => (mockQueue.length = 0)),
      queueCheck: jest.fn(() => true),
    };
  });

  it("리자몽X는 리자몽나이트X를 통해 불꽃/드래곤 타입과 단단한발톱 특성으로 메가진화해야 한다", () => {
    const charizardX = generate("메가리자몽X");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(charizardX, enemy, b1, b2, eb1, eb2);

    expect(charizardX.type1).toBe("불꽃");
    expect(charizardX.type2).toBe("비행");
    expect(charizardX.abil).toBe("맹화");
    expect(charizardX.isMegaEvolveAble(battle)).toBe(true);

    charizardX.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(charizardX.isMega).toBe(true);
    expect(charizardX.name).toBe("리자몽"); // 이름 유지
    expect(charizardX.type1).toBe("불꽃");
    expect(charizardX.type2).toBe("드래곤"); // 비행 -> 드래곤
    expect(charizardX.abil).toBe("단단한발톱");
    expect(charizardX.origin.pokemon_id).toBe("0006-x");
    expect(charizardX.origin.stat.atk).toBeGreaterThan(150); // 종족치 상승 확인
  });

  it("리자몽Y는 리자몽나이트Y를 통해 가뭄 특성으로 메가진화하고 날씨를 쾌청으로 변경해야 한다", () => {
    const charizardY = generate("메가리자몽Y");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(charizardY, enemy, b1, b2, eb1, eb2);

    expect(charizardY.type1).toBe("불꽃");
    expect(charizardY.type2).toBe("비행");
    expect(charizardY.abil).toBe("맹화");
    expect(charizardY.isMegaEvolveAble(battle)).toBe(true);

    charizardY.megaEvolve(battle, queueObject.enqueue);

    expect(battle.megaUsed.player).toBe(true);
    expect(charizardY.isMega).toBe(true);
    expect(charizardY.name).toBe("리자몽"); // 이름 유지
    expect(charizardY.type1).toBe("불꽃");
    expect(charizardY.type2).toBe("비행");
    expect(charizardY.abil).toBe("가뭄");
    expect(charizardY.origin.pokemon_id).toBe("0006-y");
    expect(charizardY.origin.stat.catk).toBeGreaterThan(170); // 특공 대폭 상승

    // 가뭄 특성에 의한 날씨 변경 확인
    expect(battle.field.weather.get()).toBe("쾌청");
    expect(battle.field.weather.isSunny).toBe(true);
    const texts = mockQueue.map((item) => item.text);
    expect(texts.some((t) => t && t.includes("[특성 가뭄]") && t.includes("햇살이 강해졌다"))).toBe(true);
  });

  it("battleStart 실행 시 리자몽 메가진화가 정상 선행 발동해야 한다", () => {
    const charizardX = generate("메가리자몽X");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(charizardX, enemy, b1, b2, eb1, eb2);
    battle.megaTrigger.player = true;

    battleStart(battle, 1, 1, queueObject);

    expect(battle.megaUsed.player).toBe(true);
    expect(charizardX.isMega).toBe(true);
    expect(charizardX.type2).toBe("드래곤");
    expect(charizardX.abil).toBe("단단한발톱");
  });

  it("메가리자몽X가 메가진화 후 교체되어도 불꽃/드래곤 타입이 유지되어야 한다", () => {
    const charizardX = generate("메가리자몽X");
    const enemy = generate("한카리아스");
    const b1 = generate("윈디");
    const b2 = generate("마릴리");
    const eb1 = generate("썬더");
    const eb2 = generate("파르셀");

    const battle = new Battle(charizardX, enemy, b1, b2, eb1, eb2);
    charizardX.megaEvolve(battle, queueObject.enqueue);

    expect(charizardX.type1).toBe("불꽃");
    expect(charizardX.type2).toBe("드래곤");

    // 교체 실행 (player <-> playerBench1)
    switchPokemon(battle, "player", "playerBench1");

    // 교체되어 벤치로 들어간 리자몽X의 타입 확인
    const benchedCharizard = battle.playerBench1;
    expect(benchedCharizard.isMega).toBe(true);
    expect(benchedCharizard.type1).toBe("불꽃");
    expect(benchedCharizard.type2).toBe("드래곤");
    expect(benchedCharizard.origin.type2).toBe("드래곤");

    // 다시 교체되어 필드로 나온 리자몽X의 타입 확인
    switchPokemon(battle, "player", "playerBench1");
    expect(battle.player.type1).toBe("불꽃");
    expect(battle.player.type2).toBe("드래곤");
  });
});
