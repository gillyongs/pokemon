#include "head.h"

void 후처리(string p[][one][two], int plife[], int pp, int ps[], int ppp[4][5], int k, string s[][one][two], int ss) {
    //턴이 끝날때 처리하는 것들을 모은 함수
    //p=플레이어, s=cpu
    //p[pp], s[ss]는 현재 필드에 있는 포켓몬, 
    //p[a(pp)], p[b(pp)],s[a(ss)],s[b(ss)]는 현재 필드에 있지 않은 포켓몬

    
    //날개쉬기를 사용한 썬더의 타입 초기화
    for (int i = 1; i < 4; i++) {
        if (p[i][0][11] == "썬더" || p[i][0][14]=="썬더") {
            for (int k = 6; k < 11; k++) {
                for (int j = 0; j < two - 1; j++) {
                    p[i][k][j] = "null";
                }
            }
            p[i][0][2] = "비행";
            p[i][7][0] = "얼음";
            p[i][7][1] = "바위";
            p[i][8][0] = "강철";
            p[i][8][1] = "비행";
            p[i][8][2] = "격투";
            p[i][8][3] = "벌레";
            p[i][8][4] = "풀";
            p[i][10][0] = "땅";
        }
        if (p[i][0][11] == "파이어로" || p[i][0][14] == "파이어로") {
            for (int k = 6; k < 11; k++) {
                for (int j = 0; j < two - 1; j++) {
                    p[i][k][j] = "null";
                }
            }
            p[i][0][2] = "비행";
            p[i][6][0] = "바위";
            p[i][7][0] = "물";
            p[i][7][1] = "전기";
            p[i][8][0] = "강철";
            p[i][8][1] = "격투";
            p[i][8][2] = "불꽃";
            p[i][8][3] = "페어리";
            p[i][10][0] = "땅";
        }
    }


    //필드에 있지않은 메타몽의 변신 상태와 pp 초기화
    for (int i = 1; i < 4; i++) {
        if (p[i][0][11] == "메타몽") {
            if (i != pp) {
                p[i][0][0] = "메타몽";
                p[i][0][12] = "괴짜";
                for (int j = 1; j < 5; j++) {
                    ppp[i][j] = 5;
                }
            }
        }
    }
    if (plife[pp] > 0) {
        p[pp][5][10] = to_string(stoi(p[pp][5][10]) - 1);
        //매 턴 하품 카운트 값을 1씩 깎는다
        //기절하였을 때에는 스킵한다.
        if (p[pp][5][10] == "0" && p[pp][5][0] == "n") {
            //해당 값이 0이 됐을때 상태이상에 걸려있지 않으면
            if (k == 0) cout << "상대 ";
            cout << p[pp][0][11] << s1(p, pp) << "잠들어 버렸다!\n";
            p[pp][5][9] = "y";
            //잠듦 처리
            p[pp][5][0] = "y";
            //상태이상 처리
            int sleep = 245;
            sleep = rand() % 3 + 2;
            //잠듦 상태이상은 1~3턴동안 유지된다
            //랜덤 값으로 2에서 4의 값을 뽑고, 적이 행동할때마다 1씩 깎아 0이 되면 풀린다.
            p[pp][5][11] = to_string(sleep);
            //남은 상태이상 턴

        }
    }
    //포켓몬의 상태이상이나 기절 상태를 이름에 추가
    for (int i = 1; i < 4; i++) { //얼음은 다른 상태이상과 달리 해제가 가능하므로 초기화도 넣어준다 
        if (p[i][0][11] != "메타몽") {
            if (p[i][5][6] == "n")
                p[i][0][0] = p[i][0][11];
            if (p[i][5][1] == "y")
                p[i][0][0] = p[i][0][11] + "(화상)";
            if (p[i][5][2] == "y")
                p[i][0][0] = p[i][0][11] + "(독)";
            if (p[i][5][3] == "y")
                p[i][0][0] = p[i][0][11] + "(마비)";
            if (p[i][5][7] == "y")
                p[i][0][0] = p[i][0][11] + " (맹독)";
            if (p[i][5][6] == "y")
                p[i][0][0] = p[i][0][11] + "(얼음)";
            if (p[i][5][9] == "y")
                p[i][0][0] = p[i][0][11] + "(잠듦)";
            if (plife[i] <= 0)
                p[i][0][0] = p[i][0][11] + " (기절)";
        }
        else if (p[i][0][11] == "메타몽") {
            if (p[i][5][6] == "n")
                p[i][0][0] = p[i][0][15];
            if (p[i][5][1] == "y")
                p[i][0][0] = p[i][0][15] + "(화상)";
            if (p[i][5][2] == "y")
                p[i][0][0] = p[i][0][15] + "(독)";
            if (p[i][5][3] == "y")
                p[i][0][0] = p[i][0][15] + "(마비)";
            if (p[i][5][7] == "y")
                p[i][0][0] = p[i][0][15] + " (맹독)";
            if (p[i][5][6] == "y")
                p[i][0][0] = p[i][0][15] + "(얼음)";
            if (p[i][5][9] == "y")
                p[i][0][0] = p[i][0][15] + "(잠듦)";
            if (plife[i] <= 0)
                p[i][0][0] = p[i][0][15] + " (기절)";
        }
        //메타몽은 변신중에 상태이상에 걸리면
        //에이스번(메타몽)(화상) 이런식으로 써져야하기에 따로 코드를 작성.
    }
    if (p[pp][0][13] == "검은진흙") {
        if (plife[pp] < stoi(p[pp][0][3])) {
            cout << "[아이템 검은진흙]\n";
            if (k == 0) cout << "상대 ";
            cout << p[pp][0][11] << s1(p, pp) << "검은진흙으로 인해 조금 회복했다. (" << plife[pp];
            int hill = stoi(p[pp][0][3]) / 16; //회복량은 최대 체력의 1/16

            if ((plife[pp] + hill) > stoi(p[pp][0][3])) {
                hill = stoi(p[pp][0][3]) - plife[pp];
            }
            //회복후 체력이 최대체력 이상이면 최대체력만큼만 회복
            plife[pp] += hill;//회복 처리
            cout << "+" << hill << "=" << plife[pp] << ")\n";//회복량 프린트
        }
    }
    if (p[pp][0][13] == "먹밥") {
        if (plife[pp] < stoi(p[pp][0][3])) {
            cout << "[아이템 먹다남은음식]\n";
                if (k == 0) cout << "상대 ";
            cout << p[pp][0][11] << s1(p, pp) << "먹다남은음식으로 인해 조금 회복했다. (" << plife[pp];
            int hill = stoi(p[pp][0][3]) / 16; //회복량은 최대 체력의 1/16

            if ((plife[pp] + hill) > stoi(p[pp][0][3])) {
                hill = stoi(p[pp][0][3]) - plife[pp];
            }
            //회복후 체력이 최대체력 이상이면 최대체력만큼만 회복
            plife[pp] += hill;//회복 처리
            cout << "+" << hill << "=" << plife[pp] << ")\n";//회복량 프린트
        }
    }
    int ccd = 1026;
    //화상 데미지 계산, 이미 체력이 0이면 스킵한다
    if (p[pp][5][1] == "y" && plife[pp]>0) {
        if (k == 0) cout << "상대";
        cout << p[pp][0][11] << s1(p, pp) << "화상 데미지를 입었다! (";
        ccd = stoi(p[pp][0][3]) / 16;
        if (ccd > plife[pp]) { ccd = plife[pp]; }
        cout << plife[pp] << "-" << ccd << "=";
        plife[pp] -= ccd;//화상 데미지는 최대 체력의 1/16
        cout << plife[pp] << ")\n";
        자뭉열매(p, pp, s, ss, plife);
        if (plife[pp] <= 0) {//화상 데미지로 체력이 0이 된 경우
            cout << p[pp][0][11] << s1(p, pp) << "쓰러졌다!\n";
           
        }
    }
    //독 데미지 계산
    if (p[pp][5][2] == "y" && plife[pp] > 0) {
        if (k == 0) cout << "상대 ";
        cout << p[pp][0][11] << s1(p, pp) << "독 데미지를 입었다! (";
        ccd = stoi(p[pp][0][3]) / 8;
        if (ccd > plife[pp]) { ccd = plife[pp]; }
        cout << plife[pp] << "-" << ccd << "=";
        plife[pp] -= ccd; // 독 데미지는 최대 체력의 1/8
        cout << plife[pp] << ")\n";
        자뭉열매(p, pp, s, ss, plife);
        if (plife[pp] <= 0) {
            cout << p[pp][0][11] << s1(p, pp) << "쓰러졌다!\n";
        }
    }
    //맹독 데미지 계산
    if (p[pp][5][7] == "y" && plife[pp] > 0) {
        if (k == 0) cout << "상대";
        int damagecount  = stoi(p[pp][5][8]) + 1;
        p[pp][5][8] = to_string(damagecount);
        cout << p[pp][0][11] << s1(p, pp) << "맹독 데미지를 입었다! (";
        ccd = stoi(p[pp][0][3]) *damagecount / 16;
        if (ccd > plife[pp]) { ccd = plife[pp]; }
        cout << plife[pp] << "-" << ccd << "=";
        plife[pp] -= ccd; // 독 데미지는 최대 체력의 1/8
        cout << plife[pp] << ")\n";
        cout << "맹독의 데미지는 점차 강해진다!\n";
        자뭉열매(p, pp, s, ss, plife);
        if (plife[pp] <= 0) {
            cout << p[pp][0][11] << s1(p, pp) << "쓰러졌다!\n";

        }
    }

    if (plife[pp] > 0 && ps[8]==1 && (p[pp][0][1]!="바위" && p[pp][0][2] != "바위" && 
            p[pp][0][1] != "강철" && p[pp][0][2] != "강철" && p[pp][0][1] != "땅" && p[pp][0][1] != "땅")) {
        printf("모래바람이 ");
        if (k == 0) cout << "상대 ";
        cout << p[pp][0][11] << t1(p, pp) << "덮쳤다! (";
        ccd = stoi(p[pp][0][3]) / 16;
        if (ccd > plife[pp]) { ccd = plife[pp]; }
        cout << plife[pp] << "-" << ccd << "=";
        plife[pp] -= ccd; // 독 데미지는 최대 체력의 1/8
        cout << plife[pp] << ")\n";
        자뭉열매(p, pp, s, ss, plife);
        if (plife[pp] <= 0) {
            cout << p[pp][0][11] << s1(p, pp) << "쓰러졌다!\n";
        }
    }
  

    
}