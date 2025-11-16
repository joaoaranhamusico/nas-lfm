// spotify.js
// ========

module.exports = {
    initialize: function(logging_enabled) {
	    debug.initialize(logging_enabled);
    },
    login: function(client_id, callback_url, req, res, showDialog){
        login(client_id, callback_url, req, res, showDialog);
    },
    loginCallback: function(client_id, client_secret, callback_url, redirect_path, req, res){
        loginCallback(client_id, client_secret, callback_url, redirect_path, req, res);
    },
    getUserInfo: function(access_token, spotifyData, completeCallback) {
	    getUserInfo(access_token, spotifyData, completeCallback);
    },
    getOtherUserInfo: function(access_token, spotifyData, completeCallback) {
	    getOtherUserInfo(access_token, spotifyData, completeCallback);
    },
    getArtistInfo: function(access_token, spotifyData, completeCallback) {
	    getArtistInfo(access_token, spotifyData, completeCallback);
    },
    getArtistsInfo: function(access_token, spotifyData, completeCallback) {
	    getArtistsInfo(access_token, spotifyData, completeCallback);
    },
    getSongsForArtist: function(access_token, spotifyData, completeCallback) {
	    getSongsForArtist(access_token, spotifyData, completeCallback);
    },
    followAllArtists: function(access_token, spotifyData, completeCallback) {
	    followAllArtists(access_token, spotifyData, completeCallback);
    },
    followAllLeadArtists: function(access_token, spotifyData, completeCallback) {
	    followAllLeadArtists(access_token, spotifyData, completeCallback);
    },
    followArtistsInList: function(access_token, spotifyData, artistList, completeCallback) {
	    followArtistsInList(access_token, spotifyData, artistList, completeCallback);
    },
    unfollowAllArtists: function(access_token, spotifyData, completeCallback) {
	    unfollowAllArtists(access_token, spotifyData, completeCallback);
    },
    likeAllSongs: function(access_token, spotifyData, completeCallback) {
	    likeAllSongs(access_token, spotifyData, completeCallback);
    },
    likeSongsInList: function(access_token, spotifyData, songList, completeCallback) {
	    likeSongsInList(access_token, spotifyData, songList, completeCallback);
    },
    unlikeAllSongs: function(access_token, spotifyData, completeCallback) {
	    unlikeAllSongs(access_token, spotifyData, completeCallback);
    },
    followAllPlaylists: function(access_token, spotifyData, completeCallback) {
	    followAllPlaylists(access_token, spotifyData, completeCallback);
    },
    analyzePlaylist: function(access_token, spotifyData, completeCallback) {
	    analyzePlaylist(access_token, spotifyData, completeCallback);
    },
    getPlaylistListInfo: function(access_token, spotifyData, completeCallback) {
	    getPlaylistListInfo(access_token, spotifyData, completeCallback);
    },
    likeAllEpisodes: function(access_token, spotifyData, completeCallback) {
	    likeAllEpisodes(access_token, spotifyData, completeCallback);
    },
    followAllShows: function(access_token, spotifyData, completeCallback) {
	    followAllShows(access_token, spotifyData, completeCallback);
    },
    getRecentSongs: function(access_token, spotifyData, completeCallback) {
        getRecentSongs(access_token, spotifyData, completeCallback);
    },
    getSongInfo: function(access_token, spotifyData, completeCallback) {
        getSongInfo(access_token, spotifyData, completeCallback);
    },
    getPlaylistInfo: function(access_token, spotifyData, completeCallback) {
        getPlaylistInfo(access_token, spotifyData, completeCallback);
    },
    clearPlaylistSongs: function(access_token, spotifyData, completeCallback) {
        clearPlaylistSongs(access_token, spotifyData, completeCallback);
    },
    clearSongsFromArtists: function(access_token, spotifyData, artistIds, completeCallback) {
        clearSongsFromArtists(access_token, spotifyData, artistIds, completeCallback);
    },
    clonePlaylist: function(access_token, spotifyData, completeCallback) {
        clonePlaylist(access_token, spotifyData, completeCallback);
    },
    fillPlaylist: function(access_token, spotifyData, shuffledPlaylist, completeCallback) {
        fillPlaylist(access_token, spotifyData, shuffledPlaylist, completeCallback);
    },
    refreshAccessToken: function(client_id, client_secret, refresh_token, completeCallback) {
        refreshAccessToken(client_id, client_secret, refresh_token, completeCallback);
    }
};

// Includes
var request = require('request'); // "Request" library
var debug = require('./debug.js');
var querystring = require('querystring');

// Globals

var GET_PLAYLIST_MAX = 100;
var GET_LIKES_MAX = 50;
var GET_SAVES_MAX = 50;
var GET_ARTISTS_MAX = 50;
var GET_FOLLOWING_MAX = 50;
var GET_USERS_PLAYLISTS_MAX = 50;

var stateKey = 'spotify_auth_state';

var scope = 'user-read-private user-read-email user-library-read user-library-modify user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private user-read-recently-played user-top-read';

// ********************* Main Functions ********************* 

//login

var login = function(client_id, callback_url, req, res, showDialog)
{
    var showDialogText = (showDialog == null || showDialog ? 'true' : 'false');
    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    
    //debug.print("stateKey:" + stateKey + ", state:" + state);
    
    var query = querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: callback_url,
        state: state,
        show_dialog: showDialogText
    });
    //debug.print(query);
    
    res.redirect('https://accounts.spotify.com/authorize?' + query);
}

//callback

var loginCallback = function(client_id, client_secret, callback_url, redirect_path, req, res)
{
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: callback_url,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        // we can also pass the token to the browser to make requests from there
        res.redirect(redirect_path +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect(redirect_path +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
}

//getUserInfo

getUserInfo = function(access_token, spotifyData, completeCallback)
{	
    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
		if (!error && response.statusCode === 200) {
		    
		    var returnData = {
        		display_name: body.display_name,
        		id: body.id,
        		country: body.country
        	};
	
            completeCallback(true, returnData);
		}
		else
		{
            var returnData = {
        		'result': "Error getting user data",
        		status: body.error.status,
        		message: body.error.message
        	};
        	
            completeCallback(false, returnData);
		}
    });
}

//getOtherUserInfo

getOtherUserInfo = function(access_token, spotifyData, completeCallback)
{	
    var options = {
      url: 'https://api.spotify.com/v1/users/' + spotifyData.otherUserId,
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
		if (!error && response.statusCode === 200) {
		    
            var returnData = {
        		display_name: body.display_name,
        		id: body.id
        	};
	
            completeCallback(true, returnData);
		}
		else
		{
            var returnData = {
        		'result': "Error getting user data",
        		status: body.error.status,
        		message: body.error.message
        	};
        	
            completeCallback(false, returnData);
		}
    });
}

//getSongsForArtist

getSongsForArtist = function(access_token, spotifyData, completeCallback)
{
    getAlbumsFromArtist(access_token, spotifyData.artistId, 0, 50, function(success, albumListResults)
    {
        if(success)
        {
            var songList = [];
            
        	getSongsFromAlbums(access_token, spotifyData.artistId, 0, albumListResults.data, songList, function(success, results)
            {
                if(success)
                {
                    completeCallback(true, {'result': "Success", 'data': songList});
                }
                else
                {
                    completeCallback(false, 
                    {'result': "Error",
                     'error': "getSongsFromAlbum error"
                    });
                }
            });
        }
        else
        {
            completeCallback(false, 
            {'result': "Error",
             'error': "getAlbumsFromArtist error"
            });
        }
    });
}

getAlbumsFromArtist = function(access_token, spotifyArtistId, index, limit, completeCallback)
{
    var getUrl = 'https://api.spotify.com/v1/artists/' + spotifyArtistId + '/albums?include_groups=album,single,appears_on,compilation&limit=' + limit + '&offset=0';
    //debug.print(getUrl);
    
    var albumList = [];
    
    getNextAlbumsFromArtist(access_token, getUrl, spotifyArtistId, albumList, completeCallback);
}

getNextAlbumsFromArtist = function(access_token, url, spotifyArtistId, albumList, completeCallback)
{
    //debug.print("getNextAlbumsFromArtist");
    //debug.print(url);
    
    var options = {
      'url': url,
      'headers': { 'Authorization': 'Bearer ' + access_token },
      'json': true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
		if (!error && response.statusCode === 200) {
        	
        	body.items.forEach(album =>
        	{
    	        var albumData = {
        	        'id': album.id,
        	        'releaseDate': album.release_date
    	        };
    	        
        	    albumList.push(albumData);
        	});
        	
        	var nextUrl = body.next;
        	
        	if(nextUrl == null)
        	{
        	    completeCallback(true, {'result': "Success", 'data': albumList});
        	}
        	else
        	{
        	    getNextAlbumsFromArtist(access_token, nextUrl, spotifyArtistId, albumList, completeCallback);
        	}
		}
		else
		{
            var returnData = {
        		'result': "Error getting artist data",
        		status: body.error.status,
        		message: body.error.message
        	};
        	
            completeCallback(false, returnData);
		}
    });
}

