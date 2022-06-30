#include "head.h"

//상대에게 공격스킬을 사용하였을 때 상대에게 줄 데미지를 계산하여 처리하는 함수
void 공격스킬(string a[][one][two], string b[][one][two], int aa, int bb, int number, int alife[], int blife[], int s, int ps[], int dmg[], int bt[], int snumber) {

    //a = 때린 포켓몬 aa = 해당 포켓몬 번호 aflie = 해당 포켓몬 체력 number = 사용한 스킬 번호
    //b = 맞은 포켓몬 bb = 해당 포켓몬 번호 bflie = 해당 포켓몬 체력
    //s = 1, 플레이어가 공격 s=0, cpu가 공격
    //ps[] = 현재 필드에 있는 포켓몬의 번호를 나타내는 배열
    //dmg[] = 공격한 데미지를 저장하는 배열. 기술 "카운터"에 사용. (카운터는 맞은 물리 공격의 데미지를 2배로 돌려준다)
    //bt[] = 배틀 상황을 나타내는 배열. 공격을 맞은 상대가 기절하면 bt[0]=-1, 공격을 한 쪽이 기절하면 bt[1]=-1 

    int randomnum = (rand() % 16) + 85; 
    //데미지 계산에 사용하는 랜덤한 수
    int beforelife = blife[bb];
    //공격을 맞기 이전의 체력. 기합의 띠 조건 체크에 사용
    int gs = rand() % 16; 
    //급소 카운터. gs는 0부터 15이며 gs가 0일경우 (=1/16 확률) 데미지 2배
    if (  (a[aa][number][0] == "섀도크루" || a[aa][number][0]=="스톤에지")   &&   (gs == 0 || gs == 1)  )    { gs = 2; } //섀도크루, 스톤엣지는 급소 확률이 2배
    else if (gs == 0 || a[aa][number][0] == "암흑강타") { gs = 2; } //암흑강타는 급소 확정
    else gs = 1;
    
    int tm, mt = 0;
    if (a[aa][number][5] == "물리") { tm = 4; mt = 6; }
    else if (a[aa][number][5] == "특수") { tm = 5; mt = 7; }
    else
        printf("데미지 함수 물리 특수 오류");
    //물리 스킬로 공격할 시 공격한 쪽의 공격력과 맞은 쪽의 방어력을,
    //특수 스킬로 공격할 시 공격한 쪽의 특공과 맞은 쪽의 특방을 데미지 계산에 사용
    if (a[aa][number][0] == "사이코쇼크") { tm = 5; mt = 6; };
    //사이코쇼크는 공격한 쪽의 특공과 맞은 쪽의 방어력을 사용하는 독특한 기술이다.


    int damage = 1152;
    int atk = stoi(a[aa][0][tm]);
    //atk 물리기면 공격 포켓몬의 공격력을, 특수기면 공격 포켓몬의 특수공격력을 참조.
    int dfs = stoi(b[bb][0][mt]);
    //dfs 물리기면 맞는 포켓몬의 방어력을, 특수기면 맞는 포켓몬의 특수방어력을 참조.

    if (gs == 2) {
        if(dfs > stoi(b[bb][11][mt + 6])) //맞는 쪽의 현재 방어력이 원래 방어력보다 높은 경우 = 방어력이 랭크업한 경우
            dfs = stoi(b[bb][11][mt + 6]);
        if (atk < stoi(a[aa][11][tm + 6]))//공격한 쪽의 현재 공격력이 원래 공격력보다 높은 경우 = 공격력이 랭크다운한 경우
            atk = stoi(a[aa][11][tm + 6]);
    }
    //급소에 맞았다면 공격측의 랭크다운과 방어측의 랭크업을 무시한다

    if (b[bb][0][12] == "천진" && a[aa][number][6] != "틀깨기")
        atk = stoi(a[aa][11][tm + 6]);
    //맞는쪽의 특성이 "천진"일경우 공격측의 랭크변화를 무시한다 = 현재 공격력이 아닌 원래 공격력을 참조한다.
    //단 공격쪽의 특성이 "틀깨기"=방어 특성 무시면 제외한다. 
    
    if (a[aa][number][0] == "속임수") {
        int sys = 0;
        if (s == 1) sys = ps[11]; 
        //내가 속임수를 사용한 경우 상대방의 교체 전 포켓몬의 공격력 참조
        else if (s == 0) sys = ps[10];
        //상대방이 속임수를 사용한 경우 나의 교체 전 포켓몬의 공격력 참조
        atk = stoi(b[sys][0][4]);
        //스킬 "속임수"는 상대방의 교체전 포켓몬의 공격력을 참조한다.
    }
    

    if (a[aa][number][0] != "카운터") {
        damage = (22 * stoi(a[aa][number][2]) * atk / 50 / dfs);
        //  데미지 =  22 *        위력      공격 or 특공  방어 or 특방    
        damage = (damage + 2) * gs * randomnum / 100; 
        //그리고 기습 수치와 랜덤수를 곱하여 100으로 나눔
        damage = 위력증감(a[aa][number][1], b, damage, bb, 0, a, aa, number, alife, ps, snumber);
        //위력을 바꾸는 변수들은 해당 함수에서 처리함.
        //카운터 스킬의 경우 주는 데미지가 고정 수치라 이를 사용하지 않음.

        if (blife[bb] - damage < 0)
            damage = blife[bb];
        //데미지가 현재 체력 이상이면 현재 체력 만큼 데미지
        if (blife[bb] - damage <= 0 && b[bb][0][13] == "기띠" && beforelife == stoi(b[bb][0][3]))
            damage -= 1;
        //상대방 기띠 발동시 데미지를 1 줄임
    }


    if (a[aa][number][5] == "물리" && a[aa][number][0] != "카운터") { dmg[0] = damage; dmg[1] = 1; }
    //물리 스킬를 사용하였을경우 해당 스킬의 데미지를 dmg 배열에 저장함. 카운터 스킬은 예외
    if (a[aa][number][0] == "카운터") {
        if (dmg[1] == 1) damage = dmg[0] * 2;
        else damage = 0;
    }
    //카운터는 맞은 물리 스킬의 데미지를 2배로 돌려주는 기술.
    //상대가 공격했을때 해당 값을 dmg 배열에 저장하고 해당 값에 따라 카운터의 성공 여부와 데미지를 결정.
    //dmg 배열의 값은 매 턴 초기화 됨.


    if (damage != 0) { 
        //데미지가 0이 아닐경우 = 스킬이 무효가 아니고 카운터가 실패하지 않은 경우
        if (gs == 2 && a[aa][number][0]!="카운터") printf("급소에 맞았다!\n"); 
        //gs가 2이면 급소 명중
        if (b[bb][0][12] == "탈" && a[aa][number][6] != "틀깨기") {
            cout << "[특성 탈]\n";
            if (s == 1) printf("상대 ");
            cout << b[bb][0][11]<<"의 탈이 대타가 되었다!\n";
            b[bb][0][12] = "탈까임"; 
            //탈은 1회용 특성이므로 발동되면 사라진다.
        }
        else {
            if (s == 1) printf("상대 ");
            //s가 1이면 플레이어가 공격하여 상대에게 맞은것이므로 이름 앞에 "상대"를 출력
            cout << b[bb][0][11] << s1(b, bb) << damage << "의 데미지를 입었다! (" << blife[bb];
            blife[bb] -= damage;
            // 상대 체력에서 계산한 데미지만큼 마이너스함.
            cout << "-" << damage << "=" << blife[bb] << ")\n";
            //상대 체력과 스킬 데미지 출력

            if (b[bb][0][13] == "기띠" && beforelife == stoi(b[bb][0][3]) && blife[bb]==1) {
                cout << "[아이템 기합의띠]\n";
                //지닌 아이템이 기합의 띠 이고 공격을 맞기 전 체력이 풀피였을 경우
                b[bb][0][13] == "null"; //기합의 띠는 1회용이므로 발동되면 사라진다.
                if (s == 1) cout << "상대 ";
                cout << b[bb][0][11] << s1(b, bb);
                cout << "기합의띠로 버텼다!\n";
            }

            자뭉열매(b, bb, a, aa, blife);
                
            if (blife[bb] <= 0) {
                //공격을 맞고 체력이 0 이하가 된 경우
                if (s == 1) cout << "상대 ";
                cout << b[bb][0][11] << s1(b, bb);
                cout << "쓰러졌다!\n";
                bt[0] = -1;
                //상대가 기절했으므로 bt[0] = -1, 상대가 기절한 뒤 행동하는걸 막기위해 사용
                if (a[aa][0][12] == "흑마") {
                    cout << "[특성 흑의울음]\n";
                    랭크(a, aa, "특공", 1, s);
                }
            }

            부가효과(a, number, b, aa, bb, s, alife, blife, ps, bt, damage);
            //스킬이 명중한 이후 발동하는 부가효과는 해당 함수에서 따로 처리
 
        }

        if (a[aa][number][0] == "고드름침" ) {
            //공격 스킬이 연속기 "고드름침"일 경우
            
            int gdrcdamage = 956;
            //고드름침의 데미지를 저장할 변수
            int gs2 = 957;
            int randomnum2 = 958;
            //연속기의 급소와 데미지 랜덤수 변수

            int gdrc = rand() % 6;
            if (gdrc == 0 || gdrc == 1) gdrc = 1;
            else if (gdrc == 2 || gdrc == 3) gdrc = 2;
            else if (gdrc == 4) gdrc = 3;
            else if (gdrc == 5) gdrc = 4;
            //고드름침으로 몇회 추가 공격할지 횟수를 정하는 변수
            //고드름침은 2~5번 공격하며, 이미 한번 공격했으므로 1번에서 4번 더 공격한다.
            //2,3번 공격할 확률은 각각 1/3, 4,5번 공격할 확률은 각각 1/6이다.
            int gdn = 1;
            //고드름침으로 공격한 횟수를 카운트하는 변수
            //중간에 적이 쓰러질 수 있으므로 gdrc와는 값이 다를 수 있어 따로 지정해야함

            for (int i = 0; i < gdrc; i++) {//gdrc만큼 반복
                if(blife[bb]>0){ //상대가 기절하지 않았을때만 공격
                    gdn += 1; 
                    //공격할때마다 공격 한 횟수 +1

                    gs2 = rand() % 16;
                    if (gs2 == 0) {
                        gs2 = 2;
                        printf("급소에 맞았다!\n");
                    }
                    else gs2 = 1;
                    //매 공격마다 급소 여부 체크
                    randomnum2 = (rand() % 16) + 85;
                    //매 공격마다 랜덤수를 새로 지정

                    gdrcdamage = damage * randomnum2 * gs2 / randomnum / gs;
                    //고드름침의 데미지 계산 새로운 랜덤수와 급소 변수를 곱하고, 기존에 곱해져있던 랜덤수와 급소 변수만큼 나눈다.

                    //cout << "\ngs2 " << gs2 << " random2 " << randomnum2 << " gdrcdamage " << gdrcdamage << " original " << originaldamage<<"\n";
                    //디버깅용

                    if (blife[bb] - gdrcdamage < 0)
                        gdrcdamage = blife[bb];
                    //데미지가 현재 체력 이상이면 현재 체력 만큼 데미지

                    if (s == 1) printf("상대 ");
                    //s가 1이면 플레이어가 공격하여 상대에게 맞은것이므로 이름 앞에 "상대"를 출력
                    cout << b[bb][0][11] << s1(b, bb) << gdrcdamage << "의 데미지를 입었다! (" << blife[bb];
                    blife[bb] -= gdrcdamage;
                    // 상대 체력에서 계산한 데미지만큼 마이너스함.
                    cout << "-" << gdrcdamage << "=" << blife[bb] << ")\n";
                    //상대 체력과 스킬 데미지 출력
                    dmg[0] = gdrcdamage; 
                    dmg[1] = 1;
                    //연속기를 카운터로 반격할경우, 마지막 공격 1회의 데미지의 2배로 되돌려준다.
                    자뭉열매(b, bb, a, aa, blife);

                    if (blife[bb] <= 0) {
                        //공격을 맞고 체력이 0 이하가 된 경우
                        if (s == 1) cout << "상대 ";
                        cout << b[bb][0][11] << s1(b, bb);
                        cout << "쓰러졌다!\n";
                        bt[0] = -1;
                        //상대가 기절했으므로 bt[0] = -1, 상대가 기절한 뒤 행동하는걸 막기위해 사용

                    }
                
                }
            }
            cout << "총 " << gdn << "번 공격했다!\n";
            //총 몇번 공격했는지 출력
        }
    }
    else { // 스킬 데미지가 0인 경우.
        if (a[aa][number][0] == "카운터")
            printf("하지만 실패했다!\n"); //스킬이 카운터면 실패한 것.
        else
            printf("효과가 없는 듯하다...\n"); //아닐경우 무효 타입이라 스킬이 효과가 없는 것.
    }

}