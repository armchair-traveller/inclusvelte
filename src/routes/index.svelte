<script>
import { toggle } from '$lib/shui/toggle'
let pressed = false
</script>

<label for="email"
  >Email
  <button
    tabindex="0"
    id="email"
    role="button"
    on:change={() => (pressed = !pressed)}
    use:toggle={pressed}
  >
    {pressed}
  </button>
</label>