getSongsFromAlbums = function(access_token, spotifyArtistId, index, albumList, songList, completeCallback)
{
    if(index >= albumList.length)
    {
        //debug.print("Number of Songs:" + songList.length);
        //debug.print(songList);
        completeCallback(true, songList);
    }
    else
    {
        var getUrl = 'https://api.spotify.com/v1/albums/' + albumList[index].id + '/tracks?limit=50&offset=0';
        //debug.print(getUrl);
        
        var options = {
          url: getUrl,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
    
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
    		if (!error && response.statusCode === 200) {
            	
            	body.items.forEach(song =>
            	{
            	    var isNewSong = true;
            	    
            	    songList.forEach(existingSong =>
            	    {
            	        if(song.id == existingSong.id)
            	        {
            	            isNewSong = false;
            	        }
            	    });
            	    
            	    if(isNewSong)
            	    {
                	    var artistList = [];
                	    
                	    var isArtistsSong = false;
                	    
                	    song.artists.forEach(artist =>
                	    {
                	        if(artist.id == spotifyArtistId)
                	        {
                	            isArtistsSong = true;
                	        }
                	        
                	        var artistData = {
                    	        'id':artist.id,
                    	        'name':artist.name
                	        };
                	        
                	        artistList.push(artistData);
                	    });
                	    
                	    if(isArtistsSong)
                	    {
                    	    var songData = {
                    	        'artists':artistList,
                    	        'id':song.id,
                    	        'name':song.name,
                	            'releaseDate': albumList[index].releaseDate
                    	    };
                    	    
                    	    songList.push(songData);
                	    }
            	    }
            	});
    	
                getSongsFromAlbums(access_token, spotifyArtistId, index + 1, albumList, songList, completeCallback);
    		}
    		else
    		{
                var returnData = {
            		'result': "Error getting artist data",
            		status: body.error.status,
            		message: body.error.message
            	};
            	
                completeCallback(false, returnData);
    		}
        });
    }
}

//getArtistInfo

getArtistInfo = function(access_token, spotifyData, completeCallback)
{
    //debug.print("getArtistInfo");
    var getUrl = 'https://api.spotify.com/v1/artists/' + spotifyData.artistId;
    //debug.print(getUrl);
    
    var options = {
      url: getUrl,
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body) {
		if (!error && response.statusCode === 200) {
    
            var returnData = {
        		artist_name: body.name,
        		id: body.id,
        		popularity: body.popularity,
        		genres: body.genres,
        		followers: body.followers.total
        	};
        	
        	//debug.print(returnData);
	
            completeCallback(true, returnData);
		}
		else
		{
            var returnData = {
        		'result': "Error getting artist data",
        		status: body.error.status,
        		message: body.error.message
        	};
        	
            completeCallback(false, returnData);
		}
    });
}

//getArtistsInfo

getArtistsInfo = function(access_token, spotifyData, completeCallback)
{
    var artistIdString = "";
    
    for(var i = 0; i < spotifyData.artistIds.length; ++i)
    {
        artistIdString += spotifyData.artistIds[i];
        
        if(i < spotifyData.artistIds.length - 1)
        {
            artistIdString += ",";
        }
    }
        
    //debug.print("getArtistInfo");
    var getUrl = 'https://api.spotify.com/v1/artists?ids=' + artistIdString;
    //debug.print(getUrl);
    
    var options = {
      url: getUrl,
      headers: { 'Authorization': 'Bearer ' + access_token },
      json: true
    };

    // use the access token to access the Spotify Web API
    request.get(options, function(error, response, body)
    {
		if (!error && response.statusCode === 200)
		{
		    var artistList = [];
		    
		    if(body.artists != null)
		    {
		        body.artists.forEach(artist =>
		        {
                    var artistData = {
                		artist_name: artist.name,
                		id: artist.id,
                		popularity: artist.popularity,
                		genres: artist.genres,
                		followers: artist.followers.total
                	};
                	
		            artistList.push(artistData);
		        });
		    }
		    else
		    {
                var artistData = {
            		artist_name: body.name,
            		id: body.id,
            		popularity: body.popularity,
            		genres: body.genres,
            		followers: body.followers.total
            	};
            	
            	artistList.push(artistData);
		    }
	
            completeCallback(true, artistList);
		}
		else
		{
            var returnData = {
        		'result': "Error getting artist data",
        		status: body.error.status,
        		message: body.error.message
        	};
        	
            completeCallback(false, returnData);
		}
    });
}

//likeSongsInList

var likeSongsInList = function(access_token, spotifyData, songList, completeCallback)
{
    //debug.print("likeSongsInList");
    
	var likes = [];
	
	getSongLikes(access_token, 0, songList, likes,
		function(success, songList2, likeList2)
		{
		    if(success)
		    {
			    likeSongs(access_token, 0, songList2, likeList2, completeCallback);
		    }
		    else
		    {
		        completeCallback(false,{
			        total_songs : 0,
			        new_songs : 0
			    });
		    }
		}
	);
}

//likeAllSongs

var likeAllSongs = function(access_token, spotifyData, completeCallback)
{
    //debug.print("likeAllSongs");
    
    var songs = [];
	
	getSongList(access_token, spotifyData.playlist_id, 0, songs,
		function(success, songList)
		{
		    if(success)
		    {
    			var likes = [];
    			
    			getSongLikes(access_token, 0, songList, likes,
    				function(success, songList2, likeList2)
    				{
    				    if(success)
    				    {
    					    likeSongs(access_token, 0, songList2, likeList2, completeCallback);
    				    }
    				    else
    				    {
            		        completeCallback(false,{
            			        total_songs : 0,
            			        new_songs : 0
            			    });
    				    }
    				}
    			);
		    }
		    else
		    {
		        completeCallback(false,{
			        total_songs : 0,
			        new_songs : 0
			    });
		    }
		}
	);
}

//unlikeAllSongs

unlikeAllSongs = function(access_token, spotifyData, completeCallback)
{
	var songs = [];
	
	getSongList(access_token, spotifyData.playlist_id, 0, songs,
		function(success, songList)
		{
		    if(success)
		    {
    			var likes = [];
    			
    			getSongLikes(access_token, 0, songList, likes,
    				function(success, songList2, likeList2)
    				{
    				    if(success)
    				    {
    					    unlikeSongs(access_token, 0, songList2, likeList2, completeCallback);
    				    }
    				    else
    				    {
            		        completeCallback(false,{
            			        total_songs : 0,
            			        new_songs : 0
            			    });
    				    }
    				}
    			);
		    }
		    else
		    {
		        completeCallback(false,{
			        total_songs : 0,
			        new_songs : 0
			    });
		    }
		}
	);
}

//followAllArtists

followAllArtists = function(access_token, spotifyData, completeCallback)
{
    debug.print("followAllArtists");
	var artists = [];
	
	getArtistList(access_token, spotifyData.playlist_id, 0, artists, 
		function(success, artistList)
		{
		    if(success)
		    {
    			var following = [];
    			
    			getArtistsFollowing(access_token, 0, artistList, following,
    				function(success, artistList2, followingList2)
    				{
    				    if(success)
    				    {
    					    followArtists(access_token, 0, artistList2, followingList2, completeCallback);
    				    }
    				    else
    				    {
            		        completeCallback(false,{
            		            total_artists : 0,
            		            new_artists : 0
            			    });
    				    }
    				}
    			);
    		}
		    else
		    {
		        completeCallback(false,{
		            total_artists : 0,
		            new_artists : 0
			    });
		    }
		}
	);
}

//followAllLeadArtists

followAllLeadArtists = function(access_token, spotifyData, completeCallback)
{
    //debug.print("followAllLeadArtists");
	var artists = [];
	
	getLeadArtistList(access_token, spotifyData.playlist_id, 0, artists, 
		function(success, artistList)
		{
		    if(success)
		    {
    			var following = [];
    			
    			getArtistsFollowing(access_token, 0, artistList, following,
    				function(success, artistList2, followingList2)
    				{
    				    if(success)
    				    {
    					    followArtists(access_token, 0, artistList2, followingList2, completeCallback);
    				    }
    				    else
    				    {
            		        completeCallback(false,{
            		            total_artists : 0,
            		            new_artists : 0
            			    });
    				    }
    				}
    			);
		    }
		    else
		    {
		        completeCallback(false,{
		            total_artists : 0,
		            new_artists : 0
			    });
		    }
		}
	);
}

//followArtistsInList

followArtistsInList = function(access_token, spotifyData, artistList, completeCallback)
{
    //debug.print("followArtistsInList");

	var following = [];
	
	getArtistsFollowing(access_token, 0, artistList, following,
		function(success, artistList2, followingList2)
		{
		    if(success)
		    {
			    followArtists(access_token, 0, artistList2, followingList2, completeCallback);
		    }
		    else
		    {
		        completeCallback(false,{
		            total_artists : 0,
		            new_artists : 0
			    });
		    }
		}
	);
}

