import { josa } from "josa";

export const abilObject = {
  복안: { text: "기술의 명중률이 1.3배 올라간다." },
  리베로: { text: "배틀에 나올 때 마다 단 한 번 자신이 사용한 기술과 같은 타입으로 변화한다." },
  변환자재: { text: "배틀에 나올 때 마다 단 한 번 자신이 사용한 기술과 같은 타입으로 변화한다." },
  총대장: { text: "쓰러진 아군의 수만큼 공격과 특수공격이 10% 올라간다." },
  짓궂은마음: { text: "변화기의 우선도가 +1된다. 대신 악타입에게 쓴 변화기가 무효화된다." },
  곡예: { text: "장착한 도구가 없어지면 스피드가 2배가 된다." },
  지구력: { text: "공격을 받으면 방어가 1랭크 올라간다." },
  예리함: { text: "베는 기술의 위력이 1.5배가 된다." },
  단단한발톱: { text: "직접 접촉하는 기술의 위력이 1.3배 상승한다." },
  철주먹: { text: "펀치 기술의 위력이 1.2배 상승한다." },
  클리어바디: { text: "상대에 의해 능력치가 떨어지지 않는다." },
  미러아머: { text: "상대에 의해 능력치가 떨어질 때 그 효과를 반사한다." },
  정전기: { text: "자신에게 접촉한 상대를 30% 확률로 마비시킨다." },
  프레셔: { text: "상대의 PP 소모량이 2배가 된다." },
  불요의검: { text: "배틀 중 단 한 번, 등장했을 때 공격이 1랭크 올라간다." },
  불굴의방패: { text: "배틀 중 단 한 번, 등장했을 때 방어가 1랭크 올라간다." },
  그래스메이커: { text: "전투에 나오면 지형을 그래스필드로 만든다." },
  일렉트릭메이커: { text: "전투에 나오면 지형을 일렉트릭필드로 만든다." },
  미스트메이커: { text: "전투에 나오면 지형을 미스트필드로 만든다." },
  잔비: { text: "전투에 나오면 날씨를 5턴 간 비로 바꾼다." },
  에어록: { text: "모든 날씨의 영향이 없어진다." },
  날씨부정: { text: "모든 날씨의 영향이 없어진다." },
  델타스트림: {
    text: "전투에 나오면 날씨를 난기류 상태로 만든다. 난기류 상태에서는 날씨 기술이 실패하고 비행타입의 약점이 없어진다.",
  },
  시작의바다: {
    text: "전투에 나오면 날씨를 폭우 상태로 만든다. 폭우 상태에서는 날씨 기술이 실패하고 불꽃타입의 공격이 무효가 된다.",
  },
  끝의대지: {
    text: "전투에 나오면 날씨를 큰가뭄 상태로 만든다. 큰가뭄 상태에서는 날씨 기술이 실패하고 물타입의 공격이 무효가 된다.",
  },
  가뭄: { text: "전투에 나오면 날씨를 5턴 간 쾌청으로 바꾼다." },
  진홍빛고동: {
    text: "등장했을 때 날씨를 맑음으로 만든다. 햇살이 강하면 고대의 고동에 의해 공격이 1.3배가 된다.",
  },
  선파워: { text: "날씨가 맑을 때 특수공격이 1.5배가 되지만 매 턴 HP가 1/8 감소한다." },
  하드론엔진: {
    text: "등장했을 때 일렉트릭필드를 전개한다. 일렉트릭필드일 때 미래 기관에 의해 특수공격이 1.3배가 된다.",
  },
  재생력: { text: "교체 시 총 HP의 1/3을 회복한다." },
  자연회복: { text: "교체 시 상태 이상을 회복한다" },
  열교환: { text: "화상상태가 되지 않고, 불꽃 타입 기술을 받으면 공격이 1랭크 올라간다." },
  근성: { text: "상태 이상이 되면 근성을 보여서 공격이 올라간다." },
  위협: { text: "등장했을 때 상대를 위축시켜 공격을 떨어뜨린다." },
  고대활성: {
    text: "부스트에너지를 지니고 있거나 날씨가 맑을 때 가장 높은 능력이 올라간다.",
  },
  쿼크차지: {
    text: "부스트에너지를 지니고 있거나 일렉트릭필드일 때 가장 높은 능력이 올라간다.",
  },
  보이지않는주먹: {
    text: "상대에게 접촉하는 기술을 사용할 경우 방어 등을 무시하고 대미지를 입힐 수 있다.",
  },
  틈새포착: {
    text: "상대의 벽이나 대타출동을 무시하고 공격할 수 있다.",
  },
  질풍날개: { text: "자신의 HP가 가득 차 있을 때 모든 비행 타입 기술의 우선도가 1 증가한다." },
  이판사판: { text: "반동 데미지를 받는 기술들의 위력이 1.2배 증가한다." },
  돌머리: { text: "기술의 반동 데미지를 받지 않는다." },
  독치장: {
    text: "물리 기술로 데미지를 입으면 상대의 발밑에 독압정을 뿌린다.",
  },
  부식: {
    text: "강철타입이나 독타입 포켓몬도 독 또는 맹독 상태로 만들 수 있다.",
  },
  플라워베일: {
    text: "아군 풀타입 포켓몬의 능력치가 떨어지지 않고 상태 이상도 걸리지 않는다.",
  },
  공생: {
    text: "도구를 소모한 아군에게 자신이 들고 있는 도구를 건넨다.",
  },
  승기: {
    text: "상대에 의해 능력치가 떨어지면 특수공격이 2랭크 올라간다.",
  },
  오기: {
    text: "상대에 의해 능력치가 떨어지면 공격이 2랭크 올라간다.",
  },
  노가드: {
    text: "자신과 상대가 사용하는 기술이 반드시 명중한다.",
  },
  의기양양: {
    text: "잠듦 상태가 되지 않는다.",
  },
  유연: {
    text: "마비 상태가 되지 않는다.",
  },
  배짱: {
    text: "고스트타입 포켓몬에게 노말타입과 격투타입 기술을 맞힐 수 있으며 위협을 받지 않는다.",
  },
  깨어진갑옷: {
    text: "물리 기술을 맞으면 방어가 1랭크 떨어지고 스피드가 2랭크 올라간다.",
  },
  굳건한신념: {
    text: "상대의 기술을 끌어당기는 특성이나 기술의 영향을 받지 않는다.",
  },
  페어리오라: { text: "필드 전원의 페어리타입 기술이 4/3배 강해진다." },
  다크오라: { text: "필드 전원의 악타입 기술이 4/3배 강해진다." },
  까칠한피부: {
    text: "공격을 받았을 때 자신에게 접촉한 상대에게 1/8의 데미지를 준다.",
    feature: { hanka: true },
  },
  철가시: {
    text: "공격을 받았을 때 자신에게 접촉한 상대에게 1/8의 데미지를 준다.",
    feature: { hanka: true },
  },
  옹골찬턱: { text: "무는 기술의 위력이 1.5배 강해진다." },
  용의턱: { text: "드래곤타입 기술의 위력이 1.5배 강해진다." },
  트랜지스터: { text: "전기타입 기술의 위력이 1.3배 강해진다." },
  스킬링크: { text: "연속 기술을 사용하면 항상 최고 횟수로 사용할 수 있다." },
  테크니션: { text: "위력이 60 이하인 기술의 위력이 1.5배가 된다." },
  적응력: { text: "자신과 같은 타입인 기술의 위력이 올라간다." },
  급류: { text: "HP가 1/3 이하일 때 물타입 기술의 위력이 1.5배가 된다." },
  맹화: { text: "HP가 1/3 이하일 때 불꽃 타입 기술의 위력이 1.5배가 된다." },
  심록: { text: "HP가 1/3 이하일 때 풀타입 기술의 위력이 1.5배가 된다." },
  벌레의알림: { text: "HP가 1/3 이하일 때 벌레타입 기술의 위력이 1.5배가 된다." },
  불꽃몸: { text: "자신에게 접촉한 상대를 30% 확률로 화상 상태로 만든다." },
  수포: { text: "물타입 기술의 위력이 2배가 되고, 불꽃타입 기술의 데미지를 반감하며 화상 상태가 되지 않는다." },
  정신력: { text: "상대의 공격에 풀죽지 않으며, 위협의 효과를 받지 않는다." },
  다운로드: {
    text: "상대의 방어와 특수방어를 비교하여 낮은 쪽에 맞춰 자신의 공격이나 특수공격을 1랭크 올린다.",
  },
  트레이스: { text: "상대의 특성을 트레이스해서 같은 특성이 된다." },
  재앙의검: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 방어를 약하게 만든다.",
  },
  재앙의구슬: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 특수방어를 약하게 만든다.",
  },
  천하장사: { text: "물리 기술의 위력이 2배가 된다." },
  무아지경: { text: "물리 기술의 위력이 1.5배 오르지만 처음 사용한 기술밖에 쓸 수 없다." },
  쓱쓱: { text: "비가 올 때 스피드가 2배가 된다." },
  둔감: { text: "헤롱헤롱이나 도발 상태가 되지 않고 위협의 효과를 받지 않는다." },
  모래날림: { text: "전투에 나오면 날씨를 5턴 간 모래바람으로 바꾼다." },
  모래의힘: { text: "모래바람이 불 때 바위, 땅, 강철 타입 기술의 위력이 1.3배가 된다." },
  눈퍼뜨리기: { text: "전투에 나오면 날씨를 5턴 간 설경으로 바꾼다." },
  눈치우기: { text: "날씨가 설경일 때 스피드가 2배가 된다." },
  복슬복슬: { text: "직접 공격 기술로 받는 데미지가 절반이 되지만 불꽃타입 기술로 받는 데미지가 2배가 된다." },
  긴장감: { text: "상대 포켓몬을 긴장시켜 나무열매를 먹을 수 없게 만든다." },

  // 틀깨기 반영
  재앙의그릇: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 특수공격을 약하게 만든다.",
  }, // 틀깨기면 무시된다
  재앙의목간: {
    text: "이 특성을 가진 포켓몬을 제외한 모든 포켓몬의 공격을 약하게 만든다.",
  }, // 틀깨기면 무시된다

  탈: { text: "탈로 1번 공격을 막을 수 있다." }, // 틀깨기에 무시된다
  천진: { text: "상대의 능력 변화를 무시하고 싸울 수 있다." }, // 틀깨기면 무시된다
  멀티스케일: { text: "HP가 꽉 찼을 때 받는 데미지가 절반으로 줄어든다." }, // 틀깨기면 무시된다
  옹골참: {
    text: "일격기가 통하지 않으며 HP가 가득찬 상태에서 일격에 쓰러지지 않는다.",
  }, // 틀깨기면 무시된다
  피뢰침: {
    text: "전기타입 기술을 받으면 무효화하고 특수공격이 1랭크 올라간다.",
  },
  타오르는불꽃: {
    text: "불꽃타입 기술로 공격을 받으면 자신이 사용하는 불꽃타입의 기술이 1.5배 강해진다.",
  }, // 틀깨기면 무시된다

  심술꾸러기: {
    text: "능력의 변화가 역전해서 올라갈 때 떨어지고 떨어질 때 올라간다.",
  }, // 틀깨기면 랭크업을 똑바로 적용시킨다 (구현x)

  저주받은바디: { text: "공격을 받으면 30% 확률로 상대의 기술을 4턴동안 봉인한다." },
  그림자밟기: { text: "상대를 교체할 수 없게 만든다. 고스트 타입 이나 특성이 그림자밟기인 포켓몬은 영향을 받지 않는다." },
  부유: { text: "땅에서 뜨는 성질 때문에 땅타입의 기술로 공격받지 않는다." },
  // 틀깨기면 무시된다. 압정, 방어적인 필드 효과도 적용된다

  색안경: { text: "효과가 별로인 기술의 위력이 2배가 된다." },

  심안: {
    text: "노말타입과 격투타입 기술을 고스트타입에게 맞힐 수 있다. 상대의 회피율 변화를 무시하고 명중률도 떨어지지 않는다.",
  },
  // 틀깨기면 명중률을 떨어뜨릴 수 있다 (구현x)

  // 틀깨기
  틀깨기: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },
  테라볼티지: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },
  터보블레이즈: {
    text: "상대 특성에 방해받지 않고 상대에게 기술을 쓸 수 있다.",
    feature: { tgg: true },
  },

  // 자기과신
  비스트부스트: {
    text: "상대를 기절시켰을 때 자신의 가장 높은 능력이 올라간다.",
    feature: { swip: "max" },
  },
  "혼연일체(흑)": {
    text: "상대를 긴장시켜 나무열매를 먹지 못하게 한다. 상대를 쓰러뜨리면 특수공격이 올라간다.",
    feature: { swip: "catk" },
  },
  "혼연일체(백)": {
    text: "상대를 긴장시켜 나무열매를 먹지 못하게 한다. 상대를 쓰러뜨리면 공격이 올라간다.",
    feature: { swip: "atk" },
  },
  스카이스킨: { text: "노말타입 기술이 비행타입이 되고 위력이 1.2배가 된다.", feature: { skin: true, type: "비행" } },
  페어리스킨: { text: "노말타입 기술이 페어리타입이 되고 위력이 1.2배가 된다.", feature: { skin: true, type: "페어리" } },
  가속: { text: "매 턴이 끝날 때마다 스피드가 1랭크씩 올라간다." },
  슬로스타트: { text: "전투에 나오고 5턴 동안 공격과 스피드가 절반이 된다." },

  패스트스타트: { text: "전투에 나오고 5턴 뒤 공격과 스피드가 2배가 된다." },
  기어메이킹: { text: "매 턴마다 기어를 추가하여 능력치가 조금씩 오른다." },
  최강의잉어킹: { text: "체력을 제외한 모든 능력치가 999로 고정됩니다." },
  전관예우: { text: "모든 능력치에 기초포인트를 최대로 얻습니다." },
  유대진화: { text: "트레이너와 유대감이 깊어져 모습이 변했다. 물수리검이 강해진다." },
};

