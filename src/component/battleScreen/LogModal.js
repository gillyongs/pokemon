import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { AugmentIcon } from "./augment/AugmentIcon";
import { isBuffAugment, isCurseAugment } from "../../entity/Augment/AugmentData";

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

// 컨테이너는 스크롤되지 않고, 내부 LogList만 스크롤된다.
const ModalContainer = styled.div`
  background: rgba(15, 20, 28, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  width: 90vw;
  max-width: 450px;
  max-height: 70vh;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  font-size: 1.6rem;
  margin-top: 0;
  margin-bottom: 15px;
  font-weight: bold;
  color: #64ffda;
  text-align: center;
  font-family: "CustomFont", sans-serif;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
  flex-shrink: 0;
`;

const LogList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(100, 255, 218, 0.3);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 255, 218, 0.5);
  }
`;

const TurnIndicator = styled.div`
  text-align: center;
  color: #64ffda;
  font-weight: bold;
  font-size: 1.1rem;
  margin: 20px 0;
  letter-spacing: 1px;
`;

const Item = styled.div`
  padding: 12px 15px;
  margin-bottom: 12px;
  background: rgba(0, 0, 0, 0.5);
  border-left: 4px solid #64ffda;
  border-radius: 4px;
  white-space: pre-wrap;
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.5;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
`;

const AugmentLogCard = styled.div`
  padding: 12px 14px;
  margin-bottom: 12px;
  background: ${(props) =>
    props.$isCurse
      ? "linear-gradient(135deg, rgba(48, 16, 18, 0.95), rgba(28, 10, 12, 0.98))"
      : props.$isBuff
        ? "linear-gradient(135deg, rgba(38, 32, 12, 0.95), rgba(24, 20, 8, 0.98))"
        : "linear-gradient(135deg, rgba(16, 28, 42, 0.95), rgba(10, 18, 28, 0.98))"};
  border: 1px solid ${(props) => (props.$isCurse ? "rgba(239, 68, 68, 0.45)" : props.$isBuff ? "rgba(255, 215, 0, 0.45)" : "rgba(100, 255, 218, 0.35)")};
  border-left: 4px solid ${(props) => (props.$isCurse ? "#ef4444" : props.$isBuff ? "#ffd700" : "#64ffda")};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AugmentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AugmentBadge = styled.span`
  background: ${(props) => (props.$isCurse ? "rgba(239, 68, 68, 0.2)" : props.$isBuff ? "rgba(255, 215, 0, 0.2)" : "rgba(100, 255, 218, 0.15)")};
  color: ${(props) => (props.$isCurse ? "#f87171" : props.$isBuff ? "#ffd700" : "#64ffda")};
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid ${(props) => (props.$isCurse ? "rgba(239, 68, 68, 0.5)" : props.$isBuff ? "rgba(255, 215, 0, 0.5)" : "rgba(100, 255, 218, 0.35)")};
  letter-spacing: 0.5px;
`;

const LogBuffBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.18);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 4px;
  letter-spacing: 0.5px;
`;

const LogCurseBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #f87171;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 4px;
  letter-spacing: 0.5px;
`;

const TargetPokemonText = styled.span`
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
`;

const AugmentBody = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AugmentIconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  min-width: 44px;
`;

const AugmentInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const AugmentTitleRow = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 3px;
`;

const AugmentName = styled.span`
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  word-break: keep-all;
`;

const AugmentCost = styled.span`
  width: 44px;
  min-width: 44px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  background: rgba(100, 255, 218, 0.08);
  color: #64ffda;
  border: 1px solid rgba(100, 255, 218, 0.25);
  white-space: nowrap;
  text-align: center;
  box-sizing: border-box;
`;

const AugmentDesc = styled.div`
  color: #cbd5e1;
  font-size: 0.8rem;
  line-height: 1.4;
  word-break: keep-all;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  width: 100%;
  margin-top: 15px;
  padding: 12px 0;
  font-size: 1.1rem;
  font-family: "CustomFont", sans-serif;
  font-weight: bold;
  border: 1px solid rgba(100, 255, 218, 0.5);
  border-radius: 8px;
  cursor: pointer;
  background: rgba(100, 255, 218, 0.1);
  color: #64ffda;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(100, 255, 218, 0.25);
    box-shadow: 0 5px 15px rgba(100, 255, 218, 0.2);
  }
`;

export default function LogModal({ log, onClose }) {
  const listRef = useRef(null);

  // 로그를 열 때 항상 맨 아래(가장 최근 로그)로 이동
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, []);

  return (
    <ModalBackground onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Title>로그 보기</Title>

        <LogList ref={listRef}>
          {log.length === 0 ? (
            <Item>로그가 없습니다.</Item>
          ) : (
            log.map((item, index) => {
              if (item.onlyLog) {
                return <TurnIndicator key={index}>{item.text}</TurnIndicator>;
              }

              if (item.augmentData) {
                const targetName = item.augmentData.targetName;
                const augment = item.augmentData.augment || item.augmentData || {};
                const augId = augment.id;
                const isCurse = Boolean(augment.curse || isCurseAugment(augment));
                const isBuff = Boolean((augment.buf || isBuffAugment(augment)) && !isCurse);
                const augCost = augment.cost;
                const augName = augment.shortName || augment.name || augment.augmentName || (isCurse ? "저주" : isBuff ? "버프" : "증강");
                const augDesc = augment.desc;
                return (
                  <AugmentLogCard key={index} $isBuff={isBuff} $isCurse={isCurse}>
                    <AugmentHeader>
                      <AugmentBadge $isBuff={isBuff} $isCurse={isCurse}>{isCurse ? "저주 획득" : isBuff ? "버프 획득" : "증강 획득"}</AugmentBadge>
                      <TargetPokemonText>{targetName}에게 적용</TargetPokemonText>
                    </AugmentHeader>
                    <AugmentBody>
                      <AugmentIconCol>
                        {augId && <AugmentIcon id={augId} size={36} />}
                        {!isBuff && !isCurse && augCost !== undefined && augCost !== "-" && <AugmentCost>{augCost ?? 1} cost</AugmentCost>}
                      </AugmentIconCol>
                      <AugmentInfo>
                        <AugmentTitleRow>
                          <AugmentName>{augName}</AugmentName>
                          {isCurse ? <LogCurseBadge>저주</LogCurseBadge> : isBuff && <LogBuffBadge>버프</LogBuffBadge>}
                        </AugmentTitleRow>
                        {augDesc && <AugmentDesc>{augDesc}</AugmentDesc>}
                      </AugmentInfo>
                    </AugmentBody>
                  </AugmentLogCard>
                );
              }

              return <Item key={index}>{item.text}</Item>;
            })
          )}
        </LogList>

        <CloseButton onClick={onClose}>닫기</CloseButton>
      </ModalContainer>
    </ModalBackground>
  );
}
