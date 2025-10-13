import { useRecoilState } from "recoil";
import { queueState } from "./recoilState";

export function useQueue() {
  const [queue, setQueue] = useRecoilState(queueState);

  const enqueue = (item) => {
    const deepCopiedItem = structuredClone(item); // 깊은 복사
    setQueue((prevQueue) => [...prevQueue, deepCopiedItem]);
  };

  const dequeue = () => {
    let removedItem = null;
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue;
      removedItem = prevQueue[0];
      return prevQueue.slice(1);
    });
    // console.log("dequeue");
    // console.log(removedItem);
    return removedItem;
  };

  const resetQueue = () => {
    if (queue.length > 0) {
      setQueue([]);
    }
  };

  const queueCheck = () => {
    if (queue.length > 0) {
      if (queue[0].skip) {
        //turnEnd.js에서 마지막에 넣은 "~는 무엇을 할까?"는 skip 가능하게
        return true;
      }
      return false;
    }
    return true;
  };

  const queueObject = {
    queue: queue,
    enqueue: enqueue,
    dequeue: dequeue,
    resetQueue: resetQueue,
    queueCheck: queueCheck,
  };

  return { queueObject };
}
