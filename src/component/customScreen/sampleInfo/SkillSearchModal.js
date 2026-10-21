import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { getSkillListForPokemon } from "../../../skill/PokemonSkillList";
import skillList from "../../../entity/Skill/skillList";

const ALL_TYPES = ["노말", "불꽃", "물", "풀", "전기", "얼음", "격투", "독", "땅", "비행", "에스퍼", "벌레", "바위", "고스트", "드래곤", "악", "강철", "페어리"];

const CATEGORIES = ["전체", "물리", "특수", "변화"];

const SkillSearchModal = ({ pokemon, equippedSkills = {}, onSave, onSelect, onClose }) => {
  const [selectedSkills, setSelectedSkills] = useState(() => {
    if (Array.isArray(equippedSkills)) {
      return [equippedSkills[0] || null, equippedSkills[1] || null, equippedSkills[2] || null, equippedSkills[3] || null];
    }
    return [equippedSkills[1] || null, equippedSkills[2] || null, equippedSkills[3] || null, equippedSkills[4] || null];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedType, setSelectedType] = useState("전체");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");

  const allSkills = useMemo(() => {
    return getSkillListForPokemon(pokemon);
  }, [pokemon]);

  const selectedCount = selectedSkills.filter(Boolean).length;

  const handleRemoveSlot = (index) => {
    setSelectedSkills((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setNoticeMessage("");
  };

  const handleToggleSkill = (skillItem) => {
    if (!skillItem.isImplemented) return;

    const slotIdx = selectedSkills.findIndex((name) => name === skillItem.name);
    if (slotIdx !== -1) {
      // 이미 선택된 기술 -> 슬롯에서 제외
      handleRemoveSlot(slotIdx);
    } else {
      // 선택되지 않은 기술 -> 첫 번째 빈 슬롯에 장착
      const emptyIdx = selectedSkills.findIndex((s) => !s);
      if (emptyIdx !== -1) {
        setSelectedSkills((prev) => {
          const next = [...prev];
          next[emptyIdx] = skillItem.name;
          return next;
        });
        setNoticeMessage("");
      } else {
        setNoticeMessage("기술은 최대 4개까지 선택할 수 있습니다. 변경하려면 기존 기술을 먼저 제외해주세요.");
      }
    }
  };

  const handleSave = () => {
    if (selectedCount < 4) return;
    const skillsObj = {
      1: selectedSkills[0] || "",
      2: selectedSkills[1] || "",
      3: selectedSkills[2] || "",
      4: selectedSkills[3] || "",
    };
    if (onSave) onSave(skillsObj);
    if (onSelect) onSelect(skillsObj);
    onClose();
  };

  const filteredSkills = useMemo(() => {
    return allSkills.filter((item) => {
      // 1. 이름 검색 필터
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        if (!item.name.toLowerCase().includes(term)) {
          return false;
        }
      }

      // 2. 분류 필터 (물리 / 특수 / 변화)
      if (selectedCategory !== "전체") {
        if (item.category !== selectedCategory) {
          return false;
        }
      }

      // 3. 타입 필터
      if (selectedType !== "전체") {
        if (item.type !== selectedType) {
          return false;
        }
      }

      return true;
    });
  }, [allSkills, searchTerm, selectedCategory, selectedType]);

  const hasActiveFilter = selectedCategory !== "전체" || selectedType !== "전체";

  const handleResetFilter = () => {
    setSelectedCategory("전체");
    setSelectedType("전체");
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose} aria-label="닫기">
          ✕
        </CloseButton>

        <HeaderArea>
          <TitleRow>
            <Title>기술 선택</Title>
          </TitleRow>

          {/* 상단 선택된 4개 기술 슬롯 영역 */}
          <SlotsArea>
            <SlotsRow>
              {[0, 1, 2, 3].map((idx) => {
                const skillName = selectedSkills[idx];
                const skillInfo = skillName ? allSkills.find((s) => s.name === skillName) || skillList.search(skillName) : null;
                const skillType = skillInfo?.type || "노말";

                return (
                  <SlotCard
                    key={idx}
                    $hasSkill={Boolean(skillName)}
                    onClick={() => {
                      if (skillName) handleRemoveSlot(idx);
                    }}
                    title={skillName ? `${skillName} (클릭하여 슬롯에서 제외)` : `슬롯 ${idx + 1} (비어있음)`}
                  >
                    {skillName ? (
                      <>
                        <RemoveSlotBtn
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSlot(idx);
                          }}
                          aria-label="제외"
                        >
                          ✕
                        </RemoveSlotBtn>
                        <SlotTypeIcon src={`/pokemon/img/type/${skillType}.svg`} alt={skillType} />
                        <SlotSkillName>{skillName}</SlotSkillName>
                      </>
                    ) : (
                      <EmptySlotText>
                        <PlusSign>+</PlusSign>
                        <EmptySlotLabel>슬롯 {idx + 1}</EmptySlotLabel>
                      </EmptySlotText>
                    )}
                  </SlotCard>
                );
              })}
            </SlotsRow>

            {noticeMessage && <NoticeBanner>{noticeMessage}</NoticeBanner>}
          </SlotsArea>

          <SearchFilterRow>
            <SearchInput type="text" placeholder="기술 이름 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <FilterToggleBtn type="button" $isActive={isFilterOpen || hasActiveFilter} onClick={() => setIsFilterOpen((prev) => !prev)}>
              필터 {hasActiveFilter ? "●" : "▼"}
            </FilterToggleBtn>
          </SearchFilterRow>

          {isFilterOpen && (
            <FilterPanel>
              <FilterSection>
                <FilterLabelRow>
                  <FilterSectionTitle>분류</FilterSectionTitle>
                </FilterLabelRow>
                <ButtonGroup>
                  {CATEGORIES.map((cat) => (
                    <CategoryChip key={cat} type="button" $isSelected={selectedCategory === cat} $category={cat} onClick={() => setSelectedCategory(cat)}>
                      {cat === "전체" ? "전체" : `${cat}기`}
                    </CategoryChip>
                  ))}
                </ButtonGroup>
              </FilterSection>

              <FilterSection style={{ marginTop: "10px" }}>
                <FilterLabelRow>
                  <FilterSectionTitle>타입</FilterSectionTitle>
                  {false && hasActiveFilter && (
                    <ResetBtn type="button" onClick={handleResetFilter}>
                      초기화
                    </ResetBtn>
                  )}
                </FilterLabelRow>
                <TypeChipGrid>
                  <TypeChip type="button" $isSelected={selectedType === "전체"} onClick={() => setSelectedType("전체")}>
                    전체
                  </TypeChip>
                  {ALL_TYPES.map((type) => (
                    <TypeChip key={type} type="button" $isSelected={selectedType === type} onClick={() => setSelectedType(type)}>
                      <img src={`/pokemon/img/type/${type}.svg`} alt={type} style={{ width: "14px", height: "14px", marginRight: "3px" }} />
                      {type}
                    </TypeChip>
                  ))}
                </TypeChipGrid>
              </FilterSection>
            </FilterPanel>
          )}
        </HeaderArea>

        <ListArea>
          {filteredSkills.length === 0 ? (
            <EmptyState>조건에 맞는 기술이 없습니다.</EmptyState>
          ) : (
            <Grid>
              {filteredSkills.map((item) => {
                const isSelected = selectedSkills.includes(item.name);
                const isClickable = item.isImplemented;

                let tooltip = "";
                if (!item.isImplemented) {
                  tooltip = `${item.name} (미구현 기술로 선택할 수 없습니다)`;
                } else if (isSelected) {
                  tooltip = `${item.name} (클릭하여 슬롯에서 제외)`;
                } else {
                  tooltip = `${item.name}: ${item.originText || item.text}`;
                }

                return (
                  <SkillCard key={item.name} $isImplemented={item.isImplemented} $isSelected={isSelected} onClick={() => handleToggleSkill(item)} title={tooltip}>
                    <TypeIconWrapper>
                      <img src={`/pokemon/img/type/${item.type}.svg`} alt={item.type} style={{ width: "26px", height: "26px", borderRadius: "4px" }} />
                    </TypeIconWrapper>

                    <InfoCol>
                      <NameRow>
                        <SkillName $isImplemented={item.isImplemented}>{item.name}</SkillName>

                        <TypeBadge>{item.type}</TypeBadge>

                        <CategoryBadge $category={item.category}>{item.category}</CategoryBadge>

                        {item.isImplemented ? isSelected ? <Badge $type="equipped">선택됨 ✓</Badge> : <Badge $type="ready">+ 추가</Badge> : <Badge $type="unimplemented">미구현</Badge>}
                      </NameRow>

                      <StatRow>
                        <span>
                          위력 <strong>{item.power}</strong>
                        </span>
                        <StatDivider>•</StatDivider>
                        <span>
                          명중 <strong>{item.accur}</strong>
                        </span>
                        <StatDivider>•</StatDivider>
                        <span>
                          PP <strong>{item.pp}</strong>
                        </span>
                      </StatRow>

                      <SkillDesc $isImplemented={item.isImplemented}>{item.originText || item.text}</SkillDesc>
                    </InfoCol>
                  </SkillCard>
                );
              })}
            </Grid>
          )}
        </ListArea>

        <ModalFooter>
          <ConfirmButton type="button" disabled={selectedCount < 4} onClick={handleSave}>
            기술 선택 완료
          </ConfirmButton>
        </ModalFooter>
      </ModalBox>
    </ModalOverlay>
  );
};

