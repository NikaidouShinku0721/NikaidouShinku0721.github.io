/* Small, traceable original voice clips. Playback always starts with a click. */
(function () {
  'use strict';
  function setup() {
    const data = document.getElementById('game-voice-data');
    if (!data || document.getElementById('game-voice-player')) return;
    const clips = new Map(JSON.parse(data.textContent).map(item => [item.key, item]));
    const people = {shinku:'shinku-greeting',kyou:'kyou-name',kana:'kana-greeting',mio:'mio-greeting',tsukasa:'tsukasa-thanks'};
    let enabled = false, request = 0, active = null;
    const audio = document.createElement('audio');
    audio.preload = 'none'; audio.volume = .55; audio.id = 'game-voice-audio';
    const player = document.createElement('aside');
    player.id = 'game-voice-player'; player.className = 'game-voice-player';
    player.setAttribute('aria-label', '原作语音交互');
    player.innerHTML = '<div class="voice-controls"><button type="button" data-voice-toggle aria-pressed="false">♪ 联动语音 · 关</button><button type="button" data-voice-stop hidden>停止 ×</button></div><div class="voice-caption" hidden><p data-voice-name></p><p data-voice-ja lang="ja"></p><p data-voice-zh></p><small>原作片段 · 中文为本站释义</small><a href="/audio/trilogy/credits.json" target="_blank" rel="noopener">出处 ↗</a></div>';
    player.append(audio); document.body.append(player);
    const toggle = player.querySelector('[data-voice-toggle]');
    const stop = player.querySelector('[data-voice-stop]');
    const caption = player.querySelector('.voice-caption');
    function stopAudio(clear = true) {
      ++request; active = null; audio.pause();
      if (clear) { audio.removeAttribute("src"); audio.load(); }
      stop.hidden = clear;
      stop.textContent = clear ? '停止 ×' : '收起 ×';
      document.querySelectorAll('[data-game-voice]').forEach(button => button.classList.remove('is-playing'));
      if (clear) caption.hidden = true;
    }
    function play(key, button) {
      const clip = clips.get(key);
      if (!clip || document.hidden || document.querySelector('dialog[open]')) return;
      stopAudio(); const token = request; active = key;
      player.querySelector('[data-voice-name]').textContent = clip.character + ' · ' + clip.duration_seconds.toFixed(1) + 's';
      player.querySelector('[data-voice-ja]').textContent = clip.display_dialogue;
      player.querySelector('[data-voice-zh]').textContent = clip.chinese_meaning;
      caption.hidden = key === 'ui-selection'; stop.hidden = key === 'ui-selection';
      audio.volume = key === 'ui-selection' ? .18 : .55;
      player.dataset.voiceClip = key;
      audio.src = clip.website_file;
      button?.classList.add('is-playing');
      audio.play().catch(() => {
        if (request !== token) return;
        stopAudio(key === 'ui-selection');
        player.querySelector('[data-voice-zh]').textContent = '原声暂时未能播放，请点击原声按钮重试。';
      });
    }
    toggle.addEventListener('click', () => {
      enabled = !enabled;
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.textContent = enabled ? '♪ 联动语音 · 开' : '♪ 联动语音 · 关';
      if (enabled) play('shinku-greeting'); else stopAudio();
    });
    stop.addEventListener('click', () => stopAudio());
    audio.addEventListener('ended', () => { if (active && audio.ended) stopAudio(active === 'ui-selection'); });
    audio.addEventListener('error', () => {
      if (!active || !audio.error) return;
      stopAudio(active === 'ui-selection');
      player.querySelector('[data-voice-zh]').textContent = '原声暂时未能载入，请稍后重试。';
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAudio(); });
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-game-voice]');
      if (button) play(button.dataset.gameVoice, button);
      if (event.target.closest('#home-opening-button')) stopAudio();
    });
    const profile = document.querySelector('.dossier-copy');
    if (profile) {
      const button = document.createElement('button'); button.type = 'button';
      button.className = 'original-voice-button'; button.dataset.gameVoice = people.shinku;
      button.textContent = '▷ 聆听原声';
      const extras = document.createElement('span'); extras.className = 'original-voice-extras';
      profile.querySelector('.dossier-source')?.before(button, extras);
      function extraVoices(id) {
        extras.replaceChildren();
        const keys = id === 'shinku' ? ['shinku-listen','shinku-understood'] : id === 'kyou' ? ['kyou-another-serving'] : [];
        keys.forEach(key => {
          const option = document.createElement('button'); option.type = 'button';
          option.className = 'original-voice-button original-voice-button--small'; option.dataset.gameVoice = key;
          option.textContent = clips.get(key).chinese_meaning;
          option.setAttribute('aria-label', '播放原声：' + clips.get(key).chinese_meaning);
          extras.append(option);
        });
      }
      extraVoices('shinku');
      document.addEventListener('trilogy-person-change', event => {
        stopAudio();
        const key = people[event.detail.id];
        extraVoices(event.detail.id);
        button.hidden = !key;
        if (key) button.dataset.gameVoice = key;
        if (key && enabled) play(key, button);
      });
    }
    document.addEventListener('picturebook-page-change', () => {
      stopAudio();
      if (enabled) play('ui-selection');
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup); else setup();
})();
