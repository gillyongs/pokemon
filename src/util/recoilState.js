import { atom } from "recoil";
import { defaultOption } from "../config/defaultOption";

export const getStoredGameOption = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem("pokemon_game_option");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          difficulty: parsed.difficulty || defaultOption.difficulty,
          teamOption: parsed.teamOption || defaultOption.teamOption,
        };
      }
    }
  } catch (e) {
    // ignore
  }
  return {
    difficulty: defaultOption.difficulty,
    teamOption: defaultOption.teamOption,
  };
};

export const queueState = atom({
  key: "queueState",
  default: [],
});

export const logState = atom({
  key: "logState",
  default: [],
});

export const gameOptionState = atom({
  key: "gameOptionState",
  default: getStoredGameOption(),
  effects: [
    ({ onSet }) => {
      onSet((newVal) => {
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem("pokemon_game_option", JSON.stringify(newVal));
          }
        } catch (e) {
          // ignore
        }
      });
    },
  ],
});
