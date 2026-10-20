import React, { useState, useMemo } from "react";
import styled from "styled-components";
import PokemonData from "../../entity/Pokemon/PokemonData";

export const STAT_KEYS = ["hp", "atk", "def", "catk", "cdef", "speed"];

export const STAT_NAMES = {
  hp: "HP",
  atk: "공격",
  def: "방어",
  catk: "특공",
  cdef: "특방",
  speed: "스피드",
};

export const NATURE_STAT_OPTIONS = [
  { key: "atk", label: "공격" },
  { key: "def", label: "방어" },
  { key: "catk", label: "특공" },
  { key: "cdef", label: "특방" },
  { key: "speed", label: "스피드" },
];

export const NATURE_TABLE = {
  "atk-def": { name: "외로운", text: "공격▲ 방어▼" },
  "atk-catk": { name: "고집", text: "공격▲ 특공▼" },
  "atk-cdef": { name: "개구쟁이", text: "공격▲ 특방▼" },
  "atk-speed": { name: "용감", text: "공격▲ 스피드▼" },

  "def-atk": { name: "대담", text: "방어▲ 공격▼" },
  "def-catk": { name: "장난꾸러기", text: "방어▲ 특공▼" },
  "def-cdef": { name: "촐랑", text: "방어▲ 특방▼" },
  "def-speed": { name: "무사태평", text: "방어▲ 스피드▼" },

  "catk-atk": { name: "조심", text: "특공▲ 공격▼" },
  "catk-def": { name: "의젓", text: "특공▲ 방어▼" },
  "catk-cdef": { name: "덜렁", text: "특공▲ 특방▼" },
  "catk-speed": { name: "냉정", text: "특공▲ 스피드▼" },

  "cdef-atk": { name: "차분", text: "특방▲ 공격▼" },
  "cdef-def": { name: "얌전", text: "특방▲ 방어▼" },
  "cdef-catk": { name: "신중", text: "특방▲ 특공▼" },
  "cdef-speed": { name: "건방", text: "특방▲ 스피드▼" },

  "speed-atk": { name: "겁쟁이", text: "스피드▲ 공격▼" },
  "speed-def": { name: "성급", text: "스피드▲ 방어▼" },
  "speed-catk": { name: "명랑", text: "스피드▲ 특공▼" },
  "speed-cdef": { name: "천진난만", text: "스피드▲ 특방▼" },
};

export const NATURE_LIST = [
  { name: "고집", up: "atk", down: "catk", text: "공격▲ 특공▼" },
  { name: "명랑", up: "speed", down: "catk", text: "스피드▲ 특공▼" },
  { name: "조심", up: "catk", down: "atk", text: "특공▲ 공격▼" },
  { name: "겁쟁이", up: "speed", down: "atk", text: "스피드▲ 공격▼" },
  { name: "대담", up: "def", down: "atk", text: "방어▲ 공격▼" },
  { name: "장난꾸러기", up: "def", down: "catk", text: "방어▲ 특공▼" },
  { name: "차분", up: "cdef", down: "atk", text: "특방▲ 공격▼" },
  { name: "신중", up: "cdef", down: "catk", text: "특방▲ 특공▼" },
  { name: "용감", up: "atk", down: "speed", text: "공격▲ 스피드▼" },
  { name: "냉정", up: "catk", down: "speed", text: "특공▲ 스피드▼" },
  { name: "무사태평", up: "def", down: "speed", text: "방어▲ 스피드▼" },
  { name: "건방", up: "cdef", down: "speed", text: "특방▲ 스피드▼" },
  { name: "천진난만", up: "speed", down: "cdef", text: "스피드▲ 특방▼" },
  { name: "성급", up: "speed", down: "def", text: "스피드▲ 방어▼" },
  { name: "외로운", up: "atk", down: "def", text: "공격▲ 방어▼" },
  { name: "개구쟁이", up: "atk", down: "cdef", text: "공격▲ 특방▼" },
  { name: "덜렁", up: "catk", down: "cdef", text: "특공▲ 특방▼" },
  { name: "의젓", up: "catk", down: "def", text: "특공▲ 방어▼" },
  { name: "얌전", up: "cdef", down: "def", text: "특방▲ 방어▼" },
  { name: "노력 (무보정)", up: null, down: null, text: "효과 없음" },
];

