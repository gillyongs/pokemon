#include "head.h"
//������ ���� ���� ���� �Լ����� ��Ƴ��� ����.
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
//�־��� int���� ���� Ư�� int���� �����ϴ� �Լ�.
//���� ���ϸ��� �ƴ� ���ϸ���� �����Ҷ� �ַ� ���.
//�̸��� a�� �ߴ��� �ν� ���ϴ� ��찡 ���ܼ� av�� �߰�.
void cpuwintext() {
    printf("���̻� �ο� �� �ִ� ���ϸ��� ����!\n");
    printf("\n\n");
    printf("---------------\n");
    printf("I CPU�� �¸�! I\n");
    printf("---------------\n");
    printf("\n\n\n\n\n\n\n\n\n\n\n");
}
void playerwintext() {
    printf("���� ���̻� �ο� �� �ִ� ���ϸ��� ����!\n");
    printf("\n\n");
    printf("--------------------\n");
    printf("I �÷��̾��� �¸�! I\n");
    printf("--------------------\n");
    printf("\n\n\n\n\n\n\n\n\n\n\n");
}
//cpu�� �÷��̾ �¸��Ͽ����� �ؽ�Ʈ�� ����ϴ� �Լ�
string s1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "�� ";
    else
        return "�� ";
}
string t1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "�� ";
    else
        return "�� ";
}
string k1(string p[][one][two], int pp) {
    if (p[pp][0][10] == "y")
        return "���� ";
    else
        return "�� ";
}
string s2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "�� ";
    else
        return "�� ";
}
string t2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "�� ";
    else
        return "�� ";
}
string k2(string p[][one][two], int pp, int pn) {
    if (p[pp][pn][12] == "y")
        return "���� ";
    else
        return "�� ";
}
//��, �°� ���� ���縦 �����ϴ� �Լ�. 
void ������(string skillname, string p[][one][two], int pp, int s) {
    printf("[Ư�� ������]\n");
    for (int i = 6; i < 11; i++) {
        for (int j = 0; j < two - 1; j++) {
            p[pp][i][j] = "null";
        }
    }//���̽����� ��� �󼺰��� �ʱ�ȭ
    if (s == 0)
        cout << "��� ";
    cout << p[pp][0][11] << s1(p, pp);
    if (skillname == "ȭ����") {//Ư�� ��ų�� ����� ���
        printf("��Ÿ���� �ƴ�!\n");
        p[pp][0][1] = "�Ҳ�"; //�ش� ��ų�� Ÿ������ ����
        p[pp][7][0] = "��";//���� �ش� Ÿ���� ��� ������ ����
        p[pp][7][1] = "��";
        p[pp][7][2] = "����";
        p[pp][8][0] = "��ö";
        p[pp][8][1] = "����";
        p[pp][8][2] = "�Ҳ�";
        p[pp][8][3] = "����";
        p[pp][8][4] = "��";
        p[pp][8][5] = "Ǯ";
    }
    else if (skillname == "��������") {
        printf("����Ÿ���� �ƴ�!\n");
        p[pp][0][1] = "����";
        p[pp][7][0] = "����";
        p[pp][7][1] = "������";
        p[pp][7][2] = "��";
        p[pp][8][0] = "����";
        p[pp][8][1] = "����";
        p[pp][8][2] = "��";
    }
    else if (skillname == "����Ʈ��Ʈ") {
        printf("��Ÿ���� �ƴ�!\n");
        p[pp][0][1] = "��";
        p[pp][7][0] = "��";
        p[pp][7][1] = "������";
        p[pp][8][0] = "����";
        p[pp][8][1] = "����";
        p[pp][8][2] = "��";
        p[pp][8][3] = "����";
        p[pp][8][4] = "��";

    }
    else if (skillname == "���") {
        printf("��Ÿ���� �ƴ�!\n");
        p[pp][0][1] = "��";
        p[pp][7][0] = "����";
        p[pp][7][1] = "����";
        p[pp][7][2] = "��";
        p[pp][8][1] = "��";
        p[pp][8][2] = "����Ʈ";
        p[pp][10][0] = "������";
    }
    else //Ȥ�� ���� ���� ó��
        cout << "������ ����, skillname : " << skillname << " a: " << a;
}
//���̽����� Ư�� �����θ� ó���ϴ� �Լ�.
void �����������(string p[][one][two], int k, int pn, int plife[], int ps[], string s[][one][two], int sn, int bt[]) {
    if (k == 0) { cout << "��� "; }
    cout << p[pn][0][11] << s1(p, pn) << "�ǿ��� ���ļ� ���� �ε�����! (";
    int mdamage = 524;
    mdamage = stoi(p[pn][0][3]) / 2;
    //�������� ���з� ���� �������� �ִ� ü���� ����
    if (plife[pn] <= mdamage)
        mdamage = plife[pn];
    //�ش� �������� ���� ü�º��� ���ٸ� ���� ü�¸�ŭ�� ������
    cout << plife[pn] << "-" << mdamage  << "=";
    plife[pn] -= mdamage;
    cout << plife[pn] << ")\n";
    //�ִ� ü���� ���ݸ�ŭ �������� �԰�, ������ ��� ���
    �ڹ�����(p, pn, s, sn, plife);
    if (plife[pn] <= 0) {
        if (k == 0) { cout << "��� "; }
        cout << p[pn][0][11] << s1(p, pn) << "��������!\n";
        bt[1] = -1;
    }
    //�̷� ���� ����������� bt �迭�� -1���� ����.
}
//�������Ⱑ ������ ��� �ؽ�Ʈ�� ������ ����� ó���ϴ� �Լ�

