/* Sky: where and how the sun sets, what else is up there tonight, and the
   weather from several models. Loaded after core.js by index.html and by
   tools/horizon.mjs. Plain script with globals, no build step. */

/* ===== Sunset places =====
   kind : beach, or view for a viewpoint above the sea
   pts  : where you stand. Long bay beaches have three: south end (s),
          middle (m), north end (n), since headlands cut the view differently
          from each. Beach points sit on the OpenStreetMap coastline,
          viewpoints are OSM tourism=viewpoint nodes.
   What each point sees on the western horizon lives in horizon.js, built
   from elevation data by tools/horizon.mjs. Run it after editing this list. */
const SUNSET_PLACES=[
 {id:'promthep',region:'phuket',kind:'view',nm:{en:'Promthep Cape',ru:'Мыс Промтеп',th:'แหลมพรหมเทพ'},
  pts:[{k:'',lat:7.7619,lon:98.3054}]},
 {id:'yanui',region:'phuket',kind:'beach',nm:{en:'Ya Nui',ru:'Януй',th:'หาดยะนุ้ย'},
  pts:[{k:'',lat:7.76689,lon:98.30602}]},
 {id:'windmill',region:'phuket',kind:'view',nm:{en:'Windmill Viewpoint',ru:'Смотровая «Ветряк»',th:'จุดชมวิวกังหันลม'},
  pts:[{k:'',lat:7.7697,lon:98.3063}]},
 {id:'krating',region:'phuket',kind:'view',nm:{en:'Krating Cape',ru:'Мыс Кратинг',th:'แหลมกระทิง'},
  pts:[{k:'',lat:7.7777,lon:98.2897}]},
 {id:'naiharn',region:'phuket',kind:'beach',nm:{en:'Nai Harn',ru:'Най Харн',th:'หาดในหาน'},
  pts:[{k:'s',lat:7.774,lon:98.30648},{k:'m',lat:7.77599,lon:98.30542},{k:'n',lat:7.77753,lon:98.30435}]},
 {id:'blackrock',region:'phuket',kind:'view',nm:{en:'Black Rock',ru:'Чёрная скала',th:'ผาหินดำ'},
  pts:[{k:'',lat:7.783,lon:98.2976}]},
 {id:'karonview',region:'phuket',kind:'view',nm:{en:'Karon Viewpoint',ru:'Смотровая Карон',th:'จุดชมวิวกะรน'},
  pts:[{k:'',lat:7.7973,lon:98.3022}]},
 {id:'katanoi',region:'phuket',kind:'beach',nm:{en:'Kata Noi',ru:'Ката Ной',th:'หาดกะตะน้อย'},
  pts:[{k:'s',lat:7.80493,lon:98.29874},{k:'m',lat:7.80742,lon:98.29844},{k:'n',lat:7.8094,lon:98.29759}]},
 {id:'kata',region:'phuket',kind:'beach',nm:{en:'Kata',ru:'Ката',th:'หาดกะตะ'},
  pts:[{k:'s',lat:7.81485,lon:98.29884},{k:'m',lat:7.82004,lon:98.29758},{k:'n',lat:7.82391,lon:98.29391}]},
 {id:'bigbuddha',region:'phuket',kind:'view',nm:{en:'Big Buddha',ru:'Большой Будда',th:'พระใหญ่'},
  pts:[{k:'',lat:7.8278,lon:98.3137}]},
 {id:'karon',region:'phuket',kind:'beach',nm:{en:'Karon',ru:'Карон',th:'หาดกะรน'},
  pts:[{k:'s',lat:7.83241,lon:98.29433},{k:'m',lat:7.8442,lon:98.29305},{k:'n',lat:7.85574,lon:98.29029}]},
 {id:'karonnoi',region:'phuket',kind:'beach',nm:{en:'Karon Noi',ru:'Карон Ной',th:'หาดกะรนน้อย'},
  pts:[{k:'',lat:7.86477,lon:98.28248}]},
 {id:'freedom',region:'phuket',kind:'beach',nm:{en:'Freedom Beach',ru:'Фридом',th:'หาดฟรีดอม'},
  pts:[{k:'',lat:7.8747,lon:98.27533}]},
 {id:'tritrang',region:'phuket',kind:'beach',nm:{en:'Tri Trang',ru:'Три Транг',th:'หาดไตรตรัง'},
  pts:[{k:'',lat:7.88624,lon:98.2749}]},
 {id:'paradise',region:'phuket',kind:'beach',nm:{en:'Paradise Beach',ru:'Парадайз',th:'หาดพาราไดซ์'},
  pts:[{k:'',lat:7.89107,lon:98.26542}]},
 {id:'patong',region:'phuket',kind:'beach',nm:{en:'Patong',ru:'Патонг',th:'หาดป่าตอง'},
  pts:[{k:'s',lat:7.8881,lon:98.291},{k:'m',lat:7.89527,lon:98.29475},{k:'n',lat:7.90512,lon:98.29666}]},
 {id:'kalim',region:'phuket',kind:'beach',nm:{en:'Kalim',ru:'Калим',th:'หาดกะหลิม'},
  pts:[{k:'',lat:7.91046,lon:98.29538}]},
 {id:'kalimview',region:'phuket',kind:'view',nm:{en:'Kalim Viewpoint',ru:'Смотровая Калим',th:'จุดชมวิวกะหลิม'},
  pts:[{k:'',lat:7.9267,lon:98.3004}]},
 {id:'kamala',region:'phuket',kind:'beach',nm:{en:'Kamala',ru:'Камала',th:'หาดกมลา'},
  pts:[{k:'s',lat:7.9504,lon:98.27941},{k:'m',lat:7.95449,lon:98.28242},{k:'n',lat:7.9602,lon:98.2834}]},
 {id:'laemsingh',region:'phuket',kind:'view',nm:{en:'Laem Singh Viewpoint',ru:'Смотровая Лаем Синг',th:'จุดชมวิวแหลมสิงห์'},
  pts:[{k:'',lat:7.9701,lon:98.2794}]},
 {id:'surin',region:'phuket',kind:'beach',nm:{en:'Surin',ru:'Сурин',th:'หาดสุรินทร์'},
  pts:[{k:'s',lat:7.97308,lon:98.27844},{k:'m',lat:7.97594,lon:98.27815},{k:'n',lat:7.97876,lon:98.27763}]},
 {id:'bangtao',region:'phuket',kind:'beach',nm:{en:'Bang Tao',ru:'Банг Тао',th:'หาดบางเทา'},
  pts:[{k:'s',lat:7.99029,lon:98.28953},{k:'m',lat:8.0086,lon:98.29213},{k:'n',lat:8.02703,lon:98.28912}]},
 {id:'layan',region:'phuket',kind:'beach',nm:{en:'Layan',ru:'Лайан',th:'หาดลายัน'},
  pts:[{k:'',lat:8.03467,lon:98.28424}]},
 {id:'banana',region:'phuket',kind:'beach',nm:{en:'Banana Beach',ru:'Банана',th:'หาดบานาน่า'},
  pts:[{k:'',lat:8.04196,lon:98.27637}]},
 {id:'naithon',region:'phuket',kind:'beach',nm:{en:'Nai Thon',ru:'Найтон',th:'หาดในทอน'},
  pts:[{k:'s',lat:8.05406,lon:98.27755},{k:'m',lat:8.05801,lon:98.27739},{k:'n',lat:8.06191,lon:98.27671}]},
 {id:'naiyang',region:'phuket',kind:'beach',nm:{en:'Nai Yang',ru:'Най Янг',th:'หาดในยาง'},
  pts:[{k:'s',lat:8.08557,lon:98.29288},{k:'m',lat:8.08929,lon:98.29716},{k:'n',lat:8.09487,lon:98.2982}]},
 {id:'maikhao',region:'phuket',kind:'beach',nm:{en:'Mai Khao',ru:'Май Као',th:'หาดไม้ขาว'},
  pts:[{k:'s',lat:8.1251,lon:98.30061},{k:'m',lat:8.14993,lon:98.29647},{k:'n',lat:8.17457,lon:98.29126}]},
 {id:'saikaew',region:'phuket',kind:'beach',nm:{en:'Sai Kaew',ru:'Сай Кэу',th:'หาดทรายแก้ว'},
  pts:[{k:'',lat:8.19475,lon:98.28499}]},
 {id:'kl_south',region:'khaolak',kind:'beach',nm:{en:'Khao Lak South',ru:'Као Лак Юг',th:'หาดเขาหลักใต้'},
  pts:[{k:'',lat:8.58618,lon:98.23743}]},
 {id:'kl_lek',region:'khaolak',kind:'beach',nm:{en:'Small Sandy Beach',ru:'Хат Лек',th:'หาดเล็ก'},
  pts:[{k:'',lat:8.62322,lon:98.23271}]},
 {id:'kl_view',region:'khaolak',kind:'view',nm:{en:'Khao Lak Viewpoint',ru:'Смотровая Као Лак',th:'จุดชมวิวเขาหลัก'},
  pts:[{k:'',lat:8.6268,lon:98.2391}]},
 {id:'kl_sunset',region:'khaolak',kind:'beach',nm:{en:'Sunset Beach',ru:'Сансет Бич',th:'หาดซันเซ็ท'},
  pts:[{k:'',lat:8.63239,lon:98.24406}]},
 {id:'kl_nangthong',region:'khaolak',kind:'beach',nm:{en:'Nang Thong',ru:'Нанг Тонг',th:'หาดนางทอง'},
  pts:[{k:'',lat:8.64904,lon:98.24619}]},
 {id:'kl_bangniang',region:'khaolak',kind:'beach',nm:{en:'Bang Niang',ru:'Банг Ньянг',th:'หาดบางเนียง'},
  pts:[{k:'',lat:8.66718,lon:98.24321}]},
 {id:'kl_khukkhak',region:'khaolak',kind:'beach',nm:{en:'Khuk Khak',ru:'Кук Как',th:'หาดคึกคัก'},
  pts:[{k:'',lat:8.69899,lon:98.2385}]},
 {id:'kl_pakarang',region:'khaolak',kind:'beach',nm:{en:'Cape Pakarang',ru:'Мыс Пакаранг',th:'แหลมปะการัง'},
  pts:[{k:'',lat:8.7355,lon:98.22102}]},
 {id:'kl_pakweep',region:'khaolak',kind:'beach',nm:{en:'Pak Weep',ru:'Пак Вип',th:'หาดปากวีป'},
  pts:[{k:'',lat:8.73601,lon:98.23866}]},
 {id:'kl_bangsak',region:'khaolak',kind:'beach',nm:{en:'Bang Sak',ru:'Банг Сак',th:'หาดบางสัก'},
  pts:[{k:'',lat:8.7693,lon:98.26211}]}
];
const sunsetPlacesOf=r=>SUNSET_PLACES.filter(x=>x.region===r);

