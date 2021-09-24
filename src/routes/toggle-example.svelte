<script>
import { toggle } from '$lib/shui/toggle'
let pressed = false
</script>

<button on:change={() => (pressed = !pressed)} use:toggle={pressed}>
  {pressed}
</button>
