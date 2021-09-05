import { writable } from 'svelte/store'

/** Creates an action store containing methods and more actions
 * 
 *  The state is managed internally via closure  
There is no 'selected' value, only currently focused item. Because a selection is an on click that
 the consumer manages  
 If user needs click outside, they can find the helper action somewhere and just use it on the menu e.g. https://github.com/sw-yx/svelte-actions
 * @param {boolean} expanded - init expanded state
 * @returns {function} the menu action store. Func w/ store contract on its obj portion: `item`, `btn`, and `toggle`
 */
export default function useMenu(expanded = false) {
  var menuEl, btnEl, menuItemEls

  // Consider refactoring methods to outside of useMenu if too many and mem becomes an issue. At most, you'd just
  // create func wrappers on the methods that pass in the required params e.g. menu `method: () => func(menu)`
  Object.assign(menu, {
    item(el) {
      el.addEventListener('mouseenter', el.focus)
      el.addEventListener('keydown', handleKeyDown)
      return {
        destroy() {
          el.removeEventListener('mouseenter', el.focus)
          el.removeEventListener('keydown', handleKeyDown)
        },
      }
      function handleKeyDown(e) {
        switch (e.key) {
          // this implements only base requirements
          case 'ArrowUp':
            focusPrevItem()
            break
          case 'ArrowDown':
            focusNextItem()
            break
          case 'Escape':
          case 'Tab':
            e.preventDefault()
            menu.toggle()
            btnEl.focus()
            break
        }
      }
      function itemIndex() {
        return Array.prototype.indexOf.call(menuItemEls, el)
      }
      function focusNextItem() {
        // in perf tests, querySelectorAll on every run is less performant than operating on a live tag node list
        // note: converting & using only arr methods causes perf issues on large list menus, though it's significantly more readable
        for (let i = itemIndex() + 1, nextItem; i < menuItemEls.length; i++) {
          // only focus if next item isn't disabled
          if (!(nextItem = menuItemEls[i]).disabled) {
            nextItem.focus()
            break
          }
        }
      }
      function focusPrevItem() {
        for (let i = itemIndex() - 1, prevItem; i >= 0; i--) {
          if (!(prevItem = menuItemEls[i]).disabled) {
            prevItem.focus()
            break
          }
        }
      }
    },
    toggle: () => menu.update((isOpen) => !isOpen),
    btn(el) {
      btnEl = el
      el.setAttribute('aria-haspopup', true)
      const unsub = menu.subscribe((isOpen) => {
        el.setAttribute('aria-expanded', (expanded = isOpen))
        if (isOpen)
          setTimeout(() =>
            menuEl.querySelector('button:not([disabled])')?.focus()
          )
      })
      el.addEventListener('keydown', handleKeyDown)
      el.addEventListener('click', menu.toggle)

      return {
        destroy() {
          unsub()
          el.removeEventListener('keydown', handleKeyDown)
          el.removeEventListener('click', menu.toggle)
        },
      }
      function handleKeyDown(e) {
        switch (e.key) {
          // this isn't according to spec. Check https://www.w3.org/TR/wai-aria-practices-1.2/#menubutton
          case 'ArrowDown':
            menu.set(true)
            break
          case 'ArrowUp':
            menu.set(false)
            break
        }
      }
    },
    ...writable(expanded), // set, subscribe, update
  })

  function menu(el) {
    menuEl = el
    menuItemEls = el.getElementsByTagName('button')
  }

  return menu
}