/* Horizon profiles are sampled every HZ.step degrees from HZ.from to HZ.to,
   which covers every sunset of the year at this latitude (246°..294°). */
const HZ={from:240,to:300,step:2};

/* ===== Astronomy, low precision =====
   Paul Schlyter's formulas (stjarnhimlen.se/comp/ppcomp.html). Good to a few
   arc minutes for the Sun and planets and about 0.1° for the Moon: plenty to
   say where the sun goes down and whether Venus is up. Checked against the
   astronomy-engine library on 6 Oct 2026.                                 */
const RAD=Math.PI/180;
const sind=x=>Math.sin(x*RAD), cosd=x=>Math.cos(x*RAD), rev=x=>((x%360)+360)%360;
const asind=x=>Math.asin(clamp(x,-1,1))/RAD, acosd=x=>Math.acos(clamp(x,-1,1))/RAD;
const atan2d=(y,x)=>Math.atan2(y,x)/RAD;
/* Thailand keeps UTC+7 all year. */
const TZH=7;
const localMs=s=>Date.parse(s+(s.length>10?':00':'T00:00:00')+'+07:00');
const localStr=ms=>new Date(ms+TZH*36e5).toISOString();
const dayOf=ms=>localStr(ms).slice(0,10), hhmm=ms=>localStr(ms+3e4).slice(11,16);

