<script>
  import { onMount, onDestroy } from 'svelte';

  let screenRatio = 16 / 9;

  let stream;
  let video;

  let isActive = false;
  let isStreamingVideo = false;

  $: loading = isActive && !isStreamingVideo;

  onMount(() => {
    if (typeof window === 'undefined') return;

    screenRatio = window.screen.availWidth / window.screen.availHeight;

    const observer = new ResizeObserver(() => {
      screenRatio = window.screen.availWidth / window.screen.availHeight;
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  });

  async function initStream() {
    stream = await window.navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 4096 },
          height: { ideal: 2160 },
          facingMode: 'user',
        },
      })
      .catch(() => null);

    if (stream == null || video == null) {
      return;
    }

    video.srcObject = stream;

    video.addEventListener('playing', () => (isStreamingVideo = true), {
      once: true,
    });
  }

  function destroyStream() {
    if (video) video.srcObject = undefined;
    if (stream) stream.getTracks().forEach((track) => track.stop());

    stream = undefined;
    isStreamingVideo = false;
    isDisplayingVideo = false;
  }

  function handleClick() {
    if (!isActive) {
      initStream();
    } else {
      destroyStream();
    }

    isActive = !isActive;
  }

  onDestroy(destroyStream);
</script>

<div class="video-wrapper">
  <div class="shine -video-top-left" />
  <div class="shine -video-top-right" />
  <div class="shine -video-bottom-left" />
  <div class="shine -video-bottom-right" />
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    bind:this={video}
    class:ready={isStreamingVideo}
    class:loading
    on:click={handleClick}
    style={`--screen-ratio: ${screenRatio}`}
    autoplay
  />
</div>

<style>
  .video-wrapper {
    position: relative;
    box-shadow: 0 0 1px 1px #615c64, 0 0 1px 2px #4b4744, 0 0 1px 5px #cec3b5,
      0 0 0 7px #9c9892;
  }

  video {
    position: relative;
    display: block;
    object-fit: cover;
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9;
    /* aspect-ratio: var(--screen-ratio); */
    background-color: transparent;
    background-image: url(/public/assets/images/amy.jpg);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    cursor: url(/public/assets/images/cursor-camera.png) 16 16, default !important;
    transition: filter 0.4s ease;
    transform: scale(-1, 1);
  }

  video.loading {
    transition: filter 1s ease;
    filter: brightness(0.15);
  }

  video.ready {
    background-image: url(/public/assets/images/bg-video.jpg);
  }

  @media (max-width: 901px) {
    video {
      max-height: 50vh;
    }
  }
</style>
