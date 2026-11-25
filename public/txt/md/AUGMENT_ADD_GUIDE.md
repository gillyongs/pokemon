# 🤖 AI 에이전트용 증강(Augment) 및 시너지 추가 절대 가이드 (`AUGMENT_ADD_GUIDE.md`)

> **이 문서의 목적**: AI 코딩 에이전트가 신규 증강(일반/즉발/버프/저주/교체/시너지) 추가 또는 기존 증강 수정 요청을 받았을 때, **불필요한 파일 탐색 없이 수정 대상 파일, 데이터 스키마, 아이콘 렌더링 패턴, 배틀 파이프라인 훅 위치, 라운드 승계 직렬화 지점**을 즉각 파악하고 한 번에 무결성 있는 코드를 작성하도록 설계된 단일 참조 문서(Single Source of Truth)입니다.

---

## 0. ⚡ 효과 유형별 파일 라우팅 매트릭스 (Effect-to-File Routing Matrix)

증강의 효과 설명을 분석한 뒤 아래 표에서 해당하는 파이프라인 파일만 정확히 열어 수정합니다.

| 증강 효과 유형 | 수정 대상 파일 및 함수 | 핵심 구현 패턴 및 주의사항 |
| :--- | :--- | :--- |
| **1. 증강 메타데이터 / 등장조건 / 시너지 정의 (필수)** | `src/entity/Augment/AugmentData.js`<br>(`AUGMENT_LIST`, `AUGMENT_SYNERGY_MAP`, `SYNERGY_ACTIVATION_THRESHOLD`, `SYNERGY_INFO_MAP`) | - 모든 신규 증강의 필수 등록처.<br>- `isEligible` 내부 헬퍼 함수는 파일 최하단 non-export 영역에 작성. |
| **2. 증강 아이콘 렌더링 (필수)** | `src/component/battleScreen/augment/AugmentIcon.js`<br>`public/img/augment/{id}.png`<br>`build/img/augment/{id}.png` | - **Section 3의 3대 아이콘 패턴(돌출형 배지 / 원형 클리핑 일러스트 / 기본 원 내부 그래픽)** 중 하나를 선택.<br>- 자체 배경/링이 있는 아이콘은 반드시 **line ~1086의 베이스 배경 원 제외 조건(`id !== "{id}"`)**에 추가. |
| **3. 기초 스탯(공/방/특공/특방/스피드) 증감** | `src/calc/getStat.js`<br>(`getAugmentedStat`) | - **합연산(+N)**: `for (const aug of augments)` 합적용 블록(또는 팀 버프 블록)에 `val += N; logText += ...` 추가.<br>- **곱연산(*N)**: 곱적용 블록(또는 팀 시너지 블록)에 `val = Math.round(val * N); logText += ...` 추가. |
| **4. 최대 HP 증감** | `src/calc/hpCalculate.js`<br>(`hpCalculate`) | - `pokemon.o.hp`를 절대 직접 수정하지 말 것.<br>- 합연산(`giantAbsorption`) → 곱연산(`ironWall`, `hyperBody`, `growUp`, `praiseTheSun`) 순서로 계산하고 `logText` 기록. |
| **5. 데미지 계산 공식 내 배율 / 공방 스탯 치환** | `src/calc/damageCalculate.js`<br>(`damageCalculate`, `applyStatSwapAugments`) | - **공방 스탯 치환**: 파일 하단 `applyStatSwapAugments(stats, pokemon)`에 추가.<br>- **고정 공식(+2) 이전 배율**: `attackPokemon.log.damage1` 구간에서 `damage *= N` 적용.<br>- **고정 공식 이후 최종 배율**: `attackPokemon.log.damage2` 구간(급소/버서크/타오르는 천 개의 태양 등)에서 `damage *= N` 적용.<br>- **최종 고정 추가 데미지**: `finalDamage` 산출 직후(`bladeOfTheRuinedKing` 구간)에 합산. |
| **6. 공격 적중 직전(Pre-Attack) 발동 효과** | `src/service/skillUse.js`<br>(`if (skillType === "atk" \|\| skillType === "catk")` 블록 내부, `attackDamage` 호출 직전) | - `afterSkillCheck(bt, enqueue)` 통과 후 `attackDamage` 직전에 배치.<br>- 예: `practiceMakesCritical`(스택 누적), `focusOne`(첫 타겟 기록), `superheatedGladius`(공격 전 선 화상 부여).<br>- 상대에게 상태를 부여할 때 대타출동(`substitute`) 및 틈새포착/음파 관통 여부를 반드시 체크. |
| **7. 피격 시 체력 차감 / 버티기 / 처형 / 격파 트리거** | `src/service/damage/damage.js` (`attackDamage`)<br>`src/service/damage/endure.js` (`checkEndure`, `checkPassiveEndure`)<br>`src/entity/Pokemon/Methods/PokemonGetDamage.js` (`getDamage`, `handleFaint`) | - **기절 버티기(HP 1)**: 공격 피격 버티기는 `checkEndure`, 비공격/패시브 버티기는 `checkPassiveEndure`에 추가.<br>- **처형/피격 디버프**: `damage.js`의 `defPokemon.hp > 0` 구간(`collector`, `armorBreak`).<br>- **적 직접 처치 시 스택/버프**: `damage.js`의 `defPokemon.hp <= 0` 구간(`dragonDie`, `mejaisSoulstealer`, `dragonSlayer`, `rampagingPower`). |
| **8. 피격 시 반격 / 접촉 반응 (Defensive On-Hit)** | `src/service/onHit.js`<br>(`applyOnHitEvents`) | - 피격자 기준은 `defPokemon = battle[battle.turn.def]`, 공격자 기준은 `atkPokemon = battle[battle.turn.atk]`.<br>- 예: `thornmail`(가시갑옷 1/8 반사), `sunfireCape`(태양불꽃망토 10% 화상), `grandmasChiliOil`(불꽃몸 확률 3배). |
| **9. 공격 완료 후(Post-Attack) 추가 타격 / 회복 / 반동** | `src/entity/Skill/SkillEffect.js`<br>(`공통` 함수 내부) | - 기술 데미지 판정이 끝난 뒤(연속기는 마지막 타격 후) 1회 실행됨.<br>- 예: `luckyRecovery`, `threeSnails`, `wujuStyle`, `powerStrike`, `ludensEcho`, `salamandra`, `flamingKatana`, `limiterRemoval`. |
| **10. 턴 종료(Turn-End) 지속 회복 / 도트 딜 / 상태 부여** | `src/service/turnEnd.js`<br>(`turnEnd`) | - `[fastUser, slowUser]` 순서로 실행.<br>- **회복 계열**: `applyWarmogsArmor` 구간(턴 종료 초반).<br>- **상태이상 데미지 계열**: `applyStatusDamage` (`grandmasChiliOil` 화상 데미지 배율, `sunBreathing` 화상 스택 비례 데미지, `praiseTheSun` 상대 화상 데미지 비례 회복).<br>- **턴 종료 상태 부여 / 도트 데미지**: `applyAThousandBlazingSuns`, `applySunfireAegis`, `applyGiantAbsorption`.<br>- **절대 규칙**: `battle.resetBattleTurn()`은 반드시 `turnEnd`의 맨 마지막 줄에 유지. |
| **11. 상태이상 부여 / 중첩 / 면역 판정** | `src/service/ailment.js`<br>(`ailmentAbleCheck`, `applyAilment`, `getBurnStack`) | - 상태이상 중복/중첩 허용 조건은 `ailmentAbleCheck`에서 판정(`sunBreathing` 최대 13스택, `superheatedGladius` 화상 대상 추가 화상 시 최대 HP 10% 데미지).<br>- 자해 화상(`flameOrb`, `flamingKatana` 자해 분기)은 6번째 인자 `attacker`에 본인을 넘겨 상대 중첩/추가 데미지와 구분. |
| **12. 체력 회복량 증감 (치유 증가 / 치유 감소)** | `src/entity/Pokemon/Methods/PokemonRecover.js`<br>(`_doRecover`) | - 모든 회복(`recover`, `recoverNoText`)이 거치는 단일 진입점.<br>- 예: `spiritVisage`(회복량 1.5배), 화상 2스택 이상 치유 감소(`Math.floor(amount * 0.3)`).<br>- **주의**: 외부에서 주기적으로 `recover`를 호출할 때는 풀피 메시지(`"더 이상 회복할 수 없다!"`)가 스팸되지 않도록 `if (p.hp < p.maxHp)` 조건을 먼저 확인할 것. |
| **13. 스피드 / 행동 우선도 보정** | `src/calc/speedCheck.js`<br>(`speedCalculate`, `priCalculate`) | - 조건부 스피드 배율(`dragonHunter`, `lastWarrior`, `believeInMyself`)은 `speedCalculate`에, 우선도 변경(`nimbleMoves`)은 `priCalculate`에 구현. |
| **14. 급소 확률 보정** | `src/calc/criticalCalculate.js` (`criticalCalculate`)<br>`src/service/skillUse.js` (`fatalStrike`) | - 급소 확률(%) 가산: `criticalCalculate.js` (`infinityEdge`, `sharpEyes`, `practiceMakesCritical`, `lostTechnologyCritical`).<br>- 급소 적중 후 해당 기술 영구 확정 급소 잠금: `skillUse.js` & `damageCalculate.js` (`fatalStrike`). |
| **15. 명중률 보정** | `src/calc/accuracyCalculate.js`<br>(`getAccuracy`) | - 기술 명중률 고정 또는 보정(`noUnfairMiss` 등). |

