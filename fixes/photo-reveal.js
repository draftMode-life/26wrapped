const $=id=>document.getElementById(id);
let run=0, busy=false, output=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function timeout(p,ms,message){let timer;return Promise.race([p,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms)})]).finally(()=>clearTimeout(timer))}
function image(src){return timeout(new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('A photo could not be displayed. Try again.'));im.src=src}),8000,'Photo display timed out. Try again.')}
function cover(g,im,x,y,w,h){const s=Math.max(w/im.naturalWidth,h/im.naturalHeight),sw=w/s,sh=h/s;g.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,x,y,w,h)}
async function surprise(){
 if(busy)return; busy=true; const token=++run; output=null;
 $('start').disabled=true;$('again').disabled=true;
 $('landing').hidden=true;$('experience').hidden=false;$('results').hidden=true;
 $('frame').replaceChildren();$('heading').textContent='Remember this?';$('count').textContent='Finding your memories…';$('notice').textContent='';window.scrollTo(0,0);
 try{
  const bridge=window.Capacitor?.Plugins?.CameraRoll;
  if(!bridge)throw Error('Open the installed Android app.');
  const result=await timeout(bridge.randomPhotos(),90000,'Photo access timed out. Check permission in Android Settings and retry.');
  if(token!==run)return;
  if(!Array.isArray(result.photos)||result.photos.length!==12)throw Error('12 readable photos from 2026 are required.');
  const c=document.createElement('canvas');c.width=2160;c.height=2880;const g=c.getContext('2d');g.scale(2,2);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.fillStyle='#090909';g.fillRect(0,0,1080,1440);g.fillStyle='#eee';g.font='66px Georgia';g.fillText('My year. Uncurated.',42,95);g.font='22px monospace';g.fillStyle='#aaa';g.fillText('2026 / 12 RANDOM MEMORIES',44,135);
  for(let i=0;i<12;i++){
   if(token!==run)return;
   $('count').textContent='Loading memory '+(i+1)+' / 12';
   const im=await image('data:image/jpeg;base64,'+result.photos[i]);
   if(token!==run)return;
   im.alt='Random memory '+(i+1);$('frame').replaceChildren(im);
   $('count').textContent=String(i+1).padStart(2,'0')+' / 12';
   cover(g,im,42+i%3*334,175+Math.floor(i/3)*291,328,285);
   await sleep(1000);
  }
  if(token!==run)return;
  g.fillStyle='#eee';g.font='35px system-ui';g.fillText('26wrapped.',42,1392);g.fillStyle='#aaa';g.font='23px system-ui';g.textAlign='right';g.fillText('Surprise yourself.',1038,1392);
  output=c.toDataURL('image/jpeg',.96);
  const im=await image(output);if(token!==run)return;
  im.className='collage';im.alt='Your twelve-photo collage';$('frame').replaceChildren(im);$('heading').textContent='That was your year.';$('count').textContent='12 memories. One year.';$('results').hidden=false;$('notice').textContent='Check your collage before sharing.';
 }catch(e){if(token===run){$('count').textContent='Could not reveal memories.';$('notice').textContent=e.message||String(e);$('results').hidden=false;}}
 finally{busy=false;$('start').disabled=false;$('again').disabled=false;$('share').hidden=!output;}
}
$('start').onclick=surprise;$('again').onclick=surprise;
$('back').onclick=()=>{run++;output=null;$('experience').hidden=true;$('landing').hidden=false;$('frame').replaceChildren();$('status').textContent='Photos stay on your phone.'};
$('share').onclick=async()=>{if(!output)return;try{await timeout(window.Capacitor.Plugins.CameraRoll.shareCollage({data:output.split(',')[1]}),15000,'Sharing timed out.')}catch(e){$('notice').textContent=e.message||'Sharing failed.'}};
