(function() {
  window.setupMoviePlayer = function(streamUrl) {
    var video = document.querySelector('[data-player]');
    var cover = document.querySelector('[data-player-cover]');
    var started = false;
    var hlsInstance = null;

    if (!video || !cover || !streamUrl) {
      return;
    }

    function attachStream() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function start() {
      if (started) {
        return;
      }

      started = true;
      cover.classList.add('is-hidden');
      video.controls = true;
      attachStream();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          started = false;
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', start);
    video.addEventListener('click', function() {
      if (!started) {
        start();
      }
    });

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
