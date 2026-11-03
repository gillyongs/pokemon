import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { logArr, subscribeDebugLogs, clearDebugLogs } from "../../util/consoleLog";

// =========================================================================
// Vue DevTools 스타일 객체/배열 트리 뷰어
// =========================================================================

function getPreview(val, depth = 0) {
  if (val === null) return "null";
  if (val === undefined) return "undefined";
  if (typeof val === "string") return `"${val.length > 25 ? val.slice(0, 25) + "…" : val}"`;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "function") return `ƒ ${val.name || ""}()`;
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    if (depth > 0) return `Array(${val.length})`;
    const items = val.slice(0, 3).map((item) => getPreview(item, depth + 1));
    return `[ ${items.join(", ")}${val.length > 3 ? ", …" : ""} ]`;
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    if (keys.length === 0) return "{}";
    if (depth > 0) return "{…}";
    const preview = keys
      .slice(0, 3)
      .map((k) => `${k}: ${getPreview(val[k], depth + 1)}`)
      .join(", ");
    return `{ ${preview}${keys.length > 3 ? ", …" : ""} }`;
  }
  return String(val);
}

function PrimitiveValue({ value }) {
  if (typeof value === "string") {
    return <StringVal>"{value}"</StringVal>;
  }
  if (typeof value === "number") {
    return <NumberVal>{value}</NumberVal>;
  }
  if (typeof value === "boolean") {
    return <BooleanVal>{String(value)}</BooleanVal>;
  }
  if (value === null) {
    return <NullVal>null</NullVal>;
  }
  if (value === undefined) {
    return <UndefinedVal>undefined</UndefinedVal>;
  }
  if (typeof value === "function") {
    return <FunctionVal>ƒ {value.name || "anonymous"}()</FunctionVal>;
  }
  return <SpecialVal>{String(value)}</SpecialVal>;
}

function TreeNode({ name, value, depth = 0, isRoot = false, ancestors = new Set() }) {
  const [expanded, setExpanded] = useState(false);

  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);

  // 루트 레벨의 단순 문자열 출력 (줄바꿈 지원)
  if (isRoot && typeof value === "string") {
    return <RootPlainString>{value}</RootPlainString>;
  }

  // 기본 원시 타입 (Primitive)
  if (!isObject) {
    return (
      <NodeRow>
        {name !== undefined && <KeyName>{name}: </KeyName>}
        <PrimitiveValue value={value} />
      </NodeRow>
    );
  }

  // 순환 참조 방지
  if (ancestors.has(value)) {
    return (
      <NodeRow>
        {name !== undefined && <KeyName>{name}: </KeyName>}
        <SpecialVal>[Circular Reference]</SpecialVal>
      </NodeRow>
    );
  }

  const keys = Object.keys(value);
  const isEmpty = keys.length === 0;

  const toggle = (e) => {
    e.stopPropagation();
    if (!isEmpty) setExpanded(!expanded);
  };

  const nextAncestors = new Set(ancestors);
  nextAncestors.add(value);

  return (
    <NodeContainer>
      <NodeHeader onClick={toggle} $clickable={!isEmpty}>
        {!isEmpty ? (
          <ArrowIcon $expanded={expanded}>▶</ArrowIcon>
        ) : (
          <ArrowSpacer />
        )}
        {name !== undefined && <KeyName>{name}: </KeyName>}
        {isArray ? (
          <TypeTag $isArray>Array({value.length})</TypeTag>
        ) : (
          <TypeTag>Object</TypeTag>
        )}
        {!expanded && <PreviewText>{getPreview(value)}</PreviewText>}
      </NodeHeader>
      {expanded && !isEmpty && (
        <ChildrenContainer>
          {keys.map((k) => (
            <TreeNode
              key={k}
              name={isArray ? Number(k) : k}
              value={value[k]}
              depth={depth + 1}
              ancestors={nextAncestors}
            />
          ))}
          {isArray && (
            <NodeRow style={{ opacity: 0.6, fontSize: "0.85em" }}>
              <KeyName>length: </KeyName>
              <NumberVal>{value.length}</NumberVal>
            </NodeRow>
          )}
        </ChildrenContainer>
      )}
    </NodeContainer>
  );
}

// =========================================================================
// 메인 모달 컴포넌트
// =========================================================================

