#include "head.h"
//수정할 일이 별로 없는 함수들을 모아놓은 파일.
int a(int a) {
    if (a == 1) return 2;
    if (a == 2) return 3;
    if (a == 3) return 1;
}
int b(int b) {
    if (b == 1) return 3;
    if (b == 2) return 1;
    if (b == 3) return 2;
}
int av(int a) {
    if (a == 1) return 2;
    if (a == 2) return 3;
    if (a == 3) return 1;
}
int bv(int b) {
    if (b == 1) return 3;
    if (b == 2) return 1;
    if (b == 3) return 2;
}
//주어진 int값에 따라 특정 int값을 리턴하는 함수.
//현재 포켓몬이 아닌 포켓몬들을 지정할때 주로 사용.
//이름을 a로 했더니 인식 못하는 경우가 생겨서 av도 추가.
void cpuwintext() {
    printf("더이상 싸울 수 있는 포켓몬이 없다!\n");
    printf("\n\n");
    printf("---------------\n");
    printf("I CPU의 승리! I\n");
    printf("---------------\n");
    printf("\n\n\n\n\n\n\n\n\n\n\n");
}
void playerwintext() {
    printf("상대는 더이상 싸울 수 있는 포켓몬이 없다!\n");
    printf("\n\n");
    printf("--------------------\n");
    printf("I 플레이어의 승리! I\n");
    printf("--------------------\n");
    printf("\n\n\n\n\n\n\n\n\n\n\n");
}
//cpu와 플레이어가 승리하였을때 텍스트를 출력하는 함수
string s1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "은 ";
    else
        return "는 ";
}
string t1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "을 ";
    else
        return "를 ";
}
string k1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "으로 ";
    else
        return "로 ";
}
string s2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "은 ";
    else
        return "는 ";
}
string t2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "을 ";
    else
        return "를 ";
}
string k2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "으로 ";
    else
        return "로 ";
}
//은, 는과 같은 조사를 리턴하는 함수. 
void 리베로(string skillname, string p[][one][two], int pp, int s) {
    printf("[특성 리베로]\n");
    for (int i = 6; i < 11; i++) {
        for (int j = 0; j < two - 1; j++) {
            p[pp][i][j] = "null";
        }
    }//에이스번의 방어 상성값을 초기화
    if (s == 0)
        cout << "상대 ";
    cout << p[pp][0][11] << s1(p, pp);
    if (skillname == "화염볼") {//특정 스킬을 사용한 경우
        printf("불타입이 됐다!\n");
        p[pp][0][1] = "불꽃"; //해당 스킬의 타입으로 변경
        p[pp][7][0] = "땅";//또한 해당 타입의 방어 상성으로 변경
        p[pp][7][1] = "물";
        p[pp][7][2] = "바위";
        p[pp][8][0] = "강철";
        p[pp][8][1] = "벌레";
        p[pp][8][2] = "불꽃";
        p[pp][8][3] = "얼음";
        p[pp][8][4] = "페어리";
        p[pp][8][5] = "풀";
    }
    else if (skillname == "무릎차기") {
        printf("격투타입이 됐다!\n");
        p[pp][0][1] = "격투";
        p[pp][7][0] = "비행";
        p[pp][7][1] = "에스퍼";
        p[pp][7][2] = "페어리";
        p[pp][8][0] = "바위";
        p[pp][8][1] = "벌레";
        p[pp][8][2] = "악";
    }
    else if (skillname == "더스트슈트") {
        printf("독타입이 됐다!\n");
        p[pp][0][1] = "독";
        p[pp][7][0] = "땅";
        p[pp][7][1] = "에스퍼";
        p[pp][8][0] = "격투";
        p[pp][8][1] = "벌레";
        p[pp][8][2] = "독";
        p[pp][8][3] = "벌레";
        p[pp][8][4] = "페어리";

    }
    else if (skillname == "기습") {
        printf("악타입이 됐다!\n");
        p[pp][0][1] = "악";
        p[pp][7][0] = "격투";
        p[pp][7][1] = "벌레";
        p[pp][7][2] = "페어리";
        p[pp][8][1] = "악";
        p[pp][8][2] = "고스트";
        p[pp][10][0] = "에스퍼";
    }
    else //혹시 몰르 오류 처리
        cout << "리베로 오류, skillname : " << skillname << " a: " << a;
}
//에이스번의 특성 리베로를 처리하는 함수.
void 무릎차기실패(string p[][one][two], int k, int pn, int plife[], int ps[], string s[][one][two], int sn, int bt[]) {
    if (k == 0) { cout << "상대 "; }
    cout << p[pn][0][11] << s1(p, pn) << "의욕이 넘쳐서 땅에 부딪혔다! (";
    int mdamage = 524;
    mdamage = stoi(p[pn][0][3]) / 2;
    //무릎차기 실패로 인한 데미지는 최대 체력의 절반
    if (plife[pn] <= mdamage)
        mdamage = plife[pn];
    //해당 데미지가 현재 체력보다 높다면 현재 체력만큼만 데미지
    cout << plife[pn] << "-" << mdamage  << "=";
    plife[pn] -= mdamage;
    cout << plife[pn] << ")\n";
    //최대 체력의 절반만큼 데미지를 입고, 데미지 계산 출력
    자뭉열매(p, pn, s, sn, plife);
    if (plife[pn] <= 0) {
        if (k == 0) { cout << "상대 "; }
        cout << p[pn][0][11] << s1(p, pn) << "쓰러졌다!\n";
        bt[1] = -1;
    }
    //이로 인해 쓰러졌을경우 bt 배열에 -1값을 리턴.
}
//무릎차기가 실패한 경우 텍스트와 데미지 계산을 처리하는 함수