export default SkillSearchModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1300;
  backdrop-filter: blur(2px);
`;

const ModalBox = styled.div`
  position: relative;
  background: white;
  border-radius: 14px;
  padding: 16px 14px;
  width: 92vw;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #333;
  box-sizing: border-box;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  font-size: 1.3rem;
  line-height: 1;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    color: #333;
    background: #f0f0f0;
  }
`;

const HeaderArea = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  text-align: left;
  flex-shrink: 0;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: #222;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SlotsArea = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 10px 10px 8px 10px;
  margin-bottom: 10px;
`;

const SlotsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const SlotsTitle = styled.div`
  font-size: 0.88rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CountBadge = styled.span`
  background: #4caf50;
  color: white;
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: bold;
`;

const SlotsSubText = styled.span`
  font-size: 0.72rem;
  color: #888;
`;

const SlotsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;

const SlotCard = styled.div`
  position: relative;
  height: 52px;
  background: ${({ $hasSkill }) => ($hasSkill ? "#ffffff" : "#f1f3f5")};
  border: ${({ $hasSkill }) => ($hasSkill ? "1.5px solid #4caf50" : "1.5px dashed #ced4da")};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 4px;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    ${({ $hasSkill }) => ($hasSkill ? "border-color: #f44336; background: #fff5f5;" : "border-color: #adb5bd;")}
  }