---

## 1. 📋 `AugmentData.js` 증강 객체 표준 스키마

`src/entity/Augment/AugmentData.js`의 `AUGMENT_LIST` 배열에 아래 스키마에 맞춰 객체를 등록합니다.

```javascript
{
  // [필수] 카멜케이스 고유 식별자 (AugmentIcon.js 및 hasAugment("id")와 1:1 매칭)
  id: "exampleAugment",

  // [필수] UI 표시 한글 이름
  name: "예시 증강",

  // [필수] 기본 설명 텍스트 (줄바꿈은 \n 사용, 프리뷰 모달 등에서 white-space: pre-wrap으로 렌더링됨)
  desc: "첫 번째 줄 설명입니다.\n두 번째 줄 설명입니다.",

  // [분류별 택1]
  // 1) 일반 장착형 증강: cost: 0 | 1 | 2 | 3 | 5 | 7 | 10 | 16 (포켓몬당 최대 3개 슬롯 차지)
  // 2) 시너지 버프 증강: synergy: true, isRandom: false, weight: "-" (슬롯 무제한, 조건 충족 시 자동 활성화)
  // 3) 일반/영구 버프: buf: true, permanent: true (영구 버프일 때만), cost: "-" 또는 숫자
  // 4) 일반/영구 저주(디버프): curse: true, permanent: true (영구 저주일 때만), cost: "-"
  // 5) 즉발형 증강: cost: "-" (슬롯 차지 안 함)
  cost: 2,

  // [필수] 등장 가중치 (숫자, 함수 (pokemon, battle, team) => number, 또는 랜덤 등장 불가 시 "-")
  weight: 100,

  // [선택] 등장 가능 조건 함수 (true 반환 시에만 선택지에 등장, 시너지 프리뷰의 '획득 불가' 판정에도 사용됨)
  isEligible: (pokemon, battle, team) => {
    return canInflictBurn(pokemon);
  },

  // [선택] 증강 획득 즉시(또는 라운드 이월 재적용 시) 1회 실행되는 훅
  onApply: function (pokemon, battle, options) {
    // options?.isCarryover, options?.isHiddenGrant 등 확인 가능
  },

  // [선택] 4대 텍스트 커스터마이징 (미지정 시 desc 및 공통 포맷 자동 사용)
  selDesc: (pokemon, battle) => "...",                 // 증강 선택 모달 카드 텍스트
  screenText: (target, prevPokeName, options) => "...", // 배틀 하단 텍스트창 획득 연출 문구
  logModalText: (target, prevPokeName, options) => "...", // 배틀 로그 모달 기록 문구
  statusModalText: (pokemon, battle, options) => "...", // 증강 현황/유지 모달 텍스트
}
```