// 아수라장(증강) 전용 특성 목록
const augmentAbill = ["패스트스타트", "기어메이킹", "최강의잉어킹", "전관예우"];

// 트레이스로 베낄 수 없는 특성 (기본 불가 특성 + 아수라장 전용 특성)
// 테라볼티지, 터보블레이즈, 재앙시리즈, 불가사의부적는 트레이스 가능한게 맞음
const noTraceAbil = ["트레이스", "혼연일체(흑)", "혼연일체(백)", "탈", "배틀스위치", "고대활성", "쿼크차지", "테라체인지", "테라셀", "제로포밍", "어군", "절대안깸", "플라워기프트", "화학의힘", "일루전", "유대변화", "스웜체인지", "리시버", "리밋실드", "달마모드", "기분파", "괴짜", "AR시스템", "그대로꿀꺽미사일", "아이스페이스", ...augmentAbill];

// 랜덤 특성 증강에서 제외할 특성 목록 (noTraceAbil과 동일한 값을 가짐)
export const noRandomAbil = noTraceAbil;

// 특성 발동
// 첫대면(battleScreen.js), 교체(switch.js), 메가진화 후(pokemonMage.js) 발동
export const applyAbilityEffects = (bt, atks, enqueue, trace) => {
  const atk = bt[atks];
  if (!trace && atk.isPrimalRevertAble()) {
    atk.primalRevert(bt, enqueue);
  }
  const defs = atks === "player" ? "npc" : "player";
  const def = bt[defs];
  const atkAbil = atk.abil?.name;

  // ==================================================================================
  // 단순 텍스트 출력
  const messageAbilities = {
    재앙의검: { text: "주위의 방어가 약해졌다!", head: "name" },
    재앙의그릇: { text: "주위의 특수공격이 약해졌다!", head: "name" },
    재앙의구슬: { text: "주위의 특수방어가 약해졌다!", head: "name" },
    재앙의목간: { text: "주위의 공격이 약해졌다!", head: "name" },
    다크오라: { text: "다크오라를 발산하고 있다!", head: "names" },
    페어리오라: { text: "페어리오라를 발산하고 있다!", head: "names" },
    테라볼티지: { text: "세차게 튀는 오라를 발산하고 있다!", head: "names" },
    터보블레이즈: { text: "활활 타오르는 오라를 발산하고 있다!", head: "names" },
    틀깨기: { text: "상대 특성에 방해받지 않고 기술을 사용할 수 있다!", head: "names" },
    에어록: { text: "모든 날씨의 영향이 없어졌다!", head: "none" },
    날씨부정: { text: "모든 날씨의 영향이 없어졌다!", head: "none" },
  };

  if (messageAbilities[atkAbil]) {
    let head = messageAbilities[atkAbil].head;
    const headText = head === "names" ? `${atk.names("는")} ` : head === "name" ? `${atk.name} ` : "";
    enqueue(bt, `[특성 ${atkAbil}] ${headText}${messageAbilities[atkAbil].text}`, "abil_enter_msg");
  }

  if (atkAbil === "혼연일체(흑)" || atkAbil === "혼연일체(백)") {
    enqueue(bt, `[특성 혼연일체] ${atk.names("는")} 두 가지 특성을 겸비한다!`, "abil_as_one");
    enqueue(bt, `[특성 혼연일체] ${bt.common[atk.team].teamKrReverse} 편은 긴장해서 나무열매를 먹을 수 없게 되었다!`, "abil_as_one_unnerve");
  }

  // ==================================================================================
  // 랭크 관련
  const rankUpAbilities = {
    불요의검: { cond: atk.item === "녹슨검", stat: "atk", value: 1, augId: "intrepidSword" },
    불굴의방패: { cond: atk.item === "녹슨방패", stat: "def", value: 1, augId: "dauntlessShield" },
  };

  Object.entries(rankUpAbilities).forEach(([abil, cfg]) => {
    const abilText = `[특성 ${abil}]`;
    const hasInfiniteTrigger = Boolean(cfg.augId && atk.hasAugment?.(cfg.augId));
    if (atkAbil === abil && cfg.cond && (!atk.abil?.usedOnce || hasInfiniteTrigger)) {
      if (!hasInfiniteTrigger) {
        atk.abil.usedOnce = true;
        if (atk.o?.abil) atk.o.abil.usedOnce = true;
      }
      atk.rankUp(bt, enqueue, cfg.stat, cfg.value, abilText, false);
    }
  });

  // 위협
  if (atkAbil === "위협" && def && !def.faint) {
    const abilText = "[특성 위협]";
    enqueue(bt, `${abilText} ${atk.names("는")} 적을 위협했다!`, "abil_intimidate");
    if (def.tempStatus.substitute) {
      // 위협은 대타에 막힘
      enqueue(bt, `${abilText} ${def.name}에겐 효과가 없는 것 같다...`, "abil_intimidate_sub");
    } else if (def.abil?.name === "정신력" || def.abil?.name === "둔감" || def.abil?.name === "배짱") {
      enqueue(bt, `[특성 ${def.abil?.name}] ${def.name}의 공격은 떨어지지 않는다!`, "abil_intimidate_immune");
    } else {
      def.rankUp(bt, enqueue, "atk", -1, abilText, true);
    }
  }

  // 다운로드
  if (atkAbil === "다운로드" && def && !def.faint) {
    const abilText = "[특성 다운로드]";
    const statObj = def.stat;
    if (statObj) {
      const defStat = statObj.def || 0;
      const cdefStat = statObj.cdef || 0;
      if (defStat < cdefStat) {
        atk.rankUp(bt, enqueue, "atk", 1, abilText, false);
      } else {
        atk.rankUp(bt, enqueue, "catk", 1, abilText, false);
      }
    }
  }

  // ==================================================================================
  // 날씨, 필드 관련
  const weatherAbilities = {
    잔비: { weatherType: "비", text: "주변에 비가 내리기 시작했다!" },
    가뭄: { weatherType: "쾌청", text: "주변의 햇살이 강해졌다!" },
    모래날림: { weatherType: "모래바람", text: "주변에 모래바람이 불기 시작했다!" },
    눈퍼뜨리기: { weatherType: "설경", text: "주변에 눈이 내리기 시작했다!" },
    시작의바다: { weatherType: "폭우", text: "주변에 강한 비가 내리기 시작했다!" },
    끝의대지: { weatherType: "큰가뭄", text: "주변의 햇살이 아주 강해졌다!" },
    델타스트림: { weatherType: "난기류", text: "수수께끼의 난기류가 비행 포켓몬을 지킨다!", noName: true },
  };
  Object.entries(weatherAbilities).forEach(([abil, { weatherType, text, noName }]) => {
    if (atkAbil === abil) {
      let weatherAbiltext = noName ? `[특성 ${abil}] ${text}` : `[특성 ${abil}] ${atk.name} ${text}`;
      bt.field.weather.setWeatherOnBattle(bt, enqueue, atk, weatherType, weatherAbiltext);
    }
  });

  const terrainAbilities = {
    그래스메이커: { terrainType: "그래스필드", text: "발밑에 풀이 무성해졌다!" },
    일렉트릭메이커: { terrainType: "일렉트릭필드", text: "발밑에 전기가 떠돌기 시작했다!" },
    미스트메이커: { terrainType: "미스트필드", text: "발밑이 안개로 자욱해졌다!" },
  };
  Object.entries(terrainAbilities).forEach(([abil, { terrainType, text }]) => {
    if (atkAbil === abil) {
      let terrainAbiltext = `[특성 ${abil}] ${atk.name} ${text}`;
      bt.field.terrain.setTerrainOnBattle(bt, enqueue, atk, terrainType, terrainAbiltext);
    }
  });

  if (atkAbil === "진홍빛고동") {
    if (bt.isSunny) {
      enqueue(bt, `[특성 진홍빛고동] ${atk.names("는")} 햇살을 받아 고대의 고동을 폭발시켰다!`, "abil_orichalcum_pulse");
    } else {
      let text = `[특성 진홍빛고동] ${atk.names("는")} 햇살을 강하게 하여 고대의 고동을 폭발시켰다!`;
      bt.field.weather.setWeatherOnBattle(bt, enqueue, atk, "쾌청", text);
    }
  }

  if (atkAbil === "하드론엔진") {
    if (bt.field.terrain.isElectricField) {
      enqueue(bt, `[특성 하드론엔진] ${atk.names("는")} 일렉트릭필드의 힘으로 미래 기관을 가동했다!`, "abil_hadron_engine");
    } else {
      const text = `[특성 하드론엔진] ${atk.names("는")} 일렉트릭필드를 전개하여 미래 기관을 가동했다!`;
      bt.field.terrain.setTerrainOnBattle(bt, enqueue, atk, "일렉트릭필드", text);
    }
  }

  // ==================================================================================
  // 기타 특성
  if (atkAbil === "고대활성" && atk.tempStatus.protosynthesis === null) {
    atk.handleProtosynthesis(bt, enqueue);
  }

  // 에어록 / 날씨부정 등장 시 상대방의 쾌청 기반 고대활성 해제
  if (atkAbil === "에어록" || atkAbil === "날씨부정") {
    if (def?.tempStatus?.protosynthesisBySun) {
      def.handleProtosynthesisEnd(bt, enqueue);
    }
  }
  if (atkAbil === "쿼크차지" && atk.tempStatus.quarkDrive === null) {
    atk.handleQuarkDrive(bt, enqueue);
  }

  if (trace) return; // 트레이스로 상대 특성을 배껴왔을때 재귀적으로 해당 함수를 한번 더 실행

  if (atkAbil === "트레이스" && def && !def.faint) {
    if (noTraceAbil.includes(def.abil?.name)) {
      return;
    } else {
      atk.abil = { ...def.abil };
      enqueue(bt, `[특성 트레이스] ${atk.names("는")} ${josa(`${def.name}의 ${def.abil?.name}#{을}`)} 트레이스했다!`, "abil_trace_self");
      applyAbilityEffects(bt, atks, enqueue, true);
    }
  }

  if (def && !def.faint && def.abil?.name === "트레이스") {
    // 등장했을때 상대방의 특성을 트레이스하지 못한 경우
    // 이후 트레이스 가능한 특성의 포켓몬이 등장하면 바로 발동한다
    if (noTraceAbil.includes(atk.abil?.name)) {
      return;
    } else {
      def.abil = { ...atk.abil };
      enqueue(bt, `[특성 트레이스] ${def.names("는")} ${josa(`${atk.name}의 ${atk.abil?.name}#{을}`)} 트레이스했다!`, "abil_trace_opp");
      applyAbilityEffects(bt, defs, enqueue, true);
    }
  }

  if (atk.item === "풍선") {
    enqueue(bt, atk.names("는") + " 풍선으로 떠 있다!", "abil_air_balloon");
  }
};
