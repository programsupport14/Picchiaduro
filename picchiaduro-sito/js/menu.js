// menu.js: schermata iniziale (logo 3D su sfondo di fiamme, menu da picchiaduro) e pannello "Comandi" per cambiare tasti e pulsanti.
// Solo interfaccia: non tocca la logica della partita.
const HOME={open:false,cfg:false,panel:'main',cur:0,items:[],t:0,pad:{},rep:0,sc:null,wait:null};
const AZIONI=[['left','Sinistra'],['right','Destra'],['up','Salto'],['down','Giù'],['jab','Pugno rapido'],['cross','Montante sinistro'],['kick','Calcio'],['special','Calcio basso'],['block','Parata'],['reset','Ricomincia'],['spartan','Calcio spartano (rompe la parata)'],['fat','Accoppalo (insieme a Pugno rapido)']];
const PADN=['X','Cerchio','Quadrato','Triangolo','L1','R1','L2','R2','Share','Options','L3','R3','Croce su','Croce giù','Croce sinistra','Croce destra','PS','Touchpad'];
const keyName=c=>!c?'—':({Space:'Spazio',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Enter:'Invio',ShiftLeft:'Maiusc sin.',ShiftRight:'Maiusc des.',ControlLeft:'Ctrl sin.',ControlRight:'Ctrl des.',AltLeft:'Alt',AltRight:'Alt Gr',Backspace:'Backspace',Tab:'Tab',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Minus:'-',Equal:'=',Backquote:'`',Backslash:'\\'})[c]||c.replace(/^Key/,'').replace(/^Digit/,'').replace(/^Numpad/,'Tn ');
const padBtnName=n=>PADN[n]||('Pulsante '+n);
// ---------- menu ----------
function homeItems(){const P=HOME.panel;
 if(P==='fat')return[...(typeof FAT_INFO!=='undefined'?Object.entries(FAT_INFO).map(([k,[n,d]])=>({t:n,s:d,k,fn:()=>homeFat(k)})):[]),{t:typeof heartNames==='function'?heartNames():'Gli altri',s:'il cuore strappato',fn:()=>homeFat('heart')},{t:'Indietro',back:1,fn:()=>homePanel('main')}];
 if(P==='online')return[{t:'Crea partita',s:'ricevi un codice da mandare al tuo amico',fn:()=>{hostGame()}},{t:'Entra con codice',s:'scrivi qui sotto il codice ricevuto',fn:()=>{const v=$('hcode').value.trim();if(v.length!==5){$('hcode').focus();setOnline('Il codice ha 5 lettere.');return}$('code').value=v;joinGame()}},{t:'Cambia lottatore',s:'',fn:()=>{mode='online';closeHome();openSel()}},{t:'Indietro',back:1,fn:()=>homePanel('main')}];
 return[{t:'Combatti',s:'contro la CPU, o in due con due controller',fn:()=>homeGo('cpu')},...(typeof fsToggle==='function'&&(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)?[{t:fsLabel(),s:'anche col tasto ⛶ o doppio clic',fn:()=>{fsToggle();setTimeout(homeDraw,300)}}]:[]),{t:'Online',s:'sfida un amico con un codice',fn:()=>{if(net)return;homePanel('online')}},{t:'Accoppalo',s:'guarda le mosse finali',fn:()=>homePanel('fat')},{t:'Difficoltà',s:'CPU: '+CPUL[CPULV].n+' · premi per cambiare',fn:()=>{setCpuLevel((CPULV+1)%CPUL.length);homeDraw()}},{t:'Comandi',s:'cambia tasti e pulsanti',fn:()=>openCfg()}]}
