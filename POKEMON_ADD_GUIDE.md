# 포켓몬 및 실전 샘플 추가 종합 가이드 (POKEMON ADD GUIDE)

본 문서는 새로운 포켓몬 및 실전 배틀 샘플을 코드베이스에 추가할 때 따르는 표준 실행 절차와 아키텍처 규칙을 정리한 문서입니다. 나중에 새로운 포켓몬 추가 작업을 요청받을 때 이 가이드의 순서와 규칙을 그대로 준수하여 작업합니다.

---

## 1. 사전 정보 수집 및 유효성 검증

포켓몬을 코드에 추가하기 전, 다음 스펙을 사전에 확인하고 검증합니다.

1. **전국도감 번호 (4자리 문자열)**:
   - 4자리 문자열 형식(예: `"0697"` 견고라스, `"0823"` 아머까오)으로 관리합니다.
   - 진화 전/후 및 폼체인지 ID를 구분합니다.
2. **종족값 (Base Stats)**:
   - HP, 공격(atk), 방어(def), 특수공격(catk), 특수방어(cdef), 스피드(speed)
   - **필수 검증 공식**: `hp + atk + def + catk + cdef + speed === total`
3. **타입**:
   - `type1` (예: `"바위"`, `"비행"`), `type2` (단일 타입일 경우 `null`, 복합 타입일 경우 `"드래곤"`, `"강철"` 등)
4. **실전 샘플 스펙**:
   - **노력치 (합계 508 필수)**: `hps + atks + defs + catks + cdefs + speeds === 508`
   - **성격 보정**: 상승 스탯 키(`up`), 하락 스탯 키(`down`)
     - 유효 키: `"atk"`, `"def"`, `"catk"`, `"cdef"`, `"speed"`
     - 예: 명랑(S↑ C↓) -> `up: "speed"`, `down: "catk"` / 장난꾸러기(B↑ C↓) -> `up: "def"`, `down: "catk"`
   - **개체치 (`gacha`)**: `"6V"`, `"5V0A"` (특수형), `"5V0S"` (최저속형), `"4V0A0S"` 등
   - **역할군 (`role`)**: `"물리어태커"`, `"특수어태커"`, `"물리막이"`, `"특수막이"`, `"기점잡이"`

---

## 2. 의존성 사전 확인 및 구현 (기술 / 특성 / 도구)

샘플에서 사용할 기술 4개, 특성, 지닌도구가 코드베이스에 이미 구현되어 있는지 점검하고, 미구현 요소가 있다면 먼저 구현합니다.

### A. 기술 (Skill) 점검 및 등록

- **위치**: `src/entity/Skill/skillList/` (`atk.js`: 물리공격기, `catk.js`: 특수공격기, `buf.js`: 버프/회복기, `natk.js`: 상대 디버프/상태이상기)
- **등록 형식**:
  ```javascript
  new Skill(name, type, power, accuracy, pp, priority, stype, damageCalc, desc, skillEffectList, feature);
  ```
- **핵심 플래그 (`feature`)**:
  - `touch: true`: 접촉기 (울퉁불퉁멧, 까칠한피부 발동)
  - `serial: "twoFive" | "suru" | "double" | "triple"`: 연속 공격기 (2~5회, 수류연타 3회, 더블윙 2회, 트리플악셀 3회)
  - `bite: true`: 물기 기술 (옹골찬턱 1.5배 보정)
  - `rebound: true`: 반동 기술 (이판사판 1.2배 보정)
  - `slice: true`: 베기 기술 (예리함 1.5배 보정)
  - `punch: true`: 펀치 기술 (펀치글러브 보정)
- **부가 효과 처리 (`src/entity/Skill/SkillEffect.js`)**:
  - 신규 부가 효과나 특수 연산이 필요한 경우 `skillEffectSearch` 객체에 핸들러를 추가하거나 기존 로직을 확장합니다.
  - _예시 (반동 및 돌머리 특성 연계)_:
    ```javascript
    반동: (battle, enqueue, skillEffect) => {
      let atkPokemon = battle[battle.turn.atk];
      if (atkPokemon.abil === "돌머리" || atkPokemon.origin?.abil === "돌머리") return;
      const text = atkPokemon.names + " 반동으로 데미지를 입었다!";
      const ratio = skillEffect?.ratio || 3;
      atkPokemon.getDamage(battle, enqueue, atkPokemon.turn.recentDamageGive / ratio, text);
    },
    ```
- **AI 점수 계산 반영 (`src/npc/ai/calculateSkillScore.js`)**:
  - NPC AI가 해당 기술을 올바르게 평가하도록 특성/반동 패널티 조건 등을 보정합니다.

### B. 특성 (Ability) 점검 및 등록

