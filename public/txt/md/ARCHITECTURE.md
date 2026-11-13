# 🤖 Pokemon Battle Simulator - AI 개발자용 코드베이스 아키텍처 레퍼런스 (`ARCHITECTURE.md`)

> **이 문서의 목적**: 생성형 AI 코딩 에이전트가 기능 추가·버그 수정·리팩토링 요청을 받았을 때, **전체 파일을 뒤지지 않고도 수정 대상 파일, 데이터 불변성 규칙, 수치 계산 파이프라인, 스냅샷 타이밍, 직렬화 지점**을 즉시 파악할 수 있도록 설계된 레퍼런스 문서입니다.

---

## 1. 🧭 작업별 수정 위치 빠른 라우팅 테이블 (Task-to-File Routing)

특정 기능을 수정하거나 추가할 때 반드시 함께 확인·수정해야 하는 파일 목록입니다.

| 작업 유형 | 필수 수정 / 확인 파일 | 핵심 체크포인트 |
| :--- | :--- | :--- |
| **신규 증강(Augment) 추가** | 1. `src/entity/Augment/AugmentData.js` (`AUGMENT_LIST`, 필요 시 `AUGMENT_SYNERGY_MAP`, `getAugmentText`, `getAugmentDesc`)<br>2. `src/component/battleScreen/augment/AugmentIcon.js` (아이콘 SVG 또는 PNG `<image>`, 배경 원 제외 조건 `L755`)<br>3. 효과 발동처 (`damageCalculate.js` / `speedCheck.js` / `hpCalculate.js` / `getStat.js` / `turnEnd.js` / `onHit.js` / `damage.js` 등) | - PNG 아이콘이고 자체 원형 테두리가 있으면 `AugmentIcon.js` 베이스 배경 원 조건(`id !== "..."`)에 추가할 것.<br>- 스택/상태를 가지는 증강이면 아래 **라운드 승계 4대 직렬화 지점** 필수 수정. |
| **스택/상태형 증강 승계 추가** | 1. `src/entity/Pokemon/PokemonInstance.js` (생성자 프로퍼티 초기화 & `applyAugment` 내 `isBuf` 재적용 조건)<br>2. `src/entity/Augment/AugmentData.js` (`onApply`에서 `options` 복원, `getDesc` 표기)<br>3. `src/component/battleScreen/augment/AugmentCarryoverModal.js` (`carriedMap` 직렬화)<br>4. `src/store/battleStore.js` (`effectiveCarriedMap` → `serializedCarried` → 초기 `applyAugment` 호출 옵션) | `navigate("/battle", { state })`는 함수를 복제할 수 없으므로(`DataCloneError`), plain 객체(`serializedCarried`)에 상태 필드를 명시적으로 복사해야 다음 라운드로 전달됨. |
| **최대 HP 관련 로직 수정** | `src/calc/hpCalculate.js` | `p.origin.hp`를 직접 수정하지 말고 `hpCalculate(pokemon)` 내부에 곱연산/합연산 규칙을 추가할 것. 배틀 내 최대 HP 조회는 모두 `hpCalculate(p)`를 통함. |
| **공격/특공 기초 스탯 증강** | `src/calc/getStat.js` (`getAugmentedStat`, `getHighestStatInfo`) | 합연산(`swordEnhance`, `mejaisSoulstealer`) → 곱연산(`lifePartner`, `rabadonsDeathcap`, `allOrNothing`) → 팀 버프(`echoOfHero`) 순서로 계산됨. |
| **스피드/우선도 계산 수정** | `src/calc/speedCheck.js` (`speedCalculate`, `priCalculate`, `skillSpeedCheck`, `speedCheck`) | 메가진화 예상 스피드는 `getExpectedMegaSpeed`에서 별도 가상 뷰(`megaPokemonView`)로 계산됨. |
| **데미지 공식/배율 수정** | `src/calc/damageCalculate.js` (공식), `src/service/damage.js` (실제 체력 차감/기띠/옹골참/탈/대타/처형) | `damageCalculate`는 순수 계산(로그 기록 포함)만 수행하고, 실제 HP 감소·기절·열매·처형은 `damage.js`(`attackDamage`)와 `PokemonGetDamage.js`에서 수행함. |
| **턴 종료 효과 추가/수정** | `src/service/turnEnd.js` | **주의**: `battle.resetBattleTurn()`은 반드시 `turnEnd.js` 맨 마지막 줄에서 호출되어야 함. |
| **기술(Skill) 추가/수정** | `src/entity/Skill/PokemonSkillList.js`, `src/entity/Skill/skillList/*.js`, `src/entity/Skill/SkillEffect.js`, `src/entity/Skill/SkillRequirement.js` | 공격 전 체크는 `src/service/skillCheck.js`, 명중 후 접촉 판정은 `src/service/onHit.js`, 부가효과는 `SkillEffect.js`에서 처리. |
| **특성(Ability) 추가/수정** | `src/entity/Ability.js` (`abilObject`, `noTraceAbil`, `noRandomAbil`, `changePokemonAbility`, `applyAbilityEffects`) | 등장 시 발동 특성은 `applyAbilityEffects`, 스킨류 특성은 `src/calc/skillTypeCalculate.js` & `damageCalculate.js` 연동. |
| **NPC AI 판단 로직 수정** | `src/npc/npc.js`, `src/npc/ai/easy.js` (`getKillableSkill`, `calculatePokemonSwitchScore`), `src/npc/ai/calculateSkillScore.js` | AI가 데미지를 시뮬레이션할 때는 `damageCalculate(..., { ai: true, randNum })`를 사용하여 `pokemon.log` 오염 및 일반 급소 변수를 배제함. |

