"use strict";
const $=id=>document.getElementById(id);

/* =====================  SYSTEM TABLE  ===================== */
const SYSTEMS=[
 {g:"Nintendo",id:"nes",n:"NES / Famicom",core:"nes",abbr:"NES"},
 {g:"Nintendo",id:"snes",n:"SNES / Super Famicom",core:"snes",abbr:"SNES"},
 {g:"Nintendo",id:"gb",n:"Game Boy",core:"gb",abbr:"GB"},
 {g:"Nintendo",id:"gbc",n:"Game Boy Color",core:"gb",abbr:"GBC"},
 {g:"Nintendo",id:"gba",n:"Game Boy Advance",core:"gba",abbr:"GBA",bios:"Optional: gba_bios.bin"},
 {g:"Nintendo",id:"n64",n:"Nintendo 64",core:"n64",abbr:"N64"},
 {g:"Nintendo",id:"nds",n:"Nintendo DS",core:"nds",abbr:"NDS"},
 {g:"Nintendo",id:"vb",n:"Virtual Boy",core:"vb",abbr:"VB"},
 {g:"Sega",id:"segaMD",n:"Mega Drive / Genesis",core:"segaMD",abbr:"MD"},
 {g:"Sega",id:"segaMS",n:"Master System",core:"segaMS",abbr:"SMS"},
 {g:"Sega",id:"segaGG",n:"Game Gear",core:"segaGG",abbr:"GG"},
 {g:"Sega",id:"segaCD",n:"Sega CD / Mega CD",core:"segaCD",abbr:"SCD",bios:"Needs a Sega CD BIOS (bios_CD_U/E/J.bin)"},
 {g:"Sega",id:"sega32x",n:"Sega 32X",core:"sega32x",abbr:"32X"},
 {g:"Sega",id:"segaSaturn",n:"Sega Saturn",core:"segaSaturn",abbr:"SAT",bios:"Needs a Saturn BIOS"},
 {g:"Sony",id:"psx",n:"PlayStation",core:"psx",abbr:"PS1",bios:"Recommended: scph1001.bin (or similar)"},
 {g:"Sony",id:"psp",n:"PSP (Chrome/Edge)",core:"psp",abbr:"PSP",needsIso:true},
 {g:"Arcade",id:"arcade",n:"Arcade (FinalBurn Neo)",core:"arcade",abbr:"ARC"},
 {g:"Arcade",id:"neogeo",n:"Neo Geo (AES/MVS)",core:"arcade",abbr:"NEO",bios:"Needs neogeo.zip BIOS set"},
 {g:"Atari & others",id:"atari2600",n:"Atari 2600",core:"atari2600",abbr:"2600"},
 {g:"Atari & others",id:"atari5200",n:"Atari 5200",core:"atari5200",abbr:"5200",bios:"Needs 5200.rom BIOS"},
 {g:"Atari & others",id:"atari7800",n:"Atari 7800",core:"atari7800",abbr:"7800"},
 {g:"Atari & others",id:"lynx",n:"Atari Lynx",core:"lynx",abbr:"LYNX"},
 {g:"Atari & others",id:"jaguar",n:"Atari Jaguar",core:"jaguar",abbr:"JAG"},
 {g:"Atari & others",id:"3do",n:"3DO",core:"3do",abbr:"3DO",bios:"Needs 3DO BIOS (panafz10.bin)"},
 {g:"Atari & others",id:"coleco",n:"ColecoVision",core:"coleco",abbr:"COL",bios:"Needs colecovision.rom"},
 {g:"Atari & others",id:"pce",n:"PC Engine / TurboGrafx-16 (+CD)",core:"pce",abbr:"PCE"},
 {g:"Atari & others",id:"pcfx",n:"PC-FX",core:"pcfx",abbr:"PCFX",bios:"Needs pcfx.rom BIOS"},
 {g:"Atari & others",id:"wswan",n:"WonderSwan",core:"ws",abbr:"WS"},
 {g:"Atari & others",id:"wswanc",n:"WonderSwan Color",core:"ws",abbr:"WSC"},
 {g:"Atari & others",id:"ngp",n:"Neo Geo Pocket",core:"ngp",abbr:"NGP"},
 {g:"Atari & others",id:"ngpc",n:"Neo Geo Pocket Color",core:"ngp",abbr:"NGPC"},
 {g:"Computers",id:"c64",n:"Commodore 64",core:"c64",abbr:"C64"},
 {g:"Computers",id:"amiga",n:"Commodore Amiga",core:"amiga",abbr:"AMI",bios:"Kickstart ROM recommended"},
 {g:"Computers",id:"dos",n:"MS-DOS (Chrome/Edge)",core:"dos",abbr:"DOS",needsIso:true},
 {g:"Computers",id:"zxspectrum",n:"ZX Spectrum (experimental)",core:"fuse",abbr:"ZXS"},
 {g:"Computers",id:"zx81",n:"ZX81 (experimental)",core:"81",abbr:"ZX81"},
 {g:"Computers",id:"cpc",n:"Amstrad CPC (experimental)",core:"cap32",abbr:"CPC"}
];
const SYS=Object.fromEntries(SYSTEMS.map(s=>[s.id,s]));
const ACCEPT=".nes,.unf,.unif,.fds,.smc,.sfc,.swc,.fig,.gb,.gbc,.gba,.z64,.n64,.v64,.nds,.dsi,.vb,.md,.gen,.smd,.sms,.gg,.32x,.pbp,.cso,.chd,.cue,.bin,.iso,.img,.ccd,.mdf,.cdi,.a26,.a52,.a78,.lnx,.j64,.jag,.col,.pce,.sgx,.ws,.wsc,.ngp,.ngc,.d64,.t64,.prg,.crt,.tap,.adf,.ipf,.dms,.lha,.jsdos,.exe,.com,.tzx,.z80,.sna,.cdt,.dsk,.rom,.zip,.7z,.m3u";