//unfollowAllArtists

unfollowAllArtists = function(access_token, spotifyData, completeCallback)
{
	var artists = [];
	
	getArtistList(access_token, spotifyData.playlist_id, 0, artists,
		function(success, artistList)
		{
		    if(success)
		    {
    			var following = [];
    			
    			getArtistsFollowing(access_token, 0, artistList, following,
    				function(success, artistList2, followingList2)
    				{
    				    if(success)
    				    {
    					    unfollowArtists(access_token, 0, artistList2, followingList2, completeCallback);
    				    }
    				    else
    				    {
            		        completeCallback(false,{
            		            total_artists : 0,
            		            new_artists : 0
            			    });
    				    }
    				}
    			);
		    }
		    else
		    {
		        completeCallback(false,{
		            total_artists : 0,
		            new_artists : 0
			    });
		    }
		}
	);
}

//followAllPlaylists

followAllPlaylists = function(access_token, spotifyData, completeCallback)
{
    //debug.print("followAllPlaylists");
	var usersPlaylists = [];
	
	getPlaylistList(access_token, 0, usersPlaylists,
		function(success, usersPlaylistList)
		{
		    if(success)
		    {
		        followPlaylists(access_token, 0, usersPlaylistList, spotifyData.playlists, completeCallback);
		    }
		    else
		    {
        	    completeCallback(false,{
                    total_playlists : 0,
                    new_playlists : 0
                });
		    }
		}
	);
}

//analyzePlaylist

analyzePlaylist = function(access_token, spotifyData, completeCallback)
{
    //debug.print("analyzePlaylist");
    
	var artists = [];
	var songs = [];
	var following = [];
	var likes = [];
	var recent = [];
	var topArtists = [];
	var topSongs = [];
	
	getArtistList(access_token, spotifyData.playlist_id, 0, artists, function(success, artistList)
	{
		getArtistsFollowing(access_token, 0, artistList, following, function(success, artistList, followingList)
		{
        	getSongList(access_token, spotifyData.playlist_id, 0, songs, function(success, songList)
    		{
    			getSongLikes(access_token, 0, songList, likes,	function(success, songList, likeList)
				{
				    getRecentSongsHelper(access_token, recent, function(token, recentSongs)
				    {
    				    getTopArtists(access_token, topArtists, function(token, topArtistList)
    				    {
        				    getTopSongs(access_token, topSongs, function(token, topSongsList)
        				    {
        				        getPlaylistName(access_token, spotifyData.playlist_id, function(token, playlistName)
        				        {
                				    calculatePlaylistNumbers(playlistName, artists, songs, following, likes, recent, topArtists, topSongs, completeCallback);
        				        });
        				    });
    				    });
				    });
				});
    		});
		});
	});
}

//getPlaylistListInfo
getPlaylistListInfo = function(access_token, spotifyData, completeCallback)
{
    var playlistNames = [];
    
    if(spotifyData.playlists != null && spotifyData.playlists.length > 0)
    {
        getPlaylistListInfoHelper(access_token, 0, spotifyData.playlists, playlistNames, completeCallback);
    }
}

//likeAllEpisodes

var likeAllEpisodes = function(access_token, spotifyData, completeCallback)
{
    //debug.print("likeAllEpisodes");
    
    var episodes = [];
	
	getEpisodeList(access_token, spotifyData.playlist_id, 0, episodes,
		function(success, episodeList)
		{
		    if(success)
		    {
    			var likes = [];
    			
    			getEpisodeLikes(access_token, 0, episodeList, likes,
    				function(success, episodeList2, likeList2)
    				{
    				    if(success)
    				    {
    					    likeEpisodes(access_token, 0, episodeList2, likeList2, completeCallback);
    				    }
    				    else
    				    {
		                    debug.print("error getting saved episode list from Spotify");
                            completeCallback(false,{
                    	        total_episodes : 0,
                    	        new_episodes : 0
                    	    });
    				    }
    				}
    			);
		    }
		    else
		    {
		        debug.print("error getting episode list from Spotify");
                completeCallback(false,{
        	        total_episodes : 0,
        	        new_episodes : 0
        	    });
		    }
		}
	);
}

//followAllShows

followAllShows = function(access_token, spotifyData, completeCallback)
{
    //debug.print("followAllShows");
	var shows = [];
	
	getShowList(access_token, spotifyData.playlist_id, 0, shows, 
		function(success, showList)
		{
		    if(success)
		    {
    			var following = [];
    			
    			getShowsFollowing(access_token, 0, showList, following,
    				function(success, showList2, followingList2)
    				{
    				    if(success)
    				    {
    					    followShows(access_token, 0, showList2, followingList2, completeCallback);
    				    }
            		    else
            		    {
                	        completeCallback(false,{
                		        total_shows : 0,
                		        new_shows : 0
                		    });
            		    }
    				}
    			);
		    }
		    else
		    {
    	        completeCallback(false,{
    		        total_shows : 0,
    		        new_shows : 0
    		    });
		    }
		}
	);
}

//getRecentSongs

getRecentSongs = function(access_token, spotifyData, completeCallback)
{
    //debug.print("getRecentSongs");
	
	var urlString = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	var recent = new Object();
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			if(body != null && body.items != null)
			{
			    var noContextStreams = 0;
			    
			    for (var i = 0; i < body.items.length; i++)
                {
                    var playlistIdString = "";
                    
                    if(body.items[i].context != null)
                    {
                        var playlistId = body.items[i].context.uri;
                        //playlistId.replace("spotify:playlist:", "");
                        var strArray = playlistId.split(":");
                        
                        playlistIdString = strArray[2];
                    }
                    else
                    {
                        ++noContextStreams;
                        playlistIdString = "noContext";
                    }
                    
                    if(recent[playlistIdString] == null)
                    {
                        recent[playlistIdString] = new Object();
                        recent[playlistIdString].id = playlistIdString;
                        recent[playlistIdString].streams = [];
                    }
                        
                    var epoch = Date.parse(body.items[i].played_at);
                    var timeAsDate = new Date(epoch);
                    
                    recent[playlistIdString].streams.push({trackId: body.items[i].track.id,
                        playlistId: playlistIdString,
                        timestamp: timeAsDate,
                        duration: Number(body.items[i].track.duration_ms)
                    });
                }
                
                if(noContextStreams > 0)
                {
                    debug.print("No Context Streams:" + noContextStreams);
                }
			}
			
			getRecentPlaylistsInfo(access_token, spotifyData, recent, completeCallback);
		}
		else
		{
			debug.print("error calling:" + urlString);
			//debug.print(response);
			//debug.print(response.body);
			debug.print(response.body.error);
			debug.print(response.body.error.message);
		    completeCallback(false, {recent: recent, 'error':error, 'message':response.body.error.message});
		}
	});
}

// getSongInfo

getSongInfo = function(access_token, spotifyData, completeCallback)
{
    var tracks = [];
    
    getSongInfoHelper(access_token, spotifyData, 0, tracks, completeCallback);
}

function getSongInfoHelper(access_token, spotifyData, index, tracks, completeCallback)
{
    //debug.print("getSongInfoHelper:" + index + ", " + spotifyData.songs.length);
    
    if(index >= spotifyData.songs.length || spotifyData.songs.length == 0)
    {
        completeCallback(true, {'tracks':tracks});
    }
    else
    {
    	var urlString = 'https://api.spotify.com/v1/tracks?ids=';
    	
    	var songs = [];
    	
    	var startIndex = index;
    	
    	for (; (index < spotifyData.songs.length) && ((index - startIndex) < 50); index++)
    	{
    	    songs.push(spotifyData.songs[index]);
    	}
    	
    	for(var i = 0; i < songs.length; ++i)
    	{
    	    if(i >= (songs.length - 1))
    	    {
    			urlString += songs[i];
    	    }
    	    else
    	    {
    			urlString += songs[i] + ",";
    	    }
    	}
    	
    	//debug.print(urlString);
    	
    	var options = {
    	  url: urlString,
    	  headers: { 'Authorization': 'Bearer ' + access_token },
    	  json: true
    	};
    	
    	var recent = new Object();
    	
    	// use the access token to access the Spotify Web API
    	request.get(options, function(error, response, body)
    	{
    		if (!error && response.statusCode === 200)
    		{
    			if(body != null && body.tracks != null)
    			{
    	            body.tracks.forEach(track =>
    	            {
    	                if(track != null)
    	                {
        	                var isrc = null;
        	            
            	            if(track.external_ids != null && track.external_ids.isrc != null)
            	            {
            	                isrc = track.external_ids.isrc;
            	            }
            	            
            	            var imgURL = null;
            	            var width = 99999;
            	            
            	            if(track.album != null && track.album.images != null)
            	            {
            	                track.album.images.forEach(image =>
        	                    {
        	                        if(image.width < width)
        	                        {
        	                            width = image.width;
        	                            imgURL = image.url;
        	                        }
        	                    });
            	            }
        	            
        	                tracks.push({
        	                    'artistId': track.artists[0].id,
        	                    'artistName': track.artists[0].name,
        	                    'trackId': track.id,
        	                    'trackName': track.name,
        	                    'popularity': track.popularity,
        	                    'isrc': isrc,
        	                    'imgURL': imgURL
        	                });
    	                }
    	            });
    	            
    		        getSongInfoHelper(access_token, spotifyData, index + 1, tracks, completeCallback);
    			}
    			else
    			{
    			    debug.print("error here:" + urlString);
    		        completeCallback(false, {'error':"this error here"});
    			}
    		}
    		else
    		{
    			debug.print("error calling:" + urlString);
    			//debug.print(response);
    			//debug.print(response.body);
    			debug.print(response.body.error);
    			debug.print(response.body.error.message);
    		    completeCallback(false, {'error':error, 'message':response.body.error.message});
    		}
    	});
    }
}