---

## 2. 🧬 `PokemonInstance` 상태 계층 및 `p.origin` 변이 명세

런타임 포켓몬 객체(`src/entity/Pokemon/PokemonInstance.js`)는 상태의 수명(Lifecycle)에 따라 5개 계층으로 분리되어 있습니다.

### 2.1 상태 계층 요약

1. **`p.origin` (원본 기준 데이터)**
   - 샘플 템플릿(`SamplePokemon.js`)을 `cloneWithMethods`로 복제한 객체.
   - 기본 종족값/실수치(`origin.hp`, `origin.stat.{atk,def,catk,cdef,speed}`), 원본 타입(`origin.type1`, `origin.type2`), 원본 특성(`origin.abil`, `origin.abilObj`), 원본 아이템(`origin.item`), 기술 슬롯(`origin.skill[1~5]`), 메가진화 데이터(`origin.megaData`) 보유.
2. **`p` 최상위 프로퍼티 (배틀 내 영구/가변 상태)**
   - `p.hp` (현재 체력), `p.faint` (기절 여부), `p.type1` / `p.type2` (현재 타입 - 날개쉬기 등으로 임시 변경 가능), `p.item` (현재 아이템 - 탁쳐서떨구기/자뭉열매 소모 시 `null`), `p.abil` / `p.abilObj` (현재 특성 - 트레이스 등), `p.pp` (`{1,2,3,4,5}`), `p.isMega`, `p.augments` (보유 증강 배열).
   - 증강 누적 상태값: `p.dragonKillCount` (용용죽겠지), `p.mejaiStack` (메자이), `p.practiceCritStack` (연습이 치명타를 낳는다), `p.giantBonusHp` / `p._appliedGiantBonusHp` (거인의 흡수), `p._appliedLifePartnerHp` (인생의 동반자), `p.hasEchoOfHeroBuff` (영웅의 메아리).
3. **`p.ailment` (주요 상태이상 - 기절 시 `damage.js` 또는 치유 기술로만 초기화)**
   - `{ burn, freeze, poison, mpoison, mabi, sleep }` (교체해도 유지됨).
4. **`p.tempStatus` (교체 시 초기화되는 상태 - `src/service/switch.js`의 `switchPokemon`)**
   - `rank: { atk, def, catk, cdef, speed, critical }` (-6 ~ +6)
   - `confuse`, `onlySkill` (구애 고정 기술), `recentSkillUse`, `recentSkillGet`, `hapum` (하품), `noSound` (지옥찌르기), `protectUse` (방어 연속 횟수), `taunt` (도발), `protosynthesis`, `quarkDrive`, `seed` (씨뿌리기), `substitute` / `substituteHp` (대타출동), `flashFire` (타오르는불꽃), `switchLock` / `switchLockTurnRemain` (구속), `firstTurn` (속이기/만나자마자 판정용), `turnsOnField` (슬로스타트/패스트스타트 턴 카운트).