export const getNatureInfo = (up, down) => {
  if (!up && !down) {
    return { name: "노력", text: "무보정", isError: false, isValid: true };
  }
  if (up === down) {
    return { name: "노력", text: "무보정", isError: false, isValid: true };
  }
  if (up && !down) {
    return { name: "하락 미선택", text: "", isError: true, isValid: false };
  }
  if (!up && down) {
    return { name: "상승 미선택", text: "", isError: true, isValid: false };
  }
  const key = `${up}-${down}`;
  if (NATURE_TABLE[key]) {
    return { ...NATURE_TABLE[key], isError: false, isValid: true };
  }
  return {
    name: "사용자 설정",
    text: `${STAT_NAMES[up] || "없음"}▲ ${STAT_NAMES[down] || "없음"}▼`,
    isError: false,
    isValid: true,
  };
};

export const GACHA_OPTIONS = [
  { id: "6V", name: "6V" },
  { id: "5V0A", name: "5V0A" },
  { id: "5V0S", name: "5V0S" },
  { id: "4V0A0S", name: "4V0A0S" },
];

export const GACHA_DESCRIPTIONS = {
  "6V": "모든 능력치 풀보정. 물리 포켓몬이 채용합니다.",
  "5V0A": "공격 무보정. 특수 포켓몬이 채용합니다.",
  "5V0S": "스피드 무보정. 물리 트릭룸 포켓몬이 채용합니다.",
  "4V0A0S": "공, 스핏 무보정. 특수 트릭룸 포켓몬이 채용합니다.",
};

export const normalizeGacha = (g) => {
  if (g === "5V1A") return "5V0A";
  if (g === "5V1S") return "5V0S";
  if (g === "4V") return "4V0A0S";
  return g || "6V";
};

export const calculateStat = (base, iv, ev, isHp = false, natureUp = false, natureDown = false) => {
  if (isHp) {
    const raw = base * 2 + Math.floor(ev / 4) + iv;
    return Math.floor(raw / 2) + 60;
  }
  const raw = base * 2 + Math.floor(ev / 4) + iv;
  let val = Math.floor(raw / 2) + 5;
  if (natureUp && !natureDown) val = Math.floor(val * 1.1);
  if (natureDown && !natureUp) val = Math.floor(val * 0.9);
  return val;
};

