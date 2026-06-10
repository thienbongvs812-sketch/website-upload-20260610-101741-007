import { H as Hls } from "./hls-vendor.js";

const videos = document.querySelectorAll(".js-player[data-stream]");

videos.forEach(function (video) {
  const stream = video.dataset.stream;
  const stage = video.closest(".player-stage");
  const button = stage ? stage.querySelector(".play-button") : null;
  let ready = false;
  let hls = null;

  function prepare() {
    if (ready || !stream) {
      return;
    }
    ready = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function play() {
    prepare();
    const action = video.play();
    if (action && typeof action.catch === "function") {
      action.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("play", function () {
    if (stage) {
      stage.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (stage) {
      stage.classList.remove("is-playing");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
