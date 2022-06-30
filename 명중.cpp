#include "head.h"


void 명중(string p[][one][two], string s[][one][two], int pn, int sn, int number, int attack,
    int bt[], int k, int slife[], int ps[], int plife[], int spd, int sattck, int dmg[], int snumber) {
    //스킬의 명중 여부를 결정하는 함수.

    int mj = rand() % 100;
    //명중 관련 랜덤 수.
    //해당 숫자가 스킬의 명중률보다 낮으면 명중, 높으면 빗맞음.
    if ((p[pn][number][0] == "폭풍" || p[pn][number][0] == "번개") && ps[2] == 1) {
        mj = 0; //날씨가 비 상태면 폭풍과 번개의 명중률은 100%가 된다.
    }
    int gsp = 777;//스킬 "기습"의 성공 여부를 나타내는 변수
    int mabi = rand() % 100;//마비 상태이상의 발동 여부를 결정할 변수
    int chaos = rand() % 99;//혼란 상태이상의 발동 여부를 결정할 변수. 확률이 33%이므로 99로 나눈다.
    int freeze = rand() % 100; //얼음 상태이상의 해제 여부를 결정할 변수
    int mh = 위력증감(p[pn][number][1], s, 5252, sn, 1, p, pn, number, plife, ps, snumber);
    //위력증감 함수에 mh인자를 1로 넣어서 스킬이 무효인지 아닌지만 체크한다.
    if (p[pn][number][0] == "기습") {//사용한 스킬명이 기습일때
        if (k == 1) {//k가 1일때 = 내가 썼을때
            if (spd != 1 || sattck != 1) { gsp = -1; }
        }
        //내가 상대보다 느리거나 상대가 공격을 안했으면 실패
        else if (k == 0)//k가 0일때 = 상대가 썼을때
            if (spd != 0 || sattck != 1) { gsp = -1; }
        //내가 상대보다 빠르거나 내가 공격을 안했으면 실패
    }
    if( p[pn][5][9]=="y")
        p[pn][5][11] = to_string( stoi(p[pn][5][11]) - 1 );
    if (p[pn][5][9]=="y" && p[pn][5][11] != "0") {
        if (k == 0) cout << "상대 ";
        cout << p[pn][0][11] << s1(p, pn) << "쿨쿨 잠들어있다.\n";
        //스킬 사용 불가
    }
    else {
        if (p[pn][5][9] == "y" && p[pn][5][11] == "0") {
            if (k == 0) cout << "상대 ";
            cout << p[pn][0][11] << s1(p, pn) << "눈을 떴다!\n";
            p[pn][5][0] = "n";
            p[pn][5][9] = "n";

        }
        if (p[pn][5][6] == "y" && freeze < 80 && p[pn][number][1] != "불꽃") {
            //얼음 상태이상일때, freeze 변수가 80 미만이고 사용한 스킬이 불꽃타입이 아니면
            if (k == 0) cout << "상대 ";
            cout << p[pn][0][11] << s1(p, pn) << "얼어버려서 움직일 수 없다!\n";
            //스킬 사용 불가
        }
        else {
            if (p[pn][5][6] == "y" && (freeze >= 80 || p[pn][number][1] == "불꽃")) {
                //얼음 상태이상일때 freeze가 80 이상이거나 사용한 스킬이 불꽃타입이면
                if (k == 0) cout << "상대 ";
                cout << p[pn][0][11] << "의 얼음이 풀렸다!\n";
                p[pn][5][0] = "n";
                p[pn][5][6] = "n";
                //얼음 상태이상이 해제되고 스킬 사용 가능

            }
            if (p[pn][5][3] == "y" && mabi < 25) {
                if (k == 0) cout << "상대 "; //마비 상태이상일때 마비 변수가 25 미만이면 스킬 사용 불가
                cout << p[pn][0][11] << s1(p, pn) << "몸이 저려서 움직일 수 없다!\n";
            }

            else {//아닐경우 가능
                if (p[pn][5][4] == "y") {//혼란 상태이상에 걸린 상태일 경우
                    int chaoscounter = stoi(p[pn][5][5]) - 1;;
                    p[pn][5][5] = to_string(chaoscounter);//혼란 상태이상의 남은 턴 수 - 1
                    if (chaoscounter == 0) {//해당 값이 0이면
                        if (k == 0) cout << "상대 ";
                        cout << p[pn][0][11] << s1(p, pn) << "혼란이 풀렸다!\n";
                        p[pn][5][4] = "n";//혼란 해제
                    }
                    else {
                        if (k == 0) cout << "상대 ";
                        cout << p[pn][0][11] << s1(p, pn) << "혼란에 빠져있다!\n";
                    } //아닐 경우 혼란 유지
                }
                if (p[pn][5][4] == "y" && chaos < 33) {//혼란 상태이상일때 혼란 변수가 33 미만이면
                    cout << "영문도 모른채 자신을 공격했다!\n";
                    int randomnum = (rand() % 16) + 85;
                    int cdamage = (22 * 40 * stoi(p[pn][0][4]) / 50 / stoi(p[pn][0][6]));
                    cdamage = (cdamage + 2) * randomnum / 100;
                    //일정 데미지를 자신에게 입힘. 
                    //위력은( 22 * 40 * 본인 공격력 /50 / 본인 방어력 * 랜덤수 /100
                    if (cdamage >= plife[pn])
                        cdamage = plife[pn];
                    //데미지가 현재 체력 이상이면 현재 체력 만큼만 데미지
                    if (k == 0) cout << "상대 ";
                    cout << p[pn][0][11] << s1(p, pn) << cdamage << "의 데미지를 입었다! (";
                    cout << plife[pn] << "-" << cdamage << "=";
                    plife[pn] -= cdamage;
                    cout << plife[pn] << ")\n";
                    자뭉열매(p, pn, s, sn, plife);
                    if (p[pn][0][13] == "열매" && plife[pn] <= stoi(p[pn][0][3]) / 2 && plife[pn] > 0 && s[sn][0][12] != "흑마") {
                        cout << "[아이템 자뭉열매]\n";
                        p[pn][0][13] == "null"; //열매는 1회용이므로 발동되면 사라진다.
                        if (k == 0) cout << "상대 ";
                        cout << p[pn][0][11] << s1(p, pn);
                        cout << "자뭉열매로 체력을 회복했다! (" << plife[pn] << "+" << stoi(p[pn][0][3]) / 4 << "=";
                        plife[pn] += stoi(p[pn][0][3]) / 4;
                        cout << plife[pn] << ")\n";
                    }
                    if (plife[pn] <= 0) {//라이프가 0이되면 텍스트 출력
                        if (k == 0) cout << "상대 ";
                        cout << p[pn][0][11] << s1(p, pn) << "쓰러졌다!\n";
                        bt[1] = -1;//공격한 쪽이 쓰러졌으므로 bt[1]=-1
                    }
                }
                else {
                    if (k == 0) { cout << "상대 "; }
                    cout << p[pn][0][11] << s1(p, pn) << p[pn][number][0] << t2(p, pn, number) << "사용했다!\n";
                    //스킬 사용 텍스트
                    if (p[pn][0][12] == "리베로") {
                        리베로(p[pn][number][0], p, pn, k);
                    }//에이스번일 경우 전용 텍스트 출력
                    if (gsp == -1 || bt[1] == -1) {
                        //기습이 실패했거나, 공격할 대상이 이미 쓰러졌을 경우
                        printf("하지만 실패했다!\n");
                        //상대방이 이미 쓰러져 무릎차기가 실패한 경우엔 데미지를 받지 않음
                    }

                    else {//그 외에
                        if (mh == 0 && attack == 1) {
                            //공격기를 썼는데 무효 상성일 경우
                            //변화기의 무효 상성은 해당 함수에서 따로 처리 
                            if (p[pn][number][0] == "무릎차기") {//사용한 스킬이 무릎차기일 경우
                                printf("하지만 실패했다!\n");
                                무릎차기실패(p, k, pn, plife, ps, s, sn, bt);
                            }
                            else if (p[pn][number][1] == "물" && s[sn][0][12] == "마중물") {
                                printf("[특성 마중물]\n");
                                int mj = 321;
                                if (k == 1) mj = 0;
                                else if (k == 0) mj = 1;
                                랭크(s, sn, "특공", 1, mj);
                            }
                            else
                                printf("하지만 효과가 없는 듯하다...\n");
                        }
                        else if (bt[1] == 145 && p[pn][0][12] != "보이지않는주먹" && attack == 1) {
                            //공격했는데 상대가 방어했고, 공격측 특성이 방어무시가 아닌 경우
                            if (k == 1) { cout << "상대 "; }
                            cout << s[sn][0][11] << s1(s, sn) << "공격으로부터 몸을 지켰다!\n";
                            if (p[pn][number][0] == "무릎차기") {//무릎차기 실패.
                                무릎차기실패(p, k, pn, plife, ps, s, sn, bt);
                            }
                        }
                        else {
                            if (bt[1] == 145 && p[pn][0][12] == "보이지않는주먹" && attack == 1) {
                                //상대가 방어했는데 공격 측 특성이 방어 무시인 경우
                                cout << "[특성 보이지않는주먹]\n";
                                cout << "해당 공격은 막을 수 없다!\n";

                            }
                            if (p[pn][number][3] == "-" || mj < stoi(p[pn][number][3])) {//스킬이 명중한 경우
                                if (attack == 1) { 공격스킬(p, s, pn, sn, number, plife, slife, k, ps, dmg, bt, snumber); }
                                if (attack == 0) { 변화스킬(p, s, pn, sn, number, plife, slife, k, ps, bt); }
                                //공격 스킬이면 공격 스킬 함수를, 변화 스킬이면 변화 스킬 함수 사용
                                if (p[pn][0][13] == "스카프" || p[pn][0][13] == "머리띠") {
                                    //공격한 포켓몬의 지닌 물건이 스카프나 머리띠일경우
                                    p[pn][1][13] = "n";
                                    p[pn][2][13] = "n";
                                    p[pn][3][13] = "n";
                                    p[pn][4][13] = "n";
                                    p[pn][number][13] = "y";
                                    //사용한 스킬을 제외한 다른 스킬들의 사용가능 여부를 전부 불가능으로 바꿈
                                }
                            }
                            else {//스킬이 빗맞은 경우
                                cout << "하지만 맞지않았다!\n";
                                if (p[pn][number][0] == "무릎차기") {//무릎차기 실패.
                                    무릎차기실패(p, k, pn, plife, ps, s, sn, bt);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

