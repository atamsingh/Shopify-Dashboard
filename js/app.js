$(document).foundation()

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

// Chart item used for visualization.
// This declared universally allows for updating the visualization.
var myChart;

// On document ready call initiateUpdateOfPage
$( document ).ready(function() {
  updateData();
  initVisualizations();
});

function updateData(){
  var average_revenue = total_price/total_orders
  // console.log(allObjects)


  // update quantities on page
  document.getElementById("totalRevenue").innerHTML = '$ '+total_price.formatMoney(2) + ' CAD';
  document.getElementById("avgRevenue").innerHTML = '$ '+average_revenue.formatMoney(2) + ' CAD';
  document.getElementById("usdRevenue").innerHTML = '$ '+total_price_usd.formatMoney(2) + ' USD';
  document.getElementById("orderCount").innerHTML = total_orders;
  document.getElementById("fromDate").innerHTML = fromDate;
  document.getElementById("toDate").innerHTML = toDate;
  document.getElementById("totalDiscount").innerHTML = "$ 0.00 CAD";
}

function initVisualizations(){
  initBar()
}

function initBar() {
  var ctx = document.getElementById("barChart");

  var analysisType = document. querySelector('input[name="analysisType"]:checked').id;
  var valueType = document.querySelector('input[name="valueType"]:checked').id;
  var label = "";

  var currArray = allObjects[analysisType];

  if(valueType =='revenue')     label = "$'s in Revenue"
  else if(valueType =='avgRev') label = "Average $'s in Revenue"
  else if(valueType =='count')  label = "Number of Orders"
  else                          label = "Quantity Sold"

  if(analysisType == "country"){
    document.getElementById('visual').style.height = (Object.keys(currArray).length*20 + 100)+"px"
  }else{
    document.getElementById('visual').style.height = (Object.keys(currArray).length*20)+"px"
  }



  var currArray = sortOnData(currArray, valueType)

  myChart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: getLabelsFromArray(currArray),
          datasets: [{
            label: label,
            data: getDataFromArray(currArray, valueType),
            backgroundColor: generateColor(currArray),
            borderWidth: 1
          }]
      },
      options: {
          scales: {
              xAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          },
          responsive: true,
          maintainAspectRatio:false
      }
  });

}

function sortOnData(obj, valueType){

  var sortable = []
  for(key in obj){
    sortable.push([key,obj[key]])
  }
  sortable.sort(function(a, b) {
    return -1 * (a[1][valueType] - b[1][valueType])
  });
  // console.log(sortable)
  return sortable
}

function updateVisualization() {
  myChart.destroy()
  initBar()
}

function getLabelsFromArray(thisArray){
  var toReturn = []
  for(var k = 0; k < thisArray.length; k++){
    toReturn.push(thisArray[k][0])
  }
  // console.log(toReturn)
  return toReturn
}

function getDataFromArray(thisArray, valueType){
  var toReturn = []
  for(var k = 0; k < thisArray.length; k++){
    toReturn.push(thisArray[k][1][valueType])
  }
  // console.log(toReturn)
  return toReturn
}

function generateColor(thisArray){
  var toReturn = []
  for(var k = 0; k < thisArray.length; k++){
    toReturn.push(dynamicColors())
  }
  // console.log(toReturn)
  return toReturn;
}

var dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ",255)";
}









// This is to stop atom
