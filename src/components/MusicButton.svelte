<script>
  import src from '/public/assets/thinkMusic.mp3';

  let audio;
  let paused = true;

  $: playing = !paused;
</script>

<div class:playing>
  <button on:click={() => (paused ? audio.play() : audio.pause())}>♫</button>
</div>

<audio bind:paused bind:this={audio} {src} loop />

<style>
  audio {
    display: none;
  }

  button {
    all: unset;
    appearance: none;
    background: none;
    border: none;
    font-size: clamp(42px, 4vw, 72px);
    line-height: 1;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
    cursor: url(/public/assets/images/cursor-music.png) 16 17, default !important;
    transition: transform 0.2s ease;
    transform: scale(1);
  }

  button:hover {
    transform: scale(1.1);
  }

  button:active {
    transform: scale(0.9);
  }

  .playing {
    transform: rotate(-6deg);
    animation: rotate 0.5s linear infinite alternate;
    transform-origin: 50% 100%;
  }

  @keyframes rotate {
    from {
      transform: rotate(-6deg);
    }
    to {
      transform: rotate(6deg);
    }
  }
</style>
