// tocco.js: schermo intero e comandi da telefono.
// Schermo intero: voce nel menu e nella pausa, tasto ⛶ in alto a destra, doppio clic sul gioco. Su telefono si gira anche in orizzontale.
// Telefono: levetta a sinistra (si trascina col pollice), tasti PlayStation a destra (□ △ ✕ ○, R1 = parata), Start = pausa, "Mossa finale" quando compare ACCOPPALO!.
const FS={el:()=>document.documentElement,on:()=>!!(document.fullscreenElement||document.webkitFullscreenElement)};
function fsToggle(){try{if(FS.on()){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}else{const e=FS.el(),r=(e.requestFullscreen||e.webkitRequestFullscreen);if(r){const p=r.call(e,{navigationUI:'hide'});if(p&&p.then)p.then(()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(x){}}).catch(()=>{})}}}catch(x){}}
const fsLabel=()=>FS.on()?'Esci dallo schermo intero':'Schermo intero';
(function(){const wrap=document.getElementById('wrap');if(!wrap)return;
 const fb=document.createElement('button');fb.id='fsbtn';fb.title='Schermo intero';fb.textContent='⛶';fb.onclick=e=>{e.stopPropagation();fsToggle()};wrap.append(fb);
 wrap.addEventListener('dblclick',e=>{if(e.target.closest('button,input,.tocca'))return;if(typeof inLogo==='function'&&inLogo(e))return;fsToggle()});
 const sync=()=>{document.body.classList.toggle('fs',FS.on());if(typeof HOME!=='undefined'&&HOME.open&&typeof homeDraw==='function')homeDraw()};document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
 // ---- comandi a tocco (solo su schermi touch) ----
 const tc=document.createElement('div');tc.id='tc';tc.innerHTML='<div class="stick"><div class="knob"></div></div><div class="pads"><button data-k="cross" class="tri">△</button><button data-k="jab" class="sq">□</button><button data-k="special" class="ci">○</button><button data-k="kick" class="cr">✕</button></div><button data-k="spartan" class="sp">SPARTANO<br><small>R2+○</small></button><button data-k="block" class="r1">R1<br><small>parata</small></button><button data-k="start" class="st">❚❚</button><button data-k="fat" class="fat" hidden>MOSSA<br>FINALE</button>';wrap.append(tc);
 const K=k=>{if(typeof keys!=='undefined')return keys};
 tc.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;const on=e=>{e.preventDefault();e.stopPropagation();b.classList.add('on');if(typeof wake==='function')wake();
   if(k==='start'){if(typeof PAUSE!=='undefined'&&PAUSE.open)closePause();else if(typeof openPause==='function')openPause();return}
   if(k==='fat'){latch|=BITS.fat;return}demo=null;keys[k]=1;latch|=BITS[k]},off=e=>{b.classList.remove('on');if(k!=='start'&&k!=='fat')keys[k]=0};
  b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,off))});
 const ro=document.createElement('div');ro.id='ruota';ro.innerHTML='<div style="font-size:54px">📱↻</div><div>Gira il telefono in orizzontale per giocare</div><small style="opacity:.6">oppure tocca qui per continuare così</small>';ro.addEventListener('click',e=>{if(e.target.tagName!=='BUTTON')ro.remove()});const rb=document.createElement('button');rb.textContent='Schermo intero';rb.onclick=fsToggle;ro.append(rb);document.body.append(ro);
 // levetta: centro dove si appoggia il pollice, raggio 60 px
 const FT={c:0,used:1};const st=tc.querySelector('.stick'),kn=tc.querySelector('.knob');let sid=null,c0=null;
 const setDir=(x,y)=>{const m=Math.hypot(x,y),r=60,u=m>r?r/m:1;kn.style.transform=`translate(${x*u}px,${y*u}px)`;const dx=x/r,dy=y/r,now=performance.now();
  // scatto: levetta spinta di colpo da ferma a fondo corsa (entro 0,15 s), come col controller
  if(Math.abs(dx)<.3){FT.c=now;FT.used=0}else if(!FT.used&&Math.abs(dx)>.8&&now-FT.c<150){FT.used=1;latch|=dx<0?BITS.flickL:BITS.flickR}keys.left=dx<-.4?1:0;keys.right=dx>.4?1:0;keys.up=dy<-.6?1:0;keys.down=dy>.5?1:0};
 st.addEventListener('pointerdown',e=>{e.preventDefault();sid=e.pointerId;st.setPointerCapture(sid);const r=st.getBoundingClientRect();c0=[r.left+r.width/2,r.top+r.height/2];demo=null;FT.used=1;setDir(e.clientX-c0[0],e.clientY-c0[1])});
 st.addEventListener('pointermove',e=>{if(e.pointerId!==sid)return;e.preventDefault();setDir(e.clientX-c0[0],e.clientY-c0[1])});
 const up=e=>{if(e.pointerId!==sid)return;sid=null;FT.c=performance.now();FT.used=0;kn.style.transform='';keys.left=keys.right=keys.up=keys.down=0};st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
 // il tasto Mossa finale si vede solo durante ACCOPPALO!; i comandi si nascondono nei menu
 setInterval(()=>{const fin=typeof state!=='undefined'&&state==='finish';const fbt=tc.querySelector('.fat');if(fbt.hidden===fin)fbt.hidden=!fin;const menu=typeof selOpen==='function'&&selOpen();tc.classList.toggle('off',!!menu||typeof loading!=='undefined'&&loading)},120);
})();
