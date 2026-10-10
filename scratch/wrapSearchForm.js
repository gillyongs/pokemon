// node scratch/wrapSearchForm.js  (프로젝트 루트에서 실행)
const fs = require("fs");
const file = "src/screen/CustomScreen.js";
let c = fs.readFileSync(file, "utf8");
const hadCRLF = c.includes("\r\n");
c = c.replace(/\r\n/g, "\n");

const start = c.indexOf("            <InputContainer>\n              <SearchInput");
const endMarker = "            </InputContainer>\n";
const end = c.indexOf(endMarker, start) + endMarker.length;
if (start < 0 || end < endMarker.length) throw new Error("block not found");

const block = [
  "            <form",
  '              style={{ display: "contents" }}',
  "              onSubmit={(e) => {",
  "                // 키보드의 '이동'/Enter → submit 이벤트. 키보드를 닫는다.",
  "                e.preventDefault();",
  "                if (document.activeElement) document.activeElement.blur();",
  "              }}>",
  "              <InputContainer>",
  "                <SearchInput",
  '                  type="text"',
  '                  placeholder="이름 검색"',
  "                  value={searchTerm}",
  "                  onChange={(e) => setSearchTerm(e.target.value)}",
  "                  onKeyDown={(e) => {",
  "                    // 모바일 키보드의 '이동'(Enter) 버튼을 누르면 키보드 닫기",
  '                    if (e.key === "Enter") e.target.blur();',
  "                  }}",
  "                />",
  '                {searchTerm && <ClearInputButton type="button" onClick={() => setSearchTerm("")}>✕</ClearInputButton>}',
  "              </InputContainer>",
  "            </form>",
  "",
].join("\n");

c = c.slice(0, start) + block + c.slice(end);
if (hadCRLF) c = c.replace(/\n/g, "\r\n");
fs.writeFileSync(file, c, "utf8");
console.log("done");
