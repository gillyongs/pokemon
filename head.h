#include <stdio.h>
#include <iostream>
#include<string>
#include <cstring>
#include <cstdlib>
#include <ctime>
#include <math.h>

#define one 20
#define two 20
#define num 4

using namespace std;

int a(int a);
int b(int b);
int av(int a);
int bv(int b);

void cpuwintext();
void playerwintext();

string s1(string p[][one][two], int pp);
string t1(string p[][one][two], int pp);
string k1(string p[][one][two], int pp);
string s2(string p[][one][two], int pp, int pn);
string t2(string p[][one][two], int pp, int pn);
string k2(string p[][one][two], int pp, int pn);

void ��ü(int life[], int pp, string p[][one][two], int ps[], string s[][one][two], int ss);
void ��뱳ü(int life[], int ss, string s[][one][two], int ps[], int pp, string p[][one][two]);
void ��ü�̺�Ʈ(int life[], int pp, string p[][one][two], int ps[], string s[][one][two], int ss, int k);

void mainpage(string p[][one][two], string s[][one][two], int plife[], int slife[], int ps[], int ppp[4][5]);

void ���ݽ�ų(string a[][one][two], string b[][one][two], int aa, int bb, int number,
    int alife[], int blife[], int s, int ps[], int dmg[], int bt[], int snumber);

void ����(string p[][one][two], string s[][one][two], int pn, int sn, int number, int attack,
    int bt[], int k, int slife[], int ps[], int plife[], int spd, int sattack, int dmg[], int snumber);

int ��������(string skilltype, string s[][one][two], int damage, int ss, int mh, 
    string p[][one][two], int pp, int number, int plife[], int ps[], int snumber);

void ���Ư��(string p[][one][two], int pn, int s, string k[][one][two], int kn, int ps[]);

void �����������(string p[][one][two], int k, int pn, int plife[], int ps[], string s[][one][two], int sn, int bt[]);

void ������(string skillname, string p[][one][two], int pp, int s);

void ��ȭ��ų(string p[][one][two], string s[][one][two], int pn, int sn,
    int number, int plife[], int slife[], int k, int ps[], int bt[]);

void �ΰ�ȿ��(string a[][one][two], int skillnumber, string b[][one][two], 
	int aa, int bb, int s, int plife[], int slife[], int ps[], int bt[], int damage);

void ����(string a[][one][two], string b[][one][two], int aa, int bb, int s, int life[], int ps[]);

void ��ó��(string p[][one][two], int plife[], int pp, int ps[], int ppp[4][5], int k, string s[][one][two], int ss);

int ���ǵ��(string p[][one][two], string s[][one][two], int pp, int ss);

int �켱����(string p[][one][two], string s[][one][two], int pp, int ss, int number, int snumber);

void ��ī��(string p[][one][two], string s[][one][two]);

void �Ӹ���(string p[][one][two], string s[][one][two]);

void ��������(string p[][one][two], string s[][one][two]);

void ��ũ(string a[][one][two], int aa, string dasang, int k, int s);

void �𷡹ٶ�ĵ��(string p[][one][two], string k[][one][two]);

void �ڹ�����(string a[][one][two], int aa, string b[][one][two], int bb, int alife[]);