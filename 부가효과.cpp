#include "head.h"

void 부가효과(string a[][one][two], int skillnumber, string b[][one][two], int aa, int bb, int s, int alife[], int blife[], int ps[], int bt[], int damage) {
    //a가 skillnumber의 스킬을 써서 b를 때림
    //s=1 내가 때린거, s=0 상대가 때린거

    int rd = rand() % 100; // 공격시 발동하는 효과 랜덤 카운터
    int trd = rand() % 100; // 맞을때 발동하는 효과 랜덤 카운터. 

    if (blife[bb] > 0) {//상대방에게 발동되는 부가효과는 상대방의 체력이 0이 아닐때만 발생.

        if (a[aa][skillnumber][6] == "화상" && b[bb][5][0] == "n" && rd < stoi(a[aa][skillnumber][7]) && b[bb][0][1] != "불꽃" && b[bb][0][2] != "불꽃") {
            //스킬의 부가효과가 "화상"이고, 적이 상태이상에 걸리지 않았으며 적이 불타입이 아닐때 부가효과 확률에 의해 적이 화상이 걸림
            if (s == 1) cout << "상대 ";
            cout << b[bb][0][11] << "은 화상을 입었다!\n";
            int atk = stoi(b[bb][0][4]);
            atk /= 2;
            string aattkk = to_string(atk);
            b[bb][0][4] = aattkk; // 상대 공격력을 절반으로 깎음
            b[bb][5][1] = "y"; //화상 여부 y 처리
            b[bb][5][0] = "y"; //상태이상 여부 y 처리. 다른 상태이상과 중복되지 않게 하기 위함
        }
        if (a[aa][skillnumber][6] == "독" && b[bb][5][0] == "n" && rd < stoi(a[aa][skillnumber][7])
            && b[bb][0][1] != "독" && b[bb][0][2] != "독" && b[bb][0][1] != "강철" && b[bb][0][2] != "강철") {
            // 독은 상대가 독, 강철 타입이 아닐때 발동
            if (s == 1) cout << "상대 ";
            cout << b[bb][0][11] << "은 독에 걸렸다!\n";
            b[bb][5][2] = "y";
            b[bb][5][0] = "y";
            //독과 화상으로 인한 데미지는 "후처리"함수에서 따로 처리됨.
        }
        if (a[aa][skillnumber][6] == "마비" && b[bb][5][0] == "n"
            && rd < stoi(a[aa][skillnumber][7]) && b[bb][0][1] != "전기" && b[bb][0][2] != "전기") {
            //마비는 상대가 전기타입이 아닐때 발동
            if (s == 1) cout << "상대 ";
            cout << b[bb][0][11] << "은 마비되어 기술이 나오기 어려워졌다!\n";
            int spd = stoi(b[bb][0][8]);
            spd /= 2;
            string ssppdd = to_string(spd); // 마비는 상대의 스피드를 절반으로 깎음
            b[bb][0][8] = ssppdd;
            b[bb][5][3] = "y";
            b[bb][5][0] = "y";
        }
        if (a[aa][skillnumber][6] == "얼음" && b[bb][5][0] == "n" //
            && rd < stoi(a[aa][skillnumber][7]) && b[bb][0][1] != "얼음" && b[bb][0][2] != "얼음") {
            //얼음 상태이상은 상대가 얼음 타입이 아닐때 발동
            if (s == 1) cout << "상대 ";
            cout << b[bb][0][11] << s1(b,bb)<<"얼어붙었다!\n";
            b[bb][5][6] = "y";
            b[bb][5][0] = "y";
        }
        if (a[aa][skillnumber][6] == "트택" && b[bb][5][0] == "n" && rd < stoi(a[aa][skillnumber][7])) {
            int triattack = rand() % 3;
            if (triattack == 0) {
                if (b[bb][0][1] != "불꽃" && b[bb][0][2] != "불꽃") {
                    if (s == 1) cout << "상대 ";
                    cout << b[bb][0][11] << "은 화상을 입었다!\n";
                    int atk = stoi(b[bb][0][4]);
                    atk /= 2;
                    string aattkk = to_string(atk);
                    b[bb][0][4] = aattkk; // 상대 공격력을 절반으로 깎음
                    b[bb][5][1] = "y"; //화상 여부 y 처리
                }
            }
            else if (triattack == 1) {
                if (b[bb][0][1] != "전기" && b[bb][0][2] != "전기") {
                    if (s == 1) cout << "상대 ";
                    cout << b[bb][0][11] << "은 마비되어 기술이 나오기 어려워졌다!\n";
                    int spd = stoi(b[bb][0][8]);
                    spd /= 2;
                    string ssppdd = to_string(spd); // 마비는 상대의 스피드를 절반으로 깎음
                    b[bb][0][8] = ssppdd;
                    b[bb][5][3] = "y";
                }
            }
            else if (triattack == 2) {
                if (b[bb][0][1] != "얼음" && b[bb][0][2] != "얼음") {
                    if (s == 1) cout << "상대 ";
                    cout << b[bb][0][11] << "은 얼어붙었다!\n";
                    b[bb][5][6] = "y";
                }
            }
            b[bb][5][0] = "y";

        }
        if (a[aa][skillnumber][6] == "혼란" && b[bb][5][4] == "n" && rd < stoi(a[aa][skillnumber][7])) {
            //혼란은 다른 상태이상과 중첩되므로 조건이 약간 다름.
            if (s == 1) cout << "상대 ";
            cout << b[bb][0][11] << "은 혼란에 빠졌다!\n";
            b[bb][5][4] = "y";
            int cr = rand() % 4 + 2;
            b[bb][5][5] = to_string(cr);
            //혼돈이 걸릴 턴 수. 2부터 5까지 랜덤 값.
        }
        if (a[aa][skillnumber][6] == "랭크" && rd < stoi(a[aa][skillnumber][7]) && a[aa][skillnumber][10] == "상대") {
            //스킬의 부가효과가 상대방의 랭크 변화인 경우
            int ad;
            if (s == 1) ad = 0;
            else ad = 1;
            랭크(b, bb, a[aa][skillnumber][8], stoi(a[aa][skillnumber][9]), ad);
        }
    }

    //흡혈 부가효과는 반동 부가효과보다 우선적으로 처리해야함
    if (  a[aa][skillnumber][6] == "흡수"   &&   alife[aa] != stoi(a[aa][0][3])  ) {
        //공격측이 사용한 기술이 "데스윙"이나 "드레인키스"이고, 현재 체력이 풀피가 아닌 경우
        if (s == 0) printf("상대 ");
        cout << a[aa][0][0] << s1(a, aa);
        if (s == 1) printf("상대 ");
        int hill = damage * 3 / 4;
        if (alife[aa] + hill > stoi(a[aa][0][3]))
            hill = stoi(a[aa][0][3]) - alife[aa];
        cout << b[bb][0][0] << "에게서 체력을 흡수했다! (" << alife[aa] << "+" << hill;
        alife[aa] += hill;
        cout << "=" << alife[aa] << ")\n";
    }

    //공격한 쪽이 데미지를 입는 부가효과
    //이로 인해 공격측이 기절한다면 다른 부가효과들이 발생하지 않으므로 이를 먼저 처리해줘야함.
    int bandong = 101;
    if (b[bb][0][13] == "울멧" && a[aa][skillnumber][11] == "y") {
        //맞은쪽의 지닌 도구가 울퉁불퉁멧이고 상대가 사용한 기술이 접촉기이면
        cout << "[아이템 울퉁불퉁멧]\n";
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][11] << s1(a, aa) << "울퉁불퉁멧 때문에 데미지를 입었다! (";
        bandong = stoi(a[aa][0][3]) / 6;
        //울퉁불퉁멧으로 입는 반동 데미지는 전체 체력의 1/6
        if (bandong >= alife[aa]) { bandong = alife[aa]; }
        //반동 데미지가 현재 체력보다 높을경우 현재 체력만큼 데미지
        cout << alife[aa] << "-" << bandong << "=";
        alife[aa] -= bandong;
        cout << alife[aa] << ")\n";
        자뭉열매(a, aa, b, bb, alife);
        if (alife[aa] <= 0) {
            cout << alife[aa] << s1(a, aa) << "쓰러졌다!";
            bt[1] = -1;
            return;
            //기절했을경우 공격측의 다른 부가효과는 발동하지 않으므로 바로 return
        }
    }
    if (a[aa][skillnumber][6] == "반동") {
        cout << a[aa][0][0] << s1(a, aa) << "반동 데미지를 입었다! (";
        bandong = damage / stoi(a[aa][skillnumber][7]);
        //스킬 반동으로 인한 데미지는 스킬의 반동 수치에 따라 결정
        if (bandong >= alife[aa]) { bandong = alife[aa]; }
        //반동 데미지가 현재 체력보다 높을경우 현재 체력만큼 데미지
        cout << alife[aa] << "-" << bandong << "=";
        alife[aa] -= bandong;
        cout << alife[aa] << ") \n";
        자뭉열매(a, aa, b, bb, alife);
        if (alife[aa] <= 0) {
            cout << a[aa][0][0] << s1(a, aa) << "쓰러졌다!";
            bt[1] = -1;
            return;
            //받아야할 반동 데미지가 2개라 해도
            //이전 반동데미지로 기절했을 경우 다음 반동 데미지는 발동하지 않으므로,
            //기절시 바로 return하는 파트를 각 반동 파트마다 작성해준다.
        }
    }
    if (a[aa][0][13] == "생구") {
        //공격한 쪽의 도구가 생명의 구슬인 경우
        cout << "[아이템 생명의구슬]\n";
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][0] << "의 생명력이 조금 깎였다! ";
        bandong = (stoi(a[aa][0][3]) / 10);
        //생명의 구슬로 인한 데미지는 전체 체력의 1/10
        cout << "(" << alife[aa];
        alife[aa] = alife[aa] - bandong;
        cout << "-" << bandong << "=" << alife[aa] << ")\n";
        //체력이 얼마나 깎였는지 출력
        자뭉열매(a, aa, b, bb, alife);
        if (alife[aa] <= 0) {
            cout << alife[aa] << s1(a, aa) << "쓰러졌다!";
            bt[1] = -1;
            return;
        }
    }


    //공격한 쪽에게 발동되는 부가효과들

    if (a[aa][skillnumber][6] == "랭크" && rd < stoi(a[aa][skillnumber][7]) && a[aa][skillnumber][10] == "자신") {
        //스킬의 부가효과가 자신의 랭크 변화인 경우
        랭크(a, aa, a[aa][skillnumber][8], stoi(a[aa][skillnumber][9]), s);
    }
    if (a[aa][skillnumber][6] == "인파") {
        //인파이트는 랭크 변화가 2번이므로 따로 처리함
        랭크(a, aa, "방어", -1, s);
        랭크(a, aa, "특방", -1, s);
    }
    //썬더의 특성 정전기는 공격 당할때 발동하므로 "즉발특성"함수가 아닌 "부가효과" 함수에서 따로 처리함
    if (b[bb][0][12] == "정전기" && a[aa][skillnumber][11] == "y" && a[aa][5][0] == "n"
        && a[aa][0][1] != "전기" && a[aa][0][2] != "전기" && trd < 33) {
        //맞은쪽의 특성이 정전기이고, 상대가 사용한 기술이 접촉기이고, 상대가 상태이상에 걸리지 않았고
        //상대가 전기 타입이 아니면 33% 확률로 상대를 마비시킴
        printf("[특성 정전기]\n");
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][11] << s1(a, aa) << "마비되어 기술이 나오기 어려워졌다!\n";
        int spd = stoi(a[aa][0][8]);
        spd /= 2;
        string ssppdd = to_string(spd); // 마비는 상대의 스피드를 절반으로 깎음
        a[aa][0][8] = ssppdd;
        a[aa][5][0] = "y";
        a[aa][5][3] = "y";
    }
    if (a[aa][skillnumber][6] == "교체") {
        //공격 후 바로 교체하는 스킬
        if (s == 1) {//내 포켓몬이 사용한 경우
            cout << a[aa][0][11] << s1(a, aa) << "내 곁으로 돌아왔다!\n";
            교체(alife, aa, a, ps, b, bb);//"교체" 함수 호출 
            즉발특성(a, ps[0], 1, b, ps[1], ps);
        }
        else {//상대 포켓몬이 사용한 경우
            cout << a[aa][0][11] << s1(a, aa) << "상대 곁으로 돌아갔다!\n";
            상대교체(alife, aa, a, ps, bb, b);//"상대 교체" 함수 호출
            즉발특성(a, ps[1], 0, b, ps[0], ps);
        }
    }
    if (a[aa][skillnumber][6] == "풀죽음" && rd < stoi(a[aa][skillnumber][7])) {
        bt[0] = 1051;
    }
    





}