void 랭크(string a[][one][two], int aa, string dasang, int k, int s) {
    //랭크 변화를 처리하는 함수.
    int suchi = k;
    //수치는 함수 인자로 입력받는다
    int ranknumber=406;
    if (dasang == "공격")
        ranknumber = 0;
    else if (dasang == "특공")
        ranknumber = 1;
    else if (dasang == "방어")
        ranknumber = 2;
    else if (dasang == "특방")
        ranknumber = 3;
    else if (dasang == "스피드")
        ranknumber = 4;
    else
        printf("랭크 함수 랭크 대상 오류!");
    //변화시킬 랭크 대상에 따라 ranknumber를 지정.

    int rank = stoi(a[aa][11][ranknumber + 5]);
    //rank는 변화시킬 랭크의 기존 값.
    if (rank >= 6 && suchi > 0) {//랭크가 6 이상이고 수치가 양수면
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][11] << "의 " << a[aa][11][ranknumber];
        if (ranknumber = 4) { cout << "는"; }
        else { cout << "은"; }
        cout << "더이상 올라가지 않는다!"; //랭크 변화를 스킵한다.
        return;
    }
    if (rank <= -6 && suchi < 0) {//랭크가 -6 이하고 수치가 음수면
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][11] << "의 " << a[aa][11][ranknumber];
        if (ranknumber = 4) { cout << "는"; }
        else { cout << "은"; }
        cout << "더이상 떨어지지 않는다!";//랭크 변화를 스킵한다
        return;
    }
    else {//그 외엔 랭크값에 변화 수치를 더한다.
        rank = rank + suchi;
        if (rank > 6) rank = 6; //6 보다 크거나 -6보다 작으면 6, -6으로 지정.
        else if (rank < -6) rank = -6;
    }
    a[aa][11][ranknumber + 5] = to_string(rank);
    int ability = stoi(a[aa][11][ranknumber + 10]); //ability는 변화시킬 능력치의 고유수치.
    if (suchi != 0) {
        if (s == 0) cout << "상대 ";
        cout << a[aa][0][11] << "의 " << a[aa][11][ranknumber];
        if (ranknumber == 4) cout << "가 ";
        else cout << "이 ";
        if (suchi == 3 || suchi == -3) { cout << "매우 크게 "; }
        else if (suchi == 2 || suchi == -2) { cout << "크게 "; }
        if (suchi < 0) { cout << "떨어졌다!\n"; }
        else if (suchi > 0) { cout << "올라갔다!\n"; }//수치에 따라 텍스트를 조정한다.
    }
    if (rank < 0) {
        ability = ability * 2 / (-rank + 2);
    }//rank가 음수일때는 해당 식에 따라 능력치를 조정한다.
    else if (rank >= 0) {
        ability = ability * (rank + 2) / 2;
    }//양수일떄는 해당 식을 따른다.
    else
        printf("etc 파일 ranks 함수 오류");
    a[aa][0][ranknumber + 4] = to_string(ability);
    //최종적으로 산출된 ability값을 능력치로 조정한다.

}

int 스피드비교(string p[][one][two], string s[][one][two], int pp, int ss) {
    int speed= 1047;
    int pspeed = stoi(p[pp][0][8]);
    int sspeed = stoi(s[ss][0][8]);
    if (pspeed > sspeed) { speed = 1; }
    else if (pspeed < sspeed) { speed = 0; }
    else if (pspeed == sspeed) { speed = rand() % 2; }
    return speed;
}
//스피드를 비교해서 플레이어가 빠르면 1을, cpu가 빠르면 0을 리턴한다.

