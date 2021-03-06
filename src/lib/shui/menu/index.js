import { onMount, tick } from 'svelte'
import { get, writable } from 'svelte/store'
import { addEvts } from '../utils/action'
import { elWalker } from '../utils/elWalker'
import { generateId } from '../utils/generateId'
import Item from './Item.svelte'

/**
 * Implementation differences:
 * - No auto-removal of non-menuitem roles via tree walker
 * - Tree walker used to navigate items instead of by a manually managed list of data
 *   - selected check is performed by menuitem element equality check instead of id
 * - button/input disabled uses native `disabled` attribute.
 * - Significantly less opinionated about where you place your markup, except where required, due to lack of context
 * - Next item after reaching last item loops back to the first item, and vice versa for first item to previous item = last item.
 */

/**
 * Creates a new menu instance.
Usage:
```svelte
<script>
import { useMenu } from '$lib/shui/menu/useMenu'
const Menu = useMenu()
</script>

<button use:Menu.button>open</button>

{#if $Menu}
  <menu use:Menu>
    <Menu.Item let:active>
      <button class="{active ? 'bg-red-400' : ''} text-black">hi</button>
    </Menu.Item>
  </menu>
{/if}
```
 * Uses closures, stores, and elements to handle state. Doesn't use context so theoretically you could use it outside
 * the script tag... but not recommended.
 * 
 * Note: button/input disabled uses native `disabled` attribute. Please use elements that have valid disabled attributes if you plan to disable them.
 * Otherwise you'll have to set the disabled prop on the el obj itself and add the disabled attribute.
 * @returns `Menu` action store, w/ additional actions, components, and helpers. If not destructured, MUST be capitalized
 * for Svelte to recognize the component(s) attached to it.
 */