### 1.1 `AugmentData.js` 하단 내부 전용 헬퍼 함수 활용

`isEligible`이나 `weight` 작성 시 `AugmentData.js` 최하단(line ~3885 이후)에 정의된 내부 헬퍼 함수를 적극 재사용하고, 새로운 공통 조건 함수가 필요하면 **파일 최하단에 `export` 없이** 추가합니다.

- `isTankPokemon(pokemon)`: 역할군(`pokemon.role`)이 `"막이"`, `"물리막이"`, `"특수막이"`인지 확인
- `isPhysicalPokemon(pokemon)`: `atk >= catk`이고 물리 공격기를 보유했는지 확인
- `isSpecialPokemon(pokemon)`: `catk >= atk`이고 특수 공격기를 보유했는지 확인
- `hasAttackSkill(pokemon)` / `getAttackSkills(pokemon)` / `getPokemonSkills(pokemon)`
- `hasSkill(pokemon, skillName)`: 특정 기술 보유 여부
- `hasSomeAbil(pokemon, abilName)`: 현재, 원본, 또는 메가진화 특성이 `abilName`인지 확인
- `hasSomeItem(pokemon, itemName)`: 현재 또는 원본 도구가 `itemName`인지 확인
- `isHpAtLeast(pokemon, ratio)`: 현재 HP 비율 조건 확인
- `canInflictBurn(pokemon)`: `불꽃몸` 특성, 화상 부여 증강(`salamandra`, `flamingKatana`, `sunfireCape`, `aThousandBlazingSuns`), 또는 `화상`/`트라이어택` 부가효과 기술 보유 여부 확인 (`grandmasChiliOil`, `sunBreathing` 등에서 공통 사용)
- `getTypeDefenseAugmentWeight(pokemon, battle, targetType)`: 타입별 방어 증강(`waterOmotics`, `giantSoldierOfStone`) 가중치 산출