5. **`p.turn` (매 턴 종료 시 초기화되는 상태 - `Battle.resetBattleTurn()` in `src/entity/Battle.js`)**
   - `choice`, `fullDeath` (풀죽음), `jumpKickFail`, `roost` (날개쉬기), `critical`, `recentDamageGive`, `recentDamageGet`, `protect`, `useSkill`, `substitute` (이번 턴 대타 상태 여부), `lastHitSubstitute`, `knockedOutNpcThisTurn` (이번 턴 적 처치 여부), `damagedThisTurn` (워모그의 갑옷 피격 판정용).

---

### 2.2 `p.origin` 자체가 바뀌는 경우 (객체 참조 교체)

`p.origin` 참조 자체가 통째로 할당되거나 교체되는 경우는 전체 코드베이스에서 아래뿐입니다:

1. **인스턴스 최초 생성 (`new PokemonInstance` in `src/entity/Pokemon/PokemonInstance.js:24`)**
   - `this.origin = cloneWithMethods(pokemon);`
2. **증강에 의한 포켓몬 교체 (`replacePokemon` in `src/entity/Augment/AugmentData.js:1093-1120`)**
   - `newPoke = generate(...)` 생성 후 `Object.assign(pokemon, newPoke)`를 수행하여 기존 `pokemon` 인스턴스 참조는 유지한 채 `pokemon.origin`을 새 포켓몬의 `origin`으로 통째로 교체함 (`originalIndex`와 `team`은 유지).
   - 호출처:
     - `marriedPokemon` ("포켓몬과 결혼한 사람이 있었다" - `AugmentData.js:409`)
     - `rouletteWheel` ("돌려 돌려 돌림판" - `AugmentData.js:457`)
     - `soaring` ('"메가" 플라이곤' - `AugmentData.js:589`)
     - `legendaryTitan` ("전설의 거인" - `AugmentData.js:603`)
3. **(참조용 임시 뷰) 메가진화 예상 스피드 계산 (`getExpectedMegaSpeed` in `src/calc/speedCheck.js:126-129`)**
   - 원본을 수정하지 않고 `{ ...pokemon, origin: { ...pokemon.origin, stat: megaStat } }` 얕은 복사 뷰를 만들어 `speedCalculate`에 전달.
4. **(참고) 배틀 종료 후 상대 포켓몬 트레이드 (`submitTrade` in `src/store/battleStore.js:736-774`)**
   - `curBattle.player = newPoke` 형태로 슬롯의 `PokemonInstance` 자체를 교체함.

---

### 2.3 `p.origin` 내부의 값(`p.origin.xxx`)이 바뀌는 경우

`hpCalculate` 도입 이후 **`origin.hp`와 `origin.stat`은 일반 배틀/증강 중 직접 수정하지 않는 것이 원칙**이며, 실제로 `p.origin` 내부 프로퍼티가 수정되는 곳은 아래 7가지 경우로 제한됩니다:

1. **`PokemonInstance` 생성자 초기 설정 (`src/entity/Pokemon/PokemonInstance.js:25-102`)**
   - 커스텀 엔트리 옵션 반영:
     - `this.origin.item`, `this.origin.itemText` (`L26-27`)
     - `this.origin.abil`, `this.origin.abilObj` (`L30-33`)
     - `this.origin.skill[1~4]` (`L41`)
     - `this.origin.hp`, `this.origin.stat`, `this.origin.evs`, `this.origin.nature`, `this.origin.megaData` (`L53-65`)
   - NPC 난이도/라운드 스케일링 (`options.isNpc && options.difficulty !== "이지"`):
     - `multiplier = 1.0 + (options.round - 1) * 0.1`
     - 노말/하드 공통: `this.origin.hp = Math.floor(this.origin.hp * multiplier)` (`L69`)
     - 하드 전용: `this.origin.stat.{atk,def,catk,cdef,speed}`에 `multiplier` 곱적용 (`L70-76`)
   - 5번 기술 초기화:
     - `this.origin.skill[5]` = 발버둥 (`L90`)
     - *(참고: 스킨류 특성 타입 변환은 `origin.skill`을 변경하지 않고 `src/calc/skillTypeCalculate.js`에서 동적 계산)*
