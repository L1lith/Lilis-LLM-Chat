import { createSignal } from "solid-js"
import "../styles/ToggleSwitch.scss"

export default function ToggleSwitch(props){
    const {activeByDefault=true, activeColor={}, baseWidth='5em', activeToggleID, toggleID, onToggle} = props
    const [active, setActive] = createSignal(activeByDefault)
    const baseWidthCalculated = CSSNumericValue.parse(baseWidth)

    if ('activeToggleID' in props && 'toggleID' in props) {
        createEffect(()=>{
            const shouldBeActive = activeToggleID() === toggleID
            if (shouldBeActive !== active()) setActive(shouldBeActive)
        })
    } else if ('activeToggleID' in props || 'toggleID' in props) {
        throw new Error("Requires both an activeToggleID signal and a static toggleID prop")
    }

    const doToggle = ()=>{
        const newState = !active()
        setActive(newState)
        if (typeof onToggle == 'function') onToggle(newState)
    }

    return <div onClick={doToggle} style={{width: baseWidth, 'box-shadow': `inset 0 0 ${baseWidthCalculated.value / 10 + baseWidthCalculated.unit} ${active() ? "#ffffff6b" : "#adff2f6b" }`, 'border-width': baseWidthCalculated.value / 20 + baseWidthCalculated.unit}} class={"toggle-switch " + (active() ? 'active' : 'inactive')}>
        <div style={{'box-shadow':` inset 0px 0px ${baseWidthCalculated.value / 10 + baseWidthCalculated.unit} black`,border: `${baseWidthCalculated.value / 20 + baseWidthCalculated.unit} inset black`, margin: -1 * (baseWidthCalculated.value / (20)) + baseWidthCalculated.unit}} class="circle"/>
    </div>

}