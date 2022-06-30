
#include "head.h"
#include "pokemon.h"

int main() {

    srand((unsigned int)time(NULL));
    //난수 생성

    string p[num][one][two];
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            p[1][i][j] = 파이어로[i][j];
        }
    }
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            p[2][i][j] = 랜드로스[i][j];
        }
    }
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            p[3][i][j] = 칠색조[i][j];
        }
    }

    string s[num][one][two];
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            s[1][i][j] = 자시안[i][j];
        }
    }
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            s[2][i][j] = 마기라스[i][j];
        }
    }
    for (int i = 0; i < one - 1; i++) {
        for (int j = 0; j < two - 1; j++) {
            s[3][i][j] = 우라오스[i][j];
        }
    }

    int bt[2] = { 0, 0};
    //bt[0] = 상대가 공격을 맞고 기절하면 -1, 아니면 0
    //bt[1] = 공격한 쪽이 반동으로 기절하면 -1, 아니면 0
    //0 0 = 공격을 맞고 기절하지 않아 반격한 경우
    //-1 0 = 공격을 맞고 기절한 경우 (반격하지 않음)
    //0 -1 = 공격을 맞고 기절하지 않았지만 상대가 반동으로 기절한 경우 (반격을 하지만 실패함)
    //-1 -1 = 공격을 맞고 기절했는데 상대도 반동으로 기절한 경우

    int ps[13] = { 1,1,0,0,0,0,0,0,0,0,0,0,0 };
    //ps[0] = 플레이어의 필드 위 포켓몬 번호. 
    //ps[1] = cpu의 필드 위 포켓몬 번호.
    //ps[2] = 필드의 날씨가 비면 1, 아니면 0
    //ps[3] = 비 카운트. 날씨가 비로 바뀌면 5가 지정되고 매 턴 1씩 까여 0이 되면 비가 끝난다.
    //ps[4],[6] 다른 날씨
    //ps[5],[7] 다른 날씨 카운트
    //ps[8] = 필드의 날씨가 모래바람이면 1, 아니면 0
    //ps[9] = 모래바람 카운트
    //ps[10] = 교체 전 플레이어 포켓몬 번호
    //ps[11] = 교체 전 cpu 포켓몬 번호 *기술 속임수 구현에 필요
    //ps[12] = 플레이어 진영의 스텔스록 여부
    //ps[13] = CPU 진영의 스텔스록 여부
  

    int dmg[2] = { 777, 0 };
    //공격한 데미지와 물리 여부를 저장하는 배열.
    //받은 물리 공격 데미지의 2배로 돌려주는 "카운터" 기술 구현에 사용.

    int ppp[4][5] = {
        {0,0,0,0,0},
        { 0, stoi(p[1][1][4]),stoi(p[1][2][4]),stoi(p[1][3][4]), stoi(p[1][4][4]) },
        { 0, stoi(p[2][1][4]),stoi(p[2][2][4]),stoi(p[2][3][4]), stoi(p[2][4][4]) },
        { 0, stoi(p[3][1][4]),stoi(p[3][2][4]),stoi(p[3][3][4]), stoi(p[3][4][4]) } };
    int sss[4][5] = {
        {0,0,0,0,0},
        { 0, stoi(s[1][1][4]),stoi(s[1][2][4]),stoi(s[1][3][4]), stoi(s[1][4][4]) },
        { 0, stoi(s[2][1][4]),stoi(s[2][2][4]),stoi(s[2][3][4]), stoi(s[2][4][4]) },
        { 0, stoi(s[3][1][4]),stoi(s[3][2][4]),stoi(s[3][3][4]), stoi(s[3][4][4]) } };
    //플레이어와 cpu 포켓몬들의 pp를 나타내는 배열. int값으로 여러번 사용하므로 따로 지정
    int plife[4] = { 0, stoi(p[1][0][3]),stoi(p[2][0][3]),stoi(p[3][0][3]) };
    int slife[4] = { 0, stoi(s[1][0][3]),stoi(s[2][0][3]),stoi(s[3][0][3]) };
    //플레이어와 cpu 포켓몬들의 체력을 나타내는 배열. 역시나 int값으로 여러번 사용하므로 따로 지정.
    
    스카프(p, s);
    //지닌 물건이 스카프인 포켓몬의 스피드 1.5배 증가
    돌격조끼(p, s);
    //지닌 물건이 돌격조끼인 포켓몬의 특방 1.5배 증가
    머리띠(p, s);
    //지닌 물건이 머리띠인 포켓몬의 공격 1.5배 증가
    

    printf("\n\n");
    cout << "상대는 " << s[1][0][11] << t1(p, ps[0]) << "내보냈다!\n";
    cout << "가랏! " << p[1][0][11] << "!\n\n";
    int startspeed = 스피드비교(p, s, 1,1);
    if (startspeed == 1) {//플레이어 포켓몬이 더 빠른 경우
        즉발특성(p, ps[0], 1, s, ps[1], ps);//플레이어 포켓몬의 특성 먼저 발동
        즉발특성(s, ps[1], 0, p, ps[0], ps);//이후 상대 포켓몬의 특성 발동
    }
    else if (startspeed == 0) {//상대방 포켓몬이 더 빠른 경우
        즉발특성(s, ps[1], 0, p, ps[0], ps);//상대 먼저 특성 발동
        즉발특성(p, ps[0], 1, s, ps[1], ps);//후 플레이어 특성 발동
    }
    else
        printf("startspeed 오류, main파일, id 3483589\n");
    
   





























    while (1) {//배틀의 매 턴은 while문으로 구현됨.

        if ((plife[1] <= 0 || p[1][0][9] == "y") && (plife[2] <= 0 || p[2][0][9] == "y") && (plife[3] <= 0 || p[3][0][9] == "y")) {
            cpuwintext();
            break;
        }
        else if ((slife[1] <= 0 || s[1][0][9] == "y") && (slife[2] <= 0 || s[2][0][9] == "y") && (slife[3] <= 0 || s[3][0][9] == "y")) {
            playerwintext();
            break;
        }//플레이어나 cpu의 포켓몬이 전부 쓰러지면 전용 텍스트가 출력되고 break
        ps[10] = ps[0];
        ps[11] = ps[1];
        dmg[1] = 0;//예외 사항 방지를 위해 dmg 배열 값은 매 턴 초기화. 
        mainpage(p, s, plife, slife, ps, ppp);//메인페이지. 각 포켓몬의 이름과 체력 출력

        int act = 0; // 스킬을 사용했을 경우 1, 교대 했을 경우 0. 
        int attack = 0; // 공격하였을 경우 1, 공격기가 아닌 변화기를 사용하였을 경우 0
        string strnumber = "null";
        int number = 486;


        //플레이어 선택
        //act, attack, number 세가지 변수의 값을 정한다.
        while (1) {
            cout << "   입력: ";
            cin >> strnumber;
            //다음에 할 행동을 문자열로 입력받는다.
            //스킬을 사용할꺼면 스킬 번호나 스킬명을,
            //교체할꺼면 "교체"를 입력한다.

            for (int i = 1; i < 5; i++) {
                if (strnumber == p[ps[0]][i][0]) {
                    number = i;
                }
            }
            //스킬명을 입력할 경우 number 값을 해당 스킬의 번호로 변경한다

            if (strnumber == "교체")
                number = 5;
            //"교체"를 입력할경우 number 값을 5로 변경한다
            if (strnumber == "1" || strnumber == "2" || strnumber == "3" || strnumber == "4" || strnumber == "5" )
                number = stoi(strnumber);
            //1부터 5의 숫자를 입력받을 경우 string을 int로 변경한다
            
            printf("\n\n======================================================\n\n");
            if (number == 5) {//교체를 선택한 경우
                if (plife[a(ps[0])] < 0 && plife[b(ps[0])] < 0) {
                    printf("더이상 교체할 수 있는 포켓몬이 없다!\n");
                    continue;//다른 두 포켓몬이 전부 쓰러졌으면 continue
                }
                break;//아니면 break
            }
            else if (number == 1 || number == 2 || number == 3 || number == 4) {//1,2,3,4입력 = 스킬 사용을 선택한 경우

                act = 1; //교체가 아닌 스킬을 사용했으므로 act값은 1이된다.  
                if (ppp[ps[0]][number] <= 0 || p[ps[0]][number][13]=="n") {
                    //스킬의 pp가 0이거나 사용 불가능한 상태일 경우 발동 불가
                    //사용 불가 상태는 스카프, 돌격조끼 등 아이템에 의해 결정.
                    cout << p[ps[0]][number][0] << s2(p, ps[0], number);
                    if (ppp[ps[0]][number] <= 0) cout << "pp가 없어 더이상 "; //pp 부족일 경우에만 출력
                    cout << "사용할 수 없다!";

                    int scf = 425;
                    for (int i = 1; i < 5; i++) {
                        if (p[ps[0]][i][13] == "y")
                            scf = i;
                    }

                    if (p[ps[0]][0][13] == "스카프") {
                        cout << " (스카프)\n";
                        cout << "사용 가능 스킬 : " << scf << "." << p[ps[0]][scf][0];
                    }
                    if (p[ps[0]][0][13] == "머리띠") {
                        cout << " (머리띠)\n";
                        cout << "사용 가능 스킬 : " << scf << "." << p[ps[0]][scf][0];
                    }

                    cout << "\n\n";
                    continue;
                }
                else { //사용 가능한 경우
                    ppp[ps[0]][number] -= 1; 
                    //스킬의 pp를 1 사용한다 

                    if (p[ps[0]][number][5] == "변화") { attack = 0; }
                    //변화기를 사용할경우 attack는 0
                    else if (p[ps[0]][number][5] == "물리" || p[ps[0]][number][5] == "특수") { attack = 1; } 
                    //공격기를 사용할경우 attack은 1 
                    else { printf("내 물리 특수 오류 #line 246"); } 
                    //그 외엔 오류
                    break;
                }
            }
            else {//적합하지 않은 값을 입력받은 경우 while문으로 계속 입력받음
                cout << "\n  [입력 오류] 스킬명이나 교체, 또는 번호 를 입력해주세요.\n\n";
                printf("\n======================================================\n\n");
                continue;
            }
        }

        


        
        int sact = 0; //cpu가 교체했으면 0, 스킬을 사용했으면 1
        int sattack = 0;//사용한 스킬이 공격기면 1, 변화기면 0
        int snumber = 0;//cpu가 선택한 행동 번호
        //CPU 선택
        //마찬가지로 sact, sattack, snumber 값을 결정한다.
        while (1) {
            cout << "상대 스킬 & 남은 pp : (" << s[ps[1]][1][0] << "&" << sss[ps[1]][1] << ") (" << s[ps[1]][2][0] << "&" << sss[ps[1]][2] << ") ("
                << s[ps[1]][3][0] << "&" << sss[ps[1]][3] << ") (" << s[ps[1]][4][0] << "&" << sss[ps[1]][4] << ")\n";
            cout << "   상대방: ";
            cin >> snumber;
            cout << "\n\n\n\n\n";
            //snumber = ((rand() % 5) + 1); //1부터 5의 값중 랜덤으로 지정
            if (snumber == 5) {
                if (slife[a(ps[1])] <= 0 && slife[b(ps[1])] <= 0)
                    continue;//5=교체일경우 다른 포켓몬이 전부 쓰러졌으면 continue, 그 외엔 break
                break;
            }
            else if (snumber == 1 || snumber == 2 || snumber == 3 || snumber == 4) {//1 ~ 4 = 스킬 사용
                if (sss[ps[1]][snumber] <= 0 || s[ps[1]][snumber][13]=="n") { continue; }
                //pp를 전부 사용했거나 사용 불가 상태면 continue
                else {
                    sact = 1;//그 외엔 스킬을 사용했으니 sact = 1
                    sss[ps[1]][snumber] -= 1;//pp 1 소모
                    
                    if (s[ps[1]][snumber][5] == "변화") { sattack = 0; } //변화기면 sattack = 0
                    else if (s[ps[1]][snumber][5] == "물리" || s[ps[1]][snumber][5] == "특수") { sattack = 1; } //공격기면 1
                    else { printf("CPU 물리 특수 오류 #line 286\n"); }//그 외엔 오류 캐치
                    break;
                }
            }
        }

        //날씨 상태 출력
        if (ps[2] == 1) printf("비가 내리고 있다...\n");
        if (ps[8] == 1) printf("모래바람이 불고 있다...\n");

        //교체 및 특성 처리
        while (1) {
            if (number == 5 && snumber != 5) {//나만 교체한 경우
                교체(plife, ps[0], p, ps, s, ps[1]);
                즉발특성(p, ps[0], 1, s, ps[1], ps);//교체 및 특성 발동
            }

            else if (number != 5 && snumber == 5) {//상대만 교체한 경우
                상대교체(slife, ps[1], s, ps, ps[0], p);
                즉발특성(s, ps[1], 0, p, ps[0], ps);
            }
            else if (number == 5 && snumber == 5) {//둘다 교체한 경우
                int tsspeed = 스피드비교(p, s, 1, 1);
                if (tsspeed == 1) {//내가 더 빠른 경우
                    교체(plife, ps[0], p, ps, s, ps[1]);
                    상대교체(slife, ps[1], s, ps, ps[0], p);
                    printf("\n");
                    즉발특성(p, ps[0], 1, s, ps[1], ps);//내 특성 먼저 발동
                    즉발특성(s, ps[1], 0, p, ps[0], ps);
                }
                else if (tsspeed == 0) {//상대가 더 빠른 경우

                    교체(plife, ps[0], p, ps, s, ps[1]);//상대 먼저 교체하면 상대가 무엇으로 교체했는지 텍스트가 뜬다.
                    상대교체(slife, ps[1], s, ps, ps[0], p);//이를 막기 위해 상대가 빨라도 교체는 플레이어 먼저.
                    printf("\n");
                    즉발특성(s, ps[1], 0, p, ps[0], ps);
                    즉발특성(p, ps[0], 1, s, ps[1], ps);
                }
                else
                    printf("startspeed 오류, main파일, id 3283524\n");
            }
            break;
        
        }

        //특성 프레셔 구현
        //특성이 프레셔인 대상으로 한 기술에만 적용되므로,
        //교체 이벤트 이후 처리해야하며
        //상대방을 대상으로 하는 공격기들과 맹독, 하품과 같은 일부 변화기만 적용한다.
        if (s[ps[1]][0][12] == "프레셔" && ppp[ps[0]][number] != 0 && (attack == 1 || p[ps[0]][number][0]=="맹독" || p[ps[0]][number][0] == "하품"))
            ppp[ps[0]][number] -= 1;
        if (p[ps[0]][0][12] == "프레셔" && sss[ps[1]][snumber] != 0 && (sattack==1 || s[ps[1]][snumber][0] == "맹독" || s[ps[1]][snumber][0] == "하품"))
            sss[ps[1]][snumber] -= 1;
        //상대방의 특성이 "프레셔"면 pp를 2 소모한다.
        //pp가 1 남은 경우엔 1만 깎는다.

        
        //속도 처리
        int usd = 0;
        int susd = 0; 
        //플레이어와 cpu 스킬의 우선도 여부를 나타내는 변수
        //스킬에 우선도가 있으면 포켓몬의 스피드를 대폭 증가시키고 usd, susd 변수 값을 1로 지정 
        //이후 턴이 끝날때 usd, susd 값이 1이면 포켓몬의 스피드를 원래대로 되돌림

        int speed = 1147;
        speed = 우선도비교(p, s, ps[0], ps[1], number, snumber);

        //배틀
        bt[0] = 326;//공격을 맞은 포켓몬의 기절 여부
        bt[1] = 722;//공격을 한 포켓몬의 기절 여부
        if (speed == 1) { //플레이어가 더 빠를때
            if (act == 1) { 명중(p, s, ps[0], ps[1], number, attack, bt, 1, slife, ps, plife, speed, sattack, dmg, snumber); }
            //act가 1일때 = 스킬을 사용했을때 명중 함수 실행
            //명중 함수는 스킬의 명중 여부를 체크하고 배틀을 진행하는 함수.
            if (bt[0] == 1051 && sact == 1) { cout << "상대 " << s[ps[1]][0][0] << s1(s,ps[1])<<"풀이 죽어 움직일 수 없었다!\n"; }
            else if (bt[0] != -1 && sact == 1) { 명중(s, p, ps[1], ps[0], snumber, sattack, bt, 0, plife, ps, slife, speed, attack, dmg, snumber); }
            //bt[0]이 -1이 아닐때 = 후공인 포켓몬이 선공을 맞고 기절하지 않았을때
            //sact == 1 스킬 사용시 반격.
        }
        else if (speed == 0) { // 상대가 더 빠를때
            if (sact == 1) { 명중(s, p, ps[1], ps[0], snumber, sattack, bt, 0, plife, ps, slife, speed, attack, dmg, snumber); }
            if (bt[0] == 1051 && act == 1) { cout << p[ps[0]][0][0] << s1(p, ps[0]) << "풀이 죽어 움직일 수 없었다!\n"; }
            else if (bt[0] != -1 && act == 1) { 명중(p, s, ps[0], ps[1], number, attack, bt, 1, slife, ps, plife, speed, sattack, dmg, snumber); }
            //반대로 진행
        }

        if (number != 4) {//다른 스킬 사용시 방어 성공확률 초기화
            p[ps[0]][4][15] = "100";
        }
        if (snumber != 4) {
            s[ps[1]][4][15] = "100";
        }
                
        if (speed == 1) { //플레이어가 더 빠를때
            후처리(p, plife, ps[0], ps, ppp, 1, s, ps[1]);
            후처리(s, slife, ps[1], ps, sss, 0, p, ps[0]);
        }
        else {
            후처리(s, slife, ps[1], ps, sss, 0, p, ps[0]);
            후처리(p, plife, ps[0], ps, ppp, 1, s, ps[1]);
        }
        //턴이 끝날때 처리할 것들을 모아놓은 함수
        //스피드가 빠른쪽이 먼저 후처리 진행

        //체력이 0인 포켓몬의 교체 처리
        if (plife[ps[0]] <= 0) {
            교체(plife, ps[0], p, ps, s, ps[1]);
            즉발특성(p, ps[0], 1, s, ps[1], ps);
        }
        else if (slife[ps[1]] <= 0) {
            상대교체(slife, ps[1], s, ps, ps[0], p);
            즉발특성(s, ps[1], 0, p, ps[0], ps);
        }
               

        if (ps[2] == 1) {
            ps[3] -= 1;
            if (ps[3] == 0) {
                printf("비가 그쳤다!\n");
                ps[2] = 0;
            }
        }
        //날씨가 비 상태이면
        //남은 비 턴을 1 깎음
        //해당 값이 0이 되면 비 날씨를 없앰
        if (ps[8] == 1) {
            ps[9] -= 1;
            if (ps[9] == 0) {
                printf("모래바람이 멎었다!\n");
                ps[8] = 0;
                모래바람캔슬(p, s);
            }
        }
        //모래바람.


        cout << "\n\n디버깅용\nps[0]:" << ps[0] << " ps[1]:" << ps[1]<<"\n\n";
        cout << "상대: " << s[ps[1]][0][0] << " 타입: " << s[ps[1]][0][1] << "&" << s[ps[1]][0][2];
        cout << " 나: " << p[ps[0]][0][0] << " 타입: " << p[ps[0]][0][1] << "&" << p[ps[0]][0][2];

        cout<<"\n\n상대 랭업 상태 : 공격 " << s[ps[1]][11][5] << "   특공 " << s[ps[1]][11][6] <<
            "   방어 " << s[ps[1]][11][7] << "   특방 " << s[ps[1]][11][8] << "   스피드 " << s[ps[1]][11][9];

        cout << "\n상대 현재 스탯 : 공격 " << s[ps[1]][0][4] << " 특공 " << s[ps[1]][0][5] <<
            " 방어 " << s[ps[1]][0][6] << " 특방 " << s[ps[1]][0][7] << " 스피드 " << s[ps[1]][0][8] << "\n";

        cout << "상대 원래 스탯 : 공격 " << s[ps[1]][11][10] << " 특공 " << s[ps[1]][11][11] <<
            " 방어 " << s[ps[1]][11][12] << " 특방 " << s[ps[1]][11][13] << " 스피드 " << s[ps[1]][11][14] << "\n";
        cout << "상대 스킬 & 남은 pp : (" << s[ps[1]][1][0] << "&" << sss[ps[1]][1] << ") (" << s[ps[1]][2][0] << "&" << sss[ps[1]][2] << ") ("
            << s[ps[1]][3][0] << "&" << sss[ps[1]][3] << ") (" << s[ps[1]][4][0] << "&" << sss[ps[1]][4] << ")\n";
        cout << "\n내 랭업 상태 : 공격 " << p[ps[0]][11][5] << "   특공 " << p[ps[0]][11][6] <<
            "   방어 " << p[ps[0]][11][7] << "   특방 " << p[ps[0]][11][8] << "   스피드 " << p[ps[0]][11][9] << "\n";

        cout << "내 현재 스탯 : 공격 " << p[ps[0]][0][4] << " 특공 " << p[ps[0]][0][5] <<
            " 방어 " << p[ps[0]][0][6] << " 특방 " << p[ps[0]][0][7] << " 스피드 " << p[ps[0]][0][8] << "\n";

        cout << "내 원래 스탯 : 공격 " << p[ps[0]][11][10] << " 특공 " << p[ps[0]][11][11] <<
            " 방어 " << p[ps[0]][11][12] << " 특방 " << p[ps[0]][11][13] << " 스피드 " << p[ps[0]][11][14] << "\n";
        
        
        
        
     
    }


}


