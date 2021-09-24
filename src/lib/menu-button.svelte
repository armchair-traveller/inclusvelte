<!--
  adapts https://github.com/KittyGiraudel/react-menu-button
-->
<script>
  import InclusiveMenuButton from "inclusive-menu-button";
  import { onMount } from "svelte";
  let buttonEl,
    id,
    label,
    menu = null,
    options;

  onMount(() => {
    // need a way to either pass this to parent, or... expose prop like open which directs this reactively $:
    menu = new InclusiveMenuButton(buttonEl, options);
  });
</script>

<menu>
  <button bind:this={buttonEl} type="button" data-inclusive-menu-opens={id}>
    {label}
    <span aria-hidden="true">▾</span>
  </button>

  <div {id}>
    <slot />
  </div>
</menu>
