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
    return removedItem;
  };

  return { queue, enqueue, dequeue };
}