// ********************* Helper Functions ********************* 

// getRecentSongs

var getRecentPlaylistsInfo = function(access_token, spotifyData, recent, callback) {
    
    var playlistInfoComplete = true;
    
	for(var key in recent)
	{
	    if(recent[key].name == null)
	    {
	        playlistInfoComplete = false;
	        getPlaylistName(access_token, recent[key].id, function(token, playlistName)
        	{
        	    recent[key].name = playlistName;
        	    getRecentPlaylistsInfo(access_token, spotifyData, recent, callback);
        	});
        	break;
	    }
	}
	
	if(playlistInfoComplete)
	{
	    //debug.print(recent);
		callback(true, {recent: recent});
	}
}

// getPlaylistInfo

getPlaylistInfo = function(access_token, spotifyData, completeCallback)
{
	debug.print("getPlaylistInfo");
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + spotifyData.playlistId;
	
	debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
	    debug.print("returned getPlaylistInfo");
		if (!error && response.statusCode === 200)
		{
	        debug.print("No Error getPlaylistInfo");
		    var tracks = [];
		    
		    if(body.tracks.items != null && body.tracks.items.length > 0)
		    {
		        body.tracks.items.forEach(track =>
		        {
		            var song = track.track;
		            
		            var artistList = [];
		            
            	    song.artists.forEach(artist =>
            	    {
            	        var artistData = {
                	        'id':artist.id,
                	        'name':artist.name
            	        };
            	        
            	        artistList.push(artistData);
            	    });
            	    
		            var trackElement =
		            {
		                id: song.id,
		                name: song.name,
		                artists: artistList
		            };
		            
		            tracks.push(trackElement);
		        });
		    }
		    
	        returnData = {
	            name: body.name,
	            id: body.id,
	            description: body.description,
	            snapshotId: body.snapshot_id,
	            tracks: tracks,
	            image: (body.images != null && body.images.length > 0 ? body.images[0].url : null)
	        };
		    
		    if(body.tracks.next != null)
		    {
    		    options.url = body.tracks.next;
    		    getPlaylistInfoTracks(options, returnData, completeCallback);
		    }
		    else
		    {
		        //debug.print(returnData);
		        completeCallback(true, {results:returnData});
		    }
		}
		else
		{
			debug.print("error calling:" + urlString);
			//debug.print(response);
			//debug.print(response.body);
			debug.print(response.body.error);
			debug.print(response.body.error.message);
		    completeCallback(false, {'error':error, 'message':response.body.error.message});
		}
	});
}

function getPlaylistInfoTracks(options, returnData, completeCallback)
{
    request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
		    if(body.items != null && body.items.length > 0)
		    {
		        body.items.forEach(track =>
		        {
		            var song = track.track;
		            
		            if(song != null)
		            {
    		            var artistList = [];
    		            
                	    song.artists.forEach(artist =>
                	    {
                	        var artistData = {
                    	        'id':artist.id,
                    	        'name':artist.name
                	        };
                	        
                	        artistList.push(artistData);
                	    });
                	    
    		            var trackElement =
    		            {
    		                id: song.id,
    		                name: song.name,
    		                artists: artistList
    		            };
    		            
    		            returnData.tracks.push(trackElement);
		            }
		        });
		        
    		    if(body.next != null)
    		    {
        		    options.url = body.next;
        		    getPlaylistInfoTracks(options, returnData, completeCallback);
    		    }
    		    else
    		    {
    		        //debug.print(returnData);
    		        completeCallback(true, {results:returnData});
    		    }
		    }
		    else
		    {
		        //debug.print(returnData);
		        completeCallback(true, {results:returnData});
		    }
		}
		else
		{
			debug.print("error calling:" + urlString);
			debug.print(error);
			debug.print(response);
			debug.print(response.body);
			debug.print(response.body.error);
			debug.print(response.body.error.message);
		    completeCallback(false, {'error':error, 'message':response.body.error.message});
		}
	});
}

// fillPlaylist

function fillPlaylist(access_token, spotifyData, shuffledPlaylist, completeCallback)
{
	debug.print("fillPlaylist");
	
    fillPlaylistHelper(access_token, spotifyData, 0, shuffledPlaylist, completeCallback);
}

function fillPlaylistHelper(access_token, spotifyData, index, shuffledPlaylist, completeCallback)
{
	debug.print("fillPlaylistHelper:" + spotifyData.playlistId + ": " + index);
	
    if(index >= shuffledPlaylist.length)
    {
        completeCallback(true, {});
    }
    else
    {
    	var urlString = 'https://api.spotify.com/v1/playlists/' + spotifyData.playlistId + '/tracks';
    	
    	debug.print(urlString);
    	
    	var tracks = [];
    	
    	var start = index;
    	var max = index + 100;
    	
    	for(;(index < max && index < shuffledPlaylist.length); ++index)
    	{
    	    var uriString = "spotify:track:" + shuffledPlaylist[index].id;
    	    tracks.push(uriString);
    	}
    	
    	tracks.forEach(track =>
    	{
    	    debug.print(track);
    	});
    	
    	var options = {
            url: urlString,
            headers: { 'Authorization': 'Bearer ' + access_token },
            body:{"uris":tracks,"position":start},
            json: true
    	};
    	
    	debug.print("options.body");
    	debug.print(options.body);
    	
    	// use the access token to access the Spotify Web API
    	request.post(options, function(error, response, body)
    	{
    	    if (!error && (response.statusCode == 200 || response.statusCode == 201))
    		{
    		    fillPlaylistHelper(access_token, spotifyData, index, shuffledPlaylist, completeCallback);
    		}
    		else
    		{
    			debug.print("error calling:" + urlString);
    			debug.print("response.statusCode:" + response.statusCode);
    			debug.print(response);
    			debug.print(response.body);
    			debug.print(response.body.error);
    			//debug.print(response.body.error.message);
    		    completeCallback(false, {'error':error, 'message':response.body.error.message});
    		}
    	});
    }
}

// clearPlaylistSongs

clearPlaylistSongs = function(access_token, spotifyData, completeCallback)
{
	debug.print("clearPlaylistSongs");
	
	getPlaylistInfo(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            debug.print(results.results.name);
            debug.print(results.results.snapshotId);
            
            if(results.results.tracks != null && results.results.tracks.length > 0)
            {
                clearPlaylistSongsHelper(access_token, spotifyData, results.results, completeCallback);
            }
            else
            {
                completeCallback(true, {});
            }
        }
        else
        {
            completeCallback(false, {});
        }
    });
}

function clearPlaylistSongsHelper(access_token, spotifyData, playlistInfo, completeCallback)
{
    debug.print("clearPlaylistSongsHelper");
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlistInfo.id + '/tracks';
	
	debug.print(urlString);
	
	var tracks = [];
	
	for(var i = 0; (i < 100 && i < playlistInfo.tracks.length); ++i)
	{
	    var uriString = "spotify:track:" + playlistInfo.tracks[i].id;
	    tracks.push({"uri": uriString});
	}
	
	tracks.forEach(track =>
	{
	    debug.print(track);
	});
	
	var options = {
        url: urlString,
        headers: { 'Authorization': 'Bearer ' + access_token },
        body:{"tracks":tracks,"snapshot_id":playlistInfo.snapshotId},
        json: true
	};
	
	debug.print("options.body");
	debug.print(options.body);
	
	// use the access token to access the Spotify Web API
	request.delete(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
		    clearPlaylistSongs(access_token, spotifyData, completeCallback);
		}
		else
		{
			debug.print("error calling:" + urlString);
			//debug.print(response);
			debug.print(response.body);
			debug.print(response.body.error);
			debug.print(response.body.error.message);
		    completeCallback(false, {'error':error, 'message':response.body.error.message});
		}
	});
}

// clearSongsFromArtists