/* =====================  STORAGE  ===================== */
const store={
  get(k,d){try{const v=localStorage.getItem("emufer."+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem("emufer."+k,JSON.stringify(v))}catch(e){}}
};
function makeDB(name,storeName){
  return{
    db:null,
    open(){return new Promise(res=>{try{
      const r=indexedDB.open(name,1);
      r.onupgradeneeded=()=>{r.result.createObjectStore(storeName,{keyPath:"id"})};
      r.onsuccess=()=>{this.db=r.result;res(true)};r.onerror=()=>res(false);
    }catch(e){res(false)}})},
    tx(m){return this.db.transaction(storeName,m).objectStore(storeName)},
    all(){return new Promise(res=>{if(!this.db)return res([]);const q=this.tx("readonly").getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])})},
    get(id){return new Promise(res=>{if(!this.db)return res(null);const q=this.tx("readonly").get(id);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)})},
    put(rec){return new Promise(res=>{if(!this.db)return res(false);try{const t=this.db.transaction(storeName,"readwrite");t.objectStore(storeName).put(rec);t.oncomplete=()=>res(true);t.onerror=()=>res(false);t.onabort=()=>res(false)}catch(e){res(false)}})},
    del(id){return new Promise(res=>{if(!this.db)return res(false);const t=this.db.transaction(storeName,"readwrite");t.objectStore(storeName).delete(id);t.oncomplete=()=>res(true);t.onerror=()=>res(false)})}
  };
}
const DB=makeDB("emufer-library","games");      // game files + stats
const STATES=makeDB("emufer-states","states");  // autosave per game

/* =====================  STATE  ===================== */
let current=null;                 // {file,bios,system,id}
let objUrls=[],watchdog=null,sessionTimer=null,autosaveTimer=null;
let sessionStart=0,lastTickAt=0,running=false,autosaveFails=0,savedAny=false,startToken=0;
const iso=window.crossOriginIsolated===true;

/* =====================  HELPERS  ===================== */
function setStatus(msg,kind){const s=$("status");s.textContent=msg;s.className="status"+(kind?" "+kind:"")}
function fmtTime(ms){const t=Math.floor(ms/1000),h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=t%60;return (h?h+":"+String(m).padStart(2,"0"):m)+":"+String(s).padStart(2,"0")}
function fmtSize(b){return b>1048576?(b/1048576).toFixed(1)+" MB":Math.max(1,Math.round(b/1024))+" KB"}
function ago(t){const s=Math.round((Date.now()-t)/1000);if(s<60)return s+"s ago";if(s<3600)return Math.round(s/60)+" min ago";if(s<86400)return Math.round(s/3600)+" h ago";return Math.round(s/86400)+" d ago"}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const gameId=f=>f.name+"|"+f.size;
const frame=()=>$("stage").querySelector("iframe");
const emu=()=>{try{const w=frame()&&frame().contentWindow;return w&&w.EJS_emulator||null}catch(e){return null}};
function dataPath(){
  const v=$("cdn").value;
  if(v==="local")return new URL("data/",location.href).href;
  return v;
}

/* =====================  UI SETUP  ===================== */
function buildSelects(){
  const sel=$("system"),lib=$("libSystem");let g="",og=null;
  SYSTEMS.forEach(s=>{
    if(s.g!==g){g=s.g;og=document.createElement("optgroup");og.label=g;sel.appendChild(og)}
    const o=document.createElement("option");o.value=s.id;o.textContent=s.n;og.appendChild(o);
    const o2=document.createElement("option");o2.value=s.id;o2.textContent=s.n;lib.appendChild(o2);
  });
  $("rom").accept=ACCEPT;
}
function updateBiosHint(){
  const s=SYS[$("system").value];
  $("biosNeed").textContent=s&&s.bios?s.bios:"Most games on this system need no BIOS.";
  if(s&&s.bios)$("biosBox").open=true;
}
function initIso(){
  const p=$("isoPill");
  if(iso){p.textContent="Isolation: on";p.classList.add("ok")}
  else{p.textContent="Isolation: off (PSP/DOS need it)";p.title="Start Emufer with serve.py or server.ps1 in Chrome or Edge"}
}

/* =====================  MULTI-FILE (cue+bin) → ZIP  ===================== */
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0}
async function makeZip(files,zipName){
  const parts=[],cd=[];let off=0;const enc=new TextEncoder();
  for(const f of files){
    const data=new Uint8Array(await f.arrayBuffer()),name=enc.encode(f.name),crc=crc32(data);
    const lh=new DataView(new ArrayBuffer(30));
    lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
    lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);
    parts.push(lh.buffer,name,data);
    const ch=new DataView(new ArrayBuffer(46));
    ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);
    ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
    cd.push(ch.buffer,name);off+=30+name.length+data.length;
  }
  const cdSize=cd.reduce((a,b)=>a+b.byteLength,0);
  const end=new DataView(new ArrayBuffer(22));
  end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,cdSize,true);end.setUint32(16,off,true);
  return new File([...parts,...cd,end.buffer],zipName,{type:"application/zip"});
}
async function normalizeFiles(list){
  list=[...list];
  if(list.length<=1)return list[0]||null;
  const cue=list.find(f=>/\.cue$/i.test(f.name))||list.find(f=>/\.(m3u|ccd|mdf|toc)$/i.test(f.name));
  const base=(cue||list.sort((a,b)=>b.size-a.size)[0]).name.replace(/\.[^.]+$/,"");
  setStatus("Combining "+list.length+" files into one disc package…");
  return makeZip(list,base+".zip");
}

/* =====================  DETECTION UI  ===================== */
let detectToken=0;
async function onFileChosen(file){
  if(!file)return null;
  const tok=++detectToken;
  setStatus("Detecting console for “"+file.name+"”…");
  let d=null;try{d=await window.EmuDetect.detectSystem(file)}catch(e){}
  if(tok!==detectToken)return d;
  if(d&&SYS[d.id]){
    $("system").value=d.id;updateBiosHint();
    const conf={high:"",medium:" (from extension)",low:" (best guess — change it if wrong)"}[d.confidence]||"";
    setStatus("Detected: "+SYS[d.id].n+conf+" — "+d.why+".",d.confidence==="low"?"":"good");
  }else setStatus("Couldn't identify this file automatically. Please pick the system manually.","bad");
  return d;
}

