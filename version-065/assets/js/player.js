import { H as Hls } from './hls.esm.js';

function query(selector, scope) {
  return (scope || document).querySelector(selector);
}

function queryAll(selector, scope) {
  return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
}

function setupPlayer() {
  var video = query('[data-hls-player]');
  if (!video) {
    return;
  }

  var playButton = query('[data-player-play]');
  var status = query('[data-player-status]');
  var sourceButtons = queryAll('[data-hls-source]');
  var hls = null;

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function loadSource(sourceUrl, shouldPlay) {
    if (!sourceUrl) {
      setStatus('播放地址未设置。');
      return;
    }

    setStatus('正在加载播放源...');
    destroyHls();

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪。');
        if (shouldPlay) {
          video.play().catch(function () {
            setStatus('播放源已就绪，请点击播放按钮。');
          });
        }
      });
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('当前线路加载异常，请切换其他高清线路。');
        }
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.addEventListener('loadedmetadata', function onLoaded() {
        video.removeEventListener('loadedmetadata', onLoaded);
        setStatus('播放源已就绪。');
        if (shouldPlay) {
          video.play().catch(function () {
            setStatus('播放源已就绪，请点击播放按钮。');
          });
        }
      });
      return;
    }

    setStatus('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
  }

  function markActive(button) {
    sourceButtons.forEach(function (item) {
      item.classList.toggle('is-active', item === button);
    });
  }

  sourceButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      markActive(button);
      loadSource(button.dataset.hlsSource, true);
    });
  });

  if (playButton) {
    playButton.addEventListener('click', function () {
      playButton.classList.add('is-hidden');
      video.play().catch(function () {
        loadSource(video.dataset.source, true);
      });
    });

    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
      setStatus('');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        playButton.classList.remove('is-hidden');
      }
    });
  }

  loadSource(video.dataset.source, false);
}

document.addEventListener('DOMContentLoaded', setupPlayer);