/* Orbital elements: N, i, w, a, e, M, each as value at day 0 and change per day. */
const ORB={
  sun:    [0,0, 0,0, 282.9404,4.70935e-5, 1,0, 0.016709,-1.151e-9, 356.0470,0.9856002585],
  moon:   [125.1228,-0.0529538083, 5.1454,0, 318.0634,0.1643573223, 60.2666,0, 0.054900,0, 115.3654,13.0649929509],
  mercury:[48.3313,3.24587e-5, 7.0047,5.00e-8, 29.1241,1.01444e-5, 0.387098,0, 0.205635,5.59e-10, 168.6562,4.0923344368],
  venus:  [76.6799,2.46590e-5, 3.3946,2.75e-8, 54.8910,1.38374e-5, 0.723330,0, 0.006773,-1.302e-9, 48.0052,1.6021302244],
  mars:   [49.5574,2.11081e-5, 1.8497,-1.78e-8, 286.5016,2.92961e-5, 1.523688,0, 0.093405,2.516e-9, 18.6021,0.5240207766],
  jupiter:[100.4542,2.76854e-5, 1.3030,-1.557e-7, 273.8777,1.64505e-5, 5.20256,0, 0.048498,4.469e-9, 19.8950,0.0830853001],
  saturn: [113.6634,2.38980e-5, 2.4886,-1.081e-7, 339.3939,2.97661e-5, 9.55475,0, 0.055546,-9.499e-9, 316.9670,0.0334442282]
};
const PLANETS=['mercury','venus','mars','jupiter','saturn'];
function orbElem(body,d){
  const o=ORB[body], v=i=>o[i*2]+o[i*2+1]*d;
  return {N:rev(v(0)),i:v(1),w:rev(v(2)),a:v(3),e:v(4),M:rev(v(5))};
}
/* Place in the orbit, ecliptic rectangular coordinates. */
function orbXYZ(el){
  let E=el.M+el.e/RAD*sind(el.M)*(1+el.e*cosd(el.M));
  for(let k=0;k<6;k++) E-=(E-el.e/RAD*sind(E)-el.M)/(1-el.e*cosd(E));
  const xv=el.a*(cosd(E)-el.e), yv=el.a*Math.sqrt(1-el.e*el.e)*sind(E);
  const r=Math.hypot(xv,yv), u=atan2d(yv,xv)+el.w;
  return {r, x:r*(cosd(el.N)*cosd(u)-sind(el.N)*sind(u)*cosd(el.i)),
    y:r*(sind(el.N)*cosd(u)+cosd(el.N)*sind(u)*cosd(el.i)), z:r*sind(u)*sind(el.i)};
}
/* Geocentric position of a body at ms since 1970. */
function skyPos(body,ms){
  const d=ms/864e5+2440587.5-2451543.5, ecl=23.4393-3.563e-7*d;
  const se=orbElem('sun',d), s=orbXYZ(se);
  let x,y,z,r=0;
  if(body==='sun'){ x=s.x; y=s.y; z=0; }
  else if(body==='moon'){
    const el=orbElem('moon',d), p=orbXYZ(el);
    let lon=atan2d(p.y,p.x), lat=atan2d(p.z,Math.hypot(p.x,p.y)), rr=p.r;
    const Ms=se.M, Mm=el.M, D=el.M+el.w+el.N-se.M-se.w, F=el.M+el.w;
    lon+=-1.274*sind(Mm-2*D)+0.658*sind(2*D)-0.186*sind(Ms)-0.059*sind(2*Mm-2*D)
      -0.057*sind(Mm-2*D+Ms)+0.053*sind(Mm+2*D)+0.046*sind(2*D-Ms)+0.041*sind(Mm-Ms)
      -0.035*sind(D)-0.031*sind(Mm+Ms)-0.015*sind(2*F-2*D)+0.011*sind(Mm-4*D);
    lat+=-0.173*sind(F-2*D)-0.055*sind(Mm-F-2*D)-0.046*sind(Mm+F-2*D)+0.033*sind(F+2*D)+0.017*sind(2*Mm+F);
    rr+=-0.58*cosd(Mm-2*D)-0.46*cosd(2*D);
    x=rr*cosd(lon)*cosd(lat); y=rr*sind(lon)*cosd(lat); z=rr*sind(lat);   // Earth radii
  }else{
    const p=orbXYZ(orbElem(body,d)); r=p.r;
    let lon=atan2d(p.y,p.x), lat=atan2d(p.z,Math.hypot(p.x,p.y));
    // Jupiter and Saturn pull on each other
    if(body==='jupiter'||body==='saturn'){
      const Mj=orbElem('jupiter',d).M, Mz=orbElem('saturn',d).M;
      if(body==='jupiter') lon+=-0.332*sind(2*Mj-5*Mz-67.6)-0.056*sind(2*Mj-2*Mz+21)+0.042*sind(3*Mj-5*Mz+21)
        -0.036*sind(Mj-2*Mz)+0.022*cosd(Mj-Mz)+0.023*sind(2*Mj-3*Mz+52)-0.016*sind(Mj-5*Mz-69);
      else{ lon+=0.812*sind(2*Mj-5*Mz-67.6)-0.229*cosd(2*Mj-4*Mz-2)+0.119*sind(Mj-2*Mz-3)
          +0.046*sind(2*Mj-6*Mz-69)+0.014*sind(Mj-3*Mz+32);
        lat+=-0.020*cosd(2*Mj-4*Mz-2)+0.018*sind(2*Mj-6*Mz-49); }
    }
    x=r*cosd(lon)*cosd(lat)+s.x; y=r*sind(lon)*cosd(lat)+s.y; z=r*sind(lat);
  }
  const ye=y*cosd(ecl)-z*sind(ecl), ze=y*sind(ecl)+z*cosd(ecl);
  return {body, d, ra:rev(atan2d(ye,x)), dec:atan2d(ze,Math.hypot(x,ye)),
    R:Math.hypot(x,y,z), r, sunR:s.r, elon:rev(atan2d(y,x)), elat:atan2d(z,Math.hypot(x,y)),
    sunLon:rev(atan2d(s.y,s.x)), lst0:rev(se.M+se.w+180)};
}
/* Height above the horizon and compass direction, as seen from lat, lon. */
function altAz(p,ms,lat,lon){
  const ut=((ms/36e5)%24+24)%24, ha=rev(p.lst0+ut*15+lon)-p.ra;
  const x=cosd(ha)*cosd(p.dec), y=sind(ha)*cosd(p.dec), z=sind(p.dec);
  let alt=asind(x*cosd(lat)+z*sind(lat));
  if(p.body==='moon') alt-=asind(1/p.R)*cosd(alt);      // the Moon is close: parallax
  return {alt, az:rev(atan2d(y,x*sind(lat)-z*cosd(lat))+180)};
}
const lookAt=(body,ms,lat,lon)=>altAz(skyPos(body,ms),ms,lat,lon);
const radiantAt=(ra,dec,ms,lat,lon)=>altAz({ra,dec,lst0:skyPos('sun',ms).lst0},ms,lat,lon);

