import { useState } from "react"

export function UsernameInput  (props) {
    const [value, setValue] = useState(null);

    return(
        <div className = 'username-input-container'>

            <strong>ChartsByTag</strong>

            <input 
                onChange = {(e) => setValue(e.target.value)}
            />

            <button
                onClick = {() => props.fetchTopArtists(value)}
            >
                Buscar
            </button>

        </div>
    )
}