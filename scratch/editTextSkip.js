// node scratch/editTextSkip.js  (프로젝트 루트에서 실행)
const fs = require("fs");
const file = "src/screen/BattleScreen.js";
let c = fs.readFileSync(file, "utf8");

const from = "      queueObject.dequeue();\r\n      const b = cur.battle;";
const from2 = "      queueObject.dequeue();\n      const b = cur.battle;";
const eol = c.includes("\r\n") ? "\r\n" : "\n";
const target = c.includes(from) ? from : from2;
if (!c.includes(target)) throw new Error("target1 not found");
c = c.replace(target, "      const b = cur.battle;");

const anchor = `      if (condition1 || condition2 || condition3 || condition4 || q.length === 0) {${eol}        // 조건 만족 or 마지막 queue 도달`;
if (!c.includes(anchor)) throw new Error("anchor not found");
const insert = [
  "      // 교체 선택 화면(mustSwitch/uturn)에서 멈추는 경우, 해당 항목은 큐에 남겨둔다.",
  "      // (일반 흐름처럼 Bottom-Switch의 handleSwitch가 직접 dequeue 한다)",
  "      const keepInQueue = (condition1 || condition2) && !condition3 && !condition4;",
  "      if (!keepInQueue) queueObject.dequeue();",
  "",
  "",
].join(eol);
c = c.replace(anchor, insert + anchor);
fs.writeFileSync(file, c, "utf8");
console.log("done");