clearSongsFromArtists = function(access_token, spotifyData, artistIds, completeCallback)
{
	debug.print("clearSongsFromArtists");
	
    getPlaylistInfo(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            var playlistInfo = results.results;
            
            debug.print(results.results.name);
            debug.print(results.results.snapshotId);
            debug.print(artistIds.length);
            
            if(results.results.tracks != null && results.results.tracks.length > 0)
            {
                clearSongsFromArtistsHelper(access_token, spotifyData, results.results, artistIds, completeCallback);
            }
            else
            {
                completeCallback(true, {});
            }
        }
        else
        {
            completeCallback(false, 
            {
                'result': "Error",
                'error': error,
                'message': 'getPlaylistInfo error'
            });
        }
    });
}

function clearSongsFromArtistsHelper(access_token, spotifyData, playlistInfo, artistIds, completeCallback)
{
    debug.print("clearSongsFromArtistsHelper");
	
    if(playlistInfo.tracks != null && playlistInfo.tracks.length > 0)
    {
    	var urlString = 'https://api.spotify.com/v1/playlists/' + playlistInfo.id + '/tracks';
        
    	debug.print(urlString);
    	
    	var tracks = [];
	
        for(var i = 0; i < playlistInfo.tracks.length && tracks.length < 100; ++i)
        {
            var isTrackToRemove = false;
            
            if(playlistInfo.tracks[i].artists != null && playlistInfo.tracks[i].artists.length > 0)
            {
                playlistInfo.tracks[i].artists.forEach(artist =>
                {
                    var foundArtist = null;
                    foundArtist = artistIds.find((dbArtist) => dbArtist == artist.id);
                    if(foundArtist != undefined)
                    {
                        isTrackToRemove = true;
                    }
                });
            }
            
            if(isTrackToRemove)
            {
        	    var uriString = "spotify:track:" + playlistInfo.tracks[i].id;
        	    tracks.push({"uri": uriString});
            }
        }
        
        if(tracks.length > 0)
        {
        	var options = {
                url: urlString,
                headers: { 'Authorization': 'Bearer ' + access_token },
                body:{"tracks":tracks,"snapshot_id":playlistInfo.snapshotId},
                json: true
        	};
        	
        	// use the access token to access the Spotify Web API
        	request.delete(options, function(error, response, body)
        	{
        		if (!error && response.statusCode === 200)
        		{
        		    clearSongsFromArtists(access_token, spotifyData, artistIds, completeCallback);
        		}
        		else
        		{
        			debug.print("error calling:" + urlString);
        			//debug.print(response);
        			debug.print(response.body);
        			debug.print(response.body.error);
        			debug.print(response.body.error.message);
        		    completeCallback(false, {'error':error, 'message':response.body.error.message});
        		}
        	});
        }
        else
        {
            completeCallback(true, {});
        }
    }
    else
    {
        completeCallback(true, {});
    }
}

// clonePlaylist

function clonePlaylist(access_token, spotifyData, completeCallback)
{
	debug.print("clonePlaylist");
	debug.print("source:" + spotifyData.sourcePlaylistId);
	debug.print("destination:" + spotifyData.destinationPlaylistId);
	
	//1. Clear Destination Songs
	//2. Get Source Songs
	//3. Get Destination SnapshotId
	//3. Copy Source Songs -> Destination
	
	spotifyData.playlistId = spotifyData.destinationPlaylistId;
	
	//1. Clear Destination Songs
	clearPlaylistSongs(access_token, spotifyData, function(success, clearResults)
    {
        if(success)
        {
	        //2. Get Source Songs
	        spotifyData.playlistId = spotifyData.sourcePlaylistId;
        	getPlaylistInfo(access_token, spotifyData, function(success, sourceResults)
            {
                if(success)
                {
                    debug.print(sourceResults.results.name);
                    debug.print(sourceResults.results.snapshotId);
                    
                    if(sourceResults.results.tracks != null && sourceResults.results.tracks.length > 0)
                    {
                    	spotifyData.playlistId = spotifyData.destinationPlaylistId;
                    	
                    	getPlaylistInfo(access_token, spotifyData, function(success, destResults)
                        {
                            if(success)
                            {
                                debug.print(destResults.results.name);
                                debug.print(destResults.results.snapshotId);
                                
                                clonePlaylistHelper(access_token, 0, spotifyData, sourceResults.results, destResults.results, completeCallback);
                            }
                            else
                            {
                                completeCallback(false, {});
                            }
                        });
                    }
                    else
                    {
                        debug.print("No songs in source playlist:" + spotifyData.sourcePlaylistId);
                        completeCallback(true, {});
                    }
                }
                else
                {
                    debug.print("Error getting info for playlist:" + spotifyData.sourcePlaylistId);
                    completeCallback(false, {});
                }
            });
        }
        else
        {
            debug.print("Error clearing playlist:" + spotifyData.destinationPlaylistId);
            completeCallback(false, {});
        }
    });
}

function clonePlaylistHelper(access_token, index, spotifyData, sourceInfo, destInfo, completeCallback)
{
    debug.print("clonePlaylistHelper");
    
    if(index >= sourceInfo.tracks.length)
    {
        completeCallback(true, {});
    }
    else
    {
    	var urlString = 'https://api.spotify.com/v1/playlists/' + spotifyData.destinationPlaylistId + '/tracks';
    	
    	debug.print(urlString);
    	
    	var tracks = [];
    	
    	var start = index;
    	var max = index + 100;
    	
    	for(;(index < max && index < sourceInfo.tracks.length); ++index)
    	{
    	    var uriString = "spotify:track:" + sourceInfo.tracks[index].id;
    	    tracks.push(uriString);
    	}
    	
    	tracks.forEach(track =>
    	{
    	    debug.print(track);
    	});
    	
    	var options = {
            url: urlString,
            headers: { 'Authorization': 'Bearer ' + access_token },
            body:{"uris":tracks,"position":start},
            json: true
    	};
    	
    	debug.print("options.body");
    	debug.print(options.body);
    	
    	// use the access token to access the Spotify Web API
    	request.post(options, function(error, response, body)
    	{
    	    if (!error && (response.statusCode == 200 || response.statusCode == 201))
    		{
    		    clonePlaylistHelper(access_token, index, spotifyData, sourceInfo, destInfo, completeCallback);
    		}
    		else
    		{
    			debug.print("error calling:" + urlString);
    			//debug.print(response);
    			debug.print(response.body);
    			debug.print(response.body.error);
    			//debug.print(response.body.error.message);
    		    completeCallback(false, {'error':error, 'message':response.body.error.message});
    		}
    	});
    }
}

//login / callback Helpers

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

//getPlaylistListInfo Helpers

getPlaylistListInfoHelper = function(access_token, index, playlistIds, playlistNames, completeCallback)
{
    if(index >= playlistIds.length)
    {
        var returnData = {
    		playlist_names: playlistNames
    	};
        	
        completeCallback(access_token, returnData);
    }
    else
    {
        getPlaylistName(access_token, playlistIds[index], function(token, playlistName)
        {
            playlistNames.push(playlistName);
    	    getPlaylistListInfoHelper(token, index + 1, playlistIds, playlistNames, completeCallback);
        });
    }
}

//analyzePlaylist Helpers

var getPlaylistName = function(access_token, playlist_id, callback)
{
	//debug.print("getPlaylistName");
	
	var urlString = '	https://api.spotify.com/v1/playlists/' + playlist_id;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			callback(access_token, body.name);
		}
		else
		{
			callback(access_token, "Private Playlist");
		}
	});
}

var getTopArtists = function(access_token, artists, callback)
{
	//debug.print("getTopArtists");
	
	var urlString = 'https://api.spotify.com/v1/me/top/artists?limit=50';
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			if(body != null && body.items != null)
			{
                for (var i = 0; i < body.items.length; i++)
                {
                    artists.push(body.items[i].id);
                }
			}
			
			callback(access_token, artists);
		}
		else
		{
			debug.print("error calling:" + urlString);
			debug.print(response);
		}
	});
}

var getTopSongs = function(access_token, songs, callback)
{
	//debug.print("getTopArtists");
	
	var urlString = 'https://api.spotify.com/v1/me/top/tracks?limit=50';
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			if(body != null && body.items != null)
			{
                for (var i = 0; i < body.items.length; i++)
                {
                    songs.push(body.items[i].id);
                }
			}
			
			callback(access_token, songs);
		}
		else
		{
			debug.print("error calling:" + urlString);
			debug.print(response);
		}
	});
}

var getRecentSongsHelper = function(access_token, songs, callback)
{
	//debug.print("getRecentSongsHelper");
	
	var urlString = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			if(body != null && body.items != null)
			{
                for (var i = 0; i < body.items.length; i++)
                {
                    songs.push(body.items[i].track.id);
                }
			}
			
			callback(access_token, songs);
		}
		else
		{
			debug.print("error calling:" + urlString);
			debug.print(response);
		}
	});
}