2. **메가진화 실행 (`PokemonMega.megaEvolve` in `src/entity/Pokemon/Methods/PokemonMega.js:36-50`)**
   - `this.origin.type1`, `this.origin.type2`, `this.origin.pokemon_id` (`L36-38`)
   - `this.origin.stat.{atk,def,catk,cdef,speed}` = 메가진화 스탯 (`L41-45`, 체력은 불변)
   - `this.origin.abil`, `this.origin.abilObj` = 메가진화 특성 (`L49-50`)
3. **무한 다이맥스 증강 (`applyEternamax` in `src/entity/Augment/AugmentData.js:998-1060`)**
   - 무한다이노가 `eternamax` 증강 적용 시 종족값(255/115/250/125/250/130) 기반으로 재계산:
     - `origin.hp = newMaxHp` (`L1030`, 기존 체력 비율 유지 계산 시 `hpCalculate(pokemon)`과 연동)
     - `origin.stat = { ...origin.stat, ...newStats }` (`L1050`)
     - `origin.pokemon_id = "0890-m"`, `origin.baseStats = baseStats` (`L1056-1058`)
4. **증강을 통한 특성 영구 변경 (`changePokemonAbility` in `src/entity/Ability.js:207-220`)**
   - `pokemon.abil`뿐만 아니라 `pokemon.origin.abil = abilityName`, `pokemon.origin.abilObj = baseObj`까지 함께 변경.
   - 호출 증강: `hugePower`(천하장사), `fastStarter`(패스트스타트), `randomAbility`(특성 야바위).
   - *(주의: 배틀 중 `트레이스` 특성은 `atk.abil`만 바꾸며 `origin.abil`은 변경하지 않음)*
5. **증강을 통한 기술 슬롯 변경/강화 (`src/entity/Augment/AugmentData.js`)**
   - 모든 기술 실행(`skillUse.js`, `damageCalculate.js`)과 UI가 `pokemon.origin.skill[slot]`을 참조하므로 아래 증강들은 `pokemon.origin.skill[slot]`을 새 객체로 교체함:
     - `teraBlast` (테라버스트 교체 - `L522`)
     - `nameIsSalamence` (보만다 지진 교체 - `L544`)
     - `danceOfGarchomp` (한카리아스 용의춤 교체 - `L562`)
     - `nimbleMoves` (민첩한 몸놀림: `prior: currentPrior + 1`, `nimbleMoves: true` 부여 - `L637`)
6. **테스트 모드 NPC 즉시 전멸 버튼 (`handleTestSkipNpc` in `src/store/battleStore.js:776-798`)**
   - *(참고: 따라큐 '탈' 특성 소모는 `origin.abil`을 변경하지 않고 `defPokemon.abilObj.used = true`로 관리하며, 상세 정보 UI(`Bottom-Info.js`)에서 `abilObj.used`가 `true`일 때만 `(사용됨)`을 붙여 렌더링함)*
   - `curBattle[key].origin.hp = 0; curBattle[key].origin.faint = true;`

---

## 3. 🧮 4대 수치 계산 파이프라인 (Stat & Damage Pipelines)

능력치나 체력을 참조할 때는 `pokemon.origin`을 직접 읽지 말고 아래 전용 계산 함수를 사용해야 증강 효과가 누락되지 않습니다.

### 3.1 최대 HP 계산: `hpCalculate(pokemon, baseHp = null)` (`src/calc/hpCalculate.js`)
- **역할**: `pokemon.origin.hp`는 원본으로 보존한 채, 증강 효과가 반영된 **실제 최대 HP**를 반환하고 `pokemon.log.hpCalculate`에 수식을 기록.
- **계산 순서**:
  1. 기준값: `baseHp ?? pokemon.origin?.hp ?? pokemon.hp ?? 0`
  2. **곱적용 증강**: `lifePartner` (인생의 동반자) → `hp = Math.round(hp * 1.1)`
  3. **합적용 증강**: `giantAbsorption` (거인의 흡수) → `hp += Number(pokemon.giantBonusHp ?? aug?.giantBonusHp ?? 0)`
