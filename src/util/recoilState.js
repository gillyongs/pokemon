import { atom } from "recoil";

export const queueState = atom({
    key: "queueState",
    default: [],
  });