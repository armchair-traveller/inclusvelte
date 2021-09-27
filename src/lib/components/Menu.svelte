<!--
menu has open/closed states

markup:
button
menu (AKA items)
li (AKA list item)

(there're other bits of markup but they're only serving as context to share state, which can simply clutter up your markup.)

methods: {
  OpenMenu,
  CloseMenu,

  GoToItem,
  Search,
  ClearSearch,
  RegisterItem,
  UnregisterItem,
}

window handler
// Handle outside click
  useWindowEvent('mousedown', event => {
    let target = event.target as HTMLElement

    if (menuState !== MenuStates.Open) return

    if (buttonRef.current?.contains(target)) return
    if (itemsRef.current?.contains(target)) return

    dispatch({ type: ActionTypes.CloseMenu })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      buttonRef.current?.focus()
    }
  })


button
  'aria-haspopup': true // * always
  | 'aria-controls' // * id of menu el, unnecessary for now
  | 'aria-expanded' // * true / false (type Boolean) depending on if menu open, if button is disabled, undefined
  | 'onKeyDown'
  e => {
      switch (e.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          e.preventDefault()
          e.stopPropagation()
          dispatch({ type: ActionTypes.OpenMenu })
          dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })
          break

        case Keys.ArrowUp:
          e.preventDefault()
          e.stopPropagation()
          dispatch({ type: ActionTypes.OpenMenu })
          dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })
          break
      }
    }
  let handleKeyUp = e => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }
  | 'onClick'
  (e) => {
    if (props.disabled) return // check if el disabled? but button/input disabled will auto do this. It's only necessary if el isn't those. But maybe make this an implementation detail for consumer to do, specified in doc footnotes.
    if (state.menuState === MenuStates.Open) {
      dispatch({ type: ActionTypes.CloseMenu })
      state.buttonRef.current?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      event.stopPropagation()
      dispatch({ type: ActionTypes.OpenMenu })
    }
  }

menu (items)
  | 'aria-activedescendant': currently active menu item id
    state.activeItemIndex === null ? undefined : state.items[state.activeItemIndex]?.id
  | 'aria-labelledby': the menu button id
  | 'id'
  | 'onKeyDown'
    e => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (state.searchQuery !== '') {
            event.preventDefault()
            event.stopPropagation()
            return dispatch({ type: ActionTypes.Search, value: event.key })
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.CloseMenu })
          if (state.activeItemIndex !== null) {
            let { id } = state.items[state.activeItemIndex]
            document.getElementById(id)?.click()
          }
          state.buttonRef.current?.focus({ preventScroll: true })
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Next })

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Previous })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })

        case Keys.Escape:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.CloseMenu })
          state.buttonRef.current?.focus({ preventScroll: true })
          break

        case Keys.Tab:
          event.preventDefault()
          event.stopPropagation()
          break

        default:
          if (event.key.length === 1) {
            dispatch({ type: ActionTypes.Search, value: event.key })
            searchDisposables.setTimeout(() => dispatch({ type: ActionTypes.ClearSearch }), 350) // probably cancels any query below 350ms, keeping the cancellation func in state
          }
          break
      }
    }
  keyup
  (e) => {
    switch (e.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        e.preventDefault()
        break
    }
  }

  // optional  
  | 'role': 'menu'
  | 'tabIndex': 0

  li (menu item)
  | 'id': just some generated id
  | 'role': menuitem
  | 'tabIndex': if disabled, undefined, else -1 
  | 'aria-disabled': // .....???. Using aria-disabled instead of disabled prop? ...
  | 'onMouseMove'
  | 'onPointerMove' : both use same handler
  () => {
    if (disabled) return
    if (active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }
  | 'onPointerLeave'
  | 'onMouseLeave' : both use same handler
  () => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
  }
  | 'onFocus'
  () => {
    if (disabled) return dispatch({ type: ActionTypes.GoToItem, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToItem, focus: Focus.Specific, id })
  }

  - every menu item, onmount, gets registered. In HUI implementation, it means adding id and data (disabled? and textContent) to an arr. This registration only happens once, on creation.
    - textContent used for search query
  - on active, scroll into view (by their ID somehow... so that's what the id is used for, to avoid using querySelector, which is less performant. But to use IDs on all UI elements by default is definitely a design decision favoring flexibility. Do you need to access IDs of other elements that aren't belonging to the component? That's the play here). However, due to this method, if the order of elements is changed dynamically outside React, the order is messed up until next open.
  - active is determined by an equality check on the el, whether the index of cur active matches the el.
  - anytime requestAnimationFrame is used, await tick()  should be used instead

  so rather
-->
<script>
import { tick } from 'svelte'

// handlers
// Handle outside click
// ? just use clickOutside action, but you have to do it on the button too?
//  useWindowEvent('mousedown', event => {
//   let target = event.target as HTMLElement

//   if (menuState !== MenuStates.Open) return

//   if (buttonRef.current?.contains(target)) return
//   if (itemsRef.current?.contains(target)) return

//   dispatch({ type: ActionTypes.CloseMenu })

//   if (!isFocusableElement(target, FocusableMode.Loose)) {
//     event.preventDefault()
//     buttonRef.current?.focus()
//   }
// })

let open = false,
  searchQuery = ''
function searchTimeout() {
  let cancel = null
  return function search(query, delay = 350) {
    if (!query) return
    cancel?.()
    // cancel = setTimeout(()=>{queriedEl.focus()
    // searchQuery = ''
    // cancel = null
    // }, delay)
  }
}
const search = searchTimeout()
$: search(searchQuery)
function openMenu() {
  open = true
}
function closeMenu() {
  open = false
}
let itemEls = [] // expect els
// [{ el: {}, textContent: '', disabled: false }] // but wait... disabled & textContent is already on the elements.... hmmm. Maybe directly lookup els?
const select = {
  el() {},
  search() {},
  clearsearch() {},
}
// menu item action
function mi(el, params) {
  mi.addItem(el)

  return {
    destroy() {
      mi.rmvItem(el)
    },
  }
}
Object.assign(mi, {
  addItem(el) {
    itemEls.push(el)
  },
  rmvItem(el) {
    const idx = itemEls.indexOf(el)
    idx >= 0 && itemEls.splice(idx, 1)
  },
})
</script>

<button
  aria-haspopup="true"
  aria-expanded={!!open}
  on:click={(e) => {
    if (open) {
      closeMenu()
      e.target?.focus({ preventScroll: true }) // ? this wouldn't work if the menu was inside the button but who would do that
    } else {
      e.preventDefault()
      e.stopPropagation()
      openMenu()
    }
  }}
  on:keydown={async (e) => {
    switch (e.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
      case ' ':
      case 'Enter':
      case 'ArrowDown':
        e.preventDefault()
        e.stopPropagation()
        openMenu()
        await tick()
        itemEls[0]?.focus()
        // TODO: activate first non-disabled item
        // dispatch({ type: ActionTypes.GoToItem, focus: Focus.First })
        break

      case 'ArrowUp':
        e.preventDefault()
        e.stopPropagation()
        openMenu()
        await tick()
        itemEls.at(-1)?.focus()
        // TODO: activate last item
        // dispatch({ type: ActionTypes.GoToItem, focus: Focus.Last })
        break
    }
  }}
  on:keyup={(e) =>
    // Required for firefox, event.preventDefault() in handleKeyDown for the Space key doesn't cancel the handleKeyUp,
    // which in turn triggers a *click*.
    e.key == ' ' && e.preventDefault()}>Open</button
>

{#if open}
  <menu>
    <button use:mi>Option</button>
    <button use:mi>Option 2</button>
  </menu>
{/if}