const StatAdjustmentModal = ({ pokemon, currentHp, currentStat, currentEvs, currentNature, currentGacha = "6V", onSave, onClose }) => {
  const baseData = useMemo(() => {
    return (
      PokemonData.getDataById(pokemon.pokemon_id) ||
      PokemonData.getDataById(pokemon.id) || {
        hp: 100,
        atk: 100,
        def: 100,
        catk: 100,
        cdef: 100,
        speed: 100,
      }
    );
  }, [pokemon]);

  const defaultEvs = useMemo(() => {
    return (
      currentEvs ||
      pokemon.evs || {
        hp: 0,
        atk: 0,
        def: 0,
        catk: 0,
        cdef: 0,
        speed: 0,
      }
    );
  }, [currentEvs, pokemon]);

  const defaultNature = useMemo(() => {
    return currentNature || pokemon.nature || { up: "atk", down: "catk" };
  }, [currentNature, pokemon]);

  const [evs, setEvs] = useState({ ...defaultEvs });
  const [nature, setNature] = useState({ ...defaultNature });
  const [gacha, setGacha] = useState(normalizeGacha(currentGacha || pokemon.gacha));

  const ivs = useMemo(() => {
    const isSpeed0 = gacha === "5V0S" || gacha === "4V0A0S" || gacha === "5V1S" || gacha === "4V";
    const isAtk0 = gacha === "5V0A" || gacha === "4V0A0S" || gacha === "5V1A" || gacha === "4V";
    return {
      hp: 31,
      atk: isAtk0 ? 0 : 31,
      def: 31,
      catk: 31,
      cdef: 31,
      speed: isSpeed0 ? 0 : 31,
    };
  }, [gacha]);

  const totalEv = Object.values(evs).reduce((a, b) => a + (Number(b) || 0), 0);
  const remainingEv = 508 - totalEv;
  const isOverEv = totalEv > 508;
  const overEv = totalEv - 508;

  const calculatedStats = useMemo(() => {
    const isUp = (key) => nature.up === key && nature.down !== key;
    const isDown = (key) => nature.down === key && nature.up !== key;

    const hp = calculateStat(baseData.hp, ivs.hp, evs.hp || 0, true);
    const stat = {
      atk: calculateStat(baseData.atk, ivs.atk, evs.atk || 0, false, isUp("atk"), isDown("atk")),
      def: calculateStat(baseData.def, ivs.def, evs.def || 0, false, isUp("def"), isDown("def")),
      catk: calculateStat(baseData.catk, ivs.catk, evs.catk || 0, false, isUp("catk"), isDown("catk")),
      cdef: calculateStat(baseData.cdef, ivs.cdef, evs.cdef || 0, false, isUp("cdef"), isDown("cdef")),
      speed: calculateStat(baseData.speed, ivs.speed, evs.speed || 0, false, isUp("speed"), isDown("speed")),
    };

    let megaData = null;
    if (pokemon.megaData) {
      const megaBase = PokemonData.getDataById(pokemon.megaData.pokemon_id);
      if (megaBase) {
        megaData = {
          ...pokemon.megaData,
          stat: {
            atk: calculateStat(megaBase.atk, ivs.atk, evs.atk || 0, false, isUp("atk"), isDown("atk")),
            def: calculateStat(megaBase.def, ivs.def, evs.def || 0, false, isUp("def"), isDown("def")),
            catk: calculateStat(megaBase.catk, ivs.catk, evs.catk || 0, false, isUp("catk"), isDown("catk")),
            cdef: calculateStat(megaBase.cdef, ivs.cdef, evs.cdef || 0, false, isUp("cdef"), isDown("cdef")),
            speed: calculateStat(megaBase.speed, ivs.speed, evs.speed || 0, false, isUp("speed"), isDown("speed")),
          },
        };
      }
    }

    return { hp, stat, megaData };
  }, [baseData, ivs, evs, nature, pokemon.megaData]);

  const handleEvChange = (statKey, delta) => {
    setEvs((prev) => {
      const current = Number(prev[statKey]) || 0;
      let next = current + delta;
      if (next < 0) next = 0;
      if (next > 252) next = 252;
      return { ...prev, [statKey]: next };
    });
  };

  const handleEvDirectSet = (statKey, targetValue) => {
    setEvs((prev) => {
      let next = Math.max(0, Math.min(252, targetValue));
      return { ...prev, [statKey]: next };
    });
  };

  const handleEvInputChange = (statKey, rawValue) => {
    if (rawValue === "") {
      setEvs((prev) => ({ ...prev, [statKey]: "" }));
      return;
    }
    let num = parseInt(rawValue, 10);
    if (isNaN(num)) num = 0;
    if (num < 0) num = 0;
    if (num > 252) num = 252;
    setEvs((prev) => ({ ...prev, [statKey]: num }));
  };

  const handleEvInputBlur = (statKey) => {
    setEvs((prev) => {
      const val = prev[statKey];
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 252) num = 252;
      return { ...prev, [statKey]: num };
    });
  };

  const handleApplyPreset = (presetType) => {
    if (presetType === "sample") {
      setEvs({ ...(pokemon.evs || defaultEvs) });
      setNature({ ...(pokemon.nature || defaultNature) });
      setGacha(normalizeGacha(pokemon.gacha));
    } else if (presetType === "reset") {
      setEvs({ hp: 0, atk: 0, def: 0, catk: 0, cdef: 0, speed: 0 });
    } else if (presetType === "AS252") {
      setEvs({ hp: 4, atk: 252, def: 0, catk: 0, cdef: 0, speed: 252 });
      setNature({ up: "speed", down: "catk" });
    } else if (presetType === "CS252") {
      setEvs({ hp: 4, atk: 0, def: 0, catk: 252, cdef: 0, speed: 252 });
      setNature({ up: "speed", down: "atk" });
    } else if (presetType === "HA252") {
      setEvs({ hp: 252, atk: 252, def: 0, catk: 0, cdef: 4, speed: 0 });
      setNature({ up: "atk", down: "catk" });
    } else if (presetType === "HC252") {
      setEvs({ hp: 252, atk: 0, def: 0, catk: 252, cdef: 4, speed: 0 });
      setNature({ up: "catk", down: "atk" });
    } else if (presetType === "HB252") {
      setEvs({ hp: 252, atk: 0, def: 252, catk: 0, cdef: 4, speed: 0 });
      setNature({ up: "def", down: "atk" });
    } else if (presetType === "HD252") {
      setEvs({ hp: 252, atk: 0, def: 4, catk: 0, cdef: 252, speed: 0 });
      setNature({ up: "cdef", down: "atk" });
    }
  };

  const natureInfo = getNatureInfo(nature.up, nature.down);
  const isNatureIncomplete = !natureInfo.isValid;
  const isCannotConfirm = isNatureIncomplete || isOverEv;

  const handleConfirm = () => {
    if (isCannotConfirm) return;
    if (onSave) {
      const cleanEvs = {};
      STAT_KEYS.forEach((k) => {
        cleanEvs[k] = Number(evs[k]) || 0;
      });

      onSave({
        hp: calculatedStats.hp,
        stat: calculatedStats.stat,
        evs: cleanEvs,
        nature,
        gacha,
        megaData: calculatedStats.megaData || pokemon.megaData,
      });
    }
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>능력치 설정</Title>
          <CloseButton onClick={onClose} aria-label="닫기">
            ✕
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* 1. 성격 선택 (맨 위) */}
          <NatureSection>
            <SectionHeader>
              <SectionTitle>성격 설정</SectionTitle>
              <CurrentNatureBadge $isError={natureInfo.isError}>{natureInfo.isError ? natureInfo.name : `${natureInfo.name} (${natureInfo.text})`}</CurrentNatureBadge>
            </SectionHeader>

            <NatureRow>
              <NatureRowLabel $type="up">상승 (▲ +10%)</NatureRowLabel>
              <NatureButtonGroup>
                {NATURE_STAT_OPTIONS.map((opt) => {
                  const isSelected = nature.up === opt.key;
                  return (
                    <NatureSelectBtn
                      key={`up-${opt.key}`}
                      $type="up"
                      $isSelected={isSelected}
                      onClick={() =>
                        setNature((prev) => ({
                          ...prev,
                          up: prev.up === opt.key ? null : opt.key,
                        }))
                      }
                    >
                      {opt.label}
                    </NatureSelectBtn>
                  );
                })}
              </NatureButtonGroup>
            </NatureRow>

            <NatureRow>
              <NatureRowLabel $type="down">하락 (▼ -10%)</NatureRowLabel>
              <NatureButtonGroup>
                {NATURE_STAT_OPTIONS.map((opt) => {
                  const isSelected = nature.down === opt.key;
                  return (
                    <NatureSelectBtn
                      key={`down-${opt.key}`}
                      $type="down"
                      $isSelected={isSelected}
                      onClick={() =>
                        setNature((prev) => ({
                          ...prev,
                          down: prev.down === opt.key ? null : opt.key,
                        }))
                      }
                    >
                      {opt.label}
                    </NatureSelectBtn>
                  );
                })}
              </NatureButtonGroup>
            </NatureRow>
          </NatureSection>

          {/* 2. 개체값 선택 (위에서 2번째: 성격과 노력치 사이) */}
          <GachaSection>
            <SectionHeader>
              <SectionTitle>개체값</SectionTitle>
            </SectionHeader>
            <GachaButtonGroup>
              {GACHA_OPTIONS.map((opt) => {
                const isSelected = gacha === opt.id;
                return (
                  <GachaBtn key={opt.id} $isSelected={isSelected} onClick={() => setGacha(opt.id)}>
                    {opt.name}
                  </GachaBtn>
                );
              })}
            </GachaButtonGroup>
            <GachaDescBox>{GACHA_DESCRIPTIONS[gacha] || GACHA_DESCRIPTIONS["6V"]}</GachaDescBox>
          </GachaSection>

          {/* 3. 총 노력치 프로그레스 및 프리셋 */}
          <EvSummaryBox $isOver={isOverEv}>
            <EvSummaryHeader>
              <span>
                <strong>총 노력치:</strong> {totalEv} / 508
              </span>
              <RemainingText $isFull={totalEv === 508} $isOver={isOverEv}>
                {isOverEv ? `초과: +${overEv}` : `남은 노력치: ${remainingEv}`}
              </RemainingText>
            </EvSummaryHeader>
            <EvProgressBar>
              <EvProgressFill $percent={Math.min(100, (totalEv / 508) * 100)} $isOver={isOverEv} />
            </EvProgressBar>
          </EvSummaryBox>

          {/* 프리셋 버튼 */}
          <PresetSection>
            <PresetBtn onClick={() => handleApplyPreset("sample")}>샘플 원본</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("AS252")}>AS252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("CS252")}>CS252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("HA252")}>HA252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("HC252")}>HC252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("HB252")}>HB252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("HD252")}>HD252</PresetBtn>
            <PresetBtn onClick={() => handleApplyPreset("reset")}>초기화</PresetBtn>
          </PresetSection>

          {/* 4. 능력치 6개 목록 */}
          <StatsListArea>
            {STAT_KEYS.map((statKey) => {
              const isHp = statKey === "hp";
              const baseVal = baseData[statKey] || 0;
              const ivVal = ivs[statKey];
              const evVal = Number(evs[statKey]) || 0;
              const finalVal = isHp ? calculatedStats.hp : calculatedStats.stat[statKey];
              const isUp = !isHp && nature.up === statKey && nature.down !== statKey;
              const isDown = !isHp && nature.down === statKey && nature.up !== statKey;

              return (
                <StatRowCard key={statKey}>
                  <StatLabelCol>
                    <StatNameRow>
                      <StatName>{STAT_NAMES[statKey]}</StatName>
                      {isUp && <NatureModifier $type="up">▲</NatureModifier>}
                      {isDown && <NatureModifier $type="down">▼</NatureModifier>}
                    </StatNameRow>
                    <StatBaseText>
                      종족 {baseVal} · IV {ivVal}
                    </StatBaseText>
                  </StatLabelCol>

                  <EvControlCol>
                    <StepBtn onClick={() => handleEvDirectSet(statKey, 0)}>0</StepBtn>
                    <StepBtn onClick={() => handleEvChange(statKey, -4)}>-4</StepBtn>
                    <EvInput
                      type="number"
                      min="0"
                      max="252"
                      $isMax={(Number(evs[statKey]) || 0) === 252}
                      value={evs[statKey] !== undefined ? evs[statKey] : 0}
                      onChange={(e) => handleEvInputChange(statKey, e.target.value)}
                      onBlur={() => handleEvInputBlur(statKey)}
                      aria-label={`${STAT_NAMES[statKey]} 노력치 입력`}
                    />
                    <StepBtn onClick={() => handleEvChange(statKey, 4)}>+4</StepBtn>
                    <StepBtn onClick={() => handleEvDirectSet(statKey, 252)}>252</StepBtn>
                  </EvControlCol>

                  <FinalStatCol>
                    <FinalStatLabel>실수치</FinalStatLabel>
                    <FinalStatVal $isUp={isUp} $isDown={isDown}>
                      {finalVal}
                    </FinalStatVal>
                  </FinalStatCol>
                </StatRowCard>
              );
            })}
          </StatsListArea>
        </ModalBody>

        <ModalFooter>
          <ConfirmButton disabled={isCannotConfirm} $disabled={isCannotConfirm} onClick={handleConfirm}>
            능력치 설정 완료
          </ConfirmButton>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
};

