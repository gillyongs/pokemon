# pkmnchamps 기반 기술 목록(core / others) 추출 및 갱신 가이드

이 문서는 `https://pkmnchamps.com`의 도감(`/pokedex/{id}`) 및 실전 배틀 통계(`/stats/{id}`) 데이터를 기반으로, 신규/기존 포켓몬의 주력 기술(`core`)과 배울 수 있는 기술(`others`)을 추출하고 프로젝트의 `src/skill/PokemonSkillList.js`에 적용하는 전체 로직과 워크플로우를 정리한 문서입니다.

---

## 1. 개요 및 데이터 구조

프로젝트의 `PokemonSkillList.js`는 각 포켓몬(도감 번호 또는 ID)별로 기술을 2가지 그룹으로 나누어 관리합니다.

```javascript
export const POKEMON_SKILLS = {
  "0038-a": {
    // 1. 주력 기술 (Core): 실전 배틀 통계에서 채용률 10% 이상인 기술 목록
    core: ["오로라베일", "프리즈드라이", "앙코르", "눈보라", "문포스", "미스트필드"],
    
    // 2. 그 외 기술 (Others): 공식 배울 수 있는 기술 목록 중 core를 제외한 나머지 기술 목록
    others: ["고속이동", "아쿠아테일", "헤롱헤롱", ...],
  },
};
```

---

## 2. pkmnchamps 사이트 분석 및 데이터 소스

pkmnchamps는 Next.js (App Router) 기반의 웹 애플리케이션으로, 도감 상세 페이지와 랭크 배틀 통계 페이지에서 각각 데이터를 제공합니다.

> [!NOTE]
> **사용자가 기술 목록을 직접 제공하는 경우**:
> 사용자가 프롬프트에서 주력 기술(10%+) 및 전체 배울 수 있는 기술 목록을 직접 제공한 경우, pkmnchamps 사이트를 별도로 조회하거나 참고하지 않고 사용자가 전달한 목록을 기반으로 기술명 표준 통일 규칙만 적용하여 즉시 등록합니다.

### A. 배울 수 있는 기술 (Learnable Moves)
- **출처 URL**: `https://pkmnchamps.com/pokedex/{id}` (리전폼의 경우 `?form={form-slug}`)
- **데이터 위치**:
  - 클라이언트 정적 번들 청크(`static/chunks/app/[locale]/pokedex/[id]/page-*.js` 및 관련 공통 청크)
  - 9세대 전국 도감 및 폼체인지별 습득 기술 slug 배열(`["fake-out", "close-combat", ...]`)
  - 전체 기술 영문 slug ↔ 한국어 번역 맵 매핑 (`pkmn_moves_map.json`)

### B. 주력 기술 (Core Moves / Top Moves)
- **출처 URL**: `https://pkmnchamps.com/stats/{id}`
- **통계 API**:
  ```http
  GET https://pkmnchamps.com/api/champions-data?action=stat&pokemon_id={id}&month={YYYY-MM}&regulation={regulation}&format=singles&mega={megaSlug}&region={regionSlug}
  ```
- **규정(Regulation) 및 환경 우선순위**:
  1. **최신 싱글 랭크배틀 규정** (Reg H/G/F/D 등 최신 레귤레이션)
  2. **메가진화/과거 세대 포켓몬**: Showdown National Dex / Mega Tier 통계 (`regulation=showdown-1760-regulation_ma` 등)
- **기준**: `usage >= 10.0%` (채용률 10% 이상)인 기술들을 주력 기술(`core`)로 선정

---

## 3. 핵심 기술명 표준 통일 규칙 (★필수 준수)

프로젝트 코드베이스(`src/entity/Skill/skillList/`, `src/skill/PokemonSkillList.js`, `SamplePokemon.js` 등) 전반에서 기술명을 사용할 때는 **반드시 아래 표준 명칭**으로 일관되게 사용해야 합니다.

| 표준 기술명 (사용 O) | 구 명칭 / 오표기 (사용 X) | 비고 |
| :--- | :--- | :--- |
| **`깨트리기`** | `깨트리다`, `깨뜨리다`, `깨뜨리기` | 격투 물리 기술 (벽부수기 효과) |
| **`섀도클로`** | `섀도크루` | 고스트 물리 기술 (급소율 +1) |
| **`블라스트번`** | `블래스트번` | 불꽃 특수 궁극기 (반동휴식) |
| **`파워휩`** | `파워윕` | 풀 물리 기술 |
| **`얼어붙은바람`** | `얼다바람` | 얼음 특수 기술 (스피드 -1) |
| **`앙코르`** | `앵콜` | 노말 변화기 (미구현 기술) |
| **`배턴터치`** | `바통터치` | 노말 변화기 (미구현 기술) |
| **`뛰어오르기`** | `뛰어오르다` | 비행 물리 2턴 기술 (미구현 기술) |
| **`셸블레이드`** | `쉘블레이드` | 물 물리 기술 (방어 -1) |
| **`치유소원`** | `치유의소원` | 에스퍼 변화기 (기절 후 교체 포켓몬 회복) |

