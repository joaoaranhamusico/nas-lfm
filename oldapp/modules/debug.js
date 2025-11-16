// debug.js
// ========

var debug_print_enabled = true;

module.exports = {
    initialize: function(enabled) {
        debug_print_enabled = enabled;
    },
    print: function(text) {
        debug_print(text);
    },
    idListToString: function(idList){
        return idListToString(idList);
    }
};

var debug_print = function(text)
{
    if(debug_print_enabled)
    {
        var d = new Date(Date.now());
        
        var minutes = "" + d.getMinutes();
        if(d.getMinutes() < 10)
        {
            minutes = "0" + d.getMinutes();
        }
        
        var seconds = "" + d.getSeconds();
        if(d.getSeconds() < 10)
        {
            seconds = "0" + d.getSeconds();
        }
        
    	console.log("[" + (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + "-" + d.getHours() + ":" + minutes + ":" + seconds + ":" + d.getMilliseconds() + "] " + text);
    	
    	if(typeof text != "string")
    	{
    	    console.log(text);
    	}
    }
}

var printOutSongList = function(songs)
{
	debug.print("printOutSongList:" + songs.length);
	for(i = 0; i < songs.length; ++i)
	{
		debug.print(songs[i]);
	}
}

var idListToString = function(songs)
{
	var text = "";
	
	for(i = 0; i < songs.length; ++i)
	{
		if(i < (songs.length - 1))
		{
			text += songs[i] + ",";
		}
		else
		{
			text += songs[i];
		}
	}
	
	return text;
}