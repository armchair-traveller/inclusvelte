<!-- note: menus are distinct from nav, which contain links. Menus only have interactive (JS) options. -->
<script>
let expanded = false
let menuEl
</script>

<button
  aria-haspopup="true"
  aria-expanded={expanded}
  on:keydown={(e) => {
    switch (e.code) {
      // this implements only required, for all key behaviors https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton
      case 'Enter':
      case 'Space':
        expanded = true
        menuEl.querySelector('button:not([disabled])').focus()
        break
    }
  }}
>
  menu name
  <span aria-hidden="true">&#x25be;</span></button
>
{#if expanded}
  <menu bind:this={menuEl}>
    <button
      role="menuitem"
      tabindex="-1"
      on:keydown={(e) => {
        switch (e.code) {
          // this implements only required, for all key behaviors https://www.w3.org/TR/wai-aria-practices-1.1/#menubutton
          case 'Down':
          case 'Up':
          case 'Tab':
            expanded = false
            break
        }
      }}>i1</button
    >
    <button role="menuitem" tabindex="-1">i2</button>
  </menu>
{/if}
