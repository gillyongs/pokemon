# 포켓몬 스프라이트 규격화 및 위치/크기 조정 가이드 (`POKEMON_IMG_GUIDE.md`)

본 문서는 사용자가 제공한 포켓몬 이미지(PNG/WebP/JPG 등)를 **게임 배틀 화면 표준 규격(`256×256 WebP`)에 맞춰 등록**하고, 사용자의 피드백(**크기 축소/확대, 상/하/좌/우 위치 치우침**)에 따라 이미지를 정밀 조정하는 표준 실행 절차를 정리한 지침서입니다.

---

## 0. 핵심 작업 원칙

1. **복잡한 업스케일링 및 누끼 추출 작업 배제**:
   - AI가 자체적으로 고난도 프롬프트 기반 업스케일링을 하거나 복잡한 배경 누끼 따기를 수행하지 않습니다.
   - 사용자가 제공한 이미지를 바탕으로 **규격화(리사이징, 패딩, 256×256 캔버스 합성, WebP 변환)**에 집중합니다.
2. **단일 표준 규격 준수**:
   - **해상도**: `256 × 256` 픽셀
   - **포맷**: 무손실 투명 WebP (`.webp`, 알파 채널 보존, `lossless: true` 또는 `quality: 95`)
   - **저장 위치**: `public/img/pokemon/{id}.webp` (예: `0970.webp`, `0970-m.webp`)
3. **사용자 피드백 즉각 대응**:
   - 적용 후 사용자가 **"크기를 줄여/키워달라"**거나 **"위/아래/왼쪽/오른쪽으로 치우쳐 있다"**고 지시할 때, 본 가이드의 위치/크기 조정 스크립트를 사용하여 즉시 수치를 조정한 뒤 교체 적용합니다.

---

## 1. 기본 규격 및 기본 배치 규칙

### 1-1. 캐릭터 크기 기준
- 256×256 캔버스 안에서 포켓몬 본체가 너무 꽉 차거나 잘리지 않도록 **가로/세로 최대 210~230px 이내**로 비율을 유지하여 축소합니다.
  - 보통 체형 포켓몬: 최대 폭/높이 `220px` 안팎
  - 가로로 넓은 포켓몬 (예: 멜메탈, 강철톤): 가로 최대 `235px`
  - 세로로 긴 포켓몬 (예: 아고용, 페로코체): 세로 최대 `228px`

### 1-2. 기본 정렬 (세로 타입)
- **접지형 포켓몬 (기본값)**: 바닥에 발을 딛고 서 있는 대다수의 포켓몬
  - 가로: 완전 중앙 정렬 (`leftPad = Math.round((256 - width) / 2)`)
  - 세로: 바닥에서 2px 띄움 (`bottomPad = 2`, `topPad = 256 - height - 2`)
- **부유형 포켓몬**: 공중에 떠 있거나 날아다니는 포켓몬 (비행 타입, 종이신도, 레지에레키 등)
  - 가로: 완전 중앙 정렬
  - 세로: 상/하 중앙 정렬 (`topPad = Math.round((256 - height) / 2)`)

---

## 2. 신규 이미지 기본 적용 절차

사용자가 새로운 이미지를 제공했을 때, Node.js의 `sharp` 라이브러리를 사용하여 규격화하고 프로젝트에 적용합니다.

### 실행 방법 (Node.js 인라인 또는 일회성 스크립트)

```javascript
// scripts/apply_pokemon_sprite.js (또는 node -e 실행)
const sharp = require('sharp');
const fs = require('fs');

async function applySprite({ inputPath, outputPath, isFloating = false, targetMax = 224 }) {
  // 1. 투명 여백 트림 (이미지 내 실제 캐릭터 영역만 추출)
  const trimmed = await sharp(inputPath).trim().toBuffer({ resolveWithObject: true });
  const trimW = trimmed.info.width;
  const trimH = trimmed.info.height;

  // 2. 비율 유지 축소
  let scale = 1.0;
  if (trimW > targetMax) scale = targetMax / trimW;
  if (trimH * scale > targetMax) scale = targetMax / trimH;

  const newW = Math.round(trimW * scale);
  const newH = Math.round(trimH * scale);

  const resized = await sharp(trimmed.data)
    .resize(newW, newH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  // 3. 패딩 계산 (가로 중앙, 세로는 접지 2px 또는 부유 중앙)
  const leftPad = Math.max(0, Math.round((256 - newW) / 2));
  const topPad = isFloating
    ? Math.max(0, Math.round((256 - newH) / 2))
    : Math.max(0, 256 - newH - 2);

  // 4. 256x256 투명 캔버스 합성 후 WebP 저장
  await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, top: topPad, left: leftPad }])
    .webp({ lossless: true })
    .toFile(outputPath);

  console.log(`✅ 스프라이트 적용 완료: ${outputPath} (${newW}x${newH}, top:${topPad}, left:${leftPad})`);
}
```

---

## 3. 크기 및 위치(상하좌우) 치우침 수정 절차 (사용자 피드백 대응)

사용자가 화면을 확인하고 수정을 요청할 때 대응하는 매뉴얼입니다.

### 3-1. 사용자 피드백별 조정 파라미터
1. **"이미지가 너무 커요 / 줄여주세요"**
   - 조치: 현재 크기 대비 **10%~15% 축소**
   - `scaleMultiplier = 0.9` (또는 `targetMax: 200`으로 하향)