---

## 2. 🔗 공명 시너지(Synergy) 추가 및 다중 시너지 규칙

### 2.1 시너지 등록 4단계 (`src/entity/Augment/AugmentData.js`)

1. **`AUGMENT_LIST`에 시너지 버프 객체 등록**:
   ```javascript
   {
     id: "praiseTheSun",
     name: "태양 만세",
     desc: "해당 포켓몬의 최대 HP가 1.5배 증가합니다.\n상대가 화상 데미지를 입었을 경우 해당 수치만큼 체력을 회복합니다.",
     synergy: true,
     isRandom: false,
     weight: "-",
   },
   ```
2. **`SYNERGY_ACTIVATION_THRESHOLD` 등록 (조건 증강이 4개 이상일 때만)**:
   - 조건 증강 배열 길이와 필요 개수가 같으면(예: 3개 중 3개) 생략 가능(기본값 `requiredIds.length`).
   - 4개 중 3개, 5개 중 3개처럼 부분 달성 시너지인 경우 명시적으로 임계치를 등록합니다:
   ```javascript
   const SYNERGY_ACTIVATION_THRESHOLD = {
     lostTechnologyCritical: 3,
     echoOfHero: 3,
     giantAbsorption: 3, // 5개 중 3개
     praiseTheSun: 3,    // 4개 중 3개
   };
   ```
