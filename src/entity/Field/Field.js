import { Weather } from "./Weather";
import { Terrain } from "./Terrain";
import { userField } from "./UserField";
import { Room } from "./Room";

export class Field {
  constructor() {
    this.reset();
  }

  reset() {
    this.terrain = new Terrain();
    this.weather = new Weather();
    this.player = new userField("player");
    this.npc = new userField("npc");
    this.room = new Room();
  }
}
