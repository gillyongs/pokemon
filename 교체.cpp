
#include "head.h"

void 교체(int life[], int pp, string p[][one][two], int ps[], string s[][one][two], int ss) {
    //내 포켓몬 교체를 담당하는 함수
    int ge = pp;
    if ((life[a(pp)] > 0 ) && (life[b(pp)] > 0 )) {
        //다른 두 포켓몬이 전부 살아있는 경우
        cout << "누구로 교체하시겠습니까?   1:" << p[a(pp)][0][0] << "  2:" << p[b(pp)][0][0];
        int gyoche;
        while (1) {
            cout << "\n\n\n 입력:";
            cin >> gyoche;
            cout << "\n\n";
            if (gyoche == 1) { //1번 포켓몬으로 교체
                cout << "나는 " << p[pp][0][11] << t1(p, pp) << p[a(pp)][0][11] << k1(p, a(pp)) << "교체했다!\n";
                pp = a(pp);//현재 포켓몬의 번호를 해당 포켓몬 번호로 변경
                break;
            }
            else if (gyoche == 2) {//2번 포켓몬으로 교체
                cout << "나는 " << p[pp][0][11] << t1(p, pp) << p[b(pp)][0][11] << k1(p, b(pp)) << "교체했다!\n";
                pp = b(pp);
                break;
            }
            else // while문으로 맞는 숫자를 입력 받을 때까지 반복.
                printf("\n\n[입력오류. 숫자 1이나 2를 입력 바랍니다.]\n\n");
        }
    }
    else if ( life[a(pp)] > 0 && life[b(pp)] <= 0 ) {
        //1번 포켓몬만 살아있는 경우
        cout << "나는 " << p[pp][0][11] << t1(p, pp) << p[a(pp)][0][11] << k1(p, a(pp)) << "교체했다!\n";
        pp = a(pp);//1번 포켓몬으로 교체
 
    }
    else if ( life[a(pp)] <= 0  && life[b(pp)] > 0 ) {
        cout << "나는 " << p[pp][0][11] << t1(p, pp) << p[b(pp)][0][11] << k1(p, b(pp)) << "교체했다!\n";
        pp = b(pp);
    }

    교체이벤트(life, ge, p, ps, s, ss, 1);

    ps[0] = pp; //현재 포켓몬의 번호를 ps 배열에 리턴
    if (ps[12] == 1 && p[pp][0][13]!="통굽부츠") {
        //우리 필드에 스텔스락이 깔려있고 
        //교체한 포켓몬의 지닌 물건이 통굽부츠가 아닐때
        cout << p[pp][0][11] << "에게 뾰족한 바위가 박혔다! (" << life[pp] << "-";
        int samsung = 1;
        for (int i = 6; i < 11; i++) { //스텔스록의 바위 타입과
            for (int j = 0; j < two - 1; j++) {//맞은 포켓몬의 방어 상성을 비교하여
                if (p[pp][i][j] == "바위") { samsung = i; }//동일한 경우가 있는지 체크한다.
            }
        }

        int sd = 903;
        //스텔스록 데미지 변수
        if (samsung == 6) { sd = stoi(p[pp][0][3]) / 2; } //4배 약점인 경우
        else if (samsung == 7) { sd = stoi(p[pp][0][3]) / 4; }//2배 약점
        else if (samsung == 8) { sd = stoi(p[pp][0][3]) / 16; }//반감
        else if (samsung == 9) { sd = stoi(p[pp][0][3]) / 32; }//0.25배 반감
        else { sd = stoi(p[pp][0][3]) / 8; }
        //스텔스록은 최대 체력의 1/8 데미지이며 바위타입 상성이 적용된다.

        if (sd >= life[pp])
            sd = life[pp];
        life[pp] -= sd;
        //스텔스록 데미지가 현재 체력보다 크면 현재 체력만큼만 데미지
        자뭉열매(p, pp, s, ss, life);
        cout << sd << "=" << life[pp] << ")\n";
        if (life[pp] <= 0) {
            cout << p[pp][0][11] << s1(p, pp) << "쓰러졌다!\n";
            교체(life, ps[0], p, ps, s, ps[1]);
        }
    }
}

