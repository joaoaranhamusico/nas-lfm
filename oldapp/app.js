/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */
 
var environment = require('./modules/environment.js');
const ENVIRONMENT = environment.code();
const URL = environment.url();

const ERROR_TEXT = "Something went wrong...";

const DEBUG_LOG = true;
var debug = require('./modules/debug.js');
debug.initialize(DEBUG_LOG);

var spotify = require('./modules/spotify.js');
spotify.initialize(DEBUG_LOG);

var nas = require('./modules/nas.js');
nas.initialize(DEBUG_LOG);

var discordData = require('./modules/discordData.js');
var spotifyData = require('./modules/spotifyData.js');

const FOLLOW_LOGGING_ENABLED = false;

const FILTER_FOR_BETA_TEST = false;
const NO_DEMOTIONS = false;
const NO_WEEKLY_LIMIT = false;

const BETA_TESTER_ROLE_ID = discordData.roles().betaTesterId;
const PERSONAL_BREAK_ROLE_ID = discordData.roles().personalBreakId;
const NEW_USER_ROLE_ID = discordData.roles().newUserId;

var force_send_to_follow_channel = function(spotifyData, text)
{
	if(follow_proof_channel != null)
	{
		follow_proof_channel.send(text);
	}
	else
	{
		debug.print("couldn't log " + text + " to follow channel");
	}
}

var force_send_to_admin_channel = function(text)
{
	if(follow_admin_channel != null)
	{
		debug.print("Logging message:" + text);
		follow_admin_channel.send(text);
	}
	else
	{
		debug.print("couldn't log " + text + " to follow admin channel");
	}
}

var force_send_to_reset_admin_channel = function(text)
{
	if(reset_admin_channel != null)
	{
		reset_admin_channel.send(text);
	}
	else
	{
		debug.print("couldn't log " + text + " to reset admin channel");
	}
}

function send_to_account_claim_channel(text)
{
    if(account_claim_channel != null)
    {
        account_claim_channel.send(text);
    }
	else
	{
		debug.print("couldn't log " + text + " to account claim channel");
	}
}

function send_to_bonus_admin_channel(text)
{
    if(bonus_admin_channel != null)
    {
        bonus_admin_channel.send(text);
    }
	else
	{
		debug.print("couldn't log " + text + " to bonus admin channel");
	}
}

function send_to_stats_channel(text)
{
    if(stats_channel != null)
    {
        stats_channel.send(text);
    }
	else
	{
		debug.print("couldn't log " + text + " to stats channel");
	}
}

var send_to_tier = function(text, tier)
{
    if(DISCORD_TIER_CHANNELS[tier] != null)
    {
        DISCORD_TIER_CHANNELS[tier].send(text);
    }
    else if(follow_admin_channel != null)
    {
		follow_admin_channel.send("Couldn't send report to " + tier);
		follow_admin_channel.send(text);
    }
    else
    {
		debug.print("couldn't send to tier " + tier + " or admin");
		debug.print(text);
    }
}

var send_user_message_to_follow_channel = function(spotifyData, text)
{
	var userString = "";
	if(spotifyData != null)
	{
		userString += spotifyData.user_name + "(" + spotifyData.user_id + ") ";
	}
	
	if(follow_proof_channel != null && FOLLOW_LOGGING_ENABLED)
	{
		follow_proof_channel.send(userString + text);
		debug.print("[#" + follow_proof_channel.name + "] " + userString + text);
	}
	else if(FOLLOW_LOGGING_ENABLED)
	{
		debug.print("couldn't log " + userString + text + " to follow channel");
	}
	else
	{
		debug.print("follow logging disabled: " + userString + text);
	}
}

var send_to_follow_channel = function(text)
{
	if(follow_proof_channel != null && FOLLOW_LOGGING_ENABLED)
	{
		follow_proof_channel.send(text);
	}
	else if(FOLLOW_LOGGING_ENABLED)
	{
		debug.print("couldn't log " + text + " to follow channel");
	}
	else
	{
		debug.print("follow logging disabled: " + text);
	}
}

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');

var con = mysql.createConnection(environment.database());

con.connect(function(err) {
  if (err)
  {
      debug.print("error connecting to database");
      debug.print(err);
  }
  else
  {
      debug.print('Success connecting to database as id ' + con.threadId);
  }
});

// Previous Week Text
const PREVIOUS_WEEKS = ["", "PreviousWeek1", "PreviousWeek2"];

// I Love This Playlist Spotify IDs
const SPOTIFY_CLIENT_ID = spotifyData.appData().clientId; // Your client id
const SPOTIFY_CLIENT_SECRET = spotifyData.appData().clientSecret; // Your client secret

const SPOTIFY_REDIRECT_URI = URL + ENVIRONMENT + '/callback/';
const SPOTIFY_ADMIN_REDIRECT_URI = URL + ENVIRONMENT + '/admin_callback/';
const SPOTIFY_MODS_REDIRECT_URI = URL + ENVIRONMENT + '/mods_callback/';
const SPOTIFY_DEV_REDIRECT_URI = URL + ENVIRONMENT + '/dev_callback/';
const SPOTIFY_RESET_REDIRECT_URI = URL + ENVIRONMENT + '/reset_callback/';
const SPOTIFY_TEST_REDIRECT_URI = URL + ENVIRONMENT + '/test_callback/';
const SPOTIFY_INFO_REDIRECT_URI = URL + ENVIRONMENT + '/info_callback/';
const SPOTIFY_INSPECT_REDIRECT_URI = URL + ENVIRONMENT + '/inspect_callback/';
const SPOTIFY_SONGS_REDIRECT_URI = URL + ENVIRONMENT + '/songs_callback/';
const SPOTIFY_PLAYLISTMANAGER_REDIRECT_URI = URL + ENVIRONMENT + '/playlistmanager_callback/';
const SPOTIFY_MODSMENTORS_REDIRECT_URI = URL + ENVIRONMENT + '/modsmentors_callback/';

const SPOTIFY_DEV_ALLOWLIST = spotifyData.allowLists().dev;
const SPOTIFY_RESET_ALLOWLIST = spotifyData.allowLists().reset;
const SPOTIFY_ADMIN_ALLOWLIST = spotifyData.allowLists().admin;
const SPOTIFY_MODS_ALLOWLIST = spotifyData.allowLists().mods;

const SPOTIFY_DEV_PASSWORD = environment.passwords().dev;
const SPOTIFY_RESET_PASSWORD = environment.passwords().reset;

const SPOTIFY_PLAYLIST_ID = spotifyData.playlists().superListId; // N.A.S. Superlist
const SPOTIFY_PLAYLIST_ARRAY = spotifyData.playlists().allLists;
const SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY = spotifyData.playlists().mainLists;
const SPOTIFY_NAS_OFFICIAL_PLAYLIST_ARRAY = spotifyData.playlists().officialLists;
const SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY = spotifyData.playlists().editLists;
const SPOTIFY_NAS_STAGING_USERS = spotifyData.stageUserIds();

const WEEKLY_POINTS_LIMIT = spotifyData.limits().weekly;
    
getNasPlaylistNameFromId = function(playlistId)
{
    for(var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; ++i)
    {
        if(SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].id == playlistId)
        {
            return SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].name;
        }
    }
    
    return "";
}

// Discord IDs
const DISCORD_APP_ID = discordData.appData().appId; // discord client / app id
const DISCORD_BOT_SECRET_TOKEN = discordData.appData().appSecret; // discord app secret

// NAS Discord
const DISCORD_GUILD_ID = discordData.appData().guildId; // NAS "guild" id

const DISCORD_FOLLOW_CHANNEL_ID = discordData.channels().followId; // NAS Follow Channel id
const DISCORD_FOLLOW_ADMIN_CHANNEL_ID = discordData.channels().followAdminId; // NAS Follow Admin Channel id
const DISCORD_RESET_ADMIN_CHANNEL_ID = discordData.channels().resetAdminId; // NAS Reset Admin Channel id
const DISCORD_ACCOUNT_CLAIM_CHANNEL_ID = discordData.channels().accountClaimId; // NAS Account claim Channel id
const DISCORD_BONUS_CHANNEL_ID = discordData.channels().bonusId; // NAS Bonus admin Channel id
const DISCORD_STATS_CHANNEL_ID = discordData.channels().statsId; // NAS Stats Channel id

const DISCORD_FOLLOW_ROLE_ID = discordData.roles().followId; // NAS Follow role id

const DISCORD_TIERS = discordData.tiers();
const DISCORD_MENTOR_ROLE = "962413714970148934"; 
    
const DISCORD_TIER_CHANNELS = new Array(DISCORD_TIERS.length);

const BANNED_LIST = discordData.bannedList();
 
// Discord Stuff
const Discord = require('discord.js')
const discordClient = new Discord.Client()
var follow_proof_channel = null;
var follow_admin_channel = null;
var reset_admin_channel = null;
var account_claim_channel = null;
var bonus_admin_channel = null;
var stats_channel = null;
var discordGuild = null;

function initializeDiscord(completeCallback)
{
    discordClient.on('ready', () => {
        debug.print("Discord connected as " + discordClient.user.tag)
    	
    	discordClient.guilds.fetch(DISCORD_GUILD_ID)
    	.then(guild => {
    		debug.print("Guild Found:" + guild.name);
    		discordGuild = guild;
    		
        	discordClient.channels.fetch(DISCORD_FOLLOW_CHANNEL_ID)
        	.then(channel => {
        		debug.print('Reporting follow proof to #' + channel.name);
        		follow_proof_channel = channel;
        		
            	discordClient.channels.fetch(DISCORD_FOLLOW_ADMIN_CHANNEL_ID)
            	.then(channel => {
            		debug.print('Reporting follow errors to #' + channel.name);
            		follow_admin_channel = channel;
            		
                	discordClient.channels.fetch(DISCORD_RESET_ADMIN_CHANNEL_ID)
                	.then(channel => {
                	    
                		debug.print('Reporting reset admin to #' + channel.name);
                		reset_admin_channel = channel;
                    	
                    	discordClient.channels.fetch(DISCORD_ACCOUNT_CLAIM_CHANNEL_ID)
                    	.then(channel => {
                    	    
                    		debug.print('Reporting account claims to #' + channel.name);
                    		account_claim_channel = channel;
                    		
                        	discordClient.channels.fetch(DISCORD_BONUS_CHANNEL_ID)
                        	.then(channel => {
                        	    
                        		debug.print('Reporting bonus admin to #' + channel.name);
                        		bonus_admin_channel = channel;
                        	            		
                            	discordClient.channels.fetch(DISCORD_STATS_CHANNEL_ID)
                            	.then(channel => {
                            	    
                            		debug.print('Reporting stats to #' + channel.name);
                            		stats_channel = channel;
                            		
                            		fetchDiscordTierChannels(0, completeCallback);
                            	})
                        	    .catch(console.error);
                        	})
                    	    .catch(console.error);
                    	})
                	    .catch(console.error);
                	})
            	    .catch(console.error);
            	})
            	.catch(console.error);
        	})
        	.catch(console.error);
    	})
    	.catch(console.error);
    });
}

initializeDiscord(function(success, results){
    if(success)
    {
        debug.print("All Reporting Channels set up correctly!");
    }
    else
    {
        debug.print("Error initializing discordGuild:" + results.message);
    }
});

fetchDiscordTierChannels = function(index, completeCallback)
{
    if(index >= DISCORD_TIERS.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
		discordClient.channels.fetch(DISCORD_TIERS[index].channelId)
    	.then(channel => {
    		debug.print('Reporting Tier ' + index + ' streams to #' + channel.name);
    		DISCORD_TIER_CHANNELS[index] = channel;
    		fetchDiscordTierChannels(index+1, completeCallback);
    	})
    	.catch(error => {
		    // Error fetching channels
		    debug.print("Error fetching channel " + index);
		    debug.print("Channel Id:" + DISCORD_TIERS[index].channelId);
		    debug.print(error);
		    
		    var returnData = {
        		message: "Couldn't fetch channel " + index
        	};
        	
			completeCallback(false, returnData);
		});
    }
}

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
   
// NAS URL / Login / Callback

app.get('/' + ENVIRONMENT + '/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/ called");
    
    res.sendFile(__dirname + '/public' + '/index.html');
});

app.get('/' + ENVIRONMENT + '/login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/callback/ called");

  spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI, '/' + ENVIRONMENT + '/#', req, res);
});

app.get('/' + ENVIRONMENT + '/user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            res.send({
        		'result': "Success",
        		'display_name': resData.display_name,
        		'id': resData.id
        	});
		}
		else
		{
		    //resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			//debug.print(resData);
			res.send({
        		'result': "Error",
        		'message': resData.message
        	});
		}
	});
});

// NAS Admin URL / Login / Callback

app.get('/' + ENVIRONMENT + '/admin/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/admin/ called");
    
    res.sendFile(__dirname + '/public' + '/index_admin.html');
});

app.get('/' + ENVIRONMENT + '/admin_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/admin_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_ADMIN_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/admin_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/admin_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_ADMIN_REDIRECT_URI, '/' + ENVIRONMENT + '/admin/#', req, res);
});

app.get('/' + ENVIRONMENT + '/admin_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/admin_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_ADMIN_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

app.get('/' + ENVIRONMENT + '/blah', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/ called");
    
    res.sendFile(__dirname + '/public' + '/index.html');
});

// NAS Mods URL / Login / Callback

app.get('/' + ENVIRONMENT + '/mods/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/mods/ called");
    
    res.sendFile(__dirname + '/public' + '/index_mods.html');
});

app.get('/' + ENVIRONMENT + '/mods_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/mods_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_MODS_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/mods_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/mods_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_MODS_REDIRECT_URI, '/' + ENVIRONMENT + '/mods/#', req, res);
});

app.get('/' + ENVIRONMENT + '/mods_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/mods_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_MODS_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// NAS Dev URL / Login / Callback

app.get('/' + ENVIRONMENT + '/dev/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/dev/ called");
    
    res.sendFile(__dirname + '/public' + '/index_dev.html');
});

app.get('/' + ENVIRONMENT + '/dev_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/dev_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_DEV_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/dev_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/dev_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_DEV_REDIRECT_URI, '/' + ENVIRONMENT + '/dev/#', req, res);
});

app.get('/' + ENVIRONMENT + '/dev_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/dev_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_DEV_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// NAS Reset URL / Login / Callback

app.get('/' + ENVIRONMENT + '/reset/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/reset/ called");
    
    res.sendFile(__dirname + '/public' + '/index_reset.html');
});

app.get('/' + ENVIRONMENT + '/reset_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/reset_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_RESET_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/reset_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/reset_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_RESET_REDIRECT_URI, '/' + ENVIRONMENT + '/reset/#', req, res);
});

app.get('/' + ENVIRONMENT + '/reset_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/reset_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_RESET_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// NAS info URL / Login / Callback

app.get('/' + ENVIRONMENT + '/info/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/info/ called");
    
    res.sendFile(__dirname + '/public' + '/index_info.html');
});

app.get('/' + ENVIRONMENT + '/info_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/info_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_INFO_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/info_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/info_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_INFO_REDIRECT_URI, '/' + ENVIRONMENT + '/info/#', req, res);
});

app.get('/' + ENVIRONMENT + '/info_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/info_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_DEV_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    //resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			//debug.print(resData);
			res.send({
        		'result': "Error",
        		'message': resData.message
        	});
		}
	});
});

// NAS songs URL / Login / Callback

app.get('/' + ENVIRONMENT + '/songs/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/songs/ called");
    
    res.sendFile(__dirname + '/public' + '/index_songs.html');
});

app.get('/' + ENVIRONMENT + '/songs_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/songs_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_SONGS_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/songs_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/songs_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_SONGS_REDIRECT_URI, '/' + ENVIRONMENT + '/songs/#', req, res);
});

app.get('/' + ENVIRONMENT + '/songs_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/songs_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            res.send({
        		'result': "Success",
        		'display_name': resData.display_name,
        		'id': resData.id
        	});
		}
		else
		{
		    //resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			//debug.print(resData);
			res.send({
        		'result': "Error",
        		'message': resData.message
        	});
		}
	});
});

// NAS playlist URL

app.get('/' + ENVIRONMENT + '/playlistmanager/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/playlistmanager/ called");
    
    res.sendFile(__dirname + '/public' + '/index_playlistmanager.html');
});

app.get('/' + ENVIRONMENT + '/playlistmanager_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/playlistmanager_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_PLAYLISTMANAGER_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/playlistmanager_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/playlistmanager_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_PLAYLISTMANAGER_REDIRECT_URI, '/' + ENVIRONMENT + '/playlistmanager/#', req, res);
});

app.get('/' + ENVIRONMENT + '/playlistmanager_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/playlistmanager_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_RESET_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// NAS inspect URL / Login / Callback

app.get('/' + ENVIRONMENT + '/inspect/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/inspect/ called");
    
    res.sendFile(__dirname + '/public' + '/index_inspect.html');
});

app.get('/' + ENVIRONMENT + '/inspect_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/inspect_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_INSPECT_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/inspect_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/inspect_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_INSPECT_REDIRECT_URI, '/' + ENVIRONMENT + '/inspect/#', req, res);
});

app.get('/' + ENVIRONMENT + '/inspect_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/inspect_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_ADMIN_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    //resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			//debug.print(resData);
			res.send({
        		'result': "Error",
        		'message': resData.message
        	});
		}
	});
});

// NAS modsmentors URL

app.get('/' + ENVIRONMENT + '/modsmentors/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/modsmentors/ called");
    
    res.sendFile(__dirname + '/public' + '/index_modsmentors.html');
});

app.get('/' + ENVIRONMENT + '/modsmentors_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/modsmentors_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_MODSMENTORS_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/modsmentors_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/modsmentors_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_MODSMENTORS_REDIRECT_URI, '/' + ENVIRONMENT + '/modsmentors/#', req, res);
});

app.get('/' + ENVIRONMENT + '/modsmentors_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/modsmentors_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_RESET_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// NAS test URL

app.get('/' + ENVIRONMENT + '/test/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/test/ called");
    
    res.sendFile(__dirname + '/public' + '/index_devadmin.html');
});

app.get('/' + ENVIRONMENT + '/test_login/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/test_login/ called");
  
  spotify.login(SPOTIFY_CLIENT_ID, SPOTIFY_TEST_REDIRECT_URI, req, res, false);
});

app.get('/' + ENVIRONMENT + '/test_callback/', function(req, res) {
    debug.print("/" + ENVIRONMENT + "/test_callback/ called");

    spotify.loginCallback(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_TEST_REDIRECT_URI, '/' + ENVIRONMENT + '/test/#', req, res);
});

