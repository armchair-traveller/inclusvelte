<!-- @component
switches differ from toggles in that they have on/off text labels
* form els i.e. checkboxes or radio buttons should be used in cases where the switch is not submitting anything
-->
<script>
let checked = false
let id = 'notify-email'
</script>

<span {id}>Your label name</span>
<button role="switch" aria-checked={checked} aria-labelledby={id}>
  <span>on</span>
  <span>off</span>
</button>
