<script>
  import { onMount, onDestroy } from 'svelte';

  let screenRatio = 16 / 9;

  let stream;
  let video;
  let canvas;
  let canvasContext;

  let isActive = false;
  let isStreamingVideo = false;
  let isDisplayingVideo = false;

  let bodyPix;
  let bodyPixNet;
  let animationFrame = null;

  let shouldDetectPerson = false;

  $: loading = isActive && (!isStreamingVideo || !isDisplayingVideo);

  $: if (canvas) {
    canvasContext = canvas.getContext('2d');
    canvasContext.imageSmoothingEnabled = true;
  } else {
    canvasContext = undefined;
  }

  $: if (isStreamingVideo) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (shouldDetectPerson) {
      loadBodyPix().then(drawVideo);
    } else {
      drawVideo();
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return;

    screenRatio = window.screen.availWidth / window.screen.availHeight;

    const observer = new ResizeObserver(() => {
      screenRatio = window.screen.availWidth / window.screen.availHeight;
    });

    observer.observe(document.body);

    return () => observer.disconnect();
  });

  async function loadBodyPix() {
    if (bodyPix != null) return;

    await import('@tensorflow/tfjs-core');
    await import('@tensorflow/tfjs-converter');
    await import('@tensorflow/tfjs-backend-webgl');

    bodyPix = await import('@tensorflow-models/body-pix');
    bodyPixNet = await bodyPix.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2,
    });
  }

  async function initStream() {
    if (video == null) {
      video = document.createElement('video');
      video.setAttribute('autoplay', '');
    }

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

  function detectPerson() {
    return bodyPixNet
      .segmentPerson(video, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.6,
      })
      .catch((error) => console.log(error));
  }

  function drawPersonSegmentation(segmentation, auxCanvas) {
    const auxCtx = auxCanvas.getContext('2d');
    const mask = bodyPix.toMask(segmentation);

    auxCtx.putImageData(mask, 0, 0);

    // draw original image
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

    // use destination-out, then only masked area will be removed
    canvasContext.save();
    canvasContext.globalCompositeOperation = 'destination-out';
    canvasContext.filter = 'blur(8px)';
    canvasContext.drawImage(auxCanvas, 0, 0, canvas.width, canvas.height);
    canvasContext.restore();
  }

  async function drawVideo() {
    const auxCanvas = document.createElement('canvas');

    async function loop() {
      cancelAnimationFrame(animationFrame);
      if (!isStreamingVideo) {
        isDisplayingVideo = false;
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      auxCanvas.width = video.videoWidth;
      auxCanvas.height = video.videoHeight;

      animationFrame = requestAnimationFrame(loop);

      if (shouldDetectPerson) {
        drawPersonSegmentation(await detectPerson(), auxCanvas);
      } else {
        canvasContext.save();
        canvasContext.scale(-1, 1);
        canvasContext.drawImage(video, 0, 0, -canvas.width, canvas.height);
        canvasContext.restore();
      }

      if (isStreamingVideo) {
        isDisplayingVideo = true;
      }
    }

    animationFrame = requestAnimationFrame(loop);
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

<!-- eslint-disable-next-line a11y-media-has-caption -->
<div class="video-wrapper">
  <canvas
    bind:this={canvas}
    class:ready={isDisplayingVideo}
    class:loading
    on:click={handleClick}
    style={`--screen-ratio: ${screenRatio}`}
  />
</div>

<style>
  .video-wrapper {
    box-shadow: 0 0 1px 1px #615c64, 0 0 1px 2px #4b4744, 0 0 1px 5px #cec3b5,
      0 0 0 7px #9c9892;
  }

  canvas {
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
  }

  canvas.loading {
    transition: filter 1s ease;
    filter: brightness(0.15);
  }

  canvas.ready {
    background-image: url(/public/assets/images/bg-video.jpg);
  }

  @media (max-width: 901px) {
    canvas {
      max-height: 50vh;
    }
  }
</style>
