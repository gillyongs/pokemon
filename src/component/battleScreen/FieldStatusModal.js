import React, { useState } from "react";
import styled from "styled-components";

const STAT_LABEL_MAP = {
  atk: "공격",
  def: "방어",
  catk: "특공",
  cdef: "특방",
  speed: "스피드",
  critical: "급소율",
};

const WEATHER_INFO = {
  쾌청: { bg: "rgba(234, 88, 12, 0.45)", border: "rgba(251, 146, 60, 0.72)", desc: "불꽃 위력 1.5배 · 물 위력 0.5배 · 얼음 상태이상 면역" },
  큰가뭄: { bg: "rgba(220, 38, 38, 0.52)", border: "rgba(249, 115, 22, 0.78)", desc: "불꽃 위력 1.5배 · 물 타입 공격 무효 (끝의대지 유지)" },
  비: { bg: "rgba(14, 165, 233, 0.45)", border: "rgba(56, 189, 248, 0.72)", desc: "물 위력 1.5배 · 불꽃 위력 0.5배 · 번개/폭풍 필중" },
  폭우: { bg: "rgba(2, 132, 199, 0.52)", border: "rgba(14, 165, 233, 0.8)", desc: "물 위력 1.5배 · 불꽃 타입 공격 무효 (시작의바다 유지)" },
  모래바람: { bg: "rgba(180, 115, 25, 0.48)", border: "rgba(217, 119, 6, 0.75)", desc: "바위 특방 1.5배 · 매 턴 바위/땅/강철 외 1/16 피해" },
  설경: { bg: "rgba(56, 189, 248, 0.38)", border: "rgba(125, 211, 252, 0.72)", desc: "얼음 방어 1.5배 · 눈보라 필중 · 오로라베일 사용 가능" },
  난기류: { bg: "rgba(16, 185, 129, 0.42)", border: "rgba(110, 231, 183, 0.72)", desc: "비행 타입의 약점이 되는 공격을 등배로 경감 (델타스트림 유지)" },
};

const TERRAIN_INFO = {
  그래스필드: { bg: "rgba(22, 163, 74, 0.45)", border: "rgba(74, 222, 128, 0.72)", desc: "지면 풀 위력 1.3배 · 매 턴 1/16 회복 · 지진 위력 반감" },
  일렉트릭필드: { bg: "rgba(202, 138, 4, 0.48)", border: "rgba(250, 204, 21, 0.75)", desc: "지면 전기 위력 1.3배 · 잠듦 면역 · 쿼크차지/하드론엔진 발동" },
  미스트필드: { bg: "rgba(219, 39, 119, 0.45)", border: "rgba(244, 114, 182, 0.72)", desc: "지면 포켓몬 상태이상 면역 · 드래곤 기술 피해 반감" },
  사이코필드: { bg: "rgba(147, 51, 234, 0.45)", border: "rgba(192, 132, 252, 0.72)", desc: "지면 에스퍼 위력 1.3배 · 지면 포켓몬 대상 선공기 무효" },
};

const getRankDesc = (key, label, val) => {
  if (key === "critical") {
    return `${label} ${val > 0 ? `+${val}` : val}랭크: 기술의 급소 명중 확률이 상승한 상태입니다.`;
  }
  const mult = val > 0 ? ((2 + val) / 2).toFixed(2).replace(/\.00$/, "") : (2 / (2 - val)).toFixed(2);
  return `${label} ${val > 0 ? `+${val}` : val}랭크: ${label} 능력치가 기본의 ${mult}배인 상태입니다.`;
};

