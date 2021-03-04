import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.css';
import api, { lastfmKey, source } from './services/api';
import { UsernameInput } from './components/UsernameInput';
import { ResultList } from './components/ResultList';
import { TagInput } from './components/TagInput';
import { Profile } from './components/Profile';
import { LoadingOverlay } from './components/LoadingOverlay';
import LoadingBar from 'react-top-loading-bar'



const Main = () => {

    const [profile, setProfile] = useState(null);
    const [chart, setChart] = useState(null);
    const [loading, setLoading] = useState(null);
    const [topBarProgress, setTopBarProgress] = useState(0);

    const fetchTopArtists = async (username) => {
        setLoading(true);

        try{
            let result = await api.get(
                `?api_key=${lastfmKey}&method=user.getinfo&username=${username}&format=json`
            );
            
            setProfile(result.data.user);

            result = await api.get(
                `?api_key=${lastfmKey}&method=user.gettopartists&username=${username}&limit=10&format=json`
            );
            
            setChart(result.data.topartists.artist);
            setLoading(false);

        }catch(e){
            console.log(e);
        }
    }

    const filterByTag = async (tag) => {

        setLoading(true);
        setChart([]);

        try{

            let result = await api.get(
                `?api_key=${lastfmKey}&method=user.gettopartists&username=${profile.name}&limit=100&format=json`
            );

            let listToFilter = result.data.topartists.artist;
            
            let counter = 0;
            let filteredList = [];

            while(filteredList.length < 10 && counter !== 100){
                let result = await api.get(
                    `?api_key=${lastfmKey}&method=artist.gettoptags&artist=${encodeURIComponent(listToFilter[counter].name)}&format=json`,
                );

                let topTags = result.data.toptags.tag;
                
                let limit = topTags.length >= 5 ? 5 : topTags.length;

                for(var i = 0; i < limit ; i++){
                    if(topTags[i].name === tag){
                        filteredList = filteredList.concat(listToFilter[counter]);
                        setChart(filteredList);
                        setLoading(false);
                        setTopBarProgress(filteredList.length * 10);
                    }
                }    

                counter++;
            }

            setTopBarProgress(100);

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
                    <LoadingBar
                        color = '#000'
                        progress = {topBarProgress}
                        onLoaderFinished = {() => setTopBarProgress(0)} 
                    />

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