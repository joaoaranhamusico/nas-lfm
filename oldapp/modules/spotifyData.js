// spotifyData.js
// ========

module.exports = {
    appData: function() {
	    return {
            clientId: "",
            clientSecret: ""
	    };
    },
    allowLists: function() {
	    return {
            dev: ["dgatley", "dgatatea"],
            reset: ["dgatley", "dgatatea" // Coastal Town
                ,"edeagle89" // Ed Eagle
                ,"1v9xcepn2r2115hs59wqtbwkt", "yquiwfd4mbc309fx3kgderklp" // Sovrin
                ,"hu6ucpafb8fb0ioh35vq2n9nu", "dyl9okqw6mqogvbs462oirwyn", "mamw525zgozxtr77eddhtqegp" // Mercury Teardrop
                ,"31ehtgeh7hmnqxqp3zvn26lbs63a", "6scebfjetbbx4tqz0ogfwz00g", "y8a2jhxymuavj4v31joz7u33n" // J.H.M
                ,"erj5ip6y3w3btw2sj4gputs05", "glb3vyhyk5jdyaztuom0kl7wl", "jpfcko4gqm9e8y2smrj7uulvh", "xcobz8enuwbmcwmx0c8enrjru" // Joao Aranha
                ,"31e7bhyzzsm3htyyej5puewchvya" // NAS Music Manager
                ,"11133897778","31hawnidu6qa6446oatdqzhbahgu","31ruoj46sm7u7oal3iscmvyr5rhm","3146vg5v4ctsmw77wr5m6yyaej6q","31sn3yr2fnpod2nm6apipdd4c4qq","31pyfot5yxnn5e5jjbbej4mve6cu","31f4nvsbbvyx6k2lgn3aehyqmjy4","31uhvu52qgbo6h3brtkh4cnprkeu","31seiov657gqllca7eozo253mk3i","31sutlunkpq7f3ljdr5rtvluica4" // TheDamnedKirai
            ],
            admin: ["dgatley", "dgatatea" // Coastal Town
                ,"1v9xcepn2r2115hs59wqtbwkt", "yquiwfd4mbc309fx3kgderklp" // Sovrin
                ,"31ehtgeh7hmnqxqp3zvn26lbs63a", "6scebfjetbbx4tqz0ogfwz00g", "y8a2jhxymuavj4v31joz7u33n" // J.H.M
                ,"erj5ip6y3w3btw2sj4gputs05", "glb3vyhyk5jdyaztuom0kl7wl", "jpfcko4gqm9e8y2smrj7uulvh", "xcobz8enuwbmcwmx0c8enrjru" // Joao Aranha
                ,"11133897778","31hawnidu6qa6446oatdqzhbahgu","31ruoj46sm7u7oal3iscmvyr5rhm","3146vg5v4ctsmw77wr5m6yyaej6q","31sn3yr2fnpod2nm6apipdd4c4qq","31pyfot5yxnn5e5jjbbej4mve6cu","31f4nvsbbvyx6k2lgn3aehyqmjy4","31uhvu52qgbo6h3brtkh4cnprkeu","31seiov657gqllca7eozo253mk3i","31sutlunkpq7f3ljdr5rtvluica4" // TheDamnedKirai
                ,"1227170590" // Oddzo
                ,"7rpkat060ekr6qt0lpobce42m", "bta62ow4wvpqii28thk0579fv" // Blues Trainer
            ],
            mods: ["dgatley", "dgatatea" // Coastal Town
                ,"aa69eo8dzybng8f15q7s3clxw", "fqzw3g1d88l6ooyzfyu9bva4v", "geres6zb1rmbj1m8djwf9aje2", "o81zwc5wyaiedy9k6lio1d3fr", "31dlzie56zha7bb7hsw2bpva4cke" // Dorian Whisper
                ,"590rt1yqw9macg2afbjaclnvq" // iconDark
                ,"h0jaxey27o0qppu85s7kv82l1", "mdxttjhl2px8pvceseuckgxap", "naf7ioihv3rit474o5bkiish1", "rw9vm2fc5g5k8h3krv6kdlxi9" // Panem
                ,"31pqvo6jksv4gozv7mjrjzkf4iki", "karlman7272", "l0a23mgkwjjviaicbp9lhjjss", "vdhwecz1dftfq992izqcfqfqp", "31pouykhwmujndgtxcndvnc7gvae" // Proyecto Auricular
                ,"31ehtgeh7hmnqxqp3zvn26lbs63a", "6scebfjetbbx4tqz0ogfwz00g", "y8a2jhxymuavj4v31joz7u33n" // J.H.M
                ,"edeagle89" // Ed Eagle
                ,"31m5uka3azuejx3rptsvbsjd4zpe" // Srv
                ,"2167acf5x7ilmkdrbwilnfguq", "e19m1oo841eobp6qomowfhszb", "iwl903plq8v9jt24bvt2fu7rx", "sqawqxq5jrjnpn0dcopi8fy5b" // Bad Scullianz
                ,"wilkolad", "ix77iocbl8elslbfvcq075j4t" // Wilko Wilkes
                ,"chazhands" // Charles Connolly
                ,"11121525421" // Andres Guazzelli
                ,"7rpkat060ekr6qt0lpobce42m", "bta62ow4wvpqii28thk0579fv" // Blues Trainer
                ,"11133897778","31hawnidu6qa6446oatdqzhbahgu","31ruoj46sm7u7oal3iscmvyr5rhm","3146vg5v4ctsmw77wr5m6yyaej6q","31sn3yr2fnpod2nm6apipdd4c4qq","31pyfot5yxnn5e5jjbbej4mve6cu","31f4nvsbbvyx6k2lgn3aehyqmjy4","31uhvu52qgbo6h3brtkh4cnprkeu","31seiov657gqllca7eozo253mk3i","31sutlunkpq7f3ljdr5rtvluica4" // TheDamnedKirai
                ,"1235736658" // Rod Fritz
                ,"11124725062" // The Blindfold Experience
                ,"1v9xcepn2r2115hs59wqtbwkt", "yquiwfd4mbc309fx3kgderklp" // Sovrin
                ,"olp4nsu4p162ohborpdtf0kdo", "bexucty6qkdzgoo74h75v9p05" // Daniel Tidwell
                ,"hu6ucpafb8fb0ioh35vq2n9nu", "dyl9okqw6mqogvbs462oirwyn", "mamw525zgozxtr77eddhtqegp" // Mercury Teardrop
                ,"12171219134" // Ancient Machine
                ,"1240689354", "dweiga3letdu6m673j4527pai" // Motion Sickness
                ,"1289660044" // Origin Crxss
                ,"o0yv7pxjy2bze26cq2kqru0lf" // Plummy
                ,"9t19h5vk7lx8x5pwejuvebsrq" // Tom Duggan
                ,"1227170590" // Oddzo
                ,"mn76su2rzp2rmkdw73icdn6uv" // Deblocka
                ,"8an29gn2p39o7pyzqraw5yxj1", "31zlemeloyye5xsez6ajw5l4s5au" // Elion Melody
                ,"mrvh0ifwgfflamzzo5qfkokqo" // Valentine Joyce
                ,"slukzd22ae1vcqtjhn8tgqd9y" // Ya
                ,"mw3brs12m85c9wb3g7l4cyn9q", "wlau2rly2z48ngbcmdu50o5id", "7ie4ppeaqlbuxld8nj6ydoleu" // SmoothSaylin
                ,"erj5ip6y3w3btw2sj4gputs05", "glb3vyhyk5jdyaztuom0kl7wl", "jpfcko4gqm9e8y2smrj7uulvh", "xcobz8enuwbmcwmx0c8enrjru" // Joao Aranha
                ,"8yshig1po0qiyqcvtkidou6rh", "lvokmozodh2az40aao5aybsgx", "312rcz2rbmyxe5mwwshtorez7aoy", "316ywj2lx7a5pnlcmprgmzr53wza", "31z73jj3wnhthvzatndm23syz52e" // Brent Thompson
                ,"313ofy4w4xcbpawc5a3skdrqhdsy" ,"31npwmxhodwhebjr4tiqz5famltq" ,"31nzcwvoxybgfcf46hdxrdv3l3ey" ,"31p7qypz5hye4z3u3utdvfjfzfq4" ,"mikking" ,"xmbkycqpqzyaisk2aq68liezt" // MIK's Reaction
                ,"1218447149" ,"31age2kzhccveh5ufi7nrztrgqsq" ,"31cdxym65ouqwnhmz77puzjbfm4a" ,"31y6dbsvlo2w2zh67kncldqkias4" ,"6966frmp" ,"9qxakduv2wnby32yrst92ffel" // Rich Allen
                ,"a0ryn8jd8m71c7g8thf64yybq" ,"bass6966" ,"fbo2m9kf11yjxui9cugweolzd" ,"mdcj2vu0ndvd83g61mhbumbv7" ,"sujp3bjjy25jfd9kdw84y2m2z" ,"zpv4n7a8193d7vx35ojgef8j3" // Rich Allen
                ,"kele-ca" // Kele Fleming
                ,"dhminv6y8x97cf9qvli0i1twu","31aj53rroms7chczbtm3hgxbamfq","31f72dkutzh5zakxvvri2ffd3jdi","31hkikcpu7lijrto6bbaof5ge4pq","31pkmjndnbe3pxxf3fkp7nabmlvq","31tffwyuk2wl7hcs65meho63b4ta" // Lofthouse Leo
                ,"5ehan0ovtuhdghuubye76tqej" // Oghamyst
            ]
        };
    },
    playlists: function() {
	    return {
          superListId: "0YLmgRzOwGcphmgoGVdNgT",
          // allLists are all the lists that we follow in the follow proof
          allLists: [{
              id: "6yhlfgfyJpX3iU9BnR8gZy",
              name: "NAS"
          },{
              id: "0VqwRBeuRYOWLtufrmHGPe",
              name: "NAS Pro"
          },{
              id: "4TnPBSygu7P9T37sGlG4dK",
              name: "NAS All-Stars"
          },{
              id: "0Je8eI5nA2urH9DZaoNTtb",
              name: "NAS Elite"
          },{
              id: "3GvEOS5i1x9dSdCDcGtNWO",
              name: "Rap / Hip Hop"
          },{
              id: "6SMcnV50sICphq8Sfwhu0O",
              name: "R&B"
          },{
              id: "1PsZVS3yROpgoE3XGFryRL",
              name: "Rock Essentials"
          },{
              id: "43Kiaj87HTrY1f0WjJpWn3",
              name: "Skate Punk / Pop Punk"
          },{
              id: "2Nn56N8ZAMts8onFAeQd4Y",
              name: "Baroquestep"
          },{
              id: "3TOfq7nnlNzVpSMzDUBbfg",
              name: "Gaming EDM"
          },{
              id: "1OFdqLLWvibltjB8OHh71J",
              name: "Happy Gaming"
          },{
              id: "0JtV0kadCvO3mvWWcgI2Wq",
              name: "Latin"
          },{
              id: "1rB4cvOiMt6FoEB0SCsrwE",
              name: "Indie Canada"
          },{
              id: "5PhgE9sJ8iMy5umT8xYbio",
              name: "Philippines"
          },{
              id: "5C3rh11f7pRux4SyKyC7VI",
              name: "NAS 101 Classic"
          },{
              id: "5miRtbw3FxRZmG3h1SCK37",
              name: "NAS Christmas & Holiday"
          },{
              id: "3sqzDcSohk750bulZcaP2t",
              name: "NAS Super hits"
          },{
              id: "0AmvAzbsmG9aVsY0E3lvm2",
              name: "Blues Rock Guitar Legends"
          },{
              id: "6kwSIJFgsKbNpaZznAFvM0",
              name: "NAS: Songsmith"
          },{
              id: "3RHmozCJ12Wx1WP8vXfCxp",
              name: "NAS House and Electro"
          },{
              id: "0sx6blELRGTGURKlzuZwRM",
              name: "Indie Women"
          },{
              id: "1EV16Hlt8kxOibHckkXw6P",
              name: "Heavy Metal"
          },{
              id: "0ZJeCY2qJnaL5v40ars0Xv",
              name: "Pirate Dubstep"
          },{
              id: "0RVQ5kzfeHqbZOHgI64d12",
              name: "NAS Great Vibes"
          },{
              id: "5rGdPsNB4IwF2DF85OqxCk",
              name: "NAS 101"
          },{
              id: "6KgbGAX4xZrdLeYu1e0ToT",
              name: "Canadian Cottage Favourites"
          },{
              id: "6Eqkm609p201XST47xFK8j",
              name: "NAS 102"
          },{
              id: "6u0hdblgbot1WD6HoGolce",
              name: "Superstars"
          },{
              id: "6VxY1LeCP8UfRcK0zdmDl4",
              name: "NAS Legends"
          },{
              id: "7LOm8NkWnpPYIZJnspAnFB",
              name: "NAS Top 20"
          },{
              id: "68wzT0iDgOKGCthyu99JQU",
              name: "Ultimate Gaming Playlist"
          },{
              id: "523TYy7xI9YRUJK6zDHRLz",
              name: "Gangster Rap"
          },{
              id: "6VVOgYMKyz0MnfuoRBBf14",
              name: "Hip Hop / Trap"
          },{
              id: "5u0v6tcohIcEeYX5N9U0es",
              name: "Best New Indie Music"
          },{
              id: "7Fgj5xQqRAGaNSdujqqb4Y",
              name: "NAS Folk and Country"
          },{
              id: "1FeT3MCSX2Tnond5eLuw9N",
              name: "NAS Acoustic, Ambient and Instrumental"
          },{
              id: "0FY8tzsor307tMATT2JoMy",
              name: "NAS Indie & Alternative"
          },{
              id: "3FrC5afdgnsH5VtfidSw2W",
              name: "NAS Love"
          },{
              id: "19tc9SLtbhx0OiOxRCbDEW",
              name: "Connolly's Corner"
          },{
              id: "2Gzzle5I4JxfotFYpwhuzg",
              name: "NAS Afro"
          },{
              id: "5HQXmV6b8YP5mN852Cx3ER",
              name: "NAS Hip Hop / Rap"
          },{
              id: "4DqS3q8h8ubosGFtcgArNF",
              name: "NAS Pop"
          },{
              id: "4Rvc7y6rZ2d6afhSOWzsC9",
              name: "NAS Classical, Piano & New Age"
          },{
              id: "6pUo5Yekpi89jNpJ4hDcqz",
              name: "New NAS 101"
          },{
              id: "7aJOhDOlQVCITOCnV7XWpZ",
              name: "New NAS"
          },{
              id: "5TCao2OVhZGrShZM2zsMLq",
              name: "New Pro"
          },{
              id: "1agpv6FCGMrvhw27myRJ1s",
              name: "New All-Star"
          },{
              id: "0VU5Mk2VKp80eBK8iB7ROZ",
              name: "New Superstar"
          },{
              id: "7EYdQbtIwnVFUbIOOva0HI",
              name: "New Elite"
          },{
              id: "0QmeNTNpmXCMYMnfUElIqb",
              name: "New Legends"
          }
          ],
          // mainLists are all the lists that give points
          mainLists: [{
              id: "5C3rh11f7pRux4SyKyC7VI",
              name: "NAS 101 Classic"
          },{
              id: "6yhlfgfyJpX3iU9BnR8gZy",
              name: "Old NAS"
          },{
              id: "0VqwRBeuRYOWLtufrmHGPe",
              name: "Old NAS Pro"
          },{
              id: "4TnPBSygu7P9T37sGlG4dK",
              name: "Old NAS All-Stars"
          },{
              id: "6u0hdblgbot1WD6HoGolce",
              name: "Old NAS Superstars"
          },{
              id: "0Je8eI5nA2urH9DZaoNTtb",
              name: "Old NAS Elite"
          },{
              id: "6VxY1LeCP8UfRcK0zdmDl4",
              name: "Old NAS Legends"
          },{
              id: "5rGdPsNB4IwF2DF85OqxCk",
              name: "Old NAS 101"
          },{
              id: "6Eqkm609p201XST47xFK8j",
              name: "NAS V 2.0"
          },{
              id: "5u0v6tcohIcEeYX5N9U0es",
              name: "Best New Indie Music"
          },{
              id: "7LOm8NkWnpPYIZJnspAnFB",
              name: "NAS Superstars V 2.0"
          },{
              id: "74EhVOwEwblBUvJnw5uT89",
              name: "NAS Elite V 2.0"
          },{
              id: "3sqzDcSohk750bulZcaP2t",
              name: "NAS Super Hits"
          },{
              id: "590KzVyuYffcaAVU64pqvL",
              name: "Other NAS"
          },{
              id: "4lNAKD2xL9MzRddDLADNfU",
              name: "Other NAS"
          },{
              id: "7a1zYBkER4pDHqDvcu8VJl",
              name: "Other NAS"
          },{
              id: "5wf3DV6Imb8PynUgPAuuKf",
              name: "Other NAS"
          },{
              id: "72E5CBiMSjytzjyBFqqiQx",
              name: "Elite Mirror"
          },{
              id: "6pUo5Yekpi89jNpJ4hDcqz",
              name: "NAS 101"
          },{
              id: "7aJOhDOlQVCITOCnV7XWpZ",
              name: "NAS"
          },{
              id: "5TCao2OVhZGrShZM2zsMLq",
              name: "Pro"
          },{
              id: "1agpv6FCGMrvhw27myRJ1s",
              name: "All-Star"
          },{
              id: "0VU5Mk2VKp80eBK8iB7ROZ",
              name: "Superstar"
          },{
              id: "7EYdQbtIwnVFUbIOOva0HI",
              name: "Elite"
          },{
              id: "0QmeNTNpmXCMYMnfUElIqb",
              name: "Legends"
          }
          ],
          // officialLists are lists that are required to meet the minimum streams per list
          officialLists: [
            /*{
              id: "6pUo5Yekpi89jNpJ4hDcqz",
              name: "NAS 101"
          },*/
          {
              id: "7aJOhDOlQVCITOCnV7XWpZ",
              name: "NAS"
          },{
              id: "5TCao2OVhZGrShZM2zsMLq",
              name: "NAS Pro"
          },{
              id: "1agpv6FCGMrvhw27myRJ1s",
              name: "NAS All-Stars"
          },{
              id: "0VU5Mk2VKp80eBK8iB7ROZ",
              name: "NAS Superstars"
          },{
              id: "7EYdQbtIwnVFUbIOOva0HI",
              name: "NAS Elite"
          },{
              id: "0QmeNTNpmXCMYMnfUElIqb",
              name: "NAS Legends"
          }],
          // editLists are the lists that are edited / updated in the playlist manager
          editLists: [
          {
              officialId: "6pUo5Yekpi89jNpJ4hDcqz", //https://open.spotify.com/playlist/6pUo5Yekpi89jNpJ4hDcqz
              id: "5OO2icJZ9jHIl5ZTWiuSBF", //https://open.spotify.com/playlist/5OO2icJZ9jHIl5ZTWiuSBF
              backupId: "6vNqW0UkfWOCTxG5c4rtED", //https://open.spotify.com/playlist/6vNqW0UkfWOCTxG5c4rtED
              stage1Id: "6EEu3EAWyU1aMk0RHwQNMN", //https://open.spotify.com/playlist/6EEu3EAWyU1aMk0RHwQNMN
              stage2Id: "39vWEqww8WSVqHrBxKM3sP", //https://open.spotify.com/playlist/39vWEqww8WSVqHrBxKM3sP
              name: "NAS 101",
              tag: "101"
          },{
              officialId: "7aJOhDOlQVCITOCnV7XWpZ", //https://open.spotify.com/playlist/7aJOhDOlQVCITOCnV7XWpZ
              id: "3qdH1GmobjJidsXVTY1DEo", //https://open.spotify.com/playlist/3qdH1GmobjJidsXVTY1DEo
              backupId: "07wNDF4QJN146xQ0ebSSTE", //https://open.spotify.com/playlist/07wNDF4QJN146xQ0ebSSTE
              stage1Id: "3fE9lVhpPtQY3uTWA9r36w", //https://open.spotify.com/playlist/3fE9lVhpPtQY3uTWA9r36w
              stage2Id: "0hSCpuv5Vba7CvLcD1LVUy", //https://open.spotify.com/playlist/0hSCpuv5Vba7CvLcD1LVUy
              name: "NAS",
              tag: "NAS"
          },{
              officialId: "5TCao2OVhZGrShZM2zsMLq", //https://open.spotify.com/playlist/5TCao2OVhZGrShZM2zsMLq
              id: "4xv8pXVkRq0X6TEhviNOy9", //https://open.spotify.com/playlist/4xv8pXVkRq0X6TEhviNOy9
              backupId: "7G5dlxORyvp6Tr0siHPQqL", //https://open.spotify.com/playlist/7G5dlxORyvp6Tr0siHPQqL
              stage1Id: "5QuuoWdUZVqIZVvBsmfxEd", //https://open.spotify.com/playlist/5QuuoWdUZVqIZVvBsmfxEd
              stage2Id: "6KQxR1bAgAGoBplRKw231g", //https://open.spotify.com/playlist/6KQxR1bAgAGoBplRKw231g
              name: "NAS Pro",
              tag: "Pro"
          },{
              officialId: "1agpv6FCGMrvhw27myRJ1s", //https://open.spotify.com/playlist/1agpv6FCGMrvhw27myRJ1s
              id: "2YFu5JZ3n9fttoJd6PVdcU", //https://open.spotify.com/playlist/2YFu5JZ3n9fttoJd6PVdcU
              backupId: "4nGR5j8zgLsAt0ongMOBZo", //https://open.spotify.com/playlist/4nGR5j8zgLsAt0ongMOBZo
              stage1Id: "7K56FcFMjhcX3pafVcA5gE", //https://open.spotify.com/playlist/7K56FcFMjhcX3pafVcA5gE
              stage2Id: "5afhSYexoz2XHdWI6Az6jl", //https://open.spotify.com/playlist/5afhSYexoz2XHdWI6Az6jl
              name: "NAS All-Stars",
              tag: "Allstars"
          },{
              officialId: "0VU5Mk2VKp80eBK8iB7ROZ", //https://open.spotify.com/playlist/0VU5Mk2VKp80eBK8iB7ROZ
              id: "3XGNzegWa4OpmEq3IHnmTs", //https://open.spotify.com/playlist/3XGNzegWa4OpmEq3IHnmTs
              backupId: "4l5fQS0o5vaD46xiX7KDMW", //https://open.spotify.com/playlist/4l5fQS0o5vaD46xiX7KDMW
              stage1Id: "7mja2Oc44FoxvGkN65GLMw", //https://open.spotify.com/playlist/7mja2Oc44FoxvGkN65GLMw
              stage2Id: "7rYynZtycXd21NvMTom9Hi", //https://open.spotify.com/playlist/7rYynZtycXd21NvMTom9Hi
              name: "NAS Superstars",
              tag: "Superstars"
          },{
              officialId: "7EYdQbtIwnVFUbIOOva0HI", //https://open.spotify.com/playlist/7EYdQbtIwnVFUbIOOva0HI
              id: "29Ek15jMCN4d4Lb9iy8yqJ", //https://open.spotify.com/playlist/29Ek15jMCN4d4Lb9iy8yqJ
              backupId: "0moCVbfILBdoKEfNAXxEx1", //https://open.spotify.com/playlist/0moCVbfILBdoKEfNAXxEx1
              stage1Id: "5MRClSqdF0xBPYqa8sykZx", //https://open.spotify.com/playlist/5MRClSqdF0xBPYqa8sykZx
              stage2Id: "0DzNBlRDw0GkEVer0KzqoS", //https://open.spotify.com/playlist/0DzNBlRDw0GkEVer0KzqoS
              name: "NAS Elite",
              tag: "Elite"
          },{
              officialId: "0QmeNTNpmXCMYMnfUElIqb", //https://open.spotify.com/playlist/0QmeNTNpmXCMYMnfUElIqb
              id: "176qu0tUgPLH09YTH47inp", //https://open.spotify.com/playlist/176qu0tUgPLH09YTH47inp
              backupId: "5XMmtWwW19uKjb2F94hxPw", //https://open.spotify.com/playlist/5XMmtWwW19uKjb2F94hxPw
              stage1Id: "5unwyTS0KlqytcG6wD60fr", //https://open.spotify.com/playlist/5unwyTS0KlqytcG6wD60fr
              stage2Id: "35QGZIPaMyWQ2HiiOpP8jU", //https://open.spotify.com/playlist/35QGZIPaMyWQ2HiiOpP8jU
              name: "NAS Legends",
              tag: "Legends"
          }]
        };
    },
    stageUserIds: function(){
        return {
            firstUserId: "dgatatea",
            secondUserId:"31e7bhyzzsm3htyyej5puewchvya"
        };
    },
    limits: function() {
	    return {
            weekly: 100
	    };
    }
};