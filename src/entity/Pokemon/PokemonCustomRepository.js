import BattlePokemon from "./PokemonCustom";
//배틀용 포켓몬 객체
//원본(PokemonOriginal)에서 노력치, 스킬, 지닌 도구를 설정한다
//ReadOnly, 불변값으로 Pokemon 객체가 origin으로 지니고있는다
// prettier-ignore
class BattlePokemonRepository {
  constructor() {
    this.items = [
      new BattlePokemon("0001", "0815", "6V", 4, 252, 0, 0, 0, 252, "speed", "catk", 
        "화염볼", "무릎차기", "기습", "칼춤", "생명의구슬", "리베로"),
      new BattlePokemon("0002", "0890", "5V1A", 0, 0, 4, 252, 0, 252, "speed", "atk", 
        "다이맥스포", "오물웨이브", "화염방사", "섀도볼", "생명의구슬", "프레셔"),
      new BattlePokemon("0003", "0145", "5V1A", 0, 0, 4, 252, 0, 252, "speed", "atk", 
        "10만볼트", "열풍", "폭풍", "날개쉬기", "생명의구슬", "정전기"),
      new BattlePokemon("0004", "0901", "5V1A", 212, 0, 4, 196, 4, 92, "catk", "atk", 
        "블러드문", "하이퍼보이스", "대지의힘", "진공파", "돌격조끼", "심안"),
      new BattlePokemon("0005", "0778", "5V1A", 4, 252, 0, 0, 0, 252, "speed", "atk", 
        "야습", "칼춤", "섀도크루", "치근거리기", "생명의구슬", "탈"),
      new BattlePokemon("0006", "1002", "6V", 0, 188, 68, 0, 0, 252, "speed", "catk", 
        "고드름떨구기", "기습", "성스러운칼", "얼음뭉치", "기합의띠", "재앙의검"),
      new BattlePokemon("0007", "0812", "6V", 252, 0, 4, 0, 252, 0, "cdef", "catk", 
        "드럼어택", "그래스슬라이더", "탁쳐서떨구기", "유턴", "돌격조끼", "그래스메이커"),
      new BattlePokemon("0008", "0888", "6V", 140, 84, 4, 0, 28, 252, "speed", "catk",  //자시안
        "거수참", "치근거리기", "칼춤", "인파이트", "녹슨검", "불요의검"),
      new BattlePokemon("0009", "0382", "5V1A", 0, 0, 4, 252, 0, 252, "catk", "atk",    // 가이오가
        "해수스파우팅", "근원의파동", "번개", "냉동빔", "구애스카프", "잔비"),
                                             // H   A   B  C   D   S
      new BattlePokemon("0010", "1008", "5V1A", 44, 0, 4, 244, 12, 204, "catk", "atk", 
        "라이트닝드라이브", "볼트체인지", "용성군", "매지컬샤인", "구애안경", "하드론엔진"),
      new BattlePokemon("0011", "0889", "6V", 252, 36, 76, 0, 92, 52, "def", "catk",   // 자마젠타
        "거수탄", "바디프레스", "철벽", "깨물어부수기", "녹슨방패", "불굴의방패"),
      new BattlePokemon("0012", "0250", "6V", 252, 36, 76, 0, 92, 52, "atk", "catk",   // 자마젠타
        "성스러운불꽃", "브레이브버드", "지진", "HP회복", "통굽부츠", "재생력"),
    ];
  }
  // ID로 객체 찾기
  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const bpr = new BattlePokemonRepository();
export default bpr;
