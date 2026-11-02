import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { AUGMENT_LIST, getAugmentLogDesc } from "../../entity/Augment/AugmentData";

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
  background: linear-gradient(135deg, rgba(16, 28, 42, 0.95), rgba(10, 18, 28, 0.98));
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-left: 4px solid #64ffda;
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
  background: rgba(100, 255, 218, 0.15);
  color: #64ffda;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid rgba(100, 255, 218, 0.35);
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

const parseAugmentLog = (item) => {
  if (item.augmentData) {
    return item.augmentData;
  }
  if (item.text && item.text.startsWith("[증강]")) {
    const match = item.text.match(/^\[증강\]\s*(.+?)\s*["“](.+?)["”]/);
    if (match) {
      const targetName = match[1].trim();
      const augmentName = match[2].trim();
      const foundAug = AUGMENT_LIST.find((a) => a.name === augmentName);
      const pokes = [item.battle?.player, item.battle?.playerBench1, item.battle?.playerBench2];
      const targetPoke = pokes.find((p) => p && (p.names === targetName || p.name === targetName));
      const pokeAug = targetPoke?.augments?.find((a) => a.id === foundAug?.id || a.name === augmentName);
      return {
        targetName,
        targetPoke,
        augment: pokeAug || foundAug || { name: augmentName },
      };
    }
  }
  return null;
};

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

              const augmentData = parseAugmentLog(item);
              if (augmentData) {
                const { targetName, targetPoke, augment } = augmentData;
                return (
                  <AugmentLogCard key={index}>
                    <AugmentHeader>
                      <AugmentBadge>증강 획득</AugmentBadge>
                      <TargetPokemonText>{targetName}에게 적용</TargetPokemonText>
                    </AugmentHeader>
                    <AugmentBody>
                      <AugmentIconCol>
                        {augment.id && <AugmentIcon id={augment.id} size={36} />}
                        {augment.cost !== undefined && augment.cost !== "-" && (
                          <AugmentCost>{augment.cost ?? 1} cost</AugmentCost>
                        )}
                      </AugmentIconCol>
                      <AugmentInfo>
                        <AugmentTitleRow>
                          <AugmentName>{augment.name}</AugmentName>
                        </AugmentTitleRow>
                        {(augment.desc || augment.logDesc) && (
                          <AugmentDesc>{getAugmentLogDesc(augment, targetPoke)}</AugmentDesc>
                        )}
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