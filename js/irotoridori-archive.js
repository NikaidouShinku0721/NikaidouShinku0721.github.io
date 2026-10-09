(function(){
  const root=document.getElementById("irotoridori-archive");
  if(!root)return;
  document.body.classList.add("irotoridori-page");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const sections=Array.from(root.querySelectorAll(".archive-section[id]"));
  const links=Array.from(root.querySelectorAll(".archive-index a"));

  if("IntersectionObserver" in window&&!reduced.matches){
    const reveal=new IntersectionObserver((entries,observer)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}
      });
    },{threshold:.12,rootMargin:"0px 0px -45px 0px"});
    root.querySelectorAll(".archive-reveal").forEach(node=>reveal.observe(node));
  }else root.querySelectorAll(".archive-reveal").forEach(node=>node.classList.add("is-visible"));

  if("IntersectionObserver" in window){
    const active=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        links.forEach(link=>{
          const yes=link.getAttribute("href")==="#"+entry.target.id;
          link.classList.toggle("is-active",yes);
          if(yes)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current");
        });
      });
    },{rootMargin:"-22% 0px -66% 0px"});
    sections.forEach(section=>active.observe(section));
  }

  const records=Array.from(root.querySelectorAll("[data-kind]"));
  const filterButtons=Array.from(root.querySelectorAll("[data-archive-filter]"));
  const search=root.querySelector("#archive-search"),count=root.querySelector("#archive-result-count");
  let selected="all";
  function updateRecords(){
    const query=search?search.value.trim().toLocaleLowerCase():"";
    let shown=0;
    records.forEach(record=>{
      const typeMatches=selected==="all"||record.dataset.kind===selected;
      const contents=(record.dataset.search||"")+" "+record.textContent;
      record.hidden=!(typeMatches&&(!query||contents.toLocaleLowerCase().includes(query)));
      if(!record.hidden)shown++;
    });
    sections.forEach(section=>{
      const sectionRecords=Array.from(section.querySelectorAll("[data-kind]"));
      section.hidden=sectionRecords.length>0&&!sectionRecords.some(record=>!record.hidden);
    });
    if(count)count.textContent=query||selected!=="all"?shown+" 条记录":"全部 "+shown+" 条记录";
    const visibleTabs=records.filter(record=>record.matches(".character-tab")&&!record.hidden);
    const activeTab=root.querySelector(".character-tab[aria-selected='true']");
    if(visibleTabs.length&&activeTab&&activeTab.hidden)visibleTabs[0].click();
  }
  filterButtons.forEach(button=>button.addEventListener("click",()=>{
    selected=button.dataset.archiveFilter||"all";
    filterButtons.forEach(item=>{
      const active=item===button;
      item.classList.toggle("is-selected",active);
      item.setAttribute("aria-pressed",active?"true":"false");
    });
    updateRecords();
  }));
  if(search)search.addEventListener("input",updateRecords);
  updateRecords();

  const profiles={
    yuma:{name:"鹿野上悠馬",roman:"KANOUE YUUMA",role:"故事主人公 · 嵐山荘的魔法使",description:"悠馬能够以自己活过的时间，也就是记忆，作为代价治愈他人的伤势。帮助他人与失去自身记忆，成为他与这个世界之间最重要的牵连。",ability:"以记忆交换治愈",connection:"师匠 · 幼馴染 · 真紅",symbol:"悠",label:"MAGICIAN",credit:"资料以 FAVORITE 官方作品介绍与人物资料为依据。"},
    shinku:{name:"二階堂真紅",roman:"NIKAIDO SHINKU",role:"与魔法相关的少女 · 身份资料含剧透",description:"真紅与悠馬的魔法、记忆以及两侧世界的连接密切相关。不同版本的人物资料揭示了她身份与状态的变化；这里先保留无结局剧透的介绍。",ability:"魔法与记忆",connection:"悠馬 · 世界的边界",symbol:"真",label:"THE RED EYES",credit:"详情参照 FAVORITE 官方 HD 人物资料；身份变化标记为剧透。"},
    kyou:{name:"敷島鏡",roman:"SHIKISHIMA KYOU",role:"悠馬的幼馴染",description:"鏡擅长料理和家务，是悠馬日常生活里熟悉而可靠的存在。她与宿舍中的同伴一起，构成故事最初的生活感。",ability:"料理 · 家务",connection:"悠馬 · 嵐山荘的同伴",symbol:"鏡",label:"CHILDHOOD FRIEND",credit:"资料以 FAVORITE 官方作品人物介绍为依据。"},
    shiro:{name:"白",roman:"SHIRO",role:"商人之町的占卜师 · 狐妖",description:"白居住在异世界的商人之町，以占卜为业。她与女儿蓮共同生活，温柔而珍视家人。",ability:"占卜",connection:"蓮 · 商人之町",symbol:"白",label:"FORTUNE TELLER",credit:"资料以官方移植版世界观与人物介绍为依据。"},
    ren:{name:"蓮",roman:"REN",role:"白的女儿 · 子狐妖怪",description:"蓮生活在商人之町，喜欢母亲、花火与闪亮的事物。她和白的关系，也是异世界篇章里温暖而重要的一部分。",ability:"喜欢花火与闪亮的东西",connection:"白 · 商人之町",symbol:"蓮",label:"THE LITTLE FOX",credit:"资料以官方移植版世界观与人物介绍为依据。"},
    suzu:{name:"夏目鈴",roman:"NATSUME SUZU",role:"悠馬的师匠 · 嵐山荘的住客",description:"鈴是悠馬的师匠，也生活在嵐山荘。她与悠馬以旧宿舍为据点行动，连接着日常与魔法侧的故事。",ability:"魔法使的师匠",connection:"悠馬 · 嵐山荘",symbol:"鈴",label:"THE MENTOR",credit:"资料以 FAVORITE 官方人物资料与作品介绍为依据。"}
  };
  const tabs=Array.from(root.querySelectorAll(".character-tab"));
  const panel=root.querySelector("#profile-panel");
  const symbols={yuma:"",shinku:"eye",kyou:"mirror",shiro:"fox",ren:"lotus",suzu:"bell"};
  if(panel&&tabs.length){
    tabs.forEach((tab,index)=>tab.addEventListener("click",()=>{
      const person=profiles[tab.dataset.person];
      if(!person)return;
      tabs.forEach(item=>{
        const active=item===tab;
        item.classList.toggle("is-active",active);
        item.setAttribute("aria-selected",active?"true":"false");
        item.tabIndex=active?0:-1;
      });
      panel.dataset.character=tab.dataset.person;
      panel.setAttribute("aria-labelledby",tab.id);
      const scene=panel.querySelector(".profile-scene");
      scene.querySelector(".profile-keyart")?.remove();
      scene.querySelector(".profile-art-credit")?.remove();
      scene.dataset.symbol=symbols[tab.dataset.person]||"";
      if(tab.dataset.person==="shinku"){
        scene.insertAdjacentHTML("beforeend",'<img class="profile-keyart" src="/img/shouyebeijing3.png" alt="" loading="lazy"><span class="profile-art-credit">SITE KEY VISUAL</span>');
      }
      panel.querySelector("#profile-name").textContent=person.name;
      panel.querySelector(".profile-roman").textContent=person.roman;
      panel.querySelector(".profile-role").textContent=person.role;
      panel.querySelector(".profile-description").textContent=person.description;
      panel.querySelector(".profile-meta>div:first-child b").textContent=person.ability;
      panel.querySelector(".profile-meta>div:last-child b").textContent=person.connection;
      panel.querySelector(".profile-kicker span").textContent=person.label;
      panel.querySelector(".profile-credit").textContent=person.credit;
      panel.querySelector(".profile-scene__glyph").textContent=person.symbol;
      panel.querySelector(".visual-caption span:first-child").textContent="FIELD NOTE / 0"+(index+1);
      panel.querySelector(".visual-caption span:last-child").textContent=person.name;
    }));
    tabs.forEach((tab,index)=>tab.addEventListener("keydown",event=>{
      if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft"].includes(event.key))return;
      event.preventDefault();
      const delta=["ArrowDown","ArrowRight"].includes(event.key)?1:-1;
      const next=(index+delta+tabs.length)%tabs.length;
      tabs[next].focus();tabs[next].click();
    }));
    tabs[0].tabIndex=0;tabs.slice(1).forEach(tab=>tab.tabIndex=-1);
  }

  const canvas=root.querySelector(".archive-particles"),ctx=canvas&&canvas.getContext("2d",{alpha:true});
  if(!canvas||!ctx)return;
  const reducedMotion=reduced.matches,points=[],particleCount=112;
  for(let i=0;i<particleCount;i++){
    const angle=Math.random()*Math.PI*2,radial=.73+Math.random()*.24,z=(Math.random()-.5)*1.4;
    points.push({x:Math.cos(angle)*radial*(.78+.18*Math.sin(angle*2)),y:Math.sin(angle)*radial,z,phase:Math.random()*Math.PI*2,size:.6+Math.random()*1.5});
  }
  let width=0,height=0,dpr=1,frame=0,visible=false,scrollY=0,pointerX=0,pointerY=0;
  const draw=now=>{
    if(!ctx||!width||!height)return;
    ctx.clearRect(0,0,width,height);
    const t=reducedMotion?0:now*.00012,yaw=t+pointerX*.16+scrollY*.00016,pitch=.24+pointerY*.12,projected=[];
    points.forEach(p=>{
      const wobble=reducedMotion?0:Math.sin(now*.0004+p.phase)*.035,x=p.x*(1+wobble),y=p.y*(1+wobble),z=p.z;
      const x1=x*Math.cos(yaw)-z*Math.sin(yaw),z1=x*Math.sin(yaw)+z*Math.cos(yaw),y1=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch),perspective=1/(1.85-z2*.48);
      projected.push({x:width/2+x1*width*.34*perspective,y:height/2+y1*height*.43*perspective,z:z2,s:p.size*perspective});
    });
    for(let i=0;i<projected.length;i++)for(let j=i+1;j<projected.length;j++){
      const a=projected[i],b=projected[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<42){const alpha=(1-d/42)*(.14+Math.max(0,(a.z+b.z+2)/4)*.2);ctx.strokeStyle="rgba(218,238,227,"+alpha.toFixed(3)+")";ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    projected.forEach(p=>{const depth=Math.max(.15,Math.min(.8,(p.z+1.4)/2.8));ctx.fillStyle=p.z>.1?"rgba(246,211,131,"+depth+")":"rgba(166,227,228,"+depth+")";ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.45,p.s),0,Math.PI*2);ctx.fill();});
  };
  const animate=now=>{frame=0;if(!visible||document.hidden)return;draw(now);frame=requestAnimationFrame(animate);};
  const start=()=>{if(!reducedMotion&&!frame&&!document.hidden&&visible)frame=requestAnimationFrame(animate);};
  const resize=()=>{
    const rect=canvas.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,1.7);width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(performance.now());
  };
  if("IntersectionObserver" in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}}).observe(canvas);
  else{visible=true;start();}
  if(!reducedMotion){
    root.addEventListener("pointermove",event=>{const rect=canvas.getBoundingClientRect();pointerX=Math.max(-1,Math.min(1,(event.clientX-(rect.left+rect.width/2))/rect.width));pointerY=Math.max(-1,Math.min(1,(event.clientY-(rect.top+rect.height/2))/rect.height));},{passive:true});
    window.addEventListener("scroll",()=>{scrollY=window.scrollY||0;},{passive:true});
  }
  resize();window.addEventListener("resize",resize,{passive:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else start();});
})();