- **필수 규칙**: 회복량(`PokemonRecover.js`, `leftOver`, `warmogsArmor`, `SkillEffect.js` 등), 최대체력 비례 피해(`Weather.js`, `field.js`, `onHit.js`, `turnEnd.js`, `sunfireAegis`, `giantAbsorption`), 풀피 판정(`멀티스케일`, `질풍날개`, `옹골참`, `기합의띠`), 처형(`collector`), UI 체력바(`PokemonInfo.js`, `BenchPokemon.js`, `Bottom-Info.js`) 등 **모든 최대 HP 참조처는 반드시 `hpCalculate(pokemon)`을 사용**해야 함.

### 3.2 기초 스탯 증강 계산: `getAugmentedStat(pokemon, statKey, battle = null)` (`src/calc/getStat.js`)
- **역할**: `origin.stat[statKey]`를 기준으로 상시 적용되는 스탯 증강을 계산하고 `pokemon.log.getAugmentedStat`에 기록.
- **계산 순서** (`atk`, `catk` 대상):
  1. **합적용**:
     - `swordEnhance` (검 강화하기): `atk`, `catk`에 `+bonusAtk`
     - `mejaisSoulstealer` (메자이의 영혼약탈자): `catk`에 `+(mejaiStack * 20)`
  2. **곱적용**:
     - `lifePartner` (인생의 동반자): `Math.round(val * 1.1)`
     - `rabadonsDeathcap` (라바돈의 죽음모자): `catk` `Math.round(val * 1.3)`
     - `allOrNothing` (모 아니면 도): 선택된 스탯 `* 2`, 반대 스탯 `Math.max(1, Math.floor(val / 2))`
  3. **팀 시너지 버프**:
     - `echoOfHero` (영웅의 메아리): 본인 또는 같은 팀(`battle`) 내 보유자 존재 시 `atk`, `catk` `Math.round(val * 1.4)`
- **보조 함수**: `getHighestStatInfo(pokemon, battle)` — 5개 스탯(`atk`, `def`, `catk`, `cdef`, `speed`) 중 `getAugmentedStat * getMultiplier(rank)`가 가장 높은 스탯 정보를 반환 (`hhgghgg` 등에서 사용).

### 3.3 스피드 계산: `speedCalculate(pokemon, baseSpeed, battle, abil, rankOverride)` (`src/calc/speedCheck.js`)
- **계산 순서**:
  1. 기초 스피드: `hhgghgg` 보유 시 `getHighestStatInfo`의 최댓값 스탯/랭크 사용, 아니면 `getAugmentedStat(pokemon, "speed", battle)`.
  2. 랭크 배율(`getMultiplier(rank)`), 마비(`* 0.5`), 구애스카프(`* 1.5`), 고대활성/쿼크차지(`* 1.5`), 곡예(`* 2`), 순풍(`* 2`), 쓱쓱(`* 2`), 패스트스타트 5턴 후(`* 2`), 슬로스타트 5턴 미만(`* 0.5`).
  3. 증강 배율: `dragonHunter` (상대가 드래곤일 때 `* 1.5`), `dragonDie` (`1 + Math.floor(dragonKillCount / 2) * 0.1`), `lifePartner` (`* 1.1`), `lastWarrior` (혼자 남았을 때 `* 1.6`).

### 3.4 데미지 계산: `damageCalculate(battle, skillNumber, options)` (`src/calc/damageCalculate.js`)
- **주요 스탯 치환 증강 처리**:
  - `hhgghgg`: 공격/방어 모두 가장 높은 실효 스탯으로 치환.
  - `swordAndShield` (오른손엔 방패 왼손엔 검): 물리 공격/방어 시 `atk`와 `def` 중 유리한 쪽 사용.
  - `specialSwordAndShield` (오른손엔 방패 왼손엔 스태프): 특수 공격/방어 시 `catk`와 `cdef` 중 유리한 쪽 사용.
  - `ksante` (그 긴거): 수비 시 `def`와 `cdef` 중 유리한 쪽 사용.
- **주요 증강 데미지 보정**:
  - `voidStaff` (공허의 지팡이): 특수 공격 시 상대 `cdef * 0.6` + 단일 고스트 무효 관통(`typeEffectCalculate.js`).
  - `dragonHunter`, `dragonDie`, `lifePartner`, `lastSamurai` (혼자 남았을 때 공격/특공 `* 1.6`), `lastManStanding` (혼자 남았을 때 방어/특방 `* 1.6`).
  - `infinityEdge` (무한의 대검: 급소 확률 +50%, 급소 데미지 증가), `practiceMakesCritical` (스택당 급소 확률 +1%), `bladeOfTheRuinedKing` (적 현재 체력 15% 추가 피해), `highRiskBuff` (`* 3`), `highRiskCurse` (`* 0.5`).
