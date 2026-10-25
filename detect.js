/* Emufer console auto-detection.
   Looks at file CONTENT first (headers / magic bytes / disc volume info / zip contents),
   then falls back to the file extension and finally to filename hints.
   detectSystem(file) -> Promise<{id, confidence:"high"|"medium"|"low", why}|null> */
(function(){
"use strict";

const EXT={
  nes:"nes",unf:"nes",unif:"nes",fds:"nes",
  smc:"snes",sfc:"snes",swc:"snes",fig:"snes",
  gb:"gb",gbc:"gbc",gba:"gba",
  z64:"n64",n64:"n64",v64:"n64",
  nds:"nds",dsi:"nds",
  vb:"vb",vboy:"vb",
  md:"segaMD",gen:"segaMD",smd:"segaMD",sms:"segaMS",gg:"segaGG","32x":"sega32x",
  pbp:"psx",cso:"psp",
  a26:"atari2600",a52:"atari5200",a78:"atari7800",lnx:"lynx",j64:"jaguar",jag:"jaguar",
  col:"coleco",cv:"coleco",pce:"pce",sgx:"pce",
  ws:"wswan",wsc:"wswanc",ngp:"ngp",ngc:"ngpc",
  d64:"c64",t64:"c64",prg:"c64",crt:"c64",tap:"c64",d71:"c64",d81:"c64",x64:"c64",
  adf:"amiga",adz:"amiga",ipf:"amiga",dms:"amiga",lha:"amiga",hdf:"amiga",
  jsdos:"dos",exe:"dos",com:"dos",bat:"dos",
  tzx:"zxspectrum",z80:"zxspectrum",sna:"zxspectrum",tap_zx:"zxspectrum",
  p:"zx81","81":"zx81",
  cdt:"cpc",dsk:"cpc",
  wad:"doom"
};
const DISC_EXT=new Set(["iso","bin","img","cue","chd","mdf","ccd","cdi","toc","m3u"]);

const ascii=(u8,off,len)=>{let s="";for(let i=off;i<Math.min(u8.length,off+len);i++){const c=u8[i];s+=(c>=32&&c<127)?String.fromCharCode(c):(c===0?"\0":".")}return s};
const has=(u8,off,str)=>ascii(u8,off,str.length)===str;
const eq=(u8,off,arr)=>arr.every((b,i)=>u8[off+i]===b);

/* ---- cartridge header sniffing ---- */
function sniffCart(u8,size,ext){
  if(u8.length<16)return null;
  if(has(u8,0,"NES\x1a"))return["nes","iNES header"];
  if(has(u8,0,"FDS\x1a")||has(u8,1,"*NINTENDO-HVC*"))return["nes","Famicom Disk header"];
  if(has(u8,0,"LYNX"))return["lynx","Lynx header"];
  if(has(u8,1,"ATARI7800"))return["atari7800","Atari 7800 header"];
  if(has(u8,0,"JAGUAR")||(ext==="j64"))return["jaguar","Jaguar"];
  if(has(u8,0x100,"SEGA 32X")||has(u8,0x100,"SEGA 32 X"))return["sega32x","32X header"];
  if(has(u8,0x100,"SEGA")||has(u8,0x100," SEGA"))return["segaMD","Mega Drive header"];
  if(u8.length>0x10&&u8[8]===0xAA&&u8[9]===0xBB&&u8[10]===0x06)return["segaMD","SMD interleaved header"];
  if(u8.length>0x4000){
    for(const o of[0x7FF0,0x3FF0,0x1FF0]){
      if(has(u8,o,"TMR SEGA")){const reg=u8[o+0xF]>>4;return[reg>=5&&reg<=7?"segaGG":"segaMS","Sega Master System / Game Gear header"]}
    }
  }
  if(u8.length>0x150){
    if(eq(u8,0x104,[0xCE,0xED,0x66,0x66]))return[(u8[0x143]&0x80)?"gbc":"gb","Game Boy logo"+((u8[0x143]&0x80)?" (Color flag)":"")];
  }
  if(u8.length>0xC0){
    if(eq(u8,4,[0x24,0xFF,0xAE,0x51])&&u8[0xB2]===0x96)return["gba","GBA header"];
    if(eq(u8,0xC0,[0x24,0xFF,0xAE,0x51])&&u8[0x15C]===0xCF&&u8[0x15D]===0x56)return["nds","Nintendo DS header"];
  }
  if(eq(u8,0,[0x80,0x37,0x12,0x40])||eq(u8,0,[0x37,0x80,0x40,0x12])||eq(u8,0,[0x40,0x12,0x37,0x80]))return["n64","N64 header"];
  if(has(u8,0,"COPYRIGHT BY SNK")||has(u8,0,"COPYRIGHT BY SNK CORPORATION")||has(u8,0," LICENSED BY SNK")){return[(u8[0x23]===0x10)?"ngpc":"ngp","Neo Geo Pocket header"]}
  if(u8.length>0x8000){
    // SNES: LoROM 0x7FC0, HiROM 0xFFC0, optional 512-byte copier header
    const offs=[0x7FC0,0xFFC0,0x7FC0+512,0xFFC0+512,0x40FFC0];
    for(const o of offs){
      if(o+0x20<=u8.length){
        const c=u8[o+0x1C]|(u8[o+0x1D]<<8),k=u8[o+0x1E]|(u8[o+0x1F]<<8);
        if(((c+k)&0xFFFF)===0xFFFF&&c!==0&&k!==0){
          // title should be printable
          let ok=true;for(let i=0;i<21;i++){const b=u8[o+i];if(b!==0&&(b<32||b>126))ok=false}
          if(ok)return["snes","SNES header checksum"];
        }
      }
    }
  }
  if(u8[0]===0xAA&&u8[1]===0x55||u8[0]===0x55&&u8[1]===0xAA){if(size<=0x20000&&(ext==="col"||ext==="bin"||ext==="rom"))return["coleco","ColecoVision signature"]}
  return null;
}

/* ---- optical disc sniffing ----
   Works for cooked 2048-byte (.iso) and raw 2352-byte (.bin) images. */
function sniffDisc(u8){
  const out=[];
  const cooked=has(u8,0x8001,"CD001");
  const rawM1=u8.length>37632+30&&has(u8,37632+16+1,"CD001");
  const rawM2=u8.length>37632+30&&has(u8,37632+24+1,"CD001");
  const sec0=(cooked?0:rawM1?16:rawM2?24:(u8.length>40&&u8[0]===0&&u8[1]===0xFF&&u8[11]===0)?16:0);
  const head=ascii(u8,sec0,0x200);
  const pvdBase=cooked?0x8000:rawM1?37632+16:rawM2?37632+24:-1;
  const sysId=pvdBase>=0?ascii(u8,pvdBase+8,32).replace(/[\0.]+/g," ").trim():"";
  const vol=pvdBase>=0?ascii(u8,pvdBase+40,32).replace(/[\0.]+/g," ").trim():"";
  if(has(u8,sec0,"SEGADISCSYSTEM")||head.includes("SEGADISCSYSTEM")||head.includes("SEGA MEGA DRIVE")&&pvdBase<0)return["segaCD","Sega CD boot sector"];
  if(head.startsWith("SEGA SEGASATURN")||head.includes("SEGA SEGASATURN"))return["segaSaturn","Saturn boot sector"];
  if(head.startsWith("\x01ZZZZZ\x01")||head.slice(0,7)==="\x01ZZZZZ\x01")return["3do","3DO Opera filesystem"];
  if(head.includes("PC-FX:Hu_CD-ROM"))return["pcfx","PC-FX boot sector"];
  if(head.includes("PC Engine CD-ROM SYSTEM"))return["pce","PC Engine CD"];
  if(/PLAYSTATION/i.test(sysId))return["psx","PlayStation disc ("+(vol||"volume")+")"];
  if(/PSP GAME|PSP UMD/i.test(sysId)||/PSP_GAME/.test(ascii(u8,0x8000,0x4000)))return["psp","PSP UMD disc"];
  if(/PLAYSTATION|PS2/i.test(sysId))return["psx","PlayStation disc"];
  if(/CDTV|AMIGA|CD32/i.test(sysId+vol))return["amiga","Amiga CD"];
  if(/SEGA/i.test(sysId)&&/SATURN/i.test(head+sysId))return["segaSaturn","Saturn disc"];
  return null;
}

/* ---- minimal ZIP reader (central directory) ---- */
async function readZip(file){
  const tail=new Uint8Array(await file.slice(Math.max(0,file.size-66000)).arrayBuffer());
  let e=-1;for(let i=tail.length-22;i>=0;i--){if(tail[i]===0x50&&tail[i+1]===0x4b&&tail[i+2]===5&&tail[i+3]===6){e=i;break}}
  if(e<0)return null;
  const dv=new DataView(tail.buffer);
  const n=dv.getUint16(e+10,true),cdSize=dv.getUint32(e+12,true),cdOff=dv.getUint32(e+16,true);
  if(cdOff===0xFFFFFFFF)return null;
  const cd=new Uint8Array(await file.slice(cdOff,cdOff+cdSize).arrayBuffer());
  const cv=new DataView(cd.buffer);let p=0;const files=[];
  for(let i=0;i<n&&p+46<=cd.length;i++){
    if(cv.getUint32(p,true)!==0x02014b50)break;
    const method=cv.getUint16(p+10,true),csize=cv.getUint32(p+20,true),usize=cv.getUint32(p+24,true);
    const nl=cv.getUint16(p+28,true),xl=cv.getUint16(p+30,true),cl=cv.getUint16(p+32,true),lo=cv.getUint32(p+42,true);
    const name=new TextDecoder().decode(cd.subarray(p+46,p+46+nl));
    files.push({name,method,csize,usize,lo});p+=46+nl+xl+cl;
  }
  return files;
}
async function zipHead(file,entry,max){
  const lh=new Uint8Array(await file.slice(entry.lo,entry.lo+30).arrayBuffer());
  const dv=new DataView(lh.buffer);
  const start=entry.lo+30+dv.getUint16(26,true)+dv.getUint16(28,true);
  if(entry.method===0)return new Uint8Array(await file.slice(start,start+Math.min(max,entry.usize)).arrayBuffer());
  if(entry.method===8&&typeof DecompressionStream==="function"){
    const raw=file.slice(start,start+entry.csize);
    const ds=raw.stream().pipeThrough(new DecompressionStream("deflate-raw"));
    const rd=ds.getReader();const chunks=[];let got=0;
    while(got<max){const {done,value}=await rd.read();if(done)break;chunks.push(value);got+=value.length}
    try{rd.cancel()}catch(e){}
    const out=new Uint8Array(Math.min(got,max));let o=0;for(const c of chunks){const take=Math.min(c.length,out.length-o);out.set(c.subarray(0,take),o);o+=take;if(o>=out.length)break}
    return out;
  }
  return null;
}

/* ---- main entry ---- */
async function detectSystem(file){
  const name=file.name||"";
  const lower=name.toLowerCase();
  const ext=(lower.split(".").pop()||"");
  const hit=(id,conf,why)=>({id,confidence:conf,why});
  try{
    // 1. ZIP: look inside
    if(ext==="zip"||ext==="7z"&&false){
      const entries=await readZip(file);
      if(entries&&entries.length){
        const names=entries.map(e=>e.name.toLowerCase());
        // look at the largest inner file with a known extension/header
        const sorted=[...entries].filter(e=>!e.name.endsWith("/")).sort((a,b)=>b.usize-a.usize);
        const innerExts=names.map(n=>n.split(".").pop());
        const cue=innerExts.includes("cue")||innerExts.includes("ccd")||innerExts.includes("chd");
        for(const e of sorted){
          const ie=e.name.toLowerCase().split(".").pop();
          if(ie==="cue"||ie==="m3u"||ie==="txt"||ie==="nfo")continue;
          if(EXT[ie]&&!["bin","iso","img"].includes(ie)){
            const hd=await zipHead(file,e,0x20000).catch(()=>null);
            const s=hd&&sniffCart(hd,e.usize,ie);
            return hit(s?s[0]:EXT[ie],s?"high":"medium","inside zip: "+e.name+(s?" ("+s[1]+")":""));
          }
        }
        if(innerExts.some(x=>["exe","com"].includes(x))||names.some(n=>n.endsWith("dosbox.conf")))return hit("dos","medium","zip contains DOS programs");
        // disc images inside the zip
        for(const e of sorted){
          const ie=e.name.toLowerCase().split(".").pop();
          if(["bin","iso","img"].includes(ie)){
            const hd=await zipHead(file,e,0x30000).catch(()=>null);
            if(hd){const d=sniffDisc(hd)||sniffCart(hd,e.usize,ie);if(d)return hit(d[0],"high","inside zip: "+e.name+" ("+d[1]+")")}
          }
        }
        if(cue)return hit("psx","low","zip with cue/bin disc image (assuming PlayStation)");
        // arcade / Neo Geo sets: many small chips named *.p1 *.s1 *.c1 *.m1 *.v1 etc
        if(innerExts.some(x=>/^[pcsmv]\d$/.test(x))&&names.some(n=>/neo|\.c1|\.s1|\.p1|\.v1/.test(n))&&!names.some(n=>/\.(bin|rom)$/.test(n)&&false))return hit("neogeo","medium","Neo Geo style ROM chip names");
        if(/^neogeo\b/.test(lower))return hit("neogeo","medium","Neo Geo BIOS name");
        return hit("arcade","low","zip of ROM chips (assuming arcade)");
      }
    }
    // 2. Read first bytes (and disc volume area)
    const headLen=Math.min(file.size,0x30000);
    const u8=new Uint8Array(await file.slice(0,headLen).arrayBuffer());
    if(has(u8,0,"MComprHD"))return hit("psx","low","CHD disc image (assuming PlayStation; pick manually if wrong)");
    if(has(u8,0,"7z\xbc\xaf"))return hit(EXT[ext]||"arcade","low","7z archive");
    // cue sheet: text
    if(ext==="cue"){
      const txt=new TextDecoder().decode(u8.subarray(0,4000)).toUpperCase();
      return hit("psx","low","cue sheet (zip the .bin with the .cue for best results)")
    }
    if(!DISC_EXT.has(ext)||ext==="img"||ext==="bin"){
      const c=sniffCart(u8,file.size,ext);if(c)return hit(c[0],"high",c[1]);
    }
    if(DISC_EXT.has(ext)||file.size>3*1024*1024){
      const d=sniffDisc(u8);if(d)return hit(d[0],"high",d[1]);
    }
    // Amiga floppy: "DOS" bootblock
    if(ext==="adf"||has(u8,0,"DOS\x00")||has(u8,0,"DOS\x01"))return hit("amiga","high","Amiga disk bootblock");
    // C64 disk / tape
    if(has(u8,0,"C64 tape image")||has(u8,0,"C64S tape")||has(u8,0,"C64-TAPE-RAW")||has(u8,0,"C64 CARTRIDGE"))return hit("c64","high","Commodore 64 image");
    if(ext==="d64"&&file.size===174848)return hit("c64","high","1541 disk image");
    if(has(u8,0,"MZ")&&["exe","com",""].includes(ext))return hit("dos","medium","DOS executable");
  }catch(err){}
  // 3. Extension
  if(EXT[ext])return hit(EXT[ext],"medium","file extension .%s".replace("%s",ext));
  // 4. Filename hints
  const hints=[[/\b(psx|ps1|playstation)\b/,"psx"],[/\b(saturn)\b/,"segaSaturn"],[/\b(sega ?cd|mega ?cd)\b/,"segaCD"],[/\b(psp)\b/,"psp"],[/\b(neo[ -]?geo)\b/,"neogeo"],[/\b(3do)\b/,"3do"],[/\b(dos)\b/,"dos"],[/\b(amiga)\b/,"amiga"],[/\b(c64)\b/,"c64"],[/\b(snes|super nintendo)\b/,"snes"],[/\b(genesis|mega ?drive)\b/,"segaMD"]];
  for(const [re,id] of hints)if(re.test(lower))return hit(id,"low","filename hint");
  return null;
}
window.EmuDetect={detectSystem,EXT};
})();
