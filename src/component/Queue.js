import React, { useState } from "react";

const createBattle = (id1, id2) => {
  return { id1, id2, timestamp: Date.now() };
};

export default function App() {
  const [queue, setQueue] = useState([]); // 큐를 관리하는 상태
  const [current, setCurrent] = useState(null); // 현재 값

  // 큐에 값을 추가하는 함수
  const enqueue = (battle, text) => {
    setQueue((prevQueue) => [...prevQueue, { battle, text }]);
  };

  // 큐에서 값을 제거하고 현재 값으로 설정하는 함수
  const dequeue = () => {
    setQueue((prevQueue) => {
      if (prevQueue.length === 0) return prevQueue; // 큐가 비어있으면 그대로 반환
      const [next, ...rest] = prevQueue; // 큐의 첫 번째 요소를 가져오고 나머지를 저장
      setCurrent(next); // 현재 값을 업데이트
      return rest; // 나머지 요소를 새로운 큐로 설정
    });
  };

  return (
    <div>
      <h1>Queue System</h1>
      <div>
        <button
          onClick={() => enqueue(createBattle("0001", "0002"), "Battle starts!")}
        >
          Add to Queue
        </button>
        <button onClick={dequeue}>Next in Queue</button>
      </div>
      <div>
        <h2>Current</h2>
        {current ? (
          <div>
            <p>Battle: {current.battle.id1} vs {current.battle.id2}</p>
            <p>Text: {current.text}</p>
          </div>
        ) : (
          <p>No current item</p>
        )}
      </div>
      <div>
        <h2>Queue</h2>
        {queue.length > 0 ? (
          queue.map((item, index) => (
            <div key={index}>
              <p>
                Battle: {item.battle.id1} vs {item.battle.id2}
              </p>
              <p>Text: {item.text}</p>
            </div>
          ))
        ) : (
          <p>Queue is empty</p>
        )}
      </div>
    </div>
  );
}