3. **`AUGMENT_SYNERGY_MAP`에 조건 증강 ID 배열 매핑**:
   ```javascript
   export const AUGMENT_SYNERGY_MAP = {
     praiseTheSun: ["sunfireCape", "sunfireAegis", "aThousandBlazingSuns", "sunBreathing"],
     // ...
   };
   ```
4. **`SYNERGY_INFO_MAP`에 시너지 메타데이터 등록**:
   ```javascript
   const SYNERGY_INFO_MAP = {
     praiseTheSun: {
       emoji: "☀️",
       theme: "태양 만세",
       title: "태양 만세",
       desc: "해당 포켓몬의 최대 HP가 1.5배 증가합니다.\n상대가 화상 데미지를 입었을 경우 해당 수치만큼 체력을 회복합니다.",
     },
     // ...
   };
   ```

### 2.2 다중 시너지 소속 증강 동작 원리
- 하나의 일반 증강이 2개 이상의 시너지에 동시에 포함될 수 있습니다 (예: `sunfireCape`는 `praiseTheSun`과 `giantAbsorption`에 동시 소속).
- `getAugmentSynergyInfo(augId)`는 `AUGMENT_SYNERGY_MAP`을 순회하며 매칭되는 모든 시너지 정보를 `synergies: [...]` 배열에 담아 반환합니다.
- `AugmentSynergyPreviewModal.js`는 `synergies.length > 1`일 때만 모달 좌측 하단(`닫기` 버튼 옆)에 시너지 전환 탭 버튼을 자동으로 렌더링합니다. 탭 노출 순서는 `AUGMENT_SYNERGY_MAP`의 키 선언 순서를 따릅니다.
- `src/calc/augmentRoll.js`의 `getForcedSynergyAugment`는 보유한 시너지 부품이 1종류(`uniqueOwnedIds.size === 1`)일 때 복수 시너지에 걸쳐 있더라도 각 시너지의 미보유 부품 합집합에서 70% 확률 보정을 정상 수행합니다.

### 2.3 팀 전체 적용 버프 / 팀 시너지 동기화 패턴
아군 전체에 영향을 주는 증강(예: `echoOfHero`, `mapleWarrior`, `millenniumShield`, `hyperBody`, `haste`, `sharpEyes`, `waterOmotics`, `giantSoldierOfStone`)을 추가할 때:
1. **단순 참조만 필요한 경우**: 계산처(`getStat.js`, `damageCalculate.js` 등)에서 `pokemon.hasAugmentOnTeam("augmentId", battle)`을 호출하면 본인 및 아군 벤치(`player`, `playerBench1`, `playerBench2` 또는 `npc` 팀) 전체를 자동 검사합니다.
2. **팀 내 중복 등장 방지**: `isEligible: (pokemon, battle, team) => !pokemon.hasAugmentOnTeam("augmentId", team || battle)`로 설정합니다.
3. **팀 단위 시너지(팀 내 1명만 활성화)**: `PokemonAugment.js`의 `checkAugmentSynergies` 내 `alreadyHas...OnTeam` 체크 및 `syncTeam...Buff` 동기화 함수를 연결합니다.

---

## 3. 🎨 증강 아이콘 규격 및 `AugmentIcon.js` 3대 렌더링 패턴

모든 증강 아이콘 이미지는 **`public/img/augment/{id}.png`**와 **`build/img/augment/{id}.png`** 두 경로에 모두 `256×256` PNG로 저장하며, `src/component/battleScreen/augment/AugmentIcon.js`에서 아래 3가지 패턴 중 하나로 렌더링합니다.

