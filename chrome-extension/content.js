// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);

      // This line is new!
      chrome.runtime.sendMessage({"message": "open_new_tab", "url": firstHref});
    }
  }
);

var s = document.createElement('script');
s.type = 'text/javascript';
var code = ''
code += 'function handle_going_yo_gorafy_com(){'
code +=   'var current_url = window.location.href;'
code +=   'current_url = current_url.replace("youtube.com", "youtube.gorafyit.com");'
code +=   'current_url = current_url.replace("youtu.be", "youtube.gorafyit.com");'
code +=   'current_url = current_url.replace("https", "http");'
code +=   'alert(current_url);'
code +=   'window.location.href = current_url;'
code += '}';
try {
  s.appendChild(document.createTextNode(code));
  document.body.appendChild(s);
} catch (e) {
  s.text = code;
  document.body.appendChild(s);
}

var button_img = document.createElement("img");
button_img.setAttribute('onclick', 'handle_going_yo_gorafy_com()');
button_img.setAttribute('src', 'https://image.ibb.co/fbUHxa/gorafy_it_300.png');
button_img.setAttribute('height', '42');
button_img.setAttribute('width', '125');
button_img.setAttribute('style', 'position: fixed; top: 50%; right: -10px; z-index: 10000;');
var body = document.getElementsByTagName("body")[0];
body.appendChild(button_img);