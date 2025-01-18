function skillEffectSearch(name) {
  const functions = {
    화상10: (Battle, enqueue) => {
      let def = Battle[Battle.def];
      if (def.type1 == "불꽃" || def.type2 == "불꽃") {
        return;
      }
      if (
        def.status.burn != null ||
        def.status.freeze != null ||
        def.status.sleep != null ||
        def.status.poision != null ||
        def.status.mabi != null
      ) {
        return;
      }
      if (Math.random() > 0.1) {
        return;
      }
      let fireText = Battle[Battle.def].origin.names + " 화상을 입었다!";
      if (Battle.def == "npc") {
        fireText = "상대 " + fireText;
      }
      def.status.burn = true;
      enqueue({
        battle: Battle,
        text: fireText,
      });
    },
    얼음치료: (Battle, enqueue) => {
      let def = Battle[Battle.def];
      if (def.status.freeze == null) {
        return;
      }
      let freezeCureText = def.origin.name + "의 얼음이 녹았다!";
      if (Battle.def == "npc") {
        freezeCureText = "상대 " + freezeCureText;
      }
      def.status.freeze = null;
      enqueue({
        battle: Battle,
        text: freezeCureText,
      });
    },
    풀죽음: (Battle, enqueue) => {
      let def = Battle[Battle.def];
      if (Math.random() > 3) {
        return;
      }
      def.temp.fullDeath = true;
    },
  };

  return functions[name] || null;
}

export default skillEffectSearch;