export function useMenu() {
  var buttonEl,
    menuEl,
    itemEls = [],
    isOpen = false,
    selected = writable(null)

  /** Button action */
  Menu.button = (el) => {
    buttonEl = el
    buttonEl.ariaHasPopup = true
    buttonEl.id = `shui-menubutton-${generateId()}`
    const MenuUnsub = Menu.subscribe((isOpen) => (buttonEl.ariaExpanded = isOpen))
    const cleanup = addEvts(buttonEl, {
      click(e) {
        if (isOpen) closeMenu()
        else {
          e.preventDefault()
          e.stopPropagation()
          openMenu()
        }
      },
      async keydown(e) {
        switch (e.key) {
          // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
          case ' ':
          case 'Enter':
          case 'ArrowDown':
            await openTick()
            menuEl.items.gotoItem()
            break
          case 'ArrowUp':
            await openTick()
            menuEl.items.gotoItem(-1)
            break
        }
        function openTick() {
          e.preventDefault()
          e.stopPropagation()
          openMenu()
          return tick()
        }
      },
      keyup(e) {
        // Required for firefox, event.preventDefault() in handleKeyDown for the Space key doesn't cancel the handleKeyUp,
        // which in turn triggers a *click*.
        e.key == ' ' && e.preventDefault()
      },
    })

    return {
      destroy() {
        MenuUnsub()
        cleanup()
      },
    }
  }

  // Attach store: open state // * Object.assign doesn't get inferred types
  {
    const { subscribe, set, update } = writable(false)
    Menu.subscribe = subscribe
    Menu.set = set
    Menu.update = update
  }

  Menu.Item = Item

  onMount(() => Menu.subscribe((open) => (isOpen = open)))

  return Menu
  // === Main shared functionality
  function openMenu() {
    Menu.set(true)
  }
  async function closeMenu() {
    Menu.set(false)
    await tick()
    buttonEl?.focus({ preventScroll: true })
  }

  /** Menu action store.
   *
   * Menu store gives open state, which can be set to manually manage open/close if desired.
   *
   * Currently selected el is attached to the `<menu>` as a store. In the off chance you want it, use `bind:this` and get the el's `.selected`.
   *
   * * Theoretically, actions make it easy to incorporate options. No options are obvious at the moment, so none are present.
   */
  function Menu(node) {
    menuEl = node
    // Attach helpers and stores to menu el as if it's a context, used for `Item.svelte` & button handlers
    menuEl.selected = selected
    menuEl.items = { reset, gotoItem, closeMenu }

    const itemsWalker = elWalker(menuEl, (el) => el.getAttribute('role') == 'menuitem' && !el.disabled)

    menuEl.id = `shui-menu-${generateId()}`
    buttonEl?.setAttribute('aria-controls', menuEl.id)
    menuEl.setAttribute('role', 'menu')
    menuEl.setAttribute('tabindex', 0)
    menuEl.setAttribute('aria-labelledby', buttonEl?.id)
    const selectedUnsub = selected.subscribe((el) =>
      el?.id ? menuEl.setAttribute('aria-activedescendant', el.id) : menuEl.removeAttribute('aria-activedescendant')
    )

    menuEl.focus({ preventScroll: true })

    function clickOutside(e) {
      if (menuEl.contains(e.target) || buttonEl.contains(e.target)) return
      closeMenu()
    }
    window.addEventListener('click', clickOutside)

    let searchQuery = '',
      cancelClearSearch = null
    const rmEvts = addEvts(menuEl, {
      keydown(e) {
        function keyModifier() {
          e.preventDefault()
          e.stopPropagation()
        }
        switch (e.key) {
          // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

          // @ts-expect-error Fallthrough is expected here
          case ' ':
            if (searchQuery !== '') {
              keyModifier()
              return search(e.key)
            }
          // When in type ahead mode, fallthrough
          case 'Enter':
            keyModifier()
            get(selected)?.click()
            closeMenu()
            break

          case 'ArrowDown':
            keyModifier()
            return nextItem()

          case 'ArrowUp':
            keyModifier()
            return prevItem()

          case 'Home':
          case 'PageUp':
            keyModifier()
            return gotoItem()

          case 'End':
          case 'PageDown':
            keyModifier()
            return gotoItem(-1)

          case 'Escape':
            keyModifier()
            closeMenu()
            break

          case 'Tab':
            keyModifier()
            break

          default:
            if (e.key.length == 1) {
              search(e.key)
              cancelClearSearch = setTimeout(() => (searchQuery = ''), 350)
            }
            break
        }
      },
    })
    return {
      destroy() {
        window.removeEventListener('click', clickOutside)
        rmEvts()
        selectedUnsub()
        buttonEl?.removeAttribute('aria-controls')
      },
    }

    function search(char = '') {
      clearTimeout(cancelClearSearch)
      searchQuery += char.toLowerCase()
      const matchedEl = Array.prototype.find.call(menuEl.querySelectorAll('[role=menuitem]:not([disabled])'), (el) =>
        el.textContent.trim().toLowerCase().startsWith(searchQuery)
      )
      if (matchedEl) reset(matchedEl)
    }

    function nextItem() {
      const item = itemsWalker.nextNode()
      if (item) {
        selected.set(item)
        return item
      }
      return gotoItem()
    }
    function prevItem() {
      const item = itemsWalker.previousNode()
      if (item) {
        selected.set(item)
        return item
      }
      return gotoItem(-1)
    }

    // ==== Helpers attached to the menuEl
    /** resets currently selected menuitem, or sets it to the el passed in */
    function reset(curEl = null) {
      selected.set(curEl)
      return (itemsWalker.currentNode = curEl || menuEl)
    }
    /** @param idx starts at 1 and also accepts negative indexing. */
    function gotoItem(idx = 1) {
      reset()

      if (idx < 0) {
        // negative idx, start from last item
        itemsWalker.currentNode = itemsWalker.lastChild()
        while (idx < -1) {
          idx++
          itemsWalker.previousNode()
        }
      } else {
        // idx >= 0
        while (idx > 0) {
          idx--
          itemsWalker.nextNode()
        }
      }

      return reset(itemsWalker.currentNode)
    }
  }
}