export default function DebugLogModal({ onClose }) {
  const [logs, setLogs] = useState(() => [...logArr]);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logListRef = useRef(null);

  useEffect(() => {
    return subscribeDebugLogs((updated) => {
      setLogs([...updated]);
    });
  }, []);

  useEffect(() => {
    if (autoScroll && logListRef.current) {
      logListRef.current.scrollTop = logListRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const filteredLogs = searchTerm
    ? logs.filter((l) => l.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : logs;

  const handleCopyAll = () => {
    const fullText = logs.map((l) => l.text).join("\n");
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <ModalBackground onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Header>
          <TitleArea>
            <Title>🛠️ 디버깅 콘솔 로그</Title>
            <CountBadge>{logs.length}개</CountBadge>
          </TitleArea>
          <ActionArea>
            <ActionBtn onClick={handleCopyAll}>
              {copied ? "✓ 복사됨!" : "전체 복사"}
            </ActionBtn>
            <ActionBtn $danger onClick={clearDebugLogs}>
              비우기
            </ActionBtn>
            <CloseBtn onClick={onClose}>닫기</CloseBtn>
          </ActionArea>
        </Header>

        <ToolBar>
          <SearchInput
            type="text"
            placeholder="로그 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AutoScrollToggle>
            <label>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              자동 스크롤
            </label>
          </AutoScrollToggle>
        </ToolBar>

        <LogViewArea ref={logListRef}>
          {filteredLogs.length === 0 ? (
            <EmptyLog>
              {searchTerm ? "검색 결과와 일치하는 로그가 없습니다." : "기록된 로그가 없습니다.\n(consoleLog('메시지')로 로그를 남겨보세요)"}
            </EmptyLog>
          ) : (
            filteredLogs.map((item, index) => {
              const rawArgs = item.raw && item.raw.length > 0 ? item.raw : [item.text];
              return (
                <LogRow key={item.id || index}>
                  <TreeWrapper>
                    {rawArgs.map((arg, argIdx) => (
                      <TreeNode key={argIdx} value={arg} isRoot={true} />
                    ))}
                  </TreeWrapper>
                </LogRow>
              );
            })
          )}
        </LogViewArea>
      </ModalContainer>
    </ModalBackground>
  );
}

// =========================================================================
// 스타일 컴포넌트 (Vue DevTools Theme)
// =========================================================================

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ModalBackground = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContainer = styled.div`
  background: #181818;
  border: 1px solid #333333;
  border-radius: 12px;
  width: 92vw;
  max-width: 940px;
  height: 82vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
  overflow: hidden;
  animation: ${slideUp} 0.25s ease-out;
  font-family: "JetBrains Mono", "Fira Code", "Consolas", monospace;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #222222;
  border-bottom: 1px solid #333333;
`;

const TitleArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: bold;
  color: #42b883;
`;

const CountBadge = styled.span`
  background: rgba(66, 184, 131, 0.2);
  color: #42b883;
  border: 1px solid rgba(66, 184, 131, 0.4);
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
`;

const ActionArea = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ActionBtn = styled.button`
  background: ${(props) => (props.$danger ? "rgba(239, 68, 68, 0.2)" : "rgba(66, 184, 131, 0.15)")};
  color: ${(props) => (props.$danger ? "#f87171" : "#42b883")};
  border: 1px solid ${(props) => (props.$danger ? "rgba(239, 68, 68, 0.4)" : "rgba(66, 184, 131, 0.4)")};
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$danger ? "rgba(239, 68, 68, 0.35)" : "rgba(66, 184, 131, 0.3)")};
  }
`;

const CloseBtn = styled.button`
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #383838;
    color: #fff;
  }
`;

const ToolBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 18px;
  background: #202020;
  border-bottom: 1px solid #303030;
  gap: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  background: #141414;
  border: 1px solid #3c3c3c;
  color: #e0e0e0;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;

  &:focus {
    border-color: #42b883;
  }
`;

const AutoScrollToggle = styled.div`
  font-size: 0.8rem;
  color: #aaaaaa;
  display: flex;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  input {
    cursor: pointer;
    accent-color: #42b883;
  }
`;

const LogViewArea = styled.div`
  flex: 1;
  padding: 10px 14px;
  overflow-y: auto;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #181818;
`;

const EmptyLog = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666666;
  text-align: center;
  white-space: pre-line;
`;

const LogRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  border-left: 3px solid #42b883;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(66, 184, 131, 0.06);
  }
`;

const TreeWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-x: auto;
`;

// Tree Node Elements
const NodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  font-family: inherit;
`;

const NodeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: ${(props) => (props.$clickable ? "pointer" : "default")};
  user-select: text;
  padding: 1px 4px;
  border-radius: 3px;
  width: fit-content;

  &:hover {
    background: ${(props) => (props.$clickable ? "rgba(255, 255, 255, 0.05)" : "transparent")};
  }
`;

const ArrowIcon = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 14px;
  height: 14px;
  font-size: 0.65rem;
  color: #888888;
  cursor: pointer;
  user-select: none;
  transition: transform 0.15s ease, color 0.15s ease;
  transform: rotate(${(props) => (props.$expanded ? "90deg" : "0deg")});

  &:hover {
    color: #42b883;
  }
`;

const ArrowSpacer = styled.span`
  width: 14px;
  height: 14px;
  display: inline-block;
`;

const KeyName = styled.span`
  color: #42b883;
  font-weight: 600;
`;

const TypeTag = styled.span`
  color: ${(props) => (props.$isArray ? "#80cbc4" : "#94a3b8")};
  font-style: italic;
  font-size: 0.88em;
`;

const PreviewText = styled.span`
  color: #777777;
  font-size: 0.88em;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 600px;
`;

const ChildrenContainer = styled.div`
  padding-left: 14px;
  margin-left: 6px;
  border-left: 1px dashed rgba(66, 184, 131, 0.25);
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 2px;
`;

const NodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1px 4px 1px 18px;
`;

const RootPlainString = styled.div`
  white-space: pre-wrap;
  word-break: break-all;
  color: #f1f5f9;
  font-family: inherit;
  line-height: 1.45;
`;

const StringVal = styled.span`
  color: #e6a23c;
  word-break: break-all;
`;

const NumberVal = styled.span`
  color: #4fc1e9;
`;

const BooleanVal = styled.span`
  color: #f06292;
  font-weight: bold;
`;

const NullVal = styled.span`
  color: #888888;
  font-style: italic;
`;

const UndefinedVal = styled.span`
  color: #888888;
  font-style: italic;
`;

const FunctionVal = styled.span`
  color: #64b5f6;
  font-style: italic;
`;

const SpecialVal = styled.span`
  color: #b0bec5;
`;