export default StatAdjustmentModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  position: relative;
  background: white;
  border-radius: 14px;
  width: 92vw;
  max-width: 500px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
  box-sizing: border-box;
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 10px;
  border-bottom: 1px solid #f1f3f5;
  background: #ffffff;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  color: #222;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.25rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    color: #333;
    background: #f0f0f0;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ced4da;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #adb5bd;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
`;

const SectionTitle = styled.span`
  font-size: 0.85rem;
  font-weight: bold;
  color: #444;
`;

const NatureSection = styled.div`
  background: #fdfdfd;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 8px 10px 9px;
  text-align: left;
`;

const CurrentNatureBadge = styled.span`
  font-size: 0.78rem;
  font-weight: bold;
  color: ${({ $isError }) => ($isError ? "#c92a2a" : "#2b8a3e")};
  background: ${({ $isError }) => ($isError ? "#fff5f5" : "#ebfbee")};
  padding: 3px 9px;
  border-radius: 12px;
  border: 1px solid ${({ $isError }) => ($isError ? "#ffc9c9" : "#d3f9d8")};
  transition: all 0.2s ease;
`;

const NatureRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 6px;
`;

const NatureRowLabel = styled.span`
  font-size: 0.74rem;
  font-weight: bold;
  color: ${({ $type }) => ($type === "up" ? "#d9480f" : "#1971c2")};
  white-space: nowrap;
  flex-shrink: 0;

  @media (max-width: 480px) {
    font-size: 0.68rem;
  }
`;

const NatureButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 3px;
  flex: 1;
  flex-wrap: nowrap;
`;

const NatureSelectBtn = styled.button`
  padding: 3px 7px;
  font-size: 0.71rem;
  border-radius: 5px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  border: 1px solid ${({ $isSelected, $type }) => ($isSelected ? ($type === "up" ? "#ff8787" : "#74c0fc") : "#dee2e6")};
  background: ${({ $isSelected, $type }) => ($isSelected ? ($type === "up" ? "#ffe3e3" : "#e7f5ff") : "#ffffff")};
  color: ${({ $isSelected, $type }) => ($isSelected ? ($type === "up" ? "#c92a2a" : "#1864ab") : "#495057")};
  font-weight: ${({ $isSelected }) => ($isSelected ? "bold" : "normal")};

  @media (max-width: 480px) {
    padding: 2px 4px;
    font-size: 0.65rem;
  }

  &:hover {
    background: ${({ $isSelected, $type }) => ($isSelected ? ($type === "up" ? "#ffc9c9" : "#d0ebff") : "#f1f3f5")};
  }
`;

const GachaSection = styled.div`
  background: #fdfdfd;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 7px 10px 8px;
  text-align: left;
`;

const GachaButtonGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 4px;
`;

const GachaBtn = styled.button`
  padding: 6px 0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: bold;
  transition: all 0.15s ease;
  text-align: center;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? "#339af0" : "#dee2e6")};
  background: ${({ $isSelected }) => ($isSelected ? "#e7f5ff" : "#ffffff")};
  color: ${({ $isSelected }) => ($isSelected ? "#1864ab" : "#495057")};

  &:hover {
    background: ${({ $isSelected }) => ($isSelected ? "#d0ebff" : "#f8f9fa")};
  }
`;