/* Moment the Sun passes altitude h on local day s ('2026-10-06'): going down
   in the evening (dir -1) or coming up in the morning (dir 1). */
function sunCross(s,lat,lon,h,dir=-1){
  const noon=localMs(s)+12*36e5;
  let a=dir<0?noon:noon-12*36e5, b=a+12*36e5;
  for(let k=0;k<22;k++){
    const m=(a+b)/2, up=lookAt('sun',m,lat,lon).alt>h;
    if(up===(dir<0)) a=m; else b=m;
  }
  return (a+b)/2;
}
/* Sunset of a local day: time, compass direction, start of the golden hour
   (sun 6° up) and end of colour (sun 6° down). -0.833° is the standard
   sunset altitude: half the disc plus refraction. */
function sunsetOf(s,lat,lon){
  const t=sunCross(s,lat,lon,-0.833);
  return {day:s, t, az:lookAt('sun',t,lat,lon).az, golden:sunCross(s,lat,lon,6), dusk:sunCross(s,lat,lon,-6),
    rise:sunCross(s,lat,lon,-0.833,1)};
}
/* Sunset direction through the year, for the month marks on the horizon
   drawing and for "into the sea from October to February". */
function sunsetYear(lat,lon,year){
  const out=[];
  for(let m=1;m<=12;m++) for(const dd of [5,15,25]){
    const s=year+'-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
    out.push({m, dd, az:sunsetOf(s,lat,lon).az});
  }
  return out;
}

/* Moon phase: 0 new, 90 first quarter, 180 full, 270 last quarter. */
function moonInfo(ms){
  const m=skyPos('moon',ms), phase=rev(m.elon-m.sunLon);
  return {phase, illum:(1-cosd(phase))/2};
}
/* Risings and settings between two moments, by scanning every 5 minutes. */
function riseSet(body,from,to,lat,lon,h0=-0.6){
  const out=[]; let pa=null, pt=from;
  for(let t=from;t<=to;t+=3e5){
    const a=lookAt(body,t,lat,lon).alt-h0;
    if(pa!=null&&(pa<0)!==(a<0)) out.push({t:pt+(t-pt)*pa/(pa-a), up:a>0});
    pa=a; pt=t;
  }
  return out;
}
/* Brightness of a planet (smaller is brighter; Venus is about -4, the
   brightest stars about 0). */
function planetMag(body,p){
  const fv=acosd((p.r*p.r+p.R*p.R-p.sunR*p.sunR)/(2*p.r*p.R)), k=5*Math.log10(p.r*p.R);
  if(body==='mercury') return -0.36+k+0.027*fv+2.2e-13*fv**6;
  if(body==='venus') return -4.34+k+0.013*fv+4.2e-7*fv**3;
  if(body==='mars') return -1.51+k+0.016*fv;
  if(body==='jupiter') return -9.25+k+0.014*fv;
  // Saturn's rings add light depending on how far they are tilted to us
  const B=asind(sind(p.elat)*cosd(28.06)-cosd(p.elat)*sind(28.06)*sind(p.elon-(169.51+3.82e-5*p.d)));
  return -9.0+k+0.044*fv-2.6*sind(Math.abs(B))+1.2*sind(B)**2;
}
/* Planets worth looking for in the dusk after sunset or before sunrise.
   when: ms of the look (40 min from the sun's horizon crossing). */
function planetsAt(when,lat,lon,endOfNight){
  const out=[];
  for(const b of PLANETS){
    const p=skyPos(b,when), a=altAz(p,when,lat,lon), mag=planetMag(b,p);
    // low and faint things are lost in the glow near the horizon
    if(a.alt<(mag<-2?5:10)||mag>1.6) continue;
    const ev=riseSet(b,when,endOfNight,lat,lon).find(e=>!e.up);
    out.push({body:b, alt:a.alt, az:a.az, mag, sets:ev?ev.t:null});
  }
  return out.sort((a,b)=>a.mag-b.mag);
}

