import { josa } from "josa";
class Pokemon {
  // 포켓몬 원본 객체
  // ReadOnly, 불변값
  constructor(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2) {
    // prettier-ignore
    this._validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2);
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
  }
  // prettier-ignore
  _validateParams(id, name, total, hp, atk, def, catk, cdef, speed, type1, type2){
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
  }
}
// prettier-ignore
class PokemonRepository {
  constructor() {
    this.items = [
      //     번호      이름   총종족값 HP 공격 방어 특공 특방 스피드 (나무위키순)
new Pokemon("0091", "파르셀", 525, 50, 95, 180, 85, 45, 70, "물", "얼음"),
new Pokemon("0130", "갸라도스", 540, 95, 125, 79, 60, 100, 81, "물", "비행"),
new Pokemon("0145", "썬더", 580, 90, 90, 85, 125, 90, 100, "전기", "비행"),
new Pokemon("0149", "망나뇽", 600, 91, 134, 95, 100, 100, 80, "드래곤", "비행"),
new Pokemon("0205", "쏘콘", 465, 75, 90, 140, 60, 60, 40, "벌레", "강철"),
new Pokemon("0242", "해피너스", 540, 255, 10, 10, 75, 135, 55, "노말", null),
new Pokemon("0250", "칠색조", 680, 106, 130, 90, 110, 154, 90, "불꽃", "비행"),
new Pokemon("0324", "코터스", 470, 70, 85, 140, 85, 70, 20, "불꽃", null),
new Pokemon("0382", "가이오가", 670, 100, 100, 90, 150, 140, 90, "물", null),
new Pokemon("0398", "찌르호크", 485, 85, 120, 70, 50, 60, 100, "노말", "비행"),
new Pokemon("0445", "한카리아스", 600, 108, 130, 95, 80, 85, 102, "드래곤", "땅"),
new Pokemon("0485", "히드런", 600, 91, 90, 106, 130, 106, 77, "불꽃", "강철"),
new Pokemon("0497", "샤로다", 528, 75, 75, 95, 75, 95, 113, "풀", null),
new Pokemon("0594", "맘복치", 470, 165, 75, 80, 40, 45, 65, "물", null),
new Pokemon("0598", "너트령", 489, 74, 94, 131, 54, 116, 20, "풀", "강철"),
new Pokemon("0609", "샹델라", 520, 60, 55, 90, 145, 90, 80, "고스트", "불꽃"),
new Pokemon("0644", "블랙큐레무", 700, 125, 170, 100, 120, 90, 95, "드래곤", "얼음"),
new Pokemon("0645", "랜드로스", 600, 89, 145, 90, 105, 80, 91, "땅", "비행"),
new Pokemon("0663", "파이어로", 499, 78, 81, 71, 74, 69, 126, "불꽃", "비행"),
new Pokemon("0713", "크레베이스", 514, 95, 117, 184, 44, 46, 28, "얼음", null), 
new Pokemon("0716", "제르네아스", 680, 126, 131, 95, 131, 98, 99, "페어리", null), 
new Pokemon("0717", "이벨타르", 680, 126, 131, 95, 131, 98, 99, "악", "비행"), 
new Pokemon("0778", "따라큐", 476, 55, 90, 80, 50, 105, 96, "고스트", "페어리"),
new Pokemon("0785", "카푸꼬꼬꼭", 570,70, 115, 85, 95, 75, 130, "전기", "페어리"),
new Pokemon("0793", "텅비드", 570, 109, 53, 47, 127, 131, 103, "바위", "독"),
new Pokemon("0795", "페로코체", 570,71, 137, 37, 137, 37, 151, "벌레", "격투"),
new Pokemon("0797", "철화구야", 570, 97, 101, 103, 107, 101, 61, "강철", "비행"),
new Pokemon("0804", "아고용", 540, 73, 73, 73, 127 ,73, 121, "독", "드래곤"),
new Pokemon("0812", "고릴타", 530, 100, 125, 90, 60, 70, 85, "풀", null),
new Pokemon("0815", "에이스번", 530, 80, 116, 75, 65, 75, 119, "불꽃", null),
new Pokemon("0882", "어래곤", 505, 90, 90, 100, 70, 80, 75, "물", "드래곤"),
new Pokemon("0888", "자시안", 720, 92, 170, 115, 80, 115, 148, "페어리", "강철"),
new Pokemon("0889", "자마젠타", 720, 92, 130, 145, 80, 145, 128, "격투", "강철"),
new Pokemon("0890", "무한다이노", 690, 140, 85, 95, 145, 95, 130, "독", "드래곤"),
new Pokemon("0892", "물라오스", 550, 100, 130, 100, 63, 60, 97, "격투", "물"),
new Pokemon("0896", "백마렉스", 680, 100, 165, 150, 85, 130, 50, "에스퍼", "얼음"),
new Pokemon("0897", "흑마렉스", 680, 100, 85, 80, 165, 100, 150, "에스퍼", "고스트"),
new Pokemon("0901", "다투곰", 550, 130, 140, 105, 45, 80, 50, "땅", "노말"),
new Pokemon("0901-2", "달투곰", 555, 113, 70, 120, 135, 65, 52, "땅", "노말"),
new Pokemon("0902", "대쓰여너", 530, 120, 112, 65, 80, 75, 78, "물", "고스트"),
new Pokemon("0970", "킬라플로르", 525, 83, 55, 90, 130, 81 ,86, "바위", "독"),
new Pokemon("0977", "어써러셔", 530, 150, 100, 115, 65, 65, 35, "물", null),
new Pokemon("0987", "날개치는머리", 570, 55, 55, 55, 135, 135, 135, "고스트", "페어리"),
new Pokemon("1002", "파오젠", 570, 80, 120, 80, 90, 65, 135, "악", "얼음"),
new Pokemon("1003", "딩루", 570, 155, 110, 125, 55, 80, 45, "악", "땅"),
new Pokemon("1004", "위유이", 570, 55, 80, 80, 135, 120, 100, "악", "불꽃"),
new Pokemon("1007", "코라이돈", 670, 100, 135, 115, 85, 100, 135, "격투", "드래곤"),
new Pokemon("1008", "미라이돈", 670, 100, 85, 100, 135, 115, 135, "전기", "드래곤"),



    ];
  }
  // ID로 객체 찾기
  getItemById(id) {
    return this.items.find((item) => item.id === id) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const pokemonRepository = new PokemonRepository();
export default pokemonRepository;
