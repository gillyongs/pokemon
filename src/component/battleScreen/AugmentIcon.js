import React from "react";
import styled from "styled-components";

// 포켓몬 배틀 UI 스타일에 맞춘 룬 & 심볼 SVG 아이콘 세트 (틸/청록 & 골드 & 슬레이트 네이비 테마)
// 전용 증강별 포켓몬 도감번호 매핑
export const DEDICATED_AUGMENT_POKEMON = {
  danceOfGarchomp: "0445",
  danceGarchomp: "0445",
};

export const AugmentIcon = ({ id, size = 42, pokemon = null, pokemonId = null }) => {
  const pokeId = pokemonId || DEDICATED_AUGMENT_POKEMON[id] || (pokemon?.origin?.pokemon_id && (id === "danceOfGarchomp" || id === "danceGarchomp") ? pokemon.origin.pokemon_id : null);

  if (pokeId) {
    return (
      <IconFrame $size={size}>
        <DedicatedFrame $size={size}>
          <DedicatedBg />
          <DedicatedImg
            src={`/pokemon/img/pokemon/${pokeId}.webp`}
            alt="전용 증강"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <DedicatedRing />
        </DedicatedFrame>
      </IconFrame>
    );
  }

  return (
    <IconFrame $size={size}>
      <svg viewBox="0 0 64 64" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* 게임 테마 맞춤 틸/스카이블루 그라데이션 */}
          <linearGradient id="prismGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="75%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="prismRing" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64ffda" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>


          {/* 고추기름 레드/오렌지/골드 그라데이션 */}
          <linearGradient id="chiliGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* 스태프 마법 핑크/퍼플/블루 그라데이션 */}
          {/* 가시갑옷 (LoL Thornmail 테마: 크림슨 레드 배경, 다크 차콜 아머 & 화이트골드 스파이크/복부 플레이트) */}
          <linearGradient id="thornCrimsonBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="40%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </linearGradient>

          <linearGradient id="thornDarkArmorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#56536b" />
            <stop offset="40%" stopColor="#3a384a" />
            <stop offset="100%" stopColor="#22212d" />
          </linearGradient>

          <linearGradient id="thornGoldPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdfbf4" />
            <stop offset="35%" stopColor="#e9e0cb" />
            <stop offset="75%" stopColor="#b8aa89" />
            <stop offset="100%" stopColor="#7a6e51" />
          </linearGradient>

          <linearGradient id="thornSpikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f5eedb" />
            <stop offset="70%" stopColor="#cfc2a3" />
            <stop offset="100%" stopColor="#786c52" />
          </linearGradient>

          <linearGradient id="magicStaffGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <radialGradient id="magicOrbGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f472b6" />
            <stop offset="70%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </radialGradient>

          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
          </radialGradient>

          {/* 유희왕 공방 스왑 오브 그라데이션 */}
          <radialGradient id="yugiohAtkOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="40%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#9a3412" />
          </radialGradient>
          <radialGradient id="yugiohDefOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          {/* 유희왕 특공/특방 스왑 오브 그라데이션 */}
          <radialGradient id="yugiohSpaOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fdf4ff" />
            <stop offset="35%" stopColor="#f472b6" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </radialGradient>
          <radialGradient id="yugiohSpdOrb" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="35%" stopColor="#22d3ee" />
            <stop offset="70%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          {/* 만두 도우 그라데이션 (화이트 스팀 도우 -> 노릇한 골든 브라운) */}
          <linearGradient id="manduDoughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fef9c3" />
            <stop offset="70%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* 강철 쇠사슬 메탈 그라데이션 */}
          <linearGradient id="chainMetal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="30%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          {/* 발광 필터 */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 베이스 배경 원 */}
        <circle cx="32" cy="32" r="30" fill="url(#bgGlow)" stroke="url(#prismRing)" strokeWidth="1.5" strokeOpacity="0.7" />

        {/* 1. 억까 방지 (정밀 조준경 + 필중 화살 + 스파클) */}
        {id === "noUnfairMiss" && (
          <g filter="url(#glow)">
            {/* 아치형 외곽 타겟 링 */}
            <path d="M16 32 A16 16 0 0 1 48 32 M48 32 A16 16 0 0 1 16 32" stroke="url(#prismRing)" strokeWidth="2.5" strokeDasharray="18 6" strokeLinecap="round" />
            {/* 십자 조준선 */}
            <path d="M32 10 L32 20 M32 44 L32 54 M10 32 L20 32 M44 32 L54 32" stroke="url(#prismGrad)" strokeWidth="2.5" strokeLinecap="round" />
            {/* 중앙 다이아몬드 타겟 & 직격 화살촉 */}
            <path d="M32 24 L38 32 L32 40 L26 32 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="32" r="2.5" fill="#ffffff" />
            {/* ✦ 스파클 */}
            <path d="M48 16 Q48 20 52 20 Q48 20 48 24 Q48 20 44 20 Q48 20 48 16 Z" fill="#fef08a" />
            <path d="M16 46 Q16 49 19 49 Q16 49 16 52 Q16 49 13 49 Q16 49 16 46 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 2. 만두콘은 이왕걸을 슬프게 하지 않게 하려고 버텼다 (노릇노릇 따끈한 교자 만두 & 피어오르는 김 & 스파클) */}
        {id === "mandoocornEndure" && (
          <g filter="url(#glow)">
            {/* 1. 따끈따끈 모락모락 피어오르는 만두 김 (Steam) */}
            <path d="M22 21 C20 16 23 12 21 7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M32 18 C30 13 34 9 32 5" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.9" />
            <path d="M42 21 C44 16 41 12 43 7" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

            {/* 2. 하단 은은한 찜기/받침 플레이트 라인 */}
            <path d="M10 50 C18 56 46 56 54 50" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* 3. 통통하고 노릇노릇한 만두 본체 (Mandu Body) */}
            <path
              d="M 12 36 C 12 50, 21 53, 32 53 C 43 53, 52 50, 52 36 C 49 31, 46 29, 44 29 C 41 26, 38 25, 35 25.5 C 33 24.5, 31 24.5, 29 25.5 C 26 25, 23 26, 20 29 C 18 29, 15 31, 12 36 Z"
              fill="url(#manduDoughGrad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 만두피 입체 주름선 (Pleat Creases) */}
            <path d="M 20 29 C 22 32, 23 37, 24 41" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 29 25.5 C 30 29, 30.5 35, 30.5 39" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 35 25.5 C 34 29, 33.5 35, 33.5 39" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />
            <path d="M 44 29 C 42 32, 41 37, 40 41" stroke="#b45309" strokeWidth="0.9" strokeLinecap="round" opacity="0.35" fill="none" />

            {/* 만두 볼륨 광택 하이라이트 (Steamed Gloss Highlight) */}
            <path d="M 16 38 C 20 45, 44 45, 48 38" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />

            {/* ✦ 갓 쪄낸 만두의 먹음직스러운 스파클 */}
            <path d="M 50 14 Q 50 17 53 17 Q 50 17 50 20 Q 50 17 47 17 Q 50 17 50 14 Z" fill="#fef08a" />
            <path d="M 13 16 Q 13 18.5 15.5 18.5 Q 13 18.5 13 21 Q 13 18.5 10.5 18.5 Q 13 18.5 13 16 Z" fill="#67e8f9" />
            <circle cx="32" cy="12" r="1.2" fill="#ffffff" />
          </g>
        )}

        {/* 3. 도박 중독 (입체 주사위 & 회오리 마법 스파크) */}
        {id === "gamblingAddict" && (
          <g filter="url(#glow)">
            {/* 회전하는 소용돌이 오라 */}
            <path d="M14 26 C16 16 28 10 38 12 M50 38 C48 48 36 54 26 52" stroke="url(#prismRing)" strokeWidth="2.5" strokeLinecap="round" />
            {/* 아이소메트릭 입체 주사위 */}
            {/* 윗면 */}
            <path d="M32 16 L46 23 L32 30 L18 23 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1" />
            {/* 좌측면 */}
            <path d="M18 23 L32 30 L32 46 L18 39 Z" fill="#0284c7" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" />
            {/* 우측면 */}
            <path d="M32 30 L46 23 L46 39 L32 46 Z" fill="#0d9488" fillOpacity="0.85" stroke="#ffffff" strokeWidth="1" />
            {/* 주사위 눈금 점들 */}
            <circle cx="32" cy="23" r="2" fill="#ffffff" />
            <circle cx="23" cy="33" r="1.5" fill="#ffffff" />
            <circle cx="27" cy="39" r="1.5" fill="#ffffff" />
            <circle cx="37" cy="34" r="1.5" fill="#ffffff" />
            <circle cx="41" cy="40" r="1.5" fill="#ffffff" />
            {/* ✦ 스파클 */}
            <path d="M49 14 Q49 17 52 17 Q49 17 49 20 Q49 17 46 17 Q49 17 49 14 Z" fill="#fef08a" />
            <path d="M14 44 Q14 47 17 47 Q14 47 14 50 Q14 47 11 47 Q14 47 14 44 Z" fill="#38bdf8" />
          </g>
        )}

        {/* 4. 돌려 돌려 돌림판 (다채로운 6색 룰렛 휠 & 상단 포인터 지침 & 중앙 몬스터볼 허브 & 회전 오라) */}
        {id === "rouletteWheel" && (
          <g filter="url(#glow)">
            {/* 1. 외곽 역동적인 회전 스핀 화살표 (돌려 돌려~ 회전 모션) */}
            {/* 좌측 하향 회전 가속 라인 */}
            <path d="M12 22 C9 27 9 37 13 45" stroke="url(#prismRing)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M10 40 L13 46 L18 43" fill="none" stroke="url(#prismRing)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            {/* 우측 상향 회전 가속 라인 */}
            <path d="M52 46 C55 41 55 31 51 23" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85" />
            <path d="M54 28 L51 22 L46 25" fill="none" stroke="url(#goldGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* 2. 룰렛 휠 6개 다채로운 부채꼴 섹터 (Rainbow Prize Wheel) */}
            <g stroke="#ffffff" strokeWidth="0.9" strokeLinejoin="round">
              {/* 섹터 1 (우상단: 레드) */}
              <path d="M 32 34 L 32 16 A 18 18 0 0 1 47.6 25 Z" fill="#ef4444" />
              {/* 섹터 2 (우측: 앰버 골드) */}
              <path d="M 32 34 L 47.6 25 A 18 18 0 0 1 47.6 43 Z" fill="#f59e0b" />
              {/* 섹터 3 (우하단: 에메랄드 그린) */}
              <path d="M 32 34 L 47.6 43 A 18 18 0 0 1 32 52 Z" fill="#10b981" />
              {/* 섹터 4 (좌하단: 청록/시안) */}
              <path d="M 32 34 L 32 52 A 18 18 0 0 1 16.4 43 Z" fill="#06b6d4" />
              {/* 섹터 5 (좌측: 로열 블루) */}
              <path d="M 32 34 L 16.4 43 A 18 18 0 0 1 16.4 25 Z" fill="#3b82f6" />
              {/* 섹터 6 (좌상단: 퍼플 바이올렛) */}
              <path d="M 32 34 L 16.4 25 A 18 18 0 0 1 32 16 Z" fill="#8b5cf6" />
            </g>

            {/* 3. 휠 황금 외곽 림 & 고정 핀 (Peg Pins) */}
            <circle cx="32" cy="34" r="19.5" fill="none" stroke="url(#goldGrad)" strokeWidth="2.2" />
            <circle cx="32" cy="34" r="18" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />

            {/* 림 둘레의 12개 골드 페그 핀 (탁탁 걸리는 핀) */}
            <circle cx="51.5" cy="34" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="48.9" cy="43.8" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="41.8" cy="50.9" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="32" cy="53.5" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="22.2" cy="50.9" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="15.1" cy="43.8" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="12.5" cy="34" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="15.1" cy="24.2" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="22.2" cy="17.1" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="32" cy="14.5" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="41.8" cy="17.1" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />
            <circle cx="48.9" cy="24.2" r="0.9" fill="#fef08a" stroke="#78350f" strokeWidth="0.4" />

            {/* 4. 중앙 포켓몬 교체 상징: 미니 몬스터볼 허브 */}
            <circle cx="32" cy="34" r="6" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="1" />
            <path d="M26.5 34 A5.5 5.5 0 0 1 37.5 34 Z" fill="#ef4444" />
            <path d="M26.5 34 A5.5 5.5 0 0 0 37.5 34 Z" fill="#f8fafc" />
            <line x1="26.5" y1="34" x2="37.5" y2="34" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx="32" cy="34" r="2" fill="#0f172a" />
            <circle cx="32" cy="34" r="1.1" fill="#ffffff" />

            {/* 5. 상단 돌림판 지침 (Indicator Needle / Stopper Pointer) */}
            <rect x="29" y="5" width="6" height="4" rx="1.5" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            {/* 아래로 향하는 삼각 지침 */}
            <path d="M32 17 L28 8.5 L36 8.5 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="32" cy="8.5" r="1.3" fill="#ffffff" stroke="#78350f" strokeWidth="0.5" />

            {/* ✦ 럭키 스파클 */}
            <path d="M54 11 Q54 14 57 14 Q54 14 54 17 Q54 14 51 14 Q54 14 54 11 Z" fill="#fef08a" />
            <path d="M10 50 Q10 52.5 12.5 52.5 Q10 52.5 10 55 Q10 52.5 7.5 52.5 Q10 52.5 10 50 Z" fill="#67e8f9" />
            <circle cx="16" cy="12" r="1.3" fill="#f472b6" />
          </g>
        )}

        {/* 5. 오른손엔 방패 왼손엔 검 (유희왕 원작 모티브: 왼편 수호방패, 오른편 직립검, 상하 순환 스왑 화살표, ATK/DEF 스왑 오브) */}
        {id === "swordAndShield" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 기사(Knight) 투구 & 갑옷 실루엣 */}
            <g opacity="0.4">
              {/* 투구 뿔 장식 */}
              <path d="M25 19 C22 14 17 13 14 10 C18 13 22 16 24 18" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              <path d="M39 19 C42 14 47 13 50 10 C46 13 42 16 40 18" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
              {/* 기사 투구 & 슬릿 */}
              <path d="M26 21 C26 14 38 14 38 21 L37 27 C37 28 35 29 32 29 C29 29 27 28 27 27 Z" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
              <line x1="28" y1="23" x2="36" y2="23" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
              {/* 어깨 갑옷 & 흉갑 실루엣 */}
              <path d="M20 28 C25 26 39 26 44 28 L46 50 L18 50 Z" fill="#1e293b" stroke="#475569" strokeWidth="0.8" />
            </g>

            {/* 2. 왼편: 든든한 황금/청동 수호 방패 ("오른손엔 방패") */}
            <g>
              <path
                d="M13 17 C21 17 22 21 22 30 C22 41 13 49 13 49 C13 49 4 41 4 30 C4 21 5 17 13 17 Z"
                fill="url(#goldGrad)"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M13 20 C18.5 20 19.5 23 19.5 30 C19.5 38 13 44.5 13 44.5 C13 44.5 6.5 38 6.5 30 C6.5 23 7.5 20 13 20 Z"
                fill="#78350f"
                fillOpacity="0.35"
                stroke="#fef08a"
                strokeWidth="0.8"
              />
              <path d="M13 22 L13 41 M8.5 29 L17.5 29" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.85" />
            </g>

            {/* 3. 오른편: 하늘을 향해 곧게 세운 대검 ("왼손엔 검") */}
            <g>
              <path d="M51 9 L54.5 15 L53.5 41 L48.5 41 L47.5 15 Z" fill="#ffffff" stroke="url(#prismRing)" strokeWidth="1" strokeLinejoin="round" />
              <line x1="51" y1="12" x2="51" y2="40" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M44 41 C47 40 55 40 58 41 L57 43.5 L45 43.5 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              <line x1="51" y1="43.5" x2="51" y2="50" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="51" cy="51.5" r="2.2" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* 4. 상하 순환 교환 화살표 (원작 시그니처 곡선 화살표) */}
            {/* 상단 화살표 (검/우측 -> 방패/좌측 곡선: 블루/청록) */}
            <g>
              <path d="M43 20 C38 14 28 14 21 19" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M22 15 L17 21 L24 23 Z" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 하단 화살표 (방패/좌측 -> 검/우측 곡선: 오렌지/레드) */}
            <g>
              <path d="M21 44 C26 50 36 50 43 45" stroke="#f97316" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M42 49 L47 43 L40 41 Z" fill="#f97316" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 5. 중앙 공격/방어 스왑 구체 (원작 attack / defense 오브) */}
            {/* 좌측 attack 오브 (오렌지/골드 엠버) */}
            <g>
              <circle cx="23" cy="32" r="7.5" fill="url(#yugiohAtkOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="23" y="34.2" fontSize="5.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.2">
                ATK
              </text>
            </g>

            {/* 우측 defense 오브 (블루/시안) */}
            <g>
              <circle cx="41" cy="32" r="7.5" fill="url(#yugiohDefOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="41" y="34.2" fontSize="5.2" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.2">
                DEF
              </text>
            </g>

            {/* 중앙 등호 기호 (=) */}
            <line x1="29.5" y1="30.5" x2="34.5" y2="30.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="29.5" y1="33.5" x2="34.5" y2="33.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

            {/* ✦ 스파클 반짝임 */}
            <path d="M51 6 Q51 9 54 9 Q51 9 51 12 Q51 9 48 9 Q51 9 51 6 Z" fill="#fef08a" />
            <path d="M13 13 Q13 15.5 15.5 15.5 Q13 15.5 13 18 Q13 15.5 10.5 15.5 Q13 15.5 13 13 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 6. 오른손엔 방패 왼손엔 스태프 (유희왕 모티브 계승: 왼편 룬 방패, 오른편 직립 마법 스태프, 상하 마법 스왑 화살표, SpA/SpD 스왑 오브) */}
        {id === "specialSwordAndShield" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 대마법사(Archmage) 후드 & 로브 및 마법진 실루엣 */}
            <g opacity="0.45">
              {/* 비전 마법진 룬 링 */}
              <circle cx="32" cy="32" r="26" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
              {/* 마법사 후드/두건 */}
              <path d="M26 23 C26 14 32 9 32 9 C32 9 38 14 38 23 L37 27 C37 28 35 29 32 29 C29 29 27 28 27 27 Z" fill="#312e81" stroke="#6366f1" strokeWidth="0.8" />
              {/* 후드 안쪽 신비로운 빛나는 안광 */}
              <circle cx="29.5" cy="22.5" r="0.9" fill="#67e8f9" />
              <circle cx="34.5" cy="22.5" r="0.9" fill="#67e8f9" />
              {/* 로브 & 어깨 망토 실루엣 */}
              <path d="M20 28 C25 26 39 26 44 28 L46 50 L18 50 Z" fill="#1e1b4b" stroke="#4338ca" strokeWidth="0.8" />
            </g>

            {/* 2. 왼편: 신비로운 비전 룬 마법 방패 ("오른손엔 방패") */}
            <g>
              <path
                d="M13 17 C21 17 22 21 22 30 C22 41 13 49 13 49 C13 49 4 41 4 30 C4 21 5 17 13 17 Z"
                fill="url(#magicStaffGrad)"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
              <path
                d="M13 20 C18.5 20 19.5 23 19.5 30 C19.5 38 13 44.5 13 44.5 C13 44.5 6.5 38 6.5 30 C6.5 23 7.5 20 13 20 Z"
                fill="#3b0764"
                fillOpacity="0.45"
                stroke="#f472b6"
                strokeWidth="0.8"
              />
              {/* 방패 중앙 마법 크리스탈 다이아몬드 룬 */}
              <path d="M13 23 L16.5 30 L13 37 L9.5 30 Z" fill="#ffffff" fillOpacity="0.8" stroke="#c084fc" strokeWidth="0.8" />
              <circle cx="13" cy="30" r="1.3" fill="#f472b6" />
            </g>

            {/* 3. 오른편: 하늘을 향해 곧게 세운 마법 스태프 ("왼손엔 스태프") */}
            <g>
              {/* 스태프 샤프트 봉 */}
              <line x1="51" y1="18" x2="51" y2="49" stroke="url(#goldGrad)" strokeWidth="2.4" strokeLinecap="round" />
              <line x1="51" y1="20" x2="51" y2="47" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
              {/* 하단 폼멜 */}
              <circle cx="51" cy="51" r="2.2" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              {/* 상단 크레센트 윙 브라켓 헤드 */}
              <path d="M45 15 C45 9 48 6 51 6 C54 6 57 9 57 15 C55 13 53 12 51 12 C49 12 47 13 45 15 Z" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="0.8" />
              {/* 스태프 최상단 찬란한 마법 구체 */}
              <circle cx="51" cy="14" r="3.8" fill="url(#magicOrbGlow)" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="49.8" cy="12.8" r="1.1" fill="#ffffff" />
              {/* 회전하는 마법 오라 링 */}
              <ellipse cx="51" cy="14" rx="6.5" ry="2.2" stroke="#67e8f9" strokeWidth="1" fill="none" strokeDasharray="3 1.5" transform="rotate(-15 51 14)" />
            </g>

            {/* 4. 상하 순환 마법 교환 화살표 */}
            {/* 상단 화살표 (스태프/우측 -> 방패/좌측 곡선: 바이올렛/퍼플) */}
            <g>
              <path d="M43 20 C38 14 28 14 21 19" stroke="#c084fc" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M22 15 L17 21 L24 23 Z" fill="#c084fc" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 하단 화살표 (방패/좌측 -> 스태프/우측 곡선: 청록/시안) */}
            <g>
              <path d="M21 44 C26 50 36 50 43 45" stroke="#22d3ee" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M42 49 L47 43 L40 41 Z" fill="#22d3ee" stroke="#ffffff" strokeWidth="0.6" strokeLinejoin="round" />
            </g>

            {/* 5. 중앙 특공/특방 스왑 구체 (SpA / SpD 오브) */}
            {/* 좌측 SpA 오브 (신비로운 마젠타/퍼플) */}
            <g>
              <circle cx="23" cy="32" r="7.5" fill="url(#yugiohSpaOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="23" y="34.2" fontSize="5.0" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.1">
                SpA
              </text>
            </g>

            {/* 우측 SpD 오브 (청아한 시안/애저 블루) */}
            <g>
              <circle cx="41" cy="32" r="7.5" fill="url(#yugiohSpdOrb)" stroke="#ffffff" strokeWidth="1.2" />
              <text x="41" y="34.2" fontSize="5.0" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" fill="#ffffff" textAnchor="middle" letterSpacing="0.1">
                SpD
              </text>
            </g>

            {/* 중앙 등호 기호 (=) */}
            <line x1="29.5" y1="30.5" x2="34.5" y2="30.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="29.5" y1="33.5" x2="34.5" y2="33.5" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

            {/* ✦ 비전 마법 스파클 반짝임 */}
            <path d="M51 4 Q51 7 54 7 Q51 7 51 10 Q51 7 48 7 Q51 7 51 4 Z" fill="#f472b6" />
            <path d="M13 13 Q13 15.5 15.5 15.5 Q13 15.5 13 18 Q13 15.5 10.5 15.5 Q13 15.5 13 13 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 7. H.H.G.G.H.G.G (모든 능력치를 가장 높은 능력치로 통일 - 올스탯 만점 퍼펙트 육각형 레이더 차트) */}
        {(id === "hhgghgg" || id === "HHGGHGG") && (
          <g filter="url(#glow)">
            {/* 1. 외곽 서클 가이드 */}
            <circle cx="32" cy="32" r="24.5" stroke="url(#prismRing)" strokeWidth="1.2" strokeDasharray="5 3" strokeOpacity="0.5" />

            {/* 2. 동심 육각형 레이더 차트 그리드 라인 (스탯 단계별 정육각형 그리드) */}
            {/* 1단계 (내부) 육각형 */}
            <polygon
              points="32,24 38.9,28 38.9,36 32,40 25.1,36 25.1,28"
              fill="none"
              stroke="url(#prismRing)"
              strokeWidth="0.8"
              strokeOpacity="0.35"
            />
            {/* 2단계 (중간) 육각형 */}
            <polygon
              points="32,17 45,24.5 45,39.5 32,47 19,39.5 19,24.5"
              fill="none"
              stroke="url(#prismRing)"
              strokeWidth="1"
              strokeOpacity="0.5"
              strokeDasharray="4 2"
            />

            {/* 3. 6방향 능력치 축선 (HP, 공격, 방어, 스피드, 특방, 특공) */}
            <line x1="32" y1="32" x2="32" y2="10" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="51" y2="21" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="51" y2="43" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="32" y2="54" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="13" y2="43" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />
            <line x1="32" y1="32" x2="13" y2="21" stroke="url(#prismRing)" strokeWidth="1.2" strokeOpacity="0.7" />

            {/* 4. 찬란하게 채워진 올스탯 MAX 완벽한 정육각형 (퍼펙트 육각형 스탯 영역) */}
            <polygon
              points="32,10 51,21 51,43 32,54 13,43 13,21"
              fill="url(#prismGrad)"
              fillOpacity="0.38"
              stroke="url(#goldGrad)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* 내부 찬란한 에너지 육각 층 */}
            <polygon
              points="32,13 48.5,22.5 48.5,41.5 32,51 15.5,41.5 15.5,22.5"
              fill="url(#prismGrad)"
              fillOpacity="0.22"
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.8"
              strokeLinejoin="round"
            />

            {/* 5. 6개 능력치 정점 노드 (빛나는 6대 스탯 오브) */}
            {/* HP (상단) */}
            <circle cx="32" cy="10" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="10" r="1.1" fill="#ffffff" />
            {/* 공격 (우상단) */}
            <circle cx="51" cy="21" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="51" cy="21" r="1.1" fill="#ffffff" />
            {/* 방어 (우하단) */}
            <circle cx="51" cy="43" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="51" cy="43" r="1.1" fill="#ffffff" />
            {/* 스피드 (하단) */}
            <circle cx="32" cy="54" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="32" cy="54" r="1.1" fill="#ffffff" />
            {/* 특방 (좌하단) */}
            <circle cx="13" cy="43" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="13" cy="43" r="1.1" fill="#ffffff" />
            {/* 특공 (좌상단) */}
            <circle cx="13" cy="21" r="2.8" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1" />
            <circle cx="13" cy="21" r="1.1" fill="#ffffff" />

            {/* 6. 중앙 정점: 6대 능력치 통합 다이아몬드 코어 룬 */}
            <polygon points="32,25 39,32 32,39 25,32" fill="url(#goldGrad)" stroke="#ffffff" strokeWidth="1.4" />
            <polygon points="32,27.5 36.5,32 32,36.5 27.5,32" fill="#ffffff" />

            {/* 7. 찬란한 육각형 광채 스파클 */}
            <path d="M49 11 Q49 15 53 15 Q49 15 49 19 Q49 15 45 15 Q49 15 49 11 Z" fill="#fef08a" />
            <path d="M15 49 Q15 52 18 52 Q15 52 15 55 Q15 52 12 52 Q15 52 15 49 Z" fill="#64ffda" />
            <circle cx="32" cy="3" r="1.4" fill="#fef08a" />
          </g>
        )}

        {/* 8. 춤춰라 한카리아스 (용의 날개/지느러미 & 소용돌이치는 용의 춤 오라) */}
        {(id === "danceOfGarchomp" || id === "danceGarchomp") && (
          <g filter="url(#glow)">
            {/* 용의 기운 소용돌이 테두리 */}
            <path d="M14 36 C10 22 24 12 36 12 C48 12 54 24 50 38 C46 48 34 52 24 50" stroke="#38bdf8" strokeWidth="2" strokeDasharray="14 4" strokeLinecap="round" />
            <path d="M22 18 C28 14 42 16 46 26" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" />

            {/* 한카리아스 샤크 핀 / 드래곤 윙 실루엣 */}
            <path d="M32 14 C36 22 46 26 48 34 C42 34 36 30 32 26 C28 30 22 34 16 34 C18 26 28 22 32 14 Z" fill="url(#prismGrad)" stroke="#ffffff" strokeWidth="1.2" strokeLinejoin="round" />

            {/* 용의춤 상승 기류 나선 화살표 */}
            <path d="M22 46 C24 38 32 36 36 32 C40 28 44 24 44 18" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M40 16 L45 17 L44 22" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            <path d="M42 46 C40 38 32 36 28 32 C24 28 20 24 20 18" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M24 16 L19 17 L20 22" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* 중앙 드래곤 문장 룬 */}
            <circle cx="32" cy="38" r="5" fill="#0f172a" stroke="url(#goldGrad)" strokeWidth="1.5" />
            <path d="M32 35 L34 38 L32 41 L30 38 Z" fill="#f43f5e" />

            {/* ✦ 스파클 */}
            <path d="M48 14 Q48 18 52 18 Q48 18 48 22 Q48 18 44 18 Q48 18 48 14 Z" fill="#fef08a" />
            <path d="M14 44 Q14 47 17 47 Q14 47 14 50 Q14 47 11 47 Q14 47 14 44 Z" fill="#f43f5e" />
          </g>
        )}

        {/* 9. 구애받지않는 (끊어지는 쇠사슬 & 해방의 에너지 스파크) */}
                {/* 10. 할머니의 고추기름 (매운 붉은 고추 & 타오르는 불꽃과 고추기름 방울) */}
        {id === "grandmasChiliOil" && (
          <g filter="url(#glow)">
            {/* 배경 타오르는 화염 아우라 */}
            <path
              d="M32 10 C38 18 46 24 46 34 C46 44 38 52 32 52 C26 52 18 44 18 34 C18 24 26 18 32 10 Z"
              fill="url(#flameGrad)"
              opacity="0.35"
            />
            {/* 고추 줄기 (초록) */}
            <path
              d="M30 16 C30 13 32 11 34 10 C35 12 34 15 32 17 Z"
              fill="#10b981"
            />
            {/* 매운 고추 실루엣 */}
            <path
              d="M32 16 C38 18 42 24 42 32 C42 42 34 49 26 51 C24 51 23 49 25 47 C29 43 32 37 32 30 C32 24 30 20 28 17 C29 16 31 16 32 16 Z"
              fill="url(#chiliGrad)"
              stroke="#fca5a5"
              strokeWidth="0.8"
            />
            {/* 고추 하이라이트 광택 */}
            <path
              d="M33 20 C36 24 37 30 36 36"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.75"
              fill="none"
            />
            {/* 튀는 고추기름 방울들 */}
            <circle cx="20" cy="30" r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.6" />
            <circle cx="16" cy="38" r="1.6" fill="#f97316" />
            <circle cx="44" cy="22" r="1.8" fill="#f43f5e" />
            <circle cx="46" cy="38" r="2.4" fill="url(#chiliGrad)" stroke="#fef08a" strokeWidth="0.6" />
            {/* 스파클 & 화염 스파크 */}
            <polygon points="32,24 33.5,27 37,28 33.5,29 32,32 30.5,29 27,28 30.5,27" fill="#fde047" />
            <circle cx="38" cy="14" r="1.2" fill="#fef08a" />
            <circle cx="24" cy="42" r="1" fill="#ffffff" />
          </g>
        )}

        {/* 9. 구애받지않는 (격렬하게 폭발하며 끊어지는 육중한 쇠사슬 - UNCHAINED!) */}
        {id === "unboundChoice" && (
          <g filter="url(#glow)">
            {/* 1. 배경: 사슬이 끊어지며 터져 나오는 해방의 충격파 버스트 (Shockwave) */}
            <polygon
              points="32,12 35,24 47,17 39,28 52,32 39,36 47,47 35,40 32,52 29,40 17,47 25,36 12,32 25,28 17,17 29,24"
              fill="url(#flameGrad)"
              opacity="0.38"
            />
            <polygon
              points="32,17 34.5,26.5 43,22 37.5,29 46,32 37.5,35 43,42 34.5,37.5 32,47 29.5,37.5 21,42 26.5,35 18,32 26.5,29 21,22 29.5,26.5"
              fill="url(#goldGrad)"
              stroke="#ffffff"
              strokeWidth="0.8"
            />

            {/* 2. 좌측 쇠사슬 (하단으로 튕겨나가는 육중한 강철 사슬 링크들) */}
            {/* 하단 기저 링크 (좌하단) */}
            <rect
              x="8"
              y="44"
              width="15"
              height="9"
              rx="4.5"
              transform="rotate(-42 15.5 48.5)"
              fill="url(#chainMetal)"
              stroke="#ffffff"
              strokeWidth="0.9"
            />
            <rect
              x="11.5"
              y="46"
              width="8"
              height="5"
              rx="2.5"
              transform="rotate(-42 15.5 48.5)"
              fill="#090d16"
            />

            {/* 중간 교차 링크 */}
            <path d="M 17 41 L 24 33 L 28 37 L 21 45 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="0.9" strokeLinejoin="round" />
            <line x1="20.5" y1="37" x2="24.5" y2="41" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* 격렬하게 뜯겨나간 좌측 반쪽 사슬 (Severed Left Half) */}
            <path
              d="M 23 37 C 22 30, 27 25, 31 27 L 31.5 30.5 C 29 29, 25 32, 26 36 C 27 40, 30 42, 33 40 L 32.5 43.5 C 27 45, 23 42, 23 37 Z"
              fill="url(#chainMetal)"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* 좌측 파단면의 붉게 달아오른 파편 단면 (Molten Fracture Tips) */}
            <polygon points="31,27 34,26.5 33,29 31.5,30.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />
            <polygon points="33,40 36,41.5 34,44 32.5,43.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />

            {/* 3. 우측 쇠사슬 (상단으로 튕겨나가는 육중한 강철 사슬 링크들) */}
            {/* 격렬하게 뜯겨나간 우측 반쪽 사슬 (Severed Right Half) */}
            <path
              d="M 41 27 C 42 34, 37 39, 33 37 L 32.5 33.5 C 35 35, 39 32, 38 28 C 37 24, 34 22, 31 24 L 31.5 20.5 C 37 19, 41 22, 41 27 Z"
              fill="url(#chainMetal)"
              stroke="#ffffff"
              strokeWidth="1"
            />
            {/* 우측 파단면의 붉게 달아오른 파편 단면 (Molten Fracture Tips) */}
            <polygon points="33,37 30,37.5 31,35 32.5,33.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />
            <polygon points="31,24 28,22.5 30,20 31.5,20.5" fill="#fef08a" stroke="#f97316" strokeWidth="0.8" />

            {/* 중간 교차 링크 */}
            <path d="M 36 27 L 43 19 L 47 23 L 40 31 Z" fill="#64748b" stroke="#f8fafc" strokeWidth="0.9" strokeLinejoin="round" />
            <line x1="39.5" y1="23" x2="43.5" y2="27" stroke="#cbd5e1" strokeWidth="1.2" />

            {/* 상단 기저 링크 (우상단) */}
            <rect
              x="42.5"
              y="11.5"
              width="15"
              height="9"
              rx="4.5"
              transform="rotate(-42 50 16)"
              fill="url(#chainMetal)"
              stroke="#ffffff"
              strokeWidth="0.9"
            />
            <rect
              x="46"
              y="13.5"
              width="8"
              height="5"
              rx="2.5"
              transform="rotate(-42 50 16)"
              fill="#090d16"
            />

            {/* 4. 폭발적으로 사방에 비산하는 깨진 사슬 파편들 (Flying Shrapnel) */}
            <polygon points="23,17 27,14 28,18 24,20" fill="url(#chainMetal)" stroke="#fef08a" strokeWidth="0.8" />
            <polygon points="40,11 44,13 43,16 39,14" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.8" />
            <polygon points="18,43 21,46 19,48 16,45" fill="url(#chainMetal)" stroke="#ffffff" strokeWidth="0.8" />
            <polygon points="43,47 47,45 48,49 44,51" fill="url(#chainMetal)" stroke="#fef08a" strokeWidth="0.8" />
            <polygon points="31,9 34,12 31,14 28,11" fill="#cbd5e1" stroke="#f97316" strokeWidth="0.7" />

            {/* 5. 파단점 중심 백색 발광 코어 및 불꽃 스파크 (Core Energy & Sparks) */}
            <circle cx="32" cy="32" r="3.6" fill="#ffffff" />
            <circle cx="32" cy="32" r="1.8" fill="#fef08a" />

            {/* 사방으로 튀는 용융 불꽃 파티클 */}
            <circle cx="20" cy="25" r="1.2" fill="#ffedd5" />
            <circle cx="27" cy="20" r="1.5" fill="#fde047" />
            <circle cx="37" cy="19" r="1.3" fill="#f97316" />
            <circle cx="44" cy="27" r="1.5" fill="#ef4444" />
            <circle cx="43" cy="38" r="1.4" fill="#fde047" />
            <circle cx="37" cy="44" r="1.6" fill="#ffedd5" />
            <circle cx="25" cy="42" r="1.3" fill="#f97316" />
            <circle cx="19" cy="34" r="1.5" fill="#fde047" />

            {/* 6. 끊어진 순간의 격렬한 반동 속도선 (Kinetic Snap Lines) */}
            <line x1="16" y1="56" x2="8" y2="60" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <line x1="22" y1="53" x2="15" y2="59" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />
            <line x1="48" y1="8" x2="56" y2="4" stroke="#facc15" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <line x1="42" y1="11" x2="49" y2="5" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" />

            {/* ✦ 해방의 섬광 스파클 */}
            <path d="M 53 28 Q 53 31 56 31 Q 53 31 53 34 Q 53 31 50 31 Q 53 31 53 28 Z" fill="#fef08a" />
            <path d="M 11 36 Q 11 39 14 39 Q 11 39 11 42 Q 11 39 8 39 Q 11 39 11 36 Z" fill="#67e8f9" />
          </g>
        )}

        {/* 11. 가시갑옷 (LoL Thornmail: 크림슨 레드 배경 & 차콜 숄더/체스트 & 화이트골드 스파이크/복부 플레이트) */}
        {id === "thornmail" && (
          <g filter="url(#glow)">
            {/* 크림슨 레드 스파이크 배경 */}
            <circle cx="32" cy="32" r="29" fill="url(#thornCrimsonBg)" />
            {/* 방사형 붉은 가시 빛살 */}
            <polygon points="32,32 10,4 20,4" fill="#e11d48" opacity="0.4" />
            <polygon points="32,32 54,4 44,4" fill="#e11d48" opacity="0.4" />
            <polygon points="32,32 4,26 4,36" fill="#e11d48" opacity="0.3" />
            <polygon points="32,32 60,26 60,36" fill="#e11d48" opacity="0.3" />

            {/* 1. 어깨 원뿔형 가시 (좌/우 3개씩) */}
            {/* 좌측 어깨 가시 */}
            <polygon points="12,17 9,5 17,14" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <polygon points="19,16 19,5 24,14" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <polygon points="8,26 2,21 12,22" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />

            {/* 우측 어깨 가시 */}
            <polygon points="52,17 55,5 47,14" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <polygon points="45,16 45,5 40,14" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <polygon points="56,26 62,21 52,22" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />

            {/* 2. 어깨 견갑 (다크 차콜) */}
            <path
              d="M7 26 C9 18 18 15 26 18 L24 28 C18 27 12 28 7 26 Z"
              fill="url(#thornDarkArmorGrad)"
              stroke="#56536b"
              strokeWidth="0.8"
            />
            <path
              d="M57 26 C55 18 46 15 38 18 L40 28 C46 27 52 28 57 26 Z"
              fill="url(#thornDarkArmorGrad)"
              stroke="#56536b"
              strokeWidth="0.8"
            />

            {/* 3. 목 둘레 & 골드 칼라 (목 안쪽 구멍과 안감) */}
            <ellipse cx="32" cy="18" rx="10" ry="7" fill="#18181b" stroke="url(#thornGoldPlateGrad)" strokeWidth="1.5" />
            <path d="M26 18 C26 24 38 24 38 18" fill="url(#thornGoldPlateGrad)" stroke="#7a6e51" strokeWidth="0.8" />

            {/* 4. 복부 겹겹이 층진 골드 플레이트 (V자 쉐브론) */}
            {/* 1단 (상단) */}
            <polygon points="24,33 32,38 40,33 38,29 32,33 26,29" fill="url(#thornGoldPlateGrad)" stroke="#524835" strokeWidth="0.6" />
            {/* 2단 (중단) */}
            <polygon points="22,41 32,46 42,41 40,36 32,41 24,36" fill="url(#thornGoldPlateGrad)" stroke="#524835" strokeWidth="0.6" />
            {/* 3단 (하단) */}
            <polygon points="24,48 32,54 40,48 38,44 32,48 26,44" fill="url(#thornGoldPlateGrad)" stroke="#524835" strokeWidth="0.6" />

            {/* 5. 흉부 차콜 흉갑 덮개 (V라인 & 가시 스터드) */}
            <path
              d="M21 24 L32 30 L43 24 L45 32 C41 36 37 38 32 39 C27 38 23 36 19 32 Z"
              fill="url(#thornDarkArmorGrad)"
              stroke="#6b6980"
              strokeWidth="1"
            />

            {/* 흉갑 리벳/원뿔 스터드 3개 */}
            <circle cx="27" cy="32" r="2.2" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <circle cx="32" cy="35" r="2.4" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <circle cx="37" cy="32" r="2.2" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />

            {/* 6. 허리 벨트 & 좌측 하단 대형 가시 (원작 LoL 반영) */}
            <polygon points="17,50 8,54 18,58" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.7" />
            <polygon points="47,50 54,53 46,57" fill="url(#thornSpikeGrad)" stroke="#22212d" strokeWidth="0.6" />
            <path d="M19 50 L32 55 L45 50" fill="none" stroke="#22212d" strokeWidth="2.5" />

            {/* 금속 광택 하이라이트 */}
            <line x1="22" y1="26" x2="31" y2="31" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
            <circle cx="9" cy="5" r="1" fill="#ffffff" />
            <circle cx="55" cy="5" r="1" fill="#ffffff" />
          </g>
        )}
      </svg>
    </IconFrame>
  );
};

const IconFrame = styled.div`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px rgba(100, 255, 218, 0.35));
  transition:
    transform 0.2s ease,
    filter 0.2s ease;

  svg {
    display: block;
  }
`;

const DedicatedFrame = styled.div`
  width: ${(props) => props.$size}px;
  height: ${(props) => props.$size}px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  background: radial-gradient(circle, #1e293b 0%, #0f172a 70%, #090d16 100%);
  border: 1.5px solid #38bdf8;
  box-shadow:
    0 0 8px rgba(56, 189, 248, 0.5),
    inset 0 0 6px rgba(100, 255, 218, 0.3);
`;

const DedicatedBg = styled.div`
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 30%, rgba(100, 255, 218, 0.15), transparent 70%);
  pointer-events: none;
`;

const DedicatedImg = styled.img`
  width: 90%;
  height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
  z-index: 1;
  user-select: none;
  -webkit-user-drag: none;
`;

const DedicatedRing = styled.div`
  position: absolute;
  inset: 1px;
  border-radius: 50%;
  border: 1px dashed rgba(254, 240, 138, 0.6);
  pointer-events: none;
  z-index: 2;
`;




