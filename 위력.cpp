
#include "head.h"

int 위력증감(string skilltype, string s[][one][two], int damage, int ss, int mh, 
    string p[][one][two], int pp, int number, int plife[], int ps[], int snumber) {
    //스킬의 위력 증감에 관여하는 함수.
    int samsung = 1;
    for (int i = 6; i < 11; i++) { //공격한 스킬의 타입과
        for (int j = 0; j < two - 1; j++) {//맞은 포켓몬의 방어 상성을 비교하여
            if (s[ss][i][j] == skilltype) { samsung = i; }//동일한 경우가 있는지 체크한다.
        }
    }
    if (s[ss][0][12] == "마중물" && p[pp][number][1] == "물") samsung = 10;
    if (mh == 1) {//인자 mh에 1을 입력 받은 경우 = 스킬의 무효 여부를 체크하기 위한 경우. 무효일떈 0을, 아닐땐 0이 아닌 값을 리턴
        if (samsung == 10) return 0;
        else return 114;
    }
    else {//그 외의 경우 데미지 계산에 사용

        if (samsung == 6) { printf("효과는 굉장했다!\n"); damage *= 4; } //4배 약점인 경우
        else if (samsung == 7) { printf("효과는 굉장했다!\n"); damage *= 2; }//2배 약점
        else if (samsung == 8) { printf("효과가 별로인 듯하다...\n"); damage /= 2; }//반감
        else if (samsung == 9) { printf("효과가 별로인 듯하다...\n"); damage /= 4; }//0.25배 반감
        else if (samsung == 10) damage = 0;

        if (samsung == 6 || samsung == 7) {//약점 공격을 받은 경우
            if (s[ss][0][12] == "프리즘아머") {
                //솔가레오의 특성 프리즘아머. 굉장한 위력의 데미지를 3/4로 줄인다
                cout << "[특성 프리즘아머]\n";
                cout << "솔가레오가 받는 데미지가 조금 약해졌다!\n";
                damage = damage * 3 / 4;

            }
            if (s[ss][0][13] == "약점보험") {
                //아이템 약점보험. 위력이 굉장한 스킬을 맞으면 공격과 특공을 2랭크 콜린다
                cout << "[아이템 약점보험]\n";
                랭크(s, ss, "공격", 2, 1);
                랭크(s, ss, "특공", 2, 1);
                s[ss][0][13] == "null";//약점보헝은 1회용이므로 한번 발동되면 사라진다.
            }
        }

        if (skilltype == p[pp][0][1] || skilltype == p[pp][0][2]) {//자속보정
            damage = damage * 3 / 2;
            //스킬 타입과 공격 포켓몬의 타입이 동일하면 위력이 1.5배
        }


        if (p[pp][number][0] == "해수스파우팅")
            damage = damage * plife[pp] / stoi(p[pp][0][3]);
        //가이오가의 해수스파우팅은 현재체력/최대체력에 따라 위력이 변화한다.

        if (p[pp][0][13] == "생구") {
            damage = damage * 13 / 10;
            //지닌 물건이 생명의 구슬인 경우 데미지가 1.3배가 된다.
        }

        if (ps[2] == 1) {//날씨가 비일때
            if (skilltype == "물") {//물타입 스킬이 위력은 1.5배
                damage = damage *3 / 2;
            }
            else if (skilltype == "불꽃") {//불타입 스킬의 위력은 절반이 된다.
                damage = damage / 2;
            }
        }

        if ((p[pp][0][12]=="다크오라" || s[ss][0][12] == "다크오라") && skilltype == "악") {//필드가 다크오라일때 악타입 스킬의 위력 1.33배
            damage = damage * 4 / 3;
        }

        if (p[pp][0][12] == "애널라이즈" && 우선도비교(p, s, pp, ss, number, snumber) == 0) {
            cout << "[특성 애널라이즈]\n";
            cout << p[pp][0][11] << "의 기술 위력이 강해졌다!\n";
            damage = damage * 13 / 10;
        }

        return damage; //최종적으로 계산된 damage값을 리턴한다.
    }
}