`;

const RemoveSlotBtn = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: white;
  border: none;
  font-size: 9px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;

  &:hover {
    background: #f44336;
  }
`;

const SlotTypeIcon = styled.img`
  width: 15px;
  height: 15px;
  border-radius: 3px;
  margin-bottom: 2px;
`;

const SlotSkillName = styled.span`
  font-size: 0.68rem;
  font-weight: bold;
  color: #333;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 2px;
  box-sizing: border-box;
`;

const EmptySlotText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
`;

const PlusSign = styled.span`
  font-size: 0.9rem;
  font-weight: bold;
  line-height: 1;
`;

const EmptySlotLabel = styled.span`
  font-size: 0.62rem;
  margin-top: 2px;
`;

const NoticeBanner = styled.div`
  margin-top: 6px;
  padding: 5px 8px;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeeba;
  border-radius: 6px;
  font-size: 0.75rem;
  text-align: center;
`;

const SearchFilterRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }
`;

const FilterToggleBtn = styled.button`
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid ${({ $isActive }) => ($isActive ? "#4caf50" : "#ddd")};
  background-color: ${({ $isActive }) => ($isActive ? "#e8f5e9" : "#fff")};
  color: ${({ $isActive }) => ($isActive ? "#2e7d32" : "#555")};
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ $isActive }) => ($isActive ? "#c8e6c9" : "#f5f5f5")};
  }
`;

const FilterPanel = styled.div`
  margin-top: 8px;
  padding: 8px 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
  max-height: 160px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterSectionTitle = styled.span`
  font-size: 0.78rem;
  font-weight: bold;
  color: #666;
