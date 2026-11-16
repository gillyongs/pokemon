const fs = require('fs');

// 1. Battle.js
{
  const filePath = 'src/entity/Battle.js';
  let content = fs.readFileSync(filePath, 'utf8');
  const target = `    [this.player, this.playerBench1, this.playerBench2, this.npc, this.npcBench1, this.npcBench2].forEach((p) => {
      p?.resetTurn?.();
    });
  }
}`;
  const replacement = `    [this.player, this.playerBench1, this.playerBench2, this.npc, this.npcBench1, this.npcBench2].forEach((p) => {
      p?.resetTurn?.();
    });
  }

  // 해당 진영("player" | "npc")의 필드 포켓몬이 팀에서 유일하게 생존한 마지막 포켓몬인지 여부
  isLastPokemon(side) {
    if (side !== "npc" && side !== "player") return false;
    const active = side === "npc" ? this.npc : this.player;
    if (!active || active.faint || active.hp <= 0) return false;
    const benches = side === "npc"
      ? [this.npcBench1, this.npcBench2].filter(Boolean)
      : [this.playerBench1, this.playerBench2].filter(Boolean);
    return benches.length > 0 && benches.every((p) => p.faint || p.hp <= 0);
  }
}`;

  const isCRLF = content.includes('\r\n');
  const normTarget = target.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normReplacement = replacement.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  if (!content.includes(normTarget)) {
    console.error("Failed to find target in Battle.js");
  } else {
    content = content.replace(normTarget, normReplacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated Battle.js");
  }
}

// 2. speedCheck.js
{
  const filePath = 'src/calc/speedCheck.js';
  let content = fs.readFileSync(filePath, 'utf8');
  const targetFn = `export const isPokemonAlone = (pokemon, battle) => {
  if (!pokemon || !battle) return false;
  const teamSide = pokemon.team === "npc" ? "npc" : (pokemon.team === "player" ? "player" : (battle.npc === pokemon ? "npc" : "player"));
  const teamMembers = teamSide === "npc"
    ? [battle.npc, battle.npcBench1, battle.npcBench2].filter(Boolean)
    : [battle.player, battle.playerBench1, battle.playerBench2].filter(Boolean);
  const otherMembers = teamMembers.filter((p) => {
    if (pokemon.originalIndex !== undefined && p.originalIndex !== undefined) {
      return p.originalIndex !== pokemon.originalIndex;
    }
    return p !== pokemon;
  });
  return otherMembers.length > 0 && otherMembers.every((p) => p.faint || p.hp <= 0);
};

// 스피드 실 수치 계산 함수`;

  const repFn = `// 스피드 실 수치 계산 함수`;

  const targetCaller = `  if (battle && pokemon?.hasAugment?.("lastWarrior")) {
    if (isPokemonAlone(pokemon, battle)) {
      speed *= 1.6;
      pokemon.log.speedCalculate += " * 1.6 (최후의 전사)";
    }
  }`;

  const repCaller = `  if (battle && pokemon?.hasAugment?.("lastWarrior")) {
    const side = pokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      speed *= 1.6;
      pokemon.log.speedCalculate += " * 1.6 (최후의 전사)";
    }
  }`;

  const isCRLF = content.includes('\r\n');
  const normTargetFn = targetFn.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normRepFn = repFn.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normTargetCaller = targetCaller.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normRepCaller = repCaller.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');

  if (!content.includes(normTargetFn) || !content.includes(normTargetCaller)) {
    console.error("Failed to find targets in speedCheck.js");
  } else {
    content = content.replace(normTargetFn, normRepFn);
    content = content.replace(normTargetCaller, normRepCaller);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated speedCheck.js");
  }
}

// 3. damageCalculate.js
{
  const filePath = 'src/calc/damageCalculate.js';
  let content = fs.readFileSync(filePath, 'utf8');

  const targetImport = `import { speedCheck, speedCalculate, isPokemonAlone } from "./speedCheck";`;
  const repImport = `import { speedCheck, speedCalculate } from "./speedCheck";`;

  const targetCallers = `  // 라스트 사무라이: 해당 포켓몬이 마지막에 홀로 남았을 경우 공격과 특수공격이 60% 증가
  if (battle && attackPokemon?.hasAugment?.("lastSamurai") && (skill.stype === "atk" || skill.stype === "catk")) {
    if (isPokemonAlone(attackPokemon, battle)) {
      atkStat *= 1.6;
      atkStr += " * 1.6 (라스트 사무라이)";
    }
  }

  // 라스트 맨 스탠딩: 해당 포켓몬이 마지막에 홀로 남았을 경우 방어와 특수방어가 60% 증가
  if (battle && defensePokemon?.hasAugment?.("lastManStanding") && (defenseStat === "def" || defenseStat === "cdef")) {
    if (isPokemonAlone(defensePokemon, battle)) {
      defStat *= 1.6;
      defStr += " * 1.6 (라스트 맨 스탠딩)";
    }
  }`;

  const repCallers = `  // 라스트 사무라이: 해당 포켓몬이 마지막에 홀로 남았을 경우 공격과 특수공격이 60% 증가
  if (battle && attackPokemon?.hasAugment?.("lastSamurai") && (skill.stype === "atk" || skill.stype === "catk")) {
    const side = attackPokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      atkStat *= 1.6;
      atkStr += " * 1.6 (라스트 사무라이)";
    }
  }

  // 라스트 맨 스탠딩: 해당 포켓몬이 마지막에 홀로 남았을 경우 방어와 특수방어가 60% 증가
  if (battle && defensePokemon?.hasAugment?.("lastManStanding") && (defenseStat === "def" || defenseStat === "cdef")) {
    const side = defensePokemon?.team === "npc" ? "npc" : "player";
    if (battle.isLastPokemon?.(side)) {
      defStat *= 1.6;
      defStr += " * 1.6 (라스트 맨 스탠딩)";
    }
  }`;

  const isCRLF = content.includes('\r\n');
  const normTargetImport = targetImport.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normRepImport = repImport.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normTargetCallers = targetCallers.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normRepCallers = repCallers.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');

  if (!content.includes(normTargetImport) || !content.includes(normTargetCallers)) {
    console.error("Failed to find targets in damageCalculate.js");
  } else {
    content = content.replace(normTargetImport, normRepImport);
    content = content.replace(normTargetCallers, normRepCallers);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated damageCalculate.js");
  }
}

// 4. AugmentData.js
{
  const filePath = 'src/entity/Augment/AugmentData.js';
  let content = fs.readFileSync(filePath, 'utf8');

  const targetImport = `import { isPokemonAlone } from "../../calc/speedCheck";\n`;
  const targetCaller = `      if (!pokemon || pokemon.faint || pokemon.hp <= 0) return false;
      if (!isPokemonAlone(pokemon, battle)) return false;`;

  const repCaller = `      if (!pokemon || pokemon.faint || pokemon.hp <= 0) return false;
      const side = pokemon?.team === "npc" ? "npc" : "player";
      if (!battle.isLastPokemon?.(side)) return false;`;

  const isCRLF = content.includes('\r\n');
  const normTargetImport = `import { isPokemonAlone } from "../../calc/speedCheck";` + (isCRLF ? '\r\n' : '\n');
  const normTargetCaller = targetCaller.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');
  const normRepCaller = repCaller.replace(/\r?\n/g, isCRLF ? '\r\n' : '\n');

  if (!content.includes(normTargetImport) || !content.includes(normTargetCaller)) {
    console.error("Failed to find targets in AugmentData.js");
  } else {
    content = content.replace(normTargetImport, '');
    content = content.replace(normTargetCaller, normRepCaller);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated AugmentData.js");
  }
}
