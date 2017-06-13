//---------------------------------------
//			****  MUST KEEP  *****
//---------------------------------------
//Necessary objects
{
	{
		console.log('Getting dependencies...');
		var http = require('http');
		var express = require('express');
		var bodyParser = require('body-parser');
		var url = require('url');
		var app = express();

	}

	function addHeader(request, response, next){
		// header portion of web page
		response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('header.html')
		response.write(html)
		next();
	}
	function addFooter(request, response, next){
		var html = fs.readFileSync('footer.html')
		response.write(html)
		next();
	}
	function parseURL(request, response, next){
	    //parse query parameters in URL
		var parseQuery = true; //parseQueryStringIfTrue
	  var slashHost = true; //slashDenoteHostIfTrue
	  urlObj = url.parse(request.url, parseQuery , slashHost );

	  for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x]);
		next();
	}
	function respondToClient(request, response, next){
	    response.end(); //send response to client
		//notice no call to next()
	}
}
//---------------------------------------
//			****** ROOT ******
//---------------------------------------
function root(request, response, next){
	initiateUpdateOfPage(request, response, next)

}


app.use(express.static(__dirname));
app.use(parseURL);
app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true })); //parse body of POST messages
app.use(addHeader);


app.get('/', root);
// app.get('/assignment1-A', assignment1A);
// app.post('/assignment1-A-Solution', assignment1ASolution);
// app.get('/assignment1-B', assignment1B);
// app.post('/assignment1-B-Solution', assignment1BSolution);

app.use(addFooter);
app.use(addFinal);
app.use(respondToClient);



//create http-express server
http.createServer(app).listen(3001);

console.log('Server Running at http://127.0.0.1:3001  CNTL-C to quit');
