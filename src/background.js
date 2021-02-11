var arr = []

chrome.extension.onConnect.addListener(function(port) {
     console.log("background : connected");
     port.onMessage.addListener(function(msg) {
        if(msg == true) {
          runFunc = setInterval(function() {
             console.log("running");
          }, 1000);
          arr.push(runFunc);
          console.log(arr);
        }
        else {
          console.log("stop");
          arr.forEach(function(element){
              clearInterval(element);
          });
          arr = []
        }
     });
});
