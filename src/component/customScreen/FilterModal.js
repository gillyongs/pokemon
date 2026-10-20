import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { POKEMON_ROLES } from "../../entity/Pokemon/PokemonTemplate";

const POKEMON_TYPES = ["노말", "불꽃", "물", "풀", "전기", "얼음", "격투", "독", "땅", "비행", "에스퍼", "벌레", "바위", "고스트", "드래곤", "악", "강철", "페어리"];

const FilterModal = ({
  activeTypes,
  activeRoles,
  isMegaFilter,
  isLegendaryFilter,
  isIntimidateFilter,
  isWeatherFilter,
  activeLogic,
  onApply,
  onClose,
}) => {
  const [tempSelectedTypes, setTempSelectedTypes] = useState(activeTypes);
  const [tempSelectedRoles, setTempSelectedRoles] = useState(activeRoles);
  const [tempIsMegaFilter, setTempIsMegaFilter] = useState(isMegaFilter);
  const [tempIsLegendaryFilter, setTempIsLegendaryFilter] = useState(isLegendaryFilter);
  const [tempIsIntimidateFilter, setTempIsIntimidateFilter] = useState(isIntimidateFilter);
  const [tempIsWeatherFilter, setTempIsWeatherFilter] = useState(isWeatherFilter);
  const [tempLogic, setTempLogic] = useState(activeLogic);
  const [typeColors, setTypeColors] = useState({});

  useEffect(() => {
    fetch("/pokemon/img/type/typeColor.json")
      .then((res) => res.json())
      .then((data) => setTypeColors(data))
      .catch((err) => console.error("Failed to load type colors", err));
  }, []);

  const toggleRole = (role) => {
    if (tempSelectedRoles.includes(role)) {
      setTempSelectedRoles(tempSelectedRoles.filter((r) => r !== role));
    } else {
      setTempSelectedRoles([...tempSelectedRoles, role]);
    }
  };

  const toggleType = (type) => {
    if (tempSelectedTypes.includes(type)) {
      setTempSelectedTypes(tempSelectedTypes.filter((t) => t !== type));
    } else {
      setTempSelectedTypes([...tempSelectedTypes, type]);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>포켓몬 검색</ModalTitle>
          <LogicSwitch onClick={() => setTempLogic(tempLogic === "OR" ? "AND" : "OR")}>
            <LogicOption $active={tempLogic === "OR"}>OR</LogicOption>
            <LogicOption $active={tempLogic === "AND"}>AND</LogicOption>
          </LogicSwitch>
          <CloseIcon onClick={onClose}>✕</CloseIcon>
        </ModalHeader>
        <SectionTitleRow>
          <ModalSubTitle>타입</ModalSubTitle>
          <SectionResetButton onClick={() => setTempSelectedTypes([])}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </SectionResetButton>
        </SectionTitleRow>
        <TypeGrid>
          <TypeButton $active={tempSelectedTypes.length === 0} onClick={() => setTempSelectedTypes([])}>
            전체
          </TypeButton>
          {POKEMON_TYPES.map((type) => (
            <TypeButton key={type} $active={tempSelectedTypes.includes(type)} $color={typeColors[type]} onClick={() => toggleType(type)}>
              {type}
            </TypeButton>
          ))}
        </TypeGrid>

        <SectionTitleRow>
          <ModalSubTitle>역할군</ModalSubTitle>
          <SectionResetButton onClick={() => setTempSelectedRoles([])}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </SectionResetButton>
        </SectionTitleRow>
        <RoleGrid>
          <TypeButton $active={tempSelectedRoles.length === 0} onClick={() => setTempSelectedRoles([])}>
            전체
          </TypeButton>
          {POKEMON_ROLES.map((role) => (
            <TypeButton key={role} $active={tempSelectedRoles.includes(role)} onClick={() => toggleRole(role)}>
              {role}
            </TypeButton>
          ))}
        </RoleGrid>

        <SectionTitleRow>
          <ModalSubTitle>기타</ModalSubTitle>
          <SectionResetButton
            onClick={() => {
              setTempIsMegaFilter(false);
              setTempIsLegendaryFilter(false);
              setTempIsIntimidateFilter(false);
              setTempIsWeatherFilter(false);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </SectionResetButton>
        </SectionTitleRow>
        <EtcRow>
          <CheckboxLabel>
            <CheckboxInput type="checkbox" checked={tempIsMegaFilter} onChange={(e) => setTempIsMegaFilter(e.target.checked)} />
            메가진화
          </CheckboxLabel>
          <CheckboxLabel>
            <CheckboxInput type="checkbox" checked={tempIsLegendaryFilter} onChange={(e) => setTempIsLegendaryFilter(e.target.checked)} />
            초전설
          </CheckboxLabel>
          <CheckboxLabel>
            <CheckboxInput type="checkbox" checked={tempIsIntimidateFilter} onChange={(e) => setTempIsIntimidateFilter(e.target.checked)} />
            위협
          </CheckboxLabel>
          <CheckboxLabel>
            <CheckboxInput type="checkbox" checked={tempIsWeatherFilter} onChange={(e) => setTempIsWeatherFilter(e.target.checked)} />
            날씨
          </CheckboxLabel>
        </EtcRow>

        <ModalFooter>
          <SearchButton
            onClick={() => {
              onApply({
                types: tempSelectedTypes,
                roles: tempSelectedRoles,
                isMega: tempIsMegaFilter,
                isLegendary: tempIsLegendaryFilter,
                isIntimidate: tempIsIntimidateFilter,
                isWeather: tempIsWeatherFilter,
                logic: tempLogic,
              });
              onClose();
            }}
          >
            검색
          </SearchButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default FilterModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 320px;
  max-width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  margin-right: auto;
`;

const SectionTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ModalSubTitle = styled.div`
  font-size: 0.95rem;
  font-weight: bold;
  color: #555;
`;

const SectionResetButton = styled.button`
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  width: 28px;
  height: 28px;

  &:hover {
    background-color: #43a047;
  }
`;

const LogicSwitch = styled.div`
  display: flex;
  background-color: #f0f0f0;
  border-radius: 20px;
  overflow: hidden;
  margin-right: 15px;
  cursor: pointer;
`;

const LogicOption = styled.div`
  padding: 4px 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background-color: ${(props) => (props.$active ? "#4caf50" : "transparent")};
  color: ${(props) => (props.$active ? "white" : "#666")};
  transition: all 0.2s;
`;

const CloseIcon = styled.div`
  cursor: pointer;
  font-size: 1.2rem;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #666;
  }
`;

const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const RoleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const EtcRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 4px 2px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #333;
  cursor: pointer;
  user-select: none;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4caf50;
`;

const TypeButton = styled.button`
  padding: 8px 0;
  border: 1px solid ${(props) => (props.$active ? props.$color || "#4caf50" : "#ccc")};
  background-color: ${(props) => (props.$active ? props.$color || "#4caf50" : "#fff")};
  color: ${(props) => (props.$active ? "#fff" : "#333")};
  border-radius: 6px;
  cursor: pointer;
  font-weight: ${(props) => (props.$active ? "bold" : "normal")};
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    filter: ${(props) => (props.$active ? "brightness(0.9)" : "none")};
    background-color: ${(props) => (props.$active ? props.$color || "#4caf50" : "#f5f5f5")};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 10px;
`;

const SearchButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #43a047;
  }
`;