- **고정 추가 피해 후처리 (`src/service/damage.js` 내 `attackDamage`)**:
  - `threeSnails` (달팽이 세마리), `wujuStyle` (우주류 검술), `ludensEcho` (루덴의 메아리), `collector` (징수의 총: 피격 후 남은 체력이 `hpCalculate(defPokemon) * 0.05` 이하이면 즉시 처형).

---

## 4. 🔄 스냅샷 큐(Snapshot Queue) 아키텍처 및 타이밍 규칙

### 4.1 작동 원리 (`src/store/useQueue.js`, `src/util/cloneWithMethods.js`)
- 본 게임은 1턴의 모든 연산을 동기 함수(`battleStart` → `attack`/`switch` → `turnEnd`)에서 한 번에 실행하면서, 연출 단계마다 `enqueue({ battle, text, ... })`를 호출해 스냅샷을 큐(`Recoil queueState`)에 쌓습니다.
- `enqueue` 내부에서 `cloneWithMethods(item.battle)`가 호출되어 **호출 시점의 `battle` 상태가 프로토타입 메서드와 함께 깊은 복사**됩니다.
- 이후 유저가 클릭하거나 자동 진행될 때 `dequeue()`가 스냅샷을 하나씩 꺼내 `setBattle(snapshot.battle)`로 화면을 갱신합니다.

### 4.2 ⚠️ 핵심 불변식: 스냅샷 상태 변이 타이밍 (Mutation Timing Invariant)
- **`enqueue` 호출 시점의 `battle` 상태가 그대로 화면에 찍힙니다.**
- 따라서 어떤 효과로 인해 포켓몬의 상태(`hp`, `giantBonusHp`, `rank`, `ailment`, `augments` 등)가 변하고 그에 대한 안내 텍스트가 출력되어야 한다면:
  - **반드시 상태 변경을 먼저 수행한 뒤 `enqueue`(또는 내부에서 `enqueue`를 부르는 `getDamage` / `recover`)를 호출**해야 해당 텍스트가 화면에 뜰 때 변경된 수치(예: 늘어난 최대 HP, 깎인 체력)가 즉시 반영됩니다.
  - 반대로 "반응했다!"처럼 변화 **전** 모습을 보여줘야 하는 연출(예: 메가진화 전 스톤 반응 텍스트)은 상태 변경 **전**에 `enqueue`하고, 상태 변경 **후**에 완료 텍스트를 `enqueue`합니다.

---

## 5. ✨ 증강(Mayhem Augment) 및 시너지 아키텍처

### 5.1 증강 분류 (`src/entity/Augment/AugmentData.js`)
1. **일반 증강**: `cost`가 숫자(`0, 1, 3, 5, 7, 10, 16`)이고 `buf`가 아닌 증강. 포켓몬당 최대 **3개**까지 장착 가능 (`pokemon.augments.filter(a => !a.buf).length < 3`).
2. **즉발형 증강 (`isInstant`)**: `cost === "-"` 이거나 포켓몬 교체형(`legendaryTitan`, `rouletteWheel`, `soaring`, `marriedPokemon`). 효과가 즉시 발동하며 `pokemon.augments` 배열에 누적되지 않아 슬롯을 차지하지 않음.
3. **버프 / 시너지 / 저주 증강 (`buf: true`)**:
   - 슬롯 3개 제한에 포함되지 않으며, 랜덤 증강 풀(`isRandom: false`)에서 직접 등장하지 않음.
   - 라운드 종료 후 증강 승계 모달(`AugmentCarryoverModal`)에서 선택 개수 제한과 무관하게 **무조건 다음 라운드로 자동 승계**됨.

