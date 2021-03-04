export function Profile(props){
    return(
        <div className = "profile-container">
            <img src = {props.profile.image[2]['#text']} alt="..."/>
            <div>
                <strong>{props.profile.name}</strong>
                <p>{props.profile.playcount} plays</p>
            </div>
            <a onClick={props.resetPage}>
                 Alterar user
            </a>
        </div>
    )
}