app.get('/' + ENVIRONMENT + '/test_user_info/', function(req, res) {
	debug.print("/" + ENVIRONMENT + "/test_user_info/ called");
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
	};
	
	var access_token = req.query.access_token;
	
	spotify.getUserInfo(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
            debug.print("User Info - " + resData.display_name + " (" + resData.id + ")");
            
            if(SPOTIFY_RESET_ALLOWLIST.includes(resData.id))
            {
                res.send({
            		'result': "Success",
            		'display_name': resData.display_name,
            		'id': resData.id
            	});
            }
            else
            {
    		    resData.result_text = ERROR_TEXT;
    			debug.print("user_info error: " + ERROR_TEXT);
    			debug.print(resData);
    			res.send({
            		'result': "Error"
            	}); 
            }
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("user_info error: " + ERROR_TEXT);
			debug.print(resData);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

// Refresh Callback

app.get('/' + ENVIRONMENT + '/refresh_access_token/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/refresh_access_token/ called");
  
  var refresh_token = req.query.refresh_token;
  
  //debug.print("refresh_token = " + refresh_token);
  
  spotify.refreshAccessToken(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, refresh_token, function(success, results){
        if(success)
        {
            //debug.print("refreshAccessToken success");
            res.send({'result': "Success", 'access_token':results.access_token});
        }
        else
        {
            debug.print("refreshAccessToken error: " + ERROR_TEXT);
            debug.print(results);
			res.send({
        		'result': "Error"
        	});
        }
    });
});

// Other functionality

app.get('/' + ENVIRONMENT + '/like_all/', function(req,res) {
    debug.print("/" + ENVIRONMENT + "/like_all called:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      playlist_id: SPOTIFY_PLAYLIST_ID,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    if(req.query.spotify_id == null || req.query.spotify_id == "" || req.query.spotify_id == 'null')
    {
        debug.print("Null like_all sending 'The access token expired'");
		res.send({'result': "Error", 'message':'The access token expired'});
    }
    else
    {
        spotify.likeAllSongs(access_token, spotifyData, (success, resData) => 
        {
        	if(success)
        	{
        		res.send(resData);
        	}
        	else
        	{
        	    resData.result_text = ERROR_TEXT;
        		debug.print("like_all error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
        	}
        });
    }
});

app.get('/' + ENVIRONMENT + '/follow_all/', function(req,res) {
    debug.print("/" + ENVIRONMENT + "/follow_all called:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      playlist_id: SPOTIFY_PLAYLIST_ID,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
  
    var access_token = req.query.access_token;
    		
    spotify.followAllLeadArtists(access_token, spotifyData, (success, resData) => 
    {
    	if(success)
    	{
    		res.send(resData);
    	}
    	else
    	{
    	    resData.result_text = ERROR_TEXT;
    		debug.print("follow_all error: " + ERROR_TEXT);
			res.send({
        		'result': "Error"
        	});
    	}
    });
});

app.get('/' + ENVIRONMENT + '/follow_all_playlists/', function(req,res) {
  debug.print("/" + ENVIRONMENT + "/follow_all_playlists called:" + req.query.spotify_id);
  
    var spotifyData = {
	  refresh_token: req.query.refresh_token,
	  user_name: req.query.spotify_name,
	  user_id: req.query.spotify_id,
	  playlists: SPOTIFY_PLAYLIST_ARRAY
    };
  
	var access_token = req.query.access_token;
			
	spotify.followAllPlaylists(access_token, spotifyData, (success, resData) => 
	{
		if(success)
		{
			res.send(resData);
		}
		else
		{
		    resData.result_text = ERROR_TEXT;
			debug.print("follow_all_playlists error: " + ERROR_TEXT);
			res.send({
        		'result': "Error"
        	});
		}
	});
});

app.get('/' + ENVIRONMENT + '/like_all_episodes/', function(req,res) {
    debug.print("/" + ENVIRONMENT + "/like_all_episodes called:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      playlist_id: SPOTIFY_PLAYLIST_ID,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    spotify.likeAllEpisodes(access_token, spotifyData, (success, resData) => 
    {
    	if(success)
    	{
    		//debug.print("like_all_episodes success!");
    		res.send(resData);
    	}
    	else
    	{
    	    resData.result_text = ERROR_TEXT;
    		debug.print("like_all_episodes error: " + ERROR_TEXT);
			res.send({
        		'result': "Error"
        	});
    	}
    });
});

app.get('/' + ENVIRONMENT + '/follow_all_shows/', function(req,res) {
    debug.print("/" + ENVIRONMENT + "/follow_all_shows called:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      playlist_id: SPOTIFY_PLAYLIST_ID,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    spotify.followAllShows(access_token, spotifyData, (success, resData) => 
    {
    	if(success)
    	{
    		//debug.print("follow_all_shows success!");
    		res.send(resData);
    	}
    	else
    	{
    	    resData.result_text = ERROR_TEXT;
    		debug.print("follow_all_shows error: " + ERROR_TEXT);
			res.send({
        		'result': "Error"
        	});
    	}
    });
});

app.get('/' + ENVIRONMENT + '/follow_like_report/', function(req, res) {
  debug.print("/" + ENVIRONMENT + "/follow_like_report called:" + req.query.spotify_id);
	
	var spotifyData = {
		refresh_token: req.query.refresh_token,
		user_name: req.query.spotify_name,
		user_id: req.query.spotify_id,
        playlists: SPOTIFY_PLAYLIST_ARRAY
	};

	var access_token = req.query.access_token;
	
    var selectArtistSql = "SELECT * FROM MasterArtistList";
    
    //debug.print(selectArtistSql);
    
    con.query(selectArtistSql, function (error, masterArtistListResult, fields)
    {
        if (error)
        {
            debug.print("error selecting from table MasterArtistList");
            debug.print(error);
            
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'error selecting from table MasterArtistList'
            });
        }
        else
        {
            var masterArtistList = [];
            
            masterArtistListResult.forEach(artist =>
            {
                masterArtistList.push(artist.spotifyId);
            });
            
            spotify.followArtistsInList(access_token, spotifyData, masterArtistList, (success, followArtistResData) => 
        	{
        		if(success)
        		{
        		    //debug.print("Success following all artists total_artists:" + followArtistResData.total_artists + ", new_artists:" + followArtistResData.new_artists);
        		    
                    var selectSongSql = "SELECT * FROM MasterSongList";
                    
                    //debug.print(selectSongSql);
                    
                    con.query(selectSongSql, function (error, masterSongListResult, fields)
                    {
                        if (error)
                        {
                            debug.print("error selecting from table MasterSongList");
                            debug.print(error);
                            
                            completeCallback(false, 
                            {
                                'result': "Error",
                                'message': 'error selecting from table MasterSongList'
                            });
                        }
                        else
                        {
                            var masterSongList = [];
                            
                            masterSongListResult.forEach(artist =>
                            {
                                masterSongList.push(artist.spotifyId);
                            });
                            
                            spotify.likeSongsInList(access_token, spotifyData, masterSongList, (success, likeSongsResData) => 
                        	{
                        		if(success)
                        		{
                        		    //debug.print("Success liking all songs total_songs:" + likeSongsResData.total_songs + ", new_songs:" + likeSongsResData.new_songs);

                                	spotify.followAllPlaylists(access_token, spotifyData, (success, followPlaylistsResData) => 
                                	{
                                		if(success)
                                		{
                        		            //debug.print("Success following all playlists total_playlists:" + followPlaylistsResData.total_playlists + ", new_playlists:" + followPlaylistsResData.new_playlists);

                                            getDiscordId(spotifyData.user_id, function(success, results)
                                		    {
                                                if(success)
                                                {
                                                    //debug.print("discordId success");
                                                    //debug.print("discordId: " + results.discordId);
                                                    
                                					assignDiscordFollowRole(results.discordId, (success, resData) => 
                                					{
                                						if(success)
                                						{
                                                            //debug.print("Role Assigned for Spotify User:" + spotifyData.user_id + ", discord user:" + resData.discord_id);
                                                            
                                							force_send_to_follow_channel(spotifyData, "<@" + resData.discord_id + "> has been assigned the " + resData.role_name + " role");
                                								
                                							res.send({
                                                		        'result': "Success",
                                                				'total_artists': followArtistResData.total_artists,
                                                				'new_artists': followArtistResData.new_artists,
                                                				'total_songs': likeSongsResData.total_songs,
                                                				'new_songs': likeSongsResData.new_songs,
                                                				'total_playlists': followPlaylistsResData.total_playlists,
                                                				'new_playlists': followPlaylistsResData.new_playlists,
                                								'result_text': resData.message
                                							});
                                						}
                                						else
                                						{
                                						    if(spotifyData != null && spotifyData.user_name != null && spotifyData.user_id != null)
                                						    {
                                								send_to_account_claim_channel("Follow proof submitted for Spotify user " + spotifyData.user_name + " (" + spotifyData.user_id + ").\nIf this Spotify account belongs to you reply to this message and <@800116130315632660> or <@194204292972937226> will add it as soon as possible");
                                								
                                								res.send({
                                                		            'result': "Success",
                                                    				'total_artists': followArtistResData.total_artists,
                                                    				'new_artists': followArtistResData.new_artists,
                                                    				'total_songs': likeSongsResData.total_songs,
                                                    				'new_songs': likeSongsResData.new_songs,
                                                    				'total_playlists': followPlaylistsResData.total_playlists,
                                                    				'new_playlists': followPlaylistsResData.new_playlists,
                                									'result_text': "Follow Proof complete, please visit the #claim-your-account channel on the NAS discord for instructions."
                                								});
                                						    }
                                						    else
                                						    {
                                                                debug.print("null data in follow proof after failed assignDiscordFollowRole");
                                                                debug.print(spotifyData == null ? "spotifyData == null" : "spotifyData != null");
                                                                debug.print(spotifyData.user_name == null ? "spotifyData.user_name == null" : "spotifyData.user_name != null");
                                                                debug.print(spotifyData.user_id == null ? "spotifyData.user_id == null" : "spotifyData.user_id != null");
                                                                debug.print("req.query.spotify_name:" + req.query.spotify_name);
                                                                debug.print("req.query.spotify_id:" + req.query.spotify_id);
                                						        
                                								res.send({
                                                		            'result': "Success",
                                                    				'total_artists': followArtistResData.total_artists,
                                                    				'new_artists': followArtistResData.new_artists,
                                                    				'total_songs': likeSongsResData.total_songs,
                                                    				'new_songs': likeSongsResData.new_songs,
                                                    				'total_playlists': followPlaylistsResData.total_playlists,
                                                    				'new_playlists': followPlaylistsResData.new_playlists,
                                									'result_text': "Follow Proof complete."
                                								});
                                						    }
                                						}
                                					});
                                                }
                                                else
                                                {
                        						    if(spotifyData != null && spotifyData.user_name != null && spotifyData.user_id != null)
                        						    {
                            							send_to_account_claim_channel("Follow proof submitted for Spotify user " + spotifyData.user_name + " (" + spotifyData.user_id + ").\nIf this Spotify account belongs to you reply to this message and <@800116130315632660> or <@194204292972937226> will add it as soon as possible");
                            							
                            							res.send({
                                        		            'result': "Success",
                                            				'total_artists': followArtistResData.total_artists,
                                            				'new_artists': followArtistResData.new_artists,
                                            				'total_songs': likeSongsResData.total_songs,
                                            				'new_songs': likeSongsResData.new_songs,
                                            				'total_playlists': followPlaylistsResData.total_playlists,
                                            				'new_playlists': followPlaylistsResData.new_playlists,
                            								'result_text': "Follow Proof complete, please visit the #claim-your-account channel on the NAS discord for instructions."
                            							});
                                					}
                                					else
                                					{
                        						        debug.print("Null data in follow proof after failed getDiscordId");
                                                        debug.print(spotifyData == null ? "spotifyData == null" : "spotifyData != null");
                                                        debug.print(spotifyData.user_name == null ? "spotifyData.user_name == null" : "spotifyData.user_name != null");
                                                        debug.print(spotifyData.user_id == null ? "spotifyData.user_id == null" : "spotifyData.user_id != null");
                                                        debug.print("req.query.spotify_name:" + req.query.spotify_name);
                                                        debug.print("req.query.spotify_id:" + req.query.spotify_id);
                        						        
                        								res.send({
                                        		            'result': "Success",
                                            				'total_artists': followArtistResData.total_artists,
                                            				'new_artists': followArtistResData.new_artists,
                                            				'total_songs': likeSongsResData.total_songs,
                                            				'new_songs': likeSongsResData.new_songs,
                                            				'total_playlists': followPlaylistsResData.total_playlists,
                                            				'new_playlists': followPlaylistsResData.new_playlists,
                        									'result_text': "Follow Proof complete."
                        								});
                                					}
                                                }
                                            });
                                		}
                                		else
                                		{
                                			debug.print("follow_all_playlists error: " + ERROR_TEXT);
                        			        force_send_to_admin_channel("Error following all playlists for " + spotifyData.user_name + " (" + spotifyData.user_id + ") " + followPlaylistsResData.message);
                                			res.send({
                                        		'result': "Error",
                                				'error': "Error following all playlists",
            									'result_text': "Error following all playlists"
                                        	});
                                		}
                                	});
                        		}
                        		else
                        		{
                        			debug.print("follow_like_report error on liking all songs: " + likeSongsResData.message);
                        			force_send_to_admin_channel("Error liking all songs for " + spotifyData.user_name + " (" + spotifyData.user_id + ") " + likeSongsResData.message);
                        			res.send({
                        		        'result': "Error",
                        				'error': "Error liking all songs",
    									'result_text': "Error liking all songs"
                        			});
                        		}
                        	});
                        }
                    });
        		}
        		else
        		{
        			debug.print("follow_like_report error on following all artists: " + followArtistResData.message);
        			force_send_to_admin_channel("Error following all artists for " + spotifyData.user_name + " (" + spotifyData.user_id + ") " + followArtistResData.message);
        			res.send({
        		        'result': "Error",
        				'error': "Error following all artists",
        				'result_text': "Error following all artists"
        			});
        		}
        	});
        }
    });
});

app.get('/' + ENVIRONMENT + '/user_submit/', function(req,res) {
    
    debug.print("/" + ENVIRONMENT + "/user_submit called:" + req.query.spotify_name + "(" + req.query.spotify_id + ")");
    
    if(req.query.spotify_id == null || req.query.spotify_id == "" || req.query.spotify_id == 'null')
    {
        debug.print("Null user_submit sending 'The access token expired'");
		res.send({'result': "Error", 'message':'The access token expired'});
    }
    else
    {
        var spotifyData = {
          refresh_token: req.query.refresh_token,
          user_name: req.query.spotify_name,
          user_id: req.query.spotify_id
        };
        
        var newHoursByPlaylist = [];
        var hoursByPlaylist = [];
        var latestTimestampByPlaylist = [];
        
        for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
        {
           newHoursByPlaylist.push(-1);
           hoursByPlaylist.push(-1);
           latestTimestampByPlaylist.push(new Date(0));
        }
        
        var recent = {
            'songs': -1,
            'hours': -1,
            'nonNasHours': -1,
            'totalNasHours': -1,
            'invalidHours': -1,
            'alreadyCountedNasHours': -1,
            'newNasHours': -1,
            'newHoursByPlaylist': newHoursByPlaylist,
            'latestTimestampByPlaylist': latestTimestampByPlaylist,
            'nonNasPlaylistIds': [],
            'nonNasPlaylistNames': []
        };
        
        var total = {
            'hours': 0,
            'hoursByPlaylist': hoursByPlaylist,
            'bonusPoints': 0,
            'numAccounts': 0
        };
        
        var streamData = {
            'spotifyData': spotifyData,
            'recent': recent,
            'total': total,
            'discordId': "",
            'spotifyIds': []
        }
        
        var access_token = req.query.access_token;
        
        if(spotifyData.user_id  != null && spotifyData.user_id != "")
        {
            var pointTotal = 0.0;
            
            if(NO_WEEKLY_LIMIT)
            {
                userSubmit(access_token, spotifyData, streamData, function(success, results)
                {
                    if(success)
                    {
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("userSubmit Failure");
                        res.send({'result': "Error", 'message': results.message});
                    }
                });
            }
            else
            {
                var query = "SELECT SUM(points) AS total FROM Points WHERE spotifyId = '" + spotifyData.user_id + "';";
                
                //debug.print(query);
                
                con.query(query, function (error, results, fields)
                {
                    //debug.print(results);
                    if (!error)
                    {
                        pointTotal = results[0].total;
                        
                        if(pointTotal >= WEEKLY_POINTS_LIMIT)
                        {
                            // Point Limit reached send message
                            
                            getDiscordId(spotifyData.user_id, function(success, results)
                            {
                                if(success)
                                {
                                    var discordId = results.discordId;
                                    
                                    debug.print("Overstreaming for user:" + discordId + " with point total:" + pointTotal);
                                    
                                    var message = "Point limit reached for <@" + discordId + ">  with user account https://open.spotify.com/user/" + spotifyData.user_id;
                                    force_send_to_admin_channel(message);
                                    
                                    discordGuild.members.fetch(discordId)
                                	.then(member => {
                                		member.fetch(true)
                                		.then(member => {
                                		    debug.print("Found user for overstream warning:" + member.user.username);
                                		    
                                		    var overstreamMessage = "User account https://open.spotify.com/user/" + spotifyData.user_id + " has reached their points limit for the week. No more points will be accepted until after the next points reset. Thanks!";
                                		    member.user.send(overstreamMessage);
                                		    
                                            res.send({'result': "Error", 'message': "Point Limit Reached"});
                                		})
                                		.catch(error => {
                                    	    debug.print("Couldn't fetch discord member 1:" + discordId);
                                    	    debug.print(error);
                                            res.send({'result': "Error", 'message': "Point Limit Reached"});
                                		});
                                	})
                                	.catch(error => {
                                	    // Couldn't find member
                                	    debug.print("Couldn't find discord member 2:" + discordId);
                                	    debug.print(error);
                                        res.send({'result': "Error", 'message': "Point Limit Reached"});
                                	});
                                }
                                else
                                {
                                    var message = "Point limit reached for unknown user with user account https://open.spotify.com/user/" + spotifyData.user_id;
                                    force_send_to_admin_channel(message);
                                    
                                    res.send({'result': "Error", 'message': "Point Limit Reached"});
                                }
                            });
                        }
                        else
                        {
                            userSubmit(access_token, spotifyData, streamData, function(success, results)
                            {
                                if(success)
                                {
                                    //debug.print("sendStreamDataToDiscord Success");
                                    res.send({'result': "Success"});
                                }
                                else
                                {
                                    debug.print("userSubmit Failure");
                                    res.send({'result': "Error", 'message': results.message});
                                }
                            });
                        }
                    }
                    else
                    {
                        userSubmit(access_token, spotifyData, streamData, function(success, results)
                        {
                            if(success)
                            {
                                //debug.print("sendStreamDataToDiscord Success");
                                res.send({'result': "Success"});
                            }
                            else
                            {
                                debug.print("userSubmit Failure");
                                res.send({'result': "Error", 'message': results.message});
                            }
                        });
                    }
                });
            }
        }
        else
        {
            debug.print("No spotifyId provided for current user, must fail");
            res.send({'result': "Error", 'message':'Authentication Error'});
        }
    }
});

function userSubmit(access_token, spotifyData, streamData, completeCallback)
{
    spotify.getRecentSongs(access_token, spotifyData, (success, resData) => 
    {
    	if(success)
    	{
    	    updateStreamDataWithRecent(access_token, resData.recent, streamData, function(success, streamupdateResult)
    	    {
                if(streamData.recent.nonNasPlaylistNames != null && streamData.recent.nonNasPlaylistNames.length > 0)
                {
                    streamData.recent.nonNasPlaylistNames.forEach(playlistName =>
                    {
                        debug.print("Non-NAS Stream: " + spotifyData.user_name + " - " + playlistName);
                    });
                }
                
                if(success)
                {
            	    writeRecentStreamsToDB(spotifyData.user_id, resData.recent, streamData, function(success, writeRecentResult){
            	        
            	        if(success)
                        {
                            writePointsToDB(streamData, function(success, results)
                            {
                                if(success)
                                {
                                    //debug.print("Update Points Success now get discordId, all spotifyIds and update streamData");
                                    
                                    updateStreamDataWithTotals(streamData, function(success, results)
                                    {
                                        if(success)
                                        {
                                            //debug.print("updateStreamDataWithTotals Success");
                                            //debug.print(streamData);
                                            
                                            if(streamData != null && streamData.spotifyData != null && streamData.spotifyData.user_name != null && streamData.spotifyData.user_id != null)
                                            {
                                                var streamReport = createStreamReport(streamData);
                                                
                                                sendStreamDataToDiscord(streamData.discordId, streamReport, function(success, results)
                                                {
                                                    if(success)
                                                    {
                                                        //debug.print("sendStreamDataToDiscord Success");
                                                        completeCallback(true, {'result': "Success"});
                                                    }
                                                    else
                                                    {
                                                        debug.print("sendStreamDataToDiscord Failure");
                                                        completeCallback(false, {'result': "Error", 'message':"Failure communicating with Discord"});
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                completeCallback(false, {'result': "Error", 'message':"Error with stream data or spotify data or something"});
                                            }
                                        }
                                        else
                                        {
                                            debug.print("updateStreamDataWithTotals Failure");
                                            completeCallback(false, {'result': "Error", 'message':"Error updating stream data"});
                                        }
                                    });
                                }
                                else
                                {
                                    debug.print("Update Points Failure");
                                    completeCallback(false, {'result': "Error", 'message':"Error updating points"});
                                }
                            });
                        }
                        else
                        {
                    	    //resData.result_text = ERROR_TEXT;
                    		debug.print("user_submit error writing recent streams: " + ERROR_TEXT);
                    		completeCallback(false, {'result': "Error", 'message':"Error writing streams"});
                        }
            	    });
                }
                else
                {
            		debug.print("user_submit error updating streams with recent streams: " + ERROR_TEXT);
            		completeCallback(false, {'result': "Error", 'message':"Error updating stream data"});
                }
    	    });
    	}
    	else
    	{
    	    //resData.result_text = ERROR_TEXT;
    		debug.print("user_submit error retrieving from Spotify");
    		debug.print(resData);
    		var message = ERROR_TEXT;
    		if(resData != null && resData.message != null)
    		{
    		    message = resData.message;
    		}
    		
    		if(message == 'The access token expired')
    		{
    		    debug.print("access token expired!");
    		}
			completeCallback(false, {'result': "Error", 'message':message});
    	}
    });
}

authenticate = function(spotifyData)
{
    var authenticated = (SPOTIFY_DEV_ALLOWLIST.includes(spotifyData.user_id) && SPOTIFY_DEV_PASSWORD == spotifyData.text_box);
    debug.print("authenticate:" + spotifyData.user_id + (authenticated ? " true" : " false"));

    return authenticated;
}

adminAuthenticate = function(spotifyData)
{
    var authenticated = (SPOTIFY_ADMIN_ALLOWLIST.includes(spotifyData.user_id));
    debug.print("adminAuthenticate:" + spotifyData.user_id + (authenticated ? " true" : " false"));

    return authenticated;
}

resetAuthenticate = function(spotifyData)
{
    var authenticated = (SPOTIFY_RESET_ALLOWLIST.includes(spotifyData.user_id) && SPOTIFY_RESET_PASSWORD == spotifyData.text_box);
    debug.print("resetAuthenticate:" + spotifyData.user_id + (authenticated ? " true" : " false"));

    return authenticated;
}

modAuthenticate = function(spotifyData)
{
    debug.print("modAuthenticate:" + spotifyData.user_id);
    return (SPOTIFY_MODS_ALLOWLIST.includes(spotifyData.user_id));
}

app.get('/' + ENVIRONMENT + '/drop_tables/', function(req,res) {
    
    debug.print("drop_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(authenticate(spotifyData))
    {
        /*dropTables("", function(success, results){
            if(success)
            {
                debug.print("Success dropping tables");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("Failure dropping tables");
                res.send({'result': "Error"});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/create_tables/', function(req,res) {
    
    debug.print("create_tables called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(authenticate(spotifyData))
    {
        /*createTables("", function(success, results){
            if(success)
            {
                debug.print("Success creating main tables");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("Failure creating main tables");
                res.send({'result': "Error"});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/drop_backup_tables/', function(req,res) {
    
    debug.print("drop_backup_tables called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(authenticate(spotifyData))
    {
        /*dropTables("PreviousWeek1", function(success, results){
            if(success)
            {
                debug.print("Success dropping PreviousWeek1 tables");
                dropTables("PreviousWeek2", function(success, results){
                    if(success)
                    {
                        debug.print("Success dropping PreviousWeek2 tables");
                        dropTables("Backup", function(success, results){
                            if(success)
                            {
                            debug.print("Success dropping Backup tables");
                                res.send({'result': "Success"});
                            }
                            else
                            {
                                debug.print("Failure dropping tables");
                                res.send({'result': "Error"});
                            }
                        });
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("Failure dropping tables");
                        res.send({'result': "Error"});
                    }
                });
            }
            else
            {
                debug.print("Failure dropping tables");
                res.send({'result': "Error"});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/create_backup_tables/', function(req,res) {
    
    debug.print("create_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(authenticate(spotifyData))
    {
        /*createTables("PreviousWeek1", function(success, results){
            if(success)
            {
                debug.print("Success creating PreviousWeek1 tables");
                createTables("PreviousWeek2", function(success, results){
                    if(success)
                    {
                        debug.print("Success creating PreviousWeek2 tables");
                        createTables("Backup", function(success, results){
                            if(success)
                            {
                                debug.print("Success creating Backup tables");
                                res.send({'result': "Success"});
                            }
                            else
                            {
                                debug.print("Failure creating Backup tables");
                                res.send({'result': "Error"});
                            }
                        });
                    }
                    else
                    {
                        debug.print("Failure creating Backup tables");
                        res.send({'result': "Error"});
                    }
                });
            }
            else
            {
                debug.print("Failure creating Backup tables");
                res.send({'result': "Error"});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

dropTables = function(modifier, completeCallback)
{
    dropTable('Streams' + modifier, function(success, results){
        if(success)
        {
            debug.print("Success dropping Streams" + modifier);
            dropTable('Points' + modifier, function(success, results){
                if(success)
                {
                    debug.print("Success dropping Points" + modifier);
                    dropTable('BonusPoints' + modifier, function(success, results){
                        if(success)
                        {
                            debug.print("Success dropping BonusPoints" + modifier);
                            completeCallback(true, {'result': "Success"});
                        }
                        else
                        {
                            debug.print("Failure dropping BonusPoints");
                            completeCallback(false, {'result': "Error"});
                        }
                    });
                }
                else
                {
                    debug.print("Failure dropping Points");
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("Failure dropping Streams");
            completeCallback(false, {'result': "Error"});
        }
    });
}

createTables = function(modifier, completeCallback)
{
    createStreamsTable(modifier, function(success, results){
        if(success)
        {
            createPointsTable(modifier, function(success, results){
                if(success)
                {
                    createBonusPointsTable(modifier, function(success, results){
                        if(success)
                        {
                            completeCallback(true, {'result': "Success"});
                        }
                        else
                        {
                            completeCallback(false, {'result': "Error"});
                        }
                    });
                }
                else
                {
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            completeCallback(false, {'result': "Error"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_table/', function(req,res) {
    
    debug.print("print_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(authenticate(spotifyData))
    {
        con.query('SELECT * FROM BonusPointsPreviousWeek1', function (error, results, fields) {
            if (error)
            {
                res.send({'result': "Error"});
            }
            else
            {
                debug.print("BonusPointsBackup table Results:" + results.length);
                results.forEach(result => {
                    debug.print(result);
                });
                res.send({'result': "Success"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

generateStreamReport = function(streamData, completeCallback)
{
    //debug.print("generateStreamReport:" + streamData.discordId);
    
    getBonusPointsFromDiscordId(streamData, function(success, results){
        if(success)
        {
            getAllSpotifyIds(streamData.discordId, function(success, results){
                if(success)
                {
                    //debug.print("getAllSpotifyIds success");
                    //debug.print(results);
                    
                    streamData.spotifyIds = results.spotifyIds;
                    if(streamData.spotifyIds.length > 0)
                    {
                        getStreamsFromSpotifyIds(streamData, function(success, results){
                            if(success)
                            {
                                updateStreamDataWithTotalHelper(streamData, function(success, results){
                                    if(success)
                                    {
                                        //debug.print("getStreamsFromSpotifyIds success");
                                        //debug.print(streamData);
                                        var streamReport = getFullStreamReportFromData(streamData);
                                        completeCallback(true, {'data': streamReport});
                                    }
                                    else
                                    {
                                        debug.print("updateStreamDataWithTotalHelper failed:" + streamData.discordId);
                                        
                                		debug.print("updateStreamDataWithTotalHelper error: " + ERROR_TEXT);
                                        completeCallback(false, {});
                                    }
                                });
                            }
                            else
                            {
                                debug.print("getStreamsFromSpotifyIds failed for discordId:" + streamData.discordId);
                                
                        		debug.print("getStreamsFromSpotifyIds error: " + ERROR_TEXT);
                                completeCallback(false, {});
                            }
                        });
                    }
                    else
                    {
                        debug.print("No Spotify accounts linked for discordId:" + streamData.discordId);
                        
                		debug.print("getAllSpotifyIds error: " + ERROR_TEXT);
                        completeCallback(false, {});
                    }
                }
                else
                {
                    //debug.print("getAllSpotifyIds failed for discordId:" + streamData.discordId);
                    
                    if(results.message == "discordId not in table")
                    {
                        var streamReport = getFullStreamReportFromData(streamData);
                        completeCallback(true, {'data': streamReport});
                    }
                    else
                    {
                		debug.print("getAllSpotifyIds error: " + ERROR_TEXT);
                        completeCallback(false, {});
                    }
                }
            });
        }
        else
        {
            debug.print("getBonusPointsFromDiscordId failed for discordId:" + streamData.discordId);
            
    		debug.print("getBonusPointsFromDiscordId error: " + ERROR_TEXT);
            completeCallback(false, {});
        }
    });
}

app.get('/' + ENVIRONMENT + '/user_report/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/user_report called for spotify user:" + req.query.spotify_id + ", discord user:" + req.query.discord_id + " on previous week " + req.query.previous_week);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var hoursByPlaylist = [];
    
    for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
    {
       hoursByPlaylist.push(-1);
    }
    
    var total = {
        'hours': 0,
        'hoursByPlaylist': hoursByPlaylist,
        'bonusPoints': 0,
        'numAccounts': 0
    };
    
    var previous_week = (req.query.previous_week == null?0:req.query.previous_week);
    
    var streamData = {
        'spotifyData': spotifyData,
        'previous_week': PREVIOUS_WEEKS[previous_week],
        'total': total,
        'bonusPointList': [],
        'discordId': "",
        'spotifyIds': [],
        'streamsByUser': []
    }
    
    if(req.query.discord_id == null)
    {
        //debug.print("no discordId provided so get for current user");
        
        if(streamData.spotifyData.user_id != null)
        {
            getDiscordId(streamData.spotifyData.user_id, function(success, results)
            {
                if(success)
                {
                    //debug.print("discordId success");
                    //debug.print("discordId: " + results.discordId);
                    streamData.discordId = results.discordId;
                    
                    generateStreamReport(streamData, function(success, results){
                        if(success)
                        {
                            //debug.print("generateStreamReport success");
                            //debug.print(streamData);
                            var streamReport = results.data;
                			res.send({
                        		'result': "Success",
                        		'data': streamReport
                        	});
                        }
                        else
                        {
                            debug.print("generateStreamReport failed");
                            
                    		debug.print("generateStreamReport error: " + ERROR_TEXT);
                			res.send({
                        		'result': "Error"
                        	});
                        }
                    });
                }
                else
                {
                    debug.print("getDiscordId failed");
                    
            		debug.print("getDiscordId error: " + ERROR_TEXT);
        			res.send({
                		'result': "Error"
                	});
                }
            });
        }
        else
        {
            debug.print("no spotifyId provided for current user as well, must fail");
            res.send({'result': "Error", 'message':'Authentication Error'});
        }
    }
    else
    {
        if(modAuthenticate(spotifyData))
        {
            //debug.print("discordId:" + req.query.discord_id);
            streamData.discordId = req.query.discord_id;
            
            generateStreamReport(streamData, function(success, results){
                if(success)
                {
                    //debug.print("generateStreamReport success");
                    //debug.print(streamData);
                    var streamReport = results.data;
        			res.send({
                		'result': "Success",
                		'data': streamReport
                	});
                }
                else
                {
                    debug.print("generateStreamReport failed");
                    
            		debug.print("generateStreamReport error: " + ERROR_TEXT);
        			res.send({
                		'result': "Error"
                	});
                }
            });
        }
        else
        {
            debug.print("Failed allowlist for user:" + spotifyData.user_id + " on discordId:" + req.query.discord_id);
			res.send({
        		'result': "Error"
        	});
        }
    }
});

app.get('/' + ENVIRONMENT + '/update_tiers_table/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/update_tiers_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        deleteTable('Tiers', function(success, results)
        {
            if(success)
            {
                populateTiersTable(function(success, results)
                {
                    if(success)
                    {
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("Failure populating Tiers");
                        res.send({'result': "Error"});
                    }
                });
            }
            else
            {
                debug.print("Failure dropping Tiers");
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/print_final_report/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_final_report called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        updateMasterlist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                PrintNonNASReport(access_token, spotifyData, function(success, results)
                {
                    if(success)
                    {
                        res.send({'result': "Success", 'message':'Success'});
                    }
                    else
                    {
                        var message = "Error printing final report";
                        force_send_to_admin_channel(message);
                        res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
                    }
                });
            }
            else
            {
                var message = "Error updating master list";
                force_send_to_admin_channel(message);
                res.send({'result': "Error", 'message':'Error Updating Master List'});
            }
        });

    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/backup_spotify_to_discord/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/backup_spotify_to_discord called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        backupTable("SpotifyToDiscord", "", "Backup", function(success, results)
        {
            if(success)
            {
                debug.print("Backup SpotifyToDiscord success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("Backup SpotifyToDiscord error");
    			res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/print_leaderboard/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_leaderboard called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var leaderboardLength = (req.query.leaderboard_length == null ||  req.query.leaderboard_length == 0 ? 10 : req.query.leaderboard_length);
    
    if(modAuthenticate(spotifyData))
    {
        printLeaderboard(leaderboardLength, function(success, results){
            if(success)
            {
                //debug.print("printLeaderboard success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("printLeaderboard error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});


app.get('/' + ENVIRONMENT + '/print_weekly_stats/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_weekly_stats called");
    
    var previous_week = (req.query.previous_week == null?0:req.query.previous_week);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        printWeeklyStats(req.query.access_token, previous_week, function(success, results){
            if(success)
            {
                //debug.print("printWeeklyStats success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("printWeeklyStats error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

printWeeklyStats = function(access_token, previousWeek, completeCallback)
{
    // Weekly stats:
    // Top Streaming Accounts
    // Total Points Earned
    // Total Songs Streamed
    
    debug.print("PrintWeeklyStats");
    
    var currentdate = new Date();
    
    var messages = [];
    if(previousWeek == 2)
    {
        messages.push("***----- Weekly Stats for Two Weeks Ago (" + currentdate.toDateString() + ") -----***\n");
    }
    else if(previousWeek == 1)
    {
        messages.push("***----- Weekly Stats for Previous Week (" + currentdate.toDateString() + ") -----***\n");
    }
    else
    {
        messages.push("***----- Weekly Stats for Current Week (" + currentdate.toDateString() + ") -----***\n");
    }
    
    var previousWeekName = PREVIOUS_WEEKS[previousWeek];
    debug.print("Previous Week:" + previousWeekName);
    
    generateTotalPointsMessage(access_token, previousWeekName, function(success, totalStreamsResults)
    {
        if(success)
        {
            messages.push(totalStreamsResults.message);
            
            generateTopStreamersMessage(access_token, previousWeekName, 20, function(success, topStreamerResults)
            {
                if(success)
                {
                    topStreamerResults.messages.forEach(message => messages.push(message));
                    
                    generateMostStreamedSongsMessage(access_token, previousWeekName, 30, function(success, mostStreamedResults)
                    {
                        if(success)
                        {
                            mostStreamedResults.messages.forEach(message => messages.push(message));
                            
                            generatePointsPerPlaylistMessage(access_token, previousWeekName, function(success, playlistStreamsResults)
                            {
                                if(success)
                                {
                                    messages.push(playlistStreamsResults.message);
                                    
                                    messages.forEach(message => send_to_stats_channel(message));
                                    
                                    completeCallback(true, {'result': "Success", "messages":messages});
                                }
                                else
                                {
                                    completeCallback(false, {'result': "Error"});
                                }
                            });
                        }
                        else
                        {
                            completeCallback(false, {'result': "Error"});
                        }
                    });
                }
                else
                {
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            completeCallback(false, {'result': "Error"});
        }
    });
}

generatePointsPerPlaylistMessage = function(access_token, previousWeek, completeCallback)
{
    //debug.print("generatePointsPerPlaylistMessage");
    
    var query = "SELECT playlistId, SUM(points) AS 'total' FROM Points" + previousWeek + " GROUP BY playlistId ORDER BY total DESC";
    
    debug.print(query);
    
    con.query(query, function (error, results, fields)
    {
        if (!error)
        {
            var message = "***----- Points Per Playlist -----***\n";
            
            results.forEach(result =>
            {
                for(var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; ++i)
                {
                    if(SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].id == result.playlistId)
                    {
                        var playlistName = SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].name;
                        
                        message += playlistName + " - " + Math.round(result.total) + '\n';
                    }
                }
            });
            
            completeCallback(true, {'result': "Success", "message":message});
        }
        else
        {
            debug.print("SQL Query Failed");
            completeCallback(false, {'result': "Error"});
        }
    });
}

generateMostStreamedSongsMessage = function(access_token, previousWeek, count, completeCallback)
{
    debug.print("generateMostStreamedSongsMessage");
    
    var query = "SELECT trackId, COUNT(*) AS 'count' FROM Streams" + previousWeek + " GROUP BY trackId ORDER BY count DESC";
    
    debug.print(query);
    
    con.query(query, function (error, results, fields)
    {
        if (!error)
        {
            var tracks = [];
            for(var i = 0; i < count; ++i)
            {
                tracks.push(results[i].trackId);
            }
            
            var spotifyData = {
                songs:tracks
            };
            
            spotify.getSongInfo(access_token, spotifyData, (success, songInfoResult) => 
            {
            	if(success)
            	{
            	    var messages = [];
            	    var message = "***----- Most Streamed Songs (" + count +") -----***\n";
            	    var num = 0;
            	    for(var i = 0; i < count; ++i)
            	    {
            	        ++num;
            	        message += "Streams: " + results[i].count + " - " + songInfoResult.tracks[i].trackName + " (" + songInfoResult.tracks[i].trackId + ") - " + songInfoResult.tracks[i].artistName + " (" + songInfoResult.tracks[i].artistId + ")\n";
            	        
            	        if(num >= 10)
            	        {
            	            messages.push(message);
            	            message = "";
            	            num = 0;
            	        }
            	    }
            	    
            	    if(message != "")
            	    {
            	        messages.push(message);
            	    }
            	    
            	    completeCallback(true, {'result': "Success", "messages":messages});
            	}
            	else
            	{
                    completeCallback(false, {'result': "Error"});
            	}
            });
        }
        else
        {
            debug.print("SQL Query Failed");
            completeCallback(false, {'result': "Error"});
        }
    });
}

generateTotalPointsMessage = function(access_token, previousWeek, completeCallback)
{
    debug.print("generateTotalPointsMessage");
    
    var query = "SELECT SUM(points) AS total FROM Points" + previousWeek;
    
    debug.print(query);
    
    con.query(query, function (error, results, fields)
    {
        if (!error)
        {
            var res = results[0];
            var total = Math.round(res.total);
            var totalMessage = "Total Points Earned: " + total + "\n";
            
            var streamQuery = "SELECT COUNT(*) AS streams FROM Streams" + previousWeek;
    
            debug.print(streamQuery);
            
            con.query(streamQuery, function (error, results, fields)
            {
                if (!error)
                {
                    var res = results[0];
                    var streams = res.streams;
                    totalMessage += "Total Streams: " + streams + "\n";
                    completeCallback(true, {'result': "Success", "message":totalMessage});
                }
                else
                {
                    debug.print("SQL Query Failed");
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("SQL Query Failed");
            completeCallback(false, {'result': "Error"});
        }
    });
}

generateTopStreamersMessage = function(access_token, previousWeek, count, completeCallback)
{
    debug.print("generateTopStreamersMessage");
    
    var query = "SELECT * FROM Points" + previousWeek + " ORDER BY points DESC";
    
    debug.print(query);
    
    con.query(query, function (error, results, fields)
    {
        if (!error)
        {
            var messages = [];
            var message = "***----- Top Streaming Accounts (" + count + ") -----***\n";
            
            createTopStreamersPost(access_token, 0, count, results, messages, message, function(success, topStreamerResults){
                if(success)
                {
                    completeCallback(true, topStreamerResults);
                }
                else
                {
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("SQL Query Failed");
            completeCallback(false, {'result': "Error"});
        }
    });
}

createTopStreamersPost = function(access_token, index, max, streamingResults, messages, message, completeCallback)
{
    if(index < max)
    {
        getDiscordId(streamingResults[index].spotifyId, function(success, discordIdResults)
        {
            if(success)
            {
                var spotifyData = {
                  otherUserId:streamingResults[index].spotifyId
                };
                spotify.getOtherUserInfo(access_token, spotifyData, (success, userInfoResult) => 
                {
                	if(success)
                	{
                	    message += "Discord Id: <@" + discordIdResults.discordId + "> - Spotify Account: " + userInfoResult.display_name + " (" + streamingResults[index].spotifyId + ") points:" + Math.round(streamingResults[index].points) + "\n";
                	    if(index % 10 == 9)
                	    {
                	        messages.push(message);
                	        message = "";
                	    }
                        createTopStreamersPost(access_token, index + 1, max, streamingResults, messages, message, completeCallback);
                	}
                	else
                	{
                	    message += "Discord Id: <@" + discordIdResults.discordId + " - "   + streamingResults[index].spotifyId + " points:" + Math.round(streamingResults[index].points) + "\n";
                	    if(index % 10 == 9)
                	    {
                	        messages.push(message);
                	        message = "";
                	    }
                        createTopStreamersPost(access_token, index + 1, max, streamingResults, messages, message, completeCallback);
                	}
                });
            }
            else
            {
                debug.print("getDiscordId failed for " + streamingResults[index].spotifyId);
                completeCallback(false, {'result': "Error"});
            }
        });
    }
    else
    {
	    if(message != "")
	    {
	        messages.push(message);
	    }
        completeCallback(true, {'result': "Success", "messages":messages});
    }
}

app.get('/' + ENVIRONMENT + '/print_reset_report/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_reset_report called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        PrintResetReport(function(success, results){
            if(success)
            {
                //debug.print("PrintResetReport success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("PrintResetReport error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/print_tier/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_tier called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var tier = (req.query.tier == null ? 0 : req.query.tier);
    var isCurrent = (req.query.previous_week == 0);
    
    if(modAuthenticate(spotifyData))
    {
        if(isCurrent)
        {
            printTier(tier, function(success, results){
                if(success)
                {
                    //debug.print("printTier success");
                    res.send({'result': "Success"});
                }
                else
                {
                    debug.print("printTier error: " + ERROR_TEXT);
        			res.send({
                		'result': "Error"
                	});
                }
            });
        }
        else
        {
            printTierBackup(tier, function(success, results){
                if(success)
                {
                    //debug.print("printTierBackup success");
                    res.send({'result': "Success"});
                }
                else
                {
                    debug.print("printTierBackup error: " + ERROR_TEXT);
        			res.send({
                		'result': "Error"
                	});
                }
            });
        }
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/add_mod_song_count/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/add_mod_song_count called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.discord_id,
      song_count: req.query.song_count
    };
    
    addModSongCount(spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function addModSongCount(spotifyData, completeCallback)
{
    debug.print("addModSongCount called: " + spotifyData.discord_id + ", songs:" + spotifyData.song_count);
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM ModSongs WHERE discordId = ' + spotifyData.discord_id, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table ModSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            if(results.length == 0)
            {
                var insertSql = "INSERT INTO ModSongs (discordId, songCount) VALUES ('" + spotifyData.discord_id + "', " + spotifyData.song_count + ")";
	            debug.print(insertSql);
                
                con.query(insertSql, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error inserting into table ModSongs");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
	                    debug.print("discordId:" + spotifyData.discord_id + ", songCount:" + spotifyData.song_count + " added to ModSongs table");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                var updateQuery = "UPDATE ModSongs SET songCount = " + spotifyData.song_count + " WHERE discordId = '" + spotifyData.discord_id + "';";
                
                debug.print(updateQuery);
                
                con.query(updateQuery, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error reording table ModSongs");
                        debug.print(error);
                        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("Updated ModSongs discordId:" + spotifyData.discord_id + ", songCount:" + spotifyData.song_count);
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/remove_mod_song_count/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/remove_mod_song_count called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.discord_id
    };
    
    removeModSongCount(spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function removeModSongCount(spotifyData, completeCallback)
{
    debug.print("removeModSongCount called: " + spotifyData.discord_id);
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM ModSongs WHERE discordId = ' + spotifyData.discord_id, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table ModSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            if(results.length == 0)
            {
                debug.print("discordId:" + spotifyData.discord_id + " not in ModSongs table");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                var deleteSql = "DELETE FROM ModSongs WHERE discordId = '" + spotifyData.discord_id + "'";
                
                debug.print(deleteSql);
                
                con.query(deleteSql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error reading table ModSongs");
                        debug.print(error);
                        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("Removed discordId:" + spotifyData.discord_id + " from ModSongs");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/add_mentor_song_count/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/add_mentor_song_count called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.discord_id,
      song_count: req.query.song_count
    };
    
    addMentorSongCount(spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function addMentorSongCount(spotifyData, completeCallback)
{
    debug.print("addMentorSongCount called: " + spotifyData.discord_id + ", songs:" + spotifyData.song_count);
    
    // Code to create the MentorSongs table
    con.query('SELECT * FROM MentorSongs WHERE discordId = ' + spotifyData.discord_id, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table MentorSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            if(results.length == 0)
            {
                var insertSql = "INSERT INTO MentorSongs (discordId, songCount) VALUES ('" + spotifyData.discord_id + "', " + spotifyData.song_count + ")";
	            debug.print(insertSql);
                
                con.query(insertSql, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error inserting into table MentorSongs");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
	                    debug.print("discordId:" + spotifyData.discord_id + ", songCount:" + spotifyData.song_count + " added to MentorSongs table");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                var updateQuery = "UPDATE MentorSongs SET songCount = " + spotifyData.song_count + " WHERE discordId = '" + spotifyData.discord_id + "';";
                
                debug.print(updateQuery);
                
                con.query(updateQuery, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error reording table MentorSongs");
                        debug.print(error);
                        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("Updated MentorSongs discordId:" + spotifyData.discord_id + ", songCount:" + spotifyData.song_count);
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/remove_mentor_song_count/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/remove_mentor_song_count called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.discord_id
    };
    
    removeMentorSongCount(spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});


function removeMentorSongCount(spotifyData, completeCallback)
{
    debug.print("removeMentorSongCount called: " + spotifyData.discord_id);
    
    // Code to create the MentorSongs table
    con.query('SELECT * FROM MentorSongs WHERE discordId = ' + spotifyData.discord_id, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table MentorSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            if(results.length == 0)
            {
                debug.print("discordId:" + spotifyData.discord_id + " not in MentorSongs table");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                var deleteSql = "DELETE FROM MentorSongs WHERE discordId = '" + spotifyData.discord_id + "'";
                
                debug.print(deleteSql);
                
                con.query(deleteSql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error reading table MentorSongs");
                        debug.print(error);
                        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("Removed discordId:" + spotifyData.discord_id + " from MentorSongs");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_mentors_list/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_mentors_list called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    printMentorsList(spotifyData, function(success, results)
    {
        if(success)
        {
            debug.print(results.data);
            res.send({'result': "Success", 'message':'Success', 'data':results.data});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function printMentorsList(spotifyData, completeCallback)
{
    debug.print("printMentorsList");
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM MentorSongs', function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table ModSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var message = "";
            
            discordGuild.members.fetch()
        	.then(members => {
                message += "** Mentors List **\n";
                
                results.forEach(mods =>
                {
                    var found = false;
                    
                    members.forEach(member =>
                    {
                        if(member.id == mods.discordId)
                        {
                            found = true;
                            var name = null;
                            
                            //Found the member on discord
                            if(member.user != null)
                            {
                                name = member.user.username;
                            }
                            
        	                if(member.nickname != null && member.nickname != "")
        	                {
        	                    name = member.nickname;
        	                }
        	                
        	                if(name == null)
        	                {
        	                    name = mods.discordId;
        	                }
        	                
        	                message += "Mentor:" + name + ", songs:" + mods.songCount + "\n";
                        }
                    });
                    
                    if(!found)
                    {
                        message += "Mentor:" + mods.discordId + ", songs:" + mods.songCount + "\n";
                    }
                });
                
                completeCallback(true, {'result': "Success", 'data': message});
        	})
        	.catch(error => {
        	    debug.print(error);
        	    debug.print("Error fetching discord members, printing without member names");
                debug.print("** Mentors List **");
                results.forEach(mods =>
                {
                    debug.print("Mentor:" + mods.discordId + ", songs:" + mods.songCount);
                });
                completeCallback(true, {'result': "Success"});
        	});
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_mod_song_list/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/print_mod_song_list called/");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    printModSongList(spotifyData, function(success, results)
    {
        if(success)
        {
            debug.print(results.data);
            res.send({'result': "Success", 'message':'Success', 'data':results.data});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function printModSongList(spotifyData, completeCallback)
{
    debug.print("printModSongList");
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM ModSongs ORDER BY songCount DESC', function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table ModSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var message = "";
            
            discordGuild.members.fetch()
        	.then(members => {
        	    message += "** Mod Song List **\n";
                
                results.forEach(mods =>
                {
                    var found = false;
                    
                    members.forEach(member =>
                    {
                        if(member.id == mods.discordId)
                        {
                            found = true;
                            var name = null;
                            
                            //Found the member on discord
                            if(member.user != null)
                            {
                                name = member.user.username;
                            }
                            
        	                if(member.nickname != null && member.nickname != "")
        	                {
        	                    name = member.nickname;
        	                }
        	                
        	                if(name == null)
        	                {
        	                    name = mods.discordId;
        	                }
        	                
        	                message += "Mod:" + name + ", songs:" + mods.songCount + "\n";
                        }
                    });
                    
                    if(!found)
                    {
                        message += "Mod:" + mods.discordId + ", songs:" + mods.songCount + "\n";
                    }
                });
                
                completeCallback(true, {'result': "Success", 'data': message});
        	})
        	.catch(error => {
        	    debug.print(error);
        	    debug.print("Error fetching discord members, printing without member names");
                debug.print("** Mod Song List **");
                results.forEach(mods =>
                {
                    debug.print("Mod:" + mods.discordId + ", songs:" + mods.songCount);
                });
                completeCallback(true, {'result': "Success"});
        	});
        }
    });
}

app.get('/' + ENVIRONMENT + '/remove_bonus_points/', function(req,res)
{
    debug.print("/remove_bonus_points called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var pointsReason = req.query.points_reason;
    
    if(modAuthenticate(spotifyData))
    {
        var sql = "SELECT * FROM BonusPoints WHERE reason = '" + pointsReason + "'";
        
        con.query(sql, function (error, results, fields)
        {
            if (error)
            {
                debug.print("Error getting " + pointsReason + " from BonusPoints");
                res.send({'result': "Error", 'message':'Error'});
            }
            else
            {
                if(results.length > 0)
                {
                    debug.print("Found " + results.length);
                    
                    var deleteSql = "DELETE FROM BonusPoints WHERE reason = '" + pointsReason + "'";
                    
                    debug.print(deleteSql);
                    
                    con.query(deleteSql, function (error, results, fields)
                    {
                        if (error)
                        {
                            debug.print("error deleting from table BonusPoints, reason " + pointsReason);
                            debug.print(error);
                            res.send({'result': "Error", 'message':'Error'});
                        }
                        else
                        {
                            debug.print("Delete Success for " + pointsReason);
                            send_to_bonus_admin_channel("Deleted all bonus points with reason: '" + pointsReason + "'");
                            res.send({'result': "Success", 'message':'Success'});
                        }
                    });
                }
                else
                {
                    debug.print("No Results " + results.length);
                    res.send({'result': "Success", 'message':'Success'});
                }
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/add_bonus_points/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/add_bonus_points called: " + req.query.spotify_name + "(" + req.query.spotify_id + ") - [" + req.query.discord_id + "] - " + req.query.points_amount + " - " + req.query.points_reason);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.discord_id
    };
    
    debug.print(spotifyData);
    
    if(modAuthenticate(spotifyData))
    {
        //Check if it's a discordId
    	discordGuild.members.fetch(spotifyData.discord_id)
    	.then(member => {
    		member.fetch(true)
    		.then(member => {
                //debug.print("DiscordId found:" + spotifyData.discord_id);
                
                AddBonusPoints(spotifyData, req.query.points_amount, req.query.points_reason, function(success, results){
                    if(success)
                    {
                        //debug.print("AddBonusPoints success");
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("AddBonusPoints error");
                        res.send({'result': "Error"});
                    }
                });
    		})
    		.catch(error => {
    		    // Couldn't find member
    		    debug.print("Couldn't fetch discord member");
    		    res.send({'result': "Success"});
    		});
    	})
    	.catch(error => {
    	    // Couldn't find member
    	    //debug.print("Not a DiscordId check if it's a role id");
    	    
            let role = discordGuild.roles.cache.find(role => role.id === spotifyData.discord_id);
            if(role == null)
            {
    	        //debug.print("Not a role id check if it's a role name");
    	        
                role = discordGuild.roles.cache.find(role => role.name === spotifyData.discord_id);
            }
            
            if(role == null)
            {
    	        debug.print("Not a role or a DiscordId");
    		    res.send({'result': "Error"});
            }
            else
            {
    	        //debug.print("Role found!");
    	        var membersWithRole = [];
    	        role.members.forEach(member => membersWithRole.push(member.user.id));
    	        
    	        if(membersWithRole.length == 0)
    	        {
    	            res.send({'result': "Success", 'message': "No members with role " + role.name});
    	        }
    	        else
    	        {
        	        AddBonusPointToRole(spotifyData, req.query.points_amount, req.query.points_reason, membersWithRole, 0, function(success, results){
                        if(success)
                        {
                            //debug.print("AddBonusPoints for role " + role.name + " success");
                            res.send({'result': "Success"});
                        }
                        else
                        {
                            debug.print("AddBonusPoints for role " + role.name + " error");
                            res.send({'result': "Error"});
                        }
                    });
    	        }
            }
    	});
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

AddBonusPointToRole = function(spotifyData, amount, reason, members, index, completeCallback)
{
    if(members != null && members.length > 0)
    {
        if(index >= members.length)
        {
            completeCallback(true, {'result': "Success"});
        }
        else
        {
            spotifyData.discord_id = members[index];
            AddBonusPoints(spotifyData, amount, reason, function(success, results){
                if(success)
                {
                    AddBonusPointToRole(spotifyData, amount, reason, members, index+1, completeCallback);
                }
                else
                {
                    debug.print("AddBonusPoints error");
                    AddBonusPointToRole(spotifyData, amount, reason, members, index+1, completeCallback);
                }
            });
        }
    }
}

app.get('/' + ENVIRONMENT + '/link_discord_to_artist/', function(req,res) {
    
    debug.print("link_discord_to_artist called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var discordId = req.query.link_discord_id.trim();
    var spotifyId = req.query.link_spotify_id.trim();
    
    if(adminAuthenticate(spotifyData))
    {
        AddSpotifyArtistToDiscordLink(access_token, spotifyData, spotifyId, discordId, function(success, results){
            if(success)
            {
                debug.print("AddSpotifyArtistToDiscordLink success");
                
                fillOrderedSongListForUser(access_token, discordId, {}, function(success, results)
                {
                    if(success)
                    {
                        debug.print("fillOrderedSongListForUser success");
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("Error filling song list for user:" + discordId);
                        res.send({'result': "Error",'message': results.message});
                    }
                });
            }
            else
            {
                debug.print("AddSpotifyArtistToDiscordLink error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

AddSpotifyArtistToDiscordLink = function(access_token, spotifyData, spotifyId, discordId, completeCallback)
{
    var sql = "SELECT * FROM SpotifyArtistLinks WHERE spotifyId = '" + spotifyId + "' AND discordId = '" + discordId + "'";
    
    con.query(sql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistLinks");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Success accessing table SpotifyArtistLinks");
            if(results.length > 0)
            {
                debug.print("Already added");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                // Not already in the table
                spotifyData.artistId = spotifyId;
                spotify.getArtistInfo(access_token, spotifyData, (success, resData) => 
                {
                	if(success)
                	{
                	    // Save artist data  artist_name: body.name, id: body.id, popularity: body.popularity, genres: body.genres, followers: body.followers.total
                	    // save to seperate table with a timestamp of when the snapshot was taken
                	    
                        // Spotify Id is valid
                	    debug.print("SpotifyId:" + spotifyId + " is valid");
                	    debug.print(resData);
                	    
                        //completeCallback(true, {'result': "Success"});
                	    
						discordGuild.members.fetch(discordId)
						.then(member => {
							member.fetch(true)
							.then(member => {
                                // Discord Id is valid
                                // Add it to the table
                	            debug.print("discordId:" + discordId + " is valid");
                                
                                var insertSql = "INSERT INTO SpotifyArtistLinks (spotifyId, discordId) VALUES ('" + spotifyId + "', '" + discordId +"')";
                                
                	            debug.print(insertSql);
                                
            	                con.query(insertSql, function (error, results, fields) {
                                    if (error)
                                    {
                                        debug.print("error inserting into table SpotifyArtistLinks");
                                        debug.print(error);
                                        completeCallback(false, 
                                            {'result': "Error",
                                             'error': error
                                        });
                                    }
                                    else
                                    {
                	                    debug.print("discordId:" + discordId + ", spotifyId:" + spotifyId + " added to SpotifyArtistLinks table");
                	                    SendArtistLinkUpdate(discordId, resData.artist_name, spotifyId, completeCallback);
                                    }
                                });
							})
							.catch(error => {
    						    // Couldn't find member
    						    debug.print("Couldn't fetch discord id: " + discordId);
    						    debug.print(error);
    						    
                			    var returnData = {
                            		message: "DiscordId Invalid"
                            	};
                            	
                				completeCallback(false, returnData);
    						});
						})
						.catch(error => {
						    // Couldn't find member
						    debug.print("Incorrect discord Id: " + discordId);
						    debug.print(error);
						    
            			    var returnData = {
                        		message: "DiscordId Invalid"
                        	};
                        	
            				completeCallback(false, returnData);
						});
                	}
                	else
                	{
                	    debug.print("Incorrect spotifyId:" + spotifyId);
                	    
                        completeCallback(false, 
                            {'result': "Error",
                             'message': "SpotifyId Invalid"
                        });
                	}
                });
            }
        }
    });
}

function SendArtistLinkUpdate(discordId, artistName, spotifyId, completeCallback)
{
    debug.print("SendArtistLinkUpdate");
    var message = "Spotify artist " + artistName + " added for <@" + discordId + "> (https://open.spotify.com/artist/" + spotifyId + ")";
    force_send_to_admin_channel(message);
    completeCallback(true, {'result': "Success"});
}

function SendArtistUnlinkUpdate(discordId, artistName, completeCallback)
{
    debug.print("SendArtistUnlinkUpdate");
    var message = "Spotify artist " + artistName + " removed for <@" + discordId + ">";
    force_send_to_admin_channel(message);
    completeCallback(true, {'result': "Success"});
}

app.get('/' + ENVIRONMENT + '/link_discord_to_spotify/', function(req,res) {
    
    debug.print("link_discord_to_spotify called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var discordId = req.query.link_discord_id;
    var spotifyId = req.query.link_spotify_id;
    
    if(adminAuthenticate(spotifyData))
    {
        AddSpotifyUserToDiscordLink(access_token, spotifyData, spotifyId, discordId, function(success, results){
            if(success)
            {
                //debug.print("AddSpotifyUserToDiscordLink success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("AddSpotifyUserToDiscordLink error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

AddSpotifyUserToDiscordLink = function(access_token, spotifyData, spotifyId, discordId, completeCallback)
{
    var sql = "SELECT spotifyId FROM SpotifyToDiscord WHERE spotifyId = '" + spotifyId + "'";
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyToDiscord");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Success accessing table SpotifyToDiscord");
            if(results.length > 0)
            {
                //debug.print("Already added");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                // Not already in the table
                spotifyData.otherUserId = spotifyId;
                spotify.getOtherUserInfo(access_token, spotifyData, (success, resData) => 
                {
                	if(success)
                	{
                        // Spotify Id is valid
                	    //debug.print("SpotifyId:" + spotifyId + " is valid");
                	    
						discordGuild.members.fetch(discordId)
						.then(member => {
							member.fetch(true)
							.then(member => {
                                // Discord Id is valid
                                // Add it to the table
                	            //debug.print("discordId:" + discordId + " is valid");
                                
                                var insertSql = "INSERT INTO SpotifyToDiscord (spotifyId, discordId) VALUES ('" + spotifyId + "', '" + discordId +"')";
                                
            	                con.query(insertSql, function (error, results, fields) {
                                    if (error)
                                    {
                                        debug.print("error inserting into table SpotifyToDiscord");
                                        debug.print(error);
                                        completeCallback(false, 
                                            {'result': "Error",
                                             'error': error
                                        });
                                    }
                                    else
                                    {
                	                    debug.print("discordId:" + discordId + ", spotifyId:" + spotifyId + " added to SpotifyToDiscord table");
                	                    SendAccountLinkUpdate(discordId, resData.display_name, completeCallback);
                                    }
                                });
							})
							.catch(error => {
    						    // Couldn't find member
    						    debug.print("Couldn't fetch discord id: " + discordId);
    						    debug.print(error);
    						    
                			    var returnData = {
                            		message: "DiscordId Invalid"
                            	};
                            	
                				completeCallback(false, returnData);
    						});
						})
						.catch(error => {
						    // Couldn't find member
						    debug.print("Incorrect discord Id: " + discordId);
						    debug.print(error);
						    
            			    var returnData = {
                        		message: "DiscordId Invalid"
                        	};
                        	
            				completeCallback(false, returnData);
						});
                	}
                	else
                	{
                	    debug.print("Incorrect SpotifyId:" + spotifyId);
                	    
                        completeCallback(false, 
                            {'result': "Error",
                             'message': "SpotifyId Invalid"
                        });
                	}
                });
            }
        }
    });
}

function SendAccountLinkUpdate(discordId, spotifyName, completeCallback)
{
    var message = "Spotify account " + spotifyName + " added for <@" + discordId + ">";
    
    getTierFromDiscordId(discordId, function(success, results){
        if(success)
        {
            //debug.print(results.tier);
            send_to_tier(message, results.tier);
            send_to_account_claim_channel(message);
            completeCallback(true, {'result': "Success"});
        }
        else
        {
            send_to_account_claim_channel(message);
            completeCallback(true, {'result': "Failure"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/unlink_discord_to_artist/', function(req,res) {
    
    debug.print("unlink_discord_to_artist called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var discordId = req.query.link_discord_id.trim();
    var spotifyId = req.query.link_spotify_id.trim();
    
    if(adminAuthenticate(spotifyData))
    {
        RemoveArtistToDiscordLink(access_token, spotifyData, spotifyId, discordId, function(success, results){
            if(success)
            {
                debug.print("RemoveArtistToDiscordLink success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("RemoveArtistToDiscordLink error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

RemoveArtistToDiscordLink = function(access_token, spotifyData, spotifyId, discordId, completeCallback)
{
    var sql = "SELECT * FROM SpotifyArtistLinks WHERE spotifyId = '" + spotifyId + "' AND discordId = '" + discordId + "'";
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistLinks");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Success accessing table SpotifyArtistLinks");
            if(results.length == 0)
            {
                debug.print("Spotify Id (" + spotifyId + ") not in table");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                var deleteSql = "DELETE FROM SpotifyArtistLinks WHERE spotifyId = '" + spotifyId + "' AND discordId = '" + discordId + "'";
                
                debug.print(deleteSql);
                
                con.query(deleteSql, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error deleting from table SpotifyArtistLinks Spotify Id:" + spotifyId + ", Discord Id:" + discordId);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        spotifyData.artistId = spotifyId;
                        spotify.getArtistInfo(access_token, spotifyData, (success, resData) => 
                        {
                            var artistName = "" + spotifyId;
                            
                        	if(success)
                        	{
                        	    artistName = resData.artist_name;
                        	}
                        	
    	                    debug.print("Spotify Id:" + spotifyId + " removed for " + discordId + " in SpotifyArtistLinks table");
    	                    
    	                    SendArtistUnlinkUpdate(discordId, artistName, completeCallback);
                        });
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/unlink_discord_to_spotify/', function(req,res) {
    
    debug.print("unlink_discord_to_spotify called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var spotifyId = req.query.link_spotify_id;
    
    if(adminAuthenticate(spotifyData))
    {
        RemoveSpotifyUserToDiscordLink(access_token, spotifyData, spotifyId, function(success, results){
            if(success)
            {
                debug.print("RemoveSpotifyUserToDiscordLink success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("RemoveSpotifyUserToDiscordLink error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

RemoveSpotifyUserToDiscordLink = function(access_token, spotifyData, spotifyId, completeCallback)
{
    var sql = "SELECT spotifyId FROM SpotifyToDiscord WHERE spotifyId = '" + spotifyId + "'";
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyToDiscord");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Success accessing table SpotifyToDiscord");
            if(results.length == 0)
            {
                debug.print("Spotify Id (" + spotifyId + ") not in table");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                var deleteSql = "DELETE FROM SpotifyToDiscord WHERE spotifyId = '" + spotifyId + "'";
                
                debug.print(deleteSql);
                
                con.query(deleteSql, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error deleting from table SpotifyToDiscord Spotify Id:" + spotifyId);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
	                    debug.print("Spotify Id:" + spotifyId + " removed from SpotifyToDiscord table");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_unlinked_artists/', function(req,res) {
    
    debug.print("print_unlinked_artists called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    var tier = req.query.tier;
    
    debug.print("tier:" + tier);
    
    if(adminAuthenticate(spotifyData))
    {
        if(tier == -1)
        {
            printAllUsersMissingArtistLinks(function(success, results)
            {
                if(success)
                {
                    var message = "All Unlinked Users\n";
                    
                    results.data.forEach(user =>
                    {
                        message += user.name + ", " + user.id + "\n";
                    });
                    
                    res.send({'result': "Success",'data': message});
                }
                else
                {
        			res.send({'result': "Error",'message': results.message});
                }
            });
        }
        else
        {
            printUsersMissingArtistLinks(tier, function(success, results)
            {
                if(success)
                {
                    var message = "Unlinked Users for Tier: ";
                    
                    if(tier == 9)
                    {
                        message += "Mods\n";
                    }
                    else
                    {
                        message += tier + "\n";
                    }
                    
                    results.data.forEach(user =>
                    {
                        message += user.name + ", " + user.id + "\n";
                    });
                    
                    res.send({'result': "Success",'data': message});
                }
                else
                {
        			res.send({'result': "Error",'message': results.message});
                }
            });
        }
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/print_artist_to_discord_table/', function(req,res) {
    
    debug.print("print_artist_to_discord_table called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    if(adminAuthenticate(spotifyData))
    {
        PrintArtistToDiscordTable(access_token, spotifyData, function(success, results){
            if(success)
            {
                debug.print("PrintArtistToDiscordTable success");
                res.send({'result': "Success",'data': results.data});
            }
            else
            {
                debug.print("PrintArtistToDiscordTable error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

PrintArtistToDiscordTable = function(access_token, spotifyData, completeCallback)
{
    var sql = 'SELECT * FROM SpotifyArtistLinks ORDER BY discordId';
    
    debug.print(sql);
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistLinks");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Success accessing table SpotifyArtistLinks");
            if(results.length == 0)
            {
                debug.print("SpotifyArtistLinks table empty");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                discordGuild.members.fetch()
                	.then(members => {
                	    var data = "User Name,Discord Id,Spotify Artist Id\n";
                	    
                        results.forEach(result =>
                        {
                            var name = "unknown";
                            
                            members.forEach(member =>
                            {
                                if(member.id == result.discordId)
                                {
                                    //Found the member on discord
                                    if(member.user != null)
                                    {
                                        name = member.user.username;
                                    }
                                    
                	                if(member.nickname != null && member.nickname != "")
                	                {
                	                    name = member.nickname;
                	                }
                                }
                            });
                            
                            data += name + "," + result.discordId + "," + result.spotifyId + "\n";
                        });
                        
                        completeCallback(true, {
                            'result': "Success",
                            'data': data
                        });
                	})
                	.catch(error => {
                	    debug.print("Error fetching discord members, printing without member names");
                        var data = "Discord Id,Spotify Id\n";
                        
                        results.forEach(result =>
                        {
                            data += result.discordId + "," + result.spotifyId + "\n";
                        });
                        
                        completeCallback(true, {
                            'result': "Success",
                            'data': data
                        });
                	});
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_spotify_to_discord_table/', function(req,res) {
    
    debug.print("print_spotify_to_discord_table called");
    
    debug.print("req.query.spotify_id:" + req.query.spotify_id);
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    if(adminAuthenticate(spotifyData))
    {
        PrintSpotifyUserToDiscordTable(access_token, spotifyData, function(success, results){
            if(success)
            {
                debug.print("PrintSpotifyUserToDiscordTable success");
                res.send({'result': "Success",'data': results.data});
            }
            else
            {
                debug.print("PrintSpotifyUserToDiscordTable error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

PrintSpotifyUserToDiscordTable = function(access_token, spotifyData, completeCallback)
{
    var sql = 'SELECT * FROM SpotifyToDiscord ORDER BY discordId';
    
    debug.print(sql);
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyToDiscord");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Success accessing table SpotifyToDiscord");
            if(results.length == 0)
            {
                debug.print("SpotifyToDiscord table empty");
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                discordGuild.members.fetch()
                	.then(members => {
                	    var data = "User Name,Discord Id,Spotify User Id\n";
                	    
                        results.forEach(result =>
                        {
                            var name = "unknown";
                            
                            members.forEach(member =>
                            {
                                if(member.id == result.discordId)
                                {
                                    //Found the member on discord
                                    if(member.user != null)
                                    {
                                        name = member.user.username;
                                    }
                                    
                	                if(member.nickname != null && member.nickname != "")
                	                {
                	                    name = member.nickname;
                	                }
                                }
                            });
                            
                            data += name + "," + result.discordId + "," + result.spotifyId + "\n";
                        });
                        
                        completeCallback(true, {
                            'result': "Success",
                            'data': data
                        });
                	})
                	.catch(error => {
                	    debug.print("Error fetching discord members, printing without member names");
                        var data = "Discord Id,Spotify Id\n";
                        
                        results.forEach(result =>
                        {
                            data += result.discordId + "," + result.spotifyId + "\n";
                        });
                        
                        completeCallback(true, {
                            'result': "Success",
                            'data': data
                        });
                	});
            }
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_tiers_backup_table/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/print_tiers_backup_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        var tiersList = [];
        
        GenerateTiersTableList(0, tiersList, function(success, results){
            if(success)
            {
                debug.print("GenerateTiersTableList success");
                
                var printout = "nickname,discordid,tier\n";
                
                tiersList.forEach(user => {
                    printout += user.name + "," + user.discordId + "," + user.tier + "\n";
                });
                
                res.send({'result': "Success",'data': printout});
            }
            else
            {
                debug.print("GenerateTiersTableList error: " + ERROR_TEXT);
    			res.send({'result': "Error",'message': results.message});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function GenerateTiersTableList(tier, tiersList, completeCallback)
{
    if(tier >= DISCORD_TIERS.length)
    {
        completeCallback(true, {
            'result': "Success",
            'data': tiersList
        });
    }
    else
    {
        con.query('SELECT * FROM Tiers WHERE tier = ' + tier, function (error, results, fields) {
            if (error)
            {
                debug.print("error accessing table Tiers");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                discordGuild.roles.fetch(DISCORD_TIERS[tier].roleId)
                .then(role => {
                    
                    results.forEach(tierUser => {
                        //debug.print("tierUser discordId:" + tierUser.discordId + ", tier:" + tierUser.tier);
                        
                        var found = false;
                        role.members.forEach(member =>{
            		        if(member.user != null && !found)
            		        {
            		            if(member.user.id == tierUser.discordId)
            		            {
            		                var name = member.user.username;
            		                if(member.nickname != null && member.nickname != "")
            		                {
            		                    name = member.nickname;
            		                }
            		                
            		                var arrayUser = {'discordId': tierUser.discordId,
            		                            'tier': tier,
            		                            'name': name};
            		                            
            		                tiersList.push(arrayUser);
            		                found = true;
            		            }
            		        }
            		    });
                    });
                    
                    GenerateTiersTableList(tier + 1, tiersList, completeCallback);
                })
                .catch(error => {
        		    debug.print("Couldn't find role");
        		    debug.print(DISCORD_TIERS[tier].roleId);
        		    debug.print(error);
                
                    GenerateTiersTableList(tier + 1, tiersList, completeCallback);
                });
            }
        });
    }
}

app.get('/' + ENVIRONMENT + '/backup_main_tables/', function(req,res) {
    
    debug.print("backup_main_tables called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        backupMainTables(function(success, results)
        {
            if(success)
            {
                debug.print("backupMainTables success");
                backupTiersTable(function(success, results)
                {
                    if(success)
                    {
                        debug.print("backupTiersTable success");
                        res.send({'result': "Success"});
                    }
                    else
                    {
                        debug.print("backupTiersTable error: " + ERROR_TEXT);
            			res.send({
                    		'result': "Error"
                    	});
                    }
                });
            }
            else
            {
                debug.print("backupMainTables error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/repopulate_mentors_table/', function(req,res) {
    
    debug.print("repopulate_mentors_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        populateMentorsTable(function(success, results)
        {
            if(success)
            {
                debug.print("populateMentorsTable success");
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'populateMentorsTable error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/backup_tiers_table/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/backup_tiers_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        backupTiersTable(function(success, results){
            if(success)
            {
                debug.print("backupTiersTable success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("backupTiersTable error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

revertMainTablesToBackup = function(completeCallback)
{
    debug.print("revertMainTablesToBackup");
    backupTable("Streams", "Backup", "", function(success, results){
        if(success)
        {
            debug.print("revert Streams success");
            backupTable("Points", "Backup", "", function(success, results){
                    if(success)
                    {
                        debug.print("revert Points success");
                        backupTable("BonusPoints", "Backup", "", function(success, results){
                                if(success)
                                {
                                    debug.print("revert BonusPoints success");
                                    completeCallback(true, {'result': "Success"});
                                }
                                else
                                {
                                    debug.print("revert BonusPoints error");
                        			completeCallback(false, {'result': "Error"});
                                }
                            });
                    }
                    else
                    {
                        debug.print("revert Points error");
            			completeCallback(false, {'result': "Error"});
                    }
                });
        }
        else
        {
            debug.print("revert Streams error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

function rolloverTiersTable(completeCallback)
{
    debug.print("calling rolloverTiersTable");
    rolloverTable("Tiers", function(success, results){
        if(success)
        {
            debug.print("rollover Tiers success");
            completeCallback(true, {'result': "Success"});
        }
        else
        {
            debug.print("rollover Tiers error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

rolloverMainTables = function(completeCallback)
{
    debug.print("rolloverMainTables called");
    rolloverTable("Streams", function(success, results){
        if(success)
        {
            debug.print("rollover Streams success");
            rolloverPointsTable("Points", function(success, results){
                if(success)
                {
                    debug.print("rollover Points success");
                    rolloverTable("BonusPoints", function(success, results){
                        if(success)
                        {
                            debug.print("rollover BonusPoints success");
                            completeCallback(true, {'result': "Success"});
                        }
                        else
                        {
                            debug.print("rollover BonusPoints error");
                			completeCallback(false, {'result': "Error"});
                        }
                    });
                }
                else
                {
                    debug.print("rollover Points error");
        			completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("rollover Streams error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

rolloverPointsTable = function(table, completeCallback)
{
    debug.print("rolloverPointsTable " + table);
    backupTable(table, "PreviousWeek1", "PreviousWeek2", function(success, results){
        if(success)
        {
            debug.print("rollover " + table + "PreviousWeek1 to " + table + "PreviousWeek2 success");
            backupTable(table, "", "PreviousWeek1", function(success, results){
                if(success)
                {
                    debug.print("rollover " + table + " to " + table + "PreviousWeek1 success");
                    
                    var updateSql = "UPDATE " + table + " SET points = 0";
                    
                    debug.print(updateSql);
                    con.query(updateSql, function (error, results, fields) {
                        if (error)
                        {
                            debug.print("error deleting points column from " + table);
                            debug.print(error);
                            completeCallback(false, {'result': "Error", 'error': error});
                        }
                        else
                        {
                            debug.print("Deleted points column from " + table);
                            completeCallback(true, {'result': "Success"});
                        }
                    });
                }
                else
                {
                    debug.print("rollover " + table + " error");
        			completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("rollover " + table + "PreviousWeek1 error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

rolloverTable = function(table, completeCallback)
{
    debug.print("rolloverTable " + table);
    backupTable(table, "PreviousWeek1", "PreviousWeek2", function(success, results){
        if(success)
        {
            debug.print("rollover " + table + "PreviousWeek1 to " + table + "PreviousWeek2 success");
            backupTable(table, "", "PreviousWeek1", function(success, results){
                if(success)
                {
                    debug.print("rollover " + table + " to " + table + "PreviousWeek1 success");
                    var deleteSql = "DELETE FROM " + table;
                    debug.print(deleteSql);
                    con.query(deleteSql, function (error, results, fields) {
                        if (error)
                        {
                            debug.print("error deleting all rows from " + table);
                            debug.print(error);
                            completeCallback(false, {'result': "Error", 'error': error});
                        }
                        else
                        {
                            debug.print("Deleted all rows from " + table);
                            completeCallback(true, {'result': "Success"});
                        }
                    });
                }
                else
                {
                    debug.print("rollover " + table + " error");
        			completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("rollover " + table + "PreviousWeek1 error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

backupTable = function(table, fromSuffix, toSuffix, completeCallback)
{
    debug.print("backupTable " + table + " from " + table + fromSuffix + " to " + table + toSuffix);
    var deleteSql = "DELETE FROM " + table + toSuffix;
    debug.print(deleteSql);
    con.query(deleteSql, function (error, results, fields) {
        if (error)
        {
            debug.print("error deleting all rows from " + table + toSuffix);
            debug.print(error);
            completeCallback(false, {'result': "Error", 'error': error});
        }
        else
        {
            debug.print("Deleted all rows from " + table + toSuffix);
            var copySql = "INSERT " + table + toSuffix + " SELECT * FROM " + table + fromSuffix;
            debug.print(copySql);
            con.query(copySql, function (error, results, fields) {
                if (error)
                {
                    debug.print("error copying " + table + fromSuffix + " to " + table + toSuffix);
                    debug.print(error);
                    completeCallback(false, {'result': "Error", 'error': error});
                }
                else
                {
                    debug.print("Copied all rows from " + table + fromSuffix + " to " + table + toSuffix);
                    completeCallback(true, {'result': "Success"});
                }
            });
        }
    });
}

backupTiersTable = function(completeCallback)
{
    debug.print("called backupTiersTable");
    backupTable("Tiers", "", "Backup", function(success, results)
    {
        if(success)
        {
            debug.print("backup Tiers success");
            completeCallback(true, {'result': "Success"});
        }
        else
        {
            debug.print("backup Tiers error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

backupMainTables = function(completeCallback)
{
    debug.print("backupMainTables");
    backupTable("Streams", "", "Backup", function(success, results)
    {
        if(success)
        {
            debug.print("backup Streams success");
            backupTable("Points", "", "Backup", function(success, results)
            {
                if(success)
                {
                    debug.print("backup Points success");
                    backupTable("BonusPoints", "", "Backup", function(success, results)
                    {
                        if(success)
                        {
                            debug.print("backup BonusPoints success");
                            completeCallback(true, {'result': "Success"});
                        }
                        else
                        {
                            debug.print("backup BonusPoints error");
                			completeCallback(false, {'result': "Error"});
                        }
                    });
                }
                else
                {
                    debug.print("backup Points error");
        			completeCallback(false, {'result': "Error"});
                }
            });
        }
        else
        {
            debug.print("backup Streams error");
			completeCallback(false, {'result': "Error"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/rollover_tiers_table/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/rollover_tiers_table called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        rolloverTiersTable(function(success, results){
            if(success)
            {
                debug.print("rolloverTiersTable success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("rolloverTiersTable error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/rollover_main_tables/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/rollover_main_tables called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        rolloverMainTables(function(success, results){
            if(success)
            {
                debug.print("rolloverMainTables success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("rolloverMainTables error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/revert_main_tables_to_backup/', function(req,res) {
    
    debug.print('/' + ENVIRONMENT + "/revert_main_tables_to_backup called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        revertMainTablesToBackup(function(success, results){
            if(success)
            {
                debug.print("revertMainTablesToBackup success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("revertMainTablesToBackup error");
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/update_tiers/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/update_tiers called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        UpdateDiscordTiersWithDelay(function(success, results){
            if(success)
            {
                var count = 0;
                if(results.data != null && results.data.length > 0)
                {
                    debug.print(results.data);
                    count = results.data.length;
                }
                debug.print("UpdateDiscordTiersWithDelay success:" + count);
                res.send({'result': "Success", 'count': count});
            }
            else
            {
                debug.print("UpdateDiscordTiersWithDelay error");
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/revert_tiers/', function(req,res)
{
    debug.print('/' + ENVIRONMENT + "/revert_tiers called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    if(resetAuthenticate(spotifyData))
    {
        revertTiersOnDiscord(function(success, results){
            if(success)
            {
                debug.print("revertTiersOnDiscord success");
                res.send({'result': "Success"});
            }
            else
            {
                debug.print("revertTiersOnDiscord error");
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function revertTiersOnDiscord(completeCallback)
{
    con.query('SELECT discordId, tier FROM Tiers', function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table Tiers");
            debug.print(error);
            
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            discordGuild.members.fetch()
            	.then(members =>
            	{
            	    results.forEach(tierMember => {
            	        if(tierMember.tier < 7)
            	        {
            	            members.every(member =>
            	            {
            	                if(member.id == tierMember.discordId)
            	                {
                	                for(var i = 0; i < (DISCORD_TIERS.length - 1); ++i)
                	                {
                	                    if( i != tierMember.tier && member.roles.cache.has(DISCORD_TIERS[i].roleId))
                	                    {
            	                            debug.print("Member:" + member.id + ", Old Tier:" + i + ", New Tier:" + tierMember.tier);
                	                        member.roles.remove(DISCORD_TIERS[i].roleId);
            	                            member.roles.add(DISCORD_TIERS[tierMember.tier].roleId);
            	                            return false;
                	                    }
                	                }
            	                }
            	                
            	                return true;
            	            });
            	        }
            	    })
                    completeCallback(true, {'result': "Success"});
            	})
            	.catch(error =>
            	{
                    completeCallback(false, {'result': "Success"});
            	});
        }
    });
}

app.get('/' + ENVIRONMENT + '/get_discord_ids/', function(req,res) {
    
    //debug.print("get_discord_ids called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var discordUsers = [];
    
    if(modAuthenticate(spotifyData))
    {
        getDiscordUsers(discordUsers, function(success, results){
            if(success)
            {
                //debug.print("getDiscordUsers success");
                res.send({'result': "Success", 'data':discordUsers});
            }
            else
            {
                debug.print("getDiscordUsers error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/get_discord_roles/', function(req,res) {
    
    //debug.print("get_discord_roles called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var discordRoles = [];
    
    if(modAuthenticate(spotifyData))
    {
        getDiscordRoles(discordRoles, function(success, results){
            if(success)
            {
                //debug.print("getDiscordRoles success");
                res.send({'result': "Success", 'data':discordRoles});
            }
            else
            {
                debug.print("getDiscordRoles error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

getDiscordRoles = function(discordRoles, completeCallback)
{
    //debug.print("getDiscordRoles called");
    
    discordGuild.roles.cache.forEach(role =>
    {
        var array = [role.id, role.name];
        discordRoles.push(array)
    });
    
    discordRoles.sort(function(a, b){return a[1].localeCompare(b[1])});
    
    completeCallback(true, {'result': "Success", 'discordRoles': discordRoles});
}

getDiscordUsers = function(discordUsers, completeCallback)
{
    //debug.print("getDiscordUsers called");
    
    getTiersArrayHelper(DISCORD_TIERS.length - 1, discordUsers, true, false, true, function(success, results){
        if(success)
        {
            discordUsers.sort(function(a, b){return a[1].localeCompare(b[1])});
            
            completeCallback(success, {'result': "Success", 'discordUsers': discordUsers});
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
    });
}

app.get('/' + ENVIRONMENT + '/export_bonus_points/', function(req,res) {
    
    debug.print("/export_bonus_points called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'discordId': "",
        'spotifyIds': [],
        'streamsByUser': []
    };
    
    var previous_week = (req.query.previous_week == null?0:req.query.previous_week);
    var previous_week_name = PREVIOUS_WEEKS[previous_week];
    
    if(modAuthenticate(spotifyData))
    {
        getUsersWithBonusPoints(previous_week_name, function(success, bonusPointsResults){
            if(success)
            {
                //debug.print("getUsersWithBonusPoints success");
                getUserNamesForBonusPoints(bonusPointsResults.bonusUsers, function(success, bonusPointsWithNamesResults){
                    if(success)
                    {
                        //debug.print("getUserNamesForBonusPoints success");
                        var reasons = [];
                        
                        getBonusPointsBreakdowns(previous_week_name, bonusPointsWithNamesResults.bonusUsers, 0, reasons, function(success, breakdownResults){
                            if(success)
                            {
                                //debug.print("getBonusPointsBreakdowns success");
                                
                                var message = createBonusPointsExport(breakdownResults.bonusUsers, breakdownResults.reasons);
                                //debug.print(message);
                                
                                res.send({'result': "Success",'data':message});
                            }
                            else
                            {
                                debug.print("getBonusPointsBreakdowns error");
                                res.send({'result': "Error"});
                            }
                        });
                    }
                    else
                    {
                        debug.print("getUserNamesForBonusPoints error");
                        res.send({'result': "Error"});
                    }
                });
            }
            else
            {
                debug.print("AddBonusPoints error");
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

getUserNamesForBonusPoints = function(bonusUsers, completeCallback)
{
    discordGuild.members.fetch()
    	.then(members => {
    	    for(i = 0; i < bonusUsers.length; ++i)
    	    {
    	        members.forEach(member =>
                    {
                        if(member.id == bonusUsers[i].discordId)
                        {
                            var name = "";
                            
                            //Found the member on discord
                            if(member.user != null)
                            {
                                name = member.user.username;
                            }
                            
        	                if(member.nickname != null && member.nickname != "")
        	                {
        	                    name = member.nickname;
        	                }
        	                
        	                bonusUsers[i].name = name;
                        }
                    });
    	    }
            
            completeCallback(true, {
                'result': "Success",
                'bonusUsers': bonusUsers
            });
    	})
    	.catch(error => {
    	    debug.print("Error fetching discord members, printing without member names");
    	    
            completeCallback(true, {
                'result': "Success",
                'bonusUsers': bonusUsers
            });
    	});
}

createBonusPointsExport = function(bonusUsers, reasons)
{
    var message = "Discord Id,User Name,Points Total,";
    reasons.forEach(reason =>
    {
        message += reason + ",";
    });
    message += '\n';
    
    bonusUsers.sort(function(a, b)
    {
        
    });
    
    bonusUsers.forEach(user =>
    {
        message += '"=""' + user.discordId + '"""' + "," + user.name + "," + user.total + ",";
        reasons.forEach(reason =>
        {
            var points = 0;
            
            user.points.forEach(singlePoint =>
            {
                if(singlePoint.reason == reason)
                {
                    points = singlePoint.points;
                }
            });
            
            message += points + ",";
        });
        message += '\n';
    });
    
    return message;
}

getBonusPointsBreakdowns = function(week, bonusUsers, index, reasons, completeCallback)
{
    //debug.print("getBonusPointsBreakdowns: " + index + " / " + bonusUsers.length);
    
    if(index >= bonusUsers.length)
    {
        completeCallback(true, {'result': "Success", 'bonusUsers':bonusUsers, 'reasons':reasons});
    }
    else
    {
        //debug.print("user: " + bonusUsers[index].discordId + " | points: " + bonusUsers[index].total);
    
        var sql = "SELECT discordId, points, reason from BonusPoints" + week + " WHERE discordId = '" + bonusUsers[index].discordId + "'";
    
        con.query(sql, function (error, results, fields) {
            if (error)
            {
                debug.print("error accessing table BonusPoints");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                results.forEach(result =>
                {
                    var singlePoints = {
                        'points':result.points,
                        'reason':result.reason
                    };
                    
                    var alreadyHasPointsForReason = false;
                    
                    for(var i = 0; i < bonusUsers[index].points.length; ++i)
                    {
                        if(bonusUsers[index].points[i].reason == singlePoints.reason)
                        {
                            alreadyHasPointsForReason = true;
                            bonusUsers[index].points[i].points += singlePoints.points;
                        }
                    }
                    
                    if(!alreadyHasPointsForReason)
                    {
                        bonusUsers[index].points.push(singlePoints);
                    }
                    
                    if(!reasons.includes(singlePoints.reason))
                    {
                        reasons.push(singlePoints.reason);
                    }
                });
                
                getBonusPointsBreakdowns(week, bonusUsers, index + 1, reasons, completeCallback);
            }
        });
    }
}

getUsersWithBonusPoints = function(week, completeCallback)
{
    var sql = "SELECT discordId, SUM(points) AS 'total' FROM BonusPoints" + week + " GROUP BY discordId ORDER BY total DESC";
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table BonusPoints");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var bonusUsers = [];
            results.forEach(result =>
            {
                var bonusUser =
                {
                    'discordId':result.discordId,
                    'total':result.total,
                    'points':[]
                };
                bonusUsers.push(bonusUser);
            });
            
            completeCallback(true, {'result': "Success", 'bonusUsers':bonusUsers});
        }
    });
}

app.get('/' + ENVIRONMENT + '/export_mod_points/', function(req,res) {
    
    debug.print("/export_mod_points called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var previous_week = (req.query.previous_week == null?0:req.query.previous_week);
    var previous_week_name = PREVIOUS_WEEKS[previous_week];
    
    debug.print("Previous Week:" + previous_week_name);
    
    if(modAuthenticate(spotifyData))
    {
        getModPointsList(previous_week_name, function(success, results){
            if(success)
            {
    			res.send({
            		'result': "Success",'data': results.data
            	});
            }
            else
            {
                debug.print("getModPointsList failed");
                
        		debug.print("getModPointsList error: " + ERROR_TEXT);
    			res.send({
            		'result': "Error"
            	});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

getModPointsList = function(previousWeek, completeCallback)
{
    if(discordGuild != null)
    {
        discordGuild.roles.fetch(DISCORD_TIERS[DISCORD_TIERS.length - 1].roleId)
    	.then(role => {
    	    
    	    var count = 0;
    	    var userList = [];
    	    
    	    role.members.forEach(member =>{
    	        ++count;
    	        
                var name = member.user.username;
                if(member.nickname != null && member.nickname != "")
                {
                    name = member.nickname;
                }
                
                var newUser = {'discordId':member.id,'name':name,'tier':(DISCORD_TIERS.length - 1)};
                
                userList.push(newUser);
    	    });
    	    
    	    var pointsList = [];

            retrievePointsListByWeek(0, userList, pointsList, true, previousWeek, function(success, results)
            {
                pointsList.sort(function(a, b){return b.points - a.points});
                    
    	        var report = generateModStreamReport(userList, pointsList);
                
    		    completeCallback(true, {'data':report});
            });
    	});
    }
}

generateModStreamReport = function(userList, pointsList)
{
    var report = "";
    
    for(var i = 0; i < pointsList.length; ++i)
    {
        var discordId = pointsList[i].discordId;
        var points = pointsList[i].points;
        
        var user = userList.find(u => (u.discordId == discordId));
        var name = user.name;
        
        report += name + "," + discordId + "," + points + "\n";
    }
    
    return report;
}

app.get('/' + ENVIRONMENT + '/set_ordered_song_list/', function(req,res)
{
    debug.print("set_ordered_song_list called");
    
    var access_token = req.query.access_token;
    
    var song_list = req.query.song_list;
    var songs = song_list.split(',');
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      song_list: songs
    };
    
    debug.print(songs);
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    writeSongOrderForUser(spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/set_ordered_song_list_for_user/', function(req,res)
{
    debug.print("set_ordered_song_list_for_user called");
    
    var access_token = req.query.access_token;
    
    var song_list = req.query.song_list;
    var songs = song_list.split(',');
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      song_list: songs
    };
    
    var discordId = req.query.user_discord_id
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    writeSongOrderForDiscordId(discordId, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function getSongRulePreview(access_token, discordId, completeCallback)
{
    getTierFromDiscordId(discordId, function(success, results)
    {
        if(success)
        {
            var returnArray = [
                {'playlist':"101",'count':0,'reasons':[]},
                {'playlist':"NAS",'count':0,'reasons':[]},
                {'playlist':"Pro",'count':0,'reasons':[]},
                {'playlist':"Allstars",'count':0,'reasons':[]},
                {'playlist':"Superstars",'count':0,'reasons':[]},
                {'playlist':"Elite",'count':0,'reasons':[]},
                {'playlist':"Legends",'count':0,'reasons':[]}
                ];
            
            if(results.tier == 9)
            {
                //debug.print("Mod found:" + discordId);
                
                var modsQuery = "SELECT songCount FROM ModSongs WHERE discordId = '" + discordId + "'";
                
                //debug.print(modsQuery);
                
                con.query(modsQuery, function (error, modsResults, fields)
                {
                    if (error)
                    {
            	        debug.print("mods error:");
            	        debug.print(error);
                        completeCallback(false, {'result': "Error", 'error': "No songCount for Mod"});
                    }
                    else
                    {
                        //debug.print("Found results for mod");
                        
                        if(modsResults.length > 0)
                        {
                            //debug.print("Mod Count:" + modsResults[0].songCount);
                            
                            for(var i = 0; i < modsResults[0].songCount; ++i)
                            {
                                var songNumber = i + 1;
                                var reason = "Mod Song " + songNumber
                                
                                for(var j = 0; j < returnArray.length; ++j)
                                {
                                    returnArray[j].count += 1;
                                    returnArray[j].reasons.push(reason);
                                }
                            }
                        }
                        
                        var mentorQuery = "SELECT songCount FROM MentorSongs WHERE discordId = '" + discordId + "'";
                        
                        //debug.print(mentorQuery);
                        
                        con.query(mentorQuery, function (error, mentorResults, fields)
                        {
                            if (error)
                            {
                    	        debug.print("mods error:");
                    	        debug.print(error);
                    	        
                    	        completeCallback(true, {'result': "Success", 'playlists':returnArray});
                            }
                            else
                            {
                                //debug.print("Found results for mentor");
                                
                                if(mentorResults.length > 0)
                                {
                                    //debug.print("Mentor Count:" + mentorResults[0].songCount);
                                    
                                    for(var i = 0; i < mentorResults[0].songCount; ++i)
                                    {
                                        var songNumber = i + 1;
                                        var reason = "Mentor Song " + songNumber;
                                        
                                        returnArray[6].count += 1;
                                        returnArray[6].reasons.push(reason);
                                    }
                                }
                                
                    	        completeCallback(true, {'result': "Success", 'playlists':returnArray});
                            }
                        });
                    }
                });
            }
            else
            {
                //debug.print("discordId:" + discordId + " tier:" + results.tier);
                
                var sql = "SELECT DISTINCT playlistId FROM PlaylistSongOrder WHERE groupTier = " + results.tier;
                
                con.query(sql, function (error, songOrderResults, fields)
                {
                    if (error)
                    {
            	        debug.print("error");
            	        debug.print(error);
                        completeCallback(false, {'result': "Error", 'error': "Couldn't find playlists for tier"});
                    }
                    else
                    {
                        songOrderResults.forEach(row =>
                        {
                            var index = 0;
                            
                            for(var i = 0; i < returnArray.length; ++i)
                            {
                                if(returnArray[i].playlist == row.playlistId)
                                {
                                    index = i;
                                }
                            }
                            
                            returnArray[index].count += 1;
                            returnArray[index].reasons.push("Tier Song");
                        });
                        
                        var mentorQuery = "SELECT songCount FROM MentorSongs WHERE discordId = '" + discordId + "'";
                        
                        //debug.print(mentorQuery);
                        
                        con.query(mentorQuery, function (error, mentorResults, fields)
                        {
                            if (error)
                            {
                    	        debug.print("mods error:");
                    	        debug.print(error);
                    	        
                    	        completeCallback(true, {'result': "Success", 'playlists':returnArray});
                            }
                            else
                            {
                                //debug.print("Found results for mentor");
                                
                                if(mentorResults.length > 0)
                                {
                                    //debug.print("Mentor Count:" + mentorResults[0].songCount);
                                    
                                    for(var i = 0; i < mentorResults[0].songCount; ++i)
                                    {
                                        var songNumber = i + 1;
                                        var reason = "Mentor Song " + songNumber;
                                        
                                        returnArray[6].count += 1;
                                        returnArray[6].reasons.push(reason);
                                    }
                                }
                                
                    	        completeCallback(true, {'result': "Success", 'playlists':returnArray});
                            }
                        });
                    }
                });
            }
        }
        else
        {
            debug.print("No Tier for DiscordId:" + discordId);
            completeCallback(false, {'result': "Error", 'error': "No tier set for discordId"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/get_song_rule_preview/', function(req,res)
{
    //debug.print("get_song_rule_preview called");
    
    var access_token = req.query.access_token;
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            var discordId = discordIdResults.discordId;
            
            getSongRulePreview(access_token, discordId, function(success, results)
            {
                if(success)
                {
                    res.send({'result': "Success", 'message':'Success', 'playlists':results.playlists});
                }
                else
                {
                    res.send({'result': "Error", 'message':'Error'});
                }
            });
        }
        else
        {
            debug.print("Couldn't find discord Id for user " + spotifyData.user_id);
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/get_song_rule_preview_for_user/', function(req,res)
{
    debug.print("get_song_rule_preview_for_user called");
    
    var access_token = req.query.access_token;
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.user_discord_id
    };
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    var discordId = spotifyData.discord_id;
    
    getSongRulePreview(access_token, discordId, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success', 'playlists':results.playlists});
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/reset_song_list/', function(req,res)
{
    //debug.print("reset_song_list called");
    
    var access_token = req.query.access_token;
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    deleteSongOrderForUser(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            getDiscordId(spotifyData.user_id, function(success, discordIdResults)
            {
                if(success)
                {
                    var discordId = discordIdResults.discordId;
                    
                    fillOrderedSongListForUser(access_token, discordId, {}, function(success, results)
                    {
                        if(success)
                        {
                            res.send({'result': "Success", 'message':'Success'});
                        }
                        else
                        {
                            debug.print("fillOrderedSongListForUser error for user:" + discordId);
                            res.send({'result': "Error", 'message':'Error'});
                        }
                    });
                }
                else
                {
                    debug.print("Couldn't find discord Id for user " + spotifyData.user_id);
                    res.send({'result': "Error", 'message':'Error'});
                }
            });
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/reset_song_list_for_user/', function(req,res)
{
    debug.print("reset_song_list_for_user called");
    
    var access_token = req.query.access_token;
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.user_discord_id
    };
    
    // Create a table DiscordId + SongPosition -> SpotifySongId
    
    var discordId = spotifyData.discord_id;
    
    deleteSongOrderForDiscordId(access_token, discordId, function(success, results)
    {
        if(success)
        {
            fillOrderedSongListForUser(access_token, discordId, {}, function(success, results)
            {
                if(success)
                {
                    res.send({'result': "Success", 'message':'Success'});
                }
                else
                {
                    debug.print("fillOrderedSongListForUser error for user:" + discordId);
                    res.send({'result': "Error", 'message':'Error'});
                }
            });
        }
        else
        {
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/get_ordered_song_list/', function(req,res)
{
    //debug.print("get_ordered_song_list called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    getOrderedSongListForUser(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success', 'data':results.data});
        }
        else
        {
            debug.print("getOrderedSongListForUser error")

            var error = "Error";
            if(results.error != null)
            {
                debug.print("get_ordered_song_list error user spotify id:" + req.query.spotify_id);
                debug.print(results.error);
                error = results.error;
            }
            
            res.send({'result': "Error", 'message':error});
        }
    });
});

app.get('/' + ENVIRONMENT + '/get_ordered_song_list_for_user/', function(req,res)
{
    debug.print("/get_ordered_song_list_for_user called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var user_discord_id = req.query.user_discord_id;
    debug.print("user_discord_id:" + user_discord_id);
    
    getOrderedSongListFromDiscord(access_token, user_discord_id, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success', 'data':results.data});
        }
        else
        {
            debug.print("getOrderedSongListForUser error")
            
            var error = "Error";
            if(results.error != null)
            {
                debug.print("error user discord id:" + user_discord_id);
                debug.print(results.error);
                error = results.error;
            }
            
            res.send({'result': "Error", 'message':error});
        }
    });
});

app.get('/' + ENVIRONMENT + '/set_song_rule/', function(req,res)
{
    //debug.print("/set_song_rule called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      rule: req.query.rule
    };
    
    var access_token = req.query.access_token;
    
    setSongRuleForUser(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            debug.print("set_song_rule error")
            if(results.error != null)
            {
                debug.print(results.error);
            }
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/set_song_rule_for_user/', function(req,res)
{
    debug.print("/set_song_rule_for_user called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.user_discord_id,
      rule: req.query.rule
    };
    
    var access_token = req.query.access_token;
    
    //debug.print("discordId:" + spotifyData.discord_id);
    //debug.print("rule:" + spotifyData.rule);
    
    setSongRuleFromdiscordId(access_token, spotifyData.discord_id, spotifyData.rule, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success'});
        }
        else
        {
            debug.print("set_song_rule error")
            if(results.error != null)
            {
                debug.print(results.error);
            }
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/get_song_rule/', function(req,res)
{
    //debug.print("get_song_rule called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    getSongRuleForUser(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success', 'rule':results.data});
        }
        else
        {
            debug.print("get_song_rule error")
            if(results.error != null)
            {
                debug.print(results.error);
            }
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

app.get('/' + ENVIRONMENT + '/get_song_rule_for_user/', function(req,res)
{
    //debug.print("get_song_rule_for_user called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      discord_id: req.query.user_discord_id
    };
    
    var access_token = req.query.access_token;
    
    var discordId = spotifyData.discord_id;
    
    getSongRuleFromdiscordId(access_token, discordId, spotifyData, function(success, results)
    {
        if(success)
        {
            res.send({'result': "Success", 'message':'Success', 'rule':results.data});
        }
        else
        {
            debug.print("get_song_rule error")
            if(results.error != null)
            {
                debug.print(results.error);
            }
            res.send({'result': "Error", 'message':'Error'});
        }
    });
});

function groupTypeToInt(groupType)
{
    if(groupType == "SingleSong")
    {
        return 1;
    }
    else
    {
        return 0;
    }
}

function intToGroupType(number)
{
    if(number == 1)
    {
        return "SingleSong";
    }
    else
    {
        return "SongGroup";
    }
}

app.get('/' + ENVIRONMENT + '/add_playlist_element/', function(req,res)
{
    debug.print("add_playlist_element called");
    
    var spotifyData =
    {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: "because"
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        var groupEntry =
        {
            playlist: req.query.playlist,
            groupType: groupTypeToInt(req.query.type),
            tier: -1,
            modGroup: -1,
            songNumber: 0,
            songCount: 0,
            songId: ''
        };
        
        if(req.query.type == "SongGroup")
        {
            if(req.query.tier == "mods")
            {
                groupEntry.modGroup = 1;
            }
            else if(req.query.tier == "mentors")
            {
                groupEntry.modGroup = 2;
            }
            else
            {
                groupEntry.tier = req.query.tier;                
            }
            
            groupEntry.songNumber = req.query.song_number;
            groupEntry.songCount = req.query.song_count;
            groupEntry.songNumber = req.query.song_number;
        }
        else if(req.query.type == "SingleSong")
        {
            groupEntry.songId = req.query.song_id;
        }
        
        spotifyData.groupEntry = groupEntry;
        
        if(req.query.type == "SingleSong")
        {
            // Validate songId
            var spotifySongData = {
                songs:[req.query.song_id]
            };
            
            spotify.getSongInfo(access_token, spotifySongData, function(success, results)
            {
                if(success)
                {
                    if(results.tracks.length > 0)
                    {
                        addElementToPlaylist(spotifyData, function(success, results)
                        {
                            if(success)
                            {
                                debug.print("Success adding element to playlist");
                                res.send({'result': "Success"});
                            }
                            else
                            {
                                debug.print(results.error);
                                res.send({'result': "Error"});
                            }
                        });
                    }
                    else
                    {
                        debug.print(results.error);
                        res.send({'result': "Error", 'message': "Invalid Song Id"});
                    }
                }
                else
                {
                    debug.print(results.error);
                    res.send({'result': "Error"});
                }
            });
        }
        else
        {
            addElementToPlaylist(spotifyData, function(success, results)
            {
                if(success)
                {
                    debug.print("Success adding element to playlist");
                    res.send({'result': "Success"});
                }
                else
                {
                    debug.print(results.error);
                    res.send({'result': "Error"});
                }
            });
        }
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function addElementToPlaylist(spotifyData, completeCallback)
{
    debug.print("addElementToPlaylist");
    debug.print(spotifyData);
    
    var playlistId = spotifyData.groupEntry.playlist;
    
    if(playlistId == null)
    {
        completeCallback(false, 
        {
            'result': "Error",
            'error': "Playlist tag " + spotifyData.groupEntry.playlist + " not in spotifyData"
        });
    }
    else
    {
        // Get groupPosition
        var groupPositionQuery = "SELECT MAX(groupPosition) FROM PlaylistSongOrder WHERE playlistId = '" + playlistId + "'";
        
        debug.print(groupPositionQuery);
        
        con.query(groupPositionQuery, function (error, groupPositionResults, fields)
        {
            if (error)
            {
                debug.print("error accessing table PlaylistSongOrder");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                debug.print(groupPositionResults[0]);
                debug.print(groupPositionResults[0]['MAX(groupPosition)']);
                
                var groupPosition = 1;
                
                if(groupPositionResults[0]['MAX(groupPosition)'] != null)
                {
                    groupPosition = groupPositionResults[0]['MAX(groupPosition)'] + 1;
                }
                
                var insertSql = "INSERT INTO PlaylistSongOrder (playlistId, groupPosition, groupType, groupTier, modGroup, songId, songPosition, songCount) VALUES ('" + 
                playlistId + "', " + groupPosition + ", " + spotifyData.groupEntry.groupType + ", " + spotifyData.groupEntry.tier + ", " +
                spotifyData.groupEntry.modGroup + ", '" + spotifyData.groupEntry.songId + "', " + spotifyData.groupEntry.songNumber + ", " +
                spotifyData.groupEntry.songCount + ");";
                
                debug.print(insertSql);
                
                con.query(insertSql, function (error, insertResults, fields)
                {
                    if (error)
                    {
                        debug.print("error accessing table PlaylistSongOrder for insert");
                        debug.print(error);
                        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
        });
    }
}

app.get('/' + ENVIRONMENT + '/get_playlist_elements/', function(req,res)
{
    debug.print("get_playlist_elements called");
    
    var spotifyData =
    {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      playlist: req.query.playlist,
      text_box: "because"
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        getPlaylistElements(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print("Success getting playlist");
                debug.print(results.data);
                
                res.send({'result': "Success", 'data':results.data});
            }
            else
            {
                debug.print(results.error);
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function getPlaylistElements(access_token, spotifyData, completeCallback)
{
    if(spotifyData.playlist != null)
    {
        var selectQuery = "SELECT * FROM PlaylistSongOrder WHERE playlistId = '" + spotifyData.playlist + "' ORDER BY groupPosition";
        
        debug.print(selectQuery);
        
        con.query(selectQuery, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error accessing table PlaylistSongOrder for getPlaylistElements");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                debug.print(results);
                
                if(results != null && results.length > 0)
                {
                    var returnList = [];
                    var tracks = [];
                    
                    results.forEach(result =>
                    {
                        var element =
                        {
                            'groupType': intToGroupType(result.groupType),
                            'groupTier': result.groupTier,
                            'modGroup': result.modGroup,
                            'songId': result.songId,
                            'songPosition': result.songPosition,
                            'songCount': result.songCount,
                        };
                        returnList.push(element);
                        
                        if(element.groupType == "SingleSong")
                        {
                            tracks.push(element.songId);
                        }
                    });
            
                    var spotifySongData = {
                        songs:tracks
                    };
                    
                    getSongInfo(access_token, spotifySongData, function(success, results)
                    {
                        if(success)
                        {
                            returnList.forEach(returnElement =>
                            {
                                results.tracks.forEach(track =>
                                {
                                    if(returnElement.songId == track.trackId)
                                    {
                                        returnElement.songName = track.trackName + " (" + track.artistName + ")";
                                    }
                                });
                            });
                            
                            completeCallback(true, {'result': "Success", 'data':returnList});
                        }
                        else
                        {
                            debug.print(results);
                            completeCallback(false, {'result': "Error", 'error': "getSongsForArtist error"});
                        }
                    });
                }
                else
                {
                    completeCallback(true, {'result': "Success", 'data':null});
                }
            }
        });
    }
    else
    {
        completeCallback(false, 
        {
            'result': "Error",
            'error': "Playlist tag " + spotifyData.playlist + " null"
        });
    }
}

app.get('/' + ENVIRONMENT + '/delete_playlist_element/', function(req,res)
{
    debug.print("delete_playlist_element called");
    
    var spotifyData =
    {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      playlist: req.query.playlist,
      text_box: "because"
    };
    
    var access_token = req.query.access_token;
    
    debug.print(req.query.remove_elements);
    
    spotifyData.remove_elements = req.query.remove_elements;
    
    if(resetAuthenticate(spotifyData))
    {
        deletePlaylistElements(spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print("Success getting playlist");
                res.send({'result': "Success", 'data':results.data});
            }
            else
            {
                debug.print(results.error);
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function deletePlaylistElements(spotifyData, completeCallback)
{
    if(spotifyData.playlist != null)
    {
        var deleteQuery = "DELETE FROM PlaylistSongOrder WHERE playlistId = '" + spotifyData.playlist + 
            "' AND groupPosition IN (" + spotifyData.remove_elements + ");";
        
        debug.print(deleteQuery);
        
        con.query(deleteQuery, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error accessing table PlaylistSongOrder for getPlaylistElements");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                updatePlaylistGroupOrder(spotifyData, completeCallback);
            }
        });
    }
    else
    {
        completeCallback(false, 
        {
            'result': "Error",
            'error': "Playlist tag " + spotifyData.playlist + " null"
        });
    }
}

function updatePlaylistGroupOrder(spotifyData, completeCallback)
{
    var selectQuery = "SELECT * FROM PlaylistSongOrder WHERE playlistId = '" + spotifyData.playlist + "' ORDER BY groupPosition";
    
    debug.print(selectQuery);
    
    con.query(selectQuery, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table PlaylistSongOrder for getPlaylistElements");
            debug.print(error);
            
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var groupList = [];
            
            results.forEach(result =>
            {
                groupList.push(result);
                debug.print(result);
            });
            
            spotifyData.groupList = groupList;
            
            updatePlaylistGroupOrderHelper(spotifyData, 0, completeCallback);
        }
    });
}

function updatePlaylistGroupOrderHelper(spotifyData, index, completeCallback)
{
    if(index >= spotifyData.groupList.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var oldGroupPosition = spotifyData.groupList[index].groupPosition;
        var newGroupPosition = index + 1;
        var updateQuery = "UPDATE PlaylistSongOrder SET groupPosition = " + newGroupPosition + " WHERE playlistId = '" + spotifyData.playlist + "' AND groupPosition = " + oldGroupPosition + ";";
        
        debug.print(updateQuery);
        
        con.query(updateQuery, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error reording table PlaylistSongOrder");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                updatePlaylistGroupOrderHelper(spotifyData, index + 1, completeCallback);
            }
        });
    }
}

app.get('/' + ENVIRONMENT + '/update_playlist_order/', function(req,res)
{
    debug.print("update_playlist_order called");
    
    var spotifyData =
    {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      playlist: req.query.playlist,
      text_box: "because"
    };
    
    var access_token = req.query.access_token;
    
    debug.print(req.query.order);
    
    spotifyData.newOrder = req.query.order.split(',');
    
    if(resetAuthenticate(spotifyData))
    {
        reorderPlaylistGroups(spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print("Success getting playlist");
                res.send({'result': "Success", 'data':results.data});
            }
            else
            {
                debug.print(results.error);
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function reorderPlaylistGroups(spotifyData, completeCallback)
{
    var count = 0;
    for(var i = 0; i < spotifyData.newOrder.length; ++i)
    {
        var groupPosition = i + 1;
        
        if(groupPosition != spotifyData.newOrder[i])
        {
            ++count;
        }
    }
    
    if(count > 0)
    {
        bumpPlaylistGroupOrder(spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print("Success bumping playlist groups");
                reorderPlaylistGroupOrderHelper(spotifyData, 0, completeCallback);
            }
            else
            {
                debug.print(results.error);
                res.send({'result': "Error"});
            }
        });
    }
    else
    {
        debug.print("No change, so no need to reorder");
        completeCallback(true, {'result': "Success"});
    }
}

function reorderPlaylistGroupOrderHelper(spotifyData, index, completeCallback)
{
    if(index >= spotifyData.newOrder.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var oldGroupPosition = parseInt(spotifyData.newOrder[index], 10) + 10000;
        var newGroupPosition = index + 1;
        var updateQuery = "UPDATE PlaylistSongOrder SET groupPosition = " + newGroupPosition + " WHERE playlistId = '" + spotifyData.playlist + "' AND groupPosition = " + oldGroupPosition + ";";
        
        debug.print(updateQuery);
        
        con.query(updateQuery, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error accessing table PlaylistSongOrder for reorderPlaylistGroupOrderHelper");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                reorderPlaylistGroupOrderHelper(spotifyData, index + 1, completeCallback)
            }
        });
    }
}

function bumpPlaylistGroupOrder(spotifyData, completeCallback)
{
    var groupPositionQuery = "SELECT MAX(groupPosition) FROM PlaylistSongOrder WHERE playlistId = '" + spotifyData.playlist + "'";
    
    debug.print(groupPositionQuery);
    
    con.query(groupPositionQuery, function (error, groupPositionResults, fields)
    {
        if (error)
        {
            debug.print("error accessing table PlaylistSongOrder for bumpPlaylistGroupOrder");
            debug.print(error);
            
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print(groupPositionResults[0]);
            debug.print(groupPositionResults[0]['MAX(groupPosition)']);
            
            var maxGroupPosition = 1;
            
            if(groupPositionResults[0]['MAX(groupPosition)'] != null)
            {
                maxGroupPosition = groupPositionResults[0]['MAX(groupPosition)'];
            }
            
            bumpPlaylistGroupOrderHelper(spotifyData, maxGroupPosition, completeCallback);
        }
    });
}

function bumpPlaylistGroupOrderHelper(spotifyData, groupPosition, completeCallback)
{
    if(groupPosition <= 0)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var newGroupPosition = groupPosition + 10000;
        var updateQuery = "UPDATE PlaylistSongOrder SET groupPosition = " + newGroupPosition + " WHERE playlistId = '" + spotifyData.playlist + "' AND groupPosition = " + groupPosition + ";";
        
        debug.print(updateQuery);
        
        con.query(updateQuery, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error accessing table PlaylistSongOrder for bumpPlaylistGroupOrderHelper");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                bumpPlaylistGroupOrderHelper(spotifyData, groupPosition - 1, completeCallback)
            }
        });
    }
}

function getOrderedSongListForUser(access_token, spotifyData, completeCallback)
{
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            var discordId = discordIdResults.discordId;
            
            getOrderedSongListFromDiscord(access_token, discordId, spotifyData, completeCallback);
        }
        else
        {
            debug.print("Couldn't find discord Id for user " + spotifyData.user_id);
            completeCallback(false, 
                {'result': "Error",
                 'error': "Couldn't find discordId from user spotifyId:" + spotifyData.user_id
            });
        }
    });
}

function getOrderedSongListFromDiscordNoSpotify(access_token, discordId, spotifyData, completeCallback)
{
    //debug.print("getOrderedSongListFromDiscordNoSpotify");
    
    var songOrderSql = "SELECT * FROM SpotifyArtistSongOrder WHERE discordId = '" + discordId + "'";
    //debug.print(songOrderSql);
    
    con.query(songOrderSql, function (error, songOrderResults, fields)
    {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistSongOrder");
            debug.print(error);
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
        else
        {
            completeCallback(true, {'data':songOrderResults});
        }
    });
}

function getOrderedSongListFromDiscord(access_token, discordId, spotifyData, completeCallback)
{
    //debug.print("getOrderedSongListFromDiscord");
    
    var songOrderSql = "SELECT * FROM SpotifyArtistSongOrder WHERE discordId = '" + discordId + "'";
    //debug.print(songOrderSql);
    
    con.query(songOrderSql, function (error, songOrderResults, fields)
    {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistSongOrder");
            debug.print(error);
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
        else
        {
            // Get all artists linked to this discord Id
            var artistSql = "SELECT spotifyId FROM SpotifyArtistLinks WHERE discordId = '" + discordId + "'";
            //debug.print(artistSql);
    
            con.query(artistSql, function (error, artistLinkResults, fields)
            {
                if (error)
                {
                    debug.print("error accessing table SpotifyArtistLinks");
                    debug.print(error);
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    if(artistLinkResults.length > 0)
                    {
                        var songList = [];
                        
                        buildSongList(access_token, spotifyData, 0, songList, artistLinkResults, function(success, songListResults)
                        {
                            if(success)
                            {
                                var artistList = [];
                                
                                artistLinkResults.forEach(artistLink =>
                                {
                                    artistList.push(artistLink.spotifyId);
                                });
                                
                                spotifyData.artistIds = artistList;
                                
                                spotify.getArtistsInfo(access_token, spotifyData, function(success, artistInfoResults)
                                {
                                    if(success)
                                    {
                                        var artistNames = [];
                                        
                                        artistInfoResults.forEach(artistInfo =>
                                        {
                                            var artistInfoObject =
                                            {
                                                'name': artistInfo.artist_name,
                                                'popularity': artistInfo.popularity,
                                                'genres': artistInfo.genres
                                            };
                                            artistNames.push(artistInfoObject);
                                        });
                                        
                                        var filteredSongOrder = [];
                                        for(var i = 0; i < songOrderResults.length; ++i)
                                        {
                                            var isFound = false;
                                            
                                            for(var j = 0; j < songListResults.data.length; ++j)
                                            {
                                                if(songOrderResults[i].songId == songListResults.data[j].id)
                                                {
                                                    isFound = true;
                                                }
                                            }
                                            
                                            if(isFound)
                                            {
                                                songOrderResults[i].dbIndex = i;
                                                filteredSongOrder.push(songOrderResults[i]);
                                            }
                                        }
                                        
                                        if(filteredSongOrder.length > 0)
                                        {
                                            if(songListResults.data != null && songListResults.data.length > 0)
                                            {
                                                for(var i = 0; i < songListResults.data.length; ++i)
                                                {
                                                    songListResults.data[i].saved = false;
                                                }
                                                    
                                                for(var i = 0; i < filteredSongOrder.length; ++i)
                                                {
                                                    var songOrderPositionIndex = filteredSongOrder.length - i - 1;
                                                    var songListNewPositionIndex = songListResults.data.length - i - 1;
                                                    var songListOldPositionIndex = songListNewPositionIndex;
                                                    
                                                    for(var j = 0; j < songListResults.data.length; ++j)
                                                    {
                                                        if(songListResults.data[j].id == filteredSongOrder[songOrderPositionIndex].songId)
                                                        {
                                                            songListResults.data[j].saved = true;
                                                            songListResults.data[j].dbIndex = filteredSongOrder[songOrderPositionIndex].dbIndex;
                                                            songListOldPositionIndex = j;
                                                        }
                                                    }
                                                    
                                                    if(songListNewPositionIndex != songListOldPositionIndex)
                                                    {
                                                        var swapSong = songListResults.data[songListNewPositionIndex];
                                                        songListResults.data[songListNewPositionIndex] = songListResults.data[songListOldPositionIndex];
                                                        songListResults.data[songListOldPositionIndex] = swapSong;
                                                    }
                                                }
                                                
                                                if(songListResults.data.length > 1)
                                                {
                                                    for(var i = 0; i < songListResults.data.length - 1; ++i)
                                                    {
                                                        for(var j = i + 1; j < songListResults.data.length; ++j)
                                                        {
                                                            if(!songListResults.data[i].saved &&
                                                                !songListResults.data[j].saved &&
                                                                songListResults.data[i].priorityScore < songListResults.data[j].priorityScore)
                                                            {
                                                                var swapSong = songListResults.data[j];
                                                                songListResults.data[j] = songListResults.data[i];
                                                                songListResults.data[i] = swapSong;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        
                                        if(songListResults.data.length > 100)
                                        {
                                            songListResults.data.sort(function(a, b)
                                            {
                                                if("dbIndex" in a && "dbIndex" in b)
                                                {
                                                    return a.dbIndex - b.dbIndex;
                                                }
                                                else if("dbIndex" in a)
                                                {
                                                    return a.dbIndex - 101;
                                                }
                                                else if("dbIndex" in b)
                                                {
                                                    return 101 - b.dbIndex;
                                                }
                                                else
                                                {
                                                    return 0;
                                                }
                                            });
                                        }
                                        
                                        var returnData =
                                        {
                                            'artistList': artistNames,
                                            'songList': songListResults.data
                                        };
                                        
                                        completeCallback(true, {'result': "Success", 'data':returnData});
                                    }
                                    else
                                    {
                                        //debug.print(artistInfoResults);
                                        
                                        completeCallback(false, 
                                            {'result': "Error",
                                             'error': "Error calling spotify.getArtistsInfo"
                                        });
                                    }
                                });
                            }
                            else
                            {
                                //debug.print(songListResults);
                                
                                completeCallback(false, 
                                    {'result': "Error",
                                     'error': "Error calling buildSongList"
                                });
                            }
                        });
                    }
                    else
                    {
                        completeCallback(false, 
                            {'result': "Error",
                             'error': "No artist linked"
                        });
                    }
                }
            });
        }
    });
}

calculateSongPriorityScore = function(song)
{
    const FIRST_WEEK_VALUE = 20;
    const FIRST_TWO_WEEKS_VALUE = 15;
    const FIRST_MONTH_VALUE = 10;
    const FIRST_TWO_MONTHS_VALUE = 5;
    const FIRST_SIX_MONTHS_VALUE = 5;
    const FIRST_YEAR_VALUE = 5;
    
    var releaseDate = new Date(song.releaseDate);
    var currentDate = new Date();
    
    var ageInMilli = currentDate.getTime() - releaseDate.getTime();
    var ageInSeconds = ageInMilli / 1000;
    var ageInMinutes = ageInSeconds / 60;
    var ageInHours = ageInMinutes / 60;
    var ageInDays = ageInHours / 24;
    var ageInWeeks = ageInDays / 7;
    var ageInMonths = ageInWeeks / 4;
    var ageInYears = ageInMonths / 13;
    
    var isFirstWeek = (ageInWeeks < 1);
    var isFirstTwoWeeks = (ageInWeeks < 2);
    var isFirstMonth = (ageInMonths < 1);
    var isFirstTwoMonths = (ageInMonths < 2);
    var isFirstSixMonths = (ageInMonths < 6);
    var isFirstYear = (ageInYears < 1);
    
    var priorityScore = 
        (isFirstWeek ? FIRST_WEEK_VALUE : 0) +
        (isFirstTwoWeeks ? FIRST_TWO_WEEKS_VALUE : 0) +
        (isFirstMonth ? FIRST_MONTH_VALUE : 0) +
        (isFirstTwoMonths ? FIRST_TWO_MONTHS_VALUE : 0) +
        (isFirstSixMonths ? FIRST_SIX_MONTHS_VALUE : 0) +
        (isFirstYear ? FIRST_YEAR_VALUE : 0) +
        song.popularity;
    
    return priorityScore;
}

fillSongListWithData = function(access_token, index, songList, completeCallback)
{
    if(songList.length == 0)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        if(index >= songList.length)
        {
            for(var i = 0; i < songList.length; ++i)
            {
                for(var j = i + 1; j < songList.length; ++j)
                {
                    if(songList[i].isrc != null && songList[j].isrc != null && 
                        songList[i].isrc == songList[j].isrc)
                    {
                        var iDate = new Date(songList[i].releaseDate);
                        var jDate = new Date(songList[j].releaseDate);
                        
                        if(iDate.getTime() >= jDate.getTime())
                        {
                            //i is newer so keep i
                            songList[j].deleteMe = true;
                            
                            if(songList[i].popularity < songList[j].popularity)
                            {
                                songList[i].popularity = songList[j].popularity;
                            }
                        }
                        else
                        {
                            //j is newer so keep j
                            songList[i].deleteMe = true;
                            
                            if(songList[j].popularity < songList[i].popularity)
                            {
                                songList[j].popularity = songList[i].popularity;
                            }
                        }
                    }
                }
            }
            
            var newSongList = [];
            
            songList.forEach(song =>
            {
                if(song.deleteMe == null)
                {
                    newSongList.push(song);
                }
            });
            
            newSongList.forEach(song =>
            {
                song.priorityScore = calculateSongPriorityScore(song);
            });
            
            newSongList.sort(function(a, b){return b.priorityScore - a.priorityScore});
            
            completeCallback(true, {'result': "Success", 'data':newSongList});
        }
        else
        {
            var tracks = [];
            
            for(var i = 0; (i < 50) && (index + i < songList.length); ++i)
            {
                tracks.push(songList[index + i].id);
            }
            
            var spotifyData = {
                songs:tracks
            };
                
            spotify.getSongInfo(access_token, spotifyData, function(success, results)
            {
                if(success)
                {
                    for(var i = 0; (i < 50) && (index + i < songList.length); ++i)
                    {
                        songList[index + i].popularity = results.tracks[i].popularity;
                        songList[index + i].isrc = results.tracks[i].isrc;
                        songList[index + i].imgURL = results.tracks[i].imgURL;
                    }
                    
                    fillSongListWithData(access_token, index + 50, songList, completeCallback);
                }
                else
                {
                    debug.print(results);
                    
                    completeCallback(false, 
                    {'result': "Error",
                     'error': "getSongInfo error"
                });
                }
            });
        }
    }
}

buildSongList = function(access_token, spotifyData, index, songList, artistSearchResults, completeCallback)
{
    if(index >= artistSearchResults.length)
    {
        // songList has been created for all artists now fill in song list with 
        
        fillSongListWithData(access_token, 0, songList, completeCallback);
    }
    else
    {
        var artistSpotifyId = artistSearchResults[index].spotifyId;
        
        spotifyData.artistId = artistSpotifyId;
        
        spotify.getSongsForArtist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                results.data.forEach(song =>
                {
                    songList.push(song);
                });
                
                buildSongList(access_token, spotifyData, index+1, songList, artistSearchResults, completeCallback);
            }
            else
            {
                completeCallback(false, 
                {'result': "Error",
                 'error': "getSongsForArtist error"
            });
            }
        });
    }
}

getLatestTimestampsFromPoints = function(spotifyData, completeCallback)
{
    debug.print("getLatestTimestampsFromPoints");
    var query = "SELECT * FROM Points WHERE spotifyId = '" + spotifyData.user_id + "'";
    
    con.query(query, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table Points");
            debug.print(error);
            
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var returnData = [];
            
            results.forEach(result =>
            {
                returnData.push({'playlistId':result.playlistId, 'points':result.points, 'timestamp':result.timestamp}); 
            });
            
            completeCallback(true, {'result': "Success", 'data':returnData});
        }
    });
}

getLatestTimestampsFromStreams = function(index, playlistList, timestampList , spotifyData, completeCallback)
{
    if(index >= playlistList.length)
    {
        completeCallback(true, {'result': "Success", 'data':timestampList });
    }
    else
    {
        var query = "SELECT * FROM Streams WHERE timestamp = (SELECT MAX(timestamp) FROM Streams WHERE userId = '" + spotifyData.user_id + "' AND playlistId = '" + playlistList[index].playlistId + "')";
        
        con.query(query, function (error, results, fields)
        {
            if (error)
            {
                debug.print("error accessing table Points");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                results.forEach(result =>
                {
                    timestampList .push({'playlistId':result.playlistId, 'timestamp':result.timestamp}); 
                });
                
                getLatestTimestampsFromStreams(index+1, playlistList, timestampList, spotifyData, completeCallback);
            }
        });
    }
}

app.get('/' + ENVIRONMENT + '/test1/', function(req,res)
{
    debug.print("/test1 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'discordId': "",
        'spotifyIds': [],
        'streamsByUser': []
    };
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        updateMasterlist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'Error Updating Master List'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/test2/', function(req,res)
{
    debug.print("test2 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'discordId': "",
        'spotifyIds': [],
        'streamsByUser': []
    };
    
    debug.print("spotifyId:" + req.query.spotify_id);
    
    if(authenticate(spotifyData))
    {
        generateMasterArtistListReport(function(success, results)
        {
            if(success)
            {
                debug.print("Artist List Results");
                debug.print(results);
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'Error Updating Master List'});
            }
        });
        
        /*createMasterArtistListTable(function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'Error Updating Master List'});
            }
        });*/
        
        //res.send({'result': "Success", 'message':'Success'});
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/test3/', function(req,res)
{
    debug.print("test3 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var newHoursByPlaylist = [];
    var hoursByPlaylist = [];
    var latestTimestampByPlaylist = [];
    
    for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
    {
       newHoursByPlaylist.push(-1);
       hoursByPlaylist.push(-1);
       latestTimestampByPlaylist.push(new Date(0));
    }
    
    var recent = {
        'songs': -1,
        'hours': -1,
        'nonNasHours': -1,
        'totalNasHours': -1,
        'invalidHours': -1,
        'alreadyCountedNasHours': -1,
        'newNasHours': -1,
        'newHoursByPlaylist': newHoursByPlaylist,
        'latestTimestampByPlaylist': latestTimestampByPlaylist,
        'nonNasPlaylistIds': [],
        'nonNasPlaylistNames': []
    };
    
    var total = {
        'hours': 0,
        'hoursByPlaylist': hoursByPlaylist,
        'bonusPoints': 0,
        'numAccounts': 0
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'recent': recent,
        'total': total,
        'discordId': "",
        'spotifyIds': []
    };
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        var ctDiscordId = '771573873560387584';
        
        discordGuild.members.fetch(ctDiscordId)
    	.then(member => {
    		member.fetch(true)
    		.then(member => {
    		    debug.print("found user");
    		    debug.print(member.user.username);
    		    member.user.send("Hello Coastal Town!");
    		})
    		.catch(error => {
        	    debug.print("Couldn't fetch discord memeber:" + ctDiscordId);
        	    debug.print(error);
    		});
    	})
    	.catch(error => {
    	    // Couldn't find member
    	    debug.print("Couldn't find discord memeber:" + ctDiscordId);
    	    debug.print(error);
    	});
    	
    	res.send({'result': "Success", 'message':'Success'});
        
        //Test playlist '6sC6yBVs10KegvRs53w9N4'
        // https://open.spotify.com/playlist/6sC6yBVs10KegvRs53w9N4
        
        //spotifyData.playlistId = '0VqwRBeuRYOWLtufrmHGPe'; // what playlist?
        //spotifyData.playlistId = '6sC6yBVs10KegvRs53w9N4'; // Test Gen Playlist
        /*spotifyData.playlistId = '6vNqW0UkfWOCTxG5c4rtED'; // Dgatatea test Playlist
        
        spotify.getPlaylistInfo(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print(results.results.name);
                debug.print(results.results.snapshotId);
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'getPlaylistInfo error'});
            }
        });*/
        
        /*spotifyData.playlistId = '6vNqW0UkfWOCTxG5c4rtED'; // Dgatatea test Playlist
        
        removeNASSongsFromPlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                // Print out updates to discord
                
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/test4/', function(req,res)
{
    debug.print("test4 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var newHoursByPlaylist = [];
    var hoursByPlaylist = [];
    var latestTimestampByPlaylist = [];
    
    for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
    {
       newHoursByPlaylist.push(-1);
       hoursByPlaylist.push(-1);
       latestTimestampByPlaylist.push(new Date(0));
    }
    
    var recent = {
        'songs': -1,
        'hours': -1,
        'nonNasHours': -1,
        'totalNasHours': -1,
        'invalidHours': -1,
        'alreadyCountedNasHours': -1,
        'newNasHours': -1,
        'newHoursByPlaylist': newHoursByPlaylist,
        'latestTimestampByPlaylist': latestTimestampByPlaylist,
        'nonNasPlaylistIds': [],
        'nonNasPlaylistNames': []
    };
    
    var total = {
        'hours': 0,
        'hoursByPlaylist': hoursByPlaylist,
        'bonusPoints': 0,
        'numAccounts': 0
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'recent': recent,
        'total': total,
        'discordId': "",
        'spotifyIds': []
    };
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        //Test playlist '6sC6yBVs10KegvRs53w9N4'
        // https://open.spotify.com/playlist/6sC6yBVs10KegvRs53w9N4
        
        //spotifyData.playlistId = '0VqwRBeuRYOWLtufrmHGPe'; // what playlist?
        //spotifyData.playlistId = '6sC6yBVs10KegvRs53w9N4'; // Test Gen Playlist
        /*spotifyData.playlistId = '6vNqW0UkfWOCTxG5c4rtED'; // Dgatatea test Playlist
        
        spotify.clearPlaylistSongs(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'getPlaylistInfo error'});
            }
        });*/
        
        /*backupAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'backupAllNASPlaylists error'});
            }
        });*/
        
        /*ClearPlaylist("101", function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'Error'});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

//repopulate_mentors_table

app.get('/' + ENVIRONMENT + '/test5/', function(req,res)
{
    debug.print("test5 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        /*var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[0];
        
        spotifyData.playlistId = playlist.officialId;
        spotifyData.playlistTag = playlist.tag;
        
        getNASSongsFromPlaylist(access_token, spotifyData, function(success, nasArtistResults)
        {
            if(success)
            {
                var nonNasSongs = nasArtistResults.nonNas;
                
                var songList = [];
                
                if(nonNasSongs != null)
                {
                    nonNasSongs.forEach(song =>
                    {
                        debug.print(song);
                    });
                }
                
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error"});
            }
        });*/
        
        /*PrintNonNASReport(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
            }
        });*/
        
        /*cloneAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
            }
        });*/
        
        /*backupAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'backupAllNASPlaylists error'});
            }
        });*/
        
        /*generateAllNASStagingPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
            }
        });*/
        
        /*restoreAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'restoreAllNASPlaylists error'});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/generate_staging_playlist/', function(req,res)
{
    debug.print("generate_staging_playlist called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box,
      playlist_tag: req.query.playlist
    };
    
    var access_token = req.query.access_token;
    
    debug.print(spotifyData);
    
    if(resetAuthenticate(spotifyData) && (spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.firstUserId || spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.secondUserId))
    {
        generateNASStagingPlaylist(access_token, spotifyData.playlist_tag, spotifyData, function(success, results)
        {
            if(success)
            {
                var playlist = null;
    
                SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
                {
                    if(spotifyData.playlist_tag == editPlaylist.tag)
                    {
                        playlist = editPlaylist;
                    }
                });
                
                var message = "Couldn't find playlist " + spotifyData.playlist_tag;
                
                var stagePlaylistId = null;
                
                if(spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.firstUserId)
                {
                    stagePlaylistId = playlist.stage1Id;
                }
                else if(spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.secondUserId)
                {
                    stagePlaylistId = playlist.stage2Id;
                }
                else
                {
                    message += " couldn't find stage playlist for user:" + spotifyData.user_id;
                }
                
                if(playlist != null && stagePlaylistId != null)
                {
                    message = "Staging playlist generated for " + playlist.name + ": https://open.spotify.com/playlist/" + stagePlaylistId;
                }
                    
                debug.print(message);
                force_send_to_reset_admin_channel(message);
                
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'generateNASStagingPlaylist error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function generateNASStagingPlaylist(access_token, tag, spotifyData, completeCallback)
{
    debug.print("generateNASStagingPlaylist: " + tag);
    
    generateNASPlaylist(access_token, tag, spotifyData, function(success, playlistResults)
    {
        if(success)
        {
            updateStagingPlaylist(access_token, spotifyData, playlistResults.playlist, function(success, updateStagingResults)
            {
                if(success)
                {
                    completeCallback(true, {});
                }
                else
                {
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'getNASSongsFromPlaylist error'
                    });
                }
            });
        }
        else
        {
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'getNASSongsFromPlaylist error'
            });
        }
    });
}

function PrintSingleNonNASReport(access_token, tag, spotifyData, completeCallback)
{
    var messages = [];
    generateSingleNonNASReport(access_token, tag, spotifyData, messages, function(success, results)
    {
        if(success)
        {
            var messages = results.messages;
            
            messages.forEach(message =>
            {
                debug.print(message);
                force_send_to_reset_admin_channel(message);
            });
            
            completeCallback(true, {});
        }
        else
        {
            completeCallback(false, {});
        }
    });
}

function PrintNonNASReport(access_token, spotifyData, completeCallback)
{
    generateNonNASReport(access_token, spotifyData, function(success, results)
    {
        if(success)
        {
            var messages = results.messages;
            
            messages.forEach(message =>
            {
                debug.print(message);
                force_send_to_reset_admin_channel(message);
            });
            
            completeCallback(true, {});
        }
        else
        {
            completeCallback(false, {});
        }
    });
}

createMasterSongListTable = function(completeCallback)
{
    debug.print("createMasterSongListTable called");
    
    // Code to create the MasterSongList table
    con.query('SELECT * FROM MasterSongList', function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE MasterSongList (spotifyId VARCHAR(255) NOT NULL, PRIMARY KEY (spotifyId));";
                
                debug.print(sql);
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table MasterSongList");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table MasterSongList");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table MasterSongList");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("MasterSongList Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createMasterArtistListTable = function(completeCallback)
{
    debug.print("createMasterArtistListTable called");
    
    // Code to create the MasterArtistList table
    con.query('SELECT * FROM MasterArtistList', function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE MasterArtistList (spotifyId VARCHAR(255) NOT NULL, PRIMARY KEY (spotifyId));";
                
                debug.print(sql);
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table MasterArtistList");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table MasterArtistList");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table MasterArtistList");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("MasterArtistList Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

function generateMasterArtistListReport(completeCallback)
{
    var sqlQuery = "SELECT * FROM MasterArtistList";
    
    debug.print(sqlQuery);
    
    con.query(sqlQuery, function (error, artistListResults, fields)
    {
        if (error)
        {
            debug.print("error selecting from table MasterArtistList");
            debug.print(error);
            
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'error selecting from table MasterArtistList'
            });
        }
        else
        {
            debug.print("Success querying MasterArtistList");
            
            var report = "";
            
            artistListResults.forEach(artist =>
            {
                report += "Artist:https://open.spotify.com/artist/" + artist.spotifyId + "\n";
            });
            
            completeCallback(true, {'report':report});
        }
    });
}

function PrintArtistMasterList(completeCallback)
{
    var selectSql = "SELECT * FROM MasterArtistList";
    
    debug.print(selectSql);
    
    con.query(selectSql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error selecting from table MasterArtistList");
            debug.print(error);
            
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'error selecting from table MasterArtistList'
            });
        }
        else
        {
            debug.print("MasterArtistList");
            results.forEach(artist =>
            {
                debug.print(artist);
            });
            
            completeCallback(true, {});
        }
    });
}

function PrintSongMasterList(completeCallback)
{
    var selectSql = "SELECT * FROM MasterSongList";
    
    debug.print(selectSql);
    
    con.query(selectSql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error selecting from table MasterSongList");
            debug.print(error);
            
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'error selecting from table MasterSongList'
            });
        }
        else
        {
            debug.print("MasterSongList");
            results.forEach(song =>
            {
                debug.print(song);
            });
            
            completeCallback(true, {});
        }
    });
}

function updateMasterlist(access_token, spotifyData, completeCallback)
{
    debug.print("updateMasterlist");
    
    var deleteSql = "DELETE FROM MasterArtistList";
    
    debug.print(deleteSql);
    
    con.query(deleteSql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error deleting from table MasterArtistList");
            debug.print(error);
            
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'error deleting from table MasterArtistList'
            });
        }
        else
        {
            debug.print("Delete Success for MasterArtistList");
            
            var deleteSql = "DELETE FROM MasterSongList";
            
            debug.print(deleteSql);
            
            con.query(deleteSql, function (error, results, fields)
            {
                if (error)
                {
                    debug.print("error deleting from table MasterSongList");
                    debug.print(error);
                    
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'error deleting from table MasterSongList'
                    });
                }
                else
                {
                    debug.print("Delete Success for MasterSongList");
                    
                    var artists = [];
                    var songs = [];
                    
                    updateMasterlistHelper(access_token, 0, spotifyData, artists, songs, function(success, newMasterlist)
                    {
                        if(success)
                        {
                            var songInsertSql = "INSERT IGNORE INTO MasterSongList (spotifyId) VALUES ?";
                            var songValues = [];
                            
                            var noLikeSongs = nas.getNoLikeSongs();
                            
                            songs.forEach(song =>
                            {
                                var isFound = false;
                                
                                noLikeSongs.forEach(noLikeSong =>
                                {
                                    if(song == noLikeSong)
                                    {
                                        isFound = true;
                                    }
                                });
                                
                                if(!isFound)
                                {
                                    var array = [song];
                                    songValues.push(array);
                                }
                            });
                            
                            debug.print("songValues.length:" + songValues.length);
                            
                            con.query(songInsertSql, [songValues], function (error, songInsertResults, fields)
                            {
                                if(error)
                                {
                                    debug.print("error inserting into MasterSongList table");
                                    debug.print(error);
                                    completeCallback(false, {});
                                }
                                else
                                {
                                    debug.print("Successfully inserted " + songValues.length + " entries into MasterSongList table");
                                    
                                    var artistInsertSql = "INSERT IGNORE INTO MasterArtistList (spotifyId) VALUES ?";
                                    var artistValues = [];
                                    
                                    var noFollowArtists = nas.getNoFollowArtists();
                                    
                                    artists.forEach(artist =>
                                    {
                                        var isFound = false;
                                        
                                        noFollowArtists.forEach(noFollowArtist =>
                                        {
                                            if(artist == noFollowArtist)
                                            {
                                                isFound = true;
                                            }
                                        });
                                        
                                        if(!isFound)
                                        {
                                            var array = [artist];
                                            artistValues.push(array);
                                        }
                                    });
                                    
                                    con.query(artistInsertSql, [artistValues], function (error, artistInsertResults, fields)
                                    {
                                        if(error)
                                        {
                                            debug.print("error inserting into MasterArtistList table");
                                            debug.print(error);
                                            completeCallback(false, {});
                                        }
                                        else
                                        {
                                            debug.print("Successfully inserted " + artistValues.length + " entries into MasterArtistList table");
                                            
                                            var masterListReport = "***----------------- Master List Updated -----------------***\nTotal NAS Artists:" + artistValues.length + "\nTotal NAS Songs:" + songValues.length + "\n";
                                            
                                            force_send_to_reset_admin_channel(masterListReport);
                                            
                                            completeCallback(true, newMasterlist);
                                        }
                                    });
                                }
                            });
                        }
                        else
                        {
                            debug.print("error calling updateMasterlistHelper");
                            completeCallback(false, {});
                        }
                    });
                }
            });
        }
    });
}

function updateMasterlistHelper(access_token, index, spotifyData, artists, songs, completeCallback)
{
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {'artists':artists, 'songs':songs});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        
        spotifyData.playlistId = playlist.officialId;
        spotifyData.playlistTag = playlist.tag;
        
        getNASSongsFromPlaylist(access_token, spotifyData, function(success, nasArtistResults)
        {
            if(success)
            {
                var nasSongs = nasArtistResults.nas;
                var nasArtists = nasArtistResults.nasArtists;
                
                nasSongs.forEach(song =>
                {
                    // Filter songs here
                    if(!songs.includes(song.id))
                    {
                        songs.push(song.id);
                    }
                });
                
                nasArtists.forEach(artist =>
                {
                    // Filter artists here
                    if(!artists.includes(artist))
                    {
                        artists.push(artist);
                    }
                });
                
                updateMasterlistHelper(access_token, index + 1, spotifyData, artists, songs, completeCallback);
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'updateMasterlistHelper error'
                });
            }
        });
    }
}

function generateNonNASReport(access_token, spotifyData, completeCallback)
{
    debug.print("generateNonNASReport");
    
    var messages = [];
    generateNonNASReportHelper(access_token, 0, spotifyData, messages, completeCallback);
}

function generateNonNASReportHelper(access_token, index, spotifyData, messages, completeCallback)
{
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        messages.push("***----- Report Complete -----***\n");
        completeCallback(true, {'messages':messages});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        
        spotifyData.playlistId = playlist.officialId;
        spotifyData.playlistTag = playlist.tag;
        
        getNASSongsFromPlaylist(access_token, spotifyData, function(success, nasArtistResults)
        {
            if(success)
            {
                var nonNasSongs = nasArtistResults.nonNas;
                
                var songList = [];
                
                if(nonNasSongs != null)
                {
                    nonNasSongs.forEach(song =>
                    {
                        songList.push(song.id);
                    });
                }
                
                if(songList.length > 0)
                {
                    spotifyData.songs = songList;
                    
                    spotify.getSongInfo(access_token, spotifyData, (success, songInfoResult) => 
                    {
                    	if(success)
                    	{
                    	    var message = "***----- " + playlist.name + " " + nonNasSongs.length + " Non-NAS Songs -----***\n";
                    	    var num = 0;
                    	    for(var i = 0; i < songInfoResult.tracks.length; ++i)
                    	    {
                    	        ++num;
                    	        var position = nonNasSongs[i].index + 1;
                    	        message += "[" + position + "] " + songInfoResult.tracks[i].trackName + " - " + songInfoResult.tracks[i].artistName + " (" + songInfoResult.tracks[i].trackId + ")\n";
                    	        
                    	        if(num >= 10)
                    	        {
                    	            messages.push(message);
                    	            message = "";
                    	            num = 0;
                    	        }
                    	    }
                    	    
                    	    if(message != "")
                    	    {
                    	        messages.push(message);
                    	    }
                    
                            generateNonNASReportHelper(access_token, index + 1, spotifyData, messages, completeCallback);
                    	}
                    	else
                    	{
                    	    debug.print("here!!@#$");
                            completeCallback(false, {'result': "Error"});
                    	}
                    });
                }
                else
                {
                    var message = "***----- " + playlist.name + " " + nonNasSongs.length + " Non-NAS Songs -----***\n";
                    messages.push(message);
                    generateNonNASReportHelper(access_token, index + 1, spotifyData, messages, completeCallback);
                }
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'getNASSongsFromPlaylist error'
                });
            }
        });
    }
}

function generateSingleNonNASReport(access_token, tag, spotifyData, messages, completeCallback)
{
    var playlist = null;
    
    SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
    {
        if(tag == editPlaylist.tag)
        {
            playlist = editPlaylist;
        }
    });
    
    if(playlist != null)
    {
        spotifyData.playlistId = playlist.officialId;
        spotifyData.playlistTag = playlist.tag;
        
        getNASSongsFromPlaylist(access_token, spotifyData, function(success, nasArtistResults)
        {
            if(success)
            {
                var nonNasSongs = nasArtistResults.nonNas;
                
                debug.print("Number of non nas songs:" + nonNasSongs.length);
                
                var songList = [];
                
                if(nonNasSongs != null)
                {
                    nonNasSongs.forEach(song =>
                    {
                        songList.push(song.id);
                    });
                }
                
                spotifyData.songs = songList;
                
                spotify.getSongInfo(access_token, spotifyData, (success, songInfoResult) => 
                {
                	if(success)
                	{
                	    debug.print("songInfoResult.tracks.length:" + songInfoResult.tracks.length);
                	    
                	    var message = "***----- " + playlist.name + " " + nonNasSongs.length + " Non-NAS Songs -----***\n";
                	    var num = 0;
                	    for(var i = 0; i < songInfoResult.tracks.length; ++i)
                	    {
                	        ++num;
                	        message += "[" + nonNasSongs[i].index + "] " + songInfoResult.tracks[i].trackName + " - " + songInfoResult.tracks[i].artistName + " (" + songInfoResult.tracks[i].trackId + ")\n";
                	        
                	        if(num >= 10)
                	        {
                	            messages.push(message);
                	            message = "";
                	            num = 0;
                	        }
                	    }
                	    
                	    if(message != "")
                	    {
                	        messages.push(message);
                	    }
                
                        messages.push("***----- Report Complete -----***\n");
                        completeCallback(true, {'messages':messages});
                	}
                	else
                	{
                	    debug.print("here!!@#$");
                        completeCallback(false, {'result': "Error"});
                	}
                });
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'getNASSongsFromPlaylist error'
                });
            }
        });
    }
    else
    {
        completeCallback(false, 
        {
            'result': "Error",
            'message': 'invalid playlist tag'
        });
    }
}

function generateAllNASStagingPlaylists(access_token, spotifyData, completeCallback)
{
    debug.print("generateAllNASStagingPlaylists");
    generateNASStagingPlaylistsHelper(access_token, 0, spotifyData, completeCallback);
}

function generateNASStagingPlaylistsHelper(access_token, index, spotifyData, completeCallback)
{
    debug.print("generateNASStagingPlaylistsHelper");
    
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        
        generateNASPlaylist(access_token, playlist.tag, spotifyData, function(success, playlistResults)
        {
            if(success)
            {
                updateStagingPlaylist(access_token, spotifyData, playlistResults.playlist, function(success, updateStagingResults)
                {
                    if(success)
                    {
                        generateNASStagingPlaylistsHelper(access_token, index + 1, spotifyData, completeCallback);
                    }
                    else
                    {
                        completeCallback(false, 
                        {
                            'result': "Error",
                            'message': 'getNASSongsFromPlaylist error'
                        });
                    }
                });
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'getNASSongsFromPlaylist error'
                });
            }
        });
    }
}

function generateNASPlaylist(access_token, tag, spotifyData, completeCallback)
{
    debug.print("generateNASPlaylist:" + tag);
    
    //1. Generate New Playlist order
    //2. Get NonNas Songs
    //3. Get Spacer Songs
    //4. Get Link Artist Songs
    //5. Shuffle NonNas Songs, Spacer Songs and Playlist together
    
    var playlist = null;
    
    SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
    {
        if(tag == editPlaylist.tag)
        {
            playlist = editPlaylist;
        }
    });
    
    if(playlist == null)
    {
        debug.print("Couldn't find tag in editPlaylists"); 
        completeCallback(false, {});
    }
    else
    {
        spotifyData.playlistId = playlist.officialId;
        spotifyData.playlistTag = tag;
                
        //1. Generate new playlist order
        generateNewNASPlaylist(access_token, tag, spotifyData, function(success, playlistResults)
        {
            if(success)
            {
                debug.print("generateNewNASPlaylist Success");
                
                var generatedPlaylist = playlistResults.playlist;
                
                //2. Get non NAS songs from playlist
                getNASSongsFromPlaylist(access_token, spotifyData, function(success, nasArtistResults)
                {
                    if(success)
                    {
                        var nasSongs = nasArtistResults.nas;
                        var nonNasSongs = nasArtistResults.nonNas;
                        var snapshotId = nasArtistResults.snapshotId;
                        
                        debug.print("Non NAS Songs");
                        if(nonNasSongs != null)
                        {
                            nonNasSongs.forEach(song =>
                            {
                                debug.print(song);
                            });
                        }
                        
                        //3. Get Spacer Songs
                        var spacerSongs = nas.getSpacerSongs(tag);
                        
                        //4. Get Link Artist Songs
                        var linkSongs = nas.getLinkSongs(tag);
                        
                        //5. Shuffle NonNas Songs, Spacer Songs and Playlist together
                        var shuffledPlaylist = shufflePlaylistsTogether(generatedPlaylist, nonNasSongs, spacerSongs, linkSongs);
                        
                        //6. Remove Dupes?
                        
                        debug.print("Finished Shuffle");
                        debug.print(shuffledPlaylist.length);
                        
                        var finalPlaylist = [];
                        
                        for(var i = 0; i < shuffledPlaylist.length; ++i)
                        {
                            if(shuffledPlaylist[i] != null)
                            {
                                for(var j = i + 1; j < shuffledPlaylist.length; ++j)
                                {
                                    if(shuffledPlaylist[j] != null && shuffledPlaylist[i].id == shuffledPlaylist[j].id)
                                    {
                                        shuffledPlaylist[j] = null;
                                    }
                                }
                                
                                finalPlaylist.push(shuffledPlaylist[i]);
                            }
                        }
                        
                        debug.print("Finished Remove Duplicates");
                        debug.print(finalPlaylist.length);
                        
                        completeCallback(true, {'playlist':finalPlaylist, 'groups':playlistResults.groups});
                    }
                    else
                    {
                        completeCallback(false, 
                        {
                            'result': "Error",
                            'message': 'getNASSongsFromPlaylist error'
                        });
                    }
                });
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'generateNewNASPlaylist error'
                });
            }
        });
    }
}

function updateStagingPlaylist(access_token, spotifyData, shuffledPlaylist, completeCallback)
{
    var playlist = null;
    
    SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
    {
        if(spotifyData.playlistTag == editPlaylist.tag)
        {
            playlist = editPlaylist;
        }
    });
    
    var isValidUser = true;
    
    if(spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.firstUserId)
    {
        spotifyData.playlistId = playlist.stage1Id;
    }
    else if(spotifyData.user_id == SPOTIFY_NAS_STAGING_USERS.secondUserId)
    {
        spotifyData.playlistId = playlist.stage2Id;
    }
    else
    {
        isValidUser = false;
    }
    
    if(isValidUser)
    {
        spotify.clearPlaylistSongs(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                debug.print("Staging Playlist cleared for " + spotifyData.playlistTag);
                spotify.fillPlaylist(access_token, spotifyData, shuffledPlaylist, function(success, results)
                {
                    if(success)
                    {
                        debug.print("Staging Playlist created for " + spotifyData.playlistTag);
                        completeCallback(true, {});
                    }
                    else
                    {
                        completeCallback(false, {'result': "Error"});
                    }
                });
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
    else
    {
        completeCallback(false, {'result': "Error"});
    }
}

function shufflePlaylistsTogether(generatedPlaylist, nonNasSongs, spacerSongs, linkSongs)
{
    var spacerIndex = 0;
    var nonNasIndex = 0;
    var linkIndex = 0;
    var generatedIndex = 0;
    
    isSpacerComplete = (spacerSongs == null) || (spacerSongs.length == 0);
    isNonNasComplete = (nonNasSongs == null) || (nonNasSongs.length == 0);
    isLinkComplete = (linkSongs == null) || (linkSongs.length == 0);
    isGeneratedComplete = (generatedPlaylist == null) || (generatedPlaylist.length == 0);
    
    var skip = false;
    
    var shuffledPlaylist = [];
    
    while(!isGeneratedComplete)
    {
        skip = false;
        
        if(!isSpacerComplete && (spacerSongs[spacerIndex].index - 1) <= shuffledPlaylist.length)
        {
            debug.print("Adding Spacer[" + spacerIndex + "]:" + spacerSongs[spacerIndex].id);
            shuffledPlaylist.push({'type':'spacer', 'id':spacerSongs[spacerIndex].id});
            spacerIndex++;
            skip = true;
        }
        
        if(!skip && !isNonNasComplete && nonNasSongs[nonNasIndex].index <= shuffledPlaylist.length)
        {
            debug.print("Adding NonNas[" + nonNasIndex + "]:" + nonNasSongs[nonNasIndex].id);
            shuffledPlaylist.push({'type':'nonNas', 'id':nonNasSongs[nonNasIndex].id});
            nonNasIndex++;
            skip = true;
        }
        
        if(!skip && !isLinkComplete && (linkSongs[linkIndex].index - 1) <= shuffledPlaylist.length)
        {
            debug.print("Adding Link[" + linkIndex + "]:" + linkSongs[linkIndex].id);
            shuffledPlaylist.push({'type':'link', 'id':linkSongs[linkIndex].id});
            linkIndex++;
            skip = true;
        }
        
        if(!skip && !isGeneratedComplete)
        {
            if(generatedPlaylist[generatedIndex].id == null || generatedPlaylist[generatedIndex].id == '')
            {
                generatedIndex++;
            }
            else
            {
                debug.print("Adding " + generatedPlaylist[generatedIndex].groupType + " [" + generatedIndex + "]:" + generatedPlaylist[generatedIndex].id);
                shuffledPlaylist.push({'type':generatedPlaylist[generatedIndex].groupType, 'id':generatedPlaylist[generatedIndex].id});
                generatedIndex++;
            }
        }
        
        if(!isGeneratedComplete && generatedIndex >= generatedPlaylist.length)
        {
            isGeneratedComplete = true;
        }
        
        if(!isNonNasComplete && nonNasIndex >= nonNasSongs.length)
        {
            isNonNasComplete = true;
        }
        
        if(!isSpacerComplete && spacerIndex >= spacerSongs.length)
        {
            isSpacerComplete = true;
        }
        
        if(!isLinkComplete && linkIndex >= linkSongs.length)
        {
            isLinkComplete = true;
        }
    }
    
    // Add any remaining spacer songs
    if(!isSpacerComplete)
    {
        for(;spacerIndex < spacerSongs.length; ++spacerIndex)
        {
            var type = 'spacer';
            
            shuffledPlaylist.forEach(element =>
            {
                if(element.id == spacerSongs[spacerIndex].id)
                {
                    type = 'spacerDuplicate';
                }
            });
            
            debug.print("Adding Spacer[" + spacerIndex + "]:" + spacerSongs[spacerIndex].id);
            shuffledPlaylist.push({'type':type, 'id':spacerSongs[spacerIndex].id});
            spacerIndex++;
        }
    }
    
    // Add any remaining nonNas songs
    if(!isNonNasComplete)
    {
        for(;nonNasIndex < nonNasSongs.length; ++nonNasIndex)
        {
            var type = 'nonNas';
            
            shuffledPlaylist.forEach(element =>
            {
                if(element.id == nonNasSongs[nonNasIndex].id)
                {
                    type = 'nonNasDuplicate';
                }
            });
            
            debug.print("Adding NonNas[" + nonNasIndex + "]:" + nonNasSongs[nonNasIndex].id);
            shuffledPlaylist.push({'type':type, 'id':nonNasSongs[nonNasIndex].id});
            nonNasIndex++;
        }
    }
    
    // Add any remaining link songs
    if(!isLinkComplete)
    {
        for(;linkIndex < linkSongs.length; ++linkIndex)
        {
            var type = 'link';
            
            shuffledPlaylist.forEach(element =>
            {
                if(element.id == linkSongs[linkIndex].id)
                {
                    type = 'linkDuplicate';
                }
            });
            
            debug.print("Adding Link[" + linkIndex + "]:" + linkSongs[linkIndex].id);
            shuffledPlaylist.push({'type':type, 'id':linkSongs[linkIndex].id});
            linkIndex++;
        }
    }
    
    return shuffledPlaylist;
}

function generateNewNASPlaylist(access_token, tag, spotifyData, completeCallback)
{
    debug.print("generateNewNASPlaylist");
    
    var playlistOrderQuery = "SELECT * FROM PlaylistSongOrder WHERE playlistId = '" + tag + "' ORDER BY groupPosition";
    
    debug.print(playlistOrderQuery);
    
    con.query(playlistOrderQuery, function (error, playlistOrderResults, fields)
    {
        if (error)
        {
            debug.print("error accessing table PlaylistSongOrder for generateNewNASPlaylist");
            debug.print(error);
            
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var playlistGroups = [];
            
            for(var i = 0; i < playlistOrderResults.length; ++i)
            {
                if(intToGroupType(playlistOrderResults[i].groupType) == "SingleSong")
                {
                    playlistGroups.push(
                    {
                        'playlistId': playlistOrderResults[i].playlistId,
                        'groupPosition': playlistOrderResults[i].groupPosition,
                        'groupType': playlistOrderResults[i].groupType,
                        'groupTier': playlistOrderResults[i].groupTier,
                        'modGroup': playlistOrderResults[i].modGroup,
                        'songId': playlistOrderResults[i].songId,
                        'songPosition': playlistOrderResults[i].songPosition,
                        'songCount': playlistOrderResults[i].songCount
                    });
                }
                else if(intToGroupType(playlistOrderResults[i].groupType) == "SongGroup")
                {
                    if(playlistOrderResults[i].songCount <= 0)
                    {
                        var startIndex = 0;
                        
                        if(playlistGroups.length > 0)
                        {
                            playlistGroups.forEach(group =>
                            {
                                if(playlistOrderResults[i].groupTier == group.groupTier && playlistOrderResults[i].modGroup == group.modGroup && playlistOrderResults[i].songPosition == group.songPosition)
                                {
                                    startIndex = group.endIndex;
                                }
                            });
                        }
                        
                        // Add the whole group, so startIndex = 0, endIndex = -1
                        playlistGroups.push(
                        {
                            'playlistId': playlistOrderResults[i].playlistId,
                            'groupPosition': playlistOrderResults[i].groupPosition,
                            'groupType': playlistOrderResults[i].groupType,
                            'groupTier': playlistOrderResults[i].groupTier,
                            'modGroup': playlistOrderResults[i].modGroup,
                            'songId': playlistOrderResults[i].songId,
                            'songPosition': playlistOrderResults[i].songPosition,
                            'songCount': playlistOrderResults[i].songCount,
                            'startIndex': startIndex,
                            'endIndex': -1
                        });
                    }
                    else
                    {
                        // Find the startIndex
                        var startIndex = 0;
                        
                        if(playlistGroups.length > 0)
                        {
                            playlistGroups.forEach(group =>
                            {
                                if(playlistOrderResults[i].groupTier == group.groupTier && playlistOrderResults[i].modGroup == group.modGroup && playlistOrderResults[i].songPosition == group.songPosition)
                                {
                                    startIndex = group.endIndex;
                                }
                            });
                        }
                        
                        var endIndex = startIndex + playlistOrderResults[i].songCount;
                        
                        // Add the whole group, so startIndex = 0, endIndex = -1
                        playlistGroups.push(
                        {
                            'playlistId': playlistOrderResults[i].playlistId,
                            'groupPosition': playlistOrderResults[i].groupPosition,
                            'groupType': playlistOrderResults[i].groupType,
                            'groupTier': playlistOrderResults[i].groupTier,
                            'modGroup': playlistOrderResults[i].modGroup,
                            'songId': playlistOrderResults[i].songId,
                            'songPosition': playlistOrderResults[i].songPosition,
                            'songCount': playlistOrderResults[i].songCount,
                            'startIndex': startIndex,
                            'endIndex': endIndex
                        });
                    }
                }
            }
            
            debug.print("Groups with start / end");
            playlistGroups.forEach(group =>
            {
                debug.print(group);
            });
            
            var playlistSongs = [];
            
            generateNewNASPlaylistHelper(access_token, 0, playlistGroups, playlistSongs, function(success, results)
            {
                if(success)
                {
                    completeCallback(true, {'playlist':playlistSongs, 'groups':playlistGroups});
                }
                else
                {
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'generateNewNASPlaylistHelper error'
                    });
                }
            });
        }
    });
}

function generateNewNASPlaylistHelper(access_token, groupIndex, playlistOrderResults, playlistSongs, completeCallback)
{
    debug.print("generateNewNASPlaylistHelper");
    
    if(groupIndex >= playlistOrderResults.length)
    {
        completeCallback(true, {});
    }
    else
    {
        var playlistGroup = playlistOrderResults[groupIndex];
        
        if(intToGroupType(playlistGroup.groupType) == "SingleSong")
        {
            debug.print("SingleSong");
            playlistSongs.push({'groupType':getGroupTypeString(playlistGroup), 'id':playlistGroup.songId});
            generateNewNASPlaylistHelper(access_token, groupIndex + 1, playlistOrderResults, playlistSongs, completeCallback);
        }
        else if(intToGroupType(playlistGroup.groupType) == "SongGroup")
        {
            debug.print("SongGroup");
            addGroupToPlaylist(access_token, playlistGroup, playlistSongs, function(success, results)
            {
                if(success)
                {
                    generateNewNASPlaylistHelper(access_token, groupIndex + 1, playlistOrderResults, playlistSongs, completeCallback);
                }
                else
                {
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'addGroupToPlaylist error'
                    });
                }
            });
        }
    }
}

function addGroupToPlaylist(access_token, playlistGroup, playlistSongs, completeCallback)
{
    debug.print("addGroupToPlaylist");
    
    if(playlistGroup.groupTier >= 0)
    {
        var userTierQuery = "SELECT discordId, (points + bonusPoints) AS totalPoints FROM Tiers WHERE tier = " + playlistGroup.groupTier + " ORDER BY totalPoints DESC";
        
        debug.print(userTierQuery);
        
        con.query(userTierQuery, function (error, userTierResults, fields)
        {
            if (error)
            {
                debug.print("error accessing table Tiers for addGroupToPlaylist");
                debug.print(error);
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                debug.print("Getting Tier:" + playlistGroup.groupTier + " number of users:" + userTierResults.length);
                
                addGroupToPlaylistHelper(access_token, playlistGroup.startIndex, playlistGroup, userTierResults, playlistSongs, function(success, results)
                {
                    if(success)
                    {
                        debug.print("Group Successfully added");
                        
                        completeCallback(true, {});
                    }
                    else
                    {
                        completeCallback(false, 
                        {
                            'result': "Error",
                            'message': 'addGroupToPlaylistHelper error'
                        });
                    }
                });
            }
        });
    }
    else
    {
        // Add Mods here
        if(playlistGroup.modGroup == 1)
        {
            var modsQuery = "SELECT * FROM ModSongs WHERE songCount >= " + playlistGroup.songPosition + " ORDER BY RAND()";
            
            debug.print(modsQuery);
            
            con.query(modsQuery, function (error, modSongsResults, fields)
            {
                if (error)
                {
                    debug.print("error accessing table ModSongs for addGroupToPlaylist");
                    debug.print(error);
                    
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    debug.print("Add Mods:" + modSongsResults.length);
                    
                    addModGroupToPlaylistHelper(access_token, playlistGroup.startIndex, playlistGroup, modSongsResults, playlistSongs, function(success, results)
                    {
                        if(success)
                        {
                            debug.print("Mod group Successfully added");
                            
                            completeCallback(true, {});
                        }
                        else
                        {
                            completeCallback(false, 
                            {
                                'result': "Error",
                                'message': 'addModGroupToPlaylistHelper error'
                            });
                        }
                    });
                }
            });
        }
        else if(playlistGroup.modGroup == 2)
        {
            var mentorsQuery = "SELECT * FROM MentorSongs WHERE songCount >= " + playlistGroup.songPosition + " ORDER BY RAND()";
            
            debug.print(mentorsQuery);
            
            con.query(mentorsQuery, function (error, mentorSongsResults, fields)
            {
                if (error)
                {
                    debug.print("error accessing table MentorSongs for addGroupToPlaylist");
                    debug.print(error);
                    
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    debug.print("Add Mentors:" + mentorSongsResults.length);
                    
                    addModGroupToPlaylistHelper(access_token, playlistGroup.startIndex, playlistGroup, mentorSongsResults, playlistSongs, function(success, results)
                    {
                        if(success)
                        {
                            debug.print("Mentor group Successfully added");
                            
                            completeCallback(true, {});
                        }
                        else
                        {
                            completeCallback(false, 
                            {
                                'result': "Error",
                                'message': 'addModGroupToPlaylistHelper error'
                            });
                        }
                    });
                }
            });
        }
    }
}

function getGroupTypeString(playlistGroup)
{
    if(intToGroupType(playlistGroup.groupType) == "SingleSong")
    {
        return "SingleSong";
    }
    else if(intToGroupType(playlistGroup.groupType) == "SongGroup")
    {
        if(playlistGroup.modGroup == 1)
        {
            return "Mods";
        }
        else if(playlistGroup.modGroup == 2)
        {
            return "Mentors";
        }
        else
        {
            return "Tier" + playlistGroup.groupTier;
        }
    }
}

function getNextSongForRule(discordId, rule, songSelectionList)
{
    //Song Rules
    //0 - 100% Top Song
    //1 - 70% Top Song, 30% Second Song
    //2 - 20% Each Top 5 Songs
    //3 - 10% Each Top 10 Songs
    //4 - Random
    
    var numSongs = songSelectionList.length;
    
    if(numSongs <= 0)
    {
        debug.print("No song to add for:" + discordId);
        return -1;
    }
    else if(rule == 0)
    {
        //0 - 100% Top Song
        return songSelectionList[0];
    }
    else if(rule == 1)
    {
        //1 - 70% Top Song, 30% Second Song
        if(numSongs >= 2)
        {
            var rand = Math.random() * 10;
            
            if(rand < 7)
            {
                return songSelectionList[0];
            }
            else
            {
                return songSelectionList[1];
            }
        }
        else
        {
            return songSelectionList[0];
        }
    }
    else
    {
        var total = numSongs;
        
        if(rule == 2)
        {
            //2 - 33% Each Top 3 Songs
            
            if(numSongs > 3)
            {
                total = 3;
            }
        }
        else if(rule == 3)
        {
            //3 - 20% Each Top 5 Songs
            
            if(numSongs > 5)
            {
                total = 5;
            }
        }
        else if(rule == 4)
        {
            //4 - 10% Each Top 10 Songs
            
            if(numSongs > 10)
            {
                total = 10;
            }
        }
        //else if(rule == 5)
        //{
        //    //5 - Random
        //}
    
        var index = Math.floor(Math.random() * total);
        
        return songSelectionList[index];
    }
}

function addGroupToPlaylistHelper(access_token, songIndex, playlistGroup, artistList, playlistSongs, completeCallback)
{
    debug.print("addGroupToPlaylistHelper");
    
    if(songIndex >= artistList.length || (playlistGroup.endIndex > 0 && songIndex >= playlistGroup.endIndex))
    {
        playlistGroup.finalSongIndex = songIndex;
        completeCallback(true, {});
    }
    else
    {
        var artist = artistList[songIndex];
        
        if(artist != null)
        {
            debug.print("Artist:" + artist.discordId);
            
            addNextSongToPlaylist(access_token, artist.discordId, playlistGroup, playlistSongs, function(success, results)
            {
                if(success)
                {
                    addGroupToPlaylistHelper(access_token, songIndex + 1, playlistGroup, artistList, playlistSongs, completeCallback);
                }
                else
                {
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'addNextSongToPlaylist error'
                    });
                }
            });
        }
        else
        {
            addGroupToPlaylistHelper(access_token, songIndex + 1, playlistGroup, artistList, playlistSongs, completeCallback);
        }
    }
}

function addNextSongToPlaylist(access_token, discordId, playlistGroup, playlistSongs, completeCallback)
{
    getOrderedSongListFromDiscordNoSpotify(access_token, discordId, {}, function(success, results)
    {
        if(success)
        {
            if(results.data != null && results.data.length > 0)
            {
                debug.print("Received Song List for user:" + discordId);
                
                //Filter out duplicate songs
                var songSelectionList = [];
                
                results.data.forEach(songToCheck =>
                {
                    var duplicate = false;
                    
                    playlistSongs.forEach(playlistSong =>
                    {
                        if(playlistSong.id == songToCheck.songId)
                        {
                            duplicate = true;
                        }
                    });
                    
                    if(!duplicate)
                    {
                        songSelectionList.push(songToCheck.songId);
                    }
                });
                
                getSongRuleFromdiscordId(access_token, discordId, {}, function(success, ruleResults)
                {
                    if(success)
                    {
                        var selectedSong = getNextSongForRule(discordId, ruleResults.data, songSelectionList);
                        
                        if(selectedSong == null || selectedSong == '')
                        {
                            debug.print("No song list saved for user:" + discordId);
                        }
                        
                        if(selectedSong != null && selectedSong != -1 && selectedSong != '')
                        {
                            playlistSongs.push({'groupType':getGroupTypeString(playlistGroup), 'id':selectedSong});
                        }
                    }
                    else
                    {
                        if(songSelectionList.length > 0)
                        {
                            playlistSongs.push({'groupType':getGroupTypeString(playlistGroup), 'id':songSelectionList[0]});
                        }
                    }
                });
            }
            else
            {
                debug.print("Failed to receive a song list for user:" + discordId);
            }
            
            completeCallback(true, {});
        }
        else
        {
            completeCallback(false, 
            {
                'result': "Error",
                'message': 'getOrderedSongListFromDiscordNoSpotify error'
            });
        }
    });
}

function addModGroupToPlaylistHelper(access_token, songIndex, playlistGroup, modsList, playlistSongs, completeCallback)
{
    debug.print("addModGroupToPlaylistHelper");
    
    if(songIndex >= modsList.length || (playlistGroup.endIndex > 0 && songIndex >= playlistGroup.endIndex))
    {
        playlistGroup.finalSongIndex = songIndex;
        completeCallback(true, {});
    }
    else
    {
        var artist = modsList[songIndex];
        
        debug.print("Artist:" + artist.discordId);
        
        addNextSongToPlaylist(access_token, artist.discordId, playlistGroup, playlistSongs, function(success, results)
        {
            if(success)
            {
                addModGroupToPlaylistHelper(access_token, songIndex + 1, playlistGroup, modsList, playlistSongs, completeCallback);
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'message': 'addNextSongToPlaylist error'
                });
            }
        });
    }
}

app.get('/' + ENVIRONMENT + '/test6/', function(req,res)
{
    debug.print("test6 called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id,
      text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        //if song list already saved -> Do nothing
        //if no song list -> Save the default from spotify
        //if no artist id -> skip
        
        // When building playlists have a separate function that doesn't hit spotify if the user has their song list saved in the table
        
        /*createSongRuleTable(function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'backupAllNASPlaylists error'});
            }
        });*/
        
        /*spotifyData.rule = 2;
        
        setSongRuleForUser(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                getSongRuleForUser(access_token, spotifyData, function(success, results)
                {
                    if(success)
                    {
                        debug.print("Song rule for user:" + results.data);
                        res.send({'result': "Success", 'message':'Success'});
                    }
                    else
                    {
                        res.send({'result': "Error", 'message':'test6 error 2'});
                    }
                });
            }
            else
            {
                res.send({'result': "Error", 'message':'test6 error'});
            }
        });*/
        
        /*backupAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'backupAllNASPlaylists error'});
            }
        });*/
        
        /*spotifyData.playlistTag = "Superstars";
        
        backupSingleNASPlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'cloneSingleNASPlaylist error'});
            }
        });*/
        
        /*fillOrderedSongListForMods(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                // Print out updates to discord
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'fillOrderedSongListForMods error'});
            }
        });*/
        
        /*var tag = "Legends";
        
        generateNASPlaylist(access_token, tag, spotifyData, function(success, results)
        {
            if(success)
            {
                printNASPlaylist(tag, results.playlist, results.groups);
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'fillOrderedSongListForMods error'});
            }
        });*/
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function printNASPlaylist(tag, playlistSongs, playlistGroups)
{
    debug.print("New Playlist:" + tag + "(" + playlistSongs.length + ")");
    
    for(var i = 0; i < playlistSongs.length; ++i)
    {
        var duplicate = false;
        
        for(var j = 0; j < i; ++j)
        {
            if(playlistSongs[i].id == playlistSongs[j].id)
            {
                duplicate = true;
            }
        }
        
        if(duplicate)
        {
            debug.print("[" + i + "] ***** Duplicate " + playlistSongs[i].type + " Song:" + playlistSongs[i].id + " *****");
        }
        else
        {
            debug.print("[" + i + "] " + playlistSongs[i].type + " Song:" + playlistSongs[i].id);
        }
    }
}

function clearNASBackupPlaylists(access_token, spotifyData, completeCallback)
{
    debug.print("clearNASBackupPlaylists");
    
    clearNASBackupPlaylistsHelper(access_token, 0, spotifyData, completeCallback);
}

function clearNASBackupPlaylistsHelper(access_token, index, spotifyData, completeCallback)
{
    debug.print("clearNASBackupPlaylistsHelper: " + index);
    
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        spotifyData.playlistId = playlist.backupId;
        
        spotify.clearPlaylistSongs(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                clearNASBackupPlaylistsHelper(access_token, index + 1, spotifyData, completeCallback);
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
}

function cloneAllNASPlaylists(access_token, spotifyData, completeCallback)
{
    debug.print("cloneAllNASPlaylists");
    
    cloneAllNASPlaylistsHelper(access_token, 0, spotifyData, completeCallback);
}

function cloneAllNASPlaylistsHelper(access_token, index, spotifyData, completeCallback)
{
    debug.print("cloneAllNASPlaylistsHelper: " + index);
    
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        
        spotifyData.sourcePlaylistId = playlist.officialId;
        spotifyData.destinationPlaylistId = playlist.id;
        
        spotify.clonePlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                cloneAllNASPlaylistsHelper(access_token, index + 1, spotifyData, completeCallback);
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
}

function restoreAllNASPlaylists(access_token, spotifyData, completeCallback)
{
    debug.print("restoreAllNASPlaylists");
    
    restoreAllNASPlaylistsHelper(access_token, 0, spotifyData, completeCallback);
}

function restoreAllNASPlaylistsHelper(access_token, index, spotifyData, completeCallback)
{
    debug.print("restoreAllNASPlaylistsHelper: " + index);
    
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        spotifyData.sourcePlaylistId = playlist.backupId;
        spotifyData.destinationPlaylistId = playlist.id;
        
        spotify.clonePlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                restoreAllNASPlaylistsHelper(access_token, index + 1, spotifyData, completeCallback);
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
}

function backupAllNASPlaylists(access_token, spotifyData, completeCallback)
{
    debug.print("backupAllNASPlaylists");
    
    backupAllNASPlaylistsHelper(access_token, 0, spotifyData, completeCallback);
}

function backupAllNASPlaylistsHelper(access_token, index, spotifyData, completeCallback)
{
    debug.print("backupAllNASPlaylistsHelper: " + index);
    
    if(index >= SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var playlist = SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY[index];
        spotifyData.sourcePlaylistId = playlist.officialId;
        spotifyData.destinationPlaylistId = playlist.backupId;
        
        spotify.clonePlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                backupAllNASPlaylistsHelper(access_token, index + 1, spotifyData, completeCallback);
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
}

function cloneSingleNASPlaylist(access_token, spotifyData, completeCallback)
{
    debug.print("cloneSingleNASPlaylist");
    
    var playlist = null;
    
    SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
    {
        if(spotifyData.playlistTag == editPlaylist.tag)
        {
            playlist = editPlaylist;
        }
    });
    
    if(playlist != null)
    {
        spotifyData.sourcePlaylistId = officialPlaylist.officialId;
        spotifyData.destinationPlaylistId = testPlaylist.id;
        
        spotify.clonePlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
    else
    {
        debug.print("Couldn't find playlist for " + spotifyData.playlistTag);
        
        completeCallback(false, {'result': "Error"});
    }
}

function backupSingleNASPlaylist(access_token, spotifyData, completeCallback)
{
    debug.print("backupSingleNASPlaylist");
    
    var playlist = null;
    
    SPOTIFY_NAS_EDIT_PLAYLIST_ARRAY.forEach(editPlaylist =>
    {
        if(spotifyData.playlistTag == editPlaylist.tag)
        {
            playlist = editPlaylist;
        }
    });
    
    if(playlist != null)
    {
        spotifyData.sourcePlaylistId = playlist.officialId;
        spotifyData.destinationPlaylistId = playlist.backupId;
        
        spotify.clonePlaylist(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                completeCallback(false, {'result': "Error"});
            }
        });
    }
    else
    {
        debug.print("Couldn't find playlist for " + spotifyData.playlistTag);
        
        completeCallback(false, {'result': "Error"});
    }
}

function fillOrderedSongListForMods(access_token, spotifyData, completeCallback)
{
    debug.print("fillOrderedSongListForMods");
    
    con.query('SELECT * FROM ModSongs', function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table ModSongs");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Results obtained for mods number:" + results.length);
            
            fillOrderedSongListForTierHelper(access_token, 0, results, spotifyData, function(success, songListResults)
            {
                if(success)
                {
                    debug.print("Successfully completed for mods");
                    completeCallback(true, {'result': "Success"});
                }
                else
                {
                    debug.print("Mods:fillOrderedSongListForTierHelper error");
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'getOrderedSongListFromDiscord error'
                    });
                }
            });
        }
    });
}

function fillOrderedSongListForTier(access_token, tier, spotifyData, completeCallback)
{
    debug.print("fillOrderedSongListForTier");
    
    con.query('SELECT * FROM Tiers WHERE tier = ' + tier, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table Tiers");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Results obtained for tier:" + tier + " number:" + results.length);
            fillOrderedSongListForTierHelper(access_token, 0, results, spotifyData, function(success, songListResults)
            {
                if(success)
                {
                    debug.print("Successfully completed for tier:" + tier);
                    completeCallback(true, {'result': "Success"});
                }
                else
                {
                    debug.print("fillOrderedSongListForTierHelper error");
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'message': 'getOrderedSongListFromDiscord error'
                    });
                }
            });
        }
    });
}

function fillOrderedSongListForTierHelper(access_token, index, userList, spotifyData, completeCallback)
{
    if(index >= userList.length)
    {
        completeCallback(true, {});
    }
    else
    {
        var discordId = userList[index].discordId;
        
        fillOrderedSongListForUser(access_token, discordId, {}, function(success, results)
        {
            if(success)
            {
                fillOrderedSongListForTierHelper(access_token, index + 1, userList, spotifyData, completeCallback);
            }
            else
            {
                debug.print("Database error for user:" + discordId);
                completeCallback(false, {'Result':"Error"});
            }
        });
    }
}

function fillOrderedSongListForUser(access_token, discordId, spotifyData, completeCallback)
{
    getOrderedSongListFromDiscordNoSpotify(access_token, discordId, {}, function(success, songListResults)
    {
        if(success)
        {
            if(songListResults.data.length == 0)
            {
                // Get full song list and write it to the db
                //debug.print("No song list in db for user:" + discordId);
                getOrderedSongListFromDiscord(access_token, discordId, {}, function(success, fullSongListResults)
                {
                    if(success)
                    {
                        //debug.print("Received Spotfiy song List for user:" + discordId);
                        
                        if(fullSongListResults.data != null && fullSongListResults.data.songList != null && fullSongListResults.data.songList.length > 0)
                        {
                            //debug.print("Received list from spotify for user:" + discordId + " - " + fullSongListResults.data.songList.length);
                            
                            var spotifyData = {
                                song_list: []
                            };
                            
                            var index = 0;
                            
                            fullSongListResults.data.songList.forEach(song =>
                            {
                                if(index < 100)
                                {
                                    //debug.print(song.id);
                                    spotifyData.song_list.push(song.id);
                                }
                                ++index;
                            });
                            
                            writeSongOrderForDiscordId(discordId, spotifyData, function(success, results)
                            {
                                if(success)
                                {
                                    //debug.print("Songs added to DB for:" + discordId);
                                    completeCallback(true, {});
                                }
                                else
                                {
                                    debug.print("failed to add songs to DB for:" + discordId);
                                    completeCallback(false, {'Result':"Error"});
                                }
                            });
                        }
                        else
                        {
                            debug.print("no songs found for:" + discordId);
                            completeCallback(true, {});
                        }
                    }
                    else
                    {
                        debug.print("No artist links for user:" + discordId);
                        completeCallback(true, {});
                    }
                });
            }
            else
            {
                // User already has a song list saved so move along
                debug.print("Received Song List for user from DB:" + discordId + " - " + songListResults.data.length);
                completeCallback(true, {});
            }
        }
        else
        {
            debug.print("Error getting song list from table:" + discordId);
            completeCallback(false, {'Result':"Error"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/test7/', function(req,res)
{
    debug.print("test7 called");
    
    var spotifyData = {
        refresh_token: req.query.refresh_token,
        user_name: req.query.spotify_name,
        user_id: req.query.spotify_id,
        text_box: req.query.text_box
    };
    
    var newHoursByPlaylist = [];
    var hoursByPlaylist = [];
    var latestTimestampByPlaylist = [];
    
    for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
    {
        newHoursByPlaylist.push(-1);
        hoursByPlaylist.push(-1);
        latestTimestampByPlaylist.push(new Date(0));
    }
    
    var recent = {
        'songs': -1,
        'hours': -1,
        'nonNasHours': -1,
        'totalNasHours': -1,
        'invalidHours': -1,
        'alreadyCountedNasHours': -1,
        'newNasHours': -1,
        'newHoursByPlaylist': newHoursByPlaylist,
        'latestTimestampByPlaylist': latestTimestampByPlaylist,
        'nonNasPlaylistIds': [],
        'nonNasPlaylistNames': []
    };
    
    var total = {
        'hours': 0,
        'hoursByPlaylist': hoursByPlaylist,
        'bonusPoints': 0,
        'numAccounts': 0
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'recent': recent,
        'total': total,
        'discordId': "",
        'spotifyIds': []
    }
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        var discordId = '869269141033484298'; //'1136749357274763347'; // '869269141033484298'
        
        getOrderedSongListFromDiscord(access_token, discordId, {}, function(success, songListResults)
        {
            if(success)
            {
                // Save song list here
                debug.print("Received Spotfiy song List for user:" + discordId);
                
                //fillOrderedSongListForTierHelper(access_token, index + 1, userList, spotifyData, completeCallback);
            }
            else
            {
                debug.print("No artist links for user:" + discordId);
                
                //fillOrderedSongListForTierHelper(access_token, index + 1, userList, spotifyData, completeCallback);
            }
        });
        
        res.send({'result': "Success", 'message':'Success'});
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/test8/', function(req,res)
{
    debug.print("test8 called");
    
    var spotifyData = {
        refresh_token: req.query.refresh_token,
        user_name: req.query.spotify_name,
        user_id: req.query.spotify_id,
        text_box: req.query.text_box
    };
    
    var newHoursByPlaylist = [];
    var hoursByPlaylist = [];
    var latestTimestampByPlaylist = [];
    
    for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
    {
        newHoursByPlaylist.push(-1);
        hoursByPlaylist.push(-1);
        latestTimestampByPlaylist.push(new Date(0));
    }
    
    var recent = {
        'songs': -1,
        'hours': -1,
        'nonNasHours': -1,
        'totalNasHours': -1,
        'invalidHours': -1,
        'alreadyCountedNasHours': -1,
        'newNasHours': -1,
        'newHoursByPlaylist': newHoursByPlaylist,
        'latestTimestampByPlaylist': latestTimestampByPlaylist,
        'nonNasPlaylistIds': [],
        'nonNasPlaylistNames': []
    };
    
    var total = {
        'hours': 0,
        'hoursByPlaylist': hoursByPlaylist,
        'bonusPoints': 0,
        'numAccounts': 0
    };
    
    var streamData = {
        'spotifyData': spotifyData,
        'recent': recent,
        'total': total,
        'discordId': "",
        'spotifyIds': []
    }
    
    var access_token = req.query.access_token;
    
    if(authenticate(spotifyData))
    {
        deleteTable("Tiers", function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'Error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/update_tier_song_list/', function(req,res)
{
    debug.print("/update_tier_song_list called");
    
    var spotifyData = {
      refresh_token: req.query.refresh_token,
      user_name: req.query.spotify_name,
      user_id: req.query.spotify_id
    };
    
    var access_token = req.query.access_token;
    
    var tier = req.query.tier;
    
    if(modAuthenticate(spotifyData))
    {
        //if song list already saved -> Do nothing
        //if no song list -> Save the default from spotify
        //if no artist id -> skip
        
        // When building playlists have a separate function that doesn't hit spotify if the user has their song list saved in the table
        
        fillOrderedSongListForTier(access_token, tier, spotifyData, function(success, results)
        {
            if(success)
            {
                // Print out updates to discord
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'removeNASSongsFromPlaylist error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function removeNASSongsFromPlaylist(access_token, spotifyData, completeCallback)
{
    debug.print("removeNASSongsFromPlaylist");
    
    con.query('SELECT spotifyId FROM SpotifyArtistLinks', function (error, results, fields)
    {
        if (!error)
        {
            var artistIds = [];
            
            results.forEach(result =>
            {
                artistIds.push(result.spotifyId);
            });
            
            spotify.clearSongsFromArtists(access_token, spotifyData, artistIds, function(success, results)
            {
                if(success)
                {
                    completeCallback(true, {});
                }
                else
                {
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'error': error,
                        'message': 'spotify.clearSongsFromArtists error'
                    });
                }
            });
        }
        else
        {
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
    });
}

function getNASSongsFromPlaylist(access_token, spotifyData, completeCallback)
{
    // Get single songs from the playlist and include those as NAS songs as well
    debug.print("getNASSongsFromPlaylist");
    var playlistNASTracks = [];
    var playlistNonNASTracks = [];
    
    con.query('SELECT spotifyId FROM SpotifyArtistLinks', function (error, results, fields)
    {
        if (!error)
        {
            var playlistSongQuery = "SELECT songId FROM PlaylistSongOrder WHERE groupType = " + groupTypeToInt("SingleSong") + " AND playlistId = '" + spotifyData.playlistTag + "';";
            
            con.query(playlistSongQuery, function (error, singleSongResults, fields)
            {
                if (!error)
                {
                    var artistIds = [];
                    
                    results.forEach(result =>
                    {
                        artistIds.push(result.spotifyId);
                    });
                    
                    spotify.getPlaylistInfo(access_token, spotifyData, function(success, results)
                    {
                        if(success)
                        {
                            var playlistInfo = results.results;
                            
                            var linkSongs = nas.getLinkSongs("All");
                            var spacerSongs = nas.getSpacerSongs("All");
                            
                            debug.print(playlistInfo.name);
                            
                            if(playlistInfo.tracks != null && playlistInfo.tracks.length > 0)
                            {
                                for(var i = 0; i < playlistInfo.tracks.length; ++i)
                                {
                                    var isNASTrack = false;
                                    
                                    if(playlistInfo.tracks[i].artists != null && playlistInfo.tracks[i].artists.length > 0)
                                    {
                                        playlistInfo.tracks[i].artists.forEach(artist =>
                                        {
                                            var foundArtist = null;
                                            foundArtist = artistIds.find((dbArtist) => dbArtist == artist.id);
                                            if(foundArtist != undefined)
                                            {
                                                isNASTrack = true;
                                            }
                                        });
                                    }
                                    
                                    if(!isNASTrack)
                                    {
                                        singleSongResults.forEach(singleSong =>
                                        {
                                            if(singleSong.songId == playlistInfo.tracks[i].id)
                                            {
                                                isNASTrack = true;
                                            }
                                        });
                                    }
                                    
                                    if(!isNASTrack)
                                    {
                                        linkSongs.forEach(linkSong =>
                                        {
                                            if(linkSong.id == playlistInfo.tracks[i].id)
                                            {
                                                isNASTrack = true;
                                            }
                                        });
                                    }
                                    
                                    if(!isNASTrack)
                                    {
                                        spacerSongs.forEach(spacerSong =>
                                        {
                                            if(spacerSong.id == playlistInfo.tracks[i].id)
                                            {
                                                isNASTrack = true;
                                            }
                                        });
                                    }
                                    
                                    if(isNASTrack)
                                    {
                                        playlistNASTracks.push({'index':i, 'id':playlistInfo.tracks[i].id});
                                    }
                                    else
                                    {
                                        playlistNonNASTracks.push({'index':i, 'id':playlistInfo.tracks[i].id});
                                    }
                                }
                                completeCallback(true, {'nas':playlistNASTracks, 'nonNas':playlistNonNASTracks, 'nasArtists':artistIds, 'snapshotId':playlistInfo.snapshotId});
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
                else
                {
                    debug.print("Error accessing PlaylistSongOrder table");
                    completeCallback(false, 
                    {
                        'result': "Error",
                        'error': error
                    });
                }
            });
        }
        else
        {
            debug.print("Error accessing SpotifyArtistLinks table");
            
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
    });
}

function printAllUsersMissingArtistLinks(completeCallback)
{
    var userList = [];
    
    printAllUsersMissingArtistLinksHelper(1, userList, completeCallback);
}

function printAllUsersMissingArtistLinksHelper(index, userList, completeCallback)
{
    if(index >= DISCORD_TIERS.length)
    {
        completeCallback(true, {'data': userList});
    }
    else
    {
        printUsersMissingArtistLinks(index, function(success, results)
        {
            if(success)
            {
                results.data.forEach(user =>
                {
                    userList.push(user);
                });
                
                printAllUsersMissingArtistLinksHelper(index + 1, userList, completeCallback);
            }
            else
            {
                completeCallback(false, 
                {
                    'result': "Error",
                    'error': "Error calling printUsersMissingArtistLinks"
                });
            }
        });
    }
}

function printUsersMissingArtistLinks(tier, completeCallback)
{
    con.query('SELECT * FROM SpotifyArtistLinks', function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistLinks");
            debug.print(error);
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
        else
        {
            getUsersMissingArtistLinks(tier, results, completeCallback);
        }
    });
}

function getUsersMissingArtistLinks(tier, databaseResults, completeCallback)
{
    var userList = [];
    
    discordGuild.roles.fetch(DISCORD_TIERS[tier].roleId)
    .then(role => {
        
        role.members.forEach(member =>
        {
	        if(member.user != null)
	        {
	            var found = false;
	            
	            databaseResults.forEach(dbUser =>
	            {
    	            if(member.user.id == dbUser.discordId)
    	            {
    	                found = true;
    	            }
    	       
                });
                
                if(!found)
                {
	                var name = member.user.username;
	                if(member.nickname != null && member.nickname != "")
	                {
	                    name = member.nickname;
	                }
	                
                    debug.print("No Artist Link for " + name + " (" + member.user.id + ")");
                    
                    var user = {'name': name, 'id':member.user.id};
                    userList.push(user);
                }
	        }
	    });
	    
	    completeCallback(true, {'result': "Success", 'data':userList});
    })
    .catch(error => {
	    debug.print("Couldn't find role");
	    debug.print(DISCORD_TIERS[tier].roleId);
	    debug.print(error);
        
        completeCallback(false, 
        {
            'result': "Error",
            'error': error
        });
    });
}

function getArtistLinkList(completeCallback)
{
    // Code to create the SpotifyArtistLinks table
    con.query('SELECT * FROM SpotifyArtistLinks', function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table SpotifyArtistLinks");
            debug.print(error);
            completeCallback(false, 
            {
                'result': "Error",
                'error': error
            });
        }
        else
        {
            debug.print("----- getArtistLinkList -----");
            
            results.forEach(result =>
            {
                debug.print(result);
            });
            
            completeCallback(true, {'result': "Success"});
        }
    });
}

app.get('/' + ENVIRONMENT + '/print_tier_update_list/', function(req,res)
{
    debug.print("print_tier_update_list called");
    
    var spotifyData = {
        refresh_token: req.query.refresh_token,
        user_name: req.query.spotify_name,
        user_id: req.query.spotify_id,
        text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        PrintDiscordTierUpdateList(function(success, results){
            if (success)
            {
                var count = -1;
                
                if(results.data != null && results.data.length >= 0)
                {
                    count = results.data.length;
                }
                debug.print("successfully called PrintDiscordTierUpdateList");
                res.send({'result': "Success", 'message':'Success', 'count':count});
            }
            else
            {
                debug.print("error calling PrintDiscordTierUpdateList");
                res.send({'result': "Error", 'message':'Authentication Error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

app.get('/' + ENVIRONMENT + '/backup_main_playlists/', function(req,res)
{
    debug.print("backup_main_playlists called");
    
    var spotifyData = {
        refresh_token: req.query.refresh_token,
        user_name: req.query.spotify_name,
        user_id: req.query.spotify_id,
        text_box: req.query.text_box
    };
    
    var access_token = req.query.access_token;
    
    if(resetAuthenticate(spotifyData))
    {
        backupAllNASPlaylists(access_token, spotifyData, function(success, results)
        {
            if(success)
            {
                res.send({'result': "Success", 'message':'Success'});
            }
            else
            {
                res.send({'result': "Error", 'message':'backupAllNASPlaylists error'});
            }
        });
    }
    else
    {
        res.send({'result': "Error", 'message':'Authentication Error'});
    }
});

function GetUserTierUpdateList(completeCallback)
{
    con.query('SELECT * FROM Tiers ORDER BY tier, points', function (error, tiersResults, fields)
    {
        if (error)
        {
            debug.print("Error accessing Tiers table");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var userUpdateList = [];
            
            for(var i = 0; i < tiersResults.length; ++i)
            {
                if(tiersResults[i].tier != tiersResults[i].oldTier)
                {
                    userUpdateList.push({'discordId':tiersResults[i].discordId, 'oldTier':tiersResults[i].oldTier, 'newTier':tiersResults[i].tier});
                }
            }
            
            completeCallback(true, {'result': "Success", 'userTierUdateList': userUpdateList});
        }
    });
}

function GetUsersThatStillNeedToBeUpdated(completeCallback)
{
    var tiers = [];
    
    getTiersArrayHelper(DISCORD_TIERS.length - 2, tiers, false, true, false, function(success, results){
        if(success)
        {
            con.query('SELECT * FROM Tiers ORDER BY tier, points', function (error, tiersResults, fields)
            {
                if (error)
                {
                    debug.print("Error accessing Tiers table");
                    debug.print(error);
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    var userUpdateList = [];
                    
                    for(var i = 0; i < tiersResults.length; ++i)
                    {
                        if(tiersResults[i].tier != tiersResults[i].oldTier)
                        {
                            // Tier to be updated this reset, now check if they've been updated on discord
                            for(var j = 0; j < tiers.length; ++j)
                            {
                                var tierUser = tiers[j];
                                
                                if(tierUser[0] == tiersResults[i].discordId && tierUser[1] != tiersResults[i].tier)
                                {
                                    userUpdateList.push({'discordId':tiersResults[i].discordId, 'oldTier':tiersResults[i].oldTier, 'newTier':tiersResults[i].tier});
                                    break;
                                }
                            }
                        }
                    }
                    
                    completeCallback(true, {'result': "Success", 'userTierUdateList': userUpdateList});
                }
            });
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
    });
}

function PrintDiscordTierUpdateList(completeCallback)
{
    GetUsersThatStillNeedToBeUpdated(function(success, results){
        if(success)
        {
            debug.print("----- PrintDiscordTierUpdateList (" + results.userTierUdateList.length + ")-----");
            
            results.userTierUdateList.forEach(user => {
                debug.print(user.discordId + ": " + user.oldTier + " -> " + user.newTier);
            });
            
            completeCallback(true, {'result': "Success", 'data':results.userTierUdateList});
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
    });
}

function UpdateDiscordTiersWithDelay(completeCallback)
{
    GetUsersThatStillNeedToBeUpdated(function(success, results)
    {
        if(success)
        {
            if(results.userTierUdateList != null && results.userTierUdateList.length > 0)
            {
                UpdateDiscordUserTierProgressive(0, results.userTierUdateList, completeCallback);
            }
            else
            {
                completeCallback(true, {'result': "Success", 'data':results.userTierUdateList});
            }
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
    });
}

function UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback)
{
    if(index >= userUpdateList.length)
    {
        debug.print("----- end of user list -----");
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var user = userUpdateList[index];
        
        discordGuild.members.fetch(user.discordId)
    	.then(member => {
    		member.fetch(true)
    		.then(member => {
    		    var name = member.user.username;
                if(member.nickname != null && member.nickname != "")
                {
                    name = member.nickname;
                }
                
    		    debug.print("Update tier for " + name + " (" + member.id + ") " + user.oldTier + " -> " + user.newTier);
                member.roles.remove(DISCORD_TIERS[user.oldTier].roleId);
                member.roles.add(DISCORD_TIERS[user.newTier].roleId);
    		    ++index;
    		    UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback);
    		})
    		.catch(error => {
    		    // Couldn't find member
    		    debug.print("Couldn't fetch discord member:" + user.discordId);
    		    debug.print(error);
    		    ++index;
    		    UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback);
    		});
    	})
    	.catch(error => {
    	    // Couldn't find member
    	    debug.print("Couldn't find discord memeber:" + user.discordId);
    	    debug.print(error);
    	    ++index;
    	    UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback);
    	});
    	
    	// If this runs too quickly, then try the block above
    	/*discordGuild.members.fetch(user.discordId)
		.then(member => {
		    var name = member.user.username;
            if(member.nickname != null && member.nickname != "")
            {
                name = member.nickname;
            }
            
		    debug.print("Update tier for " + name + " (" + member.id + ") " + user.oldTier + " -> " + user.newTier);
            member.roles.remove(DISCORD_TIERS[user.oldTier].roleId);
            member.roles.add(DISCORD_TIERS[user.newTier].roleId);
		    ++index;
		    UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback);
		})
		.catch(error => {
		    // Couldn't find member
		    debug.print("Couldn't fetch discord member:" + user.discordId);
		    debug.print(error);
		    ++index;
		    UpdateDiscordUserTierProgressive(index, userUpdateList, completeCallback);
		});*/
    }
}

timeoutAction = function()
{
    if(timeoutCount >= 5)
    {
        debug.print("Last timeoutAction:" + timeoutCount);
        timeoutRes.send({'result': "Success", 'message':'Success'});
        timeoutRes = null;
    }
    else
    {
        debug.print("timeoutAction:" + timeoutCount);
        ++timeoutCount;
        
        clearTimeout(myTimeout);
        myTimeout = setTimeout(timeoutAction, 5000); // Schedule next for 5 seconds
    }
}

AddBonusPoints = function(spotifyData, points, reason, completeCallback)
{
    debug.print("AddBonusPoints");
    
    var sql = "SELECT discordId FROM BonusPoints WHERE discordId = '" + spotifyData.discordId + "' AND points = " + points + " AND reason = '" + reason +"'";
    
    //debug.print(sql);
    
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table BonusPoints");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Retrieved BonusPoints");
            
            if(results.length == 0)
            {
                //debug.print("Points haven't been added yet");
                var insertSql = "INSERT INTO BonusPoints (discordId, points, reason) VALUES ('" + spotifyData.discord_id + "', " + points + ", '" + reason +"')";
                
                //debug.print(insertSql);
                
                con.query(insertSql, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error inserting into table BonusPoints");
                        debug.print(insertSql);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        //debug.print("Points Added Now Send Report");
                        
                        var hoursByPlaylist = [];
                        
                        for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
                        {
                           hoursByPlaylist.push(-1);
                        }
                        
                        var total = {
                            'hours': 0,
                            'hoursByPlaylist': hoursByPlaylist,
                            'bonusPoints': 0,
                            'numAccounts': 0
                        };
                        
                        var streamData = {
                            'spotifyData': spotifyData,
                            'recent': null,
                            'total': total,
                            'discordId': spotifyData.discord_id,
                            'spotifyIds': []
                        }
                        
                        streamData.spotifyData.user_id = null; //So the update function doesn't try to get points from this user id if it can't find SpotifyIds in the table
                        
                        updateStreamDataWithTotalsFromDiscordId(streamData, function(success, results)
                        {
                            var streamReport = createBonusReport(streamData, points, reason);
                            
                            if(streamReport != null)
                            {
                                sendBonusDataToDiscord(streamData.discordId, streamReport, function(success, results){
                                    if(success)
                                    {
                                        //debug.print("sendBonusDataToDiscord Success");
                                        completeCallback(success, {'result': "Success"});
                                    }
                                    else
                                    {
                                        debug.print("sendBonusDataToDiscord Failure");
                                        completeCallback(success, {'result': "Error"});
                                    }
                                });
                            }
                            else
                            {
                                debug.print("Error generating bonus stream report");
                                completeCallback(success, {'result': "Error"});
                            }
                        });
                    }
                });
            }
            else
            {
                //debug.print("Points have already been added");
                
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
    });
}

PopulatePointsWithDummyData = function(completeCallback)
{
    con.query('SELECT discordId, tier FROM Tiers', function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyToDiscord");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Retrieved unique list of discordId's:" + results.length);
            
            CreateDummyPoints(0, results, function(success, results)
            {
                completeCallback(true, {'result': "Success"});
            });
        }
    });
}

CreateDummyPoints = function(index, users, completeCallback)
{
    debug.print("CreateDummyPoints");
    if(index >= users.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var user = users[index];
        
        var sql = "SELECT spotifyId FROM SpotifyToDiscord WHERE discordId = '" + user.discordId + "'";
        
        con.query(sql, function (error, results, fields) {
            if (error)
            {
                debug.print("error accessing table SpotifyToDiscord");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
            else
            {
                //debug.print("Retrieved " + results.length + " SpotifyIds for discordId:" + user.discordId);
                
                // Create dummy points for all these spotify id's
                CreateDummyPointsForSpotifyIds(0, results, user.tier, function(success, results)
                {
                    // Create Dummy Points for the next user
                    CreateDummyPoints(index + 1, users, completeCallback);
                });
            }
        });
    }
}

CreateDummyPointsForSpotifyIds = function(index, spotifyIds, tier, completeCallback)
{
    if(spotifyIds == null || spotifyIds.length == 0)
    {
        completeCallback(false, {});
    }
    else if(index >= spotifyIds.length)
    {
        completeCallback(true, {});
    }
    else
    {
        // Generate Playlist
        var playlist = SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[Math.floor(Math.random() * SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length)].id;
        
        // Generate Points
        var rand = Math.random();
        
        var points = (DISCORD_TIERS[1].minimum + 5) * rand;
        var lastTier = (DISCORD_TIERS.length - 2);
        
        if(tier == lastTier)
        {
            points = (rand * 100) + DISCORD_TIERS[lastTier].minimum - 50;
        }
        else if(tier > 0)
        {
            points = (((DISCORD_TIERS[tier + 1].minimum - DISCORD_TIERS[tier].minimum) + 20) * rand) + DISCORD_TIERS[tier].minimum - 10;
        }
        
        points /= spotifyIds.length;
        
        var query = "INSERT INTO Points (spotifyId, playlistId, points) VALUES ('" + spotifyIds[index].spotifyId + "', '" + playlist + "', " + points +")";
        
        //debug.print(query);
        
        con.query(query, function (error, results, fields) {
            if (error)
            {
                debug.print("Insert Failure for spotifyId:" + spotifyIds[index].spotifyId);
                
                completeCallback(false, {'result': "Error"});
            }
            else
            {
                CreateDummyPointsForSpotifyIds(index + 1, spotifyIds, tier, completeCallback);
            }
        });
    }
}

function PrintResetReport(completeCallback)
{
    con.query('SELECT * FROM Tiers ORDER BY tier', function (error, results, fields)
    {
        if (error)
        {
            debug.print(error);
            res.send({'result': "Error", 'message':'Authentication Error'});
        }
        else
        {
            var messages = GenerateResetReportMessages(results);
            
            messages.forEach(result =>
            {
                debug.print(result);
                force_send_to_reset_admin_channel(result);
            });
            
            completeCallback(true, {});
        }
    });
}

function GenerateResetReportMessages(tiersResults)
{
    var messages = [];
    
    messages.push("***----------------- Reset Report -----------------***");
    
    var pointsByNewTiers = [];
    
    for(var i = 0; i < DISCORD_TIERS.length - 1; ++i)
    {
        var tier = [];
        
        for(var j = 0; j < tiersResults.length; ++j)
        {
            if(tiersResults[j].tier == i)
            {
                tier.push(tiersResults[j]);
            }
        }
        
        tier.sort(function(a, b){return b.points - a.points});
        
        pointsByNewTiers.push(tier);
    }
    
    for(var i = 0; i < pointsByNewTiers.length; ++i)
    {
        if(i == 0)
        {
            messages.push("-------------- Tier " + i + " (" + pointsByNewTiers[i].length + " users with less than " + DISCORD_TIERS[1].minimum + " points) --------------");
        }
        else if(i >= (DISCORD_TIERS.length - 1))
        {
            messages.push("-------------- Tier " + i + " (" + pointsByNewTiers[i].length + " users with greater than " + DISCORD_TIERS[DISCORD_TIERS.length - 1].minimum + " points) --------------");
        }
        else
        {
            messages.push("-------------- Tier " + i + " (" + pointsByNewTiers[i].length + " users with between " + DISCORD_TIERS[i].minimum + " and " + DISCORD_TIERS[i+1].minimum + " points) --------------");
        }
        
        // check for Personal Breakers
        var personalBreakers = [];
        pointsByNewTiers[i].forEach(user =>
        {
            if(user.isOnPersonalBreak)
            {
                personalBreakers.push(user);
            }
        });
        
        if(personalBreakers.length > 0)
        {
            messages.push("Personal Breakers\n");
            
            var userString = "";
            
            personalBreakers.forEach(user =>
            {
                userString += "<@" + user.discordId + "> - " + (Math.round(user.points * 10) / 10) + (user.isOnPersonalBreak ? " - Personal Break" : "") + (user.isNewUser ? " - New User" : "") + "\n";
            });
            
            messages.push(userString);
        }
        
        // check all other users
        for(var j = (DISCORD_TIERS.length - 1); j >= 0; --j)
        {
            if(i != j)
            {
                var cohort = [];
                pointsByNewTiers[i].forEach(user =>
                {
                    if(user.oldTier == j && !user.isOnPersonalBreak)
                    {
                        cohort.push(user);
                    }
                });
                
                if(cohort.length > 0)
                {
                    cohort.sort(function(a, b){return b.points - a.points});
                    
                    if(i > j)
                    {
                        messages.push("Moved Up From Tier " + j + " (" + cohort.length + ")\n");
                    }
                    else if(i < j)
                    {
                        messages.push("Moved Down From Tier " + j + " (" + cohort.length + ")\n");
                    }
                    else
                    {
                        messages.push("No Movement\n");
                    }
                    
                    var count = 0;
                    var index = 0;
                    var stringArray = [];
                    var userString = "";
                    
                    cohort.forEach(user =>
                    {
                        var missedTierReason = getReasonForMissedTier(user);
                        
                        if(missedTierReason == null)
                        {
                            userString += "<@" + user.discordId + "> - " + (Math.round(user.points * 10) / 10) + (user.isOnPersonalBreak ? " - Personal Break" : "") + (user.isNewUser ? " - New User" : "") + "\n";
                        }
                        else if(missedTierReason == "bonus")
                        {
                            userString += "<@" + user.discordId + "> - " + (Math.round(user.points * 10) / 10) + (user.isOnPersonalBreak ? " - Personal Break" : "") + (user.isNewUser ? " - New User" : "") + " - Missed for bonus points:" + user.bonusPoints + "\n";
                        }
                        else if(missedTierReason == "playlist")
                        {
                            userString += "<@" + user.discordId + "> - " + (Math.round(user.points * 10) / 10) + (user.isOnPersonalBreak ? " - Personal Break" : "") + (user.isNewUser ? " - New User" : "") + "\n"; // + " - Missed for minimum playlist points:" + user.minPlaylistPoints + " - playlist:" + user.minPlaylistName + "\n";
                        }
                        
                        ++count;
                        
                        if(count >= 30)
                        {
                            stringArray.push(userString);
                            userString = new String("");
                            count = 0;
                        }
                    });
                    
                    stringArray.push(userString);
                    
                    if(stringArray.length > 0)
                    {
                        stringArray.forEach(text => {
                            messages.push(text);
                        });
                    }
                }
            }
        }
    }
    
    messages.push("***------------- Reset Report Complete -------------***");
    
    return messages;
}

getNewUserTier = function(user)
{
    var newTier = 0;
    
    for(var i = DISCORD_TIERS.length - 1; i >= 0; --i)
    {
        if(user.points >= DISCORD_TIERS[i].realMinimum && user.bonusPoints >= DISCORD_TIERS[i].bonusMinimum) // && user.minimumPlaylistPoints >= DISCORD_TIERS[i].playlistMinimum)
        {
            newTier = i;
            break;
        }
    }
    
    if((NO_DEMOTIONS || user.isOnPersonalBreak || user.isNewUser) && newTier < user.tier)
    {
        newTier = user.tier;
    }
    
    return newTier;
}

getReasonForMissedTier = function(user)
{
    for(var i = DISCORD_TIERS.length - 1; i >= 0; --i)
    {
        if(user.points >= DISCORD_TIERS[i].realMinimum && user.points < DISCORD_TIERS[i + 1].realMinimum && user.bonusPoints < DISCORD_TIERS[i].bonusMinimum)
        {
            return "bonus";
        }
        else if(user.points >= DISCORD_TIERS[i].realMinimum && user.points < DISCORD_TIERS[i + 1].realMinimum && user.minPlaylistPoints < DISCORD_TIERS[i].playlistMinimum)
        {
            return "playlist";
        }
    }
    
    return null;
}

arrangePointsListByNewTiers = function(index, pointsByNewTiers, pointsList, completeCallback)
{
    if(index >= DISCORD_TIERS.length)
    {
        completeCallback(true, {'result': "Success", 'pointsByNewTiers': pointsByNewTiers});
    }
    else
    {
        var tierList = [];
        //debug.print("Tier " + index);
        pointsList.forEach(user => {
            if(index == getNewUserTier(user))
            {
                // User is within this tier
                tierList.push(user);
            }
        });
        
        pointsByNewTiers[index] = tierList;
        
        arrangePointsListByNewTiers(index+1, pointsByNewTiers, pointsList, completeCallback);
    }
}

printLeaderboard = function(number, completeCallback)
{
    // Fetch full leaderboard, but only print number amount
    
    fetchLeaderboard(function(success, results)
    {
        if(success)
        {
            if(results != null && results.pointsList != null)
            {
                results.pointsList.sort(function(a, b){return b.points - a.points});
                
                var postText = createLeaderboardPost(number, results.pointsList);
                
                force_send_to_admin_channel(postText);
            }
            
            completeCallback(true, {'result': "Success"});
        }
        else
        {
            completeCallback(false, {'result': "Error"});
        }
    });
}

printTier = function(tier, completeCallback)
{
    // Print Tier from Discord
    
    var userIds = [];
    
    discordGuild.roles.fetch(DISCORD_TIERS[tier].roleId)
    .then(role => {
        
        role.members.forEach(member =>{
	        if(member.user != null)
	        {
	            userIds.push(member.user.id);
	        }
	    });
	    
        var messages = createTierListPost(tier, userIds);
	    
        messages.forEach(result =>
        {
            //debug.print(result);
            force_send_to_reset_admin_channel(result)
        });
        
        completeCallback(true, {'result': "Success"});
    })
    .catch(error => {
	    debug.print("Couldn't find role");
	    debug.print(DISCORD_TIERS[tier].roleId);
	    debug.print(error);
        completeCallback(false, 
            {'result': "Error",
             'error': error
        });
    });
}

printTierBackup = function(number, completeCallback)
{
    // Fetch tier from backup table
    
    // Code to create the Tiers table
    con.query('SELECT * FROM Tiers WHERE tier = ' + number, function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table Tiers");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Results obtained for tier:" + number);
            
            var messages = createBackupTierListPost(number, results);
            
            messages.forEach(result =>
            {
                //debug.print(result);
                force_send_to_reset_admin_channel(result)
            });
            
            completeCallback(true, {'result': "Success"});
        }
    });
}

fetchLeaderboard = function(completeCallback)
{
    //debug.print("fetchLeaderboardArtists");
    con.query('SELECT DISTINCT discordId FROM SpotifyToDiscord', function (error, results, fields) {
        if (error)
        {
            debug.print("error accessing table SpotifyToDiscord");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            //debug.print("Retrieved unique list of discordId's:" + results.length);
            
            var pointsList = [];
            
            retrievePointsList(0, results, pointsList, true, function(success, results){
                completeCallback(true, {'result': "Success", 'pointsList': pointsList});
            });
        }
    });
}

retrievePointsListByWeek = function(index, userList, pointsList, isObjects, previousWeek, completeCallback)
{
    if(index >= userList.length)
    {
        completeCallback(true, {'result': "Success", 'pointsList': pointsList});
    }
    else
    {
        var discordId = (isObjects ? userList[index].discordId : userList[index][0]);
        var tier = (isObjects ? userList[index].tier : userList[index][1]);
        var isOnPersonalBreak = (isObjects ? false : (userList[index].length > 2 ? userList[index][2] : false));
        var isNewUser = (isObjects ? false : (userList[index].length > 3 ? userList[index][3] : false));
        
        getAllSpotifyIds(discordId, function(success, results){
            if(success)
            {
                var query = "SELECT * FROM Points" + previousWeek + " WHERE";
    
                for (var i = 0; i < results.spotifyIds.length; ++i)
                {
                    if(i == 0)
                    {
                        query += " spotifyId = '" + results.spotifyIds[i] + "'";
                    }
                    else
                    {
                        query += " OR spotifyId = '" + results.spotifyIds[i] + "'";
                    }
                }
                
                con.query(query, function (error, results, fields) {
                    
                    var totalPoints = 0;
                    
                    if (!error)
                    {
                        results.forEach(result => {
                            totalPoints += result.points;
                        });
                    }
                    
                    //Points received, now get Bonus Points
                    var bonusQuery = "SELECT * FROM BonusPoints" + previousWeek + " WHERE discordId = '" + discordId + "'";
                    
                    //debug.print(bonusQuery);
                    
                    con.query(bonusQuery, function (error, bonusResults, fields) {
                        
                        var bonusPoints = 0;
                        
                        if (!error)
                        {
                            bonusResults.forEach(result => {
                                totalPoints += result.points;
                                bonusPoints += result.points;
                            });
                        }
                        
                        var element = {'discordId': discordId, 'points': totalPoints, 'bonusPoints': bonusPoints, 'tier' : tier, 'isOnPersonalBreak': isOnPersonalBreak, 'isNewUser': isNewUser};
                        
                        pointsList.push(element);
                        
                        retrievePointsListByWeek(index+1, userList, pointsList, isObjects, previousWeek, completeCallback);
                    });
                });
            }
            else
            {
                //debug.print("getAllSpotifyIds failed for discordId:" + discordId);
                
                var element = {'discordId': discordId, 'points': 0, 'bonusPoints': 0, 'tier' : tier, 'isOnPersonalBreak': isOnPersonalBreak, 'isNewUser': isNewUser};
                
                pointsList.push(element);
                
                retrievePointsListByWeek(index+1, userList, pointsList, isObjects, previousWeek,completeCallback);
            }
        });
    }
}

getMinimumOfficialPlaylist = function(pointsPerPlaylist)
{
    var minimumPlaylistPoints = 9999;
    var minimumPlaylist = null;
    
    SPOTIFY_NAS_OFFICIAL_PLAYLIST_ARRAY.forEach(playlist => {
        var isPlaylistInPointsArray = false;
        
        pointsPerPlaylist.forEach(pointsPlaylist => {
            if(pointsPlaylist.playlistId == playlist.id)
            {
                isPlaylistInPointsArray = true;
                
                if(pointsPlaylist.points < minimumPlaylistPoints)
                {
                    minimumPlaylistPoints = pointsPlaylist.points;
                    minimumPlaylist = playlist;
                }
            }
        });
        
        if(!isPlaylistInPointsArray)
        {
            minimumPlaylist = playlist;
            minimumPlaylistPoints = 0;
        }
    });
    
    if(minimumPlaylist != null)
    {
        return {"name":minimumPlaylist.name, "id":minimumPlaylist.id, "points":minimumPlaylistPoints};
    }
    else
    {
        return {"name":"", "id":"", "points":0};
    }
}

retrievePointsList = function(index, userList, pointsList, isObjects, completeCallback)
{
    if(index >= userList.length)
    {
        completeCallback(true, {'result': "Success", 'pointsList': pointsList});
    }
    else
    {
        var discordId = (isObjects ? userList[index].discordId : userList[index][0]);
        var tier = (isObjects ? userList[index].tier : userList[index][1]);
        var isOnPersonalBreak = (isObjects ? false : (userList[index].length > 2 ? userList[index][2] : false));
        var isNewUser = (isObjects ? false : (userList[index].length > 3 ? userList[index][3] : false));
        
        getAllSpotifyIds(discordId, function(success, results){
            if(success)
            {
                var query = "SELECT * FROM Points WHERE";
    
                for (var i = 0; i < results.spotifyIds.length; ++i)
                {
                    if(i == 0)
                    {
                        query += " spotifyId = '" + results.spotifyIds[i] + "'";
                    }
                    else
                    {
                        query += " OR spotifyId = '" + results.spotifyIds[i] + "'";
                    }
                }
                
                con.query(query, function (error, results, fields) {
                    
                    var totalPoints = 0;
                    var pointsPerPlaylists = [];
                    
                    if (!error)
                    {
                        results.forEach(result => {
                            var alreadyInPointsArray = false;
                            
                            pointsPerPlaylists.forEach(playlist =>{
                                if(playlist.playlistId == result.playlistId)
                                {
                                    alreadyInPointsArray = true;
                                    playlist.points += result.points;
                                }
                            });
                            
                            if(!alreadyInPointsArray)
                            {
                                pointsPerPlaylists.push({"playlistId":result.playlistId, "points":result.points});
                            }
                            
                            totalPoints += result.points;
                        });
                    }
                    
                    var minimumPlaylist = getMinimumOfficialPlaylist(pointsPerPlaylists);
                    
                    //Points received, now get Bonus Points
                    var bonusQuery = "SELECT * FROM BonusPoints WHERE discordId = '" + discordId + "'";
                    
                    //debug.print(bonusQuery);
                    
                    con.query(bonusQuery, function (error, bonusResults, fields) {
                        
                        var bonusPoints = 0;
                        
                        if (!error)
                        {
                            bonusResults.forEach(result => {
                                totalPoints += result.points;
                                bonusPoints += result.points;
                            });
                        }
                        
                        var element = {'discordId': discordId, 'points': totalPoints, 'bonusPoints': bonusPoints, 'tier' : tier, 'isOnPersonalBreak': isOnPersonalBreak, 'isNewUser': isNewUser, 'minimumPlaylistPoints':minimumPlaylist.points, 'minimumPlaylistName':minimumPlaylist.name};
                        
                        pointsList.push(element);
                        
                        retrievePointsList(index+1, userList, pointsList, isObjects, completeCallback);
                    });
                });
            }
            else
            {
                //debug.print("getAllSpotifyIds failed for discordId:" + discordId);
                
                var element = {'discordId': discordId, 'points': 0, 'bonusPoints': 0, 'tier' : tier, 'isOnPersonalBreak': isOnPersonalBreak, 'isNewUser': isNewUser, 'minimumPlaylistPoints':0, 'minimumPlaylistName':""};
                
                pointsList.push(element);
                
                retrievePointsList(index+1, userList, pointsList, isObjects, completeCallback);
            }
        });
    }
}

createTierListPost = function(number, tierList)
{
    //debug.print("createBackupTierListPost");
    //debug.print(tierList);
    
    var messages = [];
    
    messages.push("***---- Full List For Tier " + number + " (" + tierList.length + ") ----***");
    
    var messageCount = 0;
    var body = "";
    
    tierList.forEach(discordId =>
    {
        body += "<@" + discordId + ">\n";
        
        if(messageCount > 50)
        {
            messages.push(body);
            messageCount = 0;
            body = "";
        }
        else
        {
            ++messageCount;
        }
    });
    
    messages.push(body);
    messages.push("***---- Tier " + number + " List Complete ----***");
    
    //debug.print("**********************");
    //debug.print(messages);
    
    return messages;
}

createBackupTierListPost = function(number, tierList)
{
    //debug.print("createBackupTierListPost");
    //debug.print(tierList);
    
    var messages = [];
    
    messages.push("***---- Full List For Tier " + number + " (" + tierList.length + ") ----***");
    
    var messageCount = 0;
    var body = "";
    
    tierList.forEach(result =>
    {
        body += "<@" + result.discordId + ">\n";
        
        if(messageCount > 50)
        {
            messages.push(body);
            messageCount = 0;
            body = "";
        }
        else
        {
            ++messageCount;
        }
    });
    
    messages.push(body);
    messages.push("***---- Tier " + number + " List Complete ----***");
    
    //debug.print("**********************");
    //debug.print(messages);
    
    return messages;
}

createLeaderboardPost = function(number, pointsList)
{
    //debug.print("createLeaderboardPost");
    
    var title = "Leaderboard - Top " + number;
    
    var body = "";
    
    for(var i = 0; i < number && i < pointsList.length; ++i)
    {
        if(pointsList[i].points == 0)
        {
            break;
        }
        var points = Math.round(pointsList[i].points * 10) / 10;
        body += "<@" + pointsList[i].discordId + "> - " + points + "\n";
    }
    
    return title + '\n\n' + body;
}

getFullStreamReportFromData = function(streamData)
{
    //debug.print("getFullStreamReportFromData");
    //debug.print(streamData);
    
    var totalPoints = streamData.total.hours + streamData.total.bonusPoints;
    
    var streamReport = "Total: " + parseFloat(totalPoints.toFixed(3)) + " points\n\n";
    
    for(var i = 0; i < streamData.total.hoursByPlaylist.length; ++i)
    {
        if(streamData.total.hoursByPlaylist[i] > 0)
        {
            streamReport += "From " + SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].name + " Playlist: " + parseFloat(streamData.total.hoursByPlaylist[i].toFixed(3)) + " points\n";
        }
    }
    
    if(streamData.total.bonusPoints > 0)
    {
        streamReport += "From Bonus Points: " + streamData.total.bonusPoints + " points\n";
    }
    
    if(streamData.bonusPointList.length > 0)
    {
        streamReport += "\nBonus Points:\n";
        
        for(var i = 0; i < streamData.bonusPointList.length; ++i)
        {
            streamReport += "Bonus: " + streamData.bonusPointList[i].points + " for " + streamData.bonusPointList[i].reason + "\n";
        }
        
        streamReport += "\n";
    }
    
    streamReport += "\nStream Points:\n";
    
    for(var i = 0; i < streamData.streamsByUser.length; ++i)
    {
        streamReport += 'Spotify User: ' + streamData.streamsByUser[i].spotifyId + '\n';
        
        var playlistId = '';
        for(var j = 0; j < streamData.streamsByUser[i].streams.length; ++j)
        {
            if(playlistId != streamData.streamsByUser[i].streams[j].playlistId)
            {
                playlistId = streamData.streamsByUser[i].streams[j].playlistId;
                streamReport += "Playlist: " + getNasPlaylistNameFromId(playlistId) + '\n';
            }
            
            streamReport += "Track: https://open.spotify.com/track/" + streamData.streamsByUser[i].streams[j].trackId + ", timestamp: " + streamData.streamsByUser[i].streams[j].timestamp + ", duration: " + streamData.streamsByUser[i].streams[j].duration + '\n';
        }
        streamReport += "\n";
    }
    
    return streamReport;
}

assignDiscordRole = function(member, roleId, completeCallback)
{
	if(member.roles.cache.has(roleId))
	{
		//debug.print("Member has role already");
		discordGuild.roles.fetch(roleId)
		.then(role => {
        	var returnData = {
        		discord_id: member.id,
        		role_name: role.name,
        		message: "Follow Proof role already assigned on NAS Discord"
        	};
			
			completeCallback(true, returnData);
		});
	}
	else
	{
		//debug.print("Member doesn't have role");
		
		discordGuild.roles.fetch(roleId)
		.then(role => {
		    if(role != null)
		    {
				//debug.print("Role found");
				member.roles.add(role)
				.then(dunno =>{
                	var returnData = {
    		            discord_id: member.id,
        		        role_name: role.name,
                		message: "Follow Proof role assigned on NAS Discord"
                	};
					completeCallback(true, returnData);
				})
				.catch(error => {
				    // Couldn't find member
				    debug.print("Couldn't assign role to discord member");
				    debug.print(error);
				    
    			    var returnData = {
                		message: "Couldn't assign role to discord member"
                	};
                	
    				completeCallback(false, returnData);
				});
		    }
		    else
		    {
		        discordGuild.roles.cache.forEach(role => debug.print("Role:" + role.name + ':' + role.id));
		        
                	var returnData = {
    		            discord_id: member.id,
                		message: "Role couldn't be found, list of roles printed to console"
                	};
		        completeCallback(false, returnData);
		    }
		})
		.catch(error => {
    	    // Couldn't find member
    	    debug.print("Couldn't find role");
    	    debug.print(error);
    	    
    	    var returnData = {
        		message: "Couldn't find role"
        	};
        	
    		completeCallback(false, returnData);
    	});
	}
}

assignDiscordFollowRole = function(discordId, completeCallback)
{
	//debug.print("assignDiscordFollowRole for discordId:" + discordId);
	
	discordGuild.members.fetch(discordId)
	.then(member => {
		member.fetch(true)
		.then(member => {
			assignDiscordRole(member, DISCORD_FOLLOW_ROLE_ID, completeCallback);
		})
		.catch(error => {
		    // Couldn't find member
		    debug.print("Couldn't fetch discord member:" + discordId);
		    debug.print(error);
		    
		    var returnData = {
        		message: "Couldn't fetch discord member"
        	};
        	
			completeCallback(false, returnData);
		});
	})
	.catch(error => {
	    // Couldn't find member
	    debug.print("Couldn't find discord memeber:" + discordId);
	    debug.print(error);
	    
	    var returnData = {
    		message: "Incorrect Discord Member Id"
    	};
    	
		completeCallback(false, returnData);
	});
}

writeRecentStreamsToDB = function(spotifyID, recent, streamData, completeCallback)
{
    // Find most recent timestamp for the user, and only add values that occur after that, and only if they are from our playlists
    
    //debug.print("writeRecentStreamsToDB");
    
    //debug.print(streamData);
    //debug.print(recent);
    
    if(streamData.recent.totalNasHours > 0)
    {
        var sql = "SELECT * FROM Points WHERE timestamp = (SELECT MAX(timestamp) FROM Points WHERE spotifyId = '" + spotifyID + "')";
        
        //debug.print(sql);
        
        // Code to create the Streams table
        con.query(sql, function (error, results, fields) {
    	    //debug.print("callback");
            if (error)
            {
                // Error getting latest timestamp
    	        debug.print("error");
    	        debug.print(error);
            }
            else
            {
                var lastEntryTime = new Date(0);
                
                if(results.length == 1)
                {
    	            //debug.print("(results.length == 1)");
                    lastEntryTime = new Date(results[0].timestamp);
                }
                
                var sql = "INSERT IGNORE INTO Streams (userId, trackId, playlistId, timestamp, duration) VALUES ?";
                var values = [];
                
                var totalNewSeconds = 0;
                var totalNewPlaylistSeconds = [];
                var mostRecentPlaylistTimestamp = [];
                
                for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
                {
                   totalNewPlaylistSeconds.push(0);
                   mostRecentPlaylistTimestamp.push(new Date(0));
                }
                
                for(var key in recent)
                {
            	    var tracks = recent[key].streams;
            	    
            	    if(isNASOfficialPlaylist(recent[key].id))
            	    {
            	        //debug.print("Official Playlist: " + key + ", " + recent[key].name);
            	        
            	        var playlistIndex = nasOfficialIndex(recent[key].id);
            	        
            	        if(playlistIndex >= 0)
            	        {
                    	    for(var i = 0; i < tracks.length; ++i)
                    	    {
                    	        //debug.print("track[" + i + "].timestamp:" + tracks[i].timestamp);
                    	        
                    	        var trackTimestamp = tracks[i].timestamp;
                    	        //debug.print("" + i + " trackTimestamp:" + trackTimestamp + ", lastEntryTime:" + lastEntryTime);
                    	        //debug.print("- trackTimestamp.getTime():" + trackTimestamp.getTime() + ", lastEntryTime.getTime():" + lastEntryTime.getTime());
                    	        
                    	        if(trackTimestamp.getTime() > lastEntryTime.getTime())
                    	        {
                    	            //debug.print("- Adding:" + trackTimestamp);
                        	        var array = [spotifyID, tracks[i].trackId, tracks[i].playlistId, tracks[i].timestamp, tracks[i].duration];
                        	        values.push(array);
                        	        
                        	        totalNewSeconds += (tracks[i].duration / 1000);
                    	            totalNewPlaylistSeconds[playlistIndex] += (tracks[i].duration / 1000);
                    	            
                    	            if(mostRecentPlaylistTimestamp[playlistIndex] < trackTimestamp)
                    	            {
                    	                mostRecentPlaylistTimestamp[playlistIndex] = trackTimestamp;
                    	            }
                    	        }
                    	        //debug.print("trackId:" + tracks[i].trackId + ", playlistId:" + tracks[i].playlistId + ", timestamp:" + tracks[i].timestamp + ", duration:" + tracks[i].duration);
                    	    }
            	        }
            	    }
                }
                
                streamData.recent.newNasHours = (totalNewSeconds / 3600);
                streamData.recent.alreadyCountedNasHours = streamData.recent.totalNasHours - streamData.recent.newNasHours;
                
                for(var i = 0; i < totalNewPlaylistSeconds.length; ++i)
                {
                    streamData.recent.newHoursByPlaylist[i] = (totalNewPlaylistSeconds[i] / 3600);
                }
                
                for(var i = 0; i < mostRecentPlaylistTimestamp.length; ++i)
                {
                    //debug.print("mostRecentPlaylistTimestamp[" + i + "]:" + mostRecentPlaylistTimestamp[i] + " getTime:" + mostRecentPlaylistTimestamp[i].getTime());
                    streamData.recent.latestTimestampByPlaylist[i] = mostRecentPlaylistTimestamp[i];
                }
                
                if(values.length > 0)
                {
                    //debug.print(sql);
                    //debug.print(values);
                    
                    con.query(sql, [values], function (error, results, fields){
                        if(error)
                        {
                            debug.print("error inserting into Streams table");
                            debug.print(error);
                            completeCallback(false, {});
                        }
                        else
                        {
                            //debug.print("Successfully inserted into Streams table");
                            completeCallback(true, {});
                        }
                    });
                }
                else
                {
                    //debug.print("All tracks already processed");
                    completeCallback(true, {});
                }
            }
        });
    }
    else
    {
        streamData.recent.newNasHours = 0;
        completeCallback(true, {});
    }
};

isNASOfficialPlaylist = function(playlistId)
{
    for(var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; ++i)
    {
        if(SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].id == playlistId)
        {
            return true;
        }
    }
    return false;
}

nasOfficialIndex = function(playlistId)
{
    for(var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; ++i)
    {
        if(SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].id == playlistId)
        {
            return i;
        }
    }
    
    return -1;
}

sendBonusDataToDiscord = function(discordId, streamReport, completeCallback)
{
    if(discordId != null && discordId != "")
    {
        //debug.print("sendStreamDataToDiscord:" + discordId);
        getTierFromDiscordId(discordId, function(success, results){
            if(success)
            {
                //debug.print("getTierFromDiscordId success");
                //debug.print(results.tier);
                //debug.print(streamReport);
                
                send_to_tier(streamReport, results.tier);
                send_to_bonus_admin_channel(streamReport);
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                //debug.print("getTierFromDiscordId failed sending to account claim channel");
                
                send_to_account_claim_channel(streamReport);
                send_to_bonus_admin_channel(streamReport);
                completeCallback(true, {'result': "Failure"});
            }
        });
    }
    else
    {
        debug.print("sendBonusDataToDiscord called with null or empty discordId");
        completeCallback(false, {'result': "Error", 'message':'Authentication Error'});
    }
}

sendStreamDataToDiscord = function(discordId, streamReport, completeCallback)
{
    if(discordId != null)
    {
        //debug.print("sendStreamDataToDiscord:" + discordId);
        getTierFromDiscordId(discordId, function(success, results){
            if(success)
            {
                //debug.print("getTierFromDiscordId success");
                //debug.print(results.tier);
                send_to_tier(streamReport, results.tier);
                completeCallback(true, {'result': "Success"});
            }
            else
            {
                //debug.print("getTierFromDiscordId failed sending to account claim channel");
                send_to_account_claim_channel(streamReport);
                completeCallback(true, {'result': "Failure"});
            }
        });
    }
    else
    {
        debug.print("sendStreamDataToDiscord called with null discordId");
        completeCallback(false, {'result': "Error", 'message':'Authentication Error'});
    }
}

createBonusReport = function(streamData, points, reason)
{
    var title = "";
    if(streamData.discordId != '')
    {
        var title = "<@" + streamData.discordId + "> earned " + points + " bonus points for " + reason;
    
        return title + '\n\n' + createGeneralStreamReport(streamData);
    }
    else
    {
        return null;
    }
}

createStreamReport = function(streamData)
{
    var title = "";
    if(streamData.discordId != '')
    {
        var title = "<@" + streamData.discordId + "> submitted stream points for their " + streamData.recent.songs + " most recent songs";
    }
    else
    {
        var title = "Spotify user " + streamData.spotifyData.user_name + " (" + streamData.spotifyData.user_id + ") has submitted their " + streamData.recent.songs + " most recent songs\nIf this Spotify account belongs to you reply to this message and <@800116130315632660> or <@194204292972937226> will add it as soon as possible";
    }
    
    return title + '\n\n' + createGeneralStreamReport(streamData);
}

createGeneralStreamReport = function(streamData)
{
    var recent = "";
    if(streamData.recent != null)
    {
        var recent = "**- This Session -**\nTotal Streamed: " + parseFloat(streamData.recent.hours.toFixed(3)) + " hours\n";
        
        if(streamData.recent.nonNasHours > 0)
        {
            recent += "Non-NAS Streams: " + parseFloat(streamData.recent.nonNasHours.toFixed(3)) + " hours\n";
        }
        
        if(streamData.recent.invalidHours > 0)
        {
            recent += "Invalid Streams: " + parseFloat(streamData.recent.invalidHours.toFixed(3)) + " hours\n";
        }
        
        if(streamData.recent.alreadyCountedNasHours > 0)
        {
            recent += "NAS Streams already counted: " + parseFloat(streamData.recent.alreadyCountedNasHours.toFixed(3)) + " hours\n"
        }
        
        recent += "**New NAS Points: " + parseFloat(streamData.recent.newNasHours.toFixed(3)) + " points**\n\n";
    }
    
    var total = "**- Overall -**\n";
    
    for(var i = 0; i < streamData.total.hoursByPlaylist.length; ++i)
    {
        if(streamData.total.hoursByPlaylist[i] > 0)
        {
            total += "From " + SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].name + " Playlist: " + parseFloat(streamData.total.hoursByPlaylist[i].toFixed(3)) + " points\n";
        }
    }
    
    if(streamData.total.bonusPoints > 0)
    {
        total += "From Bonus Points: " + streamData.total.bonusPoints + " points\n";
    }
    
    var totalPoints = streamData.total.hours + streamData.total.bonusPoints;
    
    total += "**Total: " + parseFloat(totalPoints.toFixed(3)) + " points**\n";
    
    var accounts = "Streamed from " + streamData.total.numAccounts + " different Spotify accounts";
    
    return recent  + total + '\n' + accounts;
}

getStreamsFromSpotifyIds = function(streamData, completeCallback)
{
    //debug.print("getStreamsFromSpotifyIds");
    
    getStreamsFromSpotifyIdsHelper(streamData, 0, completeCallback);
}

getStreamsFromSpotifyIdsHelper = function(streamData, index, completeCallback)
{
    if(index >= streamData.spotifyIds.length)
    {
        completeCallback(true, {'result': "Success"});
    }
    else
    {
        var spotifyId = streamData.spotifyIds[index];
        var sql = "SELECT * FROM Streams" + streamData.previous_week + " WHERE userId = '" + spotifyId + "' ORDER BY timestamp";
        
        //debug.print(sql);
        
        con.query(sql, function (error, results, fields) {
            if (error)
            {
                debug.print("query failed");
                completeCallback(false, {'result': "Error"});
            }
            else
            {
                //debug.print("Streams found for first SpotifyId");
                var spotifyUser  = {
                    'spotifyId': streamData.spotifyIds[index],
                    'streams': results
                };
                
                streamData.streamsByUser.push(spotifyUser);
                
                getStreamsFromSpotifyIdsHelper(streamData, index+1, completeCallback);
            }
        });
    }
}

getBonusPointsFromDiscordId = function(streamData, completeCallback)
{
    //Points received, now get Bonus Points
    var bonusQuery = "SELECT * FROM BonusPoints" + streamData.previous_week + " WHERE discordId = '" + streamData.discordId + "'";
    
    //debug.print(bonusQuery);
    
    con.query(bonusQuery, function (error, results, fields) {
        if (error)
        {
            completeCallback(false, {'result': "Error"});
        }
        else
        {
            //debug.print("BonusPoints table Results:" + results.length);
            
            var bonusTotal = 0;
            var bonusList = [];
            
            results.forEach(result => {
                //debug.print(result);
                //debug.print(result.reason);
                var pointObject = {'points': result.points, 'reason': result.reason};
                bonusList.push(pointObject);
                bonusTotal += result.points;
            });
            
            streamData.total.bonusPoints = bonusTotal;
            streamData.bonusPointList = bonusList;
            
            //debug.print(streamData);
            
            completeCallback(true, {'result': "Success"});
        }
    });
}

updateStreamDataWithTotalsFromDiscordId = function(streamData, completeCallback)
{
    getAllSpotifyIds(streamData.discordId, function(success, results){
        if(success)
        {
            //debug.print("getAllSpotifyIds success");
            //debug.print(results);
            
            streamData.spotifyIds = results.spotifyIds;
            
            updateStreamDataWithTotalHelper(streamData, completeCallback);
        }
        else
        {
            debug.print("getAllSpotifyIds failed");
            
            if(streamData.spotifyData.user_id != null)
            {
                streamData.spotifyIds = [streamData.spotifyData.user_id];
        
                updateStreamDataWithTotalHelper(streamData, completeCallback);
            }
            else
            {
                updateStreamDataForBonusOnly(streamData, completeCallback);
            }
        }
    });
}

updateStreamDataWithTotals = function(streamData, completeCallback)
{
    //debug.print("updateStreamDataWithTotals");
    
    getDiscordId(streamData.spotifyData.user_id, function(success, results){
        if(success)
        {
            //debug.print("discordId success");
            //debug.print("discordId: " + results.discordId);
            streamData.discordId = results.discordId;
            
            updateStreamDataWithTotalsFromDiscordId(streamData, function(success, results){
                if(success)
                {
                    //debug.print("updateStreamDataWithTotalsFromDiscordId success");
                    
                    updateStreamDataWithTotalHelper(streamData, completeCallback);
                }
                else
                {
                    debug.print("updateStreamDataWithTotalsFromDiscordId failed");
                    completeCallback(false, {'result': "Error",
                        'message': "Couldn't find a SpotifyId to use for this action"
                    });
                }
            });
        }
        else
        {
            debug.print("getDiscordId failed");
            
            streamData.spotifyIds = [streamData.spotifyData.user_id];
            
            updateStreamDataWithTotalHelper(streamData, completeCallback);
        }
    });
}

updateStreamDataForBonusOnly = function(streamData, completeCallback)
{
    var bonusQuery = "SELECT * FROM BonusPoints WHERE discordId = '" + streamData.discordId + "'";
    
    //debug.print(bonusQuery);
    
    con.query(bonusQuery, function (error, results, fields) {
        if (error)
        {
            debug.print("Error selecting from bonuspoints for:" + streamData.discordId);
            debug.print(error);
            completeCallback(false, {'result': "Error"});
        }
        else
        {
            //debug.print("BonusPoints table Results:" + results.length);
            
            var bonusTotal = 0;
            
            results.forEach(result => {
                bonusTotal += result.points;
            });
            
            streamData.total.bonusPoints = bonusTotal;
            
            //debug.print(streamData);
            
            completeCallback(true, {'result': "Success"});
        }
    });
}

updateStreamDataWithTotalHelper = function(streamData, completeCallback)
{
    //debug.print(streamData);
                    
    var query = "SELECT * FROM Points WHERE";
    
    for (var i = 0; i < streamData.spotifyIds.length; ++i)
    {
        if(i == 0)
        {
            query += " spotifyId = '" + streamData.spotifyIds[i] + "'";
        }
        else
        {
            query += " OR spotifyId = '" + streamData.spotifyIds[i] + "'";
        }
    }
    
    //debug.print(query);
    
    con.query(query, function (error, results, fields) {
        if (error)
        {
            completeCallback(false, {'result': "Error"});
        }
        else
        {
            //debug.print("Points table Results:" + results.length);
            
            var totalPoints = 0;
            var accounts = [];
            var pointsPerPlaylist = [];
            
            for (var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; i++)
            {
               pointsPerPlaylist.push(0);
            }
            
            //debug.print("pointsPerPlaylist");
            //debug.print(pointsPerPlaylist);
            
            results.forEach(result => {
                //debug.print(result);
                totalPoints += result.points;
                
                for(var i = 0; i < SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length; ++ i)
                {
                    if(SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[i].id == result.playlistId)
                    {
                        pointsPerPlaylist[i] += result.points;
                        break;
                    }
                }
                
                if(!accounts.includes(result.spotifyId))
                {
                    accounts.push(result.spotifyId);
                }
            });
            
            streamData.total.hours = totalPoints;
            streamData.total.hoursByPlaylist = pointsPerPlaylist;
            streamData.total.numAccounts = accounts.length;
            
            //debug.print("totalPoints:" + totalPoints);
            //debug.print("pointsPerPlaylist");
            //debug.print(pointsPerPlaylist);
            
            //Points received, now get Bonus Points
            var bonusQuery = "SELECT * FROM BonusPoints WHERE discordId = '" + streamData.discordId + "'";
            
            //debug.print(bonusQuery);
            
            con.query(bonusQuery, function (error, results, fields) {
                if (error)
                {
                    debug.print("Error selecting from bonuspoints for:" + streamData.discordId);
                    debug.print(error);
                    completeCallback(false, {'result': "Error"});
                }
                else
                {
                    //debug.print("BonusPoints table Results:" + results.length);
                    
                    var bonusTotal = 0;
                    
                    results.forEach(result => {
                        bonusTotal += result.points;
                    });
                    
                    streamData.total.bonusPoints = bonusTotal;
                    
                    //debug.print(streamData);
                    
                    completeCallback(true, {'result': "Success"});
                }
            });
        }
    });
}

writePointsToDB = function(streamData, completeCallback)
{
    //debug.print("writePointsToDB");
    //debug.print(streamData);
    //debug.print(streamData.spotifyData);
    
    var query = "SELECT * FROM Points WHERE spotifyId = '" + streamData.spotifyData.user_id + "'";
    
    //debug.print(query);
    
    // Code to create the Streams table
    con.query(query, function (error, results, fields) {
        if (error)
        {
            completeCallback(false, {'result': "Error"});
        }
        else
        {
            //debug.print("Points table Results:" + results.length);
            //results.forEach(result => {
            //    debug.print(result);
            //});
            
            updatePointsDB(0, streamData, results, function(success, results){
                if(success)
                {
                    //debug.print("Update Points Success");
                    //debug.print(results);
                    completeCallback(true, {'result': "Success"});
                }
                else
                {
                    debug.print("Update Points Failure");
                    debug.print(results);
                    completeCallback(false, {'result': "Error"});
                }
            });
        }
    });
}

updatePointsDB = function(index, streamData, pointsResults, completeCallback)
{
    //debug.print("updatePointsDB:" + index);
    
    if(index >= SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY.length)
    {
        completeCallback(true, streamData);
    }
    else
    {
        //debug.print("updatePointsDB - SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[" + index + "]:" + SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[index].name + "(" + SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[index].id + ")" );
        
        // NAS Main Playlist
        var currentPlaylistId = SPOTIFY_NAS_MAIN_PLAYLIST_ARRAY[index].id;
        
        //debug.print("updatePointsDB:" + index + ", " + currentPlaylistId);
        
        if(streamData.recent.newHoursByPlaylist[index] > 0)
        {
            // New hours streamed for this playlist.
            //debug.print("New Streams found for:" + currentPlaylistId);
            
            var isPlaylistInDatabase = false;
            var currentTotalForPlaylist = 0;
            
            pointsResults.forEach(result => {
                if(result.playlistId == currentPlaylistId)
                {
                    //debug.print(result.spotifyId);
                    //debug.print(result.playlistId);
                    //debug.print(result.points);
                    
                    isPlaylistInDatabase = true;;
                    currentTotalForPlaylist = result.points;
                }
            });
            
            if(isPlaylistInDatabase)
            {
                // Already in the table, so update
                //debug.print("already in Db:" + currentTotalForPlaylist);
                //debug.print("new points to add:" + streamData.recent.newHoursByPlaylist[index]);
                
                var newTotal = currentTotalForPlaylist + streamData.recent.newHoursByPlaylist[index];
                
                //debug.print("new total points:" + newTotal);
                
                var query = "UPDATE Points SET points = " + newTotal + ", timestamp = " + streamData.recent.latestTimestampByPlaylist[index].getTime() + " WHERE spotifyId = '" + streamData.spotifyData.user_id + "' AND playlistId = '" + currentPlaylistId + "'";
                
                con.query(query, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("Update Failure");
                        debug.print(results);
                        
                        completeCallback(false, {'result': "Error"});
                    }
                    else
                    {
                        //debug.print("Update Success");
                        //debug.print(results);
                        
                        updatePointsDB(index + 1, streamData, pointsResults, completeCallback);
                    }
                });
            }
            else
            {
                // First stream for this playlist / spotify user, so insert
                var query = "INSERT INTO Points (spotifyId, playlistId, points, timestamp) VALUES ('" + streamData.spotifyData.user_id + "', '" + currentPlaylistId + "', " + streamData.recent.newHoursByPlaylist[index] + ", " + streamData.recent.latestTimestampByPlaylist[index].getTime() + ")";
                
                con.query(query, function (error, results, fields) {
                    if (error)
                    {
                        debug.print("Insert Failure");
                        debug.print(results);
                        
                        completeCallback(false, {'result': "Error"});
                    }
                    else
                    {
                        //debug.print("Insert Success");
                        //debug.print(results);
                        
                        updatePointsDB(index + 1, streamData, pointsResults, completeCallback);
                    }
                });
            }
        }
        else
        {
            updatePointsDB(index + 1, streamData, pointsResults, completeCallback);
        }
    }
}

function isBanned(discordId)
{
    return BANNED_LIST.includes(discordId);
}

updateStreamDataWithRecent = function(access_token, recent, streamData, completeCallback)
{
    var totalRecentSongs = 0;
    var totalRecentSeconds = 0;
    var totalNasSeconds = 0;
    var totalNonNasSeconds = 0;
    
    for(var key in recent)
    {
	    var playlistId = recent[key].id;
	    var streams = recent[key].streams;
	    
	    for(var i = 0; i < streams.length; ++i)
	    {
	        var stream = streams[i];
	        
	        ++totalRecentSongs;
	        totalRecentSeconds += stream.duration / 1000;
    	        
    	    if(isNASOfficialPlaylist(playlistId))
    	    {
    	        totalNasSeconds += stream.duration/ 1000;
    	    }
    	    else
    	    {
    	        if(!streamData.recent.nonNasPlaylistIds.includes(playlistId))
    	        {
    	            streamData.recent.nonNasPlaylistIds.push(playlistId);
    	        }
    	        
    	        totalNonNasSeconds += stream.duration/ 1000;
    	    }
	    }
    }
    
    getDiscordId(streamData.spotifyData.user_id, function(success, results)
    {
        if(success)
        {
            streamData.discordId = results.discordId;
            
            if(isBanned(streamData.discordId))
            {
                streamData.recent.invalidHours = (totalNasSeconds / 3600);
                totalNasSeconds = 0;
                streamData.recent.newNasHours = 0;
                streamData.recent.alreadyCountedNasHours = 0;
            }
            
            streamData.recent.songs = totalRecentSongs;
            streamData.recent.hours = (totalRecentSeconds / 3600);
            streamData.recent.nonNasHours = (totalNonNasSeconds / 3600);
            streamData.recent.totalNasHours = (totalNasSeconds / 3600);
            
            if(streamData.recent.nonNasPlaylistIds.length > 0)
            {
                if(streamData.recent.nonNasPlaylistIds.includes("noContext"))
                {
                    streamData.recent.nonNasPlaylistNames.push("No Playlist Data Available");
                    completeCallback(true, {'result': "Success", 'recent':recent});
                }
                else
                {
                    var data = {'playlists': streamData.recent.nonNasPlaylistIds};
                    spotify.getPlaylistListInfo(access_token, data, function(token, returnData)
                    {
                        streamData.recent.nonNasPlaylistNames = returnData.playlist_names;
                        completeCallback(true, {'result': "Success", 'recent':recent});
                    });
                }
            }
            else
            {
                completeCallback(true, {'result': "Success", 'recent':recent});
            }
        }
        else
        {
            debug.print("getDiscordId failed in updateStreamDataWithRecent");
            
    		debug.print("getDiscordId error: " + ERROR_TEXT);
            completeCallback(false, 
                {'result': "Error",
                 'error': "No DiscordId"
            });
        }
    });
}

getDiscordId = function(spotifyId, completeCallback)
{
    // Search table for spotify user id
    //debug.print("getDiscordId called");
    
    var sql = "SELECT discordId FROM SpotifyToDiscord WHERE spotifyId = '" + spotifyId + "'";
    
    //debug.print(sql);
    
    // Code to create the Streams table
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            // Error getting latest timestamp
	        debug.print("error");
	        debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            if(results.length == 1)
            {
                completeCallback(true, {'result': "Success", 'discordId': results[0].discordId});
            }
            else
            {
                completeCallback(false, 
                    {'result': "Error",
                     'message': "No discord Id Found"
                });
            }
        }
    });
}

getTierFromDiscordId = function(discordId, completeCallback)
{
    //debug.print("getTierFromDiscordId called:" + discordId);
    
    if(discordGuild != null)
    {
    	discordGuild.members.fetch(discordId)
    	.then(member => {
    		member.fetch(true)
    		.then(member => {
                //debug.print("DiscordId found:" + discordId);
                
                for(var i = 0; i < DISCORD_TIERS.length; ++i)
                {
                    if(member.roles.cache.has(DISCORD_TIERS[i].roleId))
                    {
                        completeCallback(true, {'result': "Success", 'tier': i});
                        return;
                    }
                }
                completeCallback(false, {'result': "Error", 'tier': -1});
    		})
    		.catch(error => {
    		    // Couldn't find member
    		    debug.print("Couldn't fetch discord member:" + discordId);
                completeCallback(false, {'result': "Error", 'tier': -1});
    		});
    	})
    	.catch(error => {
    	    // Couldn't find member
    	    debug.print("Couldn't find discord member:" + discordId);
            completeCallback(false, {'result': "Error", 'tier': -1});
    	});
    }
    else
    {
        initializeDiscord(function(success, results){
            if(success)
            {
                getTierFromDiscordId(completeCallback);
            }
            else
            {
                debug.print("Error initializing discordGuild");
            }
        });
    }
}

getAllSpotifyIds = function(discordId, completeCallback)
{
    // Search table for spotify user id
    
    var sql = "SELECT spotifyId FROM SpotifyToDiscord WHERE discordId = '" + discordId + "'";
    
    // Code to create the Streams table
    con.query(sql, function (error, results, fields) {
        if (error)
        {
            // Error getting latest timestamp
	        debug.print("error");
	        debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var spotifyIds = [];
            
            if(results.length > 0)
            {
                results.forEach(result => {
                    spotifyIds.push(result.spotifyId);
                });
                
                completeCallback(true, 
                    {'result': "Success",
                     'message': "Success",
                     'spotifyIds': spotifyIds
                });
            }
            else
            {
	            debug.print("discordId: " + discordId + " not in SpotifyToDiscord table");
                completeCallback(false, 
                    {'result': "Error",
                     'message': "discordId not in table"
                });
            }
        }
    });
}

populateTiersTable = function(completeCallback)
{
    // Fetch reset report for everyone with a tier
    var tiers = [];
    
    getTiersArrayHelper(DISCORD_TIERS.length - 1, tiers, false, true, false, function(success, results)
    {
        if(success)
        {
            var pointsList = [];
            
            retrievePointsList(0, tiers, pointsList, false, function(success, results)
            {
                pointsList.forEach(user =>
                {
                    user.newTier = getNewUserTier(user);
                });
                
                pointsList.sort((a, b) =>
                {
                    return a.newTier - b.newTier;
                });
                
                var insertSql = "INSERT INTO Tiers (discordId, tier, oldTier, points, bonusPoints, minPlaylistPoints, minPlaylistName, isOnPersonalBreak, isNewUser) VALUES ?";
                var values = [];
                
                pointsList.forEach(user =>
                {
                    var array = [user.discordId, user.newTier, user.tier, user.points, user.bonusPoints, user.minimumPlaylistPoints, user.minimumPlaylistName, (user.isOnPersonalBreak ? 1 : 0), (user.isNewUser ? 1 : 0)];
                    values.push(array);
                });
                
                debug.print("values.length:" + values.length);
                
                con.query(insertSql, [values], function (error, results, fields){
                    if(error)
                    {
                        debug.print("error inserting into Tiers table");
                        debug.print(error);
                        completeCallback(false, {});
                    }
                    else
                    {
                        debug.print("Successfully inserted " + values.length + " entries into Tiers table");
                        completeCallback(true, {});
                    }
                });
            });
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
    });
}

memberHasRole = function(member, roleId)
{
    return (member.roles.cache.find(r => (r.id == roleId)) != undefined);
}

createPlaylistOrderTable = function(completeCallback)
{
    debug.print("createPlaylistOrderTable called");
    
    // Code to create the Tiers table
    con.query('SELECT * FROM PlaylistSongOrder', function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE PlaylistSongOrder (playlistId VARCHAR(255) NOT NULL, groupPosition SMALLINT UNSIGNED, groupType TINYINT UNSIGNED, groupTier TINYINT, modGroup TINYINT, songId VARCHAR(255), songPosition SMALLINT UNSIGNED, songCount SMALLINT UNSIGNED, CONSTRAINT pkPlaylistGroup PRIMARY KEY (playlistId, groupPosition));";
                
                debug.print(sql);
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table PlaylistSongOrder");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table PlaylistSongOrder");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table PlaylistSongOrder");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("PlaylistSongOrder Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

getTiersArrayHelper = function(index, tiersArray, includeName, includeExtraRoles, includeMods, completeCallback)
{
	//debug.print("getTiersArrayHelper");
	//debug.print(index);
		    
    if(index < 0)
    {
        // Finished return tiersArray
		    
        completeCallback(true, 
            {'result': "Success",
             'tiers': tiersArray
        });
    }
    else
    {
        var currentRoleId = DISCORD_TIERS[index].roleId;
        
        discordGuild.roles.fetch(currentRoleId)
        .then(role => {
		    role.members.forEach(member =>{
		        if(member.user != null
		            && 
		            (!FILTER_FOR_BETA_TEST || memberHasRole(member, BETA_TESTER_ROLE_ID)) // Beta Test Filter
		            && 
		            (includeMods || !memberHasRole(member, DISCORD_TIERS[DISCORD_TIERS.length - 1].roleId))) // Mods Filter
		        {
		            var isDuplicate = false;
		            
		            tiersArray.forEach(tier =>{
		                if(member.user.id == tier[0])
		                {
		                    isDuplicate = true;
		                }
		            });
		            
		            if(!isDuplicate)
		            {
    		            var array = null;
    		            
    		            if(includeName)
    		            {
    		                var name = member.user.username;
    		                if(member.nickname != null && member.nickname != "")
    		                {
    		                    name = member.nickname;
    		                }
    		                
    		                if(includeExtraRoles)
    		                {
    		                    var isOnPersonalBreak = memberHasRole(member, PERSONAL_BREAK_ROLE_ID);
    		                    var isNewUser = memberHasRole(member, NEW_USER_ROLE_ID);
    		                    
        		                array = [member.user.id, name, index, isOnPersonalBreak, isNewUser];
    		                }
    		                else
    		                {
        		                array = [member.user.id, name, index];
    		                }
    		            }
    		            else
    		            {
    		                if(includeExtraRoles)
    		                {
    		                    var isOnPersonalBreak = memberHasRole(member, PERSONAL_BREAK_ROLE_ID);
    		                    var isNewUser = memberHasRole(member, NEW_USER_ROLE_ID);
    		                    
    		                    array = [member.user.id, index, isOnPersonalBreak, isNewUser];
    		                }
    		                else
    		                {
    		                    array = [member.user.id, index];
    		                }
    		            }
    		            
    		            tiersArray.push(array);
		            }
		        }
		    });
		    
            getTiersArrayHelper(index-1, tiersArray, includeName, includeExtraRoles, includeMods, completeCallback);
        })
        .catch(error => {
		    debug.print("Couldn't find role");
		    debug.print(currentRoleId);
		    debug.print(error);
		    
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        });
    }
}

function getSongRuleForUser(access_token, spotifyData, completeCallback)
{
    //debug.print("getSongRuleForUser");
    
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            var discordId = discordIdResults.discordId
            getSongRuleFromdiscordId(access_token, discordId, spotifyData, completeCallback);
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': "Couldn't find dicsordId from user spotifyId:" + spotifyData.user_id
            });
        }
    });
}

function getSongRuleFromdiscordId(access_token, discordId, spotifyData, completeCallback)
{
    //Song Rules
    //0 - 100% Top Song
    //1 - 70% Top Song, 30% Second Song
    //2 - 20% Each Top 5 Songs
    //3 - 10% Each Top 10 Songs
    //4 - Random
    
    var DEFAULT_RULE = 0;

    //debug.print("getSongRuleFromdiscordId");
    
    var sql = 'SELECT rule FROM SongSelectionRules WHERE discordId = ' + discordId;
    
    con.query(sql, function (error, results, fields)
    {
        if (error)
        {
            completeCallback(true, {'data':DEFAULT_RULE});
        }
        else
        {
            var rule = DEFAULT_RULE;
            if(results.length > 0)
            {
                rule = results[0].rule;
            }
            
            completeCallback(true, {'data':rule});
        }
    });
}

function setSongRuleForUser(access_token, spotifyData, completeCallback)
{
    //debug.print("setSongRuleForUser");
    
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            var discordId = discordIdResults.discordId
            setSongRuleFromdiscordId(access_token, discordId, spotifyData.rule, completeCallback);
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': "Couldn't find dicsordId from user spotifyId:" + spotifyData.user_id
            });
        }
    });
}

