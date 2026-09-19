/* Shared by the site (index.html, history.html) and the daily recorder
   (tools/record.mjs), so the page and the history always score the same way.
   Plain script with globals: no build step, loads in a browser and in Node's vm. */

/* Location-dependent settings. The page picks one from the URL hash, /#phuket. */
const REGIONS={
  phuket:{ name:{en:'Phuket',ru:'Пхукет',th:'ภูเก็ต'}, tz:'Asia/Bangkok',
    dayFrom:6, dayTo:18, wxLat:7.89, wxLon:98.30,
    // NOAA WaveWatch III node west of the island (0.5° grid); k scales open-sea
    // height to what the near-shore Open-Meteo points show (checked 19 Sep 2026)
    ww3:{lat:7.5, lon:98.0, k:0.75} },
  khaolak:{ name:{en:'Khao Lak',ru:'Као Лак',th:'เขาหลัก'}, tz:'Asia/Bangkok',
    dayFrom:6, dayTo:18, wxLat:8.70, wxLon:98.24,
    ww3:{lat:8.5, lon:98.0, k:0.75} }
};

/* facing  : direction the beach faces, degrees
   swellMin/Max : working swell range, metres
   shelter : how much headlands block the swell, 0..1
   tide    : tide state the break prefers                          */
const ALL_SPOTS=[
 {id:'naiharn',nm:{en:'Nai Harn',ru:'Най Харн',th:'หาดในหาน'},lat:7.7756,lon:98.3035,facing:250,swellMin:1.05,swellMax:3.64,
  shelter:.4,tide:'mid',pin:1,cam:null},
 {id:'kata',nm:{en:'Kata',ru:'Ката',th:'หาดกะตะ'},lat:7.8206,lon:98.2967,facing:270,swellMin:0.6,swellMax:3.08,
  shelter:.2,tide:'mid',pin:1,cam:{type:'rtsp',id:'2F8DfBS5',by:'SSS Dive & Surf'}},
 {id:'patong',nm:{en:'Patong',ru:'Патонг',th:'หาดป่าตอง'},lat:7.8950,lon:98.2830,facing:265,swellMin:0.9,swellMax:2.8,
  // Patong stream is CSP-locked to phuket101.net,
  // so a self-refreshing frame is used instead
  shelter:.4,tide:'mid',pin:1,cam:{type:'img',id:'1613136596',by:'Patong Tower, 15F'}},
 {id:'karon',nm:{en:'Karon',ru:'Карон',th:'หาดกะรน'},lat:7.8480,lon:98.2930,facing:270,swellMin:0.75,swellMax:3.36,
  shelter:.15,tide:'high',pin:1,cam:{type:'ipcam',id:'69241c73d3f52',by:'Marina Phuket Resort'}},
 {id:'katanoi',nm:{en:'Kata Noi',ru:'Ката Ной',th:'หาดกะตะน้อย'},lat:7.8080,lon:98.2960,facing:270,swellMin:0.9,swellMax:2.8,
  shelter:.3,tide:'high',cam:null},
 {id:'kalim',nm:{en:'Kalim',ru:'Калим',th:'หาดกะหลิม'},lat:7.9130,lon:98.2790,facing:270,swellMin:1.95,swellMax:4.9,
  shelter:.1,tide:'mid',cam:null},
 {id:'kamala',nm:{en:'Kamala',ru:'Камала',th:'หาดกมลา'},lat:7.9540,lon:98.2790,facing:272,swellMin:0.9,swellMax:3.08,
  shelter:.25,tide:'any',cam:null},
 {id:'surin',nm:{en:'Surin',ru:'Сурин',th:'หาดสุรินทร์'},lat:7.9770,lon:98.2780,facing:270,swellMin:1.2,swellMax:3.64,
  shelter:.1,tide:'mid',cam:null},
 {id:'bangtao',nm:{en:'Bang Tao',ru:'Банг Тао',th:'หาดบางเทา'},lat:8.0000,lon:98.2930,facing:275,swellMin:0.75,swellMax:3.08,
  shelter:.2,tide:'any',cam:null},
 {id:'layan',nm:{en:'Layan',ru:'Лайан',th:'หาดลายัน'},lat:8.0330,lon:98.2890,facing:272,swellMin:0.75,swellMax:2.52,
  shelter:.35,tide:'any',cam:null},
 {id:'naithon',nm:{en:'Nai Thon',ru:'Найтон',th:'หาดในทอน'},lat:8.0800,lon:98.2600,facing:270,swellMin:0.75,swellMax:2.8,
  shelter:.3,tide:'mid',cam:null},
 {id:'naiyang',nm:{en:'Nai Yang',ru:'Най Янг',th:'หาดในยาง'},lat:8.0930,lon:98.2960,facing:270,swellMin:0.6,swellMax:2.1,
  shelter:.55,tide:'high',cam:null},
 /* One Khao Lak break listed on the Phuket page for reference: Khuk Khak by
    Memories Beach Bar and Pakarang Surf Shop, next to the Sunova board
    factory. It is 80 km north, so it never takes part in the top. */
 {id:'kl_khukkhak',noTop:1,nm:{en:'Khao Lak',ru:'Као Лак',th:'เขาหลัก'},beach:{en:'Khuk Khak',ru:'Кук Как',th:'หาดคึกคัก'},lat:8.7135,lon:98.2363,facing:265,swellMin:0.6,swellMax:2.8,
  shelter:.15,tide:'mid',cam:null},
 /* Khao Lak. Coordinates from OpenStreetMap. Profiles are first estimates
    from local surf guides: long, gently sloping sand beaches for learners,
    reef breaks around Cape Pakarang that need more size. */
 {id:'khukkhak',region:'khaolak',nm:{en:'Khuk Khak',ru:'Кук Как',th:'หาดคึกคัก'},lat:8.7135,lon:98.2363,facing:265,swellMin:0.6,swellMax:2.8,
  shelter:.15,tide:'mid',pin:1,cam:null},
 {id:'pakarang',region:'khaolak',nm:{en:'Cape Pakarang',ru:'Мыс Пакаранг',th:'แหลมปะการัง'},lat:8.7290,lon:98.2223,facing:250,swellMin:1.0,swellMax:3.2,
  shelter:.1,tide:'mid',pin:1,cam:null},
 {id:'bangniang',region:'khaolak',nm:{en:'Bang Niang',ru:'Банг Ньянг',th:'หาดบางเนียง'},lat:8.6668,lon:98.2435,facing:265,swellMin:0.6,swellMax:2.8,
  shelter:.15,tide:'any',pin:1,cam:null},
 {id:'nangthong',region:'khaolak',nm:{en:'Nang Thong',ru:'Нанг Тонг',th:'หาดนางทอง'},lat:8.6490,lon:98.2463,facing:262,swellMin:0.7,swellMax:2.5,
  shelter:.3,tide:'mid',cam:null},
 {id:'pakweep',region:'khaolak',nm:{en:'Pak Weep',ru:'Пак Вип',th:'หาดปากวีป'},lat:8.7384,lon:98.2422,facing:268,swellMin:0.7,swellMax:2.8,
  shelter:.2,tide:'any',cam:null},
 {id:'bangsak',region:'khaolak',nm:{en:'Bang Sak',ru:'Банг Сак',th:'หาดบางสัก'},lat:8.7688,lon:98.2623,facing:272,swellMin:0.7,swellMax:2.8,
  shelter:.15,tide:'any',cam:null}
];
const spotsOf=r=>ALL_SPOTS.filter(x=>(x.region||'phuket')===r);

