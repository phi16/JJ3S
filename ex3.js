const ex3 = (_=>{

const ex3 = {};

function hex3(x){
  let s = "0000" + x.toString(16);
  return s.slice(s.length-3);
}
function hex4(x){
  let s = "0000" + x.toString(16);
  return s.slice(s.length-4);
}

let srcs = []; // lined source
let buffer = []; // whole memory
let aux = []; // addr -> line
let labels = {}; // label -> addr
let addrs = {}; // labeled addr -> label, line
let store = []; // display address
let breaks = {}; // breakpoints
let asserts = {}; // assertion

ex3.ready = _=>{
  return buffer.length!=0;
};
ex3.load = (src,macro,log)=>{
  ex3.halt();
  let failed = false;
  let macros = {};
  macro.split('\n').forEach(l=>{
    let lm = l.match(/^(.*) = ([^=]+)$/);
    if(!lm)return;
    let lz = [lm[1],lm[2]].map(e=>e.replace(/\t|\r/g," ").replace(/^ */,"").replace(/ *$/,""));
    let m = lz[0].match(/^@([a-zA-Z_][a-zA-Z0-9_]*)(?: |$)/);
    if(m && m[1]){
      let target = "^" + lz[0].replace(/[-\/\\^$*+?.()|[\]{}]/g,'\\$&').replace(/\\\$\d/g,"([a-zA-Z_][a-zA-Z0-9_]*)") + "$";
      let replacement = lz[1];
      if(macros[m[1]]==undefined)macros[m[1]] = [];
      macros[m[1]].push({raw:lz[0], regex:new RegExp(target), repl:replacement});
    }
  });
  srcs = src.split('\n').map(l=>l.split('/')[0].replace(/\t|\r/g,"").replace(/^ */,"").replace(/ *$/,""));
  for(let i=0;i<srcs.length;i++){
    let m = srcs[i].match(/^@([a-zA-Z_][a-zA-Z0-9_]*)(?: |$)/);
    if(m){
      let mcs = macros[m[1]];
      if(!mcs){
        failed = true;
        log("L" + i + ": No macro found '" + m[1] + "'");
        srcs[i] = "";
        continue;
      }
      let done = false;
      for(let j=0;j<mcs.length;j++){
        let mc = mcs[j];
        if(!mc.regex.test(srcs[i])){
          continue;
        }
        srcs[i] = srcs[i].replace(mc.regex,mc.repl).replace(/\t|\r/g,"");
        done = true;
        break;
      }
      if(!done){
        failed = true;
        log("L" + i + ": Mismatched macro '" + m[1] + "'");
        srcs[i] = "";
        continue;
      }
    }
  }
  ex3.onCompiled([].concat.apply([],srcs.map(l=>l.split(";").map(s=>s.replace(/^ */,"").replace(/ *$/,"")))));
  const ls = srcs.join(" \n ").replace(/;/g," ").replace(/,/g," , ").split(" ").filter(x=>x!="");

  buffer = new Array(2048); // 1word x 2048
  buffer.fill(0);
  aux = new Array(2048);
  aux.fill(-1);
  labels = {};
  addrs = {};
  store = [];
  breaks = {};
  asserts = {};
  let lineNum = 1;
  let curAddr = 0;
  let indirectRef = false;
  function setLine(){
    aux[curAddr] = lineNum;
  }
  function* parse(){
    while(1){
      const token = yield;
      if(token=="ORG"){
        const v = parseInt(yield,16);
        curAddr = v;
      }else if(token=="HEX"){
        const v = parseInt(yield,16);
        setLine(), store.push({hex:1,v:curAddr}), buffer[curAddr++] = v;
      }else if(token=="DEC"){
        const v = (parseInt(yield)+0x10000)%0x10000;
        setLine(), store.push({dec:1,v:curAddr}), buffer[curAddr++] = v;
      }else if(token=="CHR"){
        const v = yield;
        setLine(), store.push({chr:1,v:curAddr}), buffer[curAddr++] = v.charCodeAt(0);
      }else if(token=="SYM"){
        const label = yield;
        setLine(), store.push({sym:1,v:curAddr}), buffer[curAddr++] = {delay:0, memory:label};
      }
      else if(token=="CLA")setLine(), buffer[curAddr++] = 0x7800;
      else if(token=="CLE")setLine(), buffer[curAddr++] = 0x7400;
      else if(token=="CMA")setLine(), buffer[curAddr++] = 0x7200;
      else if(token=="CME")setLine(), buffer[curAddr++] = 0x7100;
      else if(token=="CIR")setLine(), buffer[curAddr++] = 0x7080;
      else if(token=="CIL")setLine(), buffer[curAddr++] = 0x7040;
      else if(token=="INC")setLine(), buffer[curAddr++] = 0x7020;
      else if(token=="SPA")setLine(), buffer[curAddr++] = 0x7010;
      else if(token=="SNA")setLine(), buffer[curAddr++] = 0x7008;
      else if(token=="SZA")setLine(), buffer[curAddr++] = 0x7004;
      else if(token=="SZE")setLine(), buffer[curAddr++] = 0x7002;
      else if(token=="HLT")setLine(), buffer[curAddr++] = 0x7001;
      else if(token=="SEG")setLine(), buffer[curAddr++] = 0xF800;
      else if(token=="SLX")setLine(), buffer[curAddr++] = 0xF400;
      else if(token=="SLY")setLine(), buffer[curAddr++] = 0xF200;
      else if(token=="WRT")setLine(), buffer[curAddr++] = 0xF100;
      else if(token=="TRX")setLine(), buffer[curAddr++] = 0xF080;
      else if(token=="TRY")setLine(), buffer[curAddr++] = 0xF040;
      else if(token=="ROT")setLine(), buffer[curAddr++] = 0xF020;
      else if(token=="BTN")setLine(), buffer[curAddr++] = 0xF010;
      else if(token=="SLP")setLine(), buffer[curAddr++] = 0xF008;
      else if(token=="RND")setLine(), buffer[curAddr++] = 0xF004;
      else if(token=="INP")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="OUT")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="SKI")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="SKO")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="ION")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="IOF")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="SIO")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="PIO")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="IMK")log("L" + lineNum + ": Deprecated '" + token + "'"),curAddr++,failed = true;
      else if(token=="END"){
        return;
      }else if(token=="BREAK"){
        breaks[curAddr] = true;
      }else if(token=="ASSERT"){
        const v1 = yield;
        const ope = yield;
        const v2 = yield;
        function fail(){
          log("L" + lineNum + ": Syntax error 'ASSERT " + v1 + " " + ope + " " + v2 + "'");
          failed = true;
        }
        if(["==","!=",">=",">","<=","<"].indexOf(ope)==-1){fail();continue;}
        const p1 = v1 == "AC" ? {ac:true} : "0123456789".indexOf(v1[0])==-1 ? {label:v1} : !isNaN(Number(v1)) ? {number:Number(v1)} : null;
        const p2 = v2 == "AC" ? {ac:true} : "0123456789".indexOf(v2[0])==-1 ? {label:v2} : !isNaN(Number(v2)) ? {number:Number(v2)} : null;
        if(!p1 || !p2){fail();continue;}
        if(asserts[curAddr]==undefined)asserts[curAddr] = [];
        asserts[curAddr].push({p1:p1,ope:ope,p2:p2});
      }else{
        const mrefOp = ["AND","ADD","LDA","STA","BUN","BSA","MUL"];
        let ix = mrefOp.indexOf(token);
        if(ix!=-1){
          let label = yield;
          let value = 0;
          value += indirectRef ? 0x8000 : 0;
          value += ix * 0x1000;
          setLine();
          buffer[curAddr++] = {delay:value, memory:label};
        }else{
          log("L" + lineNum + ": Ignored '" + token + "'");
          failed = true;
        }
      }
    }
  }
  const g = parse();
  let token = "";
  let cur = 0;
  while(1){
    const v = g.next(token);
    if(v.done)break;
    if(ls.length <= cur)break;
    indirectRef = false;
    do{
      while(1){
        token = ls[cur];
        cur++;
        if(token=="\n"){
          lineNum++;
        }else break;
      }
      if(ls[cur]==","){
        labels[token] = curAddr;
        addrs[curAddr] = {name:token,line:lineNum};
        cur++;
      }else if(ls[cur]=="I"){
        indirectRef = true;
        cur++;
        break;
      }else break;
    }while(1);
  }
  for(let i=0;i<buffer.length;i++){
    if(buffer[i].delay!==undefined){
      const addr = labels[buffer[i].memory];
      if(addr==undefined){
        failed = true;
        log("L" + aux[i] + ": Label not found '" + buffer[i].memory + "'");
      }
      buffer[i] = buffer[i].delay + addr;
    }
    //console.log(hex3(i),hex4(buffer[i]));
  }
  if(!failed)log("Ready.");
  else buffer = [];
};