void 상대교체(int life[], int ss, string s[][one][two], int ps[], int pp, string p[][one][two]) {
    int ge = ss;
    //상대의 포켓몬 교체를 처리하는 함수
    if ( life[a(ss)] >= 0 ) {
        cout << "상대는 " << s[ss][0][11] << t1(s, ss) << s[a(ss)][0][0] << k1(s, a(ss)) << "교체했다!\n";
        ss = a(ss);
    }
    else if ( life[b(ss)] >= 0 ) {
        cout << "상대는 " << s[ss][0][11] << t1(s, ss) << s[b(ss)][0][0] << k1(s, b(ss)) << "교체했다!\n";
        ss = b(ss);
    }
    교체이벤트(life, ge, s, ps, p, pp, 0);
    ps[1] = ss;
    if (ps[13] == 1 && s[ss][0][13]!="통굽부츠") {
        cout << "상대 " << s[ss][0][11] << "에게 뾰족한 바위가 박혔다! (" << life[ss] << "-";
        int samsung = 1;
        for (int i = 6; i < 11; i++) { //공격한 스킬의 타입과
            for (int j = 0; j < two - 1; j++) {//맞은 포켓몬의 방어 상성을 비교하여
                if (s[ss][i][j] == "바위") { samsung = i; }//동일한 경우가 있는지 체크한다.
            }
        }
        int sd = 903; 
        if (samsung == 6) { sd = stoi(s[ss][0][3]) / 2; } //4배 약점인 경우
        else if (samsung == 7) { sd = stoi(s[ss][0][3]) / 4; }//2배 약점
        else if (samsung == 8) { sd = stoi(s[ss][0][3]) / 16; }//반감
        else if (samsung == 9) { sd = stoi(s[ss][0][3]) / 32; }//0.25배 반감
        else { sd = stoi(s[ss][0][3]) / 8; }

        if (sd >= life[ss])
            sd = life[ss];
        life[ss] -= sd;
        cout << sd << "=" << life[ss] << ")\n";
        자뭉열매(s, ss, p, pp, life);
        if (life[ss] <= 0) {
            cout << "상대 " << s[ss][0][11] << s1(s, ss) << "쓰러졌다!\n";
            상대교체(life, ss, s, ps, ps[0], p);
        }
    }
}

void 교체이벤트(int life[], int pp, string p[][one][two], int ps[], string s[][one][two], int ss, int k) {
    
    //특성 재생력 : 교체시 체력 1/3 회복
    if (p[pp][0][12] == "재생력" && p[pp][0][11]!="메타몽") {
        int hill = stoi(p[pp][0][3]) / 3; //회복량은 전체 체력의 1/3
        if (life[pp] + hill > stoi(p[pp][0][3]))
            hill = stoi(p[pp][0][3]) - life[pp];
        cout << "[특성 재생력]\n";
        if (k == 0) {
            printf("상대 ");
        }
        cout << p[pp][0][11] << "의 체력이 회복되었다! (";
        cout << life[pp];
        life[pp] += hill;//회복 처리
        cout << "+" << hill << "=" << life[pp] << ")\n";//회복량 프린트
    }

    //교체한 포켓몬의 "혼란" 상태이상 초기화
    p[pp][5][4] = "n";

    //교체한 포켓몬의 "맹독" 카운트 초기화
    p[pp][5][8] = "0";

    //교체한 포켓몬의 "방어" 성공률 초기화
    p[pp][4][15] = "100";

    //교체한 포켓몬의 랭크 변화 초기화
    for (int i = 5; i < 10; i++) {
        p[pp][11][i] = "0";
        p[pp][0][i - 1] = p[pp][11][i + 5];
    }

    //교체한 포켓몬의 "스카프" 제약 초기화
    for (int i = 1; i < 5; i++) {
        p[pp][i][13] = "y";
    }
    //교체한 포켓몬의 하품 카운트 초기화
    p[pp][5][10] = "-1";

    //교체한 에이스번의 "리베로" 초기화
    if (p[pp][0][11] == "에이스번") {
        p[pp][0][1] = "불꽃";
        p[pp][7][0] = "땅";
        p[pp][7][1] = "물";
        p[pp][7][2] = "바위";
        p[pp][8][0] = "강철";
        p[pp][8][1] = "벌레";
        p[pp][8][2] = "불꽃";
        p[pp][8][3] = "얼음";
        p[pp][8][4] = "페어리";
        p[pp][8][5] = "풀";
    }

}