const WAVE_MODELS=['gwam','meteofrance_wave','ncep_gfswave016','ecmwf_wam025'];
/* Three wind models are enough for the median and the spread; more models from
   the same provider add no reliability, they fail together. MET Norway joins
   the wind median as an independent provider, NOAA WaveWatch III the waves. */
const WIND_MODELS=['ecmwf_ifs025','gfs_seamless','icon_seamless'];

const avg=a=>{a=a.filter(x=>x!=null&&!isNaN(x));return a.length?a.reduce((s,x)=>s+x,0)/a.length:null};
/* Median, not mean: one outlier model must not drag the result. */
const median=a=>{a=a.filter(x=>x!=null&&!isNaN(x)).sort((x,y)=>x-y);
  if(!a.length) return null;
  const m=a.length>>1; return a.length%2?a[m]:(a[m-1]+a[m])/2};
const range=a=>{a=a.filter(x=>x!=null&&!isNaN(x));
  return a.length?{lo:Math.min(...a),hi:Math.max(...a)}:null};
/* Directions are circular: 350° and 10° average to 0°, not 180°. */
const circMean=arr=>{
  const a=arr.filter(x=>x!=null&&!isNaN(x));
  if(!a.length) return null;
  let s=0,c=0; a.forEach(d=>{const r=d*Math.PI/180; s+=Math.sin(r); c+=Math.cos(r)});
  return (Math.atan2(s/a.length,c/a.length)*180/Math.PI+360)%360;
};
const spread=a=>{a=a.filter(x=>x!=null&&!isNaN(x));if(a.length<2)return 0;
  const m=avg(a);return m>0?(Math.max(...a)-Math.min(...a))/m:0};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const angDiff=(a,b)=>{let d=Math.abs(a-b)%360;return d>180?360-d:d};
const fmt=(v,d=1,dash='–')=>v==null||isNaN(v)?dash:v.toFixed(d);