let halter = null;
let breaker = null;
let stepper = null;
let keyValue = 0;
ex3.exec = (logDisp,memDisp,lineNum,iRender,aRender)=>{
  if(!ex3.ready())return;
  const mem = buffer.concat([]);
  let halt = false;

  let pc = 0x010;
  let ac = 0;
  let e = 0;
  let seg = 0;
  let sprX = 0, sprY = 0;
  let field = [];
  for(let i=0;i<30;i++){
    let v = [];
    for(let j=0;j<40;j++){
      v.push(0);
    }
    field.push(v);
  }
  let movSprC = [];
  let movSprX = [];
  let movSprY = [];
  for(let i=0;i<9;i++){
    movSprC.push(0);
    movSprX.push(0x7fff);
    movSprY.push(0x7fff);
  }

  let clocks = 0;
  let steps = 0;
  let frameWait = 0;
  let clkPerFrame = 0;
  const maxFrames = 800 * 512;
  let sleep = false;
  function insn(x){
    const opName = {
      0x7800:"CLA",
      0x7400:"CLE",
      0x7200:"CMA",
      0x7100:"CME",
      0x7080:"CIR",
      0x7040:"CIL",
      0x7020:"INC",
      0x7010:"SPA",
      0x7008:"SNA",
      0x7004:"SZA",
      0x7002:"SZE",
      0x7001:"HLT",
      0xF800:"SEG",
      0xF400:"SLX",
      0xF200:"SLY",
      0xF100:"WRT",
      0xF080:"TRX",
      0xF040:"TRY",
      0xF020:"ROT",
      0xF010:"BTN",
      0xF008:"SLP",
      0xF004:"RND",
      0x0000:"AND",
      0x1000:"ADD",
      0x2000:"LDA",
      0x3000:"STA",
      0x4000:"BUN",
      0x5000:"BSA",
      0x6000:"MUL"
    };
    if((x&0x7000)==0x7000){
      let s = opName[x];
      if(!s)return "undefined";
      return s;
    }else{
      let s = opName[x&0x7000];
      if(!s)return "undefined;"
      s += " " + hex3(x&0xfff);
      if(x&0x8000) s += " I";
      return s;
    }
  }
  function display(moveLine,frame1,frame2){
    let str;
    str = "";
    str += steps + "STEPs, " + clocks + "CLKs (" + clkPerFrame + "CLKs/frame)\n";
    str += "PC=" + hex3(pc) + " (" + hex4(mem[pc]) + ", " + insn(mem[pc]) + ")\n";
    str += "L" + aux[pc] + ": " + srcs[aux[pc]-1] + "\n\n";
    str += "AC=" + ac + " (" + hex4(ac) + "), E=" + e + "\n";
    str += "SEG[" + hex4(seg) + "]";
    logDisp(str);
    str = "";
    Object.keys(store).forEach(s=>{
      let ad = store[s].v;
      let v = mem[ad];
      str += hex3(ad);
      if(addrs[ad])str += " (" + addrs[ad].name + ")";
      let vs = "";
      if(store[s].hex)vs = hex4(v);
      if(store[s].dec)vs = v + " (" + hex4(v) + ")";
      if(store[s].chr)vs = "'" + String.fromCharCode(v) + "' (" + hex4(v) + ")";
      if(store[s].sym)vs = hex4(v);
      str += ": " + vs + "\n";
    });
    memDisp(str);
    if(moveLine)lineNum(aux[pc]);
    iRender(field,movSprC,movSprX,movSprY);
    aRender(field,movSprC,movSprX,movSprY,maxFrames,frame1,frame2);
  }

  function oneStep(){
    const op = mem[pc];
    const ty = op&0x7000;
    if(ty==0x7000){
      pc++;
      switch(op){
        case 0x7800 /* CLA */ : ac=0;break;
        case 0x7400 /* CLE */ : e=0;break;
        case 0x7200 /* CMA */ : ac=0xffff-ac;break;
        case 0x7100 /* CME */ : e=1-e;break;
        case 0x7080 /* CIR */ : {let t=e;e=ac&1;ac=(ac>>1)|(t<<15);}break;
        case 0x7040 /* CIL */ : {let t=e;e=(ac>>15)&1;ac=0xffff&(ac<<1)|t;}break;
        case 0x7020 /* INC */ : ac++;ac&=0xffff;break;
        case 0x7010 /* SPA */ : {if((ac&0x8000)==0)pc++;}break;
        case 0x7008 /* SNA */ : {if((ac&0x8000))pc++;}break;
        case 0x7004 /* SZA */ : {if(ac==0)pc++;}break;
        case 0x7002 /* SZE */ : {if(e==0)pc++;}break;
        case 0x7001 /* HLT */ : halt=true;ex3.onHalt();break;
        case 0xF800 /* SEG */ : seg=ac;break;
        case 0xF400 /* SLX */ : sprX=ac;break;
        case 0xF200 /* SLY */ : sprY=ac;break;
        case 0xF100 /* WRT */ : {
          if(sprX!=0xffff){
            field[sprY][sprX]=(ac&0x3f)|(field[sprY][sprX]&0xc0);
          }else{
            movSprC[sprY]=(ac&0x3f)|(movSprC[sprY]&0xc0);
          }
        }break;
        case 0xF080 /* TRX */ : movSprX[sprY]=ac;break;
        case 0xF040 /* TRY */ : movSprY[sprY]=ac;break;
        case 0xF020 /* ROT */ : {
          if(sprX!=0xffff){
            field[sprY][sprX]=((ac&0x3)<<6)|(field[sprY][sprX]&0x3f);
          }else{
            movSprC[sprY]=((ac&0x3)<<6)|(movSprC[sprY]&0x3f);
          }
        }break;
        case 0xF010 /* BTN */ : ac=keyValue;break;
        case 0xF008 /* SLP */ : sleep=true;break;
        case 0xF004 /* RND */ : ac=Math.floor(Math.random()*0x10000);break;
        default: toastr.error("Invalid instruction: " + hex4(op));halt=true;ex3.onCrash();break;
      }
      return 4;
    }else{
      let dur = 5;
      let ar;
      if(op&0x8000)ar=mem[op&0x0fff];
      else ar=op&0x0fff;
      let d = mem[ar];
      //console.log(op&0x0fff, ar, d);
      pc++;
      switch(ty){
        case 0x0000 /* AND */ : ac&=d;dur++;break;
        case 0x1000 /* ADD */ : {let t=ac+d;e=(t>>16)&1;ac=t&0xffff;}dur++;break;
        case 0x2000 /* LDA */ : ac=d;dur++;break;
        case 0x3000 /* STA */ : mem[ar]=ac;break;
        case 0x4000 /* BUN */ : pc=ar;break;
        case 0x5000 /* BSA */ : mem[ar]=pc;pc=ar+1;dur++;break;
        case 0x6000 /* MUL */ : {let t=ac*d;e=!!(t>>16);ac=t&0xffff;}dur++;break;
      }
      return dur;
    }
  }

  function matchAssert(cond){
    if(!cond)return false;
    for(let i=0;i<cond.length;i++){
      let c = cond[i];
      let v1 = c.p1.ac ? ac : c.p1.label ? mem[labels[c.p1.label]] : c.p1.number;
      let v2 = c.p2.ac ? ac : c.p2.label ? mem[labels[c.p2.label]] : c.p2.number;
      if(v1>=0x7fff)v1-=0x10000;
      if(v2>=0x7fff)v2-=0x10000;
      if(c.ope=="==" && v1!=v2)return true;
      if(c.ope=="!=" && v1==v2)return true;
      if(c.ope==">=" && v1<v2)return true;
      if(c.ope==">" && v1<=v2)return true;
      if(c.ope=="<=" && v1>v2)return true;
      if(c.ope=="<" && v1>=v2)return true;
    }
    return false;
  }

  halter = Q.emptyBox();
  breaker = Q.newBox(0);
  stepper = exe=>Q.do(function*(){
    if(halt)return;
    let slept = false;
    let f1=0,f2=0;
    if(exe){
      const clks = oneStep();
      clocks += clks;
      clkPerFrame += clks;
      frameWait = 0;
      steps++;
      if(sleep){
        clocks = Math.ceil(clocks/maxFrames)*maxFrames;
        sleep = false;
        slept = true;
        f1=0;
        f2=maxFrames;
      }else{
        f1=clkPerFrame-clks;
        f2=clkPerFrame;
      }
    }
    display(true,f1,f2);
    if(slept)clkPerFrame=0;
    if(halt)yield Q.putBox(halter,{});
  });
  Q.run(Q.join.any([Q.do(function*(){
    yield Q.waitMS(16);
    yield Q.readBox(breaker);
    while(1){
      let clks = oneStep();
      clocks += clks;
      frameWait += clks;
      clkPerFrame += clks;
      steps++;
      if(halt)break;
      if(frameWait >= maxFrames || sleep){
        frameWait -= maxFrames;
        let slept = false;
        if(sleep){
          clocks = Math.ceil(clocks/maxFrames)*maxFrames;
          frameWait = 0;
          sleep = false;
          slept = true;
        }
        display(false,0,maxFrames);
        if(slept)clkPerFrame=0;
        yield Q.waitMS(16);
        yield Q.readBox(breaker);
      }
      if(breaks[pc] || matchAssert(asserts[pc])){
        yield Q.takeBox(breaker);
        yield stepper(false);
        ex3.onBreak();
        yield Q.readBox(breaker);
      }
    }
    display(true,0,maxFrames);
  }),Q.do(function*(){
    yield Q.takeBox(halter);
    halter = breaker = stepper = null;
  })]));
};
ex3.break = _=>{
  if(breaker)Q.run(Q.do(function*(){
    yield Q.takeBox(breaker);
    yield stepper(false);
  }));
};
ex3.resume = _=>{
  if(breaker)Q.run(Q.putBox(breaker,0));
};
ex3.step = _=>{
  if(stepper)Q.run(stepper(true));
};
ex3.halt = _=>{
  if(halter)Q.run(Q.putBox(halter,{}));
};
ex3.keyChange = v=>{
  keyValue = v;
};
ex3.onHalt = _=>_;
ex3.onCrash = _=>_;
ex3.onBreak = _=>_;
ex3.onCompiled = _=>_;

return ex3;
})();
