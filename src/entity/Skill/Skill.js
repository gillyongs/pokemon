// prettier-ignore
export class Skill { 
  constructor(name, type, power, accur, pp, prior, stype, requirement, text, skillEffectList, feature){
    this._validateParams(name, type, power, accur, pp, prior, stype, skillEffectList, requirement, text);

    this.name = name;
    this.power = power;
    this.type = type;
    this.accur = accur;
    let ppp = Math.floor(pp / 5) * 3 + pp;
    this.pp = ppp;
    this.prior = prior;
    this.stype = stype; 
    //atk = 물리공격, catk = 특수공격, natk = 상대방 대상 변화기, buf = 자신 대상 변화기
    // natk = 상대방이 기절하면 실패, buf = 상대방이 기절해도 성공
    // 방어 가능 여부와 판정이 비슷하나 날려버리기는 방어를 뚫는다
    this.skillEffectList = skillEffectList;
    this.skillEffectList.push({ name: "공통" });
    const lateAct = ["유턴"];  //공통(생명의구슬)보다 늦게 터지는거
    const moveItems = this.skillEffectList.filter(item => lateAct.includes(item.name));
    this.skillEffectList = this.skillEffectList.filter(item => !lateAct.includes(item.name));
    this.skillEffectList.push(...moveItems);
    // 생구 반동을 받고 유턴으로 들어가야함
    
    this.requirement = requirement;
    this.feature = feature
    if(!feature){
      this.feature = {}
    }
    let stypes;
    if (stype === "atk") {
      stypes = "물리";
    } else if (stype === "catk") {
      stypes = "특수";
    } else if (stype === "natk" || stype === "buf") {
      stypes = "변화";
    }
    if (stype === "atk" || stype === "catk") {
      this.text = "위력 " + power + " / 명중 " + accur + " / " + stypes;
    } else if (stype === "natk") {
      this.text = "명중 " + accur;
    }
    if (text !== "") {
      this.text += " / " + text;
    }

    if (stype === "buf") {
      this.text = text;
    }
  }
  _validateParams(name, type, power, accur, pp, prior, stype, skillEffectList, requirement, text){
    if(name === '임시스킬'){return}
    if (typeof name !== "string") console.error("name must be a string", name);
    if (typeof type !== "string") console.error("type must be a string", type);
    if ((stype === "atk" || stype === "catk") && typeof power !== "number" && power !== '-'){
      console.error("atack skill power must be a number", power);
      console.error(name)
    }
    if (stype !== "buf" && typeof accur !== "number" && accur !== '-'){
      console.error("atack skill accur must be a number", accur);
      console.error(name)
    }
    if (stype === "buf" && typeof power !== "string"){
      console.error("buf skill power must be a NaN", power);
      console.error(name)
    }

    if (stype === "buf" && typeof accur !== "string"){
      console.error("buf skill accur must be a NaN", accur);
      console.error(name)
    }

    if (typeof pp !== "number") {
      console.error("pp must be a number", pp);
      console.error(name)
    }
    if (typeof prior !== "number" && prior !== 'change'){
      console.error("prior must be a number or 'change'", prior);
      console.error(name)
    }
      
    if (!["atk", "catk", "natk", "buf"].includes(stype)){
      console.error("stype must be one of 'atk', 'catk', 'natk', 'buf'", stype);
      console.error(name)
    }
      
    if (!Array.isArray(skillEffectList)){
      console.error("skillEffectList must be an array", skillEffectList);
      console.error(name)
    }
      
    if (
      typeof requirement !== "object" &&
      (requirement !== undefined) & (requirement !== null)
    ){
      console.error("requirement must be a object", requirement);
      console.error(name)
    }
      
    if (typeof text !== "string"){
        console.error(name)
      console.error("text must be a string", text);
    }
  }
}