/* ===== TUNE: everything that decides "good waves" lives here. =====
   Change numbers in this block only; the rest of the code reads them.
   grades   : colour and word by the score AS DISPLAYED (whole number),
              so a "6" is always the same colour whatever the decimals.
   weights  : share of each factor in the score, should add up to 1.
   size     : below swellMin the size factor is 0..belowMax, at the
              optimum (opt, 0..1 inside the spot range) it is 10.
   swellPeriod: long swell breaks bigger and wraps headlands better, so the
              height is scaled by (period/ref)^power, never below floor.
              power 0 switches it off. 0.7 m at 5 s and at 13 s are
              different waves (8 vs 14 Sep 2026 at Nai Harn).
   cap      : without waves the score cannot go above this.
   danger   : red banner, separate from the score.                    */
const TUNE={
  grades:[
    {min:8, key:'gEpic', color:'var(--go)'},
    {min:6, key:'gGood', color:'var(--ok)'},
    {min:5, key:'gFair', color:'var(--fair)'},
    {min:3, key:'gWeak', color:'var(--mid)'},
    {min:2, key:'gPoor', color:'var(--bad)'},
    {min:-1,key:'gFlat', color:'var(--no)'}
  ],
  weights:{size:0.34, wind:0.30, period:0.20, dir:0.16},
  size:{opt:0.45, belowMax:2, atMin:2, overMax:4, overFade:1.2},
  period:{from:3.5, span:8},
  swellPeriod:{ref:7, power:1, floor:0.6},
  cap:{base:0.4, slope:5},
  shelterLoss:0.55,
  danger:{gust:14}
};
const GRADES=TUNE.grades;
/* Scores are rounded DOWN everywhere: 7.9 shows as 7. Better to under-promise
   and let the beach be a nice surprise. Number and colour use the same value. */
const shown=v=>Math.floor((v??0)+1e-9);
const gradeOf=v=>GRADES.find(g=>shown(v)>=g.min)||GRADES[GRADES.length-1];

/* Опасность считается отдельно от качества: слишком большая волна
   для спота или штормовые порывы. Это не низкий балл, а отдельный флаг. */
function dangerOf(sp,r){
  if(!r) return null;
  const eff=r.swell==null?null:r.swell*(1-sp.shelter*TUNE.shelterLoss);
  if(eff!=null && eff>sp.swellMax) return {key:'dBig', v:fmt(eff,1)};
  if(r.gust!=null && r.gust>=TUNE.danger.gust) return {key:'dWind', v:fmt(r.gust,0)};
  return null;
}

/* Score 0..10. */
function scoreHour(sp,h){
  const {swell:sw,period:per,sdir,wind:wsp,wdir,tide}=h;
  if(sw==null) return null;
  const SP=TUNE.swellPeriod;
  const boost=per==null?1:Math.max(SP.floor,Math.pow(per/SP.ref,SP.power));
  const eff=sw*boost*(1-sp.shelter*TUNE.shelterLoss); // how much gets past the headlands
  const Z=TUNE.size, W=TUNE.weights;
  /* Размер. Прежняя версия давала 7+ уже на нижней границе диапазона,
     из-за чего еле живая волна выглядела приличной. Теперь у минимума
     это двойка, десятка только около оптимума. */
  let size;
  if(eff<sp.swellMin) size=clamp(eff/sp.swellMin,0,1)*Z.belowMax;
  else if(eff>sp.swellMax) size=clamp(1-(eff-sp.swellMax)/Z.overFade,0,1)*Z.overMax;
  else{
    const rel=(eff-sp.swellMin)/(sp.swellMax-sp.swellMin);
    size = rel<=Z.opt ? Z.atMin+(10-Z.atMin)*(rel/Z.opt) : 10-(10-Z.overMax)*((rel-Z.opt)/(1-Z.opt));
  }
  const period=per==null?5:clamp((per-TUNE.period.from)/TUNE.period.span,0,1)*10;
  const dirS=clamp(1-(sdir==null?45:angDiff(sdir,sp.facing))/95,0,1)*10;
  const wOff=angDiff(wdir==null?sp.facing:wdir,(sp.facing+180)%360);
  let wind;
  // unknown wind is neutral; only a real calm earns the calm bonus
  if(wsp==null) wind=5;
  else if(wsp<1.2) wind=8.5;
  else if(wOff<55) wind=clamp(10-(wsp-3)*0.35,5,10);
  else if(wOff<115) wind=clamp(7.5-wsp*0.55,1.5,7.5);
  else wind=clamp(7-wsp*1.15,0,7);
  let tideAdj=0;
  if(tide!=null){
    if(sp.tide==='high') tideAdj=(tide-0.55)*1.7;
    else if(sp.tide==='low') tideAdj=(0.55-tide)*1.7;
    else if(sp.tide==='mid') tideAdj=(0.5-Math.abs(tide-0.55))*1.6;
  }
  const raw=size*W.size+period*W.period+dirS*W.dir+wind*W.wind+tideAdj;
  /* Размер работает и как потолок. Без волны хороший ветер и удачное
     направление не должны давать четвёрку: кататься всё равно не на чем. */
  const cap = eff>=sp.swellMin ? 10 : clamp(eff/sp.swellMin,0,1)*TUNE.cap.slope+TUNE.cap.base;
  return clamp(Math.min(raw,cap),0,10);
}