/* ===== Meteor showers and eclipses ===== */
/* Major showers from the IMO working list. peak is [month, day] in UT and
   moves by a day from year to year. zhr is the hourly rate under a perfectly
   dark sky with the radiant overhead; from the ground you see a part of it. */
const SHOWERS=[
 {id:'qua',nm:{en:'Quadrantids',ru:'Квадрантиды',th:'ฝนดาวตกควอดรานติดส์'},peak:[1,4],zhr:80,ra:230,dec:49},
 {id:'lyr',nm:{en:'Lyrids',ru:'Лириды',th:'ฝนดาวตกไลริดส์'},peak:[4,22],zhr:18,ra:271,dec:34},
 {id:'eta',nm:{en:'Eta Aquariids',ru:'Эта-Аквариды',th:'ฝนดาวตกอีตาอควาริดส์'},peak:[5,6],zhr:50,ra:338,dec:-1},
 {id:'sda',nm:{en:'Delta Aquariids',ru:'Дельта-Аквариды',th:'ฝนดาวตกเดลตาอควาริดส์'},peak:[7,30],zhr:25,ra:340,dec:-16},
 {id:'per',nm:{en:'Perseids',ru:'Персеиды',th:'ฝนดาวตกเพอร์เซอิดส์'},peak:[8,12],zhr:100,ra:48,dec:58},
 {id:'dra',nm:{en:'Draconids',ru:'Дракониды',th:'ฝนดาวตกดราโคนิดส์'},peak:[10,8],zhr:10,ra:262,dec:54},
 {id:'ori',nm:{en:'Orionids',ru:'Ориониды',th:'ฝนดาวตกโอไรออนิดส์'},peak:[10,21],zhr:20,ra:95,dec:16},
 {id:'leo',nm:{en:'Leonids',ru:'Леониды',th:'ฝนดาวตกลีโอนิดส์'},peak:[11,17],zhr:15,ra:152,dec:22},
 {id:'gem',nm:{en:'Geminids',ru:'Геминиды',th:'ฝนดาวตกเจมินิดส์'},peak:[12,14],zhr:150,ra:112,dec:33},
 {id:'urs',nm:{en:'Ursids',ru:'Урсиды',th:'ฝนดาวตกเออร์ซิดส์'},peak:[12,22],zhr:10,ra:217,dec:76}
];
/* Showers whose peak falls within `days` from ms. For the night that ends on
   the peak morning: the dark hours with the radiant at least 20° up, how
   high it gets, and whether the Moon is in the sky then. */
function showersNear(ms,lat,lon,days=30){
  const out=[], today=dayOf(ms), y=+today.slice(0,4);
  for(const s of SHOWERS) for(const yy of [y,y+1]){
    const day=yy+'-'+String(s.peak[0]).padStart(2,'0')+'-'+String(s.peak[1]).padStart(2,'0');
    const ahead=Math.round((localMs(day)-localMs(today))/864e5);
    if(ahead<0||ahead>days) continue;
    const eve=dayOf(localMs(day)-432e5);
    const dark0=sunCross(eve,lat,lon,-12), dark1=sunCross(day,lat,lon,-12,1);
    let from=null, to=null, top=-90, moonUp=0, n=0;
    for(let t=dark0;t<=dark1;t+=6e5){
      const a=radiantAt(s.ra,s.dec,t,lat,lon).alt;
      top=Math.max(top,a);
      if(a<20) continue;
      if(from==null) from=t; to=t; n++;
      if(lookAt('moon',t,lat,lon).alt>0) moonUp++;
    }
    const illum=moonInfo((dark0+dark1)/2).illum;
    out.push({s, day, ahead, from, to, top, moon:illum, moonUp:n>0&&moonUp/n>0.5,
      rate:Math.max(1,Math.round(s.zhr*sind(Math.max(top,0))/5)*5)});
  }
  return out.sort((a,b)=>a.ahead-b.ahead);
}
/* Eclipses seen from Phuket and Khao Lak, 2026-2036. Computed with the
   astronomy-engine library on 6 Oct 2026; extend the table before it runs out.
   k: sp partial solar, lp partial lunar, lt total lunar. t: maximum, UTC.
   a, b: local start and end of the partial phase. v: share covered at most.
   alt: height of the Sun or Moon at maximum; below zero means it is seen only
   near the horizon, while rising or setting. */
const ECLIPSES=[
 {k:'sp',t:'2027-08-02T11:32Z',a:'17:50',b:'19:11',v:0.26,alt:3},
 {k:'lp',t:'2028-07-06T18:19Z',a:'00:08',b:'02:30',v:0.33,alt:56},
 {k:'sp',t:'2028-07-22T01:33Z',a:'07:36',b:'09:37',v:0.33,alt:31},
 {k:'lt',t:'2028-12-31T16:51Z',a:'22:07',b:'01:36',v:1,alt:72},
 {k:'lt',t:'2029-12-20T22:41Z',a:'03:54',b:'07:28',v:1,alt:12},
 {k:'lp',t:'2030-06-15T18:33Z',a:'00:20',b:'02:45',v:0.47,alt:55},
 {k:'sp',t:'2031-05-21T08:40Z',a:'13:49',b:'17:07',v:0.9,alt:41},
 {k:'lt',t:'2032-04-25T15:13Z',a:'20:27',b:'23:59',v:1,alt:50},
 {k:'lt',t:'2032-10-18T19:02Z',a:'00:24',b:'03:40',v:1,alt:62},
 {k:'lt',t:'2033-04-14T19:12Z',a:'00:24',b:'04:00',v:1,alt:58},
 {k:'lt',t:'2033-10-08T10:55Z',a:'16:13',b:'19:36',v:1,alt:-4},
 {k:'sp',t:'2034-03-20T12:00Z',a:'18:31',b:'19:27',v:0.07,alt:-6},
 {k:'lt',t:'2036-02-11T22:11Z',a:'03:30',b:'06:53',v:1,alt:22}
];
const nextEclipse=ms=>ECLIPSES.find(e=>Date.parse(e.t)>ms-3*36e5)||null;

