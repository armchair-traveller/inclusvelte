import { addEvts } from './utils/action'

/**
  Markup:
  button
  label (optional)
  group (optional, use description which isn't actually present in the markup, just for context state)
  
  Toggle (button)
  props + events:
  id, // `headlessui-switch${$useId}`
  role: 'switch',
  tabIndex: 0,
  'aria-checked': checked, // boolean, exposed prop
  onClick: handleClick,
  (event) => {
    event.preventDefault()
    toggle()
    let toggle = () => onChange(!checked)
  }
  onKeyUp: handleKeyUp,
  (event) => {
    if (event.key !== Keys.Tab) event.preventDefault()
    if (event.key === Keys.Space) toggle()
  }
  onKeyPress: handleKeyPress,
  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  (event) => event.preventDefault()
  
  unnecessary props
  type: useResolveButtonType(props, internalSwitchRef), // irrelevant
  'aria-labelledby': groupContext?.labelledby,
  'aria-describedby': groupContext?.describedby,
*/

/**
 * Attach on a button you desire to be a toggle. Pass in current pressed state.
 * Triggers change event on toggle. `e.detail` with desired change value.
 *
 * Usage:
 * ```svelte
 * <button on:change={()=>(pressed = !pressed)} use:toggle={pressed} />
 * ```
 *
 * Note: If this action is used on an element that isn't a button / input type=button, please set `role="button"`.
 */
export function toggle(el, pressed = false) {
  update(pressed)

  function toggle() {
    el.dispatchEvent(new CustomEvent('change', { detail: !pressed }))
  }
  function update(curPressed = pressed) {
    el.setAttribute('aria-pressed', Boolean((pressed = curPressed)))
  }
  return {
    update,
    destroy: addEvts(el, {
      click(e) {
        e.preventDefault()
        toggle()
      },
      keyup(e) {
        if (e.key != 'Tab') e.preventDefault()
        if (e.key == ' ') toggle()
      },
      keypress: (e) => e.preventDefault(), // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
    }),
  }
}