- **위치**: `src/entity/Ability.js`
- `abilObject`에 특성 설명 텍스트를 등록합니다.
  ```javascript
  돌머리: { text: "반동 데미지를 받는 기술을 사용해도 반동 데미지를 받지 않는다." },
  ```
- 데미지 계산, 상태이상 방어, 교체 효과 등 배틀 로직에 개입해야 하는 특성이면 관련 파일(`damageCalculate.js`, `skillCheck.js`, `SkillEffect.js` 등)에 처리 로직을 연결합니다.

### C. 지닌 도구 (Item) 점검

- **위치**: `src/entity/Item.js`
- `itemText` 및 탁쳐서떨구기/트릭 판정(`noNullItem`), AI 가중치(`aiItemScore`)에 존재하는지 확인합니다.

---

## 3. 포켓몬 원본 데이터 등록 (`PokemonData.js`)

- **파일 경로**: `src/entity/Pokemon/PokemonData.js`
- `PokemonRepository` 클래스의 `this.items` 배열에 **전국도감 번호 순서에 맞춰** 객체를 삽입합니다.

```javascript
// 형식:
new Pokemon(no, id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, feature);

// 예시 1 (견고라스 - 0697):
new Pokemon("0697", "0697", "견고라스", 521, 82, 121, 119, 69, 59, 71, "바위", "드래곤"),

// 예시 2 (아머까오 - 0823):
new Pokemon("0823", "0823", "아머까오", 495, 98, 87, 105, 53, 85, 67, "비행", "강철"),
```

---

## 4. 실전 배틀 샘플 등록 (`SamplePokemon.js`)

- **파일 경로**: `src/entity/Pokemon/SamplePokemon.js`
- `SamplePokemonList` 클래스의 `this.items` 배열에 **전국도감 번호 순서에 맞춰** 샘플 객체를 삽입합니다.

```javascript
// 형식:
new PokemonTemplate(
  id,           // 샘플명 또는 포켓몬 이름 ("견고라스")
  pokemon_id,   // 원본 도감번호 4자리 ("0697")
  gacha,        // 개체치 구분 ("6V", "5V0A", "5V0S" 등)
  hps, atks, defs, catks, cdefs, speeds, // 노력치 6개 (합계 508)
  up, down,     // 성격 보정 (상승스탯, 하락스탯)
  sk1, sk2, sk3, sk4, // 기술배치 4개
  item,         // 지닌도구
  abil,         // 특성
  role          // 역할군 ("물리어태커", "특수어태커", "물리막이", "특수막이", "기점잡이")
),

// 예시 1 (견고라스 용춤 스위퍼):
new PokemonTemplate("견고라스", "0697", "6V", 4, 252, 0, 0, 0, 252, "speed", "catk",
  "양날박치기", "스케일샷", "용의춤", "불꽃엄니", "기합의띠", "돌머리", "물리어태커"),

// 예시 2 (아머까오 철벽 바디프레스 물리막이):
new PokemonTemplate("아머까오", "0823", "6V", 252, 0, 252, 0, 4, 0, "def", "catk",
  "철벽", "바디프레스", "날개쉬기", "아이언헤드", "먹다남은음식", "프레셔", "물리막이"),
```

---

## 5. 이미지 리소스 규격 및 안내

- **저장 위치**: `public/img/pokemon/{4자리도감번호}.webp` (예: `public/img/pokemon/0823.webp`)
- **규칙**: 사용자가 이미지를 직접 등록하는 경우 파일 다운로드를 생략하고, 이미지가 저장되어야 할 경로만 안내합니다.

---

## 6. 작업 시 반드시 준수해야 하는 규칙

1. **테스트 코드 작성 금지**:
   - 사용자가 직접 테스트를 수행하므로 작업 중 `.test.js` 테스트 파일이나 파이프라인 파일을 새로 생성하거나 수정하지 않습니다.
2. **기존 주석 및 포맷 보존**:
   - 코드 수정 시 기존 주석을 최대한 유지합니다.
   - `// prettier-ignore` 블록 내의 구조나 정렬을 훼손하지 않습니다.
3. **전국도감 번호 순 정렬 유지**:
   - `PokemonData.js`와 `SamplePokemon.js` 모두 도감 번호 오름차순으로 배치되어 있으므로, 반드시 앞/뒤 포켓몬의 도감 번호 사이에 알맞게 배치합니다.
4. **수치 유효성 검사**:
   - `HP + Atk + Def + SpA + SpD + Spe = Total 종족값`
   - `H + A + B + C + D + S = 508 노력치`
   - 상승/하락 성격 키 유효성(`atk`, `def`, `catk`, `cdef`, `speed`)
