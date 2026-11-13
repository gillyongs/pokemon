import { hpCalculate } from "../calc/hpCalculate";
import { applyAilment } from "./ailment";
import { random } from "../util/randomCheck";
import { typeCheckOnBattle } from "../calc/typeEffectCalculate";
import { josa } from "josa";

export const applyOnHitEvents = (battle, enqueue, substitute) => {
  // 피격시 발동되는 특성, 아이템 모음
  // 연속기면 여러번 터진다
  // 독치장(킬라플로르), 울퉁불퉁멧, 철가시(까칠한피부), 정전기, 풍선 터짐

  const atk = battle.turn.atk;
  const atkPokemon = battle[battle.turn.atk];
  const defPokemon = battle[battle.turn.def];
  const useSkill = atkPokemon.turn.useSkill;

  if (defPokemon.item === "풍선") {
    //기절하거나 탁떨, 대타출동 상태중에 맞아도 풍선은 무조건 터진다
    const text = defPokemon.name + "의 풍선이 터졌다!";
    defPokemon.item = null;
    enqueue({ id: "13bb1111-7771-46b2-b0f6-b5b95f4bc81b", battle, text: text });
  }

  if (substitute) return;
  // 대타출동 상태로 맞을땐 대부분의 피격 이벤트가 발생하지 않음

  const noBerryAbil = ["혼연일체(흑)", "혼연일체(백)", "긴장감"];
  if (defPokemon.item === "슈케열매" && useSkill?.type === "땅" && !noBerryAbil.includes(atkPokemon.abil)) {
    const typeDamage = typeCheckOnBattle(battle, useSkill.type, defPokemon.type1, defPokemon.type2);
    if (typeDamage > 1) {
      defPokemon.item = null;
      enqueue({ id: "7c0782c7-e4a8-4dc9-9bc6-22738696e17e", battle, text: `${defPokemon.names} 슈케열매로 땅타입 기술의 위력을 반감시켰다!` });
    }
  }

  if (defPokemon.abil === "열교환" && !defPokemon.faint && useSkill.type === "불꽃" && (useSkill.stype === "atk" || useSkill.stype === "catk")) {
    defPokemon.rankUp(battle, enqueue, "atk", 1, "[특성 열교환]");
    // 데미지 무효 효과는 없음
  }

  if (defPokemon.abil === "지구력" && !defPokemon.faint && (useSkill.stype === "atk" || useSkill.stype === "catk")) {
    // 공격 기술에 맞을 때마다 방어 1랭크 상승 (연속기면 여러번)
    // 지구력, 꺠어진갑옷 틀꺠기랑 상관없이 발동됨
    defPokemon.rankUp(battle, enqueue, "def", 1, "[특성 지구력]");
  }

  if (defPokemon.abil === "깨어진갑옷" && !defPokemon.faint && useSkill.stype === "atk") {
    // 물리 공격을 맞았을 때 방어 1랭크 하락, 스피드 2랭크 상승
    defPokemon.rankUpMulti(
      battle,
      enqueue,
      [
        { stat: "def", value: -1 },
        { stat: "speed", value: 2 },
      ],
      "[특성 깨어진갑옷]"
    );
  }

  if (defPokemon.abil === "독치장") {
    if (useSkill.stype === "atk") {
      // 물리 공격에만 발생 (접촉 상관 x)
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
          id: "b95f894e-6ed3-4ff4-9c22-1ecc9cb8f7a5",
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
          id: "a7e6e93e-f0bc-4b56-ab2f-e83d7a21533f",
          battle,
          text: sRockText,
        });
      }
    }
  }

  if (defPokemon.abil === "저주받은바디" && !atkPokemon.faint && !atkPokemon.tempStatus.disable && useSkill?.name && useSkill.name !== "발버둥") {
    if (random(30)) {
      atkPokemon.tempStatus.disable = useSkill.name;
      atkPokemon.tempStatus.disableTurnRemain = 4;
      // 역린은 기술 봉인당하면 끊긴다 (혼란 디메리트 없음)
      if (atkPokemon.auto !== null) {
        atkPokemon.auto = null;
        atkPokemon.autoSN = null;
      }
      enqueue({
        id: "c7b8e1a2-3d4f-4e5a-9b6c-1f2d3e4a5b6c",
        battle,
        text: `[특성 저주받은바디] ${atkPokemon.name}의 ${josa(`${useSkill.name}#{가}`)} 봉인되었다!`,
      });
    }
  }

  // 접촉 관련 ==============================================================================

  let touch = useSkill.feature?.touch;
  if (useSkill.feature?.punch && atkPokemon.item === "펀치글러브") {
    touch = false;
  }
  if (defPokemon.abil === "불꽃몸" && touch && !atkPokemon.faint) {
    const chiliMult = defPokemon.hasAugment?.("grandmasChiliOil") ? 3 : 1;
    const flameBodyChance = Math.min(100, 30 * chiliMult);
    if (random(flameBodyChance)) {
      applyAilment("화상", battle, battle.turn.atk, enqueue, false, `[특성 불꽃몸] ${atkPokemon.names} 화상을 입었다!`);
    }
  }
  if (defPokemon.abil === "정전기" && touch && !atkPokemon.faint) {
    if (random(30)) {
      applyAilment("마비", battle, battle.turn.atk, enqueue, false, `[특성 정전기] ${atkPokemon.names} 마비되어 기술을 쓰기 어려워졌다!`);
    }
  }
  const atkMaxHp = hpCalculate(atkPokemon);
  // 철가시, 울퉁불퉁멧
  if (defPokemon.abilObj.feature?.hanka && touch && !atkPokemon.faint) {
    const text = "[특성 " + defPokemon.abil + "] " + atkPokemon.names + " 상처를 입었다!";
    atkPokemon.getDamage(battle, enqueue, atkMaxHp / 8, text);
    // 별 상관은 없지만 해당 특성이 울멧보다 먼저
  }
  if (defPokemon.item === "울퉁불퉁멧" && touch && !atkPokemon.faint) {
    const text = atkPokemon.names + " 울퉁불퉁멧 때문에 데미지를 입었다!";
    atkPokemon.getDamage(battle, enqueue, atkMaxHp / 6, text);
    // 철가시 1/8, 울멧 1/6 맞음
  }
  // 증강 관련 (접촉 여부 무관) ===========================================================
  // [증강] 가시갑옷: 적에게 공격을 받을 때 상대방에게 최대 HP의 1/8 데미지를 준다
  if (defPokemon.hasAugment?.("thornmail") && !atkPokemon.faint) {
    const text = "[증강 가시갑옷] " + atkPokemon.names + " 가시갑옷 때문에 데미지를 입었다!";
    atkPokemon.getDamage(battle, enqueue, atkMaxHp / 8, text);
  }
};
