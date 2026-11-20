// offline.js: registra il service worker (sw.js) e, una volta aperto il menu, salva in sottofondo tutto il gioco (lottatori, mosse finali, suoni).
// Dopo il primo salvataggio completo il gioco si apre e si gioca anche senza internet (tranne la partita online). Nel menu c'è una riga con lo stato.
(function(){const ok='serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1');
 const line=t=>{let e=document.getElementById('offl');const h=document.getElementById('home');if(!h)return;if(!e){e=document.createElement('div');e.id='offl';h.append(e)}e.textContent=t};
 if(!ok||window.__test){return}
 let asked=false;
 navigator.serviceWorker.addEventListener('message',e=>{const d=e.data||{};if(d.t==='prog'&&d.tot)line(d.done>=d.tot?'Gioco salvato: funziona anche offline ✓':'Salvo il gioco per giocare offline… '+Math.round(d.done/d.tot*100)+'%');if(d.t==='fine')line(d.done>=d.tot?'Gioco salvato: funziona anche offline ✓':'Salvataggio offline incompleto: riapri il gioco con internet per finire')});
 const go=async()=>{if(asked)return;asked=true;try{const r=await navigator.serviceWorker.ready;const w=r.active;if(w)w.postMessage({t:'tutto'})}catch(x){}};
 navigator.serviceWorker.register('sw.js').then(()=>{(window.requestIdleCallback||(f=>setTimeout(f,3000)))(()=>setTimeout(go,2500),{timeout:8000})}).catch(()=>{});
 addEventListener('offline',()=>line('Sei offline: puoi giocare contro la CPU o in due (online non disponibile)'));
})();