var calculatePlaylistNumbers = function(playlistName, artists, songs, following, likes, recent, topArtists, topSongs, completeCallback )
{
    //debug.print("calculatePlaylistNumbers");
    
    var num_songs_on_playlist = 0;
    if(songs != null & songs.length != 0)
    {
        num_songs_on_playlist = songs.length;
    }
    var num_songs_liked = 0;
    if(likes != null & likes.length != 0)
    {
        for (i = 0; i < likes.length; i++)
        {
            if(likes[i])
            {
                ++num_songs_liked;
            }
        }
    }
    
    var num_artists_on_playlist = 0;
    if(artists != null & artists.length != 0)
    {
        num_artists_on_playlist = artists.length;
    }
    var num_artists_liked = 0;
    if(following != null & following.length != 0)
    {
        for (i = 0; i < following.length; i++)
        {
            if(following[i])
            {
                ++num_artists_liked;
            }
        }
    }
    
    var num_recently_played = 0;
    var num_recently_played_from_playlist = 0;
    if(recent != null & recent.length != 0)
    {
        num_recently_played = recent.length;
        
        if(songs != null & songs.length != 0)
        {
            for(i = 0; i < recent.length; ++i)
            {
                for(j = 0; j < songs.length; ++j)
                {
                    if(recent[i] == songs[j])
                    {
                        ++num_recently_played_from_playlist;
                        break;
                    }
                }
            }
        }
    }
    
    var num_top_artists = 0;
    var num_top_artists_on_playlist = 0;
    if(topArtists != null & topArtists.length != 0)
    {
        num_top_artists = topArtists.length;
        
        if(artists != null & artists.length != 0)
        {
            for(i = 0; i < topArtists.length; ++i)
            {
                for(j = 0; j < artists.length; ++j)
                {
                    if(topArtists[i] == artists[j])
                    {
                        ++num_top_artists_on_playlist;
                        break;
                    }
                }
            }
        }
    }
    
    var num_top_songs = 0;
    var num_top_songs_on_playlist = 0;
    if(topSongs != null & topSongs.length != 0)
    {
        num_top_songs = topSongs.length;
        
        if(songs != null & songs.length != 0)
        {
            for(i = 0; i < topSongs.length; ++i)
            {
                for(j = 0; j < songs.length; ++j)
                {
                    if(topSongs[i] == songs[j])
                    {
                        ++num_top_songs_on_playlist;
                        break;
                    }
                }
            }
        }
    }
    
    var returnData = {
		playlist_name: playlistName,
		num_songs_on_playlist: num_songs_on_playlist,
		num_songs_liked: num_songs_liked,
		num_artists_on_playlist: num_artists_on_playlist,
		num_artists_liked: num_artists_liked,
		num_recently_played: num_recently_played,
		num_recently_played_from_playlist: num_recently_played_from_playlist,
		num_top_artists: num_top_artists,
		num_top_artists_on_playlist: num_top_artists_on_playlist,
		num_top_songs: num_top_songs,
		num_top_songs_on_playlist: num_top_songs_on_playlist
	};

    completeCallback(true, returnData); 
}

//followAllPlaylists Helpers

var getPlaylistList = function(access_token, offset, playlists, callback)
{
	//debug.print("getPlaylistList - " + offset);
	
	var urlString = 'https://api.spotify.com/v1/me/playlists?limit=' + GET_USERS_PLAYLISTS_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    playlists.push(body.items[i].id);
			}
			
			if(body.next != null)
			{
				getPlaylistList(access_token, (offset + GET_USERS_PLAYLISTS_MAX), playlists, callback);
			}
			else
			{
				callback(true, playlists);
			}
		}
		else
		{
		    callback(false, null);
		}
	});
}

var getPlaylistOverlap = function(userPlaylists, nasPlaylists)
{
    var overlap = 0;
    
	for (i = 0; i < nasPlaylists.length; i++)
	{
	    for(j = 0; j < userPlaylists.length; j++)
	    {
	        if(nasPlaylists[i].id == userPlaylists[j])
	        {
	            ++overlap;
	            break;
	        }
	    }
	}
	
	return overlap;
}

var followPlaylists = function(access_token, offset, userPlaylists, nasPlaylists, callback)
{	
	//debug.print("followPlaylists - offset:" + offset);
	
	if(nasPlaylists == null)
	{
	    callback(false,{
            total_playlists : 0,
            new_playlists : 0
        });
	}
	else if(offset >= nasPlaylists.length)
	{
	    var newPlaylists = nasPlaylists.length - getPlaylistOverlap(userPlaylists, nasPlaylists);
	    
        callback(true,{
            total_playlists : nasPlaylists.length,
            new_playlists : newPlaylists
        });
	}
	else
	{
	    var found = false;
	    
	    for(i = 0; i < userPlaylists.length; ++i)
	    {
	        if(nasPlaylists[offset].id == userPlaylists[i])
	        {
	            found = true;
	            break;
	        }
	    }
	    
	    if(found)
	    {
    	    followPlaylists(access_token, offset + 1, userPlaylists, nasPlaylists, callback);
	    }
	    else
	    {
    	    var urlString = 'https://api.spotify.com/v1/playlists/' + nasPlaylists[offset].id + '/followers';
    	    
        	//debug.print(urlString);
        	
        	var options = {
        	  url: urlString,
        	  headers: { 'Authorization': 'Bearer ' + access_token },
        	  json: true
        	};
        	
        	// use the access token to access the Spotify Web API
        	request.put(options, function(error, response, body)
        	{	
        		if (!error && response.statusCode === 200)
        		{
            	    followPlaylists(access_token, offset + 1, userPlaylists, nasPlaylists, callback);
        		}
        		else
               	{
            	    callback(false,{
                        total_playlists : 0,
                        new_playlists : 0
                    });
        		}
        	});
	    }
	}
}


//likeAllSongs / unlikeAllSongs Helpers

var getLikedSongs= function(songs, likes)
{
	var count = likes.length;
	if(songs.length < likes.length)
	{
		count = songs.length;
	}
	
	var likedSongs = [];
	
	for (i = 0; i < count; i++)
	{
		if(likes[i])
		{
			likedSongs.push(songs[i]);
		}
	}
	
	return likedSongs;
}

var getUnlikedSongs = function(songs, likes)
{
	var count = likes.length;
	if(songs.length < likes.length)
	{
		count = songs.length;
	}
	
	var unlikedSongs = [];
	
	for (i = 0; i < count; i++)
	{
		if(!likes[i])
		{
			unlikedSongs.push(songs[i]);
		}
	}
	
	return unlikedSongs;
}

var likeSongs = function(access_token, offset, songs, likes, callback)
{	
	var unlikedSongs = getUnlikedSongs(songs, likes);
	
	//debug.print("likeSongs - offset:" + offset + " - unliked songs: " + unlikedSongs.length);
	
	if(unlikedSongs.length == 0)
	{
		if(songs != null)
	    {
		    callback(true, {
		        total_songs : songs.length,
		        new_songs : 0
		    });
	    }
	    else
	    {
	        callback(false,{
		        total_songs : 0,
		        new_songs : 0
		    });
	    }
		return;
	}
	
	var tracks = "";
	
	var count = offset + GET_SAVES_MAX;
	var isLastCall = false;
	
	if(count >= unlikedSongs.length)
	{
		isLastCall = true;
		count = unlikedSongs.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			tracks += unlikedSongs[i] + ",";
		}
		else
		{
			tracks += unlikedSongs[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/tracks?ids=' + tracks;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.put(options, function(error, response, body)
	{
		if(isLastCall)
		{
		    if(callback != null)
			{
			    if(songs != null)
			    {
				    callback(true, {
				        total_songs : songs.length,
				        new_songs : count
				    });
			    }
			    else
			    {
			        callback(false,{
				        total_songs : 0,
				        new_songs : count
				    });
			    }
			}
		}
		else
		{
			likeSongs(access_token, offset + GET_SAVES_MAX, songs, likes, callback);
		}
	});
}

var unlikeSongs = function(access_token, offset, songs, likes, callback)
{	
	var likedSongs = getLikedSongs(songs, likes);
	
	//debug.print("unlikeSongs - offset:" + offset + " - liked songs: " + likedSongs.length);
	
	if(likedSongs.length == 0)
	{
	    if(songs != null)
	    {
		    callback(true, {
		        total_songs : songs.length,
		        new_songs : 0
		    });
	    }
	    else
	    {
	        callback(false,{
		        total_songs : 0,
		        new_songs : 0
		    });
	    }
		return;
	}
	
	var tracks = "";
	
	var count = offset + GET_SAVES_MAX;
	var isLastCall = false;
	
	if(count >= likedSongs.length)
	{
		isLastCall = true;
		count = likedSongs.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			tracks += likedSongs[i] + ",";
		}
		else
		{
			tracks += likedSongs[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/tracks?ids=' + tracks;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.delete(options, function(error, response, body)
	{
		if(isLastCall)
		{
			if(callback != null)
			{
			    if(songs != null)
			    {
				    callback(true, {
				        total_songs : songs.length,
				        new_songs : count
				    });
			    }
			    else
			    {
			        callback(false,{
				        total_songs : 0,
				        new_songs : count
				    });
			    }
			}
		}
		else
		{
			unlikeSongs(access_token, offset + GET_SAVES_MAX, songs, likes, callback);
		}
	});
}

var getSongLikes = function(access_token, offset, songs, likes, callback)
{
	//debug.print("getSongLikes - " + offset);
	
	var tracks = "";
	
	var count = offset + GET_LIKES_MAX;
	var isLastCall = false;
	
	if(count >= songs.length)
	{
		isLastCall = true;
		count = songs.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			tracks += songs[i] + ",";
		}
		else
		{
			tracks += songs[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/tracks/contains?ids=' + tracks;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.length; i++)
			{
				likes.push(body[i]);
			}
			
			if(isLastCall)
			{
				callback(true, songs, likes);
			}
			else
			{
				getSongLikes(access_token, offset + GET_LIKES_MAX, songs, likes, callback);
			}
		}
		else
		{
		    callback(false, null, null);
		}
	});
}

var getSongList = function(access_token, playlist_id, offset, songs, callback)
{
	//debug.print("getSongList - " + offset);
	
	var NON_PLAYLIST_SONGS = ["390gbaBo9SOh4FbyUKgFJV", "0T4szuqGk9PZpcYgSHzL5f", "71BJZk5Zb8EJKqJEo8cfcA"];
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks?limit=' + GET_PLAYLIST_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    if(body.items[i].track != null && body.items[i].track.type == "track")
			    {
			        songs.push(body.items[i].track.id);
			    }
			}
			
			if(body.next != null)
			{
				getSongList(access_token, playlist_id, (offset + GET_PLAYLIST_MAX), songs, callback);
			}
			else
			{
			    for(i = 0; i < NON_PLAYLIST_SONGS.length; ++i)
			    {
			        var found = false;
			        
			        for(j = 0; j < songs.length; ++j)
			        {
			            if(NON_PLAYLIST_SONGS[i] == songs[j])
			            {
    			            found = true;
    			            break;
			            }
			        }
			        
			        if(!found)
			        {
			            songs.push(NON_PLAYLIST_SONGS[i]);
			        }
			    }
			    
			    callback(true, songs);
			}
		}
		else
		{
    	    callback(false, null);
		}
	});
}

