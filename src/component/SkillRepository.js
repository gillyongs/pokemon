import Skill from "./Skill";

class SkillRepository {
  constructor() {
    this.items = [
      new Skill("화염볼", "불꽃", 120, 100, 5, false, "atk", true),
      new Skill("무릎차기", "격투", 130, 90, 10, true, "atk", true),
      new Skill("기습", "악", 70, 100, 5, true, "atk", true),
      new Skill("아이언헤드", "강철", 80, 100, 15, true, "atk", true),
    ];
  }
  // ID로 객체 찾기
  getItemByName(name) {
    return this.items.find((item) => item.name === name) || null;
  }
}

// 싱글턴 객체 생성 (전역에서 사용 가능)
const skillRepository = new SkillRepository();
export default skillRepository;