const extractSideFieldEntries = (sideField) => {
  if (!sideField) return { buffs: [], hazards: [] };
  const buffs = [];
  const hazards = [];
  const nc = sideField.noClean || {};

  if (nc.reflect != null) {
    buffs.push({
      name: "리플렉터",
      badge: `${nc.reflect}턴`,
      desc: `물리 공격으로 받는 피해를 경감합니다. (남은 턴: ${nc.reflect}턴)`,
      tone: "reflect",
    });
  }
  if (nc.lightScreen != null) {
    buffs.push({
      name: "빛의장막",
      badge: `${nc.lightScreen}턴`,
      desc: `특수 공격으로 받는 피해를 경감합니다. (남은 턴: ${nc.lightScreen}턴)`,
      tone: "lightScreen",
    });
  }
  if (nc.auroraVeil != null) {
    buffs.push({
      name: "오로라베일",
      badge: `${nc.auroraVeil}턴`,
      desc: `물리 및 특수 공격으로 받는 피해를 경감합니다. (남은 턴: ${nc.auroraVeil}턴)`,
      tone: "auroraVeil",
    });
  }
  if (nc.tailwind != null) {
    buffs.push({
      name: "순풍",
      badge: `${nc.tailwind}턴`,
      desc: `해당 진영 포켓몬의 스피드가 2배가 됩니다. (남은 턴: ${nc.tailwind}턴)`,
      tone: "tailwind",
    });
  }
  if (nc.wish != null) {
    const remainText = nc.wish.turnRemain === 0 ? "이번 턴 종료 시" : "다음 턴 종료 시";
    buffs.push({
      name: "희망사항",
      badge: nc.wish.turnRemain === 0 ? "이번 턴" : "다음 턴",
      desc: `${remainText} 필드에 있는 포켓몬의 체력을 ${Math.floor(nc.wish.amount || 0)}만큼 회복합니다. (시전자: ${nc.wish.name})`,
      tone: "heal",
    });
  }
  if (nc.healingWish) {
    buffs.push({
      name: "치유소원",
      badge: null,
      desc: "다음에 교체로 등장하는 포켓몬의 HP와 상태이상을 모두 회복합니다.",
      tone: "heal",
    });
  }
  if (nc.lunarDance) {
    buffs.push({
      name: "초승달춤",
      badge: null,
      desc: "다음에 교체로 등장하는 포켓몬의 HP, PP, 상태이상을 모두 회복합니다.",
      tone: "heal",
    });
  }

  if (sideField.sRock) {
    hazards.push({
      name: "스텔스록",
      badge: null,
      desc: "교체로 등장하는 포켓몬에게 바위 타입 상성에 비례한(1/32 ~ 1/2) 피해를 입힙니다.",
      tone: "sRock",
    });
  }
  if (sideField.spikes) {
    const ratio = sideField.spikes === 1 ? "1/8" : sideField.spikes === 2 ? "1/6" : "1/4";
    hazards.push({
      name: "압정뿌리기",
      badge: `${sideField.spikes}회`,
      desc: `교체로 등장하는 지면 포켓몬에게 최대 HP의 ${ratio}만큼 피해를 입힙니다. (${sideField.spikes}회)`,
      tone: "spikes",
    });
  }
  if (sideField.poisonSpikes) {
    const isToxic = sideField.poisonSpikes >= 2;
    const pType = isToxic ? "맹독" : "독";
    hazards.push({
      name: isToxic ? "맹독압정" : "독압정",
      badge: null,
      desc: `교체로 등장하는 지면 포켓몬을 ${pType} 상태로 만듭니다. 독 타입 지면 포켓몬이 등장하면 제거됩니다.`,
      tone: isToxic ? "mpoison" : "poison",
    });
  }
  if (sideField.stickyWeb) {
    hazards.push({
      name: "끈적끈적네트",
      badge: null,
      desc: "교체로 등장하는 지면 포켓몬의 스피드를 1랭크 떨어뜨립니다.",
      tone: "stickyWeb",
    });
  }

  return { buffs, hazards };
};

