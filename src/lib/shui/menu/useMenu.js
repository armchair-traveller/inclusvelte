import { onMount } from 'svelte'
import { writable } from 'svelte/store'
import { addEvts } from '../utils/action'

export function useMenu() {
  var buttonEl,
    menuEl,
    itemEls = [],
    isOpen = false

  Object.assign(Menu, {
    ...writable(false),
    /** button action */
    button(el) {
      buttonEl = el
      buttonEl.ariaHasPopup = true
      const unsub = menuEl.subscribe(
        (isOpen) => (buttonEl.ariaExpanded = isOpen)
      )
      const cleanup = addEvts(buttonEl, {
        click(e) {
          if (isOpen) {
            closeMenu()
            buttonEl.focus?.({ preventScroll: true })
          } else {
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
              itemEls[0]?.focus()
              // TODO: activate first non-disabled item
              // dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })
              break
            case 'ArrowUp':
              await openTick()
              itemEls.at(-1)?.focus()
              // TODO: activate last item
              // dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })
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
          unsub()
          cleanup()
        },
      }
    },
  })
  onMount(() => Menu.subscribe((open) => (isOpen = open)))
  // === Main shared functionality
  function openMenu() {
    Menu.set(true)
  }
  function closeMenu() {
    Menu.set(false)
  }

  /** Menu action store */
  function Menu(el) {
    menuEl = el
    el
  }
}
