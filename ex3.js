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

ex3.ready = _=>{
  return buffer.length!=0;
};
ex3.load = (src,log)=>{
  ex3.halt();
  srcs = src.split('\n').map(l=>l.split('/')[0].replace(/\t|\r/g,"").replace(/^ */,"").replace(/ *$/,""));
  const ls = srcs.join(" \n ").replace(/,/g," , ").split(" ").filter(x=>x!="");
  let failed = false;

  buffer = new Array(2048); // 1word x 2048
  buffer.fill(0);
  aux = new Array(2048);
  aux.fill(-1);
  labels = {};
  addrs = {};
  store = [];
  breaks = {};
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
      else if(token=="INP")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="OUT")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="SKI")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="SKO")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="ION")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="IOF")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="SIO")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="PIO")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="IMK")log("Deprecated: " + token),curAddr++,failed = true;
      else if(token=="END"){
        return;
      }else if(token=="\n"){
        lineNum++;
      }else if(token=="BREAK"){
        breaks[curAddr] = true;
      }else if(token=="ASSERT"){
        console.log("po");
      }else{
        const mrefOp = ["AND","ADD","LDA","STA","BUN","BSA","ISZ"];
        let ix = mrefOp.indexOf(token);
        if(ix!=-1){
          let label = yield;
          let value = 0;
          value += indirectRef ? 0x8000 : 0;
          value += ix * 0x1000;
          setLine();
          buffer[curAddr++] = {delay:value, memory:label};
        }else{
          log("Ignored: " + token);
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
      token = ls[cur];
      cur++;
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
ex3.exec = (logDisp,memDisp,lineNum,render)=>{
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

  let clocks = 0;
  let steps = 0;
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
      0x0000:"AND",
      0x1000:"ADD",
      0x2000:"LDA",
      0x3000:"STA",
      0x4000:"BUN",
      0x5000:"BSA",
      0x6000:"ISZ"
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
  function display(){
    let str;
    str = "";
    str += steps + "STEP, " + clocks + "CLK\n";
    str += "PC=" + hex3(pc) + " (" + hex4(mem[pc]) + ", " + insn(mem[pc]) + ")\n";
    str += "L" + aux[pc] + ", " + srcs[aux[pc]-1] + "\n\n";
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
    lineNum(aux[pc]);
    render(field);
  }

  const oneStep = Q.do(function*(){
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
        case 0x7020 /* INC */ : ac++;break;
        case 0x7010 /* SPA */ : {if((ac&0x8000)==0)pc++;}break;
        case 0x7008 /* SNA */ : {if((ac&0x8000))pc++;}break;
        case 0x7004 /* SZA */ : {if(ac==0)pc++;}break;
        case 0x7002 /* SZE */ : {if(e==0)pc++;}break;
        case 0x7001 /* HLT */ : halt=true;ex3.onHalt();break;
        case 0xF800 /* SEG */ : seg=ac;break;
        case 0xF400 /* SLX */ : sprX=ac;break;
        case 0xF200 /* SLY */ : sprY=ac;break;
        case 0xF100 /* WRT */ : field[sprY][sprX]=(ac&0x3f)|(field[sprY][sprX]&0xc0);break;
        case 0xF080 /* TRX */ : break;
        case 0xF040 /* TRY */ : break;
        case 0xF020 /* ROT */ : field[sprY][sprX]=((ac&0x3)<<6)|(field[sprY][sprX]&0x3f);break;
        case 0xF010 /* BTN */ : break;
        case 0xF008 /* SLP */ : break;
        default: toastr.error("Invalid instruction: " + hex4(op));halt=true;ex3.onCrash();break;
      }
      return Q.pure(4);
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
        case 0x6000 /* ISZ */ : {mem[ar]++;mem[ar]&=0xffff;if(mem[ar]==0)pc++;}dur+=2;break;
      }
      return Q.pure(dur);
    }
  });

  halter = Q.emptyBox();
  breaker = Q.newBox(0);
  stepper = exe=>Q.do(function*(){
    if(halt)return;
    if(exe){
      clocks += yield oneStep;
      steps++;
    }
    display();
    if(halt)yield Q.putBox(halter,{});
  });
  Q.run(Q.join.any([Q.do(function*(){
    yield Q.waitMS(100);
    while(1){
      yield Q.readBox(breaker);
      clocks += yield oneStep;
      steps++;
      if(halt)break;
      if(steps%1000==0){
        display();
        yield Q.waitMS(100);
      }
      if(breaks[pc]){
        yield Q.takeBox(breaker);
        yield stepper(false);
        ex3.onBreak();
      }
    }
    display();
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
ex3.onHalt = _=>_;
ex3.onCrash = _=>_;
ex3.onBreak = _=>_;
