import { useRecoilState } from "recoil";
import { queueState, logState } from "./recoilState";
import { cloneWithMethods } from "./cloneWithMethods";

export function useQueue() {
  const [queue, setQueue] = useRecoilState(queueState);
  const [log, setLog] = useRecoilState(logState);

  const enqueue = (item) => {
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
      // ⭐️ setQueue 밖에서 log 추가 → 순수성 문제 없음
      setLog((prevLog) => [...prevLog, removedItem]);
    }

    return removedItem;
  };

  const resetQueue = () => {
    if (queue.length > 0) {
      setQueue([]);
    }
  };

  const initQueue = () => {
    if (queue.length > 0) {
      setQueue([]);
    }
    setLog([]);
  };

  const queueCheck = () => {
    if (queue.length > 0) {
      if (queue[0].skip) return true;
      //turnEnd.js에서 마지막에 넣은 "~는 무엇을 할까?"는 skip 가능하게
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
      resetQueue,
      initQueue,
      queueCheck,
    },
  };
}
