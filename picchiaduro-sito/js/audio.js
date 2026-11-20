// audio.js: suoni registrati a strati (suoni/<nome>.mp3, scaricati in sottofondo dopo il primo tocco) al posto di quelli sintetici. Finché non sono pronti restano i suoni sintetici.
// Tutto passa da un compressore: niente distorsione quando più colpi si sovrappongono. Solo effetti: non tocca la logica.
const AUD={buf:{},off:{},ready:false,loading:false,out:null,last:{}};
function audInit(){if(!ac||AUD.out)return;try{const c=ac.createDynamicsCompressor(),g=ac.createGain();c.threshold.value=-16;c.knee.value=12;c.ratio.value=7;c.attack.value=.002;c.release.value=.18;g.gain.value=.85;g.connect(c);c.connect(ac.destination);AUD.out=g;window.__out=g}catch(e){}}
function audLoad(){if(AUD.loading||!ac)return;AUD.loading=true;const names=[...new Set(Object.values(SMAP).filter(m=>Array.isArray(m)).flatMap(m=>m.flatMap(L=>L.s)))];let i=0;
 const one=async()=>{while(i<names.length){const k=names[i++];try{const r=await fetch('suoni/'+k+'.mp3');if(!r.ok)continue;const u=await r.arrayBuffer(),b=await new Promise((ok,ko)=>{const p=ac.decodeAudioData(u,ok,ko);if(p&&p.catch)p.catch(ko)});
   const d=b.getChannelData(0);let n=0;while(n<d.length&&Math.abs(d[n])<.02)n++;AUD.off[k]=Math.max(0,n/b.sampleRate-.003);AUD.buf[k]=b}catch(e){}}};
 (window.requestIdleCallback||(f=>setTimeout(f,200)))(()=>Promise.all([one(),one(),one(),one()]).then(()=>{AUD.ready=Object.keys(AUD.buf).length>0;if(!AUD.ready)AUD.loading=false}))}