function setSongRuleFromdiscordId(access_token, discordId, rule, completeCallback)
{
    //Song Rules
    //0 - 100% Top Song
    //1 - 70% Top Song, 30% Second Song
    //2 - 20% Each Top 5 Songs
    //3 - 10% Each Top 10 Songs
    //4 - Random
    
    //debug.print("setSongRuleFromdiscordId");
    
    var selectSql = 'SELECT rule FROM SongSelectionRules WHERE discordId = ' + discordId;
    
    con.query(selectSql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error accessing table SongSelectionRules");
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var sql = "UPDATE SongSelectionRules SET rule = " +  rule + " WHERE discordId = '" + discordId + "';";
            
            if(results.length == 0)
            {
                // Insert
                sql = "INSERT INTO SongSelectionRules (discordId, rule) VALUES ('" + discordId + "', " + rule + ")";
            }
            
            con.query(sql, function (error, results, fields)
            {
                if (error)
                {
                    debug.print("error accessing table SongSelectionRules");
                    debug.print(error);
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    //debug.print("Song rule updated for user:" + discordId);
                    completeCallback(true, {});
                }
            });
        }
    });
}

function createSongRuleTable(completeCallback)
{
    debug.print("createSongRuleTable called");
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM SongSelectionRules', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE SongSelectionRules (discordId CHAR(22) NOT NULL, rule TINYINT, PRIMARY KEY (discordId));";
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table SongSelectionRules");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table SongSelectionRules");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table SongSelectionRules");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("SongSelectionRules Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

