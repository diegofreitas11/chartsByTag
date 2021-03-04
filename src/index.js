import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './styles/styles.css';
import api, { lastfmKey, source } from './services/api';
import { UsernameInput } from './components/UsernameInput';
import { ResultList } from './components/ResultList';
import { TagInput } from './components/TagInput';
import { Profile } from './components/Profile';
import { LoadingOverlay } from './components/LoadingOverlay';




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
            while(newFilteredList.length < 10 && counter !== 100){

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


                setChart(newFilteredList);
                console.log(chart);

                counter++;
                 //progresso da barrinha
            }

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