<script>
  let pressed = false;
</script>

<button class="{pressed ? 'l' : 'h'} " aria-pressed={pressed} on:click>
  hi
</button>

<!-- @component
  Niche alternative usage:
  play/pause
  ```jsx
  <span aria-hidden="true">{play ? '&#x25b6;' : '&#x23f8;'}</span>
  <span class="visually-hidden">play</span>
  ```
  This component seems so small... there just doesn't seem like any good reason to abstract it.
 -->
