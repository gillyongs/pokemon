import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { HeaderArea, HeaderTopRow, Title } from "./selectStyles";

// 종족값 600 포켓몬 (메가 포켓몬 제외)
const STAT_600_POKEMONS = ["망나뇽", "마기라스", "보만다", "메타그로스", "라티아스", "라티오스", "한카리아스", "히드런", "삼삼드래", "랜드로스(화신폼)", "랜드로스(영물폼)", "게노세크트", "멜메탈", "드래펄트", "드닐레이브", "브리두라스", "자루도", "제라오라"].filter((p) => !p.startsWith("메가"));

// 종족값 550 이상 중 600이 아닌 포켓몬 (메가 포켓몬 제외)
const STAT_550_NOT_600_POKEMONS = ["썬더", "카푸꼬꼬꼭", "텅비드", "레지드래고", "유크시", "아그놈", "앤테이", "고동치는달", "굽이치는물결", "블리자포스", "비리디온", "스이쿤", "러브로스"].filter((p) => !p.startsWith("메가"));

// 모습에 따라 종족값 총합이 달라지는 포켓몬 (정답 후보)
const FORM_STAT_DIFF_CORRECT_POKEMONS = ["자마젠타", "불비달마", "메테노", "다투곰"];

// 모습에 따라 종족값 총합이 달라지지 않는 포켓몬 (오답 후보)
const FORM_STAT_DIFF_WRONG_POKEMONS = ["오거폰", "랜드로스", "토네로스", "디아루가", "기라티나", "테오키스", "루가루암", "펌킨인", "조로아크", "나인테일", "대쓰여너"];

// 타입과 상태이상 퀴즈 정답 후보 (틀린 설명 -> 정답)
const TYPE_STATUS_CORRECT_STATEMENTS = ["물 타입 포켓몬은 화상에 걸리지 않는다", "땅 타입 포켓몬은 마비에 걸리지 않는다", "불꽃 타입 포켓몬은 얼음 상태가 되지 않는다"];

// 타입과 상태이상 퀴즈 오답 후보 (옳은 설명 -> 오답)
const TYPE_STATUS_WRONG_STATEMENTS = ["불꽃타입 포켓몬은 화상에 걸리지 않는다", "전기타입 포켓몬은 마비에 걸리지 않는다", "얼음타입 포켓몬은 얼음 상태가 되지 않는다", "강철타입 포켓몬은 맹독에 걸리지 않는다", "독타입 포켓몬은 독과 맹독에 걸리지 않는다"];

// 독, 맹독, 화상 첫 턴 데미지 8가지 선택지 (2 * 2 * 2 = 8)
const POISON_BURN_DAMAGE_CORRECT = "1/8, 1/16, 1/16";
const POISON_BURN_DAMAGE_WRONGS = ["1/8, 1/8, 1/8", "1/8, 1/8, 1/16", "1/8, 1/16, 1/8", "1/16, 1/8, 1/8", "1/16, 1/8, 1/16", "1/16, 1/16, 1/8", "1/16, 1/16, 1/16"];

// 초전설 종족값 670 포켓몬
const STAT_670_POKEMONS = ["가이오가", "그란돈", "코라이돈", "미라이돈"];

// 초전설 종족값 680 포켓몬
const STAT_680_POKEMONS = ["뮤츠", "칠색조", "레쿠쟈", "디아루가", "기라티나", "레시라무", "이벨타르", "솔가레오", "루나아라", "황혼의갈기", "새벽의날개"];

// 우선도 비교 퀴즈 기술 목록
const PRIORITY_QUIZ_MOVES = [
  { name: "매직룸", priority: 0 },
  { name: "원더룸", priority: 0 },
  { name: "메탈버스트", priority: 0 },
  { name: "받아던지기", priority: -1 },
  { name: "리벤지", priority: -4 },
  { name: "카운터", priority: -5 },
  { name: "배대뒤치기", priority: -6 },
  { name: "트릭룸", priority: -7 },
];

// 배열 무작위 셔플
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// n개 무작위 샘플링
function sampleN(arr, n) {
  return shuffleArray(arr).slice(0, n);
}

