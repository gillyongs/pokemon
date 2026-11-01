/**
 * 객체의 데이터와 메서드(프로토타입 체인 포함)를 모두 복사합니다.
 * - class 인스턴스의 메서드 유지
 * - 중첩 객체도 깊은 복사
 * - 배열은 순수 Array 인스턴스로 복사
 */
export function cloneWithMethods(obj) {
  if (obj === null || typeof obj !== "object") return obj;

  // 배열인 경우 일반 배열로 재귀 복사 (Object.create(Array.prototype) exotic object 이슈 방지)
  if (Array.isArray(obj)) {
    return obj.map((item) => cloneWithMethods(item));
  }

  // ① 원본 객체의 프로토타입을 복사해서 새로운 인스턴스 생성
  const copy = Object.create(Object.getPrototypeOf(obj));

  // ② 모든 키 순회 (own property 기준)
  for (const key of Reflect.ownKeys(obj)) {
    const value = obj[key];

    // ③ 재귀 복사 (중첩 객체도 메서드 유지)
    if (typeof value === "object" && value !== null) {
      copy[key] = cloneWithMethods(value);
    } else {
      copy[key] = value;
    }
  }

  return copy;
}
