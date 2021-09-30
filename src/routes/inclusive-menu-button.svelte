<script>
import useMenu from 'src/experimental/menu'
import { fade } from 'svelte/transition'
const menu = useMenu()
</script>

{$menu}

<h1>Welcome to SvelteKit</h1>
<p>
  Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>

<button use:menu.btn>hiiii</button>

<div class="w-56 text-right fixed top-16">
  {#if $menu}
    <menu class="" use:menu transition:fade={{ duration: 200 }}>
      <button
        class={`text-gray-900 group flex rounded-md items-center w-full px-2 py-2 text-sm focus:bg-indigo-500`}
        use:menu.item
        on:click={menu.toggle}>lhl</button
      >
      <button
        class={`text-gray-900 group flex rounded-md items-center w-full px-2 py-2 text-sm focus:bg-indigo-500`}
        use:menu.item>lhl</button
      >
      <button
        class={`text-gray-900 group flex rounded-md items-center w-full px-2 py-2 text-sm focus:bg-indigo-500`}
        use:menu.item>lhl</button
      >
    </menu>
  {/if}
</div>