const extractPokemonStatuses = (pokemon, isNpc = false) => {
  if (!pokemon) return { ranks: [], effects: [] };
  const isOpponent = Boolean(isNpc || pokemon.team === "npc");
  const ranks = [];
  const effects = [];

  const rankObj = pokemon.tempStatus?.rank || {};
  Object.entries(STAT_LABEL_MAP).forEach(([key, label]) => {
    const val = Number(rankObj[key] || 0);
    if (val !== 0) {
      ranks.push({
        key,
        label,
        val,
        desc: getRankDesc(key, label, val),
      });
    }
  });

  const ts = pokemon.tempStatus || {};
  const hasAugment = (augId) => Boolean(pokemon.hasAugment?.(augId) || pokemon.augments?.some((a) => (typeof a === "string" ? a : a?.id) === augId));

  if (ts.dynamax > 0) {
    effects.push({
      name: "다이맥스",
      badge: `${ts.dynamax}턴`,
      desc: `최대 HP가 2배로 증가하고 공격 기술이 다이기술로 강화되었습니다. (남은 턴: ${ts.dynamax}턴)`,
      tone: "positive",
    });
  }
  if (ts.substitute) {
    effects.push({
      name: "대타출동",
      badge: null,
      desc: "분신이 본체 대신 공격과 상태변화를 받아냅니다.",
      tone: "positive",
    });
  }
  if (ts.seed) {
    effects.push({
      name: "씨뿌리기",
      badge: null,
      desc: "매 턴 종료 시 최대 HP의 1/8을 빼앗겨 상대 포켓몬의 체력을 회복시킵니다.",
      tone: "negative",
    });
  }
  if (ts.confuse != null) {
    effects.push({
      name: "혼란",
      badge: null,
      desc: "행동 시 33% 확률로 자신을 공격합니다.",
      tone: "negative",
    });
  }
  if (ts.hapum != null) {
    const remainText = ts.hapum === 1 ? "이번 턴 종료 시" : "다음 턴 종료 시";
    effects.push({
      name: "하품",
      badge: null,
      desc: `졸음이 쏟아져 ${remainText} 잠듦 상태에 빠집니다. 교체하면 해제됩니다.`,
      tone: "negative",
    });
  }
  if (ts.taunt != null) {
    effects.push({
      name: "도발",
      badge: `${ts.taunt}턴`,
      desc: `공격 기술만 사용할 수 있으며 변화 기술을 사용할 수 없습니다. (남은 턴: ${ts.taunt}턴)`,
      tone: "negative",
    });
  }
  if (ts.disable) {
    effects.push({
      name: "기술 봉인",
      badge: ts.disableTurnRemain != null ? `${ts.disableTurnRemain}턴` : null,
      desc: `'${ts.disable}' 기술이 봉인되어 사용할 수 없습니다.${ts.disableTurnRemain != null ? ` (남은 턴: ${ts.disableTurnRemain}턴)` : ""}`,
      tone: "negative",
    });
  }
  if (ts.healBlock != null) {
    effects.push({
      name: "회복봉인",
      badge: `${ts.healBlock}턴`,
      desc: `체력을 회복하는 기술이나 효과를 받을 수 없습니다. (남은 턴: ${ts.healBlock}턴)`,
      tone: "negative",
    });
  }
  if (ts.noSound != null) {
    effects.push({
      name: "소리 기술 봉인",
      badge: `${ts.noSound}턴`,
      desc: `지옥찌르기 효과로 소리 분류의 기술을 사용할 수 없습니다. (남은 턴: ${ts.noSound}턴)`,
      tone: "negative",
    });
  }
  if (ts.switchLock != null) {
    effects.push({
      name: "구속",
      badge: null,
      desc: `'${ts.switchLock}'에 묶여 매 턴 최대 HP의 1/8 피해를 입으며 교체할 수 없습니다.`,
      tone: "negative",
    });
  }
  if (ts.destinyBond) {
    effects.push({
      name: "길동무",
      badge: null,
      desc: "다음 행동 전까지 상대의 공격으로 기절하면 공격한 상대도 함께 기절시킵니다.",
      tone: "warning",
    });
  }
  if (ts.glaiveRush) {
    effects.push({
      name: "대검돌격",
      badge: null,
      desc: "다음 행동 전까지 상대의 공격이 반드시 명중하며 받는 피해가 2배가 됩니다.",
      tone: "negative",
    });
  }
  if (ts.soak) {
    effects.push({
      name: "물붓기",
      badge: null,
      desc: "물붓기 효과로 인해 단일 물 타입으로 변한 상태입니다.",
      tone: "water",
    });
  }
  if (pokemon.item === "풍선") {
    effects.push({
      name: "풍선",
      badge: null,
      desc: "공중에 떠 있어 땅 타입 기술과 지면 장판 효과를 받지 않습니다. 공격을 받으면 터집니다.",
      tone: "positive",
    });
  }
  if (ts.protosynthesis) {
    const statLabel = STAT_LABEL_MAP[ts.protosynthesis] || ts.protosynthesis;
    effects.push({
      name: "고대활성",
      badge: statLabel,
      desc: `가장 높은 능력치(${statLabel})가 강화된 상태입니다.`,
      tone: "positive",
    });
  }
  if (ts.quarkDrive) {
    const statLabel = STAT_LABEL_MAP[ts.quarkDrive] || ts.quarkDrive;
    effects.push({
      name: "쿼크차지",
      badge: statLabel,
      desc: `가장 높은 능력치(${statLabel})가 강화된 상태입니다.`,
      tone: "positive",
    });
  }
  if (ts.flashFire) {
    effects.push({
      name: "타오르는불꽃",
      badge: null,
      desc: "불꽃 타입 기술을 받아 자신이 사용하는 불꽃 타입 기술의 위력이 1.5배로 증가했습니다.",
      tone: "positive",
    });
  }
  if (!isOpponent && ts.unburden) {
    effects.push({
      name: "곡예",
      badge: null,
      desc: "지닌 도구를 소모하거나 잃어 스피드가 2배로 증가했습니다.",
      tone: "positive",
    });
  }
  if (!isOpponent && ts.sameSkillName && ts.sameSkillCount > 0 && pokemon.item === "메트로놈") {
    effects.push({
      name: "메트로놈",
      badge: `${ts.sameSkillCount}연속`,
      desc: `'${ts.sameSkillName}' 기술을 연속 사용하여 위력이 증가했습니다. (${ts.sameSkillCount}회 연속)`,
      tone: "positive",
    });
  }
  if (ts.rampagingPower) {
    effects.push({
      name: "폭주하는 힘",
      badge: null,
      desc: "적을 쓰러뜨려 다음 턴까지 모든 능력치가 1.5배로 증가했습니다.",
      tone: "positive",
    });
  }
  if (ts.restAndStrikeReady && hasAugment("restAndStrike")) {
    effects.push({
      name: "쉬었다 때리기",
      badge: null,
      desc: "이전 턴 공격하지 않아 이번 턴 공격 기술의 데미지가 1.5배로 증가합니다.",
      tone: "positive",
    });
  }
  if (ts.armorBreak > 0) {
    effects.push({
      name: "방어구 부수기",
      badge: `${ts.armorBreak}중첩`,
      desc: `피격 누적으로 방어와 특수방어가 약화된 상태입니다. (${ts.armorBreak}중첩)`,
      tone: "negative",
    });
  }
  if (ts.trishulaFrost > 0) {
    effects.push({
      name: "서리",
      badge: `${ts.trishulaFrost}/3`,
      desc: `빙룡창 트리슈라 서리가 ${ts.trishulaFrost}중첩 쌓였습니다. 3중첩 시 빙결됩니다.`,
      tone: "frost",
    });
  }
  if (pokemon.turn?.roost) {
    effects.push({
      name: "날개쉬기",
      badge: null,
      desc: "이번 턴 동안 비행 타입을 상실하여 지면 판정이 됩니다.",
      tone: "neutral",
    });
  }

  const TONE_PRIORITY = {
    positive: 0,
    warning: 1,
    water: 2,
    neutral: 2,
    negative: 3,
    frost: 3,
  };

  ranks.sort((a, b) => (a.val > 0 === b.val > 0 ? 0 : a.val > 0 ? -1 : 1));
  effects.sort((a, b) => (TONE_PRIORITY[a.tone] ?? 9) - (TONE_PRIORITY[b.tone] ?? 9));

  return { ranks, effects };
};

