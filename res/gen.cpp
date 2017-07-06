#include<iostream>
#include<vector>
#include<string>
#include<fstream>

int main(){
  std::ifstream ifs("map.txt");
  std::vector<std::string> m(28);
  for(int i=0;i<28;i++){
    ifs >> m[i];
  }
  for(int i=0;i<28;i++){
    for(int j=0;j<31;j++){
      if(m[i][j]=='_' || m[i][j]=='$'){
        std::cout << "OCT 000;";
      }else if(m[i][j]=='.'){
        std::cout << "OCT 004;";
      }else if(m[i][j]=='O'){
        std::cout << "OCT 005;";
      }else if(m[i][j]=='='){
        std::cout << "OCT 111;";
      }else if(m[i][j]=='#'){
        bool l = j==0  ? true : m[i][j-1]=='#';
        bool r = j==30 ? true : m[i][j+1]=='#';
        bool u = i==0  ? true : m[i-1][j]=='#';
        bool d = i==27 ? true : m[i+1][j]=='#';
        if(0);
        else if(l&&!r&&u&&d)std::cout << "OCT 003;";
        else if(l&&r&&!u&&d)std::cout << "OCT 103;";
        else if(!l&&r&&u&&d)std::cout << "OCT 203;";
        else if(l&&r&&u&&!d)std::cout << "OCT 303;";
        else if(l&&!r&&!u&&d)std::cout << "OCT 001;";
        else if(!l&&r&&!u&&d)std::cout << "OCT 101;";
        else if(!l&&r&&u&&!d)std::cout << "OCT 201;";
        else if(l&&!r&&u&&!d)std::cout << "OCT 301;";
        else if(l&&r&&u&&d){
          bool ul = j==0  || i==0  ? true : m[i-1][j-1]=='#';
          bool ur = j==30 || i==0  ? true : m[i-1][j+1]=='#';
          bool dl = j==0  || i==27 ? true : m[i+1][j-1]=='#';
          bool dr = j==30 || i==27 ? true : m[i+1][j+1]=='#';
          if(0);
          else if(!dl)std::cout << "OCT 002;";
          else if(!dr)std::cout << "OCT 102;";
          else if(!ur)std::cout << "OCT 202;";
          else if(!ul)std::cout << "OCT 302;";
          else std::cout << "OCT 000;";
        }else{
          std::cout << "OCT 077;";
        }
      }else if(m[i][j]=='*'){
        bool l = m[i][j-1]=='$';
        bool r = m[i][j+1]=='$';
        bool u = m[i-1][j]=='$';
        bool d = m[i+1][j]=='$';
        bool ul = m[i-1][j-1]=='$';
        bool ur = m[i-1][j+1]=='$';
        bool dl = m[i+1][j-1]=='$';
        bool dr = m[i+1][j+1]=='$';
        bool gu = m[i][j-1]=='=';
        bool gd = m[i][j+1]=='=';
        if(0);
        else if(gu)std::cout << "OCT 112;";
        else if(gd)std::cout << "OCT 110;";
        else if(l)std::cout << "OCT 006;";
        else if(d)std::cout << "OCT 106;";
        else if(r)std::cout << "OCT 206;";
        else if(u)std::cout << "OCT 306;";
        else if(dl)std::cout << "OCT 007;";
        else if(dr)std::cout << "OCT 107;";
        else if(ur)std::cout << "OCT 207;";
        else if(ul)std::cout << "OCT 307;";
        else std::cout << "OCT 000;";
      }else{
        std::cerr << "[Unknown:" << m[i][j] << "]" << std::endl;
        return 0;
      }
    }
    std::cout << "HEX 0" << std::endl;
  }
  return 0;
}
