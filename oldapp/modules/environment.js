// environment.js
// ========

module.exports = {
    code: function() {
	    return "nas";
    },
    url: function() {
	    return "http://spotifyfollow.a2hosted.com/";
    },
    passwords: function() {
	    return {
          dev: "",
          reset: ""
        };
    },
    database: function() {
	    return {
          host: "localhost",
          user: "",
          password: "",
          database: ""
        };
    }
};