/* =====================  CONTROLS  ===================== */
const KEYMAP={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",19:"pause/break",20:"caps lock",32:"space",33:"page up",34:"page down",35:"end",36:"home",37:"left arrow",38:"up arrow",39:"right arrow",40:"down arrow",45:"insert",46:"delete",
48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"a",66:"b",67:"c",68:"d",69:"e",70:"f",71:"g",72:"h",73:"i",74:"j",75:"k",76:"l",77:"m",78:"n",79:"o",80:"p",81:"q",82:"r",83:"s",84:"t",85:"u",86:"v",87:"w",88:"x",89:"y",90:"z",
96:"numpad 0",97:"numpad 1",98:"numpad 2",99:"numpad 3",100:"numpad 4",101:"numpad 5",102:"numpad 6",103:"numpad 7",104:"numpad 8",105:"numpad 9",106:"multiply",107:"add",109:"subtract",110:"decimal point",111:"divide",
112:"f1",113:"f2",114:"f3",115:"f4",116:"f5",117:"f6",118:"f7",119:"f8",120:"f9",121:"f10",122:"f11",123:"f12",186:"semi-colon",187:"equal sign",188:"comma",189:"dash",190:"period",191:"forward slash",192:"grave accent",219:"open bracket",220:"back slash",221:"close braket",222:"single quote"};
const BTN=[[0,"B / Cross"],[1,"Y / Square"],[8,"A / Circle"],[9,"X / Triangle"],[4,"D-pad Up"],[5,"D-pad Down"],[6,"D-pad Left"],[7,"D-pad Right"],[3,"Start"],[2,"Select"],[10,"L"],[11,"R"],[12,"L2"],[13,"R2"],[14,"L3 (stick click)"],[15,"R3 (stick click)"],
[18,"Left stick Down"],[19,"Left stick Up"],[17,"Left stick Left"],[16,"Left stick Right"],[22,"Right stick Down"],[23,"Right stick Up"],[21,"Right stick Left"],[20,"Right stick Right"],[24,"Quick-save state"],[25,"Quick-load state"],[26,"Change state slot"]];
const DEFAULT_CTL=()=>({0:{0:{value:"x",value2:"BUTTON_2"},1:{value:"s",value2:"BUTTON_4"},2:{value:"v",value2:"SELECT"},3:{value:"enter",value2:"START"},4:{value:"up arrow",value2:"DPAD_UP"},5:{value:"down arrow",value2:"DPAD_DOWN"},6:{value:"left arrow",value2:"DPAD_LEFT"},7:{value:"right arrow",value2:"DPAD_RIGHT"},8:{value:"z",value2:"BUTTON_1"},9:{value:"a",value2:"BUTTON_3"},10:{value:"q",value2:"LEFT_TOP_SHOULDER"},11:{value:"e",value2:"RIGHT_TOP_SHOULDER"},12:{value:"tab",value2:"LEFT_BOTTOM_SHOULDER"},13:{value:"r",value2:"RIGHT_BOTTOM_SHOULDER"},14:{value:"",value2:"LEFT_STICK"},15:{value:"",value2:"RIGHT_STICK"},16:{value:"h",value2:"LEFT_STICK_X:+1"},17:{value:"f",value2:"LEFT_STICK_X:-1"},18:{value:"g",value2:"LEFT_STICK_Y:+1"},19:{value:"t",value2:"LEFT_STICK_Y:-1"},20:{value:"l",value2:"RIGHT_STICK_X:+1"},21:{value:"j",value2:"RIGHT_STICK_X:-1"},22:{value:"k",value2:"RIGHT_STICK_Y:+1"},23:{value:"i",value2:"RIGHT_STICK_Y:-1"},24:{value:"1"},25:{value:"2"},26:{value:"3"}},1:{},2:{},3:{}});
const PAD_NAMES=["BUTTON_1","BUTTON_2","BUTTON_3","BUTTON_4","LEFT_TOP_SHOULDER","RIGHT_TOP_SHOULDER","LEFT_BOTTOM_SHOULDER","RIGHT_BOTTOM_SHOULDER","SELECT","START","LEFT_STICK","RIGHT_STICK","DPAD_UP","DPAD_DOWN","DPAD_LEFT","DPAD_RIGHT"];
const AXIS_NAMES=["LEFT_STICK_X","LEFT_STICK_Y","RIGHT_STICK_X","RIGHT_STICK_Y"];
let controls=store.get("controls",null)||DEFAULT_CTL();
let ctlPlayer=0,ctlWait=null,padPoll=0;
function padLabel(v){if(!v)return"—";if(v.includes(":")){const[a,b]=v.split(":");return a.replace(/_/g," ").toLowerCase()+" "+b}return v.replace(/_/g," ").toLowerCase()}
function renderCtl(){
  $("ctlTabs").innerHTML=[0,1,2,3].map(i=>'<button class="secondary small'+(i===ctlPlayer?" on":"")+'" data-p="'+i+'">Player '+(i+1)+'</button>').join("");
  const c=controls[ctlPlayer]||{};
  $("ctlTable").innerHTML='<tr><th>Button</th><th>Keyboard</th><th>Gamepad</th></tr>'+BTN.map(([idx,lab])=>{
    const e=c[idx]||{};
    return'<tr><td>'+lab+'</td><td><button class="cell" data-i="'+idx+'" data-k="value">'+esc(e.value||"—")+'</button></td><td>'+(idx>=24?'<span class="muted">keyboard only</span>':'<button class="cell" data-i="'+idx+'" data-k="value2">'+esc(padLabel(e.value2))+'</button>')+'</td></tr>'}).join("");
}
function stopWait(){ctlWait=null;cancelAnimationFrame(padPoll);document.querySelectorAll("#ctlTable .cell.wait").forEach(b=>b.classList.remove("wait"))}
function setCtl(idx,key,val){
  controls[ctlPlayer]=controls[ctlPlayer]||{};
  const e=controls[ctlPlayer][idx]=controls[ctlPlayer][idx]||{};
  if(val===""||val==null)delete e[key];else e[key]=val;
  store.set("controls",controls);stopWait();renderCtl();
}
function startWait(btn){
  stopWait();ctlWait={idx:+btn.dataset.i,key:btn.dataset.k};btn.classList.add("wait");btn.textContent="press…";
  if(ctlWait.key==="value2"){
    const base=[...(navigator.getGamepads?navigator.getGamepads():[])].map(p=>p?{b:p.buttons.map(x=>x.pressed),a:[...p.axes]}:null);
    const loop=()=>{
      if(!ctlWait||ctlWait.key!=="value2")return;
      const pads=[...(navigator.getGamepads?navigator.getGamepads():[])];
      for(let pi=0;pi<pads.length;pi++){const p=pads[pi];if(!p)continue;const b0=base[pi]||{b:[],a:[]};
        for(let i=0;i<p.buttons.length&&i<16;i++)if(p.buttons[i].pressed&&!b0.b[i]){setCtl(ctlWait.idx,"value2",PAD_NAMES[i]);return}
        for(let a=0;a<4&&a<p.axes.length;a++){const v=p.axes[a],d=(b0.a[a]||0);if(Math.abs(v)>0.7&&Math.abs(d)<0.4){setCtl(ctlWait.idx,"value2",AXIS_NAMES[a]+":"+(v>0?"+1":"-1"));return}}
      }
      padPoll=requestAnimationFrame(loop);
    };
    padPoll=requestAnimationFrame(loop);
  }
}
$("ctlTable").addEventListener("click",e=>{const b=e.target.closest(".cell");if(b)startWait(b)});
$("ctlTabs").addEventListener("click",e=>{const b=e.target.closest("button[data-p]");if(b){stopWait();ctlPlayer=+b.dataset.p;renderCtl()}});
document.addEventListener("keydown",e=>{
  if(!ctlWait||!$("ctl").open)return;
  if(ctlWait.key!=="value")return;
  e.preventDefault();e.stopPropagation();
  if(e.key==="Escape"){stopWait();renderCtl();return}
  if(e.key==="Backspace"){setCtl(ctlWait.idx,"value","");return}
  const name=KEYMAP[e.keyCode];
  if(name)setCtl(ctlWait.idx,"value",name);
},true);
$("ctlBtn").onclick=()=>{ctlPlayer=0;renderCtl();$("ctl").showModal()};
$("ctlDone").onclick=()=>{stopWait();$("ctl").close();if(running)setStatus("Controls saved — they apply the next time a game starts (use Restart).","good")};
$("ctl").addEventListener("close",stopWait);
$("ctlDefault").onclick=()=>{controls=DEFAULT_CTL();store.set("controls",controls);renderCtl()};
$("ctlClear").onclick=()=>{controls[ctlPlayer]={};store.set("controls",controls);renderCtl()};
function syncControlsFromEmu(){
  // pick up edits made in the emulator's own control menu
  const e=emu();if(!e||!e.controls||!e.keyMap)return;
  try{
    const out={0:{},1:{},2:{},3:{}};
    for(let p=0;p<4;p++)for(const k in e.controls[p]){
      const c=e.controls[p][k],o={};
      const kn=e.keyMap[c.value];if(kn)o.value=kn;
      if(c.value2!==undefined&&c.value2!=="")o.value2=String(c.value2);
      out[p][k]=o;
    }
    if(JSON.stringify(out)!==JSON.stringify(controls)){controls=out;store.set("controls",controls)}
  }catch(err){}
}
function stripEjsControlOverrides(){
  // our controls are the single source of truth; drop per-game copies EmulatorJS saved earlier
  try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);
    if(k&&k.startsWith("ejs-")&&k.endsWith("-settings")){try{const o=JSON.parse(localStorage.getItem(k));if(o&&o.controlSettings){delete o.controlSettings;localStorage.setItem(k,JSON.stringify(o))}}catch(e){}}}}catch(e){}
}