/* One request covers all spots; spots sharing a grid point share a column. */
function pointsOf(spots, span){
  const pts=[...new Set(spots.map(s=>s.lat.toFixed(2)+','+s.lon.toFixed(2)))];
  return {pts, base:'latitude='+pts.map(p=>p.split(',')[0]).join(',')+
    '&longitude='+pts.map(p=>p.split(',')[1]).join(',')+'&timezone=Asia%2FBangkok'+span};
}

/* MET Norway timeseries indexed by local hour. */
function metIndex(mn){
  const MET={};
  if(mn) for(const p of mn.properties.timeseries){
    const k=new Date(p.time).toLocaleString('sv-SE',{timeZone:'Asia/Bangkok'}).slice(0,13).replace(' ','T');
    const d=p.data.instant.details;
    MET[k]={s:d.wind_speed, d:d.wind_from_direction};
  }
  return MET;
}

/* Model medians per spot and hour, then the score. core = {m,w,tSea} as
   returned by Open-Meteo for the points in pts. */
function buildSpots(spots, pts, core, MET, ww3, waveModels){
  const WM=waveModels||WAVE_MODELS;
  const {m,w,tSea}=core;
  // wind or sea may be missing when a source is down; waves are required
  const M=[].concat(m), W=w?[].concat(w):[], T=tSea?[].concat(tSea):null;
  MET=MET||{};
  const idx={}; pts.forEach((p,i)=>idx[p]=i);
  const out={};
  for(const sp of spots){
    const i=idx[sp.lat.toFixed(2)+','+sp.lon.toFixed(2)];
    if(i==null||!M[i]||!M[i].hourly) continue;   // no data for this spot: leave it out
    const mh=M[i].hourly, wh=W[i]?.hourly||{}, th=T&&T[i]?T[i].hourly:{}, rows=[];
    for(let k=0;k<mh.time.length;k++){
      const time=mh.time[k], hourKey=time.slice(0,13);
      const met=MET[hourKey]||null;

      const sRaw=WM.map(md=>({m:md,
        h:mh['wave_height_'+md]?.[k], p:mh['wave_period_'+md]?.[k],
        d:mh['wave_direction_'+md]?.[k],
        sw:mh['swell_wave_height_'+md]?.[k], swp:mh['swell_wave_period_'+md]?.[k]}));
      const sH=sRaw.map(x=>x.h);

      const wRaw=WIND_MODELS.map(md=>({m:md,
        s:wh['wind_speed_10m_'+md]?.[k], d:wh['wind_direction_10m_'+md]?.[k],
        g:wh['wind_gusts_10m_'+md]?.[k]}));
      if(met) wRaw.push({m:'metno', s:met.s, d:met.d, g:null});
      const wS=wRaw.map(x=>x.s);
      const w3=ww3?ww3[hourKey]:null;

      rows.push({t:time,
        swell:median(sH), period:median(sRaw.map(x=>x.p)),
        sdir:circMean(sRaw.map(x=>x.d)),
        swellOnly:median(sRaw.map(x=>x.sw)),
        swellRange:range(sH), windRange:range(wS),
        sst:th.sea_surface_temperature?.[k],
        tideRaw:th.sea_level_height_msl?.[k],
        windWave:median(WM.map(md=>mh['wind_wave_height_'+md]?.[k])),
        rain:median(WIND_MODELS.map(md=>wh['precipitation_'+md]?.[k])),
        wind:median(wS), wdir:circMean(wRaw.map(x=>x.d)),
        gust:median(wRaw.map(x=>x.g)),
        // raw per-model values
        ww3:w3,
        raw:{wave:sRaw, wind:wRaw}});
    }
    const tv=rows.map(r=>r.tideRaw).filter(x=>x!=null);
    const tmin=tv.length?Math.min(...tv):0, tmax=tv.length?Math.max(...tv):0;
    rows.forEach(r=>{r.tide=r.tideRaw==null?null:(tmax>tmin?(r.tideRaw-tmin)/(tmax-tmin):0.5);
      r.score=scoreHour(sp,r)});
    out[sp.id]=rows;
  }
  return out;
}
