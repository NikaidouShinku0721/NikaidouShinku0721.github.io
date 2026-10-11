(function () {
  'use strict';
  const root = document.getElementById('irotoridori-archive');
  if (!root) return;
  document.body.classList.add('irotoridori-page');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const data = JSON.parse(root.querySelector('#trilogy-data').textContent);
  const $ = selector => root.querySelector(selector);
  const $$ = selector => Array.from(root.querySelectorAll(selector));
  const wait = ms => new Promise(resolve => setTimeout(resolve, reduced.matches ? 0 : ms));
  const loadImage = src => {
    const image = new Image(); image.src = src;
    return image.decode ? image.decode().then(() => image.naturalWidth > 0).catch(() => false) : new Promise(resolve => { image.onload = () => resolve(true); image.onerror = () => resolve(false); });
  };
  const feedback = document.createElement('p');
  feedback.className = 'archive-feedback'; feedback.setAttribute('role','status'); feedback.hidden = true; root.append(feedback);
  function imageFailure() { feedback.textContent = '这幅画暂时未能载入，请稍后重试。'; feedback.hidden = false; }
  const setTabs = (tabs, selected) => tabs.forEach(tab => {
    const yes = tab === selected;
    tab.setAttribute('aria-selected', String(yes)); tab.tabIndex = yes ? 0 : -1;
  });
  function keyboardTabs(tabs) {
    tabs.forEach(tab => tab.addEventListener('keydown', event => {
      const visible = tabs.filter(item => !item.hidden);
      let next;
      const current = visible.indexOf(tab);
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (current + 1) % visible.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (current - 1 + visible.length) % visible.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = visible.length - 1;
      else return;
      if (!visible.length) return;
      event.preventDefault(); visible[next].focus(); visible[next].click();
    }));
  }

  const locationTabs = $$('.location-tab');
  let locationVersion = 0;
  async function showPlace(tab) {
    const place = data.places.find(item => item.id === tab.dataset.place);
    if (!place) return;
    const version = ++locationVersion;
    const placeMain = $('.place-main');
    // Restore the displayed entry if this request interrupts an earlier fade.
    placeMain.classList.remove('is-changing');
    const loaded = await loadImage(place.image);
    if (version !== locationVersion) return;
    if (!loaded) { placeMain.classList.remove('is-changing'); imageFailure(); return; }
    feedback.hidden = true;
    placeMain.classList.add('is-changing');
    await wait(180);
    if (version !== locationVersion) return;
    setTabs(locationTabs, tab);
    const previousScene = $('#location-backdrop').cloneNode();
    previousScene.removeAttribute('id'); previousScene.setAttribute('aria-hidden','true'); previousScene.alt = '';
    $('#location-backdrop').after(previousScene);
    $('#location-backdrop').src = place.image;
    $('#location-backdrop').alt = place.alt;
    previousScene.style.transition = reduced.matches ? 'none' : 'opacity .65s';
    requestAnimationFrame(() => { previousScene.style.opacity = '0'; });
    setTimeout(() => previousScene.remove(), reduced.matches ? 0 : 700);
    $('#world').dataset.place = place.id;
    $('#place-number').textContent = place.number + ' / ' + place.en;
    $('#place-name').textContent = place.name;
    $('#place-jp').textContent = place.jp;
    $('#place-description').textContent = place.description;
    $('#place-source').href = place.source;
    $('#place-view-note').textContent = '原作场景 / ' + place.resource;
    $('#place-panel').setAttribute('aria-labelledby', tab.id);
    placeMain.classList.remove('is-changing');
  }
  locationTabs.forEach(tab => tab.addEventListener('click', () => showPlace(tab)));
  keyboardTabs(locationTabs);

  const personTabs = $$('.character-tab');
  const dossier = $('#profile-panel');
  let personVersion = 0;
  async function showPerson(tab) {
    const person = data.people.find(item => item.id === tab.dataset.person);
    if (!person) return;
    const version = ++personVersion;
    // Keep the current portrait readable while the newest image is loading.
    dossier.classList.remove('is-changing');
    dossier.setAttribute('aria-busy', 'true');
    const loaded = await loadImage(person.sprite);
    if (version !== personVersion) return;
    if (!loaded) { dossier.classList.remove('is-changing'); dossier.setAttribute('aria-busy', 'false'); imageFailure(); return; }
    feedback.hidden = true;
    dossier.classList.remove('is-entering');
    dossier.classList.add('is-changing');
    await wait(180);
    if (version !== personVersion) return;
    setTabs(personTabs, tab);
    dossier.style.setProperty('--person-accent', person.color);
    $('#profile-name').textContent = person.name;
    $('#profile-roman').textContent = person.roman;
    $('#profile-role').textContent = person.role;
    $('#profile-description').textContent = person.description;
    $('#profile-place').textContent = person.place;
    $('#profile-relation').textContent = person.relation;
    $('#profile-interest').textContent = person.interest;
    $('#profile-feature').textContent = person.feature;
    $('#profile-number').textContent = person.number + ' / CHARACTER';
    $('#profile-caption').textContent = person.caption;
    $('#profile-sprite').src = person.sprite;
    $('#profile-sprite').alt = person.name + '的原作立绘';
    dossier.setAttribute('aria-labelledby', tab.id);
    dossier.classList.remove('is-changing');
    dossier.classList.add('is-entering');
    dossier.setAttribute('aria-busy', 'false');
    document.dispatchEvent(new CustomEvent('trilogy-person-change', {detail:{id:person.id}}));
  }
  personTabs.forEach(tab => tab.addEventListener('click', () => showPerson(tab)));
  keyboardTabs(personTabs);

  const records = $$('[data-kind]');
  const sections = $$('.archive-section');
  const filters = $$('[data-archive-filter]');
  const search = $('#archive-search');
  let kind = 'all';
  function filterRecords() {
    const query = search.value.trim().toLocaleLowerCase();
    let total = 0;
    records.forEach(record => {
      const text = (record.dataset.search || '') + ' ' + record.textContent;
      record.hidden = !((kind === 'all' || kind === record.dataset.kind) && (!query || text.toLocaleLowerCase().includes(query)));
      if (!record.hidden) total++;
    });
    sections.forEach(section => {
      const members = Array.from(section.querySelectorAll('[data-kind]'));
      section.hidden = members.length > 0 && members.every(item => item.hidden);
    });
    $('#archive-result-count').textContent = (query || kind !== 'all' ? '找到 ' : '共 ') + total + ' 条档案';
    $('#archive-empty').hidden = total > 0;
    for (const tabs of [locationTabs, personTabs]) {
      const selected = tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
      const first = tabs.find(tab => !tab.hidden);
      if (selected?.hidden && first) first.click();
    }
  }
  search.addEventListener('input', filterRecords);
  filters.forEach(button => button.addEventListener('click', () => {
    kind = button.dataset.archiveFilter;
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterRecords();
  }));
  $('#archive-search-toggle').addEventListener('click', event => {
    const tools = $('#archive-tools');
    const isOpen = tools.hidden;
    tools.hidden = !isOpen;
    event.currentTarget.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) search.focus();
    else { search.value = ''; kind = 'all'; filters.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.archiveFilter === 'all'))); filterRecords(); }
  });
  filterRecords();

  const navLinks = $$('.archive-index a');
  const navTargets = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  let scrollFrame = 0;
  function updateActive() {
    scrollFrame = 0;
    const offset = innerWidth <= 600 ? 155 : 180;
    const visibleTargets = navTargets.filter(target => !target.hidden);
    let active = visibleTargets[0];
    visibleTargets.forEach(target => { if (target.getBoundingClientRect().top <= offset) active = target; });
    navLinks.forEach(link => {
      const yes = active && link.getAttribute('href') === '#' + active.id;
      link.classList.toggle('is-active', Boolean(yes));
      if (yes) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActive); }, {passive:true});
  addEventListener('resize', updateActive, {passive:true});
  updateActive();
  filters.forEach(button => button.addEventListener('click', updateActive));
  search.addEventListener('input', updateActive);
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), {threshold:0.08});
    $$('.section-reveal').forEach(section => observer.observe(section));
  }
})();