//followAllArtists / unfollowAllArtists Helpers

var getArtistList = function(access_token, playlist_id, offset, artists, callback)
{
	//debug.print("getArtistList - " + offset);
	
	var NON_PLAYLIST_ARTISTS = ["6dTgcutI99Dk87XSGUA2lb"];
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks?limit=' + GET_PLAYLIST_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    if(body.items[i].track != null && body.items[i].track.type == "track")
			    {
    				for(j = 0; j < body.items[i].track.artists.length; j++)
    				{
    				    var alreadyContains = false;
    				    for(k = 0; k < artists.length; k++)
    				    {
    				        if(artists[k] == body.items[i].track.artists[j].id)
    				        {
    				            alreadyContains = true;
    				            break;
    				        }
    				    }
    				    
    				    if(!alreadyContains)
    				    {
    					    artists.push(body.items[i].track.artists[j].id);
    				    }
    				}
			    }
			}
			
			if(body.next != null)
			{
				getArtistList(access_token, playlist_id, (offset + GET_PLAYLIST_MAX), artists, callback);
			}
			else
			{
			    for(i = 0; i < NON_PLAYLIST_ARTISTS.length; ++i)
			    {
			        var found = false;
			        
			        for(j = 0; j < artists.length; ++j)
			        {
			            if(NON_PLAYLIST_ARTISTS[i] == artists[j])
			            {
    			            found = true;
    			            break;
			            }
			        }
			        
			        if(!found)
			        {
			            artists.push(NON_PLAYLIST_ARTISTS[i]);
			        }
			    }
			    
				callback(true, artists);
			}
		}
		else
		{
		    callback(false, null);
		}
	});
}

var getLeadArtistList = function(access_token, playlist_id, offset, artists, callback)
{
	//debug.print("getLeadArtistList - " + offset);
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks?limit=' + GET_PLAYLIST_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    if(body.items[i].track != null && body.items[i].track.type == "track")
			    {
    			    if(body.items[i].track.artists.length > 0)
    			    {
    				    var alreadyContains = false;
    				    for(j = 0; j < artists.length; j++)
    				    {
    				        if(artists[j] == body.items[i].track.artists[0].id)
    				        {
    				            alreadyContains = true;
    				            break;
    				        }
    				    }
    				    
    				    if(!alreadyContains)
    				    {
    					    artists.push(body.items[i].track.artists[0].id);
    				    }
    			    }
			    }
			}
			
			if(body.next != null)
			{
				getLeadArtistList(access_token, playlist_id, (offset + GET_PLAYLIST_MAX), artists, callback);
			}
			else
			{
			    callback(true, artists);
			}
		}
		else
		{
		    callback(false, null);
		}
	});
}

var followArtists = function(access_token, offset, artists, following, callback)
{	
	var unfollowedArtists = getUnfollowedArtists(artists, following);
	
	//debug.print("followArtists - offset:" + offset + " - unfollowed artists: " + unfollowedArtists.length);
	
	if(unfollowedArtists.length == 0)
	{
		if(artists != null)
	    {
		    callback(true, {
		        total_artists : artists.length,
		        new_artists : 0
		    });
	    }
	    else
	    {
	        callback(false,{
		        total_artists : 0,
		        new_artists : 0
		    });
	    }
	    
		return;
	}
	
	var artistsString = "";
	
	var count = offset + GET_FOLLOWING_MAX;
	var isLastCall = false;
	
	if(count >= unfollowedArtists.length)
	{
		isLastCall = true;
		count = unfollowedArtists.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			artistsString += unfollowedArtists[i] + ",";
		}
		else
		{
			artistsString += unfollowedArtists[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistsString;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.put(options, function(error, response, body)
	{	
		if(isLastCall)
		{
		    if(callback != null)
			{
			    if(artists != null)
			    {
				    callback(true, {
				        total_artists : artists.length,
				        new_artists : count
				    });
			    }
			    else
			    {
			        callback(false,{
				        total_artists : 0,
				        new_artists : count
				    });
			    }
			}
		}
		else
		{
			followArtists(access_token, offset + GET_FOLLOWING_MAX, artists, following, callback);
		}
	});
}

var unfollowArtists = function(access_token, offset, artists, following, callback)
{	
	var followedArtists = getFollowedArtists(artists, following);
	
	//debug.print("unfollowArtists - offset:" + offset + " - followed artists: " + followedArtists.length);
	
	if(followedArtists.length == 0)
	{
		if(artists != null)
	    {
		    callback(true, {
		        total_artists : artists.length,
		        new_artists : 0
		    });
	    }
	    else
	    {
	        callback(false,{
		        total_artists : 0,
		        new_artists : 0
		    });
	    }
	    
		return;
	}
	
	var artistsString = "";
	
	var count = offset + GET_FOLLOWING_MAX;
	var isLastCall = false;
	
	if(count >= followedArtists.length)
	{
		isLastCall = true;
		count = followedArtists.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			artistsString += followedArtists[i] + ",";
		}
		else
		{
			artistsString += followedArtists[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/following?type=artist&ids=' + artistsString;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.delete(options, function(error, response, body)
	{	
		if(isLastCall)
		{
		    if(callback != null)
			{
			    if(artists != null)
			    {
				    callback(true, {
				        total_artists : artists.length,
				        new_artists : count
				    });
			    }
			    else
			    {
			        callback(false,{
				        total_artists : 0,
				        new_artists : count
				    });
			    }
			}
		}
		else
		{
			unfollowArtists(access_token, offset + GET_FOLLOWING_MAX, artists, following, callback);
		}
	});
}

var getArtistsFollowing = function(access_token, offset, artists, following, callback)
{
	//debug.print("getArtistsFollowing - " + offset);
	
	var artistString = "";
	
	var count = offset + GET_FOLLOWING_MAX;
	var isLastCall = false;
	
	if(count >= artists.length)
	{
		isLastCall = true;
		count = artists.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			artistString += artists[i] + ",";
		}
		else
		{
			artistString += artists[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/following/contains?type=artist&ids=' + artistString;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.length; i++)
			{
				following.push(body[i]);
			}
			
			if(isLastCall)
			{
				callback(true, artists, following);
			}
			else
			{
				getArtistsFollowing(access_token, offset + GET_FOLLOWING_MAX, artists, following, callback);
			}
		}
		else
		{
		    callback(false, null, null);
		}
	});
}

var getFollowedArtists = function(artists, following)
{
	var count = following.length;
	if(artists.length < following.length)
	{
		count = artists.length;
	}
	
	var followedArtists = [];
	
	for (i = 0; i < count; i++)
	{
		if(following[i])
		{
			followedArtists.push(artists[i]);
		}
	}
	
	return followedArtists;
}

var getUnfollowedArtists = function(artists, following)
{
	var count = following.length;
	if(artists.length < following.length)
	{
		count = artists.length;
	}
	
	var unfollowedArtists = [];
	
	for (i = 0; i < count; i++)
	{
		if(!following[i])
		{
			unfollowedArtists.push(artists[i]);
		}
	}
	
	return unfollowedArtists;
}

// likeAllEpisodes Helpers

var getEpisodeList = function(access_token, playlist_id, offset, episodes, callback)
{
	//debug.print("getEpisodeList - " + offset);
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks?limit=' + GET_PLAYLIST_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    if(body.items[i].track != null && body.items[i].track.type == "episode")
			    {
			        episodes.push(body.items[i].track.id);
			    }
			}
			
			if(body.next != null)
			{
				getEpisodeList(access_token, playlist_id, (offset + GET_PLAYLIST_MAX), episodes, callback);
			}
			else
			{
			    callback(true, episodes);
			}
		}
		else
		{
		    callback(false, null);
		}
	});
}

