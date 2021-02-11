chrome.extension.onConnect.addListener(function(port) {
     console.log("background : connected");
     port.onMessage.addListener(function(msg) {
        console.log(msg);
     });
});
