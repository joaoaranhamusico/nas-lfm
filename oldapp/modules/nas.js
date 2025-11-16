// nas.js
// ========

var debug = require('./debug.js');

module.exports = {
    initialize: function(logging_enabled) {
	    debug.initialize(logging_enabled);
    },
    getSpacerSongs: function(tag) {
        return getSpacerSongs(tag);
    },
    getLinkSongs: function(tag) {
        return getLinkSongs(tag);
    },
    getNoLikeSongs: function() {
        return getNoLikeSongs();
    },
    getNoFollowArtists: function() {
        return getNoFollowArtists();
    }
};

function getNoLikeSongs()
{
    return [];
}

function getNoFollowArtists()
{
    return [];
}

function getLinkSongs(tag)
{
    return [];
}

function getSpacerSongs(tag)
{
    return [];
}