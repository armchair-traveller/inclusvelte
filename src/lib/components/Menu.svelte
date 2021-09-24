<!--
menu has open/closed states

markup:
button
menu (AKA items)
ul (AKA item)

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



-->
<script>
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
</script>