2. **"이미지가 너무 작아요 / 키워주세요"**
   - 조치: 현재 크기 대비 **10%~15% 확대**
   - `scaleMultiplier = 1.1` (또는 `targetMax: 235`로 상향, 256px 초과 주의)
3. **"위로 더 올려주세요"**
   - 조치: `topPad`를 줄이거나, `offsetY = -8` ~ `-15` (음수값 적용)
4. **"아래로 더 내려주세요"**
   - 조치: `topPad`를 늘리거나, `offsetY = +6` ~ `+12` (양수값 적용)
5. **"오른쪽으로 옮겨주세요" (왼쪽으로 치우침)**
   - 조치: `leftPad`를 늘리거나, `offsetX = +6` ~ `+12` (양수값 적용)
6. **"왼쪽으로 옮겨주세요" (오른쪽으로 치우침)**
   - 조치: `leftPad`를 줄이거나, `offsetX = -6` ~ `-12` (음수값 적용)

---

### 3-2. 정밀 미세 조정 전용 스크립트 (`scripts/adjust_pokemon_sprite.js`)

피드백이 들어왔을 때 아래 템플릿의 파라미터(`scaleMultiplier`, `offsetX`, `offsetY`)만 조절하여 즉각 재실행합니다:

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * 포켓몬 스프라이트 크기 및 위치 정밀 조정 함수
 * @param {string} id - 포켓몬 식별키 (예: "0970", "0970-m")
 * @param {object} options
 * @param {number} options.scaleMultiplier - 크기 배율 (1.0 = 유지, 0.9 = 10% 축소, 1.1 = 10% 확대)
 * @param {number} options.offsetX - 가로 이동 (양수: 오른쪽, 음수: 왼쪽)
 * @param {number} options.offsetY - 세로 이동 (양수: 아래, 음수: 위)
 */
async function adjustSprite(id, { scaleMultiplier = 1.0, offsetX = 0, offsetY = 0 } = {}) {
  const filePath = path.join(__dirname, `../public/img/pokemon/${id}.webp`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`파일이 존재하지 않습니다: ${filePath}`);
  }

  // 1. 기존 투명 여백 트림하여 순수 본체만 획득
  const trimmed = await sharp(filePath).trim().toBuffer({ resolveWithObject: true });
  const trimW = trimmed.info.width;
  const trimH = trimmed.info.height;

  // 2. 크기 조절 계산
  const targetW = Math.min(250, Math.max(20, Math.round(trimW * scaleMultiplier)));
  const targetH = Math.min(250, Math.max(20, Math.round(trimH * scaleMultiplier)));

  const resized = await sharp(trimmed.data)
    .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  // 3. 중앙 기준 좌표 + 사용자 오프셋 적용
  let leftPad = Math.round((256 - targetW) / 2) + offsetX;
  let topPad = Math.round((256 - targetH) / 2) + offsetY;

  // 4. 캔버스 범위(0~256) 이탈 방지 클램핑
  leftPad = Math.max(0, Math.min(256 - targetW, leftPad));
  topPad = Math.max(0, Math.min(256 - targetH, topPad));

  // 5. 256x256 캔버스에 재합성
  const finalBuffer = await sharp({
    create: {
      width: 256,
      height: 256,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: resized, top: topPad, left: leftPad }])
    .webp({ lossless: true })
    .toBuffer();

  fs.writeFileSync(filePath, finalBuffer);
  console.log(`🎯 [${id}] 조정 완료: 크기(${targetW}x${targetH}), topPad:${topPad}, leftPad:${leftPad}`);
}

// [사용 예시]
// adjustSprite("0970-m", { scaleMultiplier: 0.9, offsetX: 5, offsetY: -8 });
```

---

## 4. 자주 쓰이는 터미널 One-liner (신속 실행용)

별도 스크립트 파일을 생성하지 않고 파워쉘에서 즉시 실행하고자 할 때:

```powershell
# 예: 0970-m 포켓몬 이미지를 10% 축소하고 위로 8px 올리기
node -e "
const sharp = require('sharp');
const fs = require('fs');
(async () => {
  const p = 'public/img/pokemon/0970-m.webp';
  const t = await sharp(p).trim().toBuffer({ resolveWithObject: true });
  const nw = Math.round(t.info.width * 0.9);
  const nh = Math.round(t.info.height * 0.9);
  const r = await sharp(t.data).resize(nw, nh).toBuffer();
  const left = Math.max(0, Math.round((256 - nw) / 2));
  const top = Math.max(0, Math.round((256 - nh) / 2) - 8);
  await sharp({ create: { width: 256, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: r, top, left }])
    .webp({ lossless: true })
    .toFile(p);
  console.log('Done!');
})();
"
```

---

## 5. 작업 체크리스트

- [ ] 이미지가 `public/img/pokemon/{id}.webp` 경로에 정확한 도감번호 식별키로 저장되었는가?
- [ ] 캔버스 규격이 정확히 `256 × 256` 픽셀인가?
- [ ] 포맷이 투명 배경을 지원하는 `WebP`인가?
- [ ] 이미지가 캔버스 경계를 뚫고 잘리거나 과도하게 크지 않은가 (최대 권장 210~230px)?
- [ ] 사용자가 위치/크기 조정을 요청했을 때 위 매뉴얼의 `scaleMultiplier`, `offsetX`, `offsetY`를 조절하여 즉시 반영하였는가?