/* =====================  AUTOSAVE  ===================== */
function setSaveInd(txt,bad){const el=$("saveInd");el.textContent=txt;el.style.color=bad?"#fca5a5":""}
async function doAutosave(reason){
  const cur=current;
  if(!running||!cur)return;
  const e=emu();if(!e||!e.started||!e.gameManager)return;
  if(sessionStart&&Date.now()-sessionStart<4000)return;      // let a resumed state finish loading first
  try{
    try{e.gameManager.saveSaveFiles()}catch(err){}           // in-game (battery) saves
    const st=e.gameManager.getState();                       // synchronous snapshot
    if(!st||!st.length)throw new Error("empty state");
    const buf=st.slice().buffer;
    const prev=await STATES.get(cur.id);
    const rec={id:cur.id,name:cur.file.name,system:cur.system,time:Date.now(),data:buf,backup:prev&&prev.backup||null};
    if(!cur.backupDone){rec.backup=prev?prev.data:rec.backup;cur.backupDone=true}
    const ok=await STATES.put(rec);
    if(!ok)throw new Error("storage write failed");
    autosaveFails=0;savedAny=true;
    if(cur===current)setSaveInd("💾 autosaved "+new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
    syncControlsFromEmu();
  }catch(err){
    autosaveFails++;
    if(autosaveFails>=2&&cur===current)setSaveInd("💾 autosave unavailable for this core — in-game saves are still written",true);
  }
}
function scheduleAutosave(){
  clearInterval(autosaveTimer);autosaveTimer=null;
  const s=parseInt($("asInt").value,10);
  if(s>0)autosaveTimer=setInterval(()=>doAutosave("timer"),s*1000);
}
function flushOnExit(){doAutosave("exit");recordPlaytime()}
window.addEventListener("pagehide",flushOnExit);
window.addEventListener("beforeunload",flushOnExit);
document.addEventListener("visibilitychange",()=>{if(document.hidden&&running){doAutosave("hidden");recordPlaytime()}});

function recordPlaytime(){
  if(!current||!current.id||!sessionStart||!running)return;
  const now=Date.now(),add=now-(lastTickAt||sessionStart);lastTickAt=now;
  if(add<=0)return;
  DB.get(current.id).then(r=>{if(r){r.playtime=(r.playtime||0)+add;DB.put(r)}});
}

/* =====================  LAUNCH  ===================== */
function stopGame(silent){
  if(running){doAutosave("stop");recordPlaytime()}
  clearTimeout(watchdog);clearInterval(sessionTimer);clearInterval(autosaveTimer);
  const old=frame();if(old)old.remove();
  objUrls.forEach(u=>URL.revokeObjectURL(u));objUrls=[];
  $("empty").style.display="grid";$("hud").style.display="none";
  running=false;sessionStart=0;
  renderTouchController();
["fullscreen","reload","stop"].forEach(i=>$(i).disabled=true);
  $("start").disabled=false;$("nowPlaying").textContent="";$("timer").textContent="Session: 0:00";
  if(!silent)setStatus("Stopped. Your progress was autosaved.");
}
async function launch(file,system,bios,opts){
  opts=opts||{};
  if(!file){setStatus("Please choose a game file first.","bad");return}
  const sys=SYS[system];if(!sys){setStatus("Unknown system.","bad");return}
  if(sys.needsIso&&!iso){setStatus(sys.n.split(" (")[0]+" needs a cross-origin-isolated page. Start Emufer with serve.py or server.ps1 in Chrome or Edge (not by opening index.html directly).","bad");return}
  stopGame(true);
  const tok=++startToken;
  const id=gameId(file);
  current={file,bios,system,id,backupDone:false};
  renderTouchController();
  $("start").disabled=true;$("nowPlaying").textContent=file.name;
  setStatus("Starting "+file.name+"…");

  // library
  if($("remember").checked||opts.fromLibrary){
    const ex=await DB.get(id);
    const rec=ex||{id,name:file.name,system,size:file.size,added:Date.now(),playtime:0,plays:0,fav:false,blob:file,bios:bios||null};
    rec.system=system;rec.lastPlayed=Date.now();rec.plays=(rec.plays||0)+1;
    if(bios)rec.bios=bios;
    const ok=await DB.put(rec);
    if(!ok&&!ex)setStatus("Starting… (couldn't add to library: storage full or blocked)","bad");
    store.set("lastGame",id);
    renderLibrary();
  }
  if(tok!==startToken)return;

  // autosave resume
  let stateUrl="",resumed=null;
  if($("resume").checked&&!opts.fresh){
    const st=await STATES.get(id);
    if(st&&st.data&&st.data.byteLength){stateUrl=URL.createObjectURL(new Blob([st.data]));objUrls.push(stateUrl);resumed=st}
  }
  if(tok!==startToken)return;

  const url=URL.createObjectURL(file);objUrls.push(url);
  let biosUrl="";if(bios){biosUrl=URL.createObjectURL(bios);objUrls.push(biosUrl)}
  const useThreads=iso&&(system==="psp"||system==="dos");
  const o={
    core:sys.core,gameUrl:url,gameName:file.name.replace(/\.[^.]+$/,""),pathtodata:dataPath(),biosUrl,stateUrl,
    volume:parseFloat($("volume").value),shader:$("shader").value,threads:useThreads,
    controls:Object.assign({0:{},1:{},2:{},3:{}},controls),interval:$("asInt").value
  };
  stripEjsControlOverrides();
  const doc='<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;background:#000;overflow:hidden}#game{width:100%;height:100%}</style></head><body><div id="game"></div><script>\n'+
  'var O='+JSON.stringify(o).replace(/</g,"\\u003c")+';\n'+
  'window.EJS_DEBUG_XX=true;window.EJS_player="#game";window.EJS_core=O.core;window.EJS_gameUrl=O.gameUrl;window.EJS_gameName=O.gameName;\n'+
  'window.EJS_pathtodata=O.pathtodata;window.EJS_startOnLoaded=true;window.EJS_volume=O.volume;window.EJS_color="#22c55e";window.EJS_backgroundColor="#000";\n'+
  'window.EJS_threads=O.threads;if(O.biosUrl)window.EJS_biosUrl=O.biosUrl;if(O.stateUrl)window.EJS_loadStateURL=O.stateUrl;\n'+
  'window.EJS_defaultControls=O.controls;window.EJS_disableAutoLang=true;window.EJS_language="en-US";\n'+
  'window.EJS_defaultOptions={"save-save-interval":O.interval&&O.interval!=="0"?O.interval:"30"};if(O.shader)window.EJS_defaultOptions.shader=O.shader;\n'+
  'window.EJS_onGameStart=function(){parent.postMessage({emufer:"start"},"*")};\n'+
  'window.EJS_ready=function(){parent.postMessage({emufer:"ready"},"*")};\n'+
  'window.addEventListener("error",function(e){if(e&&e.message)parent.postMessage({emufer:"error",msg:String(e.message)},"*")});\n'+
  '<\/script><script src="'+o.pathtodata+'loader.js" onerror="parent.postMessage({emufer:\'cdnfail\'},\'*\')"><\/script></body></html>';

  const f=document.createElement("iframe");
  f.setAttribute("allow","autoplay; fullscreen; gamepad; cross-origin-isolated; clipboard-write");
  f.setAttribute("allowfullscreen","");
  f.srcdoc=doc;
  current.resumed=resumed;
  $("empty").style.display="none";
  $("stage").appendChild(f);
  ["reload","stop"].forEach(i=>$(i).disabled=false);
  savedAny=!!resumed;autosaveFails=0;
  setSaveInd(resumed?"💾 resuming from autosave ("+ago(resumed.time)+")":"💾 not saved yet");
  clearTimeout(watchdog);
  watchdog=setTimeout(()=>{if(!running)setStatus("Still loading… big games can take a minute. If nothing happens, check the console choice, BIOS and file format.")},40000);
}
window.addEventListener("message",e=>{
  const d=e.data;if(!d||!d.emufer)return;
  if(d.emufer==="start"){
    running=true;clearTimeout(watchdog);$("start").disabled=false;$("fullscreen").disabled=false;
    renderTouchController();
    sessionStart=Date.now();lastTickAt=sessionStart;clearInterval(sessionTimer);
    sessionTimer=setInterval(()=>{$("timer").textContent="Session: "+fmtTime(Date.now()-sessionStart);if(Date.now()-lastTickAt>30000)recordPlaytime()},1000);
    setStatus((current&&current.resumed?"Resumed from your last autosave. ":"Playing. ")+(current?current.file.name:""),"good");
    try{frame().focus();frame().contentWindow.focus()}catch(err){}
    scheduleAutosave();
    if($("autoFs").checked)toggleFs();
// Keep pad above the emulator iframe
}else if(d.emufer==="ready"){setStatus("Emulator core loaded; preparing game…")}
  else if(d.emufer==="cdnfail"){$("start").disabled=false;setStatus("Could not load the emulator files from "+($("cdn").value==="local"?"the bundled data/ folder. Make sure the data folder is next to index.html":"the online CDN. Check your internet connection")+".","bad")}
});

/* =====================  BUTTONS  ===================== */
async function startFromInputs(){
  const files=[...$("rom").files];
  if(!files.length){setStatus("Please choose a game file first.","bad");return}
  const file=await normalizeFiles(files);
  launch(file,$("system").value,$("bios").files[0]||null);
}
$("start").addEventListener("click",startFromInputs);
$("system").addEventListener("change",()=>{updateBiosHint()});
$("rom").addEventListener("change",async()=>{
  const files=[...$("rom").files];if(!files.length)return;
  const f=files.length>1?await normalizeFiles(files):files[0];
  onFileChosen(f);
  $("rom")._combined=files.length>1?f:null;
});
$("reload").addEventListener("click",()=>{if(current)launch(current.file,current.system,current.bios,{fresh:false})});
$("stop").addEventListener("click",()=>stopGame());
function toggleFs(){
  const el=$("stage");
  if(document.fullscreenElement)document.exitFullscreen();
  else if(el.requestFullscreen)el.requestFullscreen().then(()=>{try{frame().focus()}catch(e){}}).catch(()=>{});
}
$("fullscreen").addEventListener("click",toggleFs);
$("theater").addEventListener("click",()=>{store.set("theater",$("layout").classList.toggle("theater"))});
let hudOn=false;
$("hudBtn").addEventListener("click",()=>{
  hudOn=!hudOn;$("hud").style.display=hudOn?"block":"none";
  if(hudOn){let last=performance.now(),n=0;const loop=t=>{n++;if(t-last>=1000){$("hud").textContent="Page "+Math.round(n*1000/(t-last))+" fps";n=0;last=t}if(hudOn)requestAnimationFrame(loop)};requestAnimationFrame(loop)}
});
document.addEventListener("keydown",e=>{
  if(e.target.matches("input,select,textarea")||$("ctl").open)return;
  if((e.key==="f"||e.key==="F")&&running)toggleFs();
});
$("volume").addEventListener("input",()=>{$("volLbl").textContent=Math.round($("volume").value*100)+"%";store.set("volume",$("volume").value)});
["shader","cdn","asInt"].forEach(id=>$(id).addEventListener("change",()=>{store.set(id,$(id).value);if(id==="asInt")scheduleAutosave()}));
["autoFs","remember","resume","autoCont"].forEach(id=>$(id).addEventListener("change",()=>store.set(id,$(id).checked)));
$("helpBtn").onclick=()=>$("help").showModal();$("helpClose").onclick=()=>$("help").close();

/* drag & drop */
let dragDepth=0;
window.addEventListener("dragenter",e=>{if(e.dataTransfer&&[...e.dataTransfer.types].includes("Files")){dragDepth++;$("stage").classList.add("drop")}});
window.addEventListener("dragleave",()=>{if(--dragDepth<=0){dragDepth=0;$("stage").classList.remove("drop")}});
window.addEventListener("dragover",e=>e.preventDefault());
window.addEventListener("drop",async e=>{
  e.preventDefault();dragDepth=0;$("stage").classList.remove("drop");
  const list=e.dataTransfer&&e.dataTransfer.files;if(!list||!list.length)return;
  const f=await normalizeFiles(list);
  const d=await onFileChosen(f);
  if(d&&SYS[d.id])launch(f,d.id,$("bios").files[0]||null);
});

/* =====================  LIBRARY  ===================== */
async function renderLibrary(){
  let list=await DB.all();const states=Object.fromEntries((await STATES.all()).map(s=>[s.id,s.time]));
  const q=$("search").value.trim().toLowerCase(),sys=$("libSystem").value,fav=$("favOnly").checked,sort=$("libSort").value;
  list=list.filter(r=>(!q||r.name.toLowerCase().includes(q))&&(!sys||r.system===sys)&&(!fav||r.fav));
  const sorters={recent:(a,b)=>(b.lastPlayed||0)-(a.lastPlayed||0),added:(a,b)=>b.added-a.added,name:(a,b)=>a.name.localeCompare(b.name),time:(a,b)=>(b.playtime||0)-(a.playtime||0)};
  list.sort(sorters[sort]);
  const g=$("grid");
  if(!list.length)g.innerHTML='<div class="lib-empty" style="grid-column:1/-1">'+(DB.db?"No games yet. Load a game with “Save this game to my library” ticked and it will show up here.":"Library unavailable (browser storage blocked, e.g. private mode).")+"</div>";
  else g.innerHTML=list.map(r=>{const s=SYS[r.system]||{abbr:"?",n:r.system};const t=states[r.id];
    return'<div class="card" data-id="'+esc(r.id)+'"><button class="star'+(r.fav?" on":"")+'" data-act="fav" title="Favorite">★</button>'+
    '<div class="art">'+esc(s.abbr)+'</div><div class="name" title="'+esc(r.name)+'">'+esc(r.name.replace(/\.[^.]+$/,""))+'</div>'+
    '<div class="meta">'+esc(s.n)+' · '+fmtSize(r.size)+'<br>'+(r.plays||0)+' plays · '+fmtTime(r.playtime||0)+' played'+(t?'<br><span style="color:var(--accent2)">💾 autosave '+ago(t)+'</span>':'')+'</div>'+
    '<div class="btns"><button class="play small" data-act="play">▶ '+(t?"Continue":"Play")+'</button>'+(t?'<button class="secondary small" data-act="fresh" title="Start over (keeps the old autosave until the next one)">New</button>':'')+'<button class="danger small" data-act="del" title="Remove from library">✕</button></div></div>'}).join("");
  updateStorage();
}
async function playFromLibrary(id,fresh){
  const r=await DB.get(id);if(!r)return false;
  $("system").value=r.system;updateBiosHint();
  const f=r.blob instanceof File?r.blob:new File([r.blob],r.name);
  window.scrollTo({top:0,behavior:"smooth"});
  launch(f,r.system,r.bios||null,{fromLibrary:true,fresh});
  return true;
}
$("grid").addEventListener("click",async e=>{
  const b=e.target.closest("button[data-act]");if(!b)return;
  const id=b.closest(".card").dataset.id,act=b.dataset.act;
  if(act==="play")playFromLibrary(id,false);
  else if(act==="fresh"){if(confirm("Start this game from the beginning? Your current autosave will be replaced by the next autosave.")){await STATES.del(id);playFromLibrary(id,true)}}
  else if(act==="fav"){const r=await DB.get(id);if(r){r.fav=!r.fav;await DB.put(r);renderLibrary()}}
  else if(act==="del"){const r=await DB.get(id);if(r&&confirm("Remove “"+r.name+"” from your library? (Its autosave and emulator saves are kept.)")){await DB.del(id);renderLibrary()}}
});
["search","libSystem","libSort","favOnly"].forEach(id=>$(id).addEventListener("input",renderLibrary));
async function updateStorage(){try{const e=await navigator.storage.estimate();$("storageInfo").textContent="Stored on this PC: "+fmtSize(e.usage||0)}catch(err){$("storageInfo").textContent=""}}

/* continue banner / auto-continue */
async function setupContinue(){
  const id=store.get("lastGame",null);if(!id)return;
  const r=await DB.get(id);if(!r)return;
  const st=await STATES.get(id);
  $("bannerText").innerHTML='<strong>Continue '+esc(r.name.replace(/\.[^.]+$/,""))+'</strong><br><span class="muted">'+esc((SYS[r.system]||{n:r.system}).n)+(st?' · autosaved '+ago(st.time):' · no autosave yet')+'</span>';
  $("banner").classList.add("show");
  $("bannerGo").onclick=()=>{$("banner").classList.remove("show");playFromLibrary(id,false)};
  $("bannerNo").onclick=()=>$("banner").classList.remove("show");
  if($("autoCont").checked&&st){$("banner").classList.remove("show");playFromLibrary(id,false)}
}

/* =====================  BACKUP / RESTORE (everything) ===================== */
function b64(buf){let s="";const a=new Uint8Array(buf),c=0x8000;for(let i=0;i<a.length;i+=c)s+=String.fromCharCode.apply(null,a.subarray(i,i+c));return btoa(s)}
function unb64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function enc(v){
  if(v instanceof ArrayBuffer)return{__t:"ab",d:b64(v)};
  if(ArrayBuffer.isView(v))return{__t:"ta",k:v.constructor.name,d:b64(v.buffer.slice(v.byteOffset,v.byteOffset+v.byteLength))};
  if(v instanceof Blob)return{__t:"blob"};
  if(v instanceof Date)return{__t:"date",d:v.getTime()};
  if(Array.isArray(v))return v.map(enc);
  if(v&&typeof v==="object"){const o={};for(const k in v)o[k]=enc(v[k]);return o}
  return v;
}
function dec(v){
  if(Array.isArray(v))return v.map(dec);
  if(v&&typeof v==="object"){
    if(v.__t==="ab")return unb64(v.d).buffer;
    if(v.__t==="ta"){const u=unb64(v.d);const C=self[v.k]||Uint8Array;return new C(u.buffer)}
    if(v.__t==="date")return new Date(v.d);
    const o={};for(const k in v)o[k]=dec(v[k]);return o;
  }
  return v;
}
const idbOpen=(name,version)=>new Promise((res,rej)=>{const r=indexedDB.open(name,version);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const readAll=(db,st)=>new Promise((res,rej)=>{const t=db.transaction(st,"readonly").objectStore(st);const out=[];const c=t.openCursor();c.onsuccess=()=>{const cur=c.result;if(cur){out.push({k:enc(cur.key),v:enc(cur.value)});cur.continue()}else res({keyPath:t.keyPath,auto:t.autoIncrement,items:out})};c.onerror=()=>rej(c.error)});
async function backupSaves(){
  if(!indexedDB.databases){setStatus("This browser can't list saved data (use Chrome or Edge).","bad");return}
  setStatus("Collecting saves…");
  try{
    if(running)await doAutosave("backup");
    const dbs=(await indexedDB.databases()).filter(d=>d.name&&d.name!=="emufer-library");
    const out={emufer:2,created:new Date().toISOString(),dbs:[],ls:{}};
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith("emufer.")||k.startsWith("ejs-")))out.ls[k]=localStorage.getItem(k)}
    for(const d of dbs){const db=await idbOpen(d.name);const stores={};for(const sn of db.objectStoreNames)stores[sn]=await readAll(db,sn);out.dbs.push({name:d.name,version:db.version,stores});db.close()}
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(out)],{type:"application/json"}));
    a.download="emufer-saves-"+new Date().toISOString().slice(0,10)+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    setStatus("Backed up autosaves, game saves and settings ("+out.dbs.length+" databases). Keep the file somewhere safe.","good");
  }catch(err){setStatus("Backup failed: "+err.message,"bad")}
}
async function restoreSaves(file){
  try{
    const data=JSON.parse(await file.text());
    if(!data||!(data.emufer>=1))throw new Error("not an Emufer backup file");
    if(running)stopGame(true);
    for(const d of data.dbs){
      const db=await new Promise((res,rej)=>{const r=indexedDB.open(d.name,d.version);
        r.onupgradeneeded=()=>{for(const sn in d.stores){if(!r.result.objectStoreNames.contains(sn)){const s=d.stores[sn];r.result.createObjectStore(sn,s.keyPath?{keyPath:s.keyPath,autoIncrement:!!s.auto}:{autoIncrement:!!s.auto})}}};
        r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
      for(const sn in d.stores){if(!db.objectStoreNames.contains(sn))continue;const s=d.stores[sn];
        await new Promise((res,rej)=>{const t=db.transaction(sn,"readwrite"),os=t.objectStore(sn);s.items.forEach(it=>{const v=dec(it.v);if(os.keyPath)os.put(v);else os.put(v,dec(it.k))});t.oncomplete=res;t.onerror=()=>rej(t.error)})}
      db.close();
    }
    if(data.ls)for(const k in data.ls){try{localStorage.setItem(k,data.ls[k])}catch(e){}}
    setStatus("Restored. Reloading Emufer…","good");setTimeout(()=>location.reload(),900);
  }catch(err){setStatus("Restore failed: "+err.message,"bad")}
}
$("backup").onclick=backupSaves;
$("restore").onclick=()=>$("restoreFile").click();
$("restoreFile").onchange=()=>{const f=$("restoreFile").files[0];if(f)restoreSaves(f);$("restoreFile").value=""};

/* =====================  TOUCH CONTROLLER  ===================== */
const TOUCH_LABELS={
  nes:{0:"B",8:"A",1:"",9:"",10:"",11:""},
  snes:{0:"B",1:"Y",8:"A",9:"X",10:"L",11:"R"},
  gb:{0:"B",8:"A",1:"",9:"",10:"",11:""},
  gbc:{0:"B",8:"A",1:"",9:"",10:"",11:""},
  gba:{0:"B",8:"A",1:"",9:"",10:"L",11:"R"},
  n64:{0:"B",8:"A",1:"C←",9:"C↑",10:"L",11:"R",12:"Z",13:"Z"},
  segaMD:{0:"B",1:"C",8:"A",9:"X",10:"Y",11:"Z"},
  segaMS:{0:"1",8:"2",1:"",9:""},
  segaGG:{0:"1",8:"2",1:"",9:""},
  psx:{0:"✕",1:"□",8:"○",9:"△",10:"L1",11:"R1",12:"L2",13:"R2"},
  psp:{0:"✕",1:"□",8:"○",9:"△",10:"L",11:"R"},
  segaSaturn:{0:"B",1:"Y",8:"A",9:"X",10:"L",11:"R"},
  arcade:{0:"B1",1:"B2",8:"B3",9:"B4",10:"B5",11:"B6"},
  neogeo:{0:"B",1:"D",8:"A",9:"C"},
  atari2600:{0:"Fire",8:"Fire",1:"",9:""},
  atari5200:{0:"1",8:"2",1:"",9:""},
  atari7800:{0:"B",8:"A",1:"",9:""},
  lynx:{0:"B",8:"A",1:"",9:""},
  default:{0:"B",1:"Y",8:"A",9:"X",10:"L",11:"R"}
};
const TOUCH_KEYS={8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Control",18:"Alt",32:" ",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown"};
function keyCodeFromName(name){
  if(!name)return 0;
  const n=String(name).toLowerCase();
  const special={"backspace":8,"tab":9,"enter":13,"shift":16,"ctrl":17,"alt":18,"space":32,"left arrow":37,"up arrow":38,"right arrow":39,"down arrow":40};
  if(special[n])return special[n];
  if(n.length===1)return n.toUpperCase().charCodeAt(0);
  return 0;
}
function touchKeyEvent(index,type){
  const entry=(controls[0]||{})[index]||{};
  const name=entry.value;
  if(!name)return;
  const code=keyCodeFromName(name);
  const key=TOUCH_KEYS[code]||(name.length===1?name.toLowerCase():name);
  const f=frame();if(!f)return;
  try{
    const w=f.contentWindow,d=f.contentDocument;
    const ev=new w.KeyboardEvent(type,{key,code:key.length===1?"Key"+key.toUpperCase():key,keyCode:code,which:code,bubbles:true,cancelable:true});
    d.dispatchEvent(ev);w.dispatchEvent(new w.KeyboardEvent(type,{key,code:key.length===1?"Key"+key.toUpperCase():key,keyCode:code,which:code,bubbles:true,cancelable:true}));
  }catch(e){}
}
function renderTouchController(){
  const root=$("touchControls");if(!root)return;
  const touchCapable=("ontouchstart" in window)||(navigator.maxTouchPoints||0)>0||matchMedia("(pointer: coarse)").matches;
  root.classList.toggle("show",!!(running&&touchCapable));
  const id=current&&current.system;
  const labels=TOUCH_LABELS[id]||TOUCH_LABELS.default;
  root.querySelectorAll("[data-index]").forEach(b=>{
    const idx=+b.dataset.index;
    let label=labels[idx];
    if(label===undefined)label=({2:"SELECT",3:"START",4:"▲",5:"▼",6:"◀",7:"▶"}[idx]||"");
    b.textContent=label;
    b.style.display=label?"grid":"none";
    b.setAttribute("aria-label",({2:"Select",3:"Start",4:"D-pad up",5:"D-pad down",6:"D-pad left",7:"D-pad right"}[idx]||label||"Button"));
  });
}
(function initTouchController(){
  const root=$("touchControls");if(!root)return;
  const held=new Map();
  const releaseOne=(pointerId)=>{const idx=held.get(pointerId);if(idx===undefined)return;held.delete(pointerId);if(![...held.values()].includes(idx)){touchKeyEvent(idx,"keyup");const b=root.querySelector('[data-index="'+idx+'"]');if(b)b.classList.remove("pressed")}};
  const releaseAll=()=>{for(const id of [...held.keys()])releaseOne(id)};
  root.querySelectorAll(".vc-btn").forEach(b=>{
    b.addEventListener("pointerdown",e=>{e.preventDefault();const idx=+b.dataset.index;if([...held.values()].includes(idx))return;held.set(e.pointerId,idx);touchKeyEvent(idx,"keydown");b.classList.add("pressed");try{b.setPointerCapture(e.pointerId)}catch(err){}});
    ["pointerup","pointercancel","lostpointercapture"].forEach(type=>b.addEventListener(type,e=>releaseOne(e.pointerId)));
    b.addEventListener("contextmenu",e=>e.preventDefault());
  });
  window.addEventListener("blur",releaseAll);
  document.addEventListener("visibilitychange",()=>{if(document.hidden)releaseAll()});
  window.addEventListener("resize",renderTouchController);
})();

/* =====================  GAMEPAD INDICATOR  ===================== */
function padCheck(){
  const pads=(navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[]);const p=$("padPill");
  if(pads.length){p.textContent="🎮 "+pads.length+" controller"+(pads.length>1?"s":"");p.classList.add("ok")}else{p.textContent="🎮 No controller";p.classList.remove("ok")}
}
window.addEventListener("gamepadconnected",padCheck);window.addEventListener("gamepaddisconnected",padCheck);

/* =====================  INIT  ===================== */
(async function init(){
  buildSelects();
  $("system").value=store.get("system","nes");
  $("volume").value=store.get("volume","0.8");$("volLbl").textContent=Math.round($("volume").value*100)+"%";
  $("shader").value=store.get("shader","");
  const cdn=store.get("cdn","local");if([...$("cdn").options].some(o=>o.value===cdn))$("cdn").value=cdn;
  $("asInt").value=store.get("asInt","15");
  ["autoFs","remember","resume","autoCont"].forEach(id=>{const d=id==="autoFs"?false:true;$(id).checked=store.get(id,d)});
  if(store.get("theater",false))$("layout").classList.add("theater");
  if(location.protocol==="file:")setStatus("Tip: you opened this as a file. Use serve.py or server.ps1 so the emulator can load.","bad");
  updateBiosHint();initIso();padCheck();
  await Promise.all([DB.open(),STATES.open()]);
  await renderLibrary();
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
  setupContinue();
})();