/* ===== Sunset score =====
   A first estimate, to be tuned against what the sky really did, the way TUNE
   in core.js is tuned against sessions. What makes a sunset:
   canvas : mid and high cloud catches red light from below. No cloud is a
            clean but plain sunset, a broken layer is the best, a solid sheet
            can go either way.
   window : that light comes in almost flat from far out west, so low cloud
            180-420 km out along the sunset direction shuts it off.
   lid    : low cloud right overhead hides the show.
   rain, haze : both wash the colour out.
   disc   : small share for simply seeing the sun reach the sea.           */
const SUNSET_TUNE={
  canvas:{clear:0.45, from:35, to:85, sheet:0.75},
  window:{low:0.9, mid:0.3, rain:0.5, shut:0.15},
  lid:{power:1.5, loss:0.9},
  rain:[[2,0.25],[0.3,0.6]],
  haze:{from:0.4, to:1.0, loss:0.4},
  disc:0.15,
  grades:[
    {min:7, key:'ssBright', color:'var(--go)'},
    {min:4, key:'ssFair',   color:'var(--fair)'},
    {min:-1,key:'ssDull',   color:'var(--no)'}
  ]
};
const sunsetGrade=v=>SUNSET_TUNE.grades.find(g=>shown(v)>=g.min)||SUNSET_TUNE.grades[2];
/* Open-Meteo models asked for weather and for cloud at sunset. MET Norway is
   added as a separate provider. Far-west cloud is asked from three of them. */
const SKY_MODELS=['ecmwf_ifs025','gfs_seamless','icon_seamless','jma_seamless','gem_seamless','ukmo_seamless'];
const SKY_WEST_MODELS=['ecmwf_ifs025','gfs_seamless','icon_seamless'];
const SKY_WEST_KM=[80,180,300,420];
const destPoint=(lat,lon,az,km)=>[lat+km*cosd(az)/111.19, lon+km*sind(az)/(111.19*cosd(lat))];

/* x: cloud by layer over the coast (low, mid, high, %), rain there (mm/h),
   low cloud 80 km out (nearLow), low and mid cloud and rain farther west
   (wLow, wMid, wRain), aerosol depth (aod). Score 0..10 and the one thing
   that decides it. */
function sunsetScore(x){
  const T=SUNSET_TUNE, n=v=>(v??0)/100, hm=Math.max(x.high??0,x.mid??0);
  const canvas=hm<=T.canvas.from?T.canvas.clear+(1-T.canvas.clear)*hm/T.canvas.from
    :hm<=T.canvas.to?1:1-(1-T.canvas.sheet)*(hm-T.canvas.to)/(100-T.canvas.to);
  let open=1-clamp(n(x.wLow)*T.window.low+n(x.wMid)*T.window.mid,0,1);
  if((x.wRain??0)>=0.5) open*=T.window.rain;
  const lid=1-Math.pow(n(x.low),T.lid.power)*T.lid.loss;
  const rainF=(T.rain.find(([mm])=>(x.rain??0)>=mm)||[0,1])[1];
  const hazeF=x.aod==null?1:1-clamp((x.aod-T.haze.from)/(T.haze.to-T.haze.from),0,1)*T.haze.loss;
  const disc=1-Math.max(n(x.low),n(x.nearLow));
  const glow=open*canvas+(1-open)*T.window.shut;
  const score=clamp(10*lid*rainF*hazeF*((1-T.disc)*glow+T.disc*disc),0,10);
  const key=rainF<1?'ssRain':(x.low??0)>=70?'ssLid':open<0.4?'ssShut':hazeF<0.8?'ssHaze'
    :hm<20?'ssClear':hm>90?'ssSheet':open<0.7?'ssGap':'ssFire';
  return {score, key, canvas, open, lid, disc};
}
/* Hourly series at a moment, linear between the two hours around it. */
function hourlyAt(h,key,ms){
  const a=h&&h[key]; if(!a) return null;
  const x=(ms-localMs(h.time[0]))/36e5, i=Math.floor(x);
  if(i<0||i>=a.length) return null;
  const v0=a[i], v1=a[Math.min(i+1,a.length-1)];
  return v0==null?v1:v1==null?v0:v0+(v1-v0)*(x-i);
}
/* Rain around a moment: Open-Meteo gives each hour's sum at its end, so the
   hour before and the hour that contains the moment. */
function rainAt(h,key,ms){
  const a=h&&h[key]; if(!a) return null;
  const i=Math.floor((ms-localMs(h.time[0]))/36e5);
  return avg([a[i],a[i+1]]);
}
/* MET Norway step nearest to a moment, if within 3.5 hours. */
function metAt(met,ms){
  const ts=met&&met.properties&&met.properties.timeseries; if(!ts) return null;
  let best=null, bd=3.5*36e5;
  for(const p of ts){ const d=Math.abs(Date.parse(p.time)-ms); if(d<bd){ bd=d; best=p; } }
  if(!best) return null;
  const d=best.data.instant.details, n1=best.data.next_1_hours, n6=best.data.next_6_hours;
  if(d.cloud_area_fraction_low==null) return null;
  return {low:d.cloud_area_fraction_low, mid:d.cloud_area_fraction_medium, high:d.cloud_area_fraction_high,
    rain:n1&&n1.details?n1.details.precipitation_amount:n6&&n6.details?n6.details.precipitation_amount/6:null};
}
/* Sunset forecast for n days from local day `from`. sky = {om, west, air, met,
   metWest} as loaded by the page; any part may be missing. Every model is scored by
   itself, the number shown is the median, the spread says how sure it is. */
