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
		var app = express(); //create express middleware dispatcher
		var urlObj; //we will parse user GET URL's into this object
		var shopifyAPI = require('shopify-node-api');
		var util = require('util')
		var fs = require('fs')
		var dateFormat = require('dateformat');

		var Shopify = new shopifyAPI({
		  shop: 'shopicruit', // MYSHOP.myshopify.com
		  access_token: 'c32313df0d0ef512ca64d5b336a0d7c6' // Your API password
		});

		// Source - http://stackoverflow.com/questions/149055/how-can-i-format-numbers-as-money-in-javascript
		Number.prototype.formatMoney = function(c, d, t){
		  var n = this,
		  c = isNaN(c = Math.abs(c)) ? 2 : c,
		  d = d == undefined ? "." : d,
		  t = t == undefined ? "," : t,
		  s = n < 0 ? "-" : "",
		  i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
		  j = (j = i.length) > 3 ? j % 3 : 0;
		 return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
		};
	}

	var ordersPerPage = 250; // max allowed currently is 250

  // Chart item used for visualization.
  // This declared universally allows for updating the visualization.
  var myChart;

	// get line items and add to jsonObject below
	var allObjects = {};
	allObjects["product"] = {};
	allObjects["city"] = {};
	allObjects["province"] = {};
	allObjects["country"] = {};
	// stats being captured
	var total_price = 0;
	var subtotal_price = 0;
	var total_tax = 0;
	var total_discounts = 0;
	var total_price_usd = 0;
	var total_orders = 0;
	var fromDate = new Date();
	var toDate = new Date();

	function resetValues(){
		// get line items and add to jsonObject below
	  allObjects["product"] = {};
	  allObjects["city"] = {};
	  allObjects["province"] = {};
	  allObjects["country"] = {};
		// stats being captured
	  total_price = 0;
	  subtotal_price = 0;
	  total_tax = 0;
	  total_discounts = 0;
	  total_price_usd = 0;
	  total_orders = 0;
		fromDate = new Date();
		toDate = new Date();
	}
	function addHeader(request, response, next){
		// header portion of web page
		response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('header.html')
		response.write(html)
		next();
	}
	function addBody(){
		// header portion of web page
		// response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('body.html')
		return html;
	}
	function addVisualization(){
		// header portion of web page
		// response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('visualization.html')
		return html;
	}
	function addFooter(request, response, next){
		var html = fs.readFileSync('footer.html')
		response.write(html)
		next();
	}
	function addFinal(request, response, next){
		// header portion of web page
		// response.writeHead(200, {'Content-Type': 'text/html'});
		var html = fs.readFileSync('final.html')
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
{
	function root(request, response, next){
		// Shopify.get('/admin/products.json', function(err, data, headers){
		//   console.log(data); // Data contains product json information
		//   console.log(headers); // Headers returned from request
		// });
		resetValues();
		response.write(addBody())
		response.write(addVisualization())
		console.log("In root")
		initiateUpdateOfPage(request, response, next)
	}

	// Find how many orders exist and call ordersToObject with the order count
	function initiateUpdateOfPage(request, response, next){
	  var countOfOrders = null;
	  Shopify.get('/admin/orders/count.json', function(err, data ,headers) {
			console.log("Inside get");
			console.log("data: " + data)
			// console.log("err: " + err)
			// console.log("headers: " + headers)
			if(err || data["errors"] ){
				// redirect to help.html\
				console.log("Redirecting from initiateUpdateOfPage")
				initiateUpdateOfPage()
				console.log('redirect to help.html');
			}else{
				console.log("Count call completed ")
				countOfOrders = data["count"]
				console.log(util.inspect(data, false, null))
	      // console.log('Order count: ' + countOfOrders)
	      ordersToObject(request, response, next, countOfOrders); // Control transferred
			}
	  })
	}

	// Finds out  number of pages of orders that need to be accessed from the Shopify API
	function ordersToObject(request, response, next, theseManyOrders){
	  var totalPages = Math.ceil(theseManyOrders/ordersPerPage);
		console.log("total pages: " + totalPages)
	  var allOrdersArray = [];
	  var completed = 0;

	  // iterate over number of pages
	  for(var pageNum = 1; pageNum <= totalPages; pageNum++){
	    // generate link for pageNum-th JSON page
	    var thisPageAddress = '/admin/orders.json?&page='+pageNum+'&limit='+ordersPerPage
	    // and get the JSON
	    Shopify.get(thisPageAddress, function(err, data, header) {
				console.log("Inside get");
				console.log("data: " + util.inspect(data, false, null))
				console.log("err: " + util.inspect(err, false, null))
				// console.log("headers: " + headers)
				if(err || data["errors"] ){
					// redirect to help.html
					console.log("redirecting from ordersToObject")
					ordersToObject(theseManyOrders)
					console.log('redirect to help.html');
				}else{

					// counter to make sure all pages downloaded
					allOrdersArray.push.apply(allOrdersArray, data["orders"])
					// console.log(allOrdersArray)
					completed++
		      if(completed == totalPages){
	        	// last page's download has been completed
	        	getStatsFromOrders(request, response, next, allOrdersArray)  // Control transferred
					}

				}
	    })
	  }
	}

	// iterate over each order, pull information needed out of it and store it in arrays declared above
	function getStatsFromOrders(request, response, next, orders){
	  total_orders = orders.length;

	  // Iterate over all orders
	  for(var currOrder = 0; currOrder < orders.length; currOrder++){

			if(new Date(orders[currOrder]["processed_at"]) < fromDate) fromDate = orders[currOrder]["processed_at"];

	    total_price += parseFloat(orders[currOrder]["total_price"])
	    total_price_usd += parseFloat(orders[currOrder]["total_price_usd"])

	    // getting line items
	    for(var itemNum = 0; itemNum < orders[currOrder]["line_items"].length; itemNum++){
	      // Current Item's values
	      var currQuantity = parseInt(orders[currOrder]["line_items"][itemNum]["quantity"])
	      var currName = orders[currOrder]["line_items"][itemNum]["name"]
	      var currRevenue = (currQuantity*parseFloat(orders[currOrder]["line_items"][itemNum]["price"])) - parseFloat(orders[currOrder]["line_items"][itemNum]["total_discount"])
	      var currCity = orders[currOrder]["shipping_address"]["city"]
	      var currProvince = orders[currOrder]["shipping_address"]["province"]
	      var currCountry = orders[currOrder]["shipping_address"]["country"]


	      var selection = [["product",currName],["city",currCity],["province",currProvince],["country",currCountry]]
	      if(currQuantity > 0){
	        // console.log(currName + " : " + currCity  + " : " + currProvince  + " : " + currCountry)
	        for(i in selection){
	          // console.log(selection[i])
	          if(allObjects[selection[i][0]][selection[i][1]]){
	            var previousQuantity = allObjects[selection[i][0]][selection[i][1]]["quantity"]
	            var previousRevenue = allObjects[selection[i][0]][selection[i][1]]["revenue"]
	            var previousCount = allObjects[selection[i][0]][selection[i][1]]["count"]
	            var previousAvgRevenue = allObjects[selection[i][0]][selection[i][1]]["avgRev"]

	            allObjects[selection[i][0]][selection[i][1]]["quantity"] = previousQuantity+currQuantity
	            allObjects[selection[i][0]][selection[i][1]]["revenue"] = previousRevenue+currRevenue
	            allObjects[selection[i][0]][selection[i][1]]["count"] = previousCount+1
	            allObjects[selection[i][0]][selection[i][1]]["avgRev"] = parseInt((allObjects[selection[i][0]][selection[i][1]]["revenue"]/allObjects[selection[i][0]][selection[i][1]]["count"]).formatMoney(2))
	          }else{
	            allObjects[selection[i][0]][selection[i][1]] = {}
	            allObjects[selection[i][0]][selection[i][1]]["quantity"] = currQuantity
	            allObjects[selection[i][0]][selection[i][1]]["revenue"] = parseInt(currRevenue.formatMoney(2))
	            allObjects[selection[i][0]][selection[i][1]]["count"] = 1
	            allObjects[selection[i][0]][selection[i][1]]["avgRev"] = allObjects[selection[i][0]][selection[i][1]]["revenue"]
	          }
	        }
	      }
	    }
	  }


	  var average_revenue = total_price/total_orders
	  // console.log(allObjects)
		// console.log(fromDate)
		// console.log(toDate)

	  // update quantities on page
	  // document.getElementById("totalRevenue").innerHTML = '$ '+total_price.formatMoney(2) + ' CAD';
	  // document.getElementById("avgRevenue").innerHTML = '$ '+average_revenue.formatMoney(2) + ' CAD';
	  // document.getElementById("usdRevenue").innerHTML = '$ '+total_price_usd.formatMoney(2) + ' USD';
	  // document.getElementById("orderCount").innerHTML = total_orders;
	  // document.getElementById("totalDiscount").innerHTML = "$ 0.00 CAD";

	  // initVisualizations()

	  // gathered all stats required

		// response.write("<p>We are in the final thingi</p>");

		// console.log(allObjects["country"])

		var allObjectsJSON = JSON.stringify(allObjects)

		response.write("<script>")
		response.write("var allObjects="+allObjectsJSON+";")
		response.write("var total_price="+total_price+";")
		response.write("var total_price_usd="+total_price_usd+";")
		response.write("var total_orders="+total_orders+";")
		response.write("var fromDate=\""+dateFormat(fromDate, "mmm dS, yyyy")+"\";")
		response.write("var toDate=\""+dateFormat(toDate, "mmm dS, yyyy")+"\";")
		response.write("</script>")
		next();


	}

}



// console.log(Shopify)
app.use(express.static(__dirname));
app.use(parseURL);
app.use(bodyParser.text({ type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true })); //parse body of POST messages
app.use(addHeader);


app.get('/', root); //main page

app.use(addFooter);
app.use(addFinal);
app.use(respondToClient);



//create http-express server
http.createServer(app).listen(3001);

console.log('Server Running at http://127.0.0.1:3001  CNTL-C to quit');
