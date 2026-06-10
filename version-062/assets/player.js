function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-video');
  var cover = document.getElementById('player-cover');
  var hls = null;
  var loaded = false;

  if (!video || !cover || !streamUrl) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    attach();
    cover.classList.add('is-hidden');
    video.controls = true;
    video.play().catch(function () {});
  }

  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (!loaded || video.paused) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