function sunsetForecast(sky,lat,lon,from,n=7){
  const out=[], h=sky.om&&sky.om.hourly, W=sky.west;
  for(let k=0;k<n;k++){
    const day=dayOf(localMs(from)+k*864e5+432e5), sun=sunsetOf(day,lat,lon), t=sun.t;
    // far-west cloud: per model where asked, the median for the rest
    const west={};
    if(W&&W.length===SKY_WEST_KM.length) for(const m of SKY_WEST_MODELS){
      const at=(i,v)=>hourlyAt(W[i].hourly,v+'_'+m,t);
      const far=v=>avg([1,2,3].map(i=>at(i,v)));
      const w={nearLow:at(0,'cloud_cover_low'), wLow:far('cloud_cover_low'), wMid:far('cloud_cover_mid'),
        wRain:avg([0,1].map(i=>rainAt(W[i].hourly,'precipitation_'+m,t)))};
      if(w.wLow!=null) west[m]=w;
    }
    const wl=Object.values(west), wk=f=>median(wl.map(f));
    let wMed=wl.length?{nearLow:wk(x=>x.nearLow), wLow:wk(x=>x.wLow), wMid:wk(x=>x.wMid), wRain:wk(x=>x.wRain)}:{};
    // Open-Meteo silent: the same points from MET Norway, asked only in that case
    if(!wl.length&&sky.metWest){
      const mw=sky.metWest.map(x=>metAt(x,t)), far=mw.slice(1);
      if(far.some(Boolean)) wMed={nearLow:mw[0]?mw[0].low:null, wLow:avg(far.map(x=>x&&x.low)),
        wMid:avg(far.map(x=>x&&x.mid)), wRain:avg(mw.slice(0,2).map(x=>x&&x.rain))};
    }
    const aod=sky.air?hourlyAt(sky.air.hourly,'aerosol_optical_depth',t):null;
    const models=[];
    if(h) for(const m of SKY_MODELS){
      const low=hourlyAt(h,'cloud_cover_low_'+m,t);
      if(low==null) continue;
      const x={low, mid:hourlyAt(h,'cloud_cover_mid_'+m,t), high:hourlyAt(h,'cloud_cover_high_'+m,t),
        rain:rainAt(h,'precipitation_'+m,t), aod, ...(west[m]||wMed)};
      models.push({m, ...x, ...sunsetScore(x)});
    }
    const mn=metAt(sky.met,t);
    if(mn){ const x={...mn, aod, ...wMed}; models.push({m:'metno', ...x, ...sunsetScore(x)}); }
    if(!models.length){ out.push({...sun, models, score:null}); continue; }
    const md=f=>median(models.map(f));
    const mid={low:md(x=>x.low), mid:md(x=>x.mid), high:md(x=>x.high), rain:md(x=>x.rain), aod, ...wMed};
    const sc=models.map(x=>x.score), score=median(sc);
    // the sentence comes from the model nearest the median, so words and number agree
    const near=models.reduce((a,b)=>Math.abs(b.score-score)<Math.abs(a.score-score)?b:a);
    out.push({...sun, models, west:wMed, hasWest:wMed.wLow!=null, aod, inputs:mid,
      score, lo:Math.min(...sc), hi:Math.max(...sc), key:near.key});
  }
  return out;
}

/* ===== Weather from several models ===== */
/* dry   : under this much rain in daylight (mm) and no more than dryHours
           wet hours, the day counts as dry.
   rain  : from this much, or more than rainHours wet hours, it is a rainy day.
   storm : heavy rain. Between dry and rain it is "short showers".
   wet   : an hour counts as wet from this much rain, mm. Global models
           drizzle through half the day in the tropics; 0.5 keeps that out.
   sunny, partly : share of daylight with sun for the dry-day words.     */
const WX_TUNE={dry:1, dryHours:1, rain:5, rainHours:2, storm:30, wet:0.5, sunny:0.6, partly:0.3};
function dayKind(mm,hrs,sunH,cloud,light){
  if(mm==null) return null;
  // judged on the numbers as shown, so equal rows never get different words
  const W=WX_TUNE; mm=Math.round(mm); hrs=Math.round(hrs??0);
  if(mm>=W.storm) return 'storm';
  if(mm>=W.rain||hrs>W.rainHours) return 'rain';
  if(mm>=W.dry||hrs>W.dryHours) return 'shower';
  const s=sunH!=null?sunH/light:cloud!=null?1-cloud/100:0.5;
  return s>=W.sunny?'sun':s>=W.partly?'part':'cloud';
}
const isDryKind=k=>k==='sun'||k==='part'||k==='cloud';
/* One model, one local day, daylight hours from..to. */
function omDay(h,m,day,from,to){
  const col=n=>h[n+'_'+m], T=col('temperature_2m'), P=col('precipitation');
  const i0=h.time.indexOf(day+'T00:00');
  if(!T||!P||i0<0) return null;
  const idx=[]; for(let k=from+1;k<=to;k++) idx.push(i0+k);   // hours ending 07..18
  const ok=idx.filter(i=>P[i]!=null&&T[i]!=null);
  if(ok.length<idx.length*0.8) return null;
  const all=[]; for(let k=0;k<24;k++) if(T[i0+k]!=null) all.push(T[i0+k]);
  const pick=n=>{ const a=col(n); return a?ok.map(i=>a[i]).filter(v=>v!=null):[]; };
  const mx=a=>a.length?Math.max(...a):null, sun=pick('sunshine_duration');
  return {tMax:mx(all), tMin:Math.min(...all), rain:ok.reduce((s,i)=>s+P[i],0),
    rainH:ok.filter(i=>P[i]>=WX_TUNE.wet).length, wind:mx(pick('wind_speed_10m')),
    wdir:circMean(pick('wind_direction_10m')), gust:mx(pick('wind_gusts_10m')), cloud:avg(pick('cloud_cover')),
    sunH:sun.length>=ok.length*0.8?sun.reduce((s,v)=>s+v,0)/3600:null, hours:idx.map(i=>P[i]??null)};
}
/* MET Norway, same shape. It is hourly for two days and six-hourly after,
   so wet hours are known only for the near days. */