int 우선도비교(string p[][one][two], string s[][one][two], int pp, int ss, int number, int snumber) {
    int speed=1138;
    int pspeed = stoi(p[pp][0][8]);
    int sspeed = stoi(s[ss][0][8]);
    if (p[pp][number][6] == "우선도") { pspeed += stoi(p[pp][number][7]) * 3000; } //우선도 처리
    if (s[ss][snumber][6] == "우선도") { sspeed += stoi(s[ss][snumber][7]) * 3000; }
    if (p[pp][0][12] == "질풍날개" && p[pp][number][1] == "비행") { pspeed += 3000; } //우선도 처리
    if (s[ss][0][12] == "질풍날개" && s[ss][snumber][1]== "비행") { sspeed += 3000; }
    if (pspeed > sspeed) { speed = 1; } //플레이어가 빠르면 1
    else if (pspeed < sspeed) { speed = 0; } //cpur가 빠르면 0
    else if (pspeed == sspeed) { speed = (pspeed+number+snumber) % 2; } //둘이 같으면 1과 0중 랜덤으로 값 리턴

    return speed;
}
//우선도를 고려해야하기에 기존의 스피드 비교 함수를 사용할 수 없음.

void 스카프(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "스카프") {
            int scarf = stoi(p[i][11][14]);
            scarf = scarf * 3 / 2;
            p[i][11][14] = to_string(scarf);
            p[i][0][8] = to_string(scarf);
        }
        if (s[i][0][13] == "스카프") {
            int scarf = stoi(s[i][11][14]);
            scarf = scarf * 3 / 2;
            s[i][11][14] = to_string(scarf);
            s[i][0][8] = to_string(scarf);
        }
    }
}
//지닌 도구가 스카프인 포켓몬의 고유 스피드 값을 1.5배로 올리는 함수.

void 머리띠(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "머리띠") {
            int scarf = stoi(p[i][11][10]);
            scarf = scarf * 3 / 2;
            p[i][11][10] = to_string(scarf);
            p[i][0][4] = to_string(scarf);
        }
        if (s[i][0][13] == "머리띠") {
            int scarf = stoi(s[i][11][10]);
            scarf = scarf * 3 / 2;
            s[i][11][10] = to_string(scarf);
            s[i][0][4] = to_string(scarf);
        }
    }
}
//지닌 도구가 스카프인 포켓몬의 고유 스피드 값을 1.5배로 올리는 함수.

void 돌격조끼(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "돌조") {
            int scarf = stoi(p[i][11][13]);
            scarf = scarf * 3 / 2;
            p[i][11][13] = to_string(scarf);
            p[i][0][7] = to_string(scarf);
        }
        if (s[i][0][13] == "돌조") {
            int scarf = stoi(s[i][11][13]);
            scarf = scarf * 3 / 2;
            s[i][11][13] = to_string(scarf);
            s[i][0][7] = to_string(scarf);
        }
    }
}
//지닌 도구가 돌격조끼인 포켓몬의 고유 특방 값을 1.5배로 올리는 함수.
void 모래바람캔슬(string p[][one][two], string k[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][1] == "바위" || p[i][0][2] == "바위") {
            p[i][11][13] = to_string(stoi(p[i][11][13]) * 2 / 3);
            랭크(p, i, "특방", 0, 1);
        }
        if (k[i][0][1] == "바위" || k[i][0][2] == "바위") {
            k[i][11][13] = to_string(stoi(k[i][11][13]) * 2 / 3);
            랭크(k, i, "특방", 0, 0);
        }
    }
}

void 자뭉열매(string a[][one][two], int aa,  string b[][one][two], int bb, int alife[]) {
    if (a[aa][0][13] == "열매" && alife[aa] <= stoi(a[aa][0][3]) / 2 && alife[aa] > 0 && b[bb][0][12] != "흑마") {
        cout << "[아이템 자뭉열매]\n";
        a[aa][0][13] == "null"; //열매는 1회용이므로 발동되면 사라진다.
        cout << a[aa][0][11] << s1(a, aa);
        cout << "자뭉열매로 체력을 회복했다! (" << alife[aa] << "+" << stoi(a[aa][0][3]) / 4 << "=";
        alife[aa] += stoi(a[aa][0][3]) / 4;
        cout << alife[aa] << ")\n";
    }
}