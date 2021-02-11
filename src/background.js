var arr = []

function restartDownload() {
  console.log("running");
  for (var num = 0; num < 1000; num++) {
    chrome.downloads.resume(num, function() {
      console.log("resume : " + num);
    });
  }
}

chrome.extension.onConnect.addListener(function(port) {
  console.log("background : connected");
  var showMax = 100;
  var downloadItems = {};

  port.onMessage.addListener(function(msg) {
    if (msg == true) {
      console.log("running");
      chrome.downloads.search({
        orderBy: ['-startTime'],
        limit: showMax
      }, function(results) {
        console.log(results);
        results.forEach((item) => {
          if(item.canResume) {
            chrome.downloads.resume(item.id, function(){});
          }
        });
      });

      /*runFunc = setInterval(function() {
         console.log("running");
         for(var num=0; num < 1000; num++) {
           chrome.downloads.resume(num, function() {
             console.log("resume : " + num);
           });
         }
       });
       arr.push(runFunc);*/
    } else {
      /*arr.forEach(function(element){
          clearInterval(element);
      });
      arr = []*/
    }
  });
});
