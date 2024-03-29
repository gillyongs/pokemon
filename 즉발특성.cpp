#include "head.h"

void 즉발특성(string p[][one][two], int pp, int s, string k[][one][two], int kn, int ps[]) {
    //등장 즉시 발동하는 특성을 처리하는 함수
    
    if (p[pp][0][12] == "불요의 검") {
        //자시안의 불요의 검, 자신의 공격력 1랭크 상승
        cout << "[특성 불요의 검]\n";
        if (s == 0) cout << "상대 ";
        랭크(p, pp, "공격", 1, 1);
    }
    if (p[pp][0][12] == "위협") {
        //랜드로스의 위협, 상대방의 공격력 1랭크 하락
        cout << "[특성 위협]\n";
        if (k[kn][0][12] == "둔감") {
            cout << "[특성 둔감]\n";
            cout << k[kn][0][11] << "의 공격력은 떨어지지않는다!\n";
        }
        //상대가 "둔감" 특성이면 위협이 통하지 않는다.
        else {
            if (s == 1) cout << "상대 ";
            랭크(k, kn, "공격", -1, 1);
        }
    }
    if (p[pp][0][12] == "잔비") {
        //가이오가의 잔비, 날씨를 비 상태로 만듬
        if (ps[2] != 1) { //현재 날씨가 비 상태가 아닐때만 발동
            cout << "[특성 잔비]\n";
            cout << "비가 내리기 시작했다!\n";
            ps[2] = 1;//필드를 비 상태로 만듬
            ps[3] = 5;//비 상태 카운트. 0이 되면 비가 끝남
            if(ps[8]==1){ 모래바람캔슬(p, k); }
            for (int i = 4; i < 10; i++)
                ps[i] = 0; //기존의 날씨는 없어지므로 0으로 바꿈.
        }
    }
    if (p[pp][0][12] == "모래날림") {
        //마기라스의 모래날림. 날씨를 모래바람 상태로 만듬
        if (ps[8] != 1) { //현재 날씨가 모래바람 상태가 아닐때만 발동
            cout << "[특성 모래날림]\n";
            cout << "모래바람이 불기 시작했다!\n";
            ps[8] = 1;//필드를 모래바람 상태로 만듬
            ps[9] = 5;//지속시간 카운트. 0이 되면 비가 끝남
            for (int i = 2; i < 8; i++)
                ps[i] = 0; //기존의 날씨는 없어지므로 0으로 바꿈.
            for(int i = 1; i < 4; i++) {
                if (p[i][0][1] == "바위" || p[i][0][2] == "바위") {
                    p[i][11][13] = to_string(stoi(p[i][11][13]) * 3 / 2);
                    p[i][0][7] = to_string(stoi(p[i][0][7]) * 3 / 2);
                }
                if (k[i][0][1] == "바위" || k[i][0][2] == "바위") {
                    k[i][11][13] = to_string(stoi(k[i][11][13]) * 3 / 2);
                    k[i][0][7] = to_string(stoi(k[i][0][7]) * 3 / 2);
                }
            }
        }
    }
    if (p[pp][0][12] == "다크오라") {
        //이벨타르의 특성. 필드에 존재하는 동안 악타입 스킬의 데미지 4/3배.
        cout << "[특성 다크오라]\n";
        if (s == 0) cout << "상대 ";
        cout << p[pp][0][11]<<s1(p,pp)<<"다크오라를 발산하고 있다!\n";
    }
    if (p[pp][0][12] == "흑마") {
        //흑마렉스의 특성
        cout << "[특성 혼연일체]\n";
        if (s == 0) cout << "상대 ";
        cout << "흑마렉스는 두가지 특성을 겸비한다!\n";
        cout << "[특성 긴장감]\n";
        if (s == 1) cout << "상대는 ";
        if (s == 0) cout << "우리편은";
        cout << "긴장해서 나무열매를 먹을 수 없게 되었다!\n";
    }
    if (p[pp][0][12] == "프레셔") {
        //자시안의 불요의 검, 자신의 공격력 1랭크 상승
        cout << "[특성 프레셔]\n";
        if (s == 0) cout << "상대 ";
        cout << p[pp][0][11] << s1(p,pp)<< "프레셔를 발산하고있다!\n";
    }

    if (p[pp][0][12] == "괴짜") {
        //메타몽의 특성 변신
        cout << "[특성 괴짜]\n";
        if (k[kn][0][11] == "메타몽") {
            if (s == 1) cout << "상대 ";
            cout << k[kn][0][0] << s1(k, kn) << "배낄 수 없다!\n";
        }
        else {
            if (s == 0) cout << "상대 ";
            cout << "메타몽은 " << k[kn][0][11] << k1(k, kn) << "변신했다!\n";
            for (int i = 0; i < one - 1; i++) {
                for (int j = 0; j < two - 1; j++) {
                    if (i != 5) {
                        p[pp][i][j] = k[kn][i][j];
                    }
                }
            }
            //상대방의 개체값을 카피함

            p[pp][0][0] = k[kn][0][11] + "(메타몽)";
            //현재이름은 상대방 이름 + (메타몽)
            p[pp][0][15] = p[pp][0][0];
            //해당 이름을 다른데 사용되므로 추가로 백업
            p[pp][0][3] = "155";
            //체력은 바뀌지 않음.
            p[pp][0][10] = "y";
            //이름의 받침 여부. 메타"몽"
            p[pp][0][11] = "메타몽";
            if (p[pp][0][12] == "탈까임") {
                p[pp][0][12] = "탈";
                //탈은 소모되는 특성이므로 이미 발동된 탈은 복구하여 배낀다
            }
            p[pp][0][13] = "스카프";
            //아이템은 스카프로 고정
            p[pp][0][14] = k[kn][0][11];
            //14번 칸에는 메타몽이 변신한 상대방의 원래 이름을 배낌.
            p[pp][1][4] = "5";
            p[pp][2][4] = "5";
            p[pp][3][4] = "5";
            p[pp][4][4] = "5";
            //모든 스킬의 pp는 5로 고정.
            if (k[kn][0][13] != "스카프") {
                //메타몽의 지닌 물건은 스카프로, 스피드가 배낀 수치의 1.5배가 됨.
                //단 상대도 지닌 물건이 스카프일때는 예외. (이미 1.5배가 된걸 배끼기 때문) 
                string mss = to_string(stoi(p[pp][0][8]) * 3 / 2);
                p[pp][0][8] = mss;
                p[pp][11][14] = mss;
                //현재 스피드 값과 원래 스피드 값을 1.5배.
            }
            즉발특성(p, pp, s, k, kn, ps);
            //상대로 변신하여 배낀 특성을 발동하기 위해 즉발 특성 함수를 다시 한번 호출.
            //메타몽 특성 발동 기준은 현재 이름과 원래 이름이 "메타몽"이여야 하는데,
            //상대로 변신하면 현재 이름이 "메타몽"이 아니므로 함수가 무한 반복되지 않음.
        }

    }

}