### 패턴 A: 시안 원형 테두리 + 원 바깥 돌출부 유지형 배지 (Protruding Badge PNG)
- **적용 대상**: 이미지 자체에 시안색(`#00f0ff`) 원형 링이 포함되어 있고, 검 끝·손잡이·어깨장식 등이 흰색 스티커 외곽선과 함께 원 바깥으로 튀어나온 아이콘 (`flamingKatana`, `aThousandBlazingSuns`, `sunfireCape`, `superheatedGladius`, `spiritVisage`, `sunfireAegis`, `warmogsArmor`, `giantAbsorption`, `bladeOfTheRuinedKing` 등).
- **이미지 전처리 (`sharp`)**:
  - 원 바깥의 어두운 배경과 우측 하단 워터마크(스파클)는 알파값 `0`(완전 투명)으로 제거하고, 시안색 원형 링과 원 바깥으로 돌출된 흰색 외곽선 오브젝트는 그대로 살려 `256×256` RGBA PNG로 저장합니다.
- **`AugmentIcon.js` 수정 (2곳)**:
  1. **Line ~1086 베이스 배경 원 제외 조건에 `id !== "{id}"` 추가**:
     ```jsx
     {/* 베이스 배경 원 */}
     {id !== "infinityEdge" && ... && id !== "{id}" && (
       <circle cx="32" cy="32" r="30" fill="url(#bgGlow)" stroke="url(#prismRing)" strokeWidth="1.5" strokeOpacity="0.7" />
     )}
     ```
  2. **클리핑(`lwClip`) 없이 `<image>` 단독 렌더링** (`x="-2" y="-2" width="68" height="68"`):
     ```jsx
     {/* 증강 한글명 */}
     {id === "{id}" && <image href="/pokemon/img/augment/{id}.png" x="-2" y="-2" width="68" height="68" />}
     ```

### 패턴 B: 사각 일러스트 + 원형 클리핑 & 컬러 링 테두리형 (Clipped Illustration PNG)
- **적용 대상**: 사각형 일러스트 이미지를 원형 배지 안에 꽉 차게 클리핑하고 SVG 컬러 링을 덧씌우는 아이콘 (`salamandra`, `sunBreathing`, `praiseTheSun`, `holyElfBlessing`, `waterOmotics`, `giantSoldierOfStone`, `millenniumShield`, `fatalStrike`, `focusOne` 등).
- **`AugmentIcon.js` 수정 (2곳)**:
  1. **Line ~1086 베이스 배경 원 제외 조건에 `id !== "{id}"` 추가**.
  2. **`clipPath="url(#lwClip)"` 그룹 내부에 배경 원 + `<image>` + 이중 컬러 링 렌더링**:
     ```jsx
     {/* 증강 한글명 (일러스트 이미지 + 원형 클리핑 & 컬러 링) */}
     {id === "{id}" && (
       <g clipPath="url(#lwClip)">
         <circle cx="32" cy="32" r="30" fill="#0f172a" />
         <image
           href="/pokemon/img/augment/{id}.png"
           xlinkHref="/pokemon/img/augment/{id}.png"
           x="-1"
           y="-1"
           width="66"
           height="66"
           preserveAspectRatio="xMidYMid slice"
         />
         {/* 테마 색상 링 (불꽃/공격: #ef4444 & #f87171 / 방어/시안: #38bdf8 & #bae6fd / 보라: #8b5cf6 & #c084fc) */}
         <circle cx="32" cy="32" r="29.5" fill="none" stroke="#ef4444" strokeWidth="1.8" />
         <circle cx="32" cy="32" r="28.2" fill="none" stroke="#f87171" strokeWidth="0.5" strokeOpacity="0.65" />
       </g>
     )}
     ```
  - **줌인/줌아웃 미세 조정**: 중심 `(32, 32)`를 유지하도록 `x = 32 - width / 2`, `y = 32 - height / 2` 공식으로 조정합니다.
    - 기본(`66×66`): `x="-1" y="-1" width="66" height="66"`
    - 약 15% 줌인(`76×76`): `x="-6" y="-6" width="76" height="76"`
    - 약 30% 줌인(`86×86`): `x="-11" y="-11" width="86" height="86"`

