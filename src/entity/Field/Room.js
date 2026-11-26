export class Room {
  //공간변화는 중첩가능
  #trickRoom = null; // 남은 턴 수 또는 null
  _trickRoom = null;

  get trickRoom() {
    try {
      return this.#trickRoom;
    } catch {
      return this._trickRoom ?? null;
    }
  }

  // 활성 상태 확인
  get isTrickRoom() {
    return this.trickRoom !== null;
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
    this._trickRoom = this.#trickRoom;

    if (this.#trickRoom <= 0) {
      this.#end(battle, enqueue);
    }
  }

  // 발동
  #activate(battle, enqueue) {
    this.#trickRoom = 5;
    this._trickRoom = 5;
    enqueue(battle, "주변의 시공이 뒤틀어졌다!", "room_trick_start");
  }

  // 종료
  #end(battle, enqueue) {
    this.#trickRoom = null;
    this._trickRoom = null;
    enqueue(battle, "뒤틀린 시공이 원래대로 되돌아왔다!", "room_trick_end");
  }
}
