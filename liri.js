require("dotenv").config();
var fs = require("fs");
var moment = require("moment");
var Spotify = require("node-spotify-api");
var keys = require("./keys");
var req = require("request");
var ddg = require("node-ddg-api").DDG;
var Items = require("./items");
var spotify = new Spotify(keys.spotify);
var iCmd ="";
var rQuest = "";
var verbose = process.env.Verbose;

if(verbose === "" || typeof(verbose) == 'undefined')
{
    verbose = true;
}

if(process.argv[2] != null)
{
    iCmd = process.argv[2];
}
if(process.argv[3] != null)
{
    rQuest = process.argv.slice(3).join(" ");
}



function LogToFile(fn = "log.txt",data,vrb = false)
{
    data = `${moment()} \r\n` + data;
    fs.appendFile(fn, data, function(err) {
        if (err)
        {
            console.log(err);
        }
        if(vrb === true)
        {
            console.log(`The data was appended to ${fn}`);
        }
      });
};




function SongSearch(song){
    if(song === "" || typeof(song) == "undefined")
    {
        song = 'The Sign';
    }
    if(verbose)
    {
        var msg = `Searching for song: ${song} \r\n`;
        LogToFile("log.txt",msg,verbose);
    }
    spotify.search({ type: 'track', query: song}, function(err, data) {
        if (err) {
          LogToFile("liri.log",err,verbose);
          return console.log('Error occurred: ' + err);
        }
        var song = new Items.Song(data.tracks.items[0].album.artists[0].name, data.tracks.items[0].name,data.tracks.items[0].preview_url, data.tracks.items[0].album.name)
      
       var opt = `
Artist: ${song.artist}
Track: ${song.name}
Link: ${song.link}
Album: ${song.album}
`;
        console.log(opt);
        LogToFile("log.txt",opt,verbose);
 
      });

}

function BandSearch(band){
    if(band === "" || typeof(band) == "undefined")
    {
        band = 'O.A.R';
    }
    if(verbose)
    {
        var msg = `Searching for band: ${band} \r\n`;
        LogToFile("log.txt",msg,verbose);
    }

    var url = `https://rest.bandsintown.com/artists/${band}/events?app_id=codingbootcamp`
    var iBand = band;
    req(url,function(err, response, rBody) {
        if (err) {
            LogToFile("liri.log",err,verbose);
            return console.log('Error occurred: ' + err);
          }
        var rtn = JSON.parse(rBody);
        var opt = "";
        if(Object.keys(rtn).length > 0)
        {
            var concert = new Items.Concert(rtn[0].lineup.join(','),rtn[0].venue.name,rtn[0].venue.city+","+rtn[0].venue.region,moment(rtn[0].datetime).format("YYYY-MM-DD"))
            opt = `
Artist(s): ${concert.artist}
Venue: ${concert.venue}
Location: ${concert.location}
Date: ${concert.date}
`;
           
                    console.log(opt);
        }
        else
        {
            opt = `There is no concert for ${iBand}`;
            console.log(opt);
        }
        LogToFile("log.txt",opt,verbose);
    });

}

function MovieSearch(movie){
    if(movie === "" || typeof(movie) == "undefined")
    {
        movie = 'Roger Rabbit';
    }
    if(verbose)
    {
        var msg = `Searching for movie: ${movie} \r\n`;
        LogToFile("log.txt",msg,verbose);
    }
    var url = `https://www.omdbapi.com/?apikey=trilogy&t=${movie.trim()}`
    var iMovie = movie;
    req(url,function(err, response, rBody) {
        if (err) {
            LogToFile("liri.log",err,verbose);
            return console.log('Error occurred: ' + err);
          }
        var rtn = [];
        rtn = JSON.parse(rBody);
        var opt = "";
        if(Object.keys(rtn).length > 2)
        {
            var movie = new Items.Movie(rtn.Title,rtn.Year,rtn.Ratings[0].Value,rtn.Country,rtn.Language,rtn.Plot,rtn.Actors);
            opt = `
Title: ${movie.title}
Year: ${movie.productionyear}
IMDB Rating: ${movie.imdb}
Country: ${movie.country}
Language(s): ${movie.language}
Plot: ${movie.plot}
Actor(s): ${movie.actors}
`;
           
                    console.log(opt);
        }
        else
        {
            opt = `There is no movie by the name ${iMovie}`;
            console.log(opt);
        }
        LogToFile("log.txt",opt,verbose);
    });
}

function RandomSearch(){
    fs.readFile('random.txt', "utf8",function (err, data) {
        if (err) {
            LogToFile("liri.log",err + "\r\n",verbose);
            return console.log('Error occurred: ' + err);
        }
        content = data;
        itms = content.split(",");
        if(itms[0] === 'spotify-this-song')
        {
            SongSearch(itms[1]);
        };  
    });
}

function DuckSearch(){
    if(verbose)
    {
        var msg = `Trying DuckDuckGo Instasearch\r\n`;
        LogToFile("log.txt",msg,verbose);
    }
    var iSearch = new ddg('Liribot');
    var superheros = ['superman','batman','spiderman','iron man'];
    var hNum = parseInt(Math.floor((Math.random() * 4)));
    var hero = superheros[hNum];
    iSearch.instantAnswer(hero, {skip_disambig: '0'}, function(err, response) {
        if (err) {
            LogToFile("liri.log",err,verbose);
            return console.log('Error occurred: ' + err);
          }
        var rslt = `${response.RelatedTopics[0].Text}\r\n`;
        console.log(rslt);
        LogToFile("log.txt",rslt,verbose);
      });
}

function Help(){
    console.log(`Please choose the one of the following: 
node liri.js concert-this <band name> 
node liri.js spotify-this-song <song name>
node liri.js movie-this <movie title>
node liri.js do-what-it-says
node liri.js i-feel-lucky`);
}

switch(iCmd.toLowerCase())
{
    case 'concert-this':
        BandSearch(rQuest);
        break;
    case 'spotify-this-song':
        SongSearch(rQuest);
        break;
    case 'movie-this':
        MovieSearch(rQuest);
        break;
    case 'do-what-it-says':
        RandomSearch();
        break;
    case 'i-feel-lucky':
        DuckSearch();
        break;
    case 'help':
        Help();
        break;
    default:
        console.log('Please read help: node liri.js help');
        
}