void mainpage(string p[][one][two], string s[][one][two], int plife[], int slife[], int ps[], int ppp[4][5]) {
    //포켓몬의 이름 행동 선택지 출력 함수
    printf("\n\n======================================================");
    cout << "\n\n";
    if (ps[2] == 1) {
        printf("날씨 : 비\n\n");
    }
    else if (ps[8] == 1) {
        printf("날씨 : 모래바람\n\n");
    }
    if (ps[13] == 1) {
        printf("상대 필드 : 스텔스록\n\n");
    }
    if (ps[12] == 1) {
        printf("플레이어 필드 : 스텔스록\n\n");
    }
    cout << "상대 포켓몬: " << s[ps[1]][0][0] << " ( " << slife[ps[1]] << " / " << s[ps[1]][0][3] << " )";
    cout << "\n\n";
    cout << "내 포켓몬: " << p[ps[0]][0][0] << " ( " << plife[ps[0]] << " / " << p[ps[0]][0][3] << " )";

    printf("\n\n======================================================\n\n");
    printf("\n\n행동 선택\n\n");
    for (int i = 1; i < 5; i++) {
        cout << "   " << i << ". " << p[ps[0]][i][0] << " (" << ppp[ps[0]][i] << "/" << p[ps[0]][i][4] << ")\n";
        cout << "     - 타입 : "<<p[ps[0]][i][1] << " // 위력 : "<< p[ps[0]][i][2] << " // 명중률 : " << p[ps[0]][i][3]<<" // "<< p[ps[0]][i][14];
        cout << "\n\n";
    }
    cout << "   5. 교체 -> ";
    if (plife[a(ps[0])] > 0 && plife[b(ps[0])] > 0) //둘다 교체 가능한 경우
        cout << p[a(ps[0])][0][11] << " // " << p[b(ps[0])][0][11]; //둘다 출력
    else if (plife[a(ps[0])] > 0 && plife[b(ps[0])] <= 0)//하나만 교체 가능한 경우
        cout << p[a(ps[0])][0][11]; //교체 가능한 포켓몬의 이름 출력
    else if (plife[b(ps[0])] > 0 && plife[a(ps[0])] <= 0)
        cout  << p[b(ps[0])][0][11]; 
    else if (plife[a(ps[0])] <= 0 && plife[b(ps[0])] <= 0) // 둘다 쓰러진 경우
        cout << "불가능";//불가능 출력

    cout << "\n\n";
    

}
