# 포켓몬 샘플 추가 가이드 (POKEMON SAMPLE GUIDE)

본 문서는 포켓몬 배틀 시뮬레이터 프로젝트에 새로운 포켓몬 및 실전 샘플을 검색하고 코드베이스에 등록하는 표준 절차를 정리한 문서입니다.

---

## 1. 사전 정보 수집 (도감 번호 및 종족치 확인)

1. **전국도감 번호 확인**:
   - 진화 전/후 포켓몬의 도감 번호를 정확히 구분합니다.
   - 예시: `0529` = 두더류 (Drilbur), `0530` = 몰드류 (Excadrill)
   - 코드 내 도감 번호는 **4자리 문자열**(예: `"0530"`) 형태로 사용합니다.

2. **종족치(Base Stats) 수치 확인**:
   - HP, 공격(atk), 방어(def), 특수공격(catk), 특수방어(cdef), 스피드(speed) 수치를 확인합니다.
   - `HP + 공격 + 방어 + 특공 + 특방 + 스피드 = 총종족값` 공식이 일치해야 합니다.

3. **스프라이트 이미지 수집 규칙**:
   - 이미지 출처: `https://pokemon.fandom.com/wiki/List_of_Pok%C3%A9mon` (Fandom Wiki)
   - 저장 경로: `public/img/pokemon/{4자리도감번호}.webp` (예: `public/img/pokemon/0530.webp`)

---

## 2. 코드베이스 등록 절차

### 단계 1: 원본 포켓몬 등록 (`PokemonOriginal.js`)

파일 경로: `src/entity/Pokemon/PokemonOriginal.js`

`PokemonRepository` 클래스의 `this.items` 배열에 도감 번호 순서에 맞춰 객체를 추가합니다.

```javascript
new Pokemon(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, feature);
```

**예시 (몰드류 추가):**

```javascript
new Pokemon("0530", "몰드류", 508, 110, 135, 60, 50, 65, 88, "땅", "강철"),
```

---

### 단계 2: 실전 배틀 샘플 검색 및 등록 (`SamplePokemon.js`)

1. **실전 샘플 조사**:
   - 나무위키 또는 포켓몬 배틀 커뮤니티에서 해당 포켓몬의 대표적인 샘플(특성, 지닌도구, 성격, 노력치, 기술배치)을 검색합니다.
   - 기술(`src/entity/Skill/skillList/`), 도구(`src/entity/Item.js`), 특성(`src/entity/Ability.js`)이 기존 코드에 존재하고 구현되어 있는지 확인합니다.

2. **샘플 객체 생성 (`SamplePokemon.js`)**:
   파일 경로: `src/entity/Pokemon/SamplePokemon.js`

   `BattlePokemonRepository` 클래스의 `this.items` 배열에 샘플 객체를 추가합니다.

```javascript
new BattlePokemon(
  id, // 포켓몬 이름 ("몰드류")
  pokemon_id, // 원본 도감 번호 4자리 ("0530")
  gacha, // 개체치 구분 ("6V", "5V1A", "5V1S", "4V")
  hps,
  atks,
  defs,
  catks,
  cdefs,
  speeds, // 노력치 (합계 508)
  up,
  down, // 성격 보정 (상승 스탯, 하락 스탯)
  sk1,
  sk2,
  sk3,
  sk4, // 기술 4개
  item, // 지닌 도구
  abil, // 특성
);
```

**예시 (몰드류 틀깨기 기합의띠 샘플):**

```javascript
new BattlePokemon("몰드류", "0530", "6V", 4, 252, 0, 0, 0, 252, "speed", "catk",
  "지진", "아이언헤드", "칼춤", "암석봉인", "기합의띠", "틀깨기"),
```

---

## 3. 작업 시 주의사항 (규칙)

1. **테스트 파일 생성 금지**:
   - 사용자가 직접 테스트를 수행하므로 작업 중 `.test.js` 파이프라인/테스트 파일을 생성하거나 남겨두지 않습니다.
2. **도감 번호 검증**:
   - 진화 단계별 도감 번호를 반드시 재확인합니다.
3. **노력치 및 종족치 유효성 검사**:
   - 노력치 총합은 반드시 `508`이어야 하며, 성격 상승/하락 스탯 키(`"atk"`, `"def"`, `"catk"`, `"cdef"`, `"speed"`)가 올바른지 체크합니다.
