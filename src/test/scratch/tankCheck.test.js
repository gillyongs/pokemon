import sampleList from "../../entity/Pokemon/SamplePokemon";

describe("탱커 추론", () => {
  it("물리/특수 내구력 계산", () => {
    const list = sampleList.items;
    let phys = [];
    let spec = [];
    
    list.forEach(p => {
      // 내구력 계산 (단위: 1)
      const hp = p.hp;
      const def = p.stat.def;
      const cdef = p.stat.cdef;
      phys.push({ name: p.id, bulk: hp * def, hp, def });
      spec.push({ name: p.id, bulk: hp * cdef, hp, cdef });
    });
    
    phys.sort((a,b) => b.bulk - a.bulk);
    spec.sort((a,b) => b.bulk - a.bulk);
    
    console.log("=== 물리 내구 TOP 20 ===");
    phys.slice(0, 20).forEach((p, idx) => console.log(`${idx+1}. ${p.name}: ${p.bulk} (HP ${p.hp}, DEF ${p.def})`));
    
    console.log("\n=== 특수 내구 TOP 20 ===");
    spec.slice(0, 20).forEach((p, idx) => console.log(`${idx+1}. ${p.name}: ${p.bulk} (HP ${p.hp}, CDEF ${p.cdef})`));
  });
});