void ��ũ(string a[][one][two], int aa, string dasang, int k, int s) {
    //��ũ ��ȭ�� ó���ϴ� �Լ�.
    int suchi = k;
    //��ġ�� �Լ� ���ڷ� �Է¹޴´�
    int ranknumber=406;
    if (dasang == "����")
        ranknumber = 0;
    else if (dasang == "Ư��")
        ranknumber = 1;
    else if (dasang == "���")
        ranknumber = 2;
    else if (dasang == "Ư��")
        ranknumber = 3;
    else if (dasang == "���ǵ�")
        ranknumber = 4;
    else
        printf("��ũ �Լ� ��ũ ��� ����!");
    //��ȭ��ų ��ũ ��� ���� ranknumber�� ����.

    int rank = stoi(a[aa][11][ranknumber + 5]);
    //rank�� ��ȭ��ų ��ũ�� ���� ��.
    if (rank >= 6 && suchi > 0) {//��ũ�� 6 �̻��̰� ��ġ�� �����
        if (s == 0) cout << "��� ";
        cout << a[aa][0][11] << "�� " << a[aa][11][ranknumber];
        if (ranknumber = 4) { cout << "��"; }
        else { cout << "��"; }
        cout << "���̻� �ö��� �ʴ´�!"; //��ũ ��ȭ�� ��ŵ�Ѵ�.
        return;
    }
    if (rank <= -6 && suchi < 0) {//��ũ�� -6 ���ϰ� ��ġ�� ������
        if (s == 0) cout << "��� ";
        cout << a[aa][0][11] << "�� " << a[aa][11][ranknumber];
        if (ranknumber = 4) { cout << "��"; }
        else { cout << "��"; }
        cout << "���̻� �������� �ʴ´�!";//��ũ ��ȭ�� ��ŵ�Ѵ�
        return;
    }
    else {//�� �ܿ� ��ũ���� ��ȭ ��ġ�� ���Ѵ�.
        rank = rank + suchi;
        if (rank > 6) rank = 6; //6 ���� ũ�ų� -6���� ������ 6, -6���� ����.
        else if (rank < -6) rank = -6;
    }
    a[aa][11][ranknumber + 5] = to_string(rank);
    int ability = stoi(a[aa][11][ranknumber + 10]); //ability�� ��ȭ��ų �ɷ�ġ�� ������ġ.
    if (suchi != 0) {
        if (s == 0) cout << "��� ";
        cout << a[aa][0][11] << "�� " << a[aa][11][ranknumber];
        if (ranknumber == 4) cout << "�� ";
        else cout << "�� ";
        if (suchi == 3 || suchi == -3) { cout << "�ſ� ũ�� "; }
        else if (suchi == 2 || suchi == -2) { cout << "ũ�� "; }
        if (suchi < 0) { cout << "��������!\n"; }
        else if (suchi > 0) { cout << "�ö󰬴�!\n"; }//��ġ�� ���� �ؽ�Ʈ�� �����Ѵ�.
    }
    if (rank < 0) {
        ability = ability * 2 / (-rank + 2);
    }//rank�� �����϶��� �ش� �Ŀ� ���� �ɷ�ġ�� �����Ѵ�.
    else if (rank >= 0) {
        ability = ability * (rank + 2) / 2;
    }//����ϋ��� �ش� ���� ������.
    else
        printf("etc ���� ranks �Լ� ����");
    a[aa][0][ranknumber + 4] = to_string(ability);
    //���������� ����� ability���� �ɷ�ġ�� �����Ѵ�.

}

int ���ǵ��(string p[][one][two], string s[][one][two], int pp, int ss) {
    int speed= 1047;
    int pspeed = stoi(p[pp][0][8]);
    int sspeed = stoi(s[ss][0][8]);
    if (pspeed > sspeed) { speed = 1; }
    else if (pspeed < sspeed) { speed = 0; }
    else if (pspeed == sspeed) { speed = rand() % 2; }
    return speed;
}
//���ǵ带 ���ؼ� �÷��̾ ������ 1��, cpu�� ������ 0�� �����Ѵ�.

