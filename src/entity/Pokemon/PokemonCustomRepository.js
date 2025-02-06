import BattlePokemon from "./PokemonCustom";
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
                                            // H   A   B  C   D   S
      new BattlePokemon("0008", "0888", "6V", 140, 84, 4, 0, 28, 252, "speed", "catk", 
        "거수참", "치근거리기", "칼춤", "인파이트", "녹슨검", "불요의검"),
      new BattlePokemon("0009", "0382", "5V1A", 0, 0, 4, 252, 0, 252, "catk", "atk", 
        "해수스파우팅", "근원의파동", "번개", "냉동빔", "구애스카프", "잔비"),
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
