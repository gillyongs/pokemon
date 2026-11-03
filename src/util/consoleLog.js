// 전역 logArr 및 consoleLog 함수
export const logArr = [];

const listeners = new Set();

export const subscribeDebugLogs = (listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const clearDebugLogs = () => {
  logArr.length = 0;
  listeners.forEach((fn) => fn([...logArr]));
};

export const consoleLog = (...args) => {
  console.log(...args);
  const now = new Date();
  const time = now.toLocaleTimeString() + "." + String(now.getMilliseconds()).padStart(3, "0");
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });

  const entry = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    time,
    raw: args,
    text: formattedArgs.join(" "),
  };

  logArr.push(entry);
  listeners.forEach((fn) => fn([...logArr]));
};

// 브라우저 및 전역 스코프 등록 (window)
if (typeof window !== "undefined") {
  window.consoleLog = consoleLog;
  window.logArr = logArr;
  window.clearDebugLogs = clearDebugLogs;
}
