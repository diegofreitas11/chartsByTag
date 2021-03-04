import ReactLoading from 'react-loading';

export function LoadingOverlay(){
    return (
        <div className = 'loading-overlay-container'>
            <ReactLoading 
                type = "spin"
                color = "#000"
            />
        </div>
    )
}