import { useRecoilState } from "recoil";
import { queueState, logState } from "./recoilState";
import { cloneWithMethods } from "./cloneWithMethods";

export function useQueue() {
  const [queue, setQueue] = useRecoilState(queueState);
  const [log, setLog] = useRecoilState(logState);

  // item = {battle, text, allowAct=true, autoActTurn=true, noLog=true, onlyLog=true, bottomMode, waitInput}
  // bottomMode: 화면 하단 UI(bottom)의 모드를 지정 ("skill" | "mustSwitch" | "uturn" | "auto")
  // waitInput: 유저의 입력(기술/교체 선택 등)을 기다리기 위해 큐 진행을 멈춰야 하는 아이템인지 여부 (true/false)

  // allowAct: 행동 (기술버튼, 교체버튼) 잠금 해제
  // 밑의 queueCheck에서 사용
  // 턴 종료시 "무엇을 할까?" (turnEnd.js),
  // 유턴 사용시 "누구로 교체할까?" (skillEffect.js),
  // 스킬 사용 불가 메세지 (pp소진, 구애 고정, 도발) (Skillbutton.js)

  // autoActTurn: 이전 턴의 행동(역린, 메테오빔, 파괴광선)으로 인해 행동이 자동으로 결정되는 경우
  // battleScreen.js에서 사용
  // turnEnd.js에서 auto, charge, recharge중 하나라도 on이면 턴 종료시 삽입함

  // noLog: 화면엔 나오지만 로그 기록 모달에 남지 않음
  // 밑의 dequeue에서 noLog면 넣지 않음
  // 스킬 사용 불가 메세지 (pp소진, 구애 고정, 도발) (Skillbutton.js)를 로그 목록에 넣지 않음.
  // 무엇을 할까? 누구로 교체할까?는 그냥 텍스트로 조건문 처리

  // onlyLog : 반대로 화면엔 안나오지만 로그 목록에 넣음 (N번쨰 턴)
  // battleScreen에서 onlyLog면 바로 dequeue함
  // battleStart에서 시작할때마다 넣음

  const enqueue = (item) => {
    if (item && !item.id) {
      item.id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    }
    const deepCopiedItem = cloneWithMethods(item); // 메서드까지 깊은 복사하는 함수
    setQueue((prevQueue) => [...prevQueue, deepCopiedItem]);
  };

  const dequeue = () => {
    let removedItem = null;

    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;

      removedItem = prevQueue[0];
      return prevQueue.slice(1);
    });

    if (removedItem) {
      if (!(removedItem.text && (removedItem.text.includes("무엇을 할까?") || removedItem.text.includes("누구로 교체")))) {
        if (!removedItem.noLog) {
          // logText가 있으면 로그에는 logText로 기록 (화면 표시 텍스트와 다르게)
          const logItem = removedItem.logText ? { ...removedItem, text: removedItem.logText } : removedItem;
          setLog((prevLog) => [...prevLog, logItem]);
        }
      }
    }

    return removedItem;
  };

  const updateHead = (updater, curBattle) => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      const head = typeof updater === "function" ? updater(prevQueue[0]) : updater;
      const deepCopiedHead = cloneWithMethods(head);

      if (!curBattle) {
        return [deepCopiedHead, ...prevQueue.slice(1)];
      }

      const rest = prevQueue.slice(1).map((item) => {
        if (!item.battle) return item;
        const nextItemBattle = cloneWithMethods(item.battle);
        const sourceTeam = [curBattle.player, curBattle.playerBench1, curBattle.playerBench2];
        const targetTeam = [nextItemBattle.player, nextItemBattle.playerBench1, nextItemBattle.playerBench2];
        sourceTeam.forEach((sPoke, pIdx) => {
          if (sPoke && targetTeam[pIdx]) {
            if (sPoke.id !== targetTeam[pIdx].id) {
              const clonedPoke = cloneWithMethods(sPoke);
              if (pIdx === 0) nextItemBattle.player = clonedPoke;
              else if (pIdx === 1) nextItemBattle.playerBench1 = clonedPoke;
              else if (pIdx === 2) nextItemBattle.playerBench2 = clonedPoke;
            } else {
              targetTeam[pIdx].augments = cloneWithMethods(sPoke.augments || []);
              if (sPoke.origin?.stat && targetTeam[pIdx].origin?.stat) {
                targetTeam[pIdx].origin.stat = cloneWithMethods(sPoke.origin.stat);
              }
            }
          }
        });
        return {
          ...item,
          battle: nextItemBattle,
        };
      });

      return [deepCopiedHead, ...rest];
    });
  };

  const resetQueue = () => {
    setQueue((prev) => (prev.length > 0 ? [] : prev));
  };

  const initQueue = () => {
    setQueue((prev) => (prev.length > 0 ? [] : prev));
    setLog([]);
  };

  const queueCheck = () => {
    if (queue.length > 0) {
      if (queue[0].allowAct) return true;
      //turnEnd.js에서 마지막에 넣은 "~는 무엇을 할까?"는 allowAct 가능하게
      return false;
    }
    return true;
  };

  return {
    queueObject: {
      queue,
      log,
      enqueue,
      dequeue,
      updateHead,
      resetQueue,
      initQueue,
      queueCheck,
    },
  };
}
