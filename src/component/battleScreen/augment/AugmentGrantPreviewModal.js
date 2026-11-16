import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { AugmentIcon } from "./AugmentIcon";
import { AUGMENT_LIST } from "../../../entity/Augment/AugmentData";

const AugmentGrantPreviewModal = ({ augmentId, grantInfo, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const grantItems = useMemo(() => {
    if (!grantInfo?.items) return [];
    return grantInfo.items.map((id) => AUGMENT_LIST.find((a) => a.id === id)).filter(Boolean);
  }, [grantInfo]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalHeaderTop>
            <ModalTitle>{grantInfo?.modalTitle || "추가 보상 획득 안내"}</ModalTitle>
            <CloseButton type="button" onClick={onClose} title="닫기">
              ✕
            </CloseButton>
          </ModalHeaderTop>
          <ModalNotice>{grantInfo?.headerNotice || "해당 증강 선택시 아래 증강 또는 버프를 추가로 획득합니다."}</ModalNotice>
        </ModalHeader>

        <AugList>
          {grantItems.map((item, idx) => {
            const isBuff = Boolean(item.buf);
            return (
              <AugCard key={item.id || idx} $isBuff={isBuff}>
                <IconCol>
                  <AugmentIcon id={item.id} size={40} />
                  {!isBuff && item.cost !== "-" && item.cost !== undefined && <CostTag>{item.cost} cost</CostTag>}
                </IconCol>
                <AugMeta>
                  <AugNameRow>
                    <AugName>{item.name}</AugName>
                    <CategoryBadge $isBuff={isBuff}>{isBuff ? "버프" : "추가 증강"}</CategoryBadge>
                  </AugNameRow>
                  <AugDesc>{item.desc}</AugDesc>
                </AugMeta>
              </AugCard>
            );
          })}
        </AugList>

        <ModalFooter>
          <ConfirmBtn type="button" onClick={onClose}>
            확인
          </ConfirmBtn>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AugmentGrantPreviewModal;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.78);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 16px;
  animation: fadeInOverlay 0.2s ease-out;

  @keyframes fadeInOverlay {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContainer = styled.div`
  background: #111827;
  border: 1px solid #374151;
  border-radius: 14px;
  width: 90%;
  max-width: 400px;
  padding: 18px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  box-sizing: border-box;
  animation: popInModal 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes popInModal {
    from {
      transform: scale(0.94);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 12px;
`;

const ModalHeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const ModalTitle = styled.h4`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #64ffda;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TitleSparkle = styled.span`
  font-size: 0.95rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: all 0.15s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalNotice = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: keep-all;
  text-align: left;
`;

const AugList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  margin-bottom: 14px;
  padding-right: 2px;
`;

const AugCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: ${(props) => (props.$isBuff ? "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)" : "rgba(30, 41, 59, 0.85)")};
  border: 1px solid ${(props) => (props.$isBuff ? "rgba(100, 255, 218, 0.35)" : "#334155")};
  border-radius: 10px;
  box-shadow: ${(props) => (props.$isBuff ? "0 0 10px rgba(100, 255, 218, 0.08)" : "none")};
`;

const IconCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const CostTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #64ffda;
  background: rgba(100, 255, 218, 0.12);
  border: 1px solid rgba(100, 255, 218, 0.35);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
`;

const BuffTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  color: #fef08a;
  background: rgba(254, 240, 138, 0.15);
  border: 1px solid rgba(254, 240, 138, 0.4);
  border-radius: 4px;
  padding: 1px 5px;
  white-space: nowrap;
`;

const AugMeta = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  text-align: left;
`;

const AugNameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 4px;
`;

const AugName = styled.span`
  font-size: 0.9rem;
  font-weight: 800;
  color: #ffffff;
  word-break: keep-all;
`;

const CategoryBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
  ${(props) =>
    props.$isBuff
      ? `
    background: rgba(254, 240, 138, 0.18);
    color: #fef08a;
    border: 1px solid rgba(254, 240, 138, 0.5);
  `
      : `
    background: rgba(100, 255, 218, 0.16);
    color: #64ffda;
    border: 1px solid rgba(100, 255, 218, 0.45);
  `}
`;

const AugDesc = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.4;
  white-space: pre-line;
  word-break: keep-all;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ConfirmBtn = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
