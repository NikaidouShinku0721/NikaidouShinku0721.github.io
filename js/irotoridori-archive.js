(function(){
  const root=document.getElementById("irotoridori-archive"); if(!root)return; document.body.classList.add("irotoridori-page");
  const sections=Array.from(root.querySelectorAll(".archive-section[id],.archive-source[id]"));
  const links=Array.from(root.querySelectorAll(".archive-index a"));
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if("IntersectionObserver" in window&&!reduced){
    const reveal=new IntersectionObserver((entries,observer)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -35px 0px"});
    root.querySelectorAll(".archive-reveal").forEach(node=>reveal.observe(node));
  }else root.querySelectorAll(".archive-reveal").forEach(node=>node.classList.add("is-visible"));
  if("IntersectionObserver" in window){
    const active=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;links.forEach(link=>{const yes=link.getAttribute("href")==="#"+entry.target.id;link.classList.toggle("is-active",yes);if(yes)link.setAttribute("aria-current","location");else link.removeAttribute("aria-current")})}),{rootMargin:"-18% 0px -65% 0px"});
    sections.forEach(section=>active.observe(section));
  }
  const cards=Array.from(root.querySelectorAll("[data-kind]")),buttons=Array.from(root.querySelectorAll("[data-archive-filter]"));
  const search=root.querySelector("#archive-search"),count=root.querySelector("#archive-result-count");
  const worldRoute=root.querySelector(".world-route");let selected="all";
  function update(){
    const q=search?search.value.trim().toLocaleLowerCase():"";let shown=0;
    cards.forEach(card=>{const kind=selected==="all"||card.dataset.kind===selected;const text=(card.dataset.search||"")+" "+card.textContent;card.hidden=!(kind&&(!q||text.toLocaleLowerCase().includes(q)));if(!card.hidden)shown++});
    sections.forEach(section=>{const records=Array.from(section.querySelectorAll("[data-kind]"));section.hidden=records.length>0&&!records.some(card=>!card.hidden)});
    if(worldRoute)worldRoute.querySelectorAll(".route-link").forEach(link=>{const before=link.previousElementSibling,after=link.nextElementSibling;link.hidden=!(before&&after&&before.classList.contains("world-card")&&after.classList.contains("world-card")&&!before.hidden&&!after.hidden)});
    if(count)count.textContent=q||selected!=="all"?shown+" 条档案":"全部 "+shown+" 条";
  }
  buttons.forEach(button=>button.addEventListener("click",()=>{selected=button.dataset.archiveFilter||"all";buttons.forEach(item=>{const yes=item===button;item.classList.toggle("is-selected",yes);item.setAttribute("aria-pressed",yes?"true":"false")});update()}));
  if(search)search.addEventListener("input",update);update();
})(); 