export const hasAnyFieldOrStatusActive = (battle) => {
  if (!battle?.field) return false;
  const weatherType = battle.field.weather?.type ?? battle.field.weather?._type ?? null;
  const terrainType = battle.field.terrain?.type ?? battle.field.terrain?.get?.() ?? null;
  const trickRoom = battle.field.room?.trickRoom ?? battle.field.room?._trickRoom ?? null;
  if (weatherType || terrainType || trickRoom != null) return true;

  const pSide = extractSideFieldEntries(battle.field.player);
  const nSide = extractSideFieldEntries(battle.field.npc);
  if (pSide.buffs.length > 0 || pSide.hazards.length > 0 || nSide.buffs.length > 0 || nSide.hazards.length > 0) {
    return true;
  }

  const pStat = extractPokemonStatuses(battle.player);
  const nStat = extractPokemonStatuses(battle.npc);
  return pStat.ranks.length > 0 || pStat.effects.length > 0 || nStat.ranks.length > 0 || nStat.effects.length > 0;
};

const FieldStatusModal = ({ battle, onClose }) => {
  const [selectedInfo, setSelectedInfo] = useState(null);

  if (!battle) return null;

  const weatherObj = battle.field?.weather;
  const terrainObj = battle.field?.terrain;
  const roomObj = battle.field?.room;

  const weatherType = weatherObj?.type ?? weatherObj?._type ?? null;
  const weatherTurn = weatherObj?.turnRemain ?? weatherObj?._turnRemain ?? null;
  const noWeatherAbils = ["에어록", "날씨부정"];
  const suppressAbil = (!battle.player?.faint && noWeatherAbils.includes(battle.player?.abil?.name) && battle.player.abil.name) || (!battle.npc?.faint && noWeatherAbils.includes(battle.npc?.abil?.name) && battle.npc.abil.name) || null;
  const isWeatherSuppressed = Boolean(suppressAbil);
  const weatherMeta = weatherType ? WEATHER_INFO[weatherType] : null;

  const terrainType = terrainObj?.type ?? terrainObj?.get?.() ?? null;
  const terrainTurn = terrainObj?.turnRemain ?? terrainObj?._turnRemain ?? null;
  const terrainMeta = terrainType ? TERRAIN_INFO[terrainType] : null;

  const trickRoomTurn = roomObj?.trickRoom ?? roomObj?._trickRoom ?? null;

  const playerSide = extractSideFieldEntries(battle.field?.player);
  const npcSide = extractSideFieldEntries(battle.field?.npc);

  const handleSelect = (id, title, desc) => {
    setSelectedInfo((prev) => (prev?.id === id ? null : { id, title, desc }));
  };

  const renderFieldSideSection = (sideData, title, isNpc, sideKey) => {
    const { buffs, hazards } = sideData;
    const allItems = [...buffs, ...hazards];

    return (
      <FieldSideBox $isNpc={isNpc}>
        <FieldSideHeader>
          <SideTitleBadge $isNpc={isNpc}>{title}</SideTitleBadge>
        </FieldSideHeader>
        {allItems.length === 0 ? (
          <EmptyHint>{""}</EmptyHint>
        ) : (
          <EffectList>
            {allItems.map((item, i) => {
              const itemId = `field-${sideKey}-${item.name}-${i}`;
              const isSelected = selectedInfo?.id === itemId;
              return (
                <EffectItem key={itemId} $tone={item.tone} $selected={isSelected} onClick={() => handleSelect(itemId, item.name, item.desc)}>
                  <EffectName $tone={item.tone}>{item.name}</EffectName>
                  {item.badge && <EffectDetail $tone={item.tone}>{item.badge}</EffectDetail>}
                </EffectItem>
              );
            })}
          </EffectList>
        )}
      </FieldSideBox>
    );
  };

  const renderPokemonSection = (pokemon, sideTitle, isNpc, sideKey) => {
    if (!pokemon) return null;
    const { ranks, effects } = extractPokemonStatuses(pokemon, isNpc);
    const pokeImgId = pokemon.img_id || pokemon.uniqueKey;

    return (
      <SideCard $isNpc={isNpc}>
        <SideHeader>
          <SideTitleBadge $isNpc={isNpc}>{sideTitle}</SideTitleBadge>
        </SideHeader>

        <PokeHeaderRow>
          <PokeAvatar src={`/pokemon/img/pokemon/${pokeImgId}.webp`} alt={pokemon.baseName} />
          <PokeMetaCol>
            <PokeNameRow>
              <PokeName>{pokemon.baseName}</PokeName>
            </PokeNameRow>
          </PokeMetaCol>
        </PokeHeaderRow>

        <StatusGroup>
          <GroupLabel>랭크 변화</GroupLabel>
          {ranks.length === 0 ? (
            <EmptyHint>{""}</EmptyHint>
          ) : (
            <ChipWrap>
              {ranks.map((r) => {
                const chipId = `rank-${sideKey}-${r.key}`;
                const isSelected = selectedInfo?.id === chipId;
                const titleText = `${pokemon.baseName} · ${r.label} ${r.val > 0 ? `+${r.val}` : r.val}`;
                return (
                  <RankChip key={r.key} $positive={r.val > 0} $selected={isSelected} onClick={() => handleSelect(chipId, titleText, r.desc)}>
                    {r.label} {r.val > 0 ? `+${r.val}` : r.val}
                  </RankChip>
                );
              })}
            </ChipWrap>
          )}
        </StatusGroup>

        <StatusGroup>
          <GroupLabel>상태 변화</GroupLabel>
          {effects.length === 0 ? (
            <EmptyHint>{""}</EmptyHint>
          ) : (
            <EffectList>
              {effects.map((ef, idx) => {
                const efId = `effect-${sideKey}-${ef.name}-${idx}`;
                const isSelected = selectedInfo?.id === efId;
                const titleText = `${pokemon.baseName} · ${ef.name}`;
                return (
                  <EffectItem key={efId} $tone={ef.tone} $selected={isSelected} onClick={() => handleSelect(efId, titleText, ef.desc)}>
                    <EffectName>{ef.name}</EffectName>
                    {ef.badge && <EffectDetail $tone={ef.tone}>{ef.badge}</EffectDetail>}
                  </EffectItem>
                );
              })}
            </EffectList>
          )}
        </StatusGroup>
      </SideCard>
    );
  };

  const hasGlobalActive = Boolean(weatherType || terrainType || trickRoomTurn != null);

  return (
    <ModalBackground onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <HeaderRow>
          <Title>필드 정보</Title>
          <TurnPill>{battle.turnCount || 1}번째 턴</TurnPill>
        </HeaderRow>

        <ScrollBody>
          <GlobalGrid>
            <GlobalCard
              $active={Boolean(weatherType || isWeatherSuppressed)}
              $suppressed={isWeatherSuppressed}
              $bg={weatherMeta?.bg}
              $border={weatherMeta?.border}
              $selected={selectedInfo?.id === "global-weather"}
              onClick={() => {
                if (!weatherType && !isWeatherSuppressed) return;
                const turnSuffix = weatherTurn != null ? ` (남은 턴: ${weatherTurn}턴)` : weatherType ? " (특성 유지)" : "";
                const descText = isWeatherSuppressed ? `특성 '${suppressAbil}'으로 인해 모든 날씨 효과가 무효화되어 있습니다.${weatherType ? `${turnSuffix}` : ""}` : `${weatherMeta?.desc || ""}${turnSuffix}`;
                const titleLabel = [weatherType, suppressAbil ? `(${suppressAbil})` : ""].filter(Boolean).join(" ");
                handleSelect("global-weather", `날씨 · ${titleLabel}`, descText);
              }}
            >
              <GlobalHeader>
                <GlobalCategory $active={Boolean(weatherType || isWeatherSuppressed)}>날씨</GlobalCategory>
                {weatherType && <TurnTag>{weatherTurn != null ? `${weatherTurn}턴` : "특성"}</TurnTag>}
              </GlobalHeader>
              <GlobalValue $active={Boolean(weatherType)} $suppressed={isWeatherSuppressed}>
                {[weatherType, suppressAbil ? `(${suppressAbil})` : ""].filter(Boolean).join(" ")}
              </GlobalValue>
            </GlobalCard>

            <GlobalCard
              $active={Boolean(terrainType)}
              $bg={terrainMeta?.bg}
              $border={terrainMeta?.border}
              $selected={selectedInfo?.id === "global-terrain"}
              onClick={() => {
                if (!terrainType) return;
                const turnSuffix = terrainTurn != null ? ` (남은 턴: ${terrainTurn}턴)` : "";
                handleSelect("global-terrain", `필드 · ${terrainType}`, `${terrainMeta?.desc || ""}${turnSuffix}`);
              }}
            >
              <GlobalHeader>
                <GlobalCategory $active={Boolean(terrainType)}>필드</GlobalCategory>
                {terrainType && <TurnTag>{terrainTurn != null ? `${terrainTurn}턴` : "활성"}</TurnTag>}
              </GlobalHeader>
              <GlobalValue $active={Boolean(terrainType)}>{terrainType || ""}</GlobalValue>
            </GlobalCard>

            <GlobalCard
              $active={trickRoomTurn != null}
              $bg="rgba(147, 51, 234, 0.45)"
              $border="rgba(192, 132, 252, 0.72)"
              $selected={selectedInfo?.id === "global-room"}
              onClick={() => {
                if (trickRoomTurn == null) return;
                handleSelect("global-room", "공간 · 트릭룸", `스피드가 느린 포켓몬부터 먼저 행동합니다. (남은 턴: ${trickRoomTurn}턴)`);
              }}
            >
              <GlobalHeader>
                <GlobalCategory $active={trickRoomTurn != null}>공간</GlobalCategory>
                {trickRoomTurn != null && <TurnTag>{trickRoomTurn}턴</TurnTag>}
              </GlobalHeader>
              <GlobalValue $active={trickRoomTurn != null}>{trickRoomTurn != null ? "트릭룸" : ""}</GlobalValue>
            </GlobalCard>
          </GlobalGrid>

          <SplitGrid>
            {renderFieldSideSection(playerSide, "아군 필드", false, "player")}
            {renderFieldSideSection(npcSide, "상대 필드", true, "npc")}
          </SplitGrid>

          <PokeSplitGrid>
            {renderPokemonSection(battle.player, "아군 포켓몬", false, "player")}
            {renderPokemonSection(battle.npc, "상대 포켓몬", true, "npc")}
          </PokeSplitGrid>
        </ScrollBody>

        <DescBox $hasContent={Boolean(selectedInfo)}>
          {selectedInfo ? (
            <>
              <DescTitle>{selectedInfo.title}</DescTitle>
              <DescText>{selectedInfo.desc}</DescText>
            </>
          ) : (
            <DescPlaceholder>항목을 클릭하면 상세 설명이 표시됩니다.</DescPlaceholder>
          )}
        </DescBox>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </ModalBackground>
  );
};

