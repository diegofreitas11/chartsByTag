import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.css';
import api, { lastfmKey, source } from './services/api';
import { UsernameInput } from './components/UsernameInput';
import { ResultList } from './components/ResultList';
import { TagInput } from './components/TagInput';
import { Profile } from './components/Profile';
import { LoadingOverlay } from './components/LoadingOverlay';


/*
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
*/


const Main = () => {

    const [profile, setProfile] = useState(null);
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(null);

    const fetchTopArtists = async (username) => {
        setLoading(true);

        try{
            let result = await api.get(
                `?api_key=${lastfmKey}&method=user.getinfo&username=${username}&format=json`
            );
            
            console.log(result.data.user);
            setProfile(result.data.user);

            result = await api.get(
                `?api_key=${lastfmKey}&method=user.gettopartists&username=${username}&limit=10&format=json`
            );
            
            setChart(result.data.topartists.artist);
            setLoading(false);
            console.log(result.data.topartists.artist);

        }catch(e){
            console.log(e);
        }
    }

    const filterByTag = async (tag) => {

        setLoading(true);
        setChart([]);

        try{
            //let page = 1;
            let newFilteredList = [];

            let result = await api.get(
                `?api_key=${lastfmKey}&method=user.gettopartists&username=${profile.name}&limit=100&format=json`
            );

            let listToFilter = result.data.topartists.artist;
            
            let counter = 0;
            while(newFilteredList.length < 10){

                let result = await api.get(
                    `?api_key=${lastfmKey}&method=artist.gettoptags&artist=${encodeURIComponent(listToFilter[counter].name)}&format=json`,
                );

                let topTags = result.data.toptags.tag;
                
                let limit = topTags.length >= 5 ? 5 : topTags.length;

                for(var i = 0; i < limit ; i++){
                    if(topTags[i].name === tag){
                        newFilteredList.push(listToFilter[counter]);
                    }
                }                
                
                counter++;
                 //progresso da barrinha
            }

            setChart(newFilteredList);
            setLoading(false);

        }catch(e){
            console.log(e)
        }
    }

    const resetPage = () => {
        setChart(null);
        setProfile(null);
    }

    return(
        <div className = "container">
            {chart ? 
                (
                    <>
                    <Profile 
                        profile = {profile}
                        resetPage = {resetPage}
                    />

                    <TagInput 
                        filterByTag = {(tag) => filterByTag(tag)}
                    />

                    <ResultList
                        list = {chart} 
                    />
                    </>

                ) : (
                    <UsernameInput 
                        fetchTopArtists = {(username) => fetchTopArtists(username)}
                    />
                )
            }
            {loading && <LoadingOverlay loading={loading}/>}
        </div>
    )
}

ReactDOM.render(<Main />, document.getElementById('root'))