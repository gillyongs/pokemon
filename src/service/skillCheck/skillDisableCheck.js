import { josa } from "josa";

// SkillButton.js에서 사용
export const getSkillUnusableReason = (pokemon, skillIndex) => {
  const skill = pokemon?.skill?.[skillIndex];
  const pp = pokemon?.pp?.[skillIndex];

  if (!skill || pp <= 0) {
    return "해당 기술은 더 이상 사용할 수 없다!";
  }

  const isDynamax = pokemon.tempStatus?.dynamax > 0;

  // 구애 시리즈 또는 무아지경으로 인해 사용 가능한 스킬이 고정된 경우 (다이맥스 중에는 무효)
  const { onlySkill } = pokemon.tempStatus || {};
  const hasUnbound = pokemon.hasAugment?.("unboundChoice");
  const isChoiceLocked = Boolean(pokemon.item?.startsWith("구애") && !hasUnbound && !isDynamax);
  const isGorillaLocked = Boolean(pokemon.abil?.name === "무아지경" && !hasUnbound && !isDynamax);
  if (onlySkill && (isChoiceLocked || isGorillaLocked) && onlySkill !== skill.name) {
    const lockSource = isGorillaLocked ? "특성 무아지경" : pokemon.item;
    return `${lockSource} 효과로 인해 해당 기술은 사용할 수 없다!`;
  }

  // 연속 사용 불가 스킬 (ex: 블러드문)
  const recentSkill = pokemon.tempStatus?.recentSkillUse?.name;
  if (recentSkill === skill.name && skill.feature?.noDouble) {
    return "해당 기술은 연속으로 사용할 수 없다!";
  }

  // 돌격조끼 입고 변화기 사용 (다이맥스 중 다이윌은 사용 가능)
  if (pokemon.item === "돌격조끼" && (skill.stype === "natk" || skill.stype === "buf") && !skill.feature?.maxGuard) {
    return `${pokemon.names("는")} 돌격조끼 때문에 변화기를 사용할 수 없다!`;
  }

  // 도발 상태에서 변화기 사용 (다이맥스 중 다이윌은 사용 가능)
  if (pokemon.tempStatus?.taunt !== null && (skill.stype === "natk" || skill.stype === "buf") && !skill.feature?.maxGuard) {
    return `${pokemon.names("는")} 도발 때문에 변화기를 사용할 수 없다!`;
  }

  // 소리기술금지 상태에서 소리 기술 사용
  if (pokemon.tempStatus?.noSound !== null && skill.feature?.sound) {
    return `${pokemon.names("는")} 한동안 소리 기술을 사용할 수 없다!`;
  }

  // 회복봉인 상태에서 회복 기술 사용
  if (pokemon.tempStatus?.healBlock !== null && skill.feature?.heal) {
    return `${pokemon.names("는")} 회복 봉인 효과로 회복 기술을 사용할 수 없다!`;
  }

  // 사슬묶기/저주받은바디로 봉인된 기술 사용 (다이맥스 중에는 무시)
  if (!isDynamax && pokemon.tempStatus?.disable && pokemon.tempStatus.disable === skill.name) {
    return "해당 기술은 봉인되어 사용할 수 없다!";
  }

  return null;
};

// Bottom-Skill에서 발버둥 활성화, npc.js에서 사용불가 기술 제외에 사용
export const isSkillUsable = (pokemon, skillIndex) => !getSkillUnusableReason(pokemon, skillIndex);

// beforeSkillCheck에서 사용
// 상대의 선공으로 기술 금지를 맞고 해당 기술을 사용하려 한 경우
// 기술이 실패하며 pp가 소모되지 않고 기술 고정도 되지 않는다.
export const checkSkillDisabled = (bt, enqueue, atkPokemon = null, skillObj = null) => {
  const atk = atkPokemon || bt[bt.turn.atk];
  const skill = skillObj || atk?.turn?.useSkill;
  if (!atk || !skill) return true;

  const isDynamax = atk.tempStatus?.dynamax > 0;

  // 상대 선도발을 맞고 변화기를 쓴 경우 (다이윌 제외)
  if (atk.tempStatus?.taunt !== null) {
    if ((skill.stype === "buf" || skill.stype === "natk") && !skill.feature?.maxGuard) {
      enqueue(bt, atk.names("는") + " 도발당한 상태라서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_taunt_block");
      return false;
    }
  }

  // 상대 선 지옥찌르기를 맞은 턴에 소리 기술을 쓴 경우
  if (skill.feature?.sound && atk.tempStatus?.noSound) {
    enqueue(bt, atk.names("는") + " 소리 기술이 금지당해 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_nosound_block");
    return false;
  }

  // 선 회복봉인기술을 맞고 회복 기술을 쓴 경우
  if (skill.feature?.heal && atk.tempStatus?.healBlock) {
    enqueue(bt, atk.names("는") + " 회복 봉인 효과로 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_heal_block");
    return false;
  }

  // 사슬묶기로 봉인된 기술을 쓴 경우 (다이맥스 중에는 무시)
  if (!isDynamax && atk.tempStatus?.disable && atk.tempStatus.disable === skill.name) {
    enqueue(bt, atk.names("는") + " 기술이 봉인되어 있어서 " + josa(`${skill.name}#{를} `) + "쓸 수 없다!", "chk_disable_block");
    return false;
  }

  return true;
};

export default isSkillUsable;