### 패턴 C: 기본 프리즘 배경 원 + 내부 아이템/순수 SVG 그래픽형
- **적용 대상**: 기본 제공되는 어두운 프리즘 원(`bgGlow` + `prismRing`) 위에 투명 배경 아이템 이미지나 순수 SVG 도형을 올리는 아이콘 (`eviolite`, `soulDew`, `metronome`, `threeSnails` 등).
- **`AugmentIcon.js` 수정 (1곳)**:
  - Line ~1086 제외 목록에 추가하지 **않고**(기본 원 유지), 내부 `<g>`만 추가합니다.

---

## 4. 💾 스택 / 누적 상태형 증강 라운드 승계(Carryover) 체크리스트

증강이 배틀 중 누적되는 수치(예: `mejaiStack`, `practiceCritStack`, `giantBonusHp`, `dragonKillCount`, `airmanRemainCount`)를 가지고 다음 라운드로 이월되어야 한다면 아래 4곳을 함께 수정합니다:

1. **`src/entity/Pokemon/PokemonInstance.js`**:
   - 생성자(`constructor`)에 초기 프로퍼티 명시적 선언 (예: `this.myStack = 0;`).
2. **`src/entity/Augment/AugmentData.js`**:
   - 해당 증강의 `onApply(pokemon, battle, options)`에서 `const val = Number(options?.myStack ?? pokemon?.myStack ?? this.myStack ?? 초기값)`으로 복원하여 `pokemon.myStack = val; this.myStack = val;`에 동기화.
   - `statusModalText` 또는 `getDesc`에서 현재 스택/남은 횟수를 동적으로 표시.
3. **`src/entity/Pokemon/Methods/PokemonAugment.js`**:
   - 시너지 버프인 경우 `checkAugmentSynergies` 내부에서 `augObj.myStack = Number(this.myStack || 초기값)` 및 `onApply` 호출 `options`에 전달.
   - `applyAugment` 내 기존 버프/시너지 재적용 분기 조건에 `options?.myStack !== undefined` 추가.
4. **`src/component/battleScreen/augment/AugmentCarryoverModal.js` & `src/store/battleStore.js`**:
   - 라운드 이동 시 직렬화 객체(`serializedCarried`)에 `myStack` 필드를 복사하여 `applyAugment` 옵션으로 전달.

---

## 5. ✅ AI 작업 완료 전 필수 자가 검증 체크리스트

1. **문법 및 빌드 오류 검사**:
   - 수정한 모든 `.js` 파일에 대해 `node --check <파일경로>`를 실행하여 문법 오류가 없는지 확인했는가?
2. **아이콘 파일 이중 저장 및 시각 검증**:
   - 신규/수정 아이콘을 `public/img/augment/{id}.png`와 `build/img/augment/{id}.png` 양쪽에 모두 저장했는가?
   - `read_file` 도구로 생성된 PNG 이미지를 직접 열어 배경 누끼, 우측 하단 워터마크 제거, 원 바깥 돌출부 보존 상태를 눈으로 확인했는가?
3. **스냅샷 타이밍 불변식 (Mutation Before Enqueue)**:
   - 데미지, 회복, 상태이상, 스택 변경 시 **반드시 포켓몬 상태값을 먼저 변경한 후 `enqueue(battle, text, ...)`를 호출**했는가?
4. **풀피 회복 메시지 스팸 방지**:
   - 턴 종료나 공격 시 자동 발동하는 회복 효과(`recover`) 호출 전에 `if (pokemon.hp < pokemon.maxHp)` 조건을 확인했는가?
5. **대타출동 및 기절 방어 조건**:
   - 상대에게 상태이상이나 추가 효과를 줄 때 `!def.faint && def.hp > 0` 및 대타출동(`isTargetSubstituteBlocked` 또는 `hitSub && !penetrates`) 여부를 확인했는가?
