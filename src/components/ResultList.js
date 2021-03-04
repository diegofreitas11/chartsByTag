export function ResultList(props){
    return(
        <div className="result-list-container">
            {props.list.length > 0 ? (
                props.list.map(item => (
                    <div key={item['@attr'].rank}>
                        <strong>
                            {item.name}
                        </strong>
                        <p>
                            {item.playcount} plays
                        </p>
                    </div>
                ))
            ) : (
                !!props.loading &&
                <span>Não há nenhum artista com esse gênero no seu top 100.</span>
            )}
        </div>
    )
}