> [!IMPORTANT]
> **기술 목록 추출 또는 신규 작성 시 유의사항**
> pkmnchamps 및 공식 포켓몬 명칭은 위 표준 목록과 100% 동일합니다.
> 앞으로 어떠한 스크립트 작성, 포켓몬 등록, 스킬 목록 갱신 시에도 반드시 **위 표의 [표준 기술명]**을 사용해야 합니다.

---

## 4. 추출 및 매핑 워크플로우

1. **대상 포켓몬 식별 (도감번호/폼)**
2. **pkmnchamps 도감에서 공식 습득 기술(Learnset) 추출**
3. **pkmnchamps 통계(Stats)에서 기술별 채용률(Usage) 추출**
4. **영문 move slug를 한국어 명칭으로 매핑**
5. **채용률 10% 이상 기술 필터링 -> `core` 배열 생성**
6. **표준 명칭 통일성 확인 (3절 규칙 확인)**
7. **공식 습득 기술 중 `core`를 제외한 기술 -> `others` 배열 생성**
8. **PokemonSkillList.js에 POKEMON_SKILLS 및 ALIASES 갱신**

---

## 5. 실제 구현 스크립트 예시 (Node.js)

```javascript
const fs = require("fs");

// 1. 번역 맵 및 도감/통계 JSON 로드
const movesMap = JSON.parse(fs.readFileSync("scratch/pkmn_moves_map.json", "utf8"));
const pokedexAll = JSON.parse(fs.readFileSync("scratch/pkmnchamps_pokedex_all.json", "utf8"));
const statsList = JSON.parse(fs.readFileSync("scratch/list_reg_mc.json", "utf8")); // 또는 MA/MB

// 2. 표준 명칭 보정 함수 (혹시 구 명칭 데이터가 들어올 경우 방어용)
const STANDARDIZE_MAP = {
  "깨트리다": "깨트리기",
  "깨뜨리다": "깨트리기",
  "깨뜨리기": "깨트리기",
  "섀도크루": "섀도클로",
  "블래스트번": "블라스트번",
  "파워윕": "파워휩",
  "얼다바람": "얼어붙은바람",
  "앵콜": "앙코르",
  "바통터치": "배턴터치",
  "뛰어오르다": "뛰어오르기",
  "쉘블레이드": "셸블레이드",
  "치유의소원": "치유소원",
};

function toStandardName(name) {
  return STANDARDIZE_MAP[name] || name;
}

// 3. 포켓몬 기술 데이터 빌드 함수
function buildPokemonSkills(pokemonId, regionForm = "") {
  // A. 공식 습득 기술 가져오기
  let movesSlugs = [];
  if (regionForm) {
    const regionEntry = (pokedexAll.regionalDict[String(pokemonId)] || []).find(x => x.name === regionForm);
    movesSlugs = regionEntry ? regionEntry.moves : [];
  } else {
    const baseEntry = pokedexAll.allPokemon.find(p => p.id === pokemonId);
    movesSlugs = baseEntry ? baseEntry.moves : [];
  }
  const learnableMoves = movesSlugs.map(slug => toStandardName(movesMap[slug] || slug));

  // B. 통계 데이터에서 10% 이상 주력 기술(core) 추출
  const statRow = statsList.find(p => p.pokemon_id === pokemonId && (regionForm ? p.region_form === regionForm : (!p.region_form || p.region_form === "")));
  const coreMoves = [];
  if (statRow && statRow.moves) {
    for (const m of statRow.moves) {
      if (m.usage >= 10.0) {
        const name = toStandardName(movesMap[m.name] || m.name);
        if (!coreMoves.includes(name)) coreMoves.push(name);
      }
    }
  }

  // C. 그 외 기술(others) 필터링
  const coreSet = new Set(coreMoves);
  const otherMoves = learnableMoves.filter(name => !coreSet.has(name));

  return {
    core: coreMoves,
    others: otherMoves,
  };
}
```

---

## 6. PokemonSkillList.js 및 시스템 연동

생성된 데이터는 `src/skill/PokemonSkillList.js`에 다음과 같이 등록됩니다.

1. **`POKEMON_SKILLS`에 등록**:
   - 일반형 키 (예: `"0428"`, `"0768"`)
   - 폼체인지/메가진화 키 (예: `"0428-m"`, `"0768-m"`, `"0038-a"`)
2. **`POKEMON_SKILL_ALIASES`에 한글 이름 매핑 등록**:
   ```javascript
   export const POKEMON_SKILL_ALIASES = {
     // ...
     이어롭: "0428",
     메가이어롭: "0428-m",
     갑주무사: "0768",
     메가갑주무사: "0768-m",
     나인테일: "0038-a",
     알로라나인테일: "0038-a",
   };
   ```
3. **UI 및 엔진 동작**:
   - `getSkillListForPokemon("메가이어롭")` 호출 시 별칭을 통해 `"0428-m"` 데이터가 조회됩니다.
   - `core` 배열에 있는 기술들은 기술 선택 모달(`src/component/customScreen/sampleInfo/SkillSearchModal.js`)에서 `★ 주력` 뱃지가 부착되며, **[주력 기술 ON]** 필터 토글 시 최우선 노출됩니다.
