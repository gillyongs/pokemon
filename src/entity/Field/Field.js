import { Weather } from "./Weather";
import { Terrain } from "./Terrain";
import { userField } from "./UserField";

export class Field {
  constructor() {
    this.reset();
  }

  reset() {
    this.terrain = new Terrain();
    this.weather = new Weather();
    this.player = new userField("player");
    this.npc = new userField("npc");

    this.trickRoom = null;
    //공간변화는 중첩가능
  }

  get isTrickRoom() {
    return this.trickRoom !== null;
  }

  handleTrickRoom(battle, enqueue) {
    if (this.trickRoom === null) {
      this.trickRoom = 5;
      enqueue({
        battle,
        text: "주변의 시공이 뒤틀어졌다!",
      });
    } else {
      //트릭룸 두번쓰면 없어진다
      this.trickRoom = null;
      enqueue({ battle, text: "뒤틀린 시공이 원래대로 되돌아왔다!" });
    }
  }

  // 턴 종료시 날씨 처리
  handleTrickRoomTurnEnd(battle, enqueue) {
    // 선후공 상관없이 사용한 턴 포함 5턴
    if (this.trickRoom === null) return;
    this.trickRoom--;
    if (this.trickRoom <= 0) {
      battle.field.trickRoom = null;
      enqueue({ battle, text: "뒤틀린 시공이 원래대로 되돌아왔다!" });
    }
  }
}
