// map.out generator

#include<iostream>
#include<vector>
#include<string>
#include<fstream>

int main(){
  std::ifstream ifs("map.txt");
  std::ofstream ofs("map.out");
  std::vector<std::string> m(28);
  for(int i=0;i<28;i++){
    ifs >> m[i];
  }
  for(int i=0;i<28;i++){
    for(int j=0;j<31;j++){
      if(m[i][j]=='_' || m[i][j]=='$'){
        ofs << "OCT 000;";
      }else if(m[i][j]=='.'){
        ofs << "OCT 001;";
      }else if(m[i][j]=='O'){
        ofs << "OCT 002;";
      }else if(m[i][j]=='='){
        ofs << "OCT 111;";
      }else if(m[i][j]=='#'){
        bool l = j==0  ? true : m[i][j-1]=='#';
        bool r = j==30 ? true : m[i][j+1]=='#';
        bool u = i==0  ? true : m[i-1][j]=='#';
        bool d = i==27 ? true : m[i+1][j]=='#';
        if(0);
        else if(l&&!r&&u&&d)ofs << "OCT 015;";
        else if(l&&r&&!u&&d)ofs << "OCT 115;";
        else if(!l&&r&&u&&d)ofs << "OCT 215;";
        else if(l&&r&&u&&!d)ofs << "OCT 315;";
        else if(l&&!r&&!u&&d)ofs << "OCT 013;";
        else if(!l&&r&&!u&&d)ofs << "OCT 113;";
        else if(!l&&r&&u&&!d)ofs << "OCT 213;";
        else if(l&&!r&&u&&!d)ofs << "OCT 313;";
        else if(l&&r&&u&&d){
          bool ul = j==0  || i==0  ? true : m[i-1][j-1]=='#';
          bool ur = j==30 || i==0  ? true : m[i-1][j+1]=='#';
          bool dl = j==0  || i==27 ? true : m[i+1][j-1]=='#';
          bool dr = j==30 || i==27 ? true : m[i+1][j+1]=='#';
          if(0);
          else if(!dl)ofs << "OCT 014;";
          else if(!dr)ofs << "OCT 114;";
          else if(!ur)ofs << "OCT 214;";
          else if(!ul)ofs << "OCT 314;";
          else ofs << "OCT 000;";
        }else{
          ofs << "OCT 077;";
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
        else if(gu)ofs << "OCT 112;";
        else if(gd)ofs << "OCT 110;";
        else if(l)ofs << "OCT 016;";
        else if(d)ofs << "OCT 116;";
        else if(r)ofs << "OCT 216;";
        else if(u)ofs << "OCT 316;";
        else if(dl)ofs << "OCT 017;";
        else if(dr)ofs << "OCT 117;";
        else if(ur)ofs << "OCT 217;";
        else if(ul)ofs << "OCT 317;";
        else ofs << "OCT 000;";
      }else{
        std::cerr << "[Unknown:" << m[i][j] << "]" << std::endl;
        return 0;
      }
    }
    ofs << "HEX 0" << std::endl;
  }
  return 0;
}
