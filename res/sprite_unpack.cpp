#include<iostream>
#include<vector>
#include<fstream>

char s[256];
int load(int bit, int orig = 0){
  int x = 0;
  for(int i=0;i<bit;i++){
    x *= 2;
    x += s[i+orig]-'0';
  }
  return x;
}

int main(){
  std::ifstream pal05i("palette05.out");
  std::ifstream cont05i("content05.out");
  std::ifstream addri("address.out");
  std::ifstream pali("palette.out");
  std::ifstream cont1i("content1.out");
  std::ifstream cont2i("content2.out");
  std::ifstream cont4i("content4.out");
  std::vector<int> palette, cont1, cont2, cont4;
  std::vector<int> output;
  while(pali >> s){
    palette.push_back(load(4));
  }
  for(int i=0;i<5120;i++){
    cont1i.get(s,2);
    cont1.push_back(load(1));
  }
  while(cont2i >> s){
    cont2.push_back(load(2));
  }
  while(cont4i >> s){
    cont4.push_back(load(4));
  }

  for(int i=0;i<32;i++){
    pal05i.getline(s,5);
    int x = load(4);
    cont05i.get(s,65);
    for(int j=0;j<256;j++){
      int k = (j%16)/2, l = (j/16)/2;
      int p = k + l*8;
      output.push_back(s[p]-'0'?8:x);
    }
  }

  for(int i=0;i<32;i++){
    addri.getline(s,17);
    int bits = load(3);
    int palIx = load(7,3);
    int contIx = load(6,10);
    for(int j=0;j<256;j++){
      int cont = bits==0 ? 0
               : bits==1 ? cont1[contIx*256+j]
               : bits==2 ? cont2[contIx*256+j]
               : bits==4 ? cont4[contIx*256+j]
               : 0;
      int c = palette[palIx+cont];
      output.push_back(c);
    }
  }

  for(int i=0;i<output.size();i++){
    std::cout << std::hex << output[i];
    if(i%16==15)std::cout << std::endl;
    else std::cout << " ";
    if(i%256==255)std::cout << std::endl;
  }
}
