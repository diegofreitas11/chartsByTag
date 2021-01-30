import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import api, { lastfmKey, source } from './services/api';
import ReactLoading from 'react-loading';
import ProgressBar from "@ramonak/react-progress-bar";

const ResultList = (props) => {
    return(
        <div
            className = 'list'
        >
            {props.list.map((item, index) => {
                return (
                    <div
                        className = {item.visible ? 'card' : 'hiddenCard'}
                        key = {index.toString()}
                    >
                        <span>{index + 1}</span>
                        {
                            (item.name.length < 20 && <h1>{item.name}</h1>)
                            || <h2>{item.name}</h2>
                        }
                        
                        <p>{item.playcount} plays</p>
                    </div>
                )
            })}
        </div>
            
    )
}

const UsernameInput = (props) => {
    const [value, setValue] = useState('')

    return(
        <div
            className = {
                props.isFirstScreen ? 
                'usernameInputColumn' : 'usernameInputRow'
            }
        >
            <input
                className = 'usernameField' 
                placeholder ='dale'
                onChange = {e => setValue(e.target.value)}
                value = {value}
                disabled = {!props.isFirstScreen}
            /> 

            <input
                className = 'button' 
                type = 'submit'
                value = {props.isFirstScreen ? 'Buscar' : 'Mudar user'}
                onClick = {
                    props.isFirstScreen ? 
                    () => props.getList(value) : () => props.backToFirstScreen()
                }
            />
        </div>
    )
}

const TagInput = (props) => {
    const [value, setValue] = useState('')

    return(
        <div
            className = 'usernameInputRow'
        >
            <input 
                className = 'usernameField' 
                placeholder = 'Filtre por tag...'
                onChange = {e => setValue(e.target.value)}
                value = {value}
                disabled = {props.isLoadingInProgress}
            />

            <input
                className = 'button' 
                type = 'submit'
                value = {props.isLoadingInProgress ? 'Cancelar' : 'Filtrar'}
                
                onClick = {
                    props.isLoadingInProgress ? 
                    () => props.cancelFetching() : () => props.filter(value)
                }
            />

        </div>
    )
}

/////////

class Main extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            isFirstScreen: true,
            listToRender: [],
            defaultList: [],
            username: null,
            error: false
        }
    }


    loadData = async (username) => {
        this.setState({
            isMainTopLoading: true
        })

        try{
            let result = await api.get(
                `?api_key=${lastfmKey}&method=user.gettopartists&username=${username}&limit=10&format=json`
            );

            let list = result.data.topartists.artist;

            this.setState({
                username,
                error: false,
                isFirstScreen: false,
                isMainTopLoading: false,
                listToRender: list,
                defaultList: list
            });

            this.renderList(list);

        }catch(e){
            this.setState({
                listToRender: [],
                error: true
            })
        }
    }

    filter = async (tag) => {

        this.setState({ 
            filteredTopLoadingProgress: 1
        })

        var setCancelToken = this.state.isFetchCancelled ? false : true;

        try{
            let page = 1;
            let newFilteredList = [];

            while(newFilteredList.length < 10){
                
                let listToFilter;
                if(page > 1){
                    let result = await api.get(
                        `?api_key=${lastfmKey}&method=user.gettopartists&username=${this.state.username}&limit=10&page=${page}&format=json`
                    );
                    listToFilter = result.data.topartists.artist;
                }else{
                    listToFilter = this.state.defaultList;
                }

                for(let item of listToFilter){
                    if(newFilteredList.length !== 10){
                        let config = setCancelToken ?
                        { cancelToken: source.token } : {}

                        let result = await api.get(
                            `?api_key=${lastfmKey}&method=artist.gettoptags&artist=${encodeURIComponent(item.name)}&format=json`,
                            config
                        );
        
                        let topTags = result.data.toptags.tag;
                        console.log(item.name)
                        
                        let limit = topTags.length >= 5 ? 5 : topTags.length;

                        for(var i = 0; i < limit ; i++){
                            if(topTags[i].name === tag){
                                item.visible = false;
                                newFilteredList.push(item)
                            }
                        }
                    }
                }

                page++;
                this.setState({
                    filteredTopLoadingProgress: newFilteredList.length > 0 ? newFilteredList.length * 10 : 1
                })

                console.log(newFilteredList.length)

            }

            this.setState({
                listToRender: newFilteredList,
                filteredTopLoadingProgress: null
            });

            this.renderList(newFilteredList);

        }catch(e){
            this.setState({
                listToRender: []
            })
        }
    }

    renderList = async (list) => {
        console.log(list)
        for(var item of list){
            await new Promise(resolve => setTimeout(resolve, 300))
            item.visible = true;
            this.setState({
                listToRender: list
            })      
        }
    }

    backToFirstScreen = () => {
        source.cancel();
    
        this.setState({
            listToRender: [],
            isFetchCancelled: true,
            filteredTopLoadingProgress: null,
            isFirstScreen: true,
            username: null,
            error: false
        })
    }

    cancelFetching = () => {
        source.cancel();
        this.setState({
            filteredTopLoadingProgress: null,
            listToRender: this.state.defaultList.map(item => {
                item.visible = false;
                return item;
            })
        })
        this.renderList(this.state.defaultList)
    }

    render(){
        var { error, 
            listToRender, 
            isFirstScreen, 
            filteredTopLoadingProgress,
            isMainTopLoading } = this.state;

        return(
            <div className = {isFirstScreen ? 'main' : 'mainWithList'}>
                <UsernameInput
                    getList = {this.loadData}
                    isFirstScreen = {isFirstScreen}
                    backToFirstScreen = {this.backToFirstScreen}
                />

                {isMainTopLoading &&
                    <ReactLoading type = 'spin' />       
                }

                {error && <p>Username não encontrado</p>}

                {(!isFirstScreen &&
                    <div className="resultContent">
                        <TagInput
                            filter = {this.filter}
                            isLoadingInProgress = {!!filteredTopLoadingProgress}
                            cancelFetching = {this.cancelFetching}  
                        />
                        
                        {
                            (filteredTopLoadingProgress &&
                                <ProgressBar 
                                    completed = {filteredTopLoadingProgress}
                                    width = '200px'
                                    bgcolor = '#610f0f'
                                    borderRadius = '0%'
                                    isLabelVisible = {false}
                                />
                            ) || 
                            <ResultList
                                list = {listToRender}
                            />
                        }
                    </div>
                )}
            </div>
        ) 
    }
}

ReactDOM.render(<Main />, document.getElementById('root'))