function homeDraw(){const m=$('hmenu');m.textContent='';HOME.items=homeItems();HOME.cur=Math.max(0,Math.min(HOME.items.length-1,HOME.cur));m.className=HOME.panel==='fat'?'two':'';
 HOME.items.forEach((it,i)=>{const b=document.createElement('button');b.className='hi'+(i===HOME.cur?' on':'')+(it.back?' back':'');const a=document.createElement('b');a.textContent=it.t;b.append(a);if(it.s){const s=document.createElement('span');s.textContent=it.s;b.append(s)}b.onmouseenter=()=>{if(HOME.cur!==i){HOME.cur=i;homeMark()}};b.onclick=()=>{HOME.cur=i;homeOk()};m.append(b)});
 $('honline').hidden=HOME.panel!=='online';$('hsub').textContent=HOME.panel==='fat'?'Accoppalo':HOME.panel==='online'?'Online':''}
function homeMark(){document.querySelectorAll('#hmenu .hi').forEach((b,i)=>b.classList.toggle('on',i===HOME.cur));const it=HOME.items&&HOME.items[HOME.cur];if(HOME.panel==='fat'&&it&&it.k&&typeof fatPrefetch==='function')fatPrefetch(it.k)}
function homePanel(p){HOME.panel=p;HOME.cur=0;homeDraw();sfx('ui_ok')}
function homeMove(d){const n=HOME.items.length;HOME.cur=(HOME.cur+d+n)%n;homeMark();sfx('ui_muovi')}
function homeOk(){wake();const it=HOME.items[HOME.cur];if(!it)return;sfx('ui_ok');it.fn()}
function homeBack(){if(HOME.panel!=='main'){homePanel('main');return}if(p1&&!net){sfx('ui_no');closeHome()}}
function homeGo(m){if(net)return;mode=m;closeHome();openSel()}
async function homeFat(k){if(net||loading)return;closeHome();try{await watchFat(k)}catch(e){}}
function openHome(panel){if(net)return;if(SEL.open)closeSel();HOME.open=true;HOME.still=null;HOME.panel=panel||'main';HOME.cur=0;HOME.pad={x:1,c:1,s:1,dir:1};$('home').hidden=false;homeFigs();homeDraw();if(typeof g!=='undefined'){g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,g.canvas.width,g.canvas.height);gh.setTransform(1,0,0,1,0,0);gh.clearRect(0,0,gh.canvas.width,gh.canvas.height);HUDSIG=''}$('wrap').scrollIntoView({block:'nearest'})}
function closeHome(){HOME.open=false;$('home').hidden=true;if(typeof titClear==='function'&&TIT.scene)titClear()}
function homeFigs(){const box=$('hfig');if(box.dataset.ok||typeof ROSTER==='undefined'||!ROSTER.length)return;box.dataset.ok=1;const L=ROSTER.filter(e=>e&&e.id&&!e.bloccato&&e.figura),n=L.length,pos=[[-2,.86,3],[101,.86,3],[9,.74,2],[90,.74,2],[19,.64,1],[80,.64,1],[27,.56,0],[72,.56,0]];
 L.slice(0,8).forEach((e,i)=>{const im=new Image(),p=pos[i];im.alt='';im.src=fdir(e)+e.figura;im.style.left=p[0]+'%';im.style.height=(p[1]*100)+'%';im.style.zIndex=p[2];im.style.animationDelay=(.08*i)+'s';if(p[0]>50)im.classList.add('r');im.dataset.d=p[2];box.append(im)})}
