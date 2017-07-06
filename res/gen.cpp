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
        ofs << "OCT 004;";
      }else if(m[i][j]=='O'){
        ofs << "OCT 005;";
      }else if(m[i][j]=='='){
        ofs << "OCT 111;";
      }else if(m[i][j]=='#'){
        bool l = j==0  ? true : m[i][j-1]=='#';
        bool r = j==30 ? true : m[i][j+1]=='#';
        bool u = i==0  ? true : m[i-1][j]=='#';
        bool d = i==27 ? true : m[i+1][j]=='#';
        if(0);
        else if(l&&!r&&u&&d)ofs << "OCT 003;";
        else if(l&&r&&!u&&d)ofs << "OCT 103;";
        else if(!l&&r&&u&&d)ofs << "OCT 203;";
        else if(l&&r&&u&&!d)ofs << "OCT 303;";
        else if(l&&!r&&!u&&d)ofs << "OCT 001;";
        else if(!l&&r&&!u&&d)ofs << "OCT 101;";
        else if(!l&&r&&u&&!d)ofs << "OCT 201;";
        else if(l&&!r&&u&&!d)ofs << "OCT 301;";
        else if(l&&r&&u&&d){
          bool ul = j==0  || i==0  ? true : m[i-1][j-1]=='#';
          bool ur = j==30 || i==0  ? true : m[i-1][j+1]=='#';
          bool dl = j==0  || i==27 ? true : m[i+1][j-1]=='#';
          bool dr = j==30 || i==27 ? true : m[i+1][j+1]=='#';
          if(0);
          else if(!dl)ofs << "OCT 002;";
          else if(!dr)ofs << "OCT 102;";
          else if(!ur)ofs << "OCT 202;";
          else if(!ul)ofs << "OCT 302;";
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
        else if(l)ofs << "OCT 006;";
        else if(d)ofs << "OCT 106;";
        else if(r)ofs << "OCT 206;";
        else if(u)ofs << "OCT 306;";
        else if(dl)ofs << "OCT 007;";
        else if(dr)ofs << "OCT 107;";
        else if(ur)ofs << "OCT 207;";
        else if(ul)ofs << "OCT 307;";
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