int �켱����(string p[][one][two], string s[][one][two], int pp, int ss, int number, int snumber) {
    int speed=1138;
    int pspeed = stoi(p[pp][0][8]);
    int sspeed = stoi(s[ss][0][8]);
    if (p[pp][number][6] == "�켱��") { pspeed += stoi(p[pp][number][7]) * 3000; } //�켱�� ó��
    if (s[ss][snumber][6] == "�켱��") { sspeed += stoi(s[ss][snumber][7]) * 3000; }
    if (p[pp][0][12] == "��ǳ����" && p[pp][number][1] == "����") { pspeed += 3000; } //�켱�� ó��
    if (s[ss][0][12] == "��ǳ����" && s[ss][snumber][1]== "����") { sspeed += 3000; }
    if (pspeed > sspeed) { speed = 1; } //�÷��̾ ������ 1
    else if (pspeed < sspeed) { speed = 0; } //cpur�� ������ 0
    else if (pspeed == sspeed) { speed = (pspeed+number+snumber) % 2; } //���� ������ 1�� 0�� �������� �� ����

    return speed;
}
//�켱���� �����ؾ��ϱ⿡ ������ ���ǵ� �� �Լ��� ����� �� ����.

void ��ī��(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "��ī��") {
            int scarf = stoi(p[i][11][14]);
            scarf = scarf * 3 / 2;
            p[i][11][14] = to_string(scarf);
            p[i][0][8] = to_string(scarf);
        }
        if (s[i][0][13] == "��ī��") {
            int scarf = stoi(s[i][11][14]);
            scarf = scarf * 3 / 2;
            s[i][11][14] = to_string(scarf);
            s[i][0][8] = to_string(scarf);
        }
    }
}
//���� ������ ��ī���� ���ϸ��� ���� ���ǵ� ���� 1.5��� �ø��� �Լ�.

void �Ӹ���(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "�Ӹ���") {
            int scarf = stoi(p[i][11][10]);
            scarf = scarf * 3 / 2;
            p[i][11][10] = to_string(scarf);
            p[i][0][4] = to_string(scarf);
        }
        if (s[i][0][13] == "�Ӹ���") {
            int scarf = stoi(s[i][11][10]);
            scarf = scarf * 3 / 2;
            s[i][11][10] = to_string(scarf);
            s[i][0][4] = to_string(scarf);
        }
    }
}
//���� ������ ��ī���� ���ϸ��� ���� ���ǵ� ���� 1.5��� �ø��� �Լ�.

void ��������(string p[][one][two], string s[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][13] == "����") {
            int scarf = stoi(p[i][11][13]);
            scarf = scarf * 3 / 2;
            p[i][11][13] = to_string(scarf);
            p[i][0][7] = to_string(scarf);
        }
        if (s[i][0][13] == "����") {
            int scarf = stoi(s[i][11][13]);
            scarf = scarf * 3 / 2;
            s[i][11][13] = to_string(scarf);
            s[i][0][7] = to_string(scarf);
        }
    }
}
//���� ������ ���������� ���ϸ��� ���� Ư�� ���� 1.5��� �ø��� �Լ�.
void �𷡹ٶ�ĵ��(string p[][one][two], string k[][one][two]) {
    for (int i = 1; i < 4; i++) {
        if (p[i][0][1] == "����" || p[i][0][2] == "����") {
            p[i][11][13] = to_string(stoi(p[i][11][13]) * 2 / 3);
            ��ũ(p, i, "Ư��", 0, 1);
        }
        if (k[i][0][1] == "����" || k[i][0][2] == "����") {
            k[i][11][13] = to_string(stoi(k[i][11][13]) * 2 / 3);
            ��ũ(k, i, "Ư��", 0, 0);
        }
    }
}

void �ڹ�����(string a[][one][two], int aa,  string b[][one][two], int bb, int alife[]) {
    if (a[aa][0][13] == "����" && alife[aa] <= stoi(a[aa][0][3]) / 2 && alife[aa] > 0 && b[bb][0][12] != "�渶") {
        cout << "[������ �ڹ�����]\n";
        a[aa][0][13] == "null"; //���Ŵ� 1ȸ���̹Ƿ� �ߵ��Ǹ� �������.
        cout << a[aa][0][11] << s1(a, aa);
        cout << "�ڹ����ŷ� ü���� ȸ���ߴ�! (" << alife[aa] << "+" << stoi(a[aa][0][3]) / 4 << "=";
        alife[aa] += stoi(a[aa][0][3]) / 4;
        cout << alife[aa] << ")\n";
    }
}