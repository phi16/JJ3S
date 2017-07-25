// address.out, palette.out, content.out generator

#include<iostream>
#include<fstream>
#include<vector>
#include<iomanip>
#include<algorithm>

void pack(std::vector<int> &v, int val, int bit){
  std::vector<int> p;
  for(int i=0;i<bit;i++){
    p.push_back(val%2);
    val/=2;
  }
  std::reverse(p.begin(),p.end());
  for(int i=0;i<bit;i++){
    v.push_back(p[i]);
  }
}

int main(){
  std::ifstream ifs("sprite.out");
  std::vector<int> addr;
  std::vector<int> palette05, palette;
  std::vector<int> content05, content1, content2, content4;
  int acc1 = 0, acc2 = 0, acc4 = 0;
  int pal = 0;
  for(int i=0;i<32;i++){
    std::vector<int> p(256);
    std::vector<int> cnt(16);
    for(int j=0;j<256;j++){
      ifs >> std::hex >> p[j];
      cnt[p[j]]++;
    }
    int k=0;
    for(int j=0;j<16;j++){
      if(cnt[j] && j!=8){
        pack(palette05,j,4);
        k++;
      }
    }
    if(k==0)pack(palette05,8,4); // all blank

    for(int j=0;j<64;j++){
      int po = p[(j%8)*2 + (j/8)*2*16];
      pack(content05,po==8,1);
    }
  }
  for(int i=0;i<32;i++){
    int palIni = pal;
    std::vector<int> p(256);
    std::vector<int> cnt(16);
    int pat = 0;
    for(int j=0;j<256;j++){
      ifs >> std::hex >> p[j];
      if(cnt[p[j]]==0)pat++;
      cnt[p[j]]++;
    }
    std::vector<int> lookup(16);
    int k=0;
    for(int j=0;j<16;j++){
      if(cnt[j]){
        pack(palette,j,4);
        lookup[j] = k;
        k++;
      }
    }
    pal += k;
    while(k & (k-1))k++; // power-of-2
    int l = -1;
    while(k){
      k>>=1;
      l++;
    }
    pack(addr,l,3);   // 0~4
    pack(addr,palIni,7); // 160
    if(l==0){
      pack(addr,0,6); // constant
    }else if(l==1){
      pack(addr,acc1,6);
      for(int j=0;j<256;j++){
        int v = lookup[p[j]];
        pack(content1,v,l);
      }
      acc1++;
    }else if(l==2){
      pack(addr,acc2,6);
      for(int j=0;j<256;j++){
        int v = lookup[p[j]];
        pack(content2,v,l);
      }
      acc2++;
    }else if(l==4){
      pack(addr,acc4,6);
      for(int j=0;j<256;j++){
        int v = lookup[p[j]];
        pack(content4,v,l);
      }
      acc4++;
    }else{
      std::cout << "po" << std::endl;
      return 1;
    }
  }
  std::ofstream addro("address.out");
  std::ofstream pal05o("palette05.out");
  std::ofstream palo("palette.out");
  std::ofstream cont05o("content05.out");
  std::ofstream cont1o("content1.out");
  std::ofstream cont2o("content2.out");
  std::ofstream cont4o("content4.out");
  for(int i=0;i<addr.size();i++){
    addro << addr[i];
    if(i%16==15)addro << std::endl;
  }
  std::cout << "address/16 : " << addr.size()/16 << std::endl;
  for(int i=0;i<palette05.size();i++){
    pal05o << palette05[i];
    if(i%4==3)pal05o << std::endl;
  }
  std::cout << "palette05/4  : " << palette05.size()/4 << std::endl;
  for(int i=0;i<palette.size();i++){
    palo << palette[i];
    if(i%4==3)palo << std::endl;
  }
  std::cout << "palette/4  : " << palette.size()/4 << std::endl;
  for(int i=0;i<content05.size();i++){
    cont05o << content05[i];
  }
  cont05o << std::endl;
  std::cout << "content05   : " << content05.size() << std::endl;
  for(int i=0;i<content1.size();i++){
    cont1o << content1[i];
  }
  cont1o << std::endl;
  std::cout << "content1   : " << content1.size() << std::endl;
  for(int i=0;i<content2.size();i+=2){
    cont2o << content2[i] << content2[i+1] << " ";
    if(i%32==30)cont2o << std::endl;
  }
  std::cout << "content2   : " << content2.size() << std::endl;
  for(int i=0;i<content4.size();i+=4){
    cont4o << content4[i] << content4[i+1] << content4[i+2] << content4[i+3] << " ";
    if(i%64==60)cont4o << std::endl;
  }
  std::cout << "content4   : " << content4.size() << std::endl;
  std::cout << "Acc = " << acc1 << "," << acc2 << "," << acc4 << std::endl;
}
