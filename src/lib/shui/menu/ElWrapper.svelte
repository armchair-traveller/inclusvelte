<script>
import { afterUpdate, tick } from 'svelte'

// takes a slot, outputs the first el of the slotted content
// uses a trick of inserting and removing a hidden div, from the DOM

export let el
let beforeEl,
  ready = true
$: forwardEl(beforeEl)
function forwardEl() {
  if (beforeEl) {
    el = beforeEl.nextElementSibling
    ready = false
  }
}

// alternative: mutation observer
afterUpdate(async () => {
  await tick()
  !el?.isConnected && (ready ??= true)
})
</script>

{#if $$slots.default}
  {#if ready}
    <div bind:this={beforeEl} style="display:none" />
  {/if}
  <slot />
{/if}
