(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  function createInitialChapterRestore(){
    const initialHash=location.hash;
    const allowed=new Set(['#opening','#world-picturebook','#people','#works','#message']);
    if(!allowed.has(initialHash))return {restore:()=>false,cancel:()=>{}};
    let pending=true,finished=false;
    const cancelIntent=()=>{pending=false;};
    const cancelKey=event=>{if(!['Shift','Control','Alt','Meta'].includes(event.key))cancelIntent();};
    const bindings=[
      [document,'pointerdown',cancelIntent,{capture:true,passive:true}],
      [document,'wheel',cancelIntent,{capture:true,passive:true}],
      [document,'touchstart',cancelIntent,{capture:true,passive:true}],
      [document,'keydown',cancelKey,{capture:true}],
      [window,'hashchange',cancelIntent,{}],
      [window,'popstate',cancelIntent,{}]
    ];
    for(const [target,type,listener,options] of bindings)target.addEventListener(type,listener,options);
    const cleanup=()=>{for(const [target,type,listener,options] of bindings)target.removeEventListener(type,listener,options);};
    return {
      restore(){
        if(finished)return false;finished=true;cleanup();
        if(!pending||location.hash!==initialHash)return false;
        const target=document.querySelector(initialHash);if(!target)return false;
        target.scrollIntoView({behavior:'instant',block:'start'});
        return true;
      },
      cancel(){pending=false;finished=true;cleanup();}
    };
  }
  const initialChapterRestore=createInitialChapterRestore();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const works = {
    sekai:{logo:'logo-sekai.webp',scene:'scene-coast.webp',sprite:'sprite-shinku.webp',label:'五彩斑斓的世界',video:'いろとりどりのセカイHD ReGENERATION op.mp4'},
    hikari:{logo:'logo-hikari.webp',scene:'scene-dorm-evening.webp',sprite:'sprite-kyou.webp',label:'五彩斑斓的曙光',video:'いろとりどりのヒカリ HD ReGENERATION op.mp4'},
    akaseka:{logo:'logo-akaseka.webp',scene:'scene-coast-evening.webp',sprite:'sprite-shinku.webp',label:'映入红瞳的世界',video:'紅い瞳に映るセカイ HD ReGENERATION op.mp4'}
  };
  let content, voices, currentWork='sekai', currentChapter='opening', currentBook=0, currentPerson='shinku';
  let requestedBook=0, requestedPerson='shinku';
  let sceneVersion=0, themeVersion=0, personVersion=0, bookVersion=0;
  let bookHasContent=false, personHasContent=false;
  let sceneFile='scene-coast.webp', sceneLayer=0, personSceneLayer=0;
  const themeDwell=5000;
  let nextThemeAt=performance.now()+themeDwell, themePending=false, themeTimer, themeCycleVersion=0;
  let unlocked=false, voiceVersion=0, voicePriority=0, entryTimer, personAnimationTimer, themeAnimationTimer;
  let arrivalDone=reduced.matches;
  if(!arrivalDone){document.body.classList.add('is-entering');setTimeout(()=>{document.body.classList.remove('is-entering');arrivalDone=true;nextThemeAt=performance.now()+themeDwell;document.body.dataset.arrival='complete';syncCycle();},2850);}
  else document.body.dataset.arrival='reduced';
  const ambient = $('.ambient-feathers');
  for(let i=0;i<16;i++){
    const feather=document.createElement('img');feather.className='falling-feather';
    feather.src='/favorite/assets/falling-feather.png';feather.alt='';
    const values={'x':((i*43+9)%100)+'vw','size':(15+(i*7)%24)+'px','duration':(19+(i*3)%15)+'s','delay':(-i*2.4)+'s','drift':((i%2?1:-1)*(35+i*9))+'px','turn':(i%2?85:-65)+'deg'};
    for(const [key,value] of Object.entries(values))feather.style.setProperty('--feather-'+key,value);
    ambient.append(feather);
  }
  const voiceCooldown = new Map(), visited = new Set();
  const audio = document.createElement('audio');
  audio.preload='none'; audio.id='context-audio'; audio.dataset.state='idle';
  document.body.append(audio);
  function preload(src) { return new Promise((resolve,reject) => { const img=new Image();img.onload=resolve;img.onerror=reject;img.src=src; }); }
  async function setScene(file) {
    const version=++sceneVersion;
    if(file===sceneFile) return;
    try { await preload('/favorite/assets/'+file); } catch { return; }
    if(version!==sceneVersion) return;
    sceneFile=file;const layers=$$('.scene');sceneLayer=1-sceneLayer;
    layers[sceneLayer].src='/favorite/assets/'+file;
    layers[sceneLayer].classList.add('is-visible'); layers[1-sceneLayer].classList.remove('is-visible');
    document.body.dataset.scene=file;
  }
  function canCycle(){return arrivalDone&&currentChapter==='opening'&&!document.hidden&&!$('#opening-dialog').open;}
  function scheduleThemeCycle(){
    clearTimeout(themeTimer);themeTimer=undefined;
    if(!canCycle()||themePending)return;
    const remaining=Math.max(0,nextThemeAt-performance.now());
    document.body.dataset.cycleRemainingMs=String(Math.round(remaining));
    themeTimer=setTimeout(advanceThemeCycle,remaining);
  }
  async function advanceThemeCycle(){
    themeTimer=undefined;
    if(!canCycle()||themePending)return;
    if(performance.now()<nextThemeAt){scheduleThemeCycle();return;}
    const cycle=++themeCycleVersion,keys=Object.keys(works);themePending=true;
    let committed=false;
    try{committed=await setTheme(keys[(keys.indexOf(currentWork)+1)%keys.length]);}
    finally{
      // A paused or superseded preload cannot overwrite a new five-second window.
      if(cycle===themeCycleVersion){
        themePending=false;
        if(!committed)nextThemeAt=performance.now()+themeDwell;
        scheduleThemeCycle();
      }
    }
  }
  function syncCycle(){
    document.body.classList.toggle('cycle-paused',currentChapter!=='opening'||document.hidden||$('#opening-dialog').open);
    ambient.classList.toggle('is-paused',document.hidden||$('#opening-dialog').open||reduced.matches);
    if(!canCycle()){
      clearTimeout(themeTimer);themeTimer=undefined;
      ++themeVersion;++themeCycleVersion;themePending=false;
    }else scheduleThemeCycle();
  }
  async function setTheme(key) {
    if(!works[key])return false;
    const version=++themeVersion, work=works[key];
    try { await Promise.all([work.logo,work.sprite,work.scene].map(file=>preload('/favorite/assets/'+file))); }catch{return false;}
    if(version!==themeVersion||!canCycle())return false;
    currentWork=key;document.body.dataset.work=key;nextThemeAt=performance.now()+themeDwell;
    document.body.dataset.themeCommittedAt=String(performance.now());
    for(const img of [$('.brand img'),$('.opening-logo')]){img.src='/favorite/assets/'+work.logo;img.alt=work.label+' · 原作标志';}
    $('.opening-portrait img').src='/favorite/assets/'+work.sprite;
    $('.opening-portrait img').alt=key==='hikari'?'敷島鏡原作立绘':'二階堂真紅原作立绘';
    $('.opening-portrait').setAttribute('aria-label',key==='hikari'?'与敷島鏡相遇':'与真红相遇');
    $('.opening-line').innerHTML=key==='sekai'?'そして始まる、<br>きみとぼく、のセカイ。':key==='hikari'?'いろとりどりの<br>ヒカリ':'紅い瞳に映る<br>セカイ';
    const opening=$('.opening');clearTimeout(themeAnimationTimer);opening.classList.remove('is-theme-changing');void opening.offsetWidth;opening.classList.add('is-theme-changing');themeAnimationTimer=setTimeout(()=>opening.classList.remove('is-theme-changing'),750);
    if(currentChapter==='opening')scheduleContext('theme-'+key,650);
    if(currentChapter==='opening')setScene(work.scene);
    return true;
  }
  function stopVoice(){++voiceVersion;audio.pause();audio.removeAttribute('src');audio.load();voicePriority=0;audio.dataset.state='idle';$('.voice-caption').hidden=true;}
  function showCaption(clip){$('.voice-caption').hidden=false;$('#voice-speaker').textContent=clip.character+' · 原作原声';$('#voice-jp').textContent=clip.display_dialogue;$('#voice-cn').textContent=clip.chinese_meaning+'（本站释义）';}
  async function playVoice(key,priority=2) {
    const clip=voices?.get(key);if(!clip||!unlocked||document.hidden||$('#opening-dialog').open)return false;
    if(audio.dataset.clip===key&&!audio.paused)return false;
    if(priority<voicePriority&&!audio.paused)return false;
    const now=performance.now();if(now-(voiceCooldown.get(key)??-Infinity)<(priority===1?30000:2500))return false;
    stopVoice();const version=voiceVersion;voicePriority=priority;audio.src=clip.file;audio.volume=.6;
    audio.dataset.clip=key;audio.dataset.state='loading';
    showCaption(clip);
    try{await audio.play();if(version!==voiceVersion)return false;voiceCooldown.set(key,now);audio.dataset.state='playing';return true;}
    catch{if(version===voiceVersion){audio.dataset.state='unavailable';voicePriority=0;$('#voice-cn').textContent=clip.chinese_meaning+'（本站释义；原声暂未播放）';}return false;}
  }
  audio.addEventListener('ended',()=>{const version=voiceVersion;audio.dataset.state='ended';voicePriority=0;setTimeout(()=>{if(version===voiceVersion&&audio.ended)$('.voice-caption').hidden=true;},1700);});
  audio.addEventListener('error',()=>{if(audio.hasAttribute('src')&&audio.error){audio.dataset.state='unavailable';voicePriority=0;const clip=voices?.get(audio.dataset.clip);if(clip){showCaption(clip);$('#voice-cn').textContent=clip.chinese_meaning+'（本站释义；原声暂未播放）';}}});
  let voiceRows=[];
  const portraitVisits=new Map();
  function candidates(context,person,game){
    return voiceRows.filter(clip=>(!person||clip.person_id===person)&&(!game||clip.game===game)&&(clip.contexts||[]).includes(context));
  }
  function contextClip(context,person){
    const pool=candidates(context,person);return pool[0]?.key;
  }
  function scheduleContext(context,delay=800,person){
    clearTimeout(entryTimer);if(!unlocked||visited.has(context+(person||'')))return;
    const chapter=currentChapter;
    entryTimer=setTimeout(async()=>{
      if(currentChapter!==chapter||document.hidden||$('#opening-dialog').open)return;
      if(context==='person-entry'&&person!==currentPerson)return;
      if(context.startsWith('book-')&&context!=='book-'+content.chapters[currentBook].id)return;
      if(context.startsWith('theme-')&&context!=='theme-'+currentWork)return;
      const key=contextClip(context,person);if(!key)return;
      // A complete original line must fit the current five-second theme.
      // Late first interaction simply leaves this theme's narration for its next visit.
      if(context.startsWith('theme-')&&nextThemeAt-performance.now()<((voices.get(key)?.duration_seconds||0)*1000+250))return;
      if(!audio.paused)return;
      const played=await playVoice(key,1);if(played)visited.add(context+(person||''));
    },reduced.matches?0:delay);
  }
  function currentContext(){
    if(currentChapter==='opening')scheduleContext('theme-'+currentWork,1100);
    else if(currentChapter==='world-picturebook'&&requestedBook===currentBook)scheduleContext('book-'+content.chapters[currentBook].id,900);
    else if(currentChapter==='people'&&requestedPerson===currentPerson)scheduleContext('person-entry',900,currentPerson);
    else if(currentChapter==='message')scheduleContext('message-entry',1200);
  }
  function unlock(){if(unlocked)return;unlocked=true;document.body.dataset.audioUnlocked='true';if(content)currentContext();}
  document.addEventListener('pointerdown',unlock,{capture:true});
  document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')unlock();if(e.key==='Escape'&&!$('#opening-dialog').open)stopVoice();},{capture:true});
  function portraitEasterEgg(person,game){
    clearTimeout(entryTimer);
    const pool=candidates('portrait',person,game);if(!pool.length)return;
    const state=person+(game||'');const visit=portraitVisits.get(state)||0;portraitVisits.set(state,visit+1);
    playVoice(pool[visit%pool.length].key,3);
  }
  $('.opening-portrait').addEventListener('click',()=>portraitEasterEgg(currentWork==='hikari'?'kyou':'shinku',currentWork));
  function animate(className){document.body.classList.remove(className);requestAnimationFrame(()=>{document.body.classList.add(className);setTimeout(()=>document.body.classList.remove(className),900);});}
  async function setBook(index,explicit=false){
    if(!content)return;index=(index+content.chapters.length)%content.chapters.length;
    requestedBook=index;clearTimeout(entryTimer);
    if(explicit&&index!==currentBook)stopVoice();
    const version=++bookVersion, chapter=content.chapters[index];
    let mediaAvailable=true;
    try{await preload('/favorite/assets/'+chapter.scene);}catch{mediaAvailable=false;}
    if(version!==bookVersion)return;
    if(!mediaAvailable&&bookHasContent){
      $('#scene-caption').textContent=chapter.title+'的场景暂不可用，已保留当前记事；请再次选择该页重试。';
      document.body.dataset.bookMedia='unavailable';requestedBook=currentBook;return;
    }
    currentBook=index;$('#book-location').textContent=chapter.location;$('#book-title').textContent=chapter.title;
    $('#book-count').textContent=String(index+1).padStart(2,'0')+' / 06';$('#book-prose').innerHTML=chapter.body;
    const landscape=$('#book-landscape');landscape.alt='原作场景：'+chapter.location;
    if(mediaAvailable){landscape.src='/favorite/assets/'+chapter.scene;landscape.style.visibility='';}
    else{landscape.removeAttribute('src');landscape.style.visibility='hidden';}
    $('#book-place-jp').textContent=['風津ヶ浜','嵐山荘','地下室の時計','商人の町','最果ての古書店','涼風学園から見える風車'][index];
    $('#book-related-people').replaceChildren();
    const relatedPeople={coast:['mio','yuma'],dorm:['kana','yuma'],gate:['shinku','yuma'],market:['kana','ren','yuma'],library:['suzu','kana'],windmill:['kana','shinku','yuma']}[chapter.id];
    relatedPeople.forEach(id=>{const person=content.people.find(p=>p.id===id),link=document.createElement('a'),img=document.createElement('img'),label=document.createElement('span');link.href='#people';img.src=person.avatar;img.alt='';label.textContent=person.name;link.append(img,label);link.addEventListener('click',()=>setPerson(id));$('#book-related-people').append(link);});
    $('#book-note').textContent=chapter.note;$('#book-source').textContent=chapter.source;
    $('#scene-caption').textContent='原作场景 © FAVORITE · '+chapter.location+(chapter.id==='windmill'?'（原作远景；情节发生在学园）':'');
    if(!mediaAvailable)$('#scene-caption').textContent='场景图片暂不可用，记事正文仍可阅读；请再次选择该页重试。';
    $$('.book-index button').forEach((btn,i)=>btn.setAttribute('aria-current',String(i===index)));
    $('#story-interaction').replaceChildren();
    // The original story remains the interface: emphasis words reveal a related line.
    const clues={coast:'果汁还是茶',dorm:'蓝布包着的小便当',gate:'五点三十三分',market:'母亲',library:'最果古书店',windmill:'约定'};
    const phrase=clues[chapter.id];
    const walker=document.createTreeWalker($('#book-prose'),NodeFilter.SHOW_TEXT);
    let textNode;
    while((textNode=walker.nextNode())){
      const at=textNode.data.indexOf(phrase);if(at<0)continue;
      const after=textNode.splitText(at),tail=after.splitText(phrase.length);
      const clue=document.createElement('span');clue.className='story-clue';clue.tabIndex=0;clue.textContent=phrase;
      clue.addEventListener('click',()=>playVoice(contextClip('book-'+chapter.id),3));
      clue.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();playVoice(contextClip('book-'+chapter.id),3);}});
      after.replaceWith(clue);break;
    }
    $('#related-place').replaceChildren();
    const place=content.places.find(p=>p.id===(chapter.id==='market'?'white-home':chapter.id==='gate'?'dorm':chapter.id));
    if(place){const img=document.createElement('img');img.src=place.image;img.alt=place.alt;const p=document.createElement('p');p.textContent=(chapter.id==='market'?'相关地点：':'地点资料：')+place.name+'。'+place.description;$('#related-place').append(img,p);}
    if(mediaAvailable&&currentChapter==='world-picturebook')setScene(chapter.scene);
    if(explicit)animate('book-changing');
    if(currentChapter==='world-picturebook')scheduleContext('book-'+chapter.id,850);
    $('#book-prev').disabled=index===0;$('#book-next').disabled=index===content.chapters.length-1;
    document.body.dataset.book=chapter.id;
    document.body.dataset.bookMedia=mediaAvailable?'available':'unavailable';bookHasContent=true;
    if(explicit)$('#world-picturebook').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
  }
  async function setPerson(id,explicit=false){
    const person=content?.people.find(p=>p.id===id);if(!person)return;
    requestedPerson=id;clearTimeout(entryTimer);
    const version=++personVersion;let mediaAvailable=true;
    try{await Promise.all([preload(person.sprite),preload('/favorite/assets/'+person.scene)]);}catch{mediaAvailable=false;}
    if(version!==personVersion)return;
    if(!mediaAvailable&&personHasContent){
      $('#person-scene-label').textContent=person.name+'的图片暂不可用，已保留当前人物；请再次选择其头像重试。';
      document.body.dataset.personMedia='unavailable';requestedPerson=currentPerson;return;
    }
    currentPerson=id;
    $('#person-role').textContent=person.role;$('#person-name').textContent=person.name;$('#person-description').textContent=person.description;$('#person-caption').textContent=person.caption;
    $('#person-roman').textContent=person.roman;$('#person-scene-label').textContent='原作人物场景 · '+person.sceneLabel+' · © FAVORITE';
    $('#person-facts').replaceChildren();for(const [label,value] of [['关系',person.relation],['日常',person.interest],['所在',person.place],['特点',person.feature]]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;$('#person-facts').append(dt,dd);}
    const portrait=$('#person-portrait img');portrait.alt=person.name+'原作立绘';
    const personScenes=$$('.person-scene');
    if(mediaAvailable){portrait.src=person.sprite;portrait.style.visibility='';personSceneLayer=1-personSceneLayer;personScenes[personSceneLayer].src='/favorite/assets/'+person.scene;personScenes[personSceneLayer].classList.add('is-visible');personScenes[1-personSceneLayer].classList.remove('is-visible');}
    else{portrait.removeAttribute('src');portrait.style.visibility='hidden';personScenes.forEach(img=>img.classList.remove('is-visible'));$('#person-scene-label').textContent='立绘或场景暂不可用，人物资料仍可阅读；请再次选择其头像重试。';}
    $('.people-stage').dataset.person=id;
    $('#person-portrait').setAttribute('aria-label','与'+person.name+'相遇');
    $('#person-place-link').textContent='回看'+person.name+'的相关记事';
    $$('.people-index button').forEach(btn=>btn.setAttribute('aria-current',String(btn.dataset.person===id)));
    // Associated story links preload asynchronously too. Commit the encounter
    // with its own reveal and voice, even when an earlier chapter reveal ended.
    if(currentChapter==='people'&&id!==document.body.dataset.person){
      clearTimeout(entryTimer);stopVoice();
      const stage=$('.people-stage');clearTimeout(personAnimationTimer);stage.classList.remove('is-character-entering');
      void stage.offsetWidth;stage.classList.add('is-character-entering');
      personAnimationTimer=setTimeout(()=>stage.classList.remove('is-character-entering'),950);
    }
    document.body.dataset.person=id;
    document.body.dataset.personMedia=mediaAvailable?'available':'unavailable';personHasContent=true;
    if(currentChapter==='people')scheduleContext('person-entry',900,id);
  }
  $('#person-portrait').addEventListener('click',()=>portraitEasterEgg(currentPerson));
  $('#person-place-link').addEventListener('click',()=>{const place=['shiro','ren'].includes(currentPerson)?'market':currentPerson==='mio'?'coast':currentPerson==='shinku'?'gate':currentPerson==='suzu'?'library':'dorm';setBook(content.chapters.findIndex(p=>p.id===place));});
  $('#book-prev').addEventListener('click',()=>{if(currentBook>0)setBook(currentBook-1,true);});
  $('#book-next').addEventListener('click',()=>{if(currentBook<5)setBook(currentBook+1,true);});
  $$('[data-book-link]').forEach(link=>link.addEventListener('click',()=>setBook(content.chapters.findIndex(p=>p.id===link.dataset.bookLink))));
  function chooseChapter(){
    const line=Math.max(150,innerHeight*.45),sections=$$('main section.chapter[data-chapter]');let active=sections[0];
    for(const section of sections)if(section.getBoundingClientRect().top<=line)active=section;
    const next=active.dataset.chapter;if(next===currentChapter)return;
    clearTimeout(entryTimer);stopVoice();++themeVersion;
    currentChapter=next;document.body.dataset.chapter=next;nextThemeAt=performance.now()+themeDwell;
    $$('.site-nav a').forEach(link=>link.classList.toggle('is-active',link.hash==='#'+next));syncCycle();
    if(next==='opening')setScene(works[currentWork].scene);
    else if(next==='world-picturebook'){if(content)setScene(content.chapters[currentBook].scene);}
    else if(next==='people')setScene('outer-sky.jpg');
    else if(next==='works')setScene('scene-sky.webp');
    else setScene('scene-coast-night.webp');
    currentContext();
    if(next==='people'){const stage=$('.people-stage');clearTimeout(personAnimationTimer);stage.classList.remove('is-character-entering');void stage.offsetWidth;stage.classList.add('is-character-entering');personAnimationTimer=setTimeout(()=>stage.classList.remove('is-character-entering'),950);}
  }
  let scrollPending=false;addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(()=>{scrollPending=false;chooseChapter();});}},{passive:true});
  addEventListener('resize',chooseChapter);document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(entryTimer);stopVoice();}else{nextThemeAt=performance.now()+themeDwell;currentContext();}syncCycle();});reduced.addEventListener('change',syncCycle);
  const dialog=$('#opening-dialog'),video=dialog.querySelector('video');
  function closeOpening(){if(!dialog.open)return;video.pause();video.removeAttribute('src');video.load();dialog.close();document.body.style.overflow='';nextThemeAt=performance.now()+themeDwell;syncCycle();$('#opening-play').focus();}
  $('#opening-play').addEventListener('click',()=>{stopVoice();video.src='/video/'+encodeURIComponent(works[currentWork].video);dialog.showModal();document.body.style.overflow='hidden';$('#video-status').textContent='';syncCycle();video.play().catch(()=>{$('#video-status').textContent='点击影片播放，或选择跳过。';});});
  $('#opening-skip').addEventListener('click',closeOpening);video.addEventListener('ended',closeOpening);video.addEventListener('error',()=>{$('#video-status').textContent='开场影片未能加载，可以跳过继续浏览。';});
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeOpening();});
  const voiceMetadata = fetch('/favorite/voices.json?v=ecc893c4a490',{cache:'no-store'}).then(r=>{
    if(!r.ok)throw new Error('Voice metadata unavailable');
    return r.json();
  }).catch(()=>{
    document.body.dataset.voiceAvailability='unavailable';
    return {entries:[]};
  });
  Promise.all([fetch('/favorite/content.json?v=05e964020df4',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('Content unavailable');return r.json();}),voiceMetadata]).then(([data,voiceData])=>{
    content=data;voiceRows=voiceData.entries;voices=new Map(voiceData.entries.map(entry=>[entry.key,entry]));
    document.body.dataset.voiceCount=String(voiceRows.length);
    content.chapters.forEach((chapter,index)=>{const btn=document.createElement('button');btn.type='button';btn.innerHTML='<img alt=""><span></span><small></small>';btn.querySelector('img').src='/favorite/assets/'+chapter.scene;btn.querySelector('span').textContent=['海岸','嵐山荘门廊','地下室','商人之町','最果て','学园与风车'][index];btn.querySelector('small').textContent=String(index+1).padStart(2,'0');btn.addEventListener('click',()=>setBook(index,true));$('.book-index').append(btn);});
    content.people.forEach(person=>{const btn=document.createElement('button');btn.type='button';btn.dataset.person=person.id;btn.innerHTML='<img alt=""><span></span>';btn.querySelector('img').src=person.avatar;btn.querySelector('span').textContent=person.id==='shinku'?'真紅':person.id==='kana'?'加奈':person.id==='tsukasa'?'つかさ':person.id==='yuma'?'悠馬':person.name.slice(-1);btn.setAttribute('aria-label','选择'+person.name);btn.addEventListener('click',()=>setPerson(person.id,true));$('.people-index').append(btn);});
    content.stories.forEach(story=>{const article=document.createElement('article'),small=document.createElement('small'),heading=document.createElement('h4'),p=document.createElement('p');small.textContent=story.subtitle;heading.textContent=story.title;p.textContent=story.body;article.append(small,heading,p);$('#story-records').append(article);});
    content.motifs.forEach(motif=>{const article=document.createElement('article'),img=document.createElement('img'),copy=document.createElement('div'),heading=document.createElement('h4'),p=document.createElement('p');img.src=motif.image;img.alt='原作意象画面：'+motif.title;heading.textContent=motif.title;p.textContent=motif.body;copy.append(heading,p);article.append(img,copy);$('#motif-records').append(article);});
    return Promise.all([setBook(0),setPerson('shinku')]).then(()=>{initialChapterRestore.restore();chooseChapter();syncCycle();document.body.dataset.ready='true';document.body.dataset.cycleSeconds='5';currentContext();});
  }).catch(()=>{initialChapterRestore.cancel();$('#book-title').textContent='内容未能加载，请刷新页面。';});
})();