// ---------- sfondo e logo 3D (disegnati nel canvas WebGL dietro al menu) ----------
function homeInit(){if(HOME.sc)return;HOME.sc=new THREE.Scene();HOME.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 HOME.bg=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},depthTest:false,depthWrite:false,toneMapped:false,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`uniform float uT;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
  float fb(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
  void main(){vec2 p=vUv,q=vec2(p.x*1.78,p.y);float w=fb(vec2(q.x*1.3+uT*.03,q.y*1.1-uT*.25))*.5;
   float f1=fb(vec2(q.x*2.4+w,q.y*1.5-uT*.62)),f2=fb(vec2(q.x*5.+3.+w*2.,q.y*3.2-uT*1.05));
   float f=smoothstep(.28,1.05,f1*.72+f2*.34+(.5-p.y)*1.25);
   vec3 fire=mix(vec3(.32,.02,.0),vec3(1.,.33,.04),smoothstep(.1,.6,f));fire=mix(fire,vec3(1.,.82,.45),smoothstep(.7,1.,f));
   vec3 col=vec3(.035,.012,.014)+fire*f*.9;
   float sm=fb(q*1.6+vec2(uT*.04,-uT*.09));col+=vec3(.16,.035,.02)*sm*sm*(1.2-p.y*.5);
   vec2 g=(p-vec2(.5,.74))*vec2(1.25,2.7);col+=vec3(1.,.28,.05)*.5*exp(-dot(g,g)*3.2)*(.8+.2*sin(uT*1.7));
   float ray=pow(max(0.,sin(atan(g.y,g.x)*9.+uT*.25+fb(vec2(atan(g.y,g.x)*3.,uT*.1))*4.)),6.);col+=vec3(.6,.12,.02)*ray*.1*exp(-dot(g,g)*.9);
   vec2 c=p-.5;col*=1.-dot(c,c)*1.5;col*=smoothstep(0.,.5,uT*.7);gl_FragColor=vec4(col,1.);}`});
 const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),HOME.bg);q.frustumCulled=false;HOME.sc.add(q)}
// sfondo del menu fermo: la fiammella animata non c'è più, lo sfondo si disegna una volta sola (e di nuovo solo se cambia la dimensione della finestra o c'è il logo 3D)
function homeRender(){if(!renderer)return;homeInit();const cw=renderer.domElement.width,ch=renderer.domElement.height,key=cw+'x'+ch,l3=typeof TIT!=='undefined'&&TIT.cur;if(HOME.still===key&&!l3)return;HOME.still=key;HOME.bg.uniforms.uT.value=2.2;renderer.autoClear=true;renderer.setRenderTarget(null);renderer.render(HOME.sc,HOME.cam);
 if(typeof titLogo==='function'){const ok=titLogo();$('home').classList.toggle('g3',!!ok);if(ok)titRender()}}
// ---------- tastiera e controller nei menu ----------
function menuKey(e){if(HOME.cfg){e.preventDefault();cfgKey(e);return true}if(!HOME.open)return false;const k=e.code;
 if(k==='KeyW'||k==='ArrowUp'){e.preventDefault();homeMove(-1)}else if(k==='KeyS'||k==='ArrowDown'){e.preventDefault();homeMove(1)}else if(k==='KeyA'||k==='ArrowLeft'){e.preventDefault();homeMove(HOME.panel==='fat'?-1:-1)}else if(k==='KeyD'||k==='ArrowRight'){e.preventDefault();homeMove(1)}
 else if(k==='KeyJ'||k==='Enter'||k==='Space'){e.preventDefault();homeOk()}else if(k==='KeyK'||k==='Escape'||k==='Backspace'){e.preventDefault();homeBack()}return true}
function homePoll(){if(!HOME.open&&!HOME.cfg)return false;const ps=pads();padStatus(ps);const q=HOME.cfg&&HOME.wait&&HOME.wait.pad?(ps.find(x=>x.buttons.some(y=>y.pressed))||ps[0]):padAny(ps);if(!q)return true;const b=n=>!!(q.buttons[n]&&q.buttons[n].pressed),o=HOME.pad;
 if(HOME.cfg){if(HOME.wait&&HOME.wait.pad){if(!HOME.wait.arm){if(!q.buttons.some(x=>x.pressed))HOME.wait.arm=1}else{const i=q.buttons.findIndex(x=>x.pressed);if(i>=0){cfgSetPad(HOME.wait.a,i)}}}else{const c=b(1);if(c&&!o.c)closeCfg();o.c=c}return true}
 const ay=q.axes[1]||0,n={u:b(12)||ay<-.5,d:b(13)||ay>.5,x:b(0),c:b(1),s:b(9)},dir=n.u?-1:n.d?1:0;
 if(HOME.open&&ps.some(p=>p.buttons[2]&&p.buttons[2].pressed&&p.buttons[3]&&p.buttons[3].pressed))unlockCostumes();// Quadrato + Triangolo: costumi
 if(dir){if(!o.dir||--HOME.rep<=0){homeMove(dir);HOME.rep=o.dir?7:18}}if((n.x&&!o.x)||(n.s&&!o.s))homeOk();if(n.c&&!o.c)homeBack();HOME.pad=Object.assign(n,{dir:!!dir});return true}