function createModSongsTable(completeCallback)
{
    debug.print("createModSongsTable called");
    
    // Code to create the ModSongs table
    con.query('SELECT * FROM ModSongs', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE ModSongs (discordId CHAR(22) NOT NULL, songCount TINYINT, PRIMARY KEY (discordId));";
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table ModSongs");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table ModSongs");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table ModSongs");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("ModSongs Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

function populateMentorsTable(completeCallback)
{
    debug.print("populateMentorsTable called");
    
    deleteTable('MentorSongs', function(success, results)
    {
        // Delete old Mentors table
    
        if(success)
        {
            debug.print("Successfully deleted MentorSongs");
            
            con.query("SELECT discordId FROM ModSongs", function (error, modSongResults, fields)
            {
                if (error)
                {
                    debug.print("error accessing table ModSongs");
                    debug.print(error);
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    debug.print("Successfully retrieved ModSongs");
                    
                    discordGuild.roles.fetch(DISCORD_MENTOR_ROLE)
                    .then(role => {
                        
                        var mentors = [];
                        
                        role.members.forEach(member =>{
                            var mentor = [member.id, 1];
                            mentors.push(mentor);
            		    });
            		    
            		    mentors.forEach(mentor =>
            		    {
            		        debug.print("Mentor:" + mentor[0] + ": " + mentor[1]);
            		    });
            		    
                        var insertSql = "INSERT INTO MentorSongs (discordId, songCount) VALUES ?";
                        
                        debug.print(insertSql);
                        
                        con.query(insertSql, [mentors], function (error, results, fields)
                        {
                            if(error)
                            {
                                debug.print("error inserting into MentorSongs table");
                                debug.print(error);
                                completeCallback(false, {});
                            }
                            else
                            {
                                debug.print("successfully added mentors to MentorSongs");
                                completeCallback(true, {});
                            }
                        });
                    })
                    .catch(error => {
            		    debug.print("Couldn't find role");
            		    debug.print(DISCORD_MENTOR_ROLE);
            		    debug.print(error);
        
                        completeCallback(false, 
                            {'result': "Error",
                             'error': "Failed to get mentor role"
                        });
                    });
                }
            });
        }
        else
        {
            debug.print("Failure deleting MentorSongs");

            completeCallback(false, 
                {'result': "Error",
                 'error': "Failed to delete table MentorSongs"
            });
        }
    });
}

function createMentorsTable(completeCallback)
{
    debug.print("createMentorsTable called");
    
    // Code to create the MentorSongs table
    con.query('SELECT * FROM MentorSongs', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE MentorSongs (discordId CHAR(22) NOT NULL, songCount TINYINT, PRIMARY KEY (discordId));";
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table MentorSongs");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table MentorSongs");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table MentorSongs");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("MentorSongs Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createTiersTable = function(completeCallback)
{
    debug.print("createTiersTable called");
    
    // Code to create the Tiers table
    con.query('SELECT * FROM Tiers', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                var sql = "CREATE TABLE Tiers (discordId CHAR(22) NOT NULL, tier TINYINT, oldTier TINYINT, points DECIMAL(8,4), bonusPoints DECIMAL(6,1), minPlaylistPoints DECIMAL(8,4), minPlaylistName VARCHAR(255), isOnPersonalBreak TINYINT, isNewUser TINYINT, PRIMARY KEY (discordId));";
                
                con.query(sql, function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table Tiers");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table Tiers");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table Tiers");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("Tiers Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

deleteSongOrderForDiscordId = function(access_token, discordId, completeCallback)
{
    //debug.print("deleteSongOrderForDiscordId called");
    
    var deleteSql = "DELETE FROM SpotifyArtistSongOrder WHERE discordId = '" + discordId + "'";
    
    //debug.print(deleteSql);
    
    con.query(deleteSql, function (error, results, fields) {
        if (error)
        {
            debug.print("error deleting from table SpotifyArtistSongOrder Spotify Id:" + spotifyId + ", Discord Id:" + discordId);
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            
            completeCallback(true, {});
        }
    });
}

deleteSongOrderForUser = function(access_token, spotifyData, completeCallback)
{
    //debug.print("deleteSongOrderForUser called");
    //debug.print(spotifyData);
    
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            var discordId = discordIdResults.discordId
            
            var deleteSql = "DELETE FROM SpotifyArtistSongOrder WHERE discordId = '" + discordId + "'";
            
            //debug.print(deleteSql);
            
            con.query(deleteSql, function (error, results, fields) {
                if (error)
                {
                    debug.print("error deleting from table SpotifyArtistSongOrder Spotify Id:" + spotifyId + ", Discord Id:" + discordId);
                    debug.print(error);
                    completeCallback(false, 
                        {'result': "Error",
                         'error': error
                    });
                }
                else
                {
                    
                    completeCallback(true, {});
                }
            });
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': "Couldn't find dicsordId from user spotifyId:" + spotifyData.user_id
            });
        }
    });
}

