<script>
  let input;
  let name = 'Amy Schnieder';

  function handleFocus() {
    requestAnimationFrame(() => input.setSelectionRange(-1, -1));
  }
</script>

<div class="name">
  <input bind:this={input} bind:value={name} on:focus={handleFocus} />
</div>

<style>
  .name {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .name::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(/public/assets/images/bg2.png);
    background-size: cover;
    background-repeat: no-repeat;
    opacity: 0.8;
  }

  input {
    width: 100%;
    display: inline-block;
    padding: 20px 24px;
    overflow: hidden;
    text-align: center;
    font-family: 'TradeGothic LT';
    font-weight: bold;
    font-size: clamp(36px, 3.3vw, 80px);
    line-height: 1;
    letter-spacing: 1px;
    color: #fff;
    text-transform: uppercase;
    background-color: rgba(0, 0, 0, 0.1);
    border: 4px solid #decc3f;
    border-left: none;
    border-right: none;
    text-shadow: 4px 2px 6px rgba(0, 0, 0, 0.6);
    box-shadow: 0 0 8px 6px rgba(0, 0, 0, 0.3);
    cursor: url(/public/assets/images/cursor-pencil.png) 16 17, default !important;
  }

  input:focus {
    outline: none;
  }
</style>