// ---------- pannello Comandi ----------
function openCfg(){if(net)return;HOME.cfg=true;HOME.wait=null;$('cfg').hidden=false;cfgDraw();$('wrap').scrollIntoView({block:'nearest'})}
function closeCfg(){HOME.cfg=false;HOME.wait=null;$('cfg').hidden=true;drawHelp()}
function cfgDraw(){const t=$('cfgt');t.textContent='';const hd=document.createElement('div');hd.className='cr ch';for(const x of['Azione','Tasto 1','Tasto 2','Controller']){const s=document.createElement('span');s.textContent=x;hd.append(s)}t.append(hd);
 for(const[a,nome]of AZIONI){const r=document.createElement('div');r.className='cr';const s=document.createElement('span');s.textContent=nome;r.append(s);
  for(let i=0;i<2;i++){const b=document.createElement('button'),w=HOME.wait&&!HOME.wait.pad&&HOME.wait.a===a&&HOME.wait.i===i;b.textContent=w?'premi un tasto…':keyName(CFG.k[a][i]);if(w)b.className='w';b.onclick=()=>{HOME.wait={a,i};cfgDraw();b.blur()};r.append(b)}
  if(a==='spartan'){const fx=document.createElement('button');fx.disabled=true;fx.textContent=padBtnName(CFG.p.fat)+' + '+padBtnName(CFG.p.special);r.append(fx);t.append(r);continue}
  const pb=document.createElement('button'),w=HOME.wait&&HOME.wait.pad&&HOME.wait.a===a;pb.textContent=w?'premi un pulsante…':padBtnName(CFG.p[a]);if(w)pb.className='w';pb.onclick=()=>{HOME.wait={a,pad:1,arm:0};cfgDraw();pb.blur()};r.append(pb);t.append(r)}
 movesList();
 $('cfgmsg').textContent=HOME.wait?'Esc per annullare, Canc per togliere il tasto.':'Clicca su un tasto o su un pulsante per cambiarlo. Le levette muovono sempre il lottatore. I menu usano sempre W A S D, J e K (o croce, X e Cerchio).'}
// elenco di tutte le mosse con i tasti attuali (sotto la tabella dei comandi)
function moveRows(){const K=a=>CFG.k[a].map(keyName).join(' o ')||'—',Pd=a=>padBtnName(CFG.p[a]);return[
 ['Pugno rapido',K('jab'),Pd('jab')],['Montante sinistro',K('cross'),Pd('cross')],['Calcio',K('kick'),Pd('kick')],['Calcio basso',K('special')+' o giù + '+K('kick'),Pd('special')+' o giù + '+Pd('kick')],
 ['Calcio spartano (rompe la parata)',K('spartan'),Pd('fat')+' + '+Pd('special')],['Parata (tieni premuto)',K('block'),Pd('block')],['Parata bassa','giù + '+K('block'),'giù + '+Pd('block')],
 ['Raffica di pugni',K('jab')+', '+K('jab')+', '+K('cross'),Pd('jab')+', '+Pd('jab')+', '+Pd('cross')],['Ruota e calcio volante','indietro + '+K('kick'),'indietro + '+Pd('kick')],['Spazzata (bassa)','indietro + '+K('special'),'indietro + '+Pd('special')],
 ['Salto · calcio in salto',K('up')+' · in aria '+K('kick'),Pd('up')+' · in aria '+Pd('kick')],['Corsa · scatto indietro','avanti 2 volte · indietro 2 volte','avanti 2 volte · indietro 2 volte'],
 ['Accoppalo (entro 5 s da FINISCILO!)',K('fat')+' + '+K('jab'),Pd('fat')+' + '+Pd('jab')],['Ballo a fine Accoppalo',K('down'),Pd('down')],['Pausa','Esc o P','Options']]}
