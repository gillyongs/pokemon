import { mabi } from "../function/statusCondition";
import { damage } from "../function/damage";
import { random } from "../util/randomCheck";

export const applyOnHitEvents = (battle, enqueue) => {
  // 피격시 발동되는 특성, 아이템 모음
  // 독치장(킬라플로르), 울퉁불퉁멧, 철가시(까칠한피부), 정전기
  // 대타출동 상태로 맞을땐 해당 피격 이벤트가 발생하지 않음

  const atk = battle.turn.atk;
  const def = battle.turn.def;
  const atkPokemon = battle[battle.turn.atk];
  const defPokemon = battle[battle.turn.def];
  const skillNumber = battle.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const useSkill = atkPokemon.origin[skKey];

  if (defPokemon.abil === "독치장") {
    if (useSkill.stype === "atk") {
      const field = battle.field[atk];
      if (!field.poisonSpikes) {
        field.poisonSpikes = 1; // 독압정
        let sRockText;
        if (atk === "npc") {
          sRockText = "[특성 독치장] 상대의 발밑에 독압정이 뿌려졌다!";
        } else {
          sRockText = "[특성 독치장] 아군의 발밑에 독압정이 뿌려졌다!";
        }
        enqueue({
          battle,
          text: sRockText,
        });
      } else if (field.poisonSpikes === 1) {
        field.poisonSpikes = 2; // 맹독압정
        let sRockText;
        if (atk === "npc") {
          sRockText = "[특성 독치장] 상대의 발밑에 맹독압정이 뿌려졌다!";
        } else {
          sRockText = "[특성 독치장] 아군의 발밑에 맹독압정이 뿌려졌다!";
        }
        enqueue({
          battle,
          text: sRockText,
        });
      }
    }
  }

  let touch = useSkill.feature.touch;
  if (useSkill.feature.punch && atkPokemon.item === "펀치글러브") {
    touch = false;
  }
  if (defPokemon.abil === "정전기" && touch && !atkPokemon.faint) {
    if (random(30)) {
      mabi(battle, battle.turn.atk, enqueue, null, true);
    }
  }
  if (defPokemon.abilObj.feature?.hanka && touch && !atkPokemon.faint) {
    const text = "[특성 " + defPokemon.abil + "] " + atkPokemon.names + " 상처를 입었다!";
    damage(battle, atkPokemon.origin.hp / 8, atk, enqueue, text);
    // 별 상관은 없지만 해당 특성이 울멧보다 먼저
  }
  if (defPokemon.item === "울퉁불퉁멧" && touch && !atkPokemon.faint) {
    const text = atkPokemon.names + " 울퉁불퉁멧 때문에 데미지를 입었다!";
    damage(battle, atkPokemon.origin.hp / 6, atk, enqueue, text);
  }
  if (defPokemon.item === "풍선") {
    //기절하거나 탁떨에 맞아도 풍선은 무조건 터진다
    const text = defPokemon.name + "의 풍선이 터졌다!";
    defPokemon.item = null;
    enqueue({ battle, text: text });
  }
};

export const substituteOnHitEvents = (battle, enqueue) => {
  // 대타출동 피격시에도 발동되는 이벤트 모음
  // 풍선

  const atk = battle.turn.atk;
  const def = battle.turn.def;
  const atkPokemon = battle[battle.turn.atk];
  const defPokemon = battle[battle.turn.def];
  const skillNumber = battle.turn.atkSN;
  const skKey = `sk${skillNumber}`;
  const useSkill = atkPokemon.origin[skKey];

  if (defPokemon.item === "풍선") {
    const text = defPokemon.name + "의 풍선이 터졌다!";
    defPokemon.item = null;
    enqueue({ battle, text: text });
  }
};