function writeSongOrderForDiscordId(discordId, spotifyData, completeCallback)
{
    var deleteSql = "DELETE FROM SpotifyArtistSongOrder WHERE discordId = '" + discordId + "'";
    
    //debug.print(deleteSql);
    
    con.query(deleteSql, function (error, results, fields)
    {
        if (error)
        {
            debug.print("error deleting from table SpotifyArtistSongOrder Spotify Id:" + spotifyId + ", Discord Id:" + discordId);
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            var insertSql = "INSERT INTO SpotifyArtistSongOrder (discordId, songPosition, songId) VALUES ?";
            
            //debug.print(insertSql);
    
            var values = [];
            
            for(var i = 0; i < spotifyData.song_list.length; ++i)
            {
                var position = i + 1;
                var array = [discordId, position, spotifyData.song_list[i]];
                values.push(array);
            }
            
            //debug.print(values);
            
            con.query(insertSql, [values], function (error, results, fields)
            {
                if(error)
                {
                    debug.print("error inserting into SpotifyArtistSongOrder table");
                    debug.print(error);
                    completeCallback(false, {});
                }
                else
                {
                    //debug.print("Success inserting into SpotifyArtistSongOrder");
                    completeCallback(true, {});
                }
            });
        }
    });
}

function writeSongOrderForUser(spotifyData, completeCallback)
{
    getDiscordId(spotifyData.user_id, function(success, discordIdResults)
    {
        if(success)
        {
            writeSongOrderForDiscordId(discordIdResults.discordId, spotifyData, function(success, results)
            {
                if(success)
                {
                    completeCallback(true, {});
                }
                else
                {
                    completeCallback(false, 
                        {'result': "Error",
                         'error': "Error calling getDiscordId:" + spotifyData.user_id
                    });
                }
            });
        }
        else
        {
            completeCallback(false, 
                {'result': "Error",
                 'error': "Couldn't find dicsordId from user spotifyId:" + spotifyData.user_id
            });
        }
    });
}

