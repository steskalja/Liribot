function song(a,sn,lnk,al){
    this.artist = a;
    this.name = sn;
    this.link = lnk;
    this.album = al;
}

function concert(a,v,l,d)
{
    this.artist = a;
    this.venue =v;
    this.location =l;
    this.date = d

}

function movie(t,yr,ir,c,l,p,a)
{
    this.title = t;
    this.productionyear = yr;
    this.imdb =ir;
    this.country =c;
    this.language = l;
    this.plot = p;
    this.actors = a; 
}

module.exports = {
    Song: song,
    Concert: concert,
    Movie: movie
}