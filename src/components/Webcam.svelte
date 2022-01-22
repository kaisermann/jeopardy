<script>
  import { onDestroy } from 'svelte';

  let stream;
  let video;
  let canvas;

  let isStreamingVideo = false;
  let isDisplayingVideo = false;

  let bodyPix;
  let bodyPixNet;
  let animationFrame = null;

  let canvasContext;

  $: if (canvas) {
    canvasContext = canvas.getContext('2d');
    canvasContext.imageSmoothingEnabled = true;
  } else {
    canvasContext = undefined;
  }

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
        video: { width: { ideal: 4096 }, height: { ideal: 2160 } },
      })
      .catch(() => null);

    if (stream == null || video == null) {
      return;
    }

    video.srcObject = stream;

    video.addEventListener(
      'playing',
      () => {
        isStreamingVideo = true;
      },
      { once: true },
    );
  }

  function destroyStream() {
    if (video) video.srcObject = undefined;
    if (stream) stream.getTracks().forEach((track) => track.stop());

    stream = undefined;
    isStreamingVideo = false;
    isDisplayingVideo = false;
  }

  function handleClick() {
    if (stream == null) {
      initStream();
    } else {
      destroyStream();
    }
  }

  function detectPerson() {
    return bodyPixNet
      .segmentPerson(video, {
        flipHorizontal: false,
        internalResolution: 'medium',
        segmentationThreshold: 0.5,
      })
      .catch((error) => console.log(error));
  }

  function drawPersonSegmentation(segmentation, auxCanvas) {
    const tempCtx = auxCanvas.getContext('2d');
    const mask = bodyPix.toMask(segmentation);
    tempCtx.putImageData(mask, 0, 0);

    // draw original image
    canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

    // use destination-out, then only masked area will be removed
    canvasContext.save();
    canvasContext.globalCompositeOperation = 'destination-out';
    canvasContext.drawImage(auxCanvas, 0, 0, canvas.width, canvas.height);
    canvasContext.restore();
  }

  async function drawVideo() {
    const tempCanvas = document.createElement('canvas');

    async function loop() {
      if (!isStreamingVideo) {
        isDisplayingVideo = false;
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
        return;
      }

      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;

      animationFrame = requestAnimationFrame(loop);

      drawPersonSegmentation(await detectPerson(), tempCanvas);

      if (isStreamingVideo) {
        isDisplayingVideo = true;
      }
    }

    animationFrame = requestAnimationFrame(loop);
  }

  $: if (isStreamingVideo) {
    loadBodyPix().then(drawVideo);
  }

  onDestroy(destroyStream);
</script>

<!-- eslint-disable-next-line a11y-media-has-caption -->
<canvas
  bind:this={canvas}
  class:ready={isDisplayingVideo}
  on:click={handleClick}
/>

<style>
  canvas {
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

  canvas.ready {
    background-image: url(/public/assets/images/bg-video.png);
  }
</style>