createSongOrderTable = function(completeCallback)
{
    debug.print("createSongOrderTable called");
    
    // Code to create the SpotifyArtistSongOrder table
    con.query('SELECT * FROM SpotifyArtistSongOrder', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE SpotifyArtistSongOrder (discordId CHAR(22) NOT NULL, songPosition SMALLINT UNSIGNED, songId VARCHAR(255) NOT NULL, CONSTRAINT pkSongOrder PRIMARY KEY (discordId, songPosition));', function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table SpotifyArtistSongOrder");
                        debug.print(error);
                        completeCallback(false, 
                        {
                            'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table SpotifyArtistSongOrder");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table SpotifyArtistSongOrder");
                debug.print(error);
                completeCallback(false, 
                {
                    'result': "Error",
                    'error': error
                });
            }
        }
        else
        {
            debug.print("SpotifyArtistSongOrder Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createArtistLinkTable = function(completeCallback)
{
    debug.print("createArtistLinkTable called");
    
    // Code to create the SpotifyArtistLinks table
    con.query('SELECT * FROM SpotifyArtistLinks', function (error, results, fields)
    {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE SpotifyArtistLinks (spotifyId VARCHAR(255) NOT NULL, discordId CHAR(22) NOT NULL, CONSTRAINT pkArtDisc PRIMARY KEY (spotifyId, discordId));', function (error, results, fields)
                {
                    if (error)
                    {
                        debug.print("error creating table SpotifyArtistLinks");
                        debug.print(error);
                        completeCallback(false, 
                        {
                            'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table SpotifyArtistLinks");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table SpotifyArtistLinks");
                debug.print(error);
                completeCallback(false, 
                {
                    'result': "Error",
                    'error': error
                });
            }
        }
        else
        {
            debug.print("SpotifyArtistLinks Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createSpotifyToDiscordTable = function(completeCallback)
{
    debug.print("createSpotifyToDiscordTable called");
    
    // Code to create the SpotifyToDiscord table
    con.query('SELECT * FROM SpotifyToDiscord', function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE SpotifyToDiscord (spotifyId VARCHAR(255) NOT NULL, discordId CHAR(22) NOT NULL, CONSTRAINT pkSpotDisc PRIMARY KEY (spotifyId, discordId));', function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error creating table SpotifyToDiscord");
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table SpotifyToDiscord");
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table SpotifyToDiscord");
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("SpotifyToDiscord Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createBonusPointsTable = function(suffix, completeCallback)
{
    // spotifyId, playlistId, points
    debug.print("createBonusPointsTable called modifier:" + suffix);
    
    // Code to create the Points table
    con.query('SELECT * FROM BonusPoints' + suffix, function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE BonusPoints' + suffix + ' (discordId CHAR(22) NOT NULL, reason VARCHAR(255), points DECIMAL(6,1), timestamp TIMESTAMP(3) NOT NULL);', function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error creating table BonusPoints" + suffix);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table BonusPoints" + suffix);
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table BonusPoints" + suffix);
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("BonusPoints" + suffix + " Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createPointsTable = function(suffix, completeCallback)
{
    // spotifyId, playlistId, points
    debug.print("createPointsTable called modifer:" + suffix);
    
    // Code to create the Points table
    con.query('SELECT * FROM Points' + suffix, function (error, results, fields) {
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE Points' + suffix + ' (spotifyId VARCHAR(255) NOT NULL, playlistId CHAR(22) NOT NULL, points DECIMAL(8,4), timestamp BIGINT UNSIGNED, CONSTRAINT pkPoints PRIMARY KEY (spotifyId, playlistId));', function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error creating table Points" + suffix);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table Points" + suffix);
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table Points" + suffix);
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("Points" + suffix + " Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

createStreamsTable = function(suffix, completeCallback)
{
    debug.print("createStreamsTable called modifer:" + suffix);
    
    // Code to create the Streams table
    con.query('SELECT * FROM Streams' + suffix, function (error, results, fields){
        if (error)
        {
            if(error.code == 'ER_NO_SUCH_TABLE')
            {
                con.query('CREATE TABLE Streams' + suffix + ' (userId VARCHAR(255) NOT NULL, trackId CHAR(22) NOT NULL, playlistId CHAR(22) NOT NULL, timestamp TIMESTAMP(3) NOT NULL, duration MEDIUMINT UNSIGNED NOT NULL, CONSTRAINT pk_Streams PRIMARY KEY (userId, timestamp));', function (error, results, fields) {
                    if (error)
                    {
                        debug.print("error creating table Streams" + suffix);
                        debug.print(error);
                        completeCallback(false, 
                            {'result': "Error",
                             'error': error
                        });
                    }
                    else
                    {
                        debug.print("successfully created table Streams" + suffix);
                        completeCallback(true, {'result': "Success"});
                    }
                });
            }
            else
            {
                debug.print("error accessing table Streams" + suffix);
                debug.print(error);
                completeCallback(false, 
                    {'result': "Error",
                     'error': error
                });
            }
        }
        else
        {
            debug.print("Streams" + suffix + " Table Already Created");
            completeCallback(true, {'result': "Success"});
        }
    });
}

dropTable = function(tableName, completeCallback)
{
    // Code to drop the Streams table
    
    var sql = 'DROP TABLE ' + tableName;
    debug.print('Calling sql:' + sql);
    
    con.query(sql, function (error, results, fields){
        if(error)
        {
            debug.print("error dropping table " + tableName);
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Successfully dropped table " + tableName);
            completeCallback(true, {'result': "Success"});
        }
    });
}

deleteTable = function(tableName, completeCallback)
{
    var deleteSql = "DELETE FROM " + tableName
    debug.print(deleteSql);
    
    con.query(deleteSql, function (error, results, fields) {
        if (error)
        {
            debug.print("Error deleting table " + tableName);
            debug.print(error);
            completeCallback(false, 
                {'result': "Error",
                 'error': error
            });
        }
        else
        {
            debug.print("Success deleting table " + tableName);
            completeCallback(true, {'result': "Success"});
        }
    });
}

discordClient.login(DISCORD_BOT_SECRET_TOKEN);

debug.print('Listening on 8888');
app.listen(8888);