`;

const ResetBtn = styled.button`
  background: none;
  border: none;
  font-size: 0.72rem;
  color: #d32f2f;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const CategoryChip = styled.button`
  padding: 4px 10px;
  font-size: 0.8rem;
  border-radius: 14px;
  border: 1px solid
    ${({ $isSelected, $category }) => {
      if (!$isSelected) return "#ddd";
      if ($category === "물리") return "#c62828";
      if ($category === "특수") return "#1565c0";
      if ($category === "변화") return "#455a64";
      return "#4caf50";
    }};
  background-color: ${({ $isSelected, $category }) => {
    if (!$isSelected) return "#fff";
    if ($category === "물리") return "#ffebee";
    if ($category === "특수") return "#e3f2fd";
    if ($category === "변화") return "#eceff1";
    return "#e8f5e9";
  }};
  color: ${({ $isSelected, $category }) => {
    if (!$isSelected) return "#666";
    if ($category === "물리") return "#c62828";
    if ($category === "특수") return "#1565c0";
    if ($category === "변화") return "#37474f";
    return "#2e7d32";
  }};
  font-weight: ${({ $isSelected }) => ($isSelected ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const TypeChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const TypeChip = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 3px 7px;
  font-size: 0.72rem;
  border-radius: 12px;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? "#4caf50" : "#ddd")};
  background-color: ${({ $isSelected }) => ($isSelected ? "#e8f5e9" : "#fff")};
  color: ${({ $isSelected }) => ($isSelected ? "#2e7d32" : "#555")};
  font-weight: ${({ $isSelected }) => ($isSelected ? "bold" : "normal")};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const ListArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 4px 4px 2px;
  min-height: 0;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  padding: 40px 0;
  color: #888;
  font-size: 0.95rem;
`;

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 3px 0;
`;

const SkillCard = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid
    ${({ $isSelected, $isImplemented }) => {
      if (!$isImplemented) return "#e0e0e0";
      if ($isSelected) return "#4caf50";
      return "#eee";
    }};
  background-color: ${({ $isSelected, $isImplemented }) => {
    if (!$isImplemented) return "#f8f9fa";
    if ($isSelected) return "#f1f8e9";
    return "#ffffff";
  }};
  cursor: ${({ $isImplemented }) => ($isImplemented ? "pointer" : "not-allowed")};
  opacity: ${({ $isImplemented }) => ($isImplemented ? 1 : 0.6)};
  transition: all 0.15s ease-in-out;
  text-align: left;
  user-select: none;

  ${({ $isImplemented }) =>
    $isImplemented &&
    `
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
      border-color: #4caf50;
    }
  `}
`;

const TypeIconWrapper = styled.div`
  flex: 0 0 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
`;

const InfoCol = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SkillName = styled.span`
  font-size: 0.95rem;
  font-weight: bold;
  color: ${({ $isImplemented }) => ($isImplemented ? "#222" : "#888")};
`;

const TypeBadge = styled.span`
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #f0f0f0;
  color: #555;
  font-weight: bold;
`;

const CategoryBadge = styled.span`
  font-size: 0.72rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: ${({ $category }) => {
    if ($category === "물리") return "#c62828";
    if ($category === "특수") return "#1565c0";
    return "#37474f";
  }};
  background-color: ${({ $category }) => {
    if ($category === "물리") return "#ffebee";
    if ($category === "특수") return "#e3f2fd";
    return "#eceff1";
  }};
`;

const Badge = styled.span`
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  color: white;
  background-color: ${({ $type }) => {
    if ($type === "equipped") return "#2e7d32";
    if ($type === "ready") return "#4caf50";
    return "#9e9e9e";
  }};
`;

const StatRow = styled.div`
  font-size: 0.78rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;

  strong {
    color: #333;
  }
`;

const StatDivider = styled.span`
  color: #ccc;
  font-size: 0.7rem;
`;

const SkillDesc = styled.span`
  font-size: 0.78rem;
  color: ${({ $isImplemented }) => ($isImplemented ? "#666" : "#aaa")};
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ModalFooter = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 10px 0;
  font-size: 1rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  background: ${({ disabled }) => (disabled ? "#ccc" : "#4caf50")};
  color: white;
  transition: all 0.2s;

  &:hover {
    ${({ disabled }) => !disabled && "background: #43a047; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.25);"}
  }
`;