function movesList(){let el=$('cfgmoves');if(!el){el=document.createElement('div');el.id='cfgmoves';$('cfgt').after(el)}el.textContent='';const h=document.createElement('div');h.className='mh';h.textContent='Tutte le mosse';el.append(h);
 const tb=document.createElement('div');tb.className='mt';for(const r of[['Mossa','Tastiera','Controller'],...moveRows()])for(const[i,c]of r.entries()){const d=document.createElement('span');d.textContent=c;if(r[0]==='Mossa')d.className='th';else if(!i)d.className='mn';tb.append(d)}el.append(tb)}
function cfgKey(e){const w=HOME.wait;if(!w||w.pad){if(e.code==='Escape'){if(w){HOME.wait=null;cfgDraw()}else closeCfg()}return}
 if(e.code==='Escape'){HOME.wait=null;cfgDraw();return}if(e.code==='Delete'){if(CFG.k[w.a].length>1)CFG.k[w.a].splice(w.i,1);HOME.wait=null;cfgSave();cfgDraw();return}
 const c=e.code;if(!c||/^(Meta|OS|F\d+$)/.test(c))return;for(const a in CFG.k)CFG.k[a]=CFG.k[a].filter(x=>x!==c);const L=CFG.k[w.a];L[Math.min(w.i,L.length)]=c;CFG.k[w.a]=L.filter(Boolean).slice(0,2);HOME.wait=null;cfgSave();cfgDraw();sfx('ui_ok')}
function cfgSetPad(a,i){const old=CFG.p[a];for(const k in CFG.p)if(CFG.p[k]===i)CFG.p[k]=old;CFG.p[a]=i;HOME.wait=null;HOME.pad={c:true,x:true};cfgSave();cfgDraw();sfx('ui_ok')}
function cfgReset(){for(const a in KEYDEF){CFG.k[a]=KEYDEF[a].slice();CFG.p[a]=PADDEF[a]}HOME.wait=null;cfgSave();cfgDraw()}
// tabella dei comandi sotto il gioco: segue i tasti scelti
function drawHelp(){const K=a=>CFG.k[a].map(keyName).join(' o ')||'—',Pd=a=>padBtnName(CFG.p[a]),t=$('help');if(!t)return;const rows=[['Azione','Tastiera','Controller'],
 ['Muoversi',[K('left'),K('right')].join(' · '),Pd('left')+', '+Pd('right')+' o levetta'],['Saltare, abbassarsi',K('up')+' · '+K('down'),Pd('up')+', '+Pd('down')+' o levetta'],
 ['Corsa','due volte avanti (e tieni premuto)','due volte avanti'],['Scatto indietro','due volte indietro','due volte indietro'],
 ['Pugno rapido',K('jab'),Pd('jab')],['Montante sinistro',K('cross'),Pd('cross')],['Calcio',K('kick'),Pd('kick')],['Calcio basso',K('special')+' (o giù + '+K('kick')+')',Pd('special')+' (o giù + '+Pd('kick')+')'],['Parata',K('block'),Pd('block')],
 ['Ruota con calcio e calcio volante','indietro + '+K('kick'),'indietro (levetta o croce) + '+Pd('kick')],['Spazzata (colpo basso)','indietro + '+K('special'),'indietro (levetta o croce) + '+Pd('special')],['Raffica di pugni',K('jab')+', '+K('jab')+', '+K('cross'),Pd('jab')+', '+Pd('jab')+', '+Pd('cross')],
 ['Calcio spartano (rompe la parata)',K('spartan'),Pd('fat')+' + '+Pd('special')],['Accoppalo: dopo il K.O. del terzo round vinto, entro 5 secondi',K('fat')+' + '+K('jab'),'R2 + Quadrato'],['Pausa','Esc o P','Options (Start)'],['Ballo a fine Accoppalo',K('down'),Pd('down')],
 ['Ricomincia',K('reset'),Pd('reset')],['Nei menu: muoversi, confermare, indietro','W A S D, J o Invio, K o Esc','Croce, X, Cerchio']];
 t.textContent='';rows.forEach((r,i)=>{const tr=document.createElement('tr');for(const c of r){const d=document.createElement(i?'td':'th');d.textContent=c;tr.append(d)}t.append(tr)});
 document.querySelectorAll('#moves button[data-act] kbd').forEach(k=>{k.textContent=keyName(CFG.k[k.parentNode.dataset.act][0])})}