function audPlay(n,v=1,rate=1,delay=0){const b=AUD.buf[n];if(!b||!ac)return;const s=ac.createBufferSource(),g2=ac.createGain();s.buffer=b;s.playbackRate.value=rate;g2.gain.value=v;s.connect(g2);g2.connect(AUD.out||ac.destination);s.start(ac.currentTime+delay,AUD.off[n]||0)}
const AHI=['ahi1','ahi2','ahi3','ahi4','ahi5'],PG=['pugno1','pugno2','pugno3','pugno4'],FT=['forte1','forte2','forte3'],CL=['calcio1','calcio2','calcio3'];
const SMAP={
 hit:[{s:PG,v:.85,r:[.95,1.08]},{s:AHI,v:.28,p:.3,d:.03}],hitH:[{s:FT,v:1,r:[.9,1.02]},{s:PG,v:.5,r:[.6,.7]},{s:AHI,v:.42,p:.65,d:.03}],
 kick:[{s:CL,v:.9,r:[.95,1.05]},{s:AHI,v:.28,p:.3,d:.03}],kickH:[{s:CL,v:1,r:[.82,.94]},{s:['max1'],v:.6},{s:AHI,v:.42,p:.65,d:.03}],
 block:[{s:['parata1','parata2'],v:.7,r:[.9,1.1]},{s:['stoffa1','stoffa2'],v:.5}],swing:[{s:['aria1','aria2','aria3','aria4'],v:.28,r:[.9,1.15]}],swingH:[{s:['ariona1','ariona2'],v:.4,r:[.95,1.15]},{s:['sforzo1','sforzo2'],v:.3,p:.45}],
 ko:[{s:['max1'],v:1},{s:['ossa1'],v:.4},{s:['morte1','morte2'],v:.7,d:.06},{s:['colpone'],v:.45}],thud:[{s:['tonfo'],v:.9},{s:['passo1','passo2'],v:.5}],passo:[{s:['passo1','passo2'],v:.35,r:[.9,1.1]}],
 squish:[{s:['sangue1','sangue2'],v:.7,r:[.9,1.15]}],rip:[{s:['ossa1','ossa2'],v:.85},{s:['sangue2'],v:.8},{s:['urlo1','urlo2'],v:.55,p:.8,d:.05}],drone:[],
 fuoco:[{s:['fiammata'],v:.8,r:[.7,.9]},{s:['fuoco'],v:.55}],sparo:[{s:['sparo1'],v:1},{s:['botto'],v:.9},{s:['sparo2'],v:.5,r:[.6,.7]}],
 tuono:[{s:['scarica1'],v:1},{s:['tuono'],v:1},{s:['esplo1'],v:.6},{s:['scarica2'],v:.6,d:.1}],rombo:[{s:['tuono'],v:.4,r:[.68,.8]}],scossa:[{s:['crepitio','zap'],v:.4,r:[.8,1.3]}],
 click:[{s:['ui_no'],v:.4,r:[1.2,1.4]}],legno:[{s:['tonfo'],v:.35,r:[1.5,1.9]}],esplosione:[{s:['esplo1','esplo2'],v:1},{s:['boato'],v:.9},{s:['sangue1'],v:.8,d:.05},{s:['ossa2'],v:.6}],
 schianto:[{s:['cannone'],v:1},{s:['esplo1'],v:.9},{s:['metallo2'],v:.9},{s:['lamiera'],v:.8,d:.09},{s:['vetro1'],v:.8,d:.05},{s:['vetro2'],v:.6,d:.2},{s:['boato'],v:.85},{s:['ossa1'],v:.5,d:.02}],
 grido:[{s:['urlolungo'],v:1.4,r:[.8,.84]},{s:['urlo1','urlo2'],v:1,r:[.68,.74],d:.04},{s:['ariona1','ariona2'],v:.6,r:[.45,.5]},{s:['scarica1'],v:.3,r:[.5,.6]}], rutto:[{s:['rutto'],v:1.8},{s:['rutto'],v:.7,r:[.8,.82],d:.015}],lattina:[{s:['lattina'],v:.7}],sorso:[{s:['sorso'],v:.6,r:[.9,1.1]}], telefono:[{s:['telefono'],v:.7}],urlo:[{s:['urlo1','urlo2'],v:.75}],urlolungo:[{s:['urlolungo'],v:.75}],risata:[{s:['risata'],v:.5,r:[.8,.86]}],lama:[{s:['lama','lama2'],v:.5,r:[1,1.2]}],taglio:[{s:['raschio'],v:.5},{s:['sangue1'],v:.6}],
 titolo:[{s:['incudine'],v:.8,r:[.7,.8]},{s:['colpone'],v:.6},{s:['esplo2'],v:.35}],titolo2:[{s:['colpone2'],v:.7},{s:['metallo1'],v:.6,r:[.6,.7]}],titolo3:[{s:['colpone'],v:.8,r:[.8,.85]},{s:['sangue1'],v:.7},{s:['lama2'],v:.4,r:[.5,.6]}],lettera:[{s:['metallo1','incudine'],v:.4,r:[1,1.5]}],
 ui_ok:[{s:['ui_ok'],v:.6}],ui_no:[{s:['ui_no'],v:.5}],ui_muovi:[{s:['ui_muovi'],v:.35,r:[1,1.1]}],ui_apri:[{s:['ui_apri'],v:.6}],vs:[{s:['colpone2'],v:.8},{s:['incudine'],v:.7,r:[.6,.65]},{s:['rullante'],v:.5}],
 vetro:[{s:['vetro1','vetro2'],v:.7}],portiera:[{s:['portiera'],v:.6}],sforzo:[{s:['sforzo1','sforzo2'],v:.35}],ossa:[{s:['ossa1','ossa2'],v:.7}],
 stoffa:[{s:['stoffa1','stoffa2'],v:.55}],battito:[{s:['tonfo'],v:.6,r:[.5,.56]},{s:['tonfo'],v:.42,r:[.62,.68],d:.15}],lamiera:[{s:['lamiera'],v:.7},{s:['metallo2'],v:.4,r:[.6,.7]}],
 sgommata:[{s:['raschio'],v:.7,r:[.5,.62]},{s:['ariona1','ariona2'],v:.4,r:[.6,.7]}],sfrigolio:[{s:['fuoco'],v:.5,r:[1.5,1.9]},{s:['crepitio'],v:.4,r:[1.1,1.4]}],manette:[{s:['metallo1'],v:.5,r:[1.7,2]},{s:['ui_no'],v:.35,r:[1.5,1.7]}],tappo:[{s:['ui_no'],v:.6,r:[.55,.65]}],
 campana:[{s:['campana'],v:.9}],coro:[{s:['coro'],v:.55}],
 fischio(){ton(.95,2100,240,.24,'sine');nz(.95,900,.8,.13)},crepita:null};
const _sfxSynth=sfx;
sfx=function(k){if(!ac||ac.state!=='running')return;const now=ac.currentTime;if(AUD.last[k]!==undefined&&now-AUD.last[k]<.03)return;AUD.last[k]=now;
 const m=SMAP[k];if(typeof m==='function'){try{m()}catch(e){}return}
 if(AUD.ready&&m){for(const L of m){if(L.p&&Math.random()>L.p)continue;const n=L.s[(Math.random()*L.s.length)|0],r=L.r?L.r[0]+Math.random()*(L.r[1]-L.r[0]):1;audPlay(n,L.v,r,L.d||0)}return}
 if(k==='drone')return;const fb={campana:'block',coro:'drone',kick:'hit',kickH:'hitH',swingH:'swing',esplosione:'ko',schianto:'ko',titolo:'hitH',titolo2:'thud',titolo3:'thud',taglio:'squish',ossa:'rip',vs:'hitH',sparo:'hitH',tuono:'ko',rombo:'thud',scossa:'crepita',click:'block',legno:'thud',lama:'block',portiera:'thud',vetro:'block',passo:'thud',lettera:'block',sgommata:'thud',sfrigolio:'crepita',manette:'block',tappo:'block'}[k]||k;_sfxSynth(fb)};
const _wakeOld=wake;wake=function(){_wakeOld();audInit();if(!window.__test)audLoad()};