function metDay(met,day,from,to){
  const ts=met&&met.properties&&met.properties.timeseries; if(!ts) return null;
  let rain=0, rainH=0, hourly=true, n=0; const T=[], W=[], D=[], C=[];
  for(const p of ts){
    const s=localStr(Date.parse(p.time)); if(s.slice(0,10)!==day) continue;
    const hh=+s.slice(11,13), d=p.data.instant.details, n1=p.data.next_1_hours, n6=p.data.next_6_hours;
    T.push(d.air_temperature);
    if(hh<from||hh>=to) continue;
    n++; W.push(d.wind_speed); D.push(d.wind_from_direction); C.push(d.cloud_area_fraction);
    if(n1&&n1.details){ const a=n1.details.precipitation_amount??0; rain+=a; if(a>=WX_TUNE.wet) rainH++; }
    else if(n6&&n6.details){ rain+=n6.details.precipitation_amount??0; hourly=false; }
  }
  // a day that has already begun, or the cut-off at the end of the run
  if(n<(hourly?10:2)) return null;
  return {tMax:Math.max(...T), tMin:Math.min(...T), rain, rainH:hourly?rainH:null, wind:Math.max(...W),
    wdir:circMean(D), gust:null, cloud:avg(C), sunH:null, hours:null};
}
/* wttr.in, which serves World Weather Online data: three days in 3-hour
   blocks, so wet hours are unknown. A provider of its own, no model shared
   with Open-Meteo or MET Norway. */
function wttrDay(wt,day,from,to){
  const d=wt&&wt.weather&&wt.weather.find(x=>x.date===day); if(!d||!d.hourly) return null;
  const hrs=d.hourly.filter(h=>{ const hh=+h.time/100; return hh>=from&&hh<to; });
  if(hrs.length<3) return null;
  const num=k=>hrs.map(h=>+h[k]).filter(v=>!isNaN(v)), mx=a=>a.length?Math.max(...a):null;
  const wind=mx(num('windspeedKmph')), gust=mx(num('WindGustKmph')), sun=+d.sunHour;
  return {tMax:+d.maxtempC, tMin:+d.mintempC, rain:num('precipMM').reduce((s,v)=>s+v,0), rainH:null,
    wind:wind==null?null:wind/3.6, wdir:circMean(num('winddirDegree')), gust:gust==null?null:gust/3.6,
    cloud:avg(num('cloudcover')), sunH:isNaN(sun)?null:sun, hours:null};
}
/* Days for the weather tab: every source by itself, the median of them, and
   how many sources call the day dry. */
function weatherDays(sky,reg,n=10){
  const R=REGIONS[reg], h=sky.om&&sky.om.hourly, out=[], today=dayOf(Date.now()), light=R.dayTo-R.dayFrom;
  for(let k=0;k<n;k++){
    const day=dayOf(localMs(today)+k*864e5+432e5), src={};
    if(h) for(const m of SKY_MODELS){ const d=omDay(h,m,day,R.dayFrom,R.dayTo); if(d) src[m]=d; }
    const md=metDay(sky.met,day,R.dayFrom,R.dayTo); if(md) src.metno=md;
    const wd=wttrDay(sky.wttr,day,R.dayFrom,R.dayTo); if(wd) src.wttr=wd;
    const list=Object.values(src); if(!list.length) continue;
    list.forEach(x=>x.kind=dayKind(x.rain,x.rainH,x.sunH,x.cloud,light));
    const med=f=>median(list.map(f)), rains=list.map(x=>x.rain);
    const rain=med(x=>x.rain), rainH=med(x=>x.rainH), sunH=med(x=>x.sunH), cloud=med(x=>x.cloud);
    const hrs=[]; for(let i=0;i<light;i++) hrs.push(median(list.map(x=>x.hours?x.hours[i]:null)));
    out.push({day, src, n:list.length, dry:list.filter(x=>isDryKind(x.kind)).length,
      kind:dayKind(rain,rainH,sunH,cloud,light), tMax:med(x=>x.tMax), tMin:med(x=>x.tMin),
      rain, rainLo:Math.min(...rains), rainHi:Math.max(...rains), rainH, sunH, cloud,
      wind:med(x=>x.wind), wdir:circMean(list.map(x=>x.wdir)), gust:med(x=>x.gust), hours:hrs});
  }
  return out;
}

/* ===== What a standing point sees ===== */
/* Land above the sea horizon at compass direction az, degrees, and how many
   minutes earlier the sun is gone because of it. Near the equator the sun
   drops almost straight down, about a degree in four minutes. */
const SEA_MAX=0.3, LOW_MAX=1.5;
function horizonAt(prof,az){
  const x=clamp((az-HZ.from)/HZ.step,0,prof.a.length-1), i=Math.floor(x), j=Math.min(i+1,prof.a.length-1);
  const a=prof.a[i]+(prof.a[j]-prof.a[i])*(x-i);
  return {a, km:prof.d[prof.a[j]>prof.a[i]?j:i], early:Math.round(a*4.1), st:a<SEA_MAX?0:a<LOW_MAX?1:2};
}
/* Twelve months for a point: 0 the sun sets into the sea, 1 behind low land,
   2 behind land. year = sunsetYear() for the region. */
function horizonMonths(prof,year){
  const out=[];
  for(let m=1;m<=12;m++){
    const st=year.filter(y=>y.m===m).map(y=>horizonAt(prof,y.az).st).sort();
    out.push(st[1]);                                  // the middle of three dates
  }
  return out;
}
