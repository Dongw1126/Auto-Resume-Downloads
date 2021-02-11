document.getElementById("start").onclick = function () {
  var port = chrome.extension.connect({
        name: "connect background"
   });
   port.postMessage(this.checked);
};