// 퀴즈 타입별 가중치 추첨
export function pickQuizType(rand = Math.random()) {
  const quizCandidates = [
    { type: "statNot600", weight: 300 },
    { type: "formStatDiff", weight: 100 },
    { type: "lowestPriorityMove", weight: 100 },
    { type: "typeStatusImmunity", weight: 30 },
    { type: "confusion", weight: 30 },
    { type: "screenPp", weight: 30 },
    { type: "poisonToxicDamage", weight: 30 },
    { type: "statDiff670", weight: 30 },
    { type: "statDiff680", weight: 30 },
    { type: "knockOffBerry", weight: 30 },
    { type: "pelipper", weight: 30 },
  ];
  const totalWeight = quizCandidates.reduce((sum, item) => sum + item.weight, 0);
  let threshold = rand * totalWeight;
  for (const item of quizCandidates) {
    if (threshold < item.weight) {
      return item.type;
    }
    threshold -= item.weight;
  }
  return quizCandidates[0].type;
}

// 퀴즈 문제 생성기
export function generateQuizQuestion() {
  const chosenType = pickQuizType();

  if (chosenType === "lowestPriorityMove") {
    // 8개 기술 중 4개 무작위 선출 후 가장 우선도가 낮은 기술을 정답으로 설정
    const pickedMoves = sampleN(PRIORITY_QUIZ_MOVES, 4);
    const minPriority = Math.min(...pickedMoves.map((m) => m.priority));
    const options = pickedMoves.map((m) => ({
      text: m.name,
      isCorrect: m.priority === minPriority,
    }));
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "다음 중 우선도가 낮아 가장 늦게 발동되는 기술은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "statDiff670") {
    // 680 3마리 중 종족값 670 포켓몬 1마리 찾기 (셔플 유지)
    const correctPoke = sampleN(STAT_670_POKEMONS, 1)[0];
    const wrongPokes = sampleN(STAT_680_POKEMONS, 3);
    const options = [{ text: correctPoke, isCorrect: true }, ...wrongPokes.map((text) => ({ text, isCorrect: false }))];
    return {
      title: "종족값 퀴즈",
      question: "다음 중 종족값이 다른 한 포켓몬은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "statDiff680") {
    // 670 3마리 중 종족값 680 포켓몬 1마리 찾기 (셔플 유지)
    const correctPoke = sampleN(STAT_680_POKEMONS, 1)[0];
    const wrongPokes = sampleN(STAT_670_POKEMONS, 3);
    const options = [{ text: correctPoke, isCorrect: true }, ...wrongPokes.map((text) => ({ text, isCorrect: false }))];
    return {
      title: "종족값 퀴즈",
      question: "다음 중 종족값이 다른 한 포켓몬은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "typeStatusImmunity") {
    // 타입과 상태이상 면역 퀴즈 (틀린 것 고르기, 셔플 유지)
    const correctStatement = sampleN(TYPE_STATUS_CORRECT_STATEMENTS, 1)[0];
    const wrongStatements = sampleN(TYPE_STATUS_WRONG_STATEMENTS, 3);
    const options = [{ text: correctStatement, isCorrect: true }, ...wrongStatements.map((text) => ({ text, isCorrect: false }))];
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "다음 중 타입과 상태이상에 관해 틀린 것은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "pelipper") {
    // 패리퍼 이름 맞추기 퀴즈 (셔플 유지)
    const options = [
      { text: "페리퍼", isCorrect: false },
      { text: "패리퍼", isCorrect: true },
      { text: "패라퍼", isCorrect: false },
      { text: "페라퍼", isCorrect: false },
    ];
    return {
      title: "포켓몬 상식 퀴즈",
      question: "다음 중 특성이 잔비인 포켓몬은 누구입니까?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "confusion") {
    // 혼란 메커니즘 퀴즈 (정답 3번, 셔플 미적용)
    const options = [
      { text: "병상첨병이 적용되며 리샘열매로 회복된다", isCorrect: false },
      { text: "병상첨병이 적용되며 리샘열매로 회복할 수 없다", isCorrect: false },
      { text: "병상첨병이 적용되지 않으며 리샘열매로 회복된다", isCorrect: true },
      { text: "병상첨병이 적용되지 않으며 리샘열매로 회복할 수 없다", isCorrect: false },
    ];
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "다음 중 혼란에 관하여 옳은 것은?",
      options,
    };
  }

  if (chosenType === "screenPp") {
    // 리플렉터 및 빛의장막 기본 PP 퀴즈 (정답 2번, 셔플 미적용)
    const options = [
      { text: "리플렉터: 20, 빛의장막: 20", isCorrect: false },
      { text: "리플렉터: 20, 빛의장막: 30", isCorrect: true },
      { text: "리플렉터: 30, 빛의장막: 20", isCorrect: false },
      { text: "리플렉터: 30, 빛의장막: 30", isCorrect: false },
    ];
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "각 기술의 기본 PP값으로 옳은 것은?",
      options,
    };
  }

  if (chosenType === "poisonToxicDamage") {
    // 독, 맹독, 화상 첫 턴 데미지 퀴즈 (총 8가지 중 정답 1개 + 오답 3개 선출 후 셔플)
    const wrongPicks = sampleN(POISON_BURN_DAMAGE_WRONGS, 3);
    const options = [{ text: POISON_BURN_DAMAGE_CORRECT, isCorrect: true }, ...wrongPicks.map((text) => ({ text, isCorrect: false }))];
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "상태이상에 걸린 첫 턴 독, 맹독, 화상이 입히는 데미지로 옳은 것은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "formStatDiff") {
    // 모습에 따라 종족값 총합이 달라지는 포켓몬 찾기 (셔플 유지)
    const correctPoke = sampleN(FORM_STAT_DIFF_CORRECT_POKEMONS, 1)[0];
    const wrongPokes = sampleN(FORM_STAT_DIFF_WRONG_POKEMONS, 3);
    const options = [{ text: correctPoke, isCorrect: true }, ...wrongPokes.map((p) => ({ text: p, isCorrect: false }))];
    return {
      title: "종족값 퀴즈",
      question: "다음 중 모습에 따라 종족값 총합이 달라지는 포켓몬은?",
      options: shuffleArray(options),
    };
  }

  if (chosenType === "statNot600") {
    // 종족값 총합 600이 아닌 포켓몬 찾기 (셔플 유지)
    const correctPoke = sampleN(STAT_550_NOT_600_POKEMONS, 1)[0];
    const wrongPokes = sampleN(STAT_600_POKEMONS, 3);
    const options = [{ text: correctPoke, isCorrect: true }, ...wrongPokes.map((p) => ({ text: p, isCorrect: false }))];
    return {
      title: "종족값 퀴즈",
      question: "다음 중 종족값 총합이 600이 아닌 포켓몬은?",
      options: shuffleArray(options),
    };
  }

  // knockOffBerry: 탁쳐서떨구기 열매 퀴즈 (마코열매 또는 수불열매, 셔플 미적용)
  const isMacho = Math.random() < 0.5;
  if (isMacho) {
    // 마코열매(악타입 반감 열매) vs 탁쳐서떨구기 (정답 2번)
    const options = [
      {
        text: "마코열매가 발동되어 탁쳐서떨구기의 위력이 감소한다. 탁쳐서떨구기의 위력 증가도 적용되지 않는다.",
        isCorrect: false,
      },
      {
        text: "마코열매가 발동되어 탁쳐서떨구기의 위력이 감소한다. 탁쳐서떨구기의 위력 증가는 적용된다.",
        isCorrect: true,
      },
      {
        text: "마코열매를 탁쳐서 떨궈 효과가 발동되지 않는다.",
        isCorrect: false,
      },
      {
        text: "탁쳐서떨구기는 악타입 기술이므로 마코열매가 발동하지 않는다.",
        isCorrect: false,
      },
    ];
    return {
      title: "배틀 메커니즘 퀴즈",
      question: "마코열매를 지닌 포켓몬이 탁쳐서떨구기를 맞았을 때 다음 중 옳은 것은?",
      options,
    };
  }

  // 수불열매(불꽃타입 반감 열매) vs 탁쳐서떨구기 (정답 4번)
  const options = [
    {
      text: "수불열매가 발동되어 탁쳐서떨구기의 위력이 감소한다. 탁쳐서떨구기의 위력 증가도 적용되지 않는다.",
      isCorrect: false,
    },
    {
      text: "수불열매가 발동되어 탁쳐서떨구기의 위력이 감소한다. 탁쳐서떨구기의 위력 증가는 적용된다.",
      isCorrect: false,
    },
    {
      text: "수불열매를 탁쳐서 떨궈 효과가 발동되지 않는다.",
      isCorrect: false,
    },
    {
      text: "탁쳐서떨구기는 악타입 기술이므로 수불열매가 발동하지 않는다.",
      isCorrect: true,
    },
  ];
  return {
    title: "배틀 메커니즘 퀴즈",
    question: "수불열매를 지닌 포켓몬이 탁쳐서떨구기를 맞았을 때 다음 중 옳은 것은?",
    options,
  };
}

function getOptionFontSize(text) {
  const len = text ? text.length : 0;
  if (len > 38) return "0.68rem";
  if (len > 25) return "0.74rem";
  if (len > 15) return "0.82rem";
  return "0.9rem";
}

const AugmentQuizView = ({ quizAug, activePokemon, onSelect }) => {
  const quiz = useMemo(() => generateQuizQuestion(), []);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const handleSubmit = (e) => {
    e.stopPropagation();
    if (selectedIdx === null) return;
    const isCorrect = Boolean(quiz.options[selectedIdx]?.isCorrect);
    if (onSelect) {
      onSelect(quizAug, {
        targetPokemon: activePokemon,
        isCorrect,
      });
    }
  };

  return (
    <ViewWrapper onClick={(e) => e.stopPropagation()}>
      <HeaderArea>
        <HeaderTopRow>
          <Title>포켓몬 퀴즈</Title>
        </HeaderTopRow>
      </HeaderArea>

      <QuizContainer>
        <QuestionBox>
          <QuestionPrefix>Q.</QuestionPrefix>
          <QuestionText>{quiz.question}</QuestionText>
        </QuestionBox>

        <OptionsGrid>
          {quiz.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const status = isSelected ? "selected" : "default";

            return (
              <OptionItem key={idx} $status={status} onClick={() => setSelectedIdx(idx)}>
                <OptionHeader>
                  <OptionNumber $status={status}>{idx + 1}</OptionNumber>
                </OptionHeader>
                <OptionText $fontSize={getOptionFontSize(opt.text)}>{opt.text}</OptionText>
              </OptionItem>
            );
          })}
        </OptionsGrid>
      </QuizContainer>

      <FooterArea>
        <SubmitButton disabled={selectedIdx === null} onClick={handleSubmit}>
          정답 제출하기
        </SubmitButton>
      </FooterArea>
    </ViewWrapper>
  );
};