### 5.2 3개 증강 공명 시너지 (`AUGMENT_SYNERGY_MAP` in `AugmentData.js:980-988`)
한 포켓몬이 특정 3개의 조건 증강을 모두 보유하면 즉시 공명 버프 증강(`buf: true`)을 자동 획득합니다:
- `echoOfHero` (영웅의 메아리): `["threeSnails", "nimbleMoves", "recovery"]`
- `dragonDie` (용용 죽겠지): `["dragonSlayer", "dragonHunter", "dragonKiller"]`
- `wujuStyle` (우주류 검술): `["lastManStanding", "lastSamurai", "lastWarrior"]`
- `mejaisSoulstealer` (메자이의 영혼약탈자): `["rabadonsDeathcap", "voidStaff", "ludensEcho"]`
- `practiceMakesCritical` (연습이 치명타를 낳는다): `["infinityEdge", "bladeOfTheRuinedKing", "collector"]`
- `gamblingAddict` (도박 중독): `["lifeIsOneShot", "allOrNothing", "randomAbility"]` (획득 시 즉발 도박 증강 `russianRoulette`, `oddEven`, `doOrDie`, `highRiskHighReturn` 등장 해금)
- `giantAbsorption` (거인의 흡수): `["thornmail", "warmogsArmor", "sunfireAegis"]`

### 5.3 포켓몬 슬롯 식별자: `originalIndex`
- 배틀 중 포켓몬을 교체하면 `battle.player`, `battle.playerBench1`, `battle.playerBench2` 슬롯의 포켓몬 위치가 서로 바뀝니다.
- 따라서 엔트리 초기 순서(0, 1, 2번 포켓몬)와 매핑해야 하는 로직(증강 모달, 라운드 승계, 트레이드, 팀 내 자기 자신 제외 판정)은 **반드시 `pokemon.originalIndex`** (`Battle.js` 초기화 시 0, 1, 2로 부여됨)를 기준으로 식별해야 합니다.

---

## 6. ⚔️ 배틀 턴 라이프사이클 상세 파이프라인

### 6.1 턴 개시 및 행동 순서 (`src/service/battleStart.js`)
1. 플레이어/NPC 메가진화 예약 시 메가진화 우선 실행 (`megaEvolve`).
2. **양측 교체**: `speedCheck` 순서대로 `switchPlayer` / `switchNpc` 실행 → `turnEnd`.
3. **한쪽만 교체**: 교체 측 먼저 실행 → 공격 측 `skillUsePlayer` / `skillUseNpc` 실행 → `turnEnd`.
4. **양측 공격**: `skillSpeedCheck`로 우선도(`priCalculate`) 및 스피드(`speedCalculate`), 트릭룸 여부를 판정하여 선공자 공격 → 생존 시 후공자 공격 → `turnEnd`.

### 6.2 공격 1회 실행 파이프라인 (`src/service/skillUse.js`)
1. `beforeSkillCheck` (`src/service/skillCheck.js`): 잠듦, 얼음, 마비, 풀죽음, 혼란 자해, 도발, 반동휴식, 사슬묶기/앙코르 등 행동 가능 여부 판정.
2. PP 차감 및 구애류(`onlySkill`) 고정, 연속기/충전기 체크.
3. `afterSkillCheck` (`src/service/skillCheck.js`): 기습 조건, 방어/니들가드(`spikyShield`), 타입 상성 무효, 명중률(`accuracyCalculate.js`) 판정.
4. `damageCalculate` (`src/calc/damageCalculate.js`): 데미지 산출.
5. `attackDamage` (`src/service/damage.js`): 대타출동, 따라큐 탈, 기합의띠/옹골참 처리, 실 체력 차감(`getDamage`), 추가 고정 데미지 증강, 징수의 총(`collector`) 처형, 기절 처리(`handleFaint` - 메자이/용용죽겠지/적 처치 증강 플래그 갱신).
6. `onHit` (`src/service/onHit.js`): 접촉기 피격 특성(까칠한피부/철가시, 정전기, 불꽃몸), 울퉁불퉁멧, 증강 가시갑옷(`thornmail` - 비접촉 포함).
7. `applySkillEffects` & `applyAfterSkillEffects` (`src/service/skillUse.js` → `src/entity/Skill/SkillEffect.js`): 랭크 변화, 상태이상 부여, 장판 설치, 반동/흡수/자폭/빗나감패널티, 유턴(`battle.turn.uturn = true`).