var getEpisodeLikes = function(access_token, offset, episodes, likes, callback)
{
	//debug.print("getEpisodeLikes - " + offset);
	
	var tracks = "";
	
	var count = offset + GET_LIKES_MAX;
	var isLastCall = false;
	
	if(count >= episodes.length)
	{
		isLastCall = true;
		count = episodes.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			tracks += episodes[i] + ",";
		}
		else
		{
			tracks += episodes[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/episodes/contains?ids=' + tracks;
	
	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.length; i++)
			{
				likes.push(body[i]);
			}
			
			if(isLastCall)
			{
				callback(true, episodes, likes);
			}
			else
			{
				getEpisodeLikes(access_token, offset + GET_LIKES_MAX, episodes, likes, callback);
			}
		}
		else
		{
		    callback(false, null, null);
		}
	});
}

var getUnlikedEpisodes = function(episodes, likes)
{
	var count = likes.length;
	if(episodes.length < likes.length)
	{
		count = episodes.length;
	}
	
	var unlikedEpisodes = [];
	
	for (i = 0; i < count; i++)
	{
		if(!likes[i])
		{
			unlikedEpisodes.push(episodes[i]);
		}
	}
	
	return unlikedEpisodes;
}

var likeEpisodes = function(access_token, offset, episodes, likes, callback)
{	
	var unlikedEpisodes = getUnlikedEpisodes(episodes, likes);
	
	debug.print("likeEpisodes - offset:" + offset + " - unliked episodes: " + unlikedEpisodes.length);
	
	if(unlikedEpisodes.length == 0)
	{
		if(episodes != null)
	    {
	        debug.print("episodes == null and unlikedEpisodes.length == 0");
		    callback(true, {
		        total_episodes : episodes.length,
		        new_episodes : 0
		    });
	    }
	    else
	    {
	        debug.print("unlikedEpisodes.length == 0");
	        callback(false,{
		        total_episodes : 0,
		        new_episodes : 0
		    });
	    }
		return;
	}
	
	var tracks = "";
	
	var count = offset + GET_SAVES_MAX;
	var isLastCall = false;
	
	if(count >= unlikedEpisodes.length)
	{
		isLastCall = true;
		count = unlikedEpisodes.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			tracks += unlikedEpisodes[i] + ",";
		}
		else
		{
			tracks += unlikedEpisodes[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/episodes?ids=' + tracks;
	
	debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.put(options, function(error, response, body)
	{
		if(isLastCall)
		{
		    if(callback != null)
			{
			    if(episodes != null)
			    {
				    callback(true, {
				        total_episodes : episodes.length,
				        new_episodes : count
				    });
			    }
			    else
			    {
	                debug.print("lastCall but episodes == null");
			        callback(false,{
				        total_episodes : 0,
				        new_episodes : count
				    });
			    }
			}
		}
		else
		{
			likeEpisodes(access_token, offset + GET_SAVES_MAX, episodes, likes, callback);
		}
	});
}

//followAllShows Helpers

var getShowList = function(access_token, playlist_id, offset, shows, callback)
{
	//debug.print("getShowList - " + offset);
	
	var urlString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks?limit=' + GET_PLAYLIST_MAX + '&offset=' + offset;

	//debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.items.length; i++)
			{
			    if(body.items[i].track != null && body.items[i].track.type == "episode")
			    {
    				for(j = 0; j < body.items[i].track.artists.length; j++)
    				{
    				    var alreadyContains = false;
    				    for(k = 0; k < shows.length; k++)
    				    {
    				        if(shows[k] == body.items[i].track.artists[j].id)
    				        {
    				            alreadyContains = true;
    				            break;
    				        }
    				    }
    				    
    				    if(!alreadyContains)
    				    {
    					    shows.push(body.items[i].track.artists[j].id);
    				    }
    				}
			    }
			}
			
			if(body.next != null)
			{
				getShowList(access_token, playlist_id, (offset + GET_PLAYLIST_MAX), shows, callback);
			}
			else
			{
				callback(true, shows);
			}
		}
		else
		{
			callback(false, null);
		}
	});
}

var getShowsFollowing = function(access_token, offset, shows, following, callback)
{
	debug.print("getShowsFollowing - " + offset);
	
	var showString = "";
	
	var count = offset + GET_FOLLOWING_MAX;
	var isLastCall = false;
	
	if(count >= shows.length)
	{
		isLastCall = true;
		count = shows.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			showString += shows[i] + ",";
		}
		else
		{
			showString += shows[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/shows/contains?ids=' + showString;
	
	debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.get(options, function(error, response, body)
	{
		if (!error && response.statusCode === 200)
		{
			for (i = 0; i < body.length; i++)
			{
				following.push(body[i]);
			}
			
			if(isLastCall)
			{
				callback(true, shows, following);
			}
			else
			{
				getShowsFollowing(access_token, offset + GET_FOLLOWING_MAX, shows, following, callback);
			}
		}
		else
		{
			callback(false, null, null);
		}
	});
}

var getUnfollowedShows = function(shows, following)
{
	var count = following.length;
	if(shows.length < following.length)
	{
		count = shows.length;
	}
	
	var unfollowedShows = [];
	
	for (i = 0; i < count; i++)
	{
		if(!following[i])
		{
			unfollowedShows.push(shows[i]);
		}
	}
	
	return unfollowedShows;
}

var followShows = function(access_token, offset, shows, following, callback)
{	
	var unfollowedShows = getUnfollowedShows(shows, following);
	
	debug.print("followShows - offset:" + offset + " - unfollowed shows: " + unfollowedShows.length);
	
	if(unfollowedShows.length == 0)
	{
		if(shows != null)
	    {
		    callback(true, {
		        total_shows : shows.length,
		        new_shows : 0
		    });
	    }
	    else
	    {
	        callback(false,{
		        total_shows : 0,
		        new_shows : 0
		    });
	    }
	    
		return;
	}
	
	var showsString = "";
	
	var count = offset + GET_FOLLOWING_MAX;
	var isLastCall = false;
	
	if(count >= unfollowedShows.length)
	{
		isLastCall = true;
		count = unfollowedShows.length;
	}
	
	for (i = offset; i < count; i++)
	{
		if(i < (count - 1))
		{
			showsString += unfollowedShows[i] + ",";
		}
		else
		{
			showsString += unfollowedShows[i];
		}
	}
	
	var urlString = 'https://api.spotify.com/v1/me/shows?ids=' + showsString;
	
	debug.print(urlString);
	
	var options = {
	  url: urlString,
	  headers: { 'Authorization': 'Bearer ' + access_token },
	  json: true
	};
	
	// use the access token to access the Spotify Web API
	request.put(options, function(error, response, body)
	{	
		if(isLastCall)
		{
		    if(callback != null)
			{
			    if(shows != null)
			    {
				    callback(true, {
				        total_shows : shows.length,
				        new_shows : count
				    });
			    }
			    else
			    {
			        callback(false,{
				        total_shows : 0,
				        new_shows : count
				    });
			    }
			}
		}
		else
		{
			followShows(access_token, offset + GET_FOLLOWING_MAX, shows, following, callback);
		}
	});
}
	
// refresh the access token

refreshAccessToken = function(client_id, client_secret, refresh_token, completeCallback)
{
    //debug.print("refreshAccessToken");
    //debug.print("client_id:" + client_id);
    //debug.print("client_secret:" + client_secret);
    //debug.print("refresh_token:" + refresh_token);
    var authOptions =
    {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form:
        {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };
    
    request.post(authOptions, function(error, response, body)
    {
        if (!error && response.statusCode === 200)
        {
            var returnData = {
        		access_token: body.access_token
        	};
	
            completeCallback(true, returnData);
        }
        else
        {
            debug.print("- Failed to refresh access token -");
            //debug.print(response);
            //debug.print("------------------------------");
            debug.print(body);
            var returnData = {
                message: "Failed to refresh access token"
        	};
	
            completeCallback(false, returnData);
        }
    });
}