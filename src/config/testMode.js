// 전역 testmode 및 선택된 NPC 행동 관리
export let testmode = true;
export let selectedNpcAct = null;

const listeners = new Set();

export const setTestmode = (val) => {
  testmode = val;
  if (typeof window !== "undefined") {
    window.testmode = val;
  }
  listeners.forEach((listener) => listener({ testmode, selectedNpcAct }));
};

export const setSelectedNpcAct = (val) => {
  selectedNpcAct = val;
  if (typeof window !== "undefined") {
    window.selectedNpcAct = val;
  }
  listeners.forEach((listener) => listener({ testmode, selectedNpcAct }));
};

export const subscribeTestMode = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

if (typeof window !== "undefined") {
  window.testmode = testmode;
  window.selectedNpcAct = selectedNpcAct;
  window.setTestmode = setTestmode;
  window.setSelectedNpcAct = setSelectedNpcAct;
}
