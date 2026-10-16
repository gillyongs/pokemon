import { josa } from "josa";
class Pokemon {
  // 포켓몬 원본 객체
  // ReadOnly, 불변값
  constructor(no, id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, feature) {
    // prettier-ignore
    this._validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, feature);
    this.no = no;
    this.id = id;
    this.name = name;
    this.names = josa(`${name}#{은}`);
    this.namess = josa(`${name}#{을}`);
    this.hp = hp;
    this.atk = atk;
    this.def = def;
    this.catk = catk;
    this.cdef = cdef;
    this.speed = speed;
    this.type1 = type1;
    this.type2 = type2;
    this.feature = feature;
  }
  // prettier-ignore
  _validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2, feature){
    if (typeof id !== "string") console.error("id must be a string", id);
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof total !== "number")
      console.error("total must be a number", total);
    if (typeof hp !== "number") console.error("hp must be a number", hp);
    if (typeof atk !== "number") console.error("atk must be a number", atk);
    if (typeof def !== "number") console.error("def must be a number", def);
    if (typeof catk !== "number") console.error("catk must be a number", catk);
    if (typeof cdef !== "number") console.error("cdef must be a number", cdef);
    if (typeof speed !== "number")
      console.error("speed must be a number", speed);
    if (hp + atk + def + catk + cdef + speed !== total) {
      console.error(id + "종족치오류");
    }
    if (typeof type1 !== "string")
      console.error("type1 must be a string", type1);
    if (type2 !== null && typeof type2 !== "string")
      console.error("type2 must be a string or null", type2);
    if (feature !== undefined && typeof feature !== "object")
      console.error("feature must be an object or undefined", feature);
  }
}
// prettier-ignore
class PokemonRepository {
  constructor() {
    this.items = [
      //     도감번호, 아이디  이름  총종족값 HP 공격 방어 특공 특방 스피드 (나무위키순)
new Pokemon("0006", "0006", "리자몽", 534, 78, 84, 78, 109, 85, 100, "불꽃", "비행"),
new Pokemon("0006", "0006-x", "메가리자몽X", 634, 78, 130, 111, 130, 85, 100, "불꽃", "드래곤"),
new Pokemon("0006", "0006-y", "메가리자몽Y", 634, 78, 104, 78, 159, 115, 100, "불꽃", "비행"),
new Pokemon("0059", "0059", "윈디", 555, 90, 110, 80, 100,80, 95, "불꽃", null),
new Pokemon("0091", "0091", "파르셀", 525, 50, 95, 180, 85, 45, 70, "물", "얼음"),
new Pokemon("0113", "0113", "럭키", 450, 250, 5, 5, 35, 105, 50, "노말", null, {evo: true}),
new Pokemon("0121", "0121", "아쿠스타", 520, 60, 75, 85, 100, 85, 115, "물", "에스퍼"),
new Pokemon("0121", "0121-m", "메가아쿠스타", 620, 60, 155, 95, 90, 95, 125, "물", "에스퍼"),
new Pokemon("0130", "0130", "갸라도스", 540, 95, 125, 79, 60, 100, 81, "물", "비행"),
new Pokemon("0145", "0145", "썬더", 580, 90, 90, 85, 125, 90, 100, "전기", "비행"),
new Pokemon("0149", "0149", "망나뇽", 600, 91, 134, 95, 100, 100, 80, "드래곤", "비행"),
new Pokemon("0184", "0184", "마릴리", 420, 100, 50, 80, 60, 80, 50, "물", "페어리"),
new Pokemon("0197", "0197", "블래키", 525, 95, 65, 110, 60, 130, 65, "악", null),
new Pokemon("0205", "0205", "쏘콘", 465, 75, 90, 140, 60, 60, 40, "벌레", "강철"),
new Pokemon("0233", "0233", "폴리곤2", 515, 85, 80, 90, 105, 95, 60, "노말", null, {evo: true}),
new Pokemon("0242", "0242", "해피너스", 540, 255, 10, 10, 75, 135, 55, "노말", null),
new Pokemon("0248", "0248", "마기라스", 600, 100, 134, 110, 95, 100, 61, "바위", "악"),
new Pokemon("0248", "0248-m", "메가마기라스", 700, 100, 164, 150, 95, 120, 71, "바위", "악"),
new Pokemon("0250", "0250", "칠색조", 680, 106, 130, 90, 110, 154, 90, "불꽃", "비행", { legendary: true }),
new Pokemon("0260", "0260", "대짱이", 535, 100, 110, 90, 85, 90, 60, "물", "땅"),
new Pokemon("0260", "0260-m", "메가대짱이", 635, 100, 150, 110, 95, 110, 70, "물", "땅"),
new Pokemon("0279", "0279", "패리퍼", 440, 60, 50, 100, 95, 70, 65, "물", "비행"),
new Pokemon("0303", "0303", "입치트", 380, 50, 85, 85, 55, 55, 50, "강철", "페어리"),
new Pokemon("0303", "0303-m", "메가입치트", 480, 50, 105, 125, 55, 95, 50, "강철", "페어리"),
new Pokemon("0324", "0324", "코터스", 470, 70, 85, 140, 85, 70, 20, "불꽃", null),
new Pokemon("0373", "0373", "보만다", 600, 95, 135, 80, 110, 80, 100, "드래곤", "비행"),
new Pokemon("0373", "0373-m", "메가보만다", 700, 95, 145, 130, 120, 90, 120, "드래곤", "비행"),
new Pokemon("0376", "0376", "메타그로스", 600, 80, 135, 130, 95, 90, 70, "강철", "에스퍼"),
new Pokemon("0376", "0376-m", "메가메타그로스", 700, 80, 145, 150, 105, 110, 110, "강철", "에스퍼"),
new Pokemon("0382", "0382", "가이오가", 670, 100, 100, 90, 150, 140, 90, "물", null, { legendary: true }),
new Pokemon("0398", "0398", "찌르호크", 485, 85, 120, 70, 50, 60, 100, "노말", "비행"),
new Pokemon("0445", "0445", "한카리아스", 600, 108, 130, 95, 80, 85, 102, "드래곤", "땅"),
new Pokemon("0450", "0450", "하마돈", 525, 108, 112, 118, 68, 72, 47, "땅", null),
new Pokemon("0473", "0473", "맘모꾸리", 530, 110, 130, 80, 70, 60, 80, "얼음", "땅"),
new Pokemon("0485", "0485", "히드런", 600, 91, 90, 106, 130, 106, 77, "불꽃", "강철"),
new Pokemon("0488", "0488", "크레세리아", 580, 120, 70, 110, 75, 120, 85, "에스퍼", null),
new Pokemon("0497", "0497", "샤로다", 528, 75, 75, 95, 75, 95, 113, "풀", null),
new Pokemon("0503", "0503-b", "히검귀", 528, 90, 108, 80, 100, 65, 85, "물", "악"),
new Pokemon("0530", "0530", "몰드류", 508, 110, 135, 60, 50, 65, 88, "땅", "강철"),
new Pokemon("0594", "0594", "맘복치", 470, 165, 75, 80, 40, 45, 65, "물", null),
new Pokemon("0596", "0596", "전툴라", 472, 70, 77, 60, 97, 60, 108, "벌레", "전기"),
new Pokemon("0598", "0598", "너트령", 489, 74, 94, 131, 54, 116, 20, "풀", "강철"),
new Pokemon("0609", "0609", "샹델라", 520, 60, 55, 90, 145, 90, 80, "고스트", "불꽃"),
new Pokemon("0635", "0635", "삼삼드래", 600, 92, 105, 90, 125, 90, 98, "악", "드래곤"),
new Pokemon("0645", "0645", "랜드로스", 600, 89, 145, 90, 105, 80, 91, "땅", "비행"),
new Pokemon("0646", "0646-a", "블랙큐레무", 700, 125, 170, 100, 120, 90, 95, "드래곤", "얼음", { legendary: true }),
new Pokemon("0663", "0663", "파이어로", 499, 78, 81, 71, 74, 69, 126, "불꽃", "비행"),
new Pokemon("0697", "0697", "견고라스", 521, 82, 121, 119, 69, 59, 71, "바위", "드래곤"),
new Pokemon("0713", "0713", "크레베이스", 514, 95, 117, 184, 44, 46, 28, "얼음", null), 
new Pokemon("0716", "0716", "제르네아스", 680, 126, 131, 95, 131, 98, 99, "페어리", null, { legendary: true }), 
new Pokemon("0717", "0717", "이벨타르", 680, 126, 131, 95, 131, 98, 99, "악", "비행", { legendary: true }), 
new Pokemon("0730", "0730", "누리레느", 530, 80, 74, 74, 126, 116, 60, "물", "페어리"), 
new Pokemon("0752", "0752", "깨비물거미", 454, 68, 70, 92, 50, 132, 42, "물", "벌레"), 
new Pokemon("0778", "0778", "따라큐", 476, 55, 90, 80, 50, 105, 96, "고스트", "페어리"),
new Pokemon("0785", "0785", "카푸꼬꼬꼭", 570,70, 115, 85, 95, 75, 130, "전기", "페어리"),
new Pokemon("0793", "0793", "텅비드", 570, 109, 53, 47, 127, 131, 103, "바위", "독"),
new Pokemon("0795", "0795", "페로코체", 570,71, 137, 37, 137, 37, 151, "벌레", "격투"),
new Pokemon("0797", "0797", "철화구야", 570, 97, 101, 103, 107, 101, 61, "강철", "비행"),
new Pokemon("0804", "0804", "아고용", 540, 73, 73, 73, 127 ,73, 121, "독", "드래곤"),
new Pokemon("0812", "0812", "고릴타", 530, 100, 125, 90, 60, 70, 85, "풀", null),
new Pokemon("0815", "0815", "에이스번", 530, 80, 116, 75, 65, 75, 119, "불꽃", null),
new Pokemon("0861", "0861", "오롱털", 510, 95, 120, 65, 95, 75, 60, "악", "페어리"),
new Pokemon("0882", "0882", "어래곤", 505, 90, 90, 100, 70, 80, 75, "물", "드래곤"),
new Pokemon("0888", "0888", "자시안", 720, 92, 170, 115, 80, 115, 148, "페어리", "강철", { legendary: true }),
new Pokemon("0889", "0889", "자마젠타", 720, 92, 130, 145, 80, 145, 128, "격투", "강철", { legendary: true }),
new Pokemon("0890", "0890", "무한다이노", 690, 140, 85, 95, 145, 95, 130, "독", "드래곤", { legendary: true }),
new Pokemon("0892", "0892-a", "악라오스", 550, 100, 130, 100, 63, 60, 97, "격투", "악"),
new Pokemon("0892", "0892-b", "물라오스", 550, 100, 130, 100, 63, 60, 97, "격투", "물"),
new Pokemon("0898", "0898-a", "백마렉스", 680, 100, 165, 150, 85, 130, 50, "에스퍼", "얼음", { legendary: true }),
new Pokemon("0898", "0898-b", "흑마렉스", 680, 100, 85, 80, 165, 100, 150, "에스퍼", "고스트", { legendary: true }),
new Pokemon("0900", "0900", "사마자르", 500, 70, 135, 95, 45, 70, 85, "벌레", "바위"),
new Pokemon("0901", "0901-a", "다투곰", 550, 130, 140, 105, 45, 80, 50, "땅", "노말"),
new Pokemon("0901", "0901-b", "달투곰", 555, 113, 70, 120, 135, 65, 52, "땅", "노말"),
new Pokemon("0902", "0902", "대쓰여너", 530, 120, 112, 65, 80, 75, 78, "물", "고스트"),
new Pokemon("0903", "0903", "포푸니크", 510, 80, 130, 60, 40, 80, 120, "격투", "독"),
new Pokemon("0908", "0908", "마스카나", 530, 76, 110, 70, 81, 70, 123, "풀", "악"),
new Pokemon("0970", "0970", "킬라플로르", 525, 83, 55, 90, 130, 81 ,86, "바위", "독"),
new Pokemon("0977", "0977", "어써러셔", 530, 150, 100, 115, 65, 65, 35, "물", null),
new Pokemon("0983", "0983", "대도각참", 550, 100, 135, 120, 60, 85, 50, "악", "강철"),
new Pokemon("0987", "0987", "날개치는머리", 570, 55, 55, 55, 135, 135, 135, "고스트", "페어리"),
new Pokemon("1002", "1002", "파오젠", 570, 80, 120, 80, 90, 65, 135, "악", "얼음"),
new Pokemon("1003", "1003", "딩루", 570, 155, 110, 125, 55, 80, 45, "악", "땅"),
new Pokemon("1004", "1004", "위유이", 570, 55, 80, 80, 135, 120, 100, "악", "불꽃"),
new Pokemon("1007", "1007", "코라이돈", 670, 100, 135, 115, 85, 100, 135, "격투", "드래곤", { legendary: true }),
new Pokemon("1008", "1008", "미라이돈", 670, 100, 85, 100, 135, 115, 135, "전기", "드래곤", { legendary: true }),
new Pokemon("1018", "1018", "브리두라스", 600, 90, 105, 130, 125, 65, 85, "강철", "드래곤"),



    ];
  }
  // ID로 객체 찾기
  getDataById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
  getItemById(id) {
    return this.getDataById(id);
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const pokemonRepository = new PokemonRepository();
export default pokemonRepository;