const GachaDescBox = styled.div`
  margin-top: 6px;
  padding: 6px 10px;
  background: #f8f9fa;
  border-left: 3px solid #339af0;
  border-radius: 4px;
  font-size: 0.74rem;
  color: #495057;
  line-height: 1.4;
`;

const EvSummaryBox = styled.div`
  background: ${({ $isOver }) => ($isOver ? "#fff5f5" : "#f8f9fa")};
  border: 1px solid ${({ $isOver }) => ($isOver ? "#ffc9c9" : "#e9ecef")};
  border-radius: 8px;
  padding: 7px 10px;
  transition: all 0.2s ease;
`;

const EvSummaryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.82rem;
  margin-bottom: 5px;
`;

const RemainingText = styled.span`
  font-size: 0.75rem;
  font-weight: bold;
  color: ${({ $isOver, $isFull }) => ($isOver ? "#d32f2f" : $isFull ? "#388e3c" : "#1976d2")};
`;

const EvProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
`;

const EvProgressFill = styled.div`
  height: 100%;
  width: ${({ $percent }) => $percent}%;
  background: ${({ $isOver }) => ($isOver ? "#f44336" : "#4caf50")};
  transition: width 0.2s ease;
`;

const PresetSection = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const PresetBtn = styled.button`
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 12px;
  padding: 3px 8px;
  font-size: 0.7rem;
  color: #495057;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #e8f5e9;
    border-color: #4caf50;
    color: #2e7d32;
  }
`;

const StatsListArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const StatRowCard = styled.div`
  display: flex;
  align-items: center;
  padding: 5px 8px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 7px;
  box-sizing: border-box;
`;

const StatLabelCol = styled.div`
  flex: 0 0 78px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 420px) {
    flex: 0 0 68px;
  }
`;

const StatNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const StatName = styled.span`
  font-size: 0.8rem;
  font-weight: bold;
  color: #333;
`;

const NatureModifier = styled.span`
  font-size: 0.68rem;
  font-weight: bold;
  color: ${({ $type }) => ($type === "up" ? "#d32f2f" : "#1971c2")};
`;

const StatBaseText = styled.span`
  font-size: 0.58rem;
  color: #888;
  white-space: nowrap;
`;

const EvControlCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-width: 0;

  @media (max-width: 420px) {
    gap: 3px;
  }
`;

const EvInput = styled.input`
  width: 44px;
  height: 30px;
  margin: 0 4px;
  padding: 0 2px;
  border: 1px solid ${({ $isMax }) => ($isMax ? "#ff8787" : "#ced4da")};
  border-radius: 5px;
  font-size: 0.85rem;
  font-weight: bold;
  text-align: center;
  color: ${({ $isMax }) => ($isMax ? "#e03131" : "#2e7d32")};
  background: ${({ $isMax }) => ($isMax ? "#fff5f5" : "#ffffff")};
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:focus {
    border-color: ${({ $isMax }) => ($isMax ? "#fa5252" : "#4caf50")};
    box-shadow: 0 0 0 2px ${({ $isMax }) => ($isMax ? "rgba(250, 82, 82, 0.2)" : "rgba(76, 175, 80, 0.2)")};
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;

  @media (max-width: 420px) {
    width: 38px;
    height: 27px;
    margin: 0 4px;
    font-size: 0.78rem;
    padding: 0 1px;
  }
`;

const StepBtn = styled.button`
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 5px;
  padding: 3px 6px;
  min-width: 29px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 500;
  color: #495057;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &:hover {
    background: #f0f0f0;
    border-color: #adb5bd;
  }

  @media (max-width: 420px) {
    padding: 2px 4px;
    font-size: 0.7rem;
    min-width: 24px;
    height: 27px;
  }
`;

const FinalStatCol = styled.div`
  flex: 0 0 44px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: 2px;
  margin-left: 4px;
`;

const FinalStatLabel = styled.span`
  font-size: 0.6rem;
  color: #888;
`;

const FinalStatVal = styled.span`
  font-size: 0.92rem;
  font-weight: bold;
  color: ${({ $isUp, $isDown }) => ($isUp ? "#c62828" : $isDown ? "#1565c0" : "#222")};
`;

const ModalFooter = styled.div`
  padding: 10px 14px;
  background: #ffffff;
  border-top: 1px solid #f1f3f5;
  box-sizing: border-box;
  flex-shrink: 0;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 9px 0;
  font-size: 0.95rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  background: ${({ $disabled }) => ($disabled ? "#ced4da" : "#4caf50")};
  color: ${({ $disabled }) => ($disabled ? "#868e96" : "white")};
  transition: all 0.2s;

  ${({ $disabled }) =>
    !$disabled &&
    `
    &:hover {
      background: #43a047;
      box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);
    }
  `}
`;