export default AugmentQuizView;

const ViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 4px 2px;
  box-sizing: border-box;
`;

const QuizContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 6px;
  flex: 1;
  overflow-y: auto;
`;

const QuestionBox = styled.div`
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const QuestionPrefix = styled.span`
  color: #38bdf8;
  font-weight: 900;
  font-size: 1.15rem;
  line-height: 1.3;
`;

const QuestionText = styled.div`
  color: #f8fafc;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.45;
  word-break: keep-all;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
`;

const OptionItem = styled.button`
  background: ${(props) => (props.$status === "selected" ? "rgba(59, 130, 246, 0.25)" : "rgba(30, 41, 59, 0.6)")};
  border: 1.5px solid ${(props) => (props.$status === "selected" ? "#38bdf8" : "rgba(255, 255, 255, 0.08)")};
  border-radius: 10px;
  padding: 10px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
  min-height: 76px;
  box-sizing: border-box;

  &:hover {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(56, 189, 248, 0.6);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.99);
  }
`;

const OptionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const OptionNumber = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  background: ${(props) => (props.$status === "selected" ? "#38bdf8" : "rgba(255, 255, 255, 0.12)")};
  color: ${(props) => (props.$status === "selected" ? "#0f172a" : "#cbd5e1")};
`;

const OptionText = styled.span`
  color: #f1f5f9;
  font-size: ${(props) => props.$fontSize || "0.88rem"};
  line-height: 1.35;
  white-space: pre-line;
  word-break: keep-all;
  flex: 1;
`;

const FooterArea = styled.div`
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 10px;
  width: 100%;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: ${(props) => (props.disabled ? "rgba(59, 130, 246, 0.2)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)")};
  color: ${(props) => (props.disabled ? "#64748b" : "#ffffff")};
  font-size: 0.95rem;
  font-weight: 700;
  border: 1px solid ${(props) => (props.disabled ? "rgba(255, 255, 255, 0.05)" : "rgba(59, 130, 246, 0.6)")};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;

  &:hover {
    ${(props) =>
      !props.disabled &&
      `
      background: linear-gradient(135deg, #2563eb, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    `}
  }

  &:active {
    ${(props) => !props.disabled && `transform: scale(0.98);`}
  }
`;
