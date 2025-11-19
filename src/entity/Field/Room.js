export class Room {
  //공간변화는 중첩가능
  #trickRoom = null; // 남은 턴 수 또는 null

  // 활성 상태 확인
  get isTrickRoom() {
    return this.#trickRoom !== null;
  }

  handleTrickRoom(battle, enqueue) {
    if (!this.isTrickRoom) {
      this.#activate(battle, enqueue);
    } else {
      // 트릭룸 상태로 트릭룸 사용시 원래대로 돌아온다
      this.#end(battle, enqueue);
    }
  }

  handleTrickRoomTurnEnd(battle, enqueue) {
    if (!this.isTrickRoom) return;

    this.#trickRoom--;

    if (this.#trickRoom <= 0) {
      this.#end(battle, enqueue);
    }
  }

  // 발동
  #activate(battle, enqueue) {
    this.#trickRoom = 5;
    enqueue({
      battle,
      text: "주변의 시공이 뒤틀어졌다!",
    });
  }

  // 종료
  #end(battle, enqueue) {
    this.#trickRoom = null;
    enqueue({
      battle,
      text: "뒤틀린 시공이 원래대로 되돌아왔다!",
    });
  }
}
