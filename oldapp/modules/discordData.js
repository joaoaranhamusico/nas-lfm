// discordData.js
// ========

module.exports = {
    appData: function() {
	    return {
          appId: "",
          appSecret: "",
          guildId: "757976881369710593"
	    };
    },
    channels: function() {
	    return {
            followId: "875086295737700412",
            followAdminId: "862600668644376576",
            resetAdminId: "989075140778283038",
            accountClaimId: "995657713759572048",
            bonusId: "995657757392916600",
            statsId: "1022851692007538728"
	    };
    },
    roles: function() {
	    return {
            followId: "1272211615663788093",
            betaTesterId: "989075497076015155",
            personalBreakId: "822475411265945671",
            newUserId: "1003579089820590092"
	    };
    },
    tiers: function() {
	    return [
	        {
              // Tier 0
              roleId: "767618504274214923",
              channelId: "989074207222669412",
              minimum: 0,
              realMinimum: 0,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 1
              roleId: "759336125214621746",
              channelId: "948523536383881246",
              minimum: 15,
              realMinimum: 14,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 2
              roleId: "759336121393479681",
              channelId: "963919539014348840",
              minimum: 30,
              realMinimum: 29,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 3
              roleId: "759336119002202162",
              channelId: "963919566835155024",
              minimum: 50,
              realMinimum: 49,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 4
              roleId: "759336115865649162",
              channelId: "963919594664390666",
              minimum: 85,
              realMinimum: 84,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 5
              roleId: "758026092593414225",
              channelId: "963919662154915840",
              minimum: 125,
              realMinimum: 123,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 6
              roleId: "914122914394148875",
              channelId: "989074247714496552",
              minimum: 170,
              realMinimum: 168,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 7
              roleId: "1017534090876043395",
              channelId: "1017534374931079219",
              minimum: 200,
              realMinimum: 197,
              bonusMinimum: 0,
              playlistMinimum: 0
          },
          {
              // Tier 8
              roleId: "1034887291493171240",
              channelId: "1034888358217908276",
              minimum: 250,
              realMinimum: 247,
              bonusMinimum: 19,
              playlistMinimum: 15
          },
          {
			  //mods
              roleId: "757978377893445745",
              channelId: "778511587984146442",
              minimum: 9999,
              realMinimum: 9999,
              bonusMinimum: 9999,
              playlistMinimum: 9999
          }];
    },
    bannedList: function() {
        return[
            "1016259461033242675" //Oghamyst
            ,"1127595909878915122" //Chydy Vibez
            ,"835886644901052436" //Z-lla
            ,"1129736044154208348" //maczyfire
            ,"1174837100525400116" //Hosea Dauda
            ,"1166732467571535933" //kayzeepro
            ,"1170774307245404181" //Emmeo Ogwuche
            ,"1129037662410510416" //Emmyli
            ,"1211007338442522634" //Joel Josh
            ,"1222164262882119823" //Shyas Dogara
            ,"1215598104246751244" //Esther Essien
            ,"1129640936218038323" //Dj PidieQ
            ,"1022228108817989653" //E-Zone
            ,"1015961161973383249" //Cafe the Hustler
            ,"1179834215475466260" //Blaq Santa
            ,"1232059998088073297" //6za
            ,"1171064519313870908" //B!G OOZII
            ,"1136749357274763347" //Jowaive
            ,"1204578432478879804" //Amaka Sing
            ,"1185205949422649378" //MozGospel
            ,"1135733905765449801" //Controversial Success
            ,"947943681237876796" //Dovepunk
            ,"1072250295553376296" //SGM
            ,"1200770698688335942" //MarvinGold
            ];
    }
};