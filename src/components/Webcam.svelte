<script>
  import { createEventDispatcher, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  let stream;
  let video;

  async function initStream() {
    stream = await window.navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { min: 1280 },
          height: { min: 720 },
        },
      })
      .catch(() => null);

    if (stream == null || video == null) {
      return;
    }

    video.srcObject = stream;

    video.addEventListener(
      'playing',
      () => {
        dispatch('ready', true);

        isReady = true;
      },
      { once: true },
    );
  }

  function destroyStream() {
    if (video) video.srcObject = undefined;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = undefined;
    }
  }

  function handleClick() {
    if (stream == null) {
      initStream();
    } else {
      destroyStream();
    }
  }

  onDestroy(destroyStream);
</script>

<!-- eslint-disable-next-line a11y-media-has-caption -->
<video bind:this={video} autoplay on:click={handleClick} />

<style>
  video {
    object-fit: cover;
    width: 100%;
    height: 100%;
    aspect-ratio: 16 / 9;
    box-shadow: 0 0 1px 1px #615c64, 0 0 1px 2px #4b4744, 0 0 1px 5px #cec3b5,
      0 0 0 7px #9c9892;
    background-color: transparent;
    background-image: url(/public/assets/images/amy.jpg);
    background-size: cover;
    background-repeat: no-repeat;
    cursor: url(/public/assets/images/cursor-camera.png), default !important;
  }
</style>
