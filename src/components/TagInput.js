import { useState } from "react"

export function TagInput(props){
    const [value, setValue] = useState(null)
    return (
        <div className = "tag-input-container">

            <input 
                onChange = {(e) => setValue(e.target.value)}
            />

            <button
                onClick = {() => props.filterByTag(value)}
            >
                Filtrar
            </button>
            
        </div>
    )
}