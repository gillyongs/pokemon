import { speedCheck } from "../../util/speedCheck";

export class Terrain {
  #type = null; // 그래스필드, 일렉트릭필드
  #turnRemain = null; // 남은 턴 수

  get() {
    return this.#type;
  }

  get isGrassField() {
    return this.#type === "그래스필드";
    // 턴 종료 회복, 그래스슬라이더 우선도
  }

  get isElectricField() {
    return this.#type === "일렉트릭필드";
    // 하드론엔진, 수면 방지
  }

  #setTerrain(terrainType, turnRemain, enqueue, battle, terrainText) {
    this.#type = terrainType;
    this.#turnRemain = turnRemain;
    if (terrainText) enqueue({ battle, text: terrainText });
  }

  setTerrainOnBattle(battle, enqueue, pokemon, terrainType, terrainText) {
    if (this.#type === terrainType) return; // 이미 같은 필드면 무시
    const endedType = this.#type;

    // const itemExtendMap = {
    //   비: "축축한바위",
    //   쾌청: "뜨거운바위",
    // };

    const baseTurn = 5;
    // const turnRemain = pokemon.item === itemExtendMap[weatherType] ? 8 : baseTurn;

    this.#setTerrain(terrainType, baseTurn, enqueue, battle, terrainText);
  }

  // 턴 종료시 날씨 처리
  handleTerrainTurnEnd(battle, enqueue) {
    if (this.#type === null) return;

    if (this.#type === "그래스필드") {
      const fastUser = speedCheck(battle);
      const slowUser = fastUser === "npc" ? "player" : "npc";

      for (const user of [fastUser, slowUser]) {
        const p = battle[user];
        if (!p.faint && p.hp < p.origin.hp && !p.isFlying(battle)) {
          p.recover(battle, Math.floor(p.origin.hp / 16), enqueue, `[그래스필드] ${p.name}의 체력이 회복되었다!`);
        }
      }
    }

    this.#turnRemain--;
    if (this.#turnRemain <= 0) {
      this.#handleTerrainEnd(battle, enqueue);
    }
  }

  #handleTerrainEnd(battle, enqueue) {
    const endedType = this.#type;
    this.#type = null;
    this.#turnRemain = null;

    const endTextMap = {
      그래스필드: "발밑의 풀이 사라졌다!",
      일렉트릭필드: "발밑의 전기가 사라졌다!",
    };
    enqueue({ battle, text: endTextMap[endedType] });
  }
}
