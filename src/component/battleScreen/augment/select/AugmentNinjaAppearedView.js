import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import sampleList from "../../../../entity/Pokemon/pokemonSampleList";
import AugmentPokemonPreviewModal from "../AugmentPokemonPreviewModal";
import { HeaderArea, HeaderTopRow, Title, SubTitleText, CloseButton, ActionButton } from "./selectStyles";

const GRENINJA_OPTIONS = [
  {
    sampleName: "개굴닌자",
    title: "개굴닌자",
    imgId: "0658",
    item: "기합의띠",
    desc: "지닌 물건: 기합의띠\n특성 변환자재로 사용하는 기술과 같은 타입으로 변화합니다.",
  },
  {
    sampleName: "메가개굴닌자",
    title: "메가 개굴닌자",
    imgId: "0658-m",
    item: "개굴닌자나이트",
    desc: "지닌 물건: 개굴닌자나이트\n배틀 중 메가진화하여 적응력으로 자속 기술 위력이 상승합니다.",
  },
  {
    sampleName: "지우개굴닌자",
    title: "지우 개굴닌자",
    imgId: "0658-a",
    item: "생명의구슬",
    desc: "지닌 물건: 생명의구슬\n특성 유대진화로 물수리검의 위력이 20이 되며 3회 공격으로 고정됩니다.",
  },
];

const AugmentNinjaAppearedView = ({ ninjaAppearedAug, activePokemon, onSelect, onCancel }) => {
  const [selectedSampleName, setSelectedSampleName] = useState(null);
  const [previewPokemon, setPreviewPokemon] = useState(null);

  const handleCardClick = (e, option) => {
    e.stopPropagation();
    if (selectedSampleName === option.sampleName) {
      setSelectedSampleName(null);
    } else {
      setSelectedSampleName(option.sampleName);
    }
  };

  const handleConfirm = (e, option) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(ninjaAppearedAug, {
        targetPokemon: activePokemon,
        selectedSampleName: option.sampleName,
      });
    }
  };

  const handleOpenPreview = (e, option) => {
    e.stopPropagation();
    const sample = sampleList.getDataBySampleName(option.sampleName);
    if (sample) {
      setPreviewPokemon(sample);
    }
  };

  return (
    <ViewWrapper onClick={() => setSelectedSampleName(null)}>
      <HeaderArea>
        <HeaderTopRow>
          <Title>그런데 그때 닌자가 나타났다</Title>
          <CloseButton onClick={onCancel} title="취소">
            ✕
          </CloseButton>
        </HeaderTopRow>
        <SubTitleText> 교체할 개굴닌자가 지닐 물건을 선택하세요.</SubTitleText>
      </HeaderArea>

      <OptionsGrid>
        {GRENINJA_OPTIONS.map((opt) => {
          const isSelected = selectedSampleName === opt.sampleName;
          return (
            <OptionCard key={opt.sampleName} $isSelected={isSelected} onClick={(e) => handleCardClick(e, opt)}>
              <OptionIconWrapper>
                <PokemonImg
                  src={`/pokemon/img/pokemon/${opt.imgId}.webp`}
                  alt={opt.title}
                  onError={(e) => {
                    e.currentTarget.src = "/pokemon/img/pokemon/0658.webp";
                  }}
                />
                <ItemCornerImg
                  src={`/pokemon/img/item/${opt.item}.webp`}
                  alt={opt.item}
                  title={opt.item}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </OptionIconWrapper>

              <OptionContent>
                <CardTitleRow>
                  <CardTitle>{opt.title}</CardTitle>
                </CardTitleRow>
                <CardDescription>{opt.desc}</CardDescription>
              </OptionContent>

              {isSelected && (
                <CardActionOverlay
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSampleName(null);
                  }}
                >
                  <CardActionButton type="button" onClick={(e) => handleConfirm(e, opt)}>
                    선택
                  </CardActionButton>
                  <CardActionButton type="button" onClick={(e) => handleOpenPreview(e, opt)} title={`${opt.title} 상세정보 보기`}>
                    상세정보
                  </CardActionButton>
                </CardActionOverlay>
              )}
            </OptionCard>
          );
        })}
      </OptionsGrid>

      <FooterArea>
        <ActionButton type="button" $variant="back" onClick={onCancel}>
          취소
        </ActionButton>
      </FooterArea>

      {previewPokemon && <AugmentPokemonPreviewModal pokemon={previewPokemon} onClose={() => setPreviewPokemon(null)} />}
    </ViewWrapper>
  );
};

export default AugmentNinjaAppearedView;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const ViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

const OptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 4px;
`;

const OptionCard = styled.div`
  position: relative;
  width: 100%;
  background: ${(props) => (props.$isSelected ? "rgba(22, 45, 64, 0.98)" : "rgba(0, 0, 0, 0.45)")};
  border: ${(props) => (props.$isSelected ? "1.5px solid #64ffda" : "1px solid rgba(255, 255, 255, 0.1)")};
  border-left: 4px solid ${(props) => (props.$isSelected ? "#38bdf8" : "#64ffda")};
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  box-shadow: ${(props) => (props.$isSelected ? "0 0 14px rgba(100, 255, 218, 0.45), inset 0 0 8px rgba(100, 255, 218, 0.15)" : "none")};

  &:hover {
    ${(props) =>
      !props.$isSelected &&
      `
      background: rgba(255, 255, 255, 0.09);
      border-color: rgba(100, 255, 218, 0.4);
    `}
  }

  @media (max-width: 480px) {
    padding: 10px 10px;
  }
`;

const OptionIconWrapper = styled.div`
  position: relative;
  width: 54px;
  height: 54px;
  min-width: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 46px;
    height: 46px;
    min-width: 46px;
    margin-right: 6px;
  }
`;

const PokemonImg = styled.img`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform: scale(1.15);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
`;

const ItemCornerImg = styled.img`
  position: absolute;
  right: -3px;
  bottom: -3px;
  width: 22px;
  height: 22px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 5px;
  padding: 1.5px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    width: 18px;
    height: 18px;
    right: -2px;
    bottom: -2px;
    padding: 1px;
  }
`;

const OptionContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  width: 100%;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    margin-bottom: 2px;
  }
`;

const CardTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  margin-right: 6px;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-right: 4px;
  }
`;

const CardDescription = styled.p`
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
  line-height: 1.35;
  white-space: pre-line;
  word-break: keep-all;

  @media (max-width: 480px) {
    font-size: 0.74rem;
  }
`;

const CardActionOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 7px;
  z-index: 5;
  animation: ${fadeIn} 0.15s ease-out;
`;

const CardActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  width: 100px;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: rgba(15, 23, 42, 0.95);
  color: #64ffda;
  border: 1.5px solid #64ffda;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);

  &:hover {
    background: #64ffda;
    color: #0f172a;
    box-shadow: 0 4px 18px rgba(100, 255, 218, 0.6);
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.97);
  }

  @media (max-width: 480px) {
    min-height: 38px;
    width: 86px;
    font-size: 0.86rem;
    padding: 8px 0;
  }
`;

const FooterArea = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
`;