export default FieldStatusModal;

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  width: 94vw;
  max-width: 500px;
  max-height: 84vh;
  padding: 18px 14px 16px;
  border-radius: 14px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.85);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  margin: 0;
  font-weight: bold;
  color: #64ffda;
  letter-spacing: 0.5px;
`;

const TurnPill = styled.span`
  background: rgba(100, 255, 218, 0.14);
  border: 1px solid rgba(100, 255, 218, 0.4);
  color: #64ffda;
  font-size: 0.78rem;
  font-weight: bold;
  padding: 3px 10px;
  border-radius: 999px;
`;

const ScrollBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 10px;
  }
`;

const GlobalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const GlobalCard = styled.div`
  background: ${({ $active, $suppressed, $bg }) => ($suppressed ? "rgba(100, 116, 139, 0.45)" : $active ? $bg || "rgba(22, 34, 48, 0.92)" : "rgba(0, 0, 0, 0.42)")};
  border: 1px solid ${({ $active, $suppressed, $border, $selected }) => ($selected ? "#64ffda" : $suppressed ? "rgba(148, 163, 184, 0.65)" : $active ? $border || "rgba(100, 255, 218, 0.35)" : "rgba(255, 255, 255, 0.08)")};
  box-shadow: ${({ $selected }) => ($selected ? "0 0 8px rgba(100, 255, 218, 0.4)" : "none")};
  border-radius: 8px;
  padding: 8px 9px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: ${({ $active }) => ($active ? "pointer" : "default")};
  user-select: none;
  min-width: 0;
`;

const GlobalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
`;

const GlobalCategory = styled.span`
  font-size: 0.72rem;
  color: ${({ $active }) => ($active ? "rgba(255, 255, 255, 0.85)" : "#94a3b8")};
`;

const TurnTag = styled.span`
  font-size: 0.68rem;
  font-weight: bold;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.45);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  white-space: nowrap;
`;

const GlobalValue = styled.div`
  min-height: 18px;
  font-size: ${({ $active, $suppressed }) => ($suppressed ? "0.76rem" : $active ? "0.86rem" : "0.75rem")};
  font-weight: ${({ $active, $suppressed }) => ($active || $suppressed ? "bold" : "normal")};
  color: ${({ $active, $suppressed }) => ($active || $suppressed ? "#ffffff" : "#64748b")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const PokeSplitGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 8px;
`;

const FieldSideBox = styled.div`
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
`;

const FieldSideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SideCard = styled.div`
  background: rgba(0, 0, 0, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 9px 10px;
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid;
  row-gap: 8px;
  min-width: 0;
`;

const SideHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SideTitleBadge = styled.span`
  font-size: 0.75rem;
  font-weight: bold;
  color: ${({ $isNpc }) => ($isNpc ? "#fca5a5" : "#7dd3fc")};
  background: ${({ $isNpc }) => ($isNpc ? "rgba(239, 68, 68, 0.15)" : "rgba(56, 189, 248, 0.15)")};
  padding: 2px 7px;
  border-radius: 4px;
`;

const PokeHeaderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PokeAvatar = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 7px;
  padding: 2px;
  flex-shrink: 0;
`;

const PokeMetaCol = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PokeNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PokeName = styled.span`
  font-size: 0.88rem;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const GroupLabel = styled.div`
  font-size: 0.7rem;
  color: #94a3b8;
`;

const EmptyHint = styled.div`
  min-height: 24px;
  font-size: 0.75rem;
  color: #64748b;
`;

const ChipWrap = styled.div`
  min-height: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  align-content: flex-start;
  gap: 4px;
`;

const RankChip = styled.span`
  font-size: 0.72rem;
  font-weight: bold;
  padding: 3px 7px;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  background: ${({ $positive }) => ($positive ? "rgba(22, 163, 74, 0.45)" : "rgba(220, 38, 38, 0.45)")};
  border: 1px solid ${({ $positive, $selected }) => ($selected ? "#64ffda" : $positive ? "rgba(74, 222, 128, 0.7)" : "rgba(248, 113, 113, 0.7)")};
  color: #ffffff;
  box-shadow: ${({ $selected }) => ($selected ? "0 0 8px rgba(100, 255, 218, 0.45)" : "none")};
`;

const EffectList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const getToneColors = (tone) => {
  switch (tone) {
    case "sRock":
      return { bg: "rgba(180, 130, 60, 0.48)", border: "rgba(214, 174, 102, 0.72)" };
    case "spikes":
      return { bg: "rgba(100, 116, 139, 0.48)", border: "rgba(148, 163, 184, 0.72)" };
    case "poison":
      return { bg: "rgba(147, 51, 234, 0.45)", border: "rgba(192, 132, 252, 0.72)" };
    case "mpoison":
      return { bg: "rgba(107, 33, 168, 0.62)", border: "rgba(192, 38, 211, 0.8)" };
    case "stickyWeb":
      return { bg: "rgba(101, 163, 13, 0.45)", border: "rgba(163, 230, 53, 0.72)" };
    case "reflect":
    case "lightScreen":
      return { bg: "rgba(219, 39, 119, 0.45)", border: "rgba(244, 114, 182, 0.72)" };
    case "auroraVeil":
    case "frost":
      return { bg: "rgba(56, 189, 248, 0.42)", border: "rgba(125, 211, 252, 0.75)" };
    case "tailwind":
    case "water":
      return { bg: "rgba(37, 99, 235, 0.48)", border: "rgba(96, 165, 250, 0.75)" };
    case "heal":
    case "positive":
      return { bg: "rgba(16, 185, 129, 0.4)", border: "rgba(52, 211, 153, 0.68)" };
    case "buff":
      return { bg: "rgba(14, 165, 233, 0.4)", border: "rgba(56, 189, 248, 0.68)" };
    case "hazard":
    case "negative":
      return { bg: "rgba(220, 38, 38, 0.42)", border: "rgba(248, 113, 113, 0.68)" };
    case "warning":
      return { bg: "rgba(217, 119, 6, 0.45)", border: "rgba(251, 191, 36, 0.72)" };
    default:
      return { bg: "rgba(100, 116, 139, 0.42)", border: "rgba(148, 163, 184, 0.62)" };
  }
};

const EffectItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  background: ${({ $tone }) => getToneColors($tone).bg};
  border: 1px solid ${({ $tone, $selected }) => ($selected ? "#64ffda" : getToneColors($tone).border)};
  box-shadow: ${({ $selected }) => ($selected ? "0 0 8px rgba(100, 255, 218, 0.4)" : "none")};
  transition: all 0.15s ease;
`;

const EffectName = styled.div`
  font-size: 0.78rem;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const EffectDetail = styled.span`
  font-size: 0.7rem;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  flex-shrink: 0;
`;

const DescBox = styled.div`
  margin-top: 10px;
  padding: 9px 11px;
  min-height: 48px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid ${({ $hasContent }) => ($hasContent ? "rgba(100, 255, 218, 0.4)" : "rgba(255, 255, 255, 0.1)")};
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  flex-shrink: 0;
`;

const DescTitle = styled.div`
  font-size: 0.78rem;
  font-weight: bold;
  color: #64ffda;
`;

const DescText = styled.div`
  font-size: 0.75rem;
  color: #e2e8f0;
  line-height: 1.38;
`;

const DescPlaceholder = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
`;

const CloseButton = styled.button`
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #00bfa5, #00897b);
  color: #fff;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: bold;
  font-family: "CustomFont", sans-serif;
  box-shadow: 0 4px 12px rgba(0, 191, 165, 0.3);
  flex-shrink: 0;
`;
