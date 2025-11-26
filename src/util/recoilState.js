import { atom } from "recoil";

export const queueState = atom({
  key: "queueState",
  default: [],
});

export const logState = atom({
  key: "logState",
  default: [],
});
