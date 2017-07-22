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
  std::vector<int> palette;
  std::vector<int> content;
  int acc = 0;
  int pal = 0;
  for(int i=0;i<64;i++){
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
    pack(addr,pal,8); // 160
    pack(addr,acc,7); // 79
    for(int j=0;j<256;j++){
      int v = lookup[p[j]];
      pack(content,v,l);
    }
    acc += l;
  }
  std::ofstream addro("address.out");
  std::ofstream palo("palette.out");
  std::ofstream conto("content.out");
  for(int i=0;i<addr.size();i++){
    addro << addr[i];
    if(i%18==17)addro << std::endl;
  }
  std::cout << "address/18 : " << addr.size()/18 << std::endl;
  for(int i=0;i<palette.size();i++){
    palo << palette[i];
    if(i%4==3)palo << std::endl;
  }
  std::cout << "palette/4  : " << palette.size()/4 << std::endl;
  for(int i=0;i<content.size();i++){
    conto << content[i] << " ";
    if(i%256==255)conto << std::endl;
  }
  std::cout << "content    : " << content.size() << std::endl;
}
