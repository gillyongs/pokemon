# 포켓몬 신규 등록 및 메가진화 추가 종합 가이드 (POKEMON ADD GUIDE)

본 문서는 일반 포켓몬, 폼체인지, 메가진화 포켓몬 및 관련 시스템(종족값, 특성, 기술, 도구, 전용 스프라이트)을 코드베이스에 신규 등록할 때 따르는 표준 실행 절차와 아키텍처 규칙을 정리한 문서입니다.

---

## 1. 사전 정보 수집 및 유효성 검증

포켓몬을 코드에 추가하기 전, 다음 스펙을 사전에 확인하고 검증합니다.

1. **전국도감 번호 및 ID (4자리 문자열 / 접미사 규칙)**:
   - 기본 포켓몬: 4자리 문자열 (예: `"0970"` 킬라플로르, `"0697"` 견고라스)
   - 메가진화 포켓몬: `{4자리도감번호}-m` (예: `"0970-m"` 메가킬라플로르, `"0998-m"` 메가드닐레이브)
   - 복수 메가진화 / 리전폼: `"0006-x"`, `"0006-y"`, `"0445-z"`, `"0555-g"`
2. **종족값 (Base Stats)**:
   - HP, 공격(`atk`), 방어(`def`), 특수공격(`catk`), 특수방어(`cdef`), 스피드(`speed`)
   - **필수 검증 공식**: `hp + atk + def + catk + cdef + speed === total`
   - 메가진화의 경우 통상 기본형 대비 총합 +100 상승(예: 킬라플로르 525 -> 625).
3. **타입**:
   - `type1` (예: `"바위"`, `"불꽃"`), `type2` (단일 타입일 경우 `null`, 복합 타입일 경우 `"독"`, `"비행"` 등)
4. **특성 (Abilities)**:
   - 일반 포켓몬: 보유 가능한 특성 배열 `["독치장", "부식"]`
   - 메가진화 포켓몬: 진화 후 고정 특성 배열 `["적응력"]`

---

## 2. 의존성 요소 사전 구현 및 점검 (기술 / 특성 / 도구)

등록할 포켓몬이 사용하는 기술, 특성, 전용 메가스톤이 엔진에 구현되어 있는지 확인하고 누락된 요소를 먼저 구현합니다.

### A. 기술 (Skill) 등록 및 엔진 연동
- **정의 파일**: `src/entity/Skill/skillList/`
  - `atk.js`: 물리공격기
  - `catk.js`: 특수공격기
  - `buf.js`: 버프/회복/설치기/방어기 (예: `방어`, `니들가드`, `배북`)
  - `natk.js`: 상태이상/디버프기 (예: `맹독`, `전기자석파`)
- **생성자 형식**:
  ```javascript
  new Skill(name, type, power, accur, pp, prior, stype, requirement, text, skillEffectList, feature);
  ```
- **핵심 플래그 (`feature`)**:
  - `touch: true`: 접촉기 (울퉁불퉁멧, 까칠한피부, 니들가드 가시 데미지 판정)
  - `protect: true`: 방어 판정 기술
  - `sound: true`, `slice: true`, `punch: true`, `serial: ...` 등
- **발동 조건 및 효과 핸들러 연결**:
  - 조건부 실패 체크: `src/entity/Skill/SkillRequirement.js` (예: 연속 방어 카운트, HP/랭크 제한 등)
  - 기술 발동 효과: `src/entity/Skill/SkillEffect.js` (예: `니들가드`의 `turn.protect = true`, `turn.spikyShield = true`)
  - 피격/방어 상호작용: `src/service/skillCheck.js` (예: 니들가드로 상대 접촉기 차단 시 1/8 가시 피해)
  - 도감 기술 풀 등록: `src/skill/PokemonSkillList.js`의 `core` 및 `others` 배열에 등록하고 `UNIMPLEMENTED_SKILLS`에서 제거.
  - **포켓몬 기술 풀(CORE 및 배울 수 있는 기술) 수집 원칙**:
    - `https://pkmnchamps.com/pokedex/{도감번호}` (예: `https://pkmnchamps.com/pokedex/212`)를 조회하여 데이터가 있으면 이를 우선적으로 가져옵니다.
    - 레귤레이션 사용률 상위 기술을 `core`로, 그 외 도감상 배울 수 있는 기술 전체를 `others`로 분류하여 등록합니다.

### B. 특성 (Ability) 등록 및 엔진 연동
- **설명 등록**: `src/entity/Ability.js`의 `abilObject`에 특성 설명 등록
  ```javascript
  부식: { text: "강철타입이나 독타입 포켓몬도 독 또는 맹독 상태로 만들 수 있다." },
  적응력: { text: "자신과 같은 타입인 기술의 위력이 올라간다." },
  ```
- **상태이상/배틀 엔진 연결**:
  - 상태이상 면역 무시 특성: `src/function/ailment.js`의 `ailmentAbleCheck`에서 공격자 특성 `부식` 검사 후 강철/독 타입 예외 허용.
  - 위력 보정 특성: `src/util/damageCalculate.js` (적응력: 자속 1.5배 -> 2.0배 보정).
  - 접촉/피격 특성: `src/service/onHit.js` (독치장, 까칠한피부 등).

