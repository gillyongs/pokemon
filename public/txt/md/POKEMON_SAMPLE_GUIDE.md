# 포켓몬 실전 샘플 등록 가이드 (POKEMON SAMPLE GUIDE)

본 문서는 `SamplePokemon.js`에 새로운 실전 배틀 샘플(일반 및 메가진화)을 등록하고 관리할 때 따르는 표준 실행 절차와 아키텍처 규칙을 정리한 문서입니다.

---

## 1. 실전 샘플 생성자 스펙 및 파라미터

- **파일 경로**: `src/entity/Pokemon/SamplePokemon.js`
- **클래스 정의**: `src/entity/Pokemon/PokemonTemplate.js`

```javascript
new PokemonTemplate(
  id,           // 샘플 고유 ID/이름 (예: "킬라플로르", "메가킬라플로르", "썬더 (특수)")
  pokemon_id,   // 원본 도감번호 4자리 (예: "0970")
  gacha,        // 개체값 ("6V", "5V0A", "5V0S", "4V0A0S")
  evs,          // 노력치 약어 문자열 ("CS252", "AS252", "HB252", "HA252" 등) 또는 배열
  up,           // 성격 상승 스탯 ("atk", "def", "catk", "cdef", "speed")
  down,         // 성격 하락 스탯 ("atk", "def", "catk", "cdef", "speed")
  sk1, sk2, sk3, sk4, // 기술배치 4개
  item,         // 지닌도구 (메가스톤 포함)
  abil,         // 시작 특성 (메가진화 전 특성)
  role,         // 역할군 ("물리어태커", "특수어태커", "물리막이", "특수막이", "기점잡이", "물리딜탱", "특수딜탱", "막이")
  tip = ""      // (선택) 운용 팁 문자열
);
```

---

## 2. 세부 파라미터 규칙 및 유효성 검증

### A. 노력치 (`evs`) 약어 표기법
`PokemonTemplate`의 `parseEvs` 함수는 다음과 같은 표준 약어를 파싱합니다:
- **`CS252`**: 특수공격(C) 252, 스피드(S) 252, 잔여 4
- **`AS252`**: 공격(A) 252, 스피드(S) 252, 잔여 4
- **`HB252`**: 체력(H) 252, 방어(B) 252, 잔여 4
- **`HA252`**: 체력(H) 252, 공격(A) 252, 잔여 4
- **`HD252`**: 체력(H) 252, 특수방어(D) 252, 잔여 4
- **합계 검증**: 내부적으로 총 508의 노력치가 할당되는지 자동 검증됩니다.

### B. 성격 보정 (`up`, `down`)
유효한 5가지 스탯 키 중 하나를 지정합니다:
- `"atk"` (공격)
- `"def"` (방어)
- `"catk"` (특수공격)
- `"cdef"` (특수방어)
- `"speed"` (스피드)
- *주의*: HP는 성격 보정 대상이 될 수 없습니다.

### C. 개체치 (`gacha`)
- `"6V"`: 모든 능력치 V (31)
- `"5V0A"`: 특수 공격형 포켓몬 (공격 Z=0, 속임수/혼란 피해 최소화)
- `"5V0S"`: 트릭룸/최저속형 포켓몬 (스피드 Z=0)
- `"4V0A0S"`: 트릭룸 특수형 포켓몬 (공격 Z=0, 스피드 Z=0)

### D. 역할군 (`role`)
반드시 아래 8개 유효 역할군 중 하나여야 합니다:
- `"물리어태커"`, `"특수어태커"`
- `"물리막이"`, `"특수막이"`, `"막이"`
- `"물리딜탱"`, `"특수딜탱"`
- `"기점잡이"`

---

## 3. 일반 포켓몬 vs 메가진화 샘플 등록 비교

### A. 일반 포켓몬 샘플 예시 (킬라플로르 기점잡이)
```javascript
new PokemonTemplate("킬라플로르", "0970", "5V0A", "HS252", "speed", "atk",
  "킬러스핀", "파워젬", "스텔스록", "독압정", "기합의띠", "독치장", "기점잡이", "독압정과 스록을 깔고 퇴장합니다. 독압정은 2번 깔면 맹독압정이 됩니다."),
```

### B. 메가진화 포켓몬 샘플 예시 (메가킬라플로르 기점잡이)
```javascript
new PokemonTemplate("메가킬라플로르", "0970", "5V0A", "CS252", "speed", "atk",
  "파워젬", "오물웨이브", "대지의힘", "니들가드", "킬라플로르나이트", "독치장", "기점잡이"),
```

> **메가진화 샘플 등록 시 주의사항**:
> 1. `pokemon_id`는 메가진화 폼 ID(`"0970-m"`)가 아닌 **기본 도감번호(`"0970"`)**를 입력합니다. (배틀 시작 시 기본 폼으로 출전 후 메가진화 트리거를 거치기 때문입니다.)
> 2. `item`에는 해당 포켓몬의 **전용 메가스톤(`"킬라플로르나이트"`)**을 장착합니다.
> 3. `abil`에는 **메가진화 전 기본 특성(`"독치장"`)**을 지정합니다. 배틀 중 메가진화가 실행되면 `MegaData.js`에 정의된 메가 특성(`"적응력"`)과 종족값으로 자동 변경됩니다.

---

## 4. 정렬 순서 및 배치 규칙

- `SamplePokemon.js`의 `this.items` 배열은 **전국도감 번호 오름차순**으로 정렬되어 있습니다.
- 동일한 도감번호에 여러 샘플(일반 형태, 메가진화 형태 등)이 존재하는 경우:
  1. 일반 샘플을 먼저 배치
  2. 메가진화 샘플을 바로 뒤에 배치
- 예: `0970` 킬라플로르 -> `0970` 메가킬라플로르 -> `0977` 어써러셔

---

## 5. 단위 테스트를 통한 실전 검증 패턴

샘플 추가 후 올바르게 엔진에 등록되었는지 검증하는 단위 테스트 패턴입니다:

```javascript
import { generate } from "../../entity/Pokemon/PokemonInstance";
import sampleList from "../../entity/Pokemon/SamplePokemon";
import Battle from "../../entity/Battle";

describe("메가킬라플로르 실전 샘플 검증", () => {
  it("샘플 템플릿 정보 및 노력치, 성격, 기술배치가 일치해야 한다", () => {
    const template = sampleList.getDataById("메가킬라플로르");
    expect(template.role).toBe("기점잡이");
    expect(template.item).toBe("킬라플로르나이트");
    expect(template.abil).toBe("독치장");
    expect(template.evs.catk).toBe(252);
    expect(template.evs.speed).toBe(252);
    expect(template.nature.up).toBe("speed");
    expect(template.nature.down).toBe("atk");
  });

  it("인스턴스 생성 및 메가진화 시 메가스펙이 정상 적용되어야 한다", () => {
    const player = generate("메가킬라플로르");
    const enemy = generate("한카리아스");
    const battle = new Battle(player, enemy);

    expect(player.isMegaEvolveAble(battle)).toBe(true);
    player.megaEvolve(battle, () => {});

    expect(player.origin.pokemon_id).toBe("0970-m");
    expect(player.abil).toBe("적응력");
    expect(player.origin.stat.catk).toBeGreaterThan(150);
  });
});
```
