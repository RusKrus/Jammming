        //getting auth url
const clientId = '';//use your own Id
const redirectUri = 'http://localhost:3000/';
const scope = 'playlist-modify-public user-read-private user-read-email playlist-modify-private playlist-read-collaborative';
let url = 'https://accounts.spotify.com/authorize';
url += '?response_type=token';
url += '&client_id=' + clientId;
url += '&scope=' + scope;
url += '&redirect_uri=' + redirectUri;

let accessToken;

const token={
    adress:url,
    getToken(){
        //dealing with token
        if(accessToken){
            return accessToken;
        }
        const params= new URLSearchParams(window.location.hash.substring(1))
        
        if(params.get("access_token")){
            accessToken=params.get("access_token");
            const expireTime=Number(params.get("expires_in"));
            setTimeout(()=>{accessToken=""}, expireTime*1000);
            window.history.pushState("token", null, "/")
            
            return accessToken;
        }
        else{
            window.location=this.adress;
        }
    },

    async getMusic(request){
        await this.getToken();
        try{
            let spotifyURL = `https://api.spotify.com/v1/search?q=${request}&type=track`;
            const response = await fetch(spotifyURL,{
                method:"GET",
                headers:{
                    'Authorization': `Bearer ${accessToken}`
                }
            }
            );
            if(response.ok){
                const responseJson = await response.json();
                const tracksInfo = responseJson.tracks.items;
                
                let tracksData = [];
                
                for (const track of tracksInfo){  
                    let artistName;
                    const artistsInfoArray = track.artists;
                    for (const artistInfoObject of artistsInfoArray){
                        artistName = artistInfoObject.name;
                    }
                    tracksData.push({
                        name: track.name,
                        artist: artistName,
                        album: track.album.name,
                        id: track.uri
                    })
                }
                return tracksData;
            }
            else{ 
                throw new Error("Request failed!");
            }
        }
        catch(error){
            console.log(error);
        }
    },

    async getUserId(){
        await this.getToken();
        try{
            let spotifyURL = `https://api.spotify.com/v1/me`;
            const response = await fetch(spotifyURL,{
                method:"GET",
                headers:{
                    'Authorization': `Bearer ${accessToken}`
                }
            }
            );
            if(response.ok){
                const responseJson=await response.json();
                const userId = responseJson.id;
                return userId;
            }
            else{ 
                throw new Error("Not posible to obtain user's ID");
            }
            
        }
        catch(error){
            console.log(error);
        }
    },


    async createPlaylist(name){
        const userId = await this.getUserId();
        try{
            let spotifyURL = `https://api.spotify.com/v1/users/${userId}/playlists`;
            const dataForBody = {
                name: `${name}`,
                description: "Something",
                public: false
            }
            const response = await fetch(spotifyURL,{
                method: "POST",
                headers:{
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataForBody)
            });
            if(response.ok){
                const answer = await response.json();
                return answer.id;

            }
            else{
                throw new Error("Not possible to post this Playlist")
            }
        }
        catch(error){
            console.log(error);
        }

    },

    async addMusicToPlaylist(name,playListTracks){
        const playListId = await this.createPlaylist(name);
        try{
            const tracksUris = playListTracks.map(track=>track.props.id);
            console.log(tracksUris);
            let spotifyURL = `https://api.spotify.com/v1/playlists/${playListId}/tracks`;
            const dataForBody = {
                uris: tracksUris
            }
            const response = fetch(spotifyURL, {
                method: "POST",
                headers:{
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataForBody)
            })
            if(response.ok){
                const answer = await response.json();
                console.log(answer)
            }
            else{
                console.log("Not pissible to add track to your playlist")
            }
        }
        catch(e){
            console.log(e);
        }
    }

}

export default token;
