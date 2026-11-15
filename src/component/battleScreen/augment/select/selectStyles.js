import styled from "styled-components";

export const HeaderArea = styled.div`
  width: 100%;
  margin-bottom: 12px;
`;

export const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
`;

export const SubTitleText = styled.p`
  margin: 6px 0 0 0;
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  word-break: keep-all;
`;

export const CloseButton = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #fff;
    background: rgba(239, 68, 68, 0.6);
    border-color: rgba(239, 68, 68, 0.8);
  }

  &:active {
    transform: scale(0.92);
  }
`;

export const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
  margin-top: auto;
  padding-top: 14px;
  box-sizing: border-box;
`;

export const ActionButton = styled.button`
  flex: 1;
  padding: 10px 0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  transition: all 0.2s ease;
  user-select: none;

  ${(props) =>
    props.$variant === "back"
      ? `
    background: ${props.disabled ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.08)"};
    border: ${props.disabled ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(255, 255, 255, 0.2)"};
    color: ${props.disabled ? "#64748b" : "#cbd5e1"};
    cursor: ${props.disabled ? "not-allowed" : "pointer"};
    opacity: ${props.disabled ? 0.55 : 1};

    &:hover {
      ${
        !props.disabled &&
        `
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-1px);
      `
      }
    }

    &:active {
      ${!props.disabled && `transform: translateY(1px);`}
    }
  `
      : `
    background: ${props.disabled ? "rgba(255, 255, 255, 0.05)" : "linear-gradient(135deg, #0d9488, #0284c7)"};
    border: ${props.disabled ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #64ffda"};
    color: ${props.disabled ? "#64748b" : "#ffffff"};
    cursor: ${props.disabled ? "not-allowed" : "pointer"};
    box-shadow: ${props.disabled ? "none" : "0 0 12px rgba(100, 255, 218, 0.35)"};

    &:hover {
      ${
        !props.disabled &&
        `
        background: linear-gradient(135deg, #14b8a6, #0284c7);
        box-shadow: 0 0 16px rgba(100, 255, 218, 0.55);
        transform: translateY(-1px);
      `
      }
    }

    &:active {
      ${!props.disabled && `transform: translateY(1px);`}
    }
  `}
`;
