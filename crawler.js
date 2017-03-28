// npm install URIjs
// :node crawler http://tw.msn.com/
var fs = require('fs');
var http = require('http');
var URI = require("URIjs");

var urlMap = { };
var urlList = [ ];
var urlIdx = 0;

urlList.push(process.argv[2]); // add first url

crawNext(); // start crawing

function crawNext() { //download next page
    if(urlIdx >= urlList.length)
        return;
    var url = urlList[urlIdx];
    if(url.indexOf('http://')!==0){
        urlIdx++;
        crawNext();
        return;
    }
    console.log('url[%d]=%s',urlIdx,url);
    urlMap[url] = {download:false}; //downlioad
    pageDownload(url, function (data) {
        var page = data.toString();
        urlMap[url].download = true;
        var filename = urlToFileName(url);
        fs.writeFile('data/'+filename, page, function(err){
        });
        var refs = getMatches(page, /\shref\s*=\s*["'#]([^"'#]*)[#";]/gi,1);
        for(i in refs){
            try{
                var refUri=URI(refs[i]).absoluteTo(url).toString();
                console.log('ref=%s',refUri);
                if(refUri !==undefined && urlMap[refUri] === undefined)
                    urlList.push(refUri);
            }catch(e){}
        }
        urlIdx++;
        crawNext();
    });
};

// download webpage
function pageDownload(url,callback) {
    http.get(url,function(res){
        res.on('data',callback);
    }).on('error',function(e){
        console.log("Got error: "+e.message);
    });
}

// compare regular expression
function getMatches(string, regex, index){
    index || (index =1); //default to the first capture
    var matches = [];
    var match;
    while(match = regex.exec(string)){
        matches.push(match[index]);
    }
    return matches;
}

// urlname replace to valid filename
function urlToFileName(url){
    return url.replace(/[^\w]/gi, '_');
}