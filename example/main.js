
(function(){

  var opts = {
    container: 'container',
    file: {
      name: 'marktex',
      defaultContent: '###Hello Markdown\n\nSome math $\\sqrt4=2$ here.\n',
      autoSave: 100
    },
    theme: 'light',
    shortcut: {
      modifier: 18,
      fullscreen: 70,
      preview: 80
    }
  }

  var editor = new JaxMark(opts).load();
  var codearea = editor.getElement("codearea");

  function doOpen(evt) {
    var file = evt.target.files[0],
        reader = new FileReader();
    reader.onload = function() {
      codearea.value = this.result;
    };
    reader.readAsText(file);
  }

  function fileOpen(event) {
    var ev = event ? event : window.event;
    var opensel = document.getElementById("opensel");
    opensel.click();
    ev.preventDefault();
  }

  function doSave() {
    var value = codearea.value, type = "text/markdown";
    if (typeof window.Blob == "function") {
      var blob = new Blob([value], {type: type});
    } else {
      var BlobBuilder = window.BlobBuilder || window.MozBlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder;
      var bb = new BlobBuilder;
      bb.append(value);
      var blob = bb.getBlob(type);
    }
    var URL = window.URL || window.webkitURL;
    var bloburl = URL.createObjectURL(blob);
    var time = new Date();
    var year = time.getFullYear();
    var month = time.getMonth()+1;
    var date = time.getDate();
    if (month < 10) month = "0" + month;
    if (date < 10) date = "0" + date;
    var name = year + "-" + month + "-" + date + ".md";
    var anchor = document.createElement('a');
    if ('download' in anchor) {
      anchor.style.visibility = "hidden";
      anchor.href = bloburl;
      anchor.download = name;
      document.body.appendChild(anchor);
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, true);
      anchor.dispatchEvent(evt);
      document.body.removeChild(anchor);
    } else if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, name);
    } else {
      location.href = bloburl;
    }
  }

  function fileSave() {
    doSave();
  }

  function addFileHandler() {
    var openbtn = document.getElementById("openbtn"),
        savebtn = document.getElementById("savebtn");
    openbtn.onclick = fileOpen;
    savebtn.onclick = fileSave;
  }

  function changeFileDisplay(display) {
    var openbtn = document.getElementById("openbtn"),
        savebtn = document.getElementById("savebtn");
    if (display) {
      openbtn.style.display = "inline-block";
      savebtn.style.display = "inline-block";
    } else {
      openbtn.style.display = "none";
      savebtn.style.display = "none";
    }
  }

  function hasFileReader() {
    return typeof(window.FileReader) == 'function';
  }

  function hasFileSaver() {
    return window.URL || window.webkitURL;
  }

  var opensel = document.getElementById("opensel");
  if (hasFileReader() && hasFileSaver()) {
    opensel.style.visibility = "visible";
    opensel.addEventListener("change", doOpen, false);
    addFileHandler();
    changeFileDisplay(true);
  } else {
    opensel.style.display = "none";
  }

})();
