import { abilObject } from "../entity/Ability.js";
import { itemText } from "../entity/Item.js";
import { AUGMENT_LIST } from "../entity/Augment/AugmentData.js";

const OPPONENT_TARGET_ABILITIES = ["불꽃몸", "정전기", "철가시", "까칠한피부", "저주받은바디", "내용물분출"];

const SELF_NAMED_AUGMENT_IDS = [
  "luckyRecovery",
  "recovery",
  "limiterRemoval",
  "dragonSlayer",
  "rampagingPower",
  "nothingHappened",
  "butItRefused",
  "mandoocornEndure",
  "airmanGaTaosenai",
  "warmogsArmor",
  "giantAbsorption",
  "praiseTheSun",
  "restAndStrike",
  "leaveTheRestToYou",
];

function findAugmentByTriggerName(triggerName) {
  if (!triggerName) return null;
  const cleanTarget = triggerName.replace(/[\s!.?]/g, "");
  if (cleanTarget === "잠재능력") {
    return AUGMENT_LIST.find((a) => a.id === "cube") || { id: "cube", name: "잠재능력" };
  }
  return (
    AUGMENT_LIST.find((a) => {
      const cleanName = (a.name || "").replace(/[\s!.?]/g, "");
      const cleanShort = (a.shortName || "").replace(/[\s!.?]/g, "");
      return a.id === triggerName || a.name === triggerName || cleanName === cleanTarget || (cleanShort && cleanShort === cleanTarget);
    }) || null
  );
}

/**
 * enqueue 시점의 텍스트에서 [특성 ...], [아이템 ...], [증강 ...], [버프 ...] 접두사를 분리하고
 * 상단 좌/우 발동 배너 메타데이터(triggerBanner)를 생성합니다.
 */
export function resolveTriggerBanner(battle, rawText, id, option = {}) {
  if (typeof rawText !== "string" || !rawText.startsWith("[")) {
    return {
      text: rawText,
      logText: option.logText,
      triggerBanner: option.triggerBanner || null,
    };
  }

  const match = rawText.match(/^\[([^\]]+)\]\s*(.*)$/s);
  if (!match) {
    return {
      text: rawText,
      logText: option.logText,
      triggerBanner: option.triggerBanner || null,
    };
  }

  const tag = match[1].trim();
  const bodyText = match[2];

  let category = null;
  let triggerName = null;

  if (/^특성[:\s]+(.+)$/.test(tag)) {
    category = "ability";
    triggerName = tag.replace(/^특성[:\s]+/, "").trim();
  } else if (/^(?:아이템|도구)[:\s]+(.+)$/.test(tag)) {
    category = "item";
    triggerName = tag.replace(/^(?:아이템|도구)[:\s]+/, "").trim();
  } else if (/^(?:증강|버프|시너지|디버프|저주)[:\s]+(.+)$/.test(tag)) {
    category = "augment";
    triggerName = tag.replace(/^(?:증강|버프|시너지|디버프|저주)[:\s]+/, "").trim();
  } else if (tag === "잠재능력") {
    category = "augment";
    triggerName = "잠재능력";
  } else if (itemText[tag]) {
    category = "item";
    triggerName = tag;
  } else if (abilObject[tag]) {
    category = "ability";
    triggerName = tag;
  } else {
    // [그래스필드], [증강] 등 배틀 중 발동 배너 대상이 아닌 경우 원본 유지
    return {
      text: rawText,
      logText: option.logText,
      triggerBanner: option.triggerBanner || null,
    };
  }

  const plr = battle?.player;
  const npc = battle?.npc;
  let side = null;
  let foundAug = null;

  if (option.triggerSide === "player" || option.triggerSide === "npc") {
    side = option.triggerSide;
  } else if (option.triggerPokemon) {
    side = option.triggerPokemon.team === "npc" ? "npc" : "player";
  }

  if (category === "augment") {
    foundAug = findAugmentByTriggerName(triggerName);
  }

  if (!side) {
    if (category === "ability") {
      const matchAbil = (p) =>
        Boolean(
          p &&
            (p.abil?.name === triggerName ||
              p.originalAbil?.name === triggerName ||
              (triggerName === "혼연일체" && (p.abil?.name?.startsWith("혼연일체") || p.originalAbil?.name?.startsWith("혼연일체"))))
        );
      const plrHas = matchAbil(plr);
      const npcHas = matchAbil(npc);

      if (plrHas && !npcHas) {
        side = "player";
      } else if (npcHas && !plrHas) {
        side = "npc";
      } else if (triggerName === "독치장") {
        side = bodyText.startsWith("상대의") ? "player" : "npc";
      } else if (id === "abil_as_one_unnerve") {
        side = bodyText.startsWith("상대 ") ? "player" : "npc";
      } else if (OPPONENT_TARGET_ABILITIES.includes(triggerName) || id === "abil_intimidate_sub") {
        side = bodyText.startsWith("상대 ") ? "player" : "npc";
      } else {
        side = bodyText.startsWith("상대 ") ? "npc" : "player";
      }
    } else if (category === "item") {
      const matchItem = (p) => Boolean(p && (p.item === triggerName || p.originalItem === triggerName));
      const plrHas = matchItem(plr);
      const npcHas = matchItem(npc);

      if (plrHas && !npcHas) {
        side = "player";
      } else if (npcHas && !plrHas) {
        side = "npc";
      } else if (triggerName === "울퉁불퉁멧") {
        side = bodyText.startsWith("상대 ") ? "player" : "npc";
      } else {
        side = bodyText.startsWith("상대 ") ? "npc" : "player";
      }
    } else if (category === "augment") {
      const augId = foundAug?.id || "cube";
      const plrHas = Boolean(plr?.hasAugment?.(augId) || plr?.hasAugmentOnTeam?.(augId, battle));
      const npcHas = Boolean(npc?.hasAugment?.(augId) || npc?.hasAugmentOnTeam?.(augId, battle));

      if (plrHas && !npcHas) {
        side = "player";
      } else if (npcHas && !plrHas) {
        side = "npc";
      } else if (SELF_NAMED_AUGMENT_IDS.includes(augId)) {
        side = bodyText.startsWith("상대 ") ? "npc" : "player";
      } else {
        side = bodyText.startsWith("상대 ") ? "player" : "npc";
      }
    }
  }

  if (!side) side = "player";

  const ownerPokemon = option.triggerPokemon || (side === "npc" ? npc : plr);
  const pokemonName = ownerPokemon?.baseName || ownerPokemon?.name?.replace(/^상대\s+/, "") || "포켓몬";

  const triggerBanner = {
    side,
    category,
    pokemonName,
    name: category === "augment" ? foundAug?.shortName || foundAug?.name || triggerName : triggerName,
    pokeImgId: ownerPokemon?.img_id || ownerPokemon?.uniqueKey || "0001",
    itemName: category === "item" ? triggerName : null,
    augmentId: category === "augment" ? foundAug?.id || "cube" : null,
    shiftUp: foundAug?.shiftUp,
    imageOptions: foundAug?.imageOptions,
  };

  return {
    text: bodyText || rawText,
    logText: option.logText || rawText,
    triggerBanner,
  };
}