### 6.3 턴 종료 파이프라인 (`src/service/turnEnd.js`)
1. 필드/날씨/지형/트릭룸/벽/순풍 턴 카운트 감소 및 종료 처리.
2. 희망사항(`wish`) 회복, 그래스필드 회복, 먹다남은음식/검은진흙/회복 증강(`leftOver`) 처리.
3. **[증강] 워모그의 갑옷 (`applyWarmogsArmor`)**: 매 턴 최대 HP(`hpCalculate`)의 3% 회복(이번 턴 무피격 `!p.turn.damagedThisTurn` 시 6% 회복).
4. 구속/씨뿌리기/사슬묶기/도발/하품/역린(`processSkillEffects` in `turnEnd.js`).
5. 상태이상 데미지(`processAilment` in `turnEnd.js`: 독, 맹독, 화상 + 할머니의 고추기름 증강).
6. 날씨 데미지(모래바람).
7. **[증강] 태양불꽃방패 (`applySunfireAegis`)**: 내 최대 HP(`hpCalculate`)의 10%만큼 상대에게 데미지.
8. **[증강] 거인의 흡수 (`applyGiantAbsorption`)**: 내 최대 HP(`hpCalculate`)의 1%만큼 상대에게 데미지를 주고 해당 수치(`Math.min(opponent.hp, damage)`)만큼 `giantBonusHp` 증가 (체력 회복 없음).
9. `turnsOnField` 증가(슬로스타트/패스트스타트), 날개쉬기 타입 복구, `firstTurn = false`, 가속 특성 스피드 +1랭크.
10. NPC 단독 기절 시 `switchNpcAuto` 실행.
11. 대난투(`battle.isMayhem`) 적 처치 증강 큐(`isKnockoutAugment: true`) 등록.
12. 플레이어 기절 시 `mustSwitch` 큐 등록, 아니면 `"무엇을 할까?"` 큐 등록.
13. **`battle.resetBattleTurn()` 호출 (반드시 맨 마지막)**.

---

## 7. 📏 프로젝트 코딩 및 테스트 컨벤션 (`GEMINI.md`)

1. **테스트 파일 최상단 주석 필수**:
   - 모든 `src/test/**/*.test.js` 파일의 첫 줄에는 실행 명령어를 주석으로 명시해야 합니다.
   - 예: `// npm test -- src/test/ai/killableSkill.test.js`
2. **기존 주석 보존**:
   - 코드를 수정할 때 수정 범위와 무관한 기존 주석 및 도메인 설명 주석을 임의로 삭제하지 않습니다.
3. **정적 검증**:
   - 파일 수정 후 `npx eslint <수정한 파일 경로>`를 실행하여 문법 및 import 오류(`0 errors`)를 확인합니다.

---

## 8. 📁 디렉토리 책임 분리 기준 (Store / Service / Calc / Util)

| 폴더 | 책임 범위 | 주요 기준 | 소속 파일 예시 |
| :--- | :--- | :--- | :--- |
| **`src/store/`** | 전역 상태 관리 & 화면 흐름 조율 | React UI가 구독하는 상태(`useBattleStore`, `recoilState`)와 연출 큐 훅(`useQueue`) | `createStore.js`, `battleStore.js`, `recoilState.js`, `useQueue.js` |
| **`src/service/`** | 배틀 유즈케이스 실행 & 상태 변이 | `battle` / `pokemon` 상태를 변경하거나 `enqueue` 연출을 발생시키는 배틀 진행 로직 | `battleStart.js`, `skillUse.js`, `skillCheck.js`, `onHit.js`, `switch.js`, `damage.js`, `ailment.js`, `field.js`, `turnEnd.js` |
| **`src/calc/`** | 도메인 순수 계산·판정·조합 | 상태를 직접 바꾸지 않고(또는 로그만 기록하고) 수치·타입·상성·명중·팀/증강 후보를 계산·반환 | `damageCalculate.js`, `hpCalculate.js`, `skillTypeCalculate.js`, `typeEffectCalculate.js`, `accuracyCalculate.js`, `speedCheck.js`, `getStat.js`, `rankStat.js`, `shadowTag.js`, `augmentRoll.js`, `randomTeam.js`, `customEntryUtil.js` |
| **`src/util/`** | 도메인 무관 범용 헬퍼 | 포켓몬/배틀 도메인 지식 없이 어느 프로젝트에서도 쓰일 수 있는 순수 기술 유틸리티 | `cloneWithMethods.js`, `randomCheck.js`, `consoleLog.js` |