### C. 도구 및 메가스톤 등록
- **도구 정의 (`src/entity/Item.js`)**:
  - `itemText`에 도구 설명 추가 (예: `킬라플로르나이트: "킬라플로르에게 지니게 하면 배틀 중 메가진화할 수 있다."`)
  - `noNullItem` 배열에 추가하여 탁쳐서떨구기나 트릭으로 도구가 제거/교체되지 않도록 방지.
- **커스텀 도구 필터링 (`src/component/customScreen/sampleInfo/ItemSearchModal.js`)**:
  - `EXCLUSIVE_ITEMS` 객체에 전용 포켓몬 매칭 함수 등록 (예: `킬라플로르나이트: (p) => isPokemon(p, "킬라플로르")`).

> [!CAUTION]
> **메가스톤 이미지(`XXX나이트.webp`) 임의 복사 절대 금지**:
> 전용 메가스톤 이미지(`public/img/item/XXX나이트.webp`)가 존재하지 않는다고 해서 임의로 다른 메가스톤 이미지를 복사하여 넣지 말 것 (사용자가 직접 추가할 예정). 도구 정의(`Item.js`), 전용 필터링(`ItemSearchModal.js`), 메가 데이터 매핑(`MegaData.js`)만 코드로 구성합니다.

---

## 3. 포켓몬 기본 데이터 등록 (`PokemonData.js`)

- **파일 경로**: `src/entity/Pokemon/PokemonData.js`
- `PokemonRepository`의 `this.items` 배열에 **전국도감 번호 순서에 맞춰** 등록합니다.

```javascript
// 생성자: new Pokemon(no, id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, abilList);

// 일반 형태
new Pokemon("0970", "0970", "킬라플로르", 525, 83, 55, 90, 130, 81, 86, "바위", "독", ["독치장", "부식"]),

// 메가진화 형태 (메가진화 후 ID: "0970-m")
new Pokemon("0970", "0970-m", "메가킬라플로르", 625, 83, 90, 105, 150, 96, 101, "바위", "독", ["적응력"]),
```

---

## 4. 메가진화 관계 데이터 및 별칭 등록

메가진화가 가능한 포켓몬인 경우 추가로 2개 파일에 관계를 정의합니다.

1. **메가진화 매핑 (`src/entity/Pokemon/MegaData.js`)**:
   `megaDataList`에 기본 포켓몬 도감번호 키로 매핑 객체를 추가합니다:
   ```javascript
   "0970": [
     {
       stone: "킬라플로르나이트",
       megaFormId: "0970-m",
       name: "메가킬라플로르",
       abil: "적응력",
     },
   ],
   ```
2. **기술 별칭 매핑 (`src/skill/PokemonSkillList.js`)**:
   `POKEMON_SKILL_ALIASES` 객체에 메가진화 이름을 폼 ID로 연결합니다:
   ```javascript
   메가킬라플로르: "0970-m",
   ```

---

## 5. 스프라이트 이미지 처리 및 규격

- **저장 위치**: `public/img/pokemon/{id}.webp`
  - 일반 포켓몬: `public/img/pokemon/0970.webp`
  - 메가 포켓몬: `public/img/pokemon/0970-m.webp`
- **이미지 규격**:
  - 크기: **256 × 256 픽셀**
  - 포맷: **WebP (알파 투명 채널 포함, quality 95)**
  - 패딩/위치: 가로/세로 최대 230px 이내로 비율 유지 축소 후 256x256 캔버스 중앙 정렬.
- **체커보드 누끼 처리 팁**:
  - 업로드된 이미지가 체크무늬(회색/흰색 격자 무늬 배경)인 경우, RGB 밝기(220~255) 및 무채색 여부를 판별하여 Flood Fill 및 내부 고립 영역(꽃잎 사이 등)을 투명화하여 WebP로 변환합니다.

---

## 6. 체크리스트 요약

- [ ] 도감번호 4자리 규격 및 종족값 총합 일치 확인
- [ ] `https://pkmnchamps.com/pokedex/{도감번호}`에서 기술 풀(core / others) 조회 및 반영
- [ ] 신규 기술(우선도, feature, SkillEffect, skillCheck) 구현 완료
- [ ] 신규 특성(Ability.js 설명, ailment.js / damageCalculate.js 배틀 효과) 구현 완료
- [ ] 도구(Item.js noNullItem 및 ItemSearchModal 전용 매핑) 구현 완료 (메가스톤 이미지는 임의 복사 금지)
- [ ] `PokemonData.js`에 원본 및 메가진화 폼 등록
- [ ] 메가진화인 경우 `MegaData.js` 및 `POKEMON_SKILL_ALIASES` 등록
- [ ] `public/img/pokemon/{id}.webp` 256x256 투명 스프라이트 배치 완료 (크기 밸런스 점검)
- [ ] 단위 테스트 작성 및 통과 확인