function buildMenu(){$('cfgclose').onclick=()=>closeCfg();$('cfgreset').onclick=()=>cfgReset();$('hjoin').onclick=()=>{HOME.cur=1;homeItems()[1].fn()};$('hcode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('hjoin').click()}});drawHelp()}

// ---------- pausa (Start / Esc) ----------
const PAUSE={open:false,cur:0,pad:{},items:[]};
function pauseItems(){return[{t:'Riprendi',fn:closePause},{t:'Cambia comandi',fn:()=>{closePause();openCfg()}},{t:typeof fsLabel==='function'?fsLabel():'Schermo intero',fn:()=>{if(typeof fsToggle==='function')fsToggle();closePause()}},{t:'Cambia lottatori',fn:()=>{if(net)return;closePause();openSel()}},{t:'Ricomincia',fn:()=>{if(net)return;closePause();latch|=BITS.reset}},{t:'Esci',fn:()=>{if(net)return;closePause();openHome()}}]}
function openPause(){if(PAUSE.open||!p1||loading||SEL.open||HOME.open||HOME.cfg)return;PAUSE.open=true;PAUSE.cur=0;PAUSE.pad={s:1,x:1,c:1};pauseDraw();$('pausa').hidden=false;sfx('ui_apri')}
function closePause(){PAUSE.open=false;$('pausa').hidden=true}
function pauseDraw(){const m=$('pmenu');m.textContent='';PAUSE.items=pauseItems();PAUSE.items.forEach((it,i)=>{const b=document.createElement('button');b.className='hi'+(i===PAUSE.cur?' on':'');const a=document.createElement('b');a.textContent=it.t;b.append(a);if(net&&i>2)b.style.opacity=.35;b.onmouseenter=()=>{PAUSE.cur=i;pauseMark()};b.onclick=()=>{PAUSE.cur=i;pauseOk()};m.append(b)})}
function pauseMark(){document.querySelectorAll('#pmenu .hi').forEach((b,i)=>b.classList.toggle('on',i===PAUSE.cur))}
function pauseOk(){const it=PAUSE.items[PAUSE.cur];if(it){sfx('ui_ok');it.fn()}}
function pausePoll(){const ps=pads(),q=padAny(ps);if(!q)return;const b=n=>!!(q.buttons[n]&&q.buttons[n].pressed),ay=q.axes[1]||0,o=PAUSE.pad,n={u:b(12)||ay<-.5,d:b(13)||ay>.5,x:b(0),c:b(1),s:b(9)};
 if(!PAUSE.open){if(n.s&&!o.s)openPause();PAUSE.pad=n;return}
 const dir=n.u?-1:n.d?1:0;if(dir&&!o.dir){PAUSE.cur=(PAUSE.cur+dir+PAUSE.items.length)%PAUSE.items.length;pauseMark();sfx('ui_muovi')}
 if(n.x&&!o.x)pauseOk();else if((n.c&&!o.c)||(n.s&&!o.s))closePause();PAUSE.pad=Object.assign(n,{dir:!!dir})}
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='Escape'||e.code==='KeyP'){if(PAUSE.open){e.preventDefault();closePause()}else if(p1&&!selOpen()){e.preventDefault();openPause()}return}
 if(!PAUSE.open)return;e.preventDefault();e.stopImmediatePropagation();if(e.code==='ArrowUp'||e.code==='KeyW'){PAUSE.cur=(PAUSE.cur+PAUSE.items.length-1)%PAUSE.items.length;pauseMark()}else if(e.code==='ArrowDown'||e.code==='KeyS'){PAUSE.cur=(PAUSE.cur+1)%PAUSE.items.length;pauseMark()}else if(e.code==='Enter'||e.code==='Space')pauseOk()},true);
