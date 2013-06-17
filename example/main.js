
if (!window.console) console = {log : function() {}};

(function(){

  var opts = {
    container: 'container',
    file: {
      name: 'marktex',
      defaultContent: '---\ntitle: Hello Markdown\ndate: 2013-06-03 20:35\n---\n\n'
                    + '###Hello Markdown\n\nSome inline math $A_1=\\{x|x<1\\}$ here, and some displayed math here'
                    + '\n\n$$e^{ix}=\\cos x+i\\sin x.$$\n\nYou could export it as a **blog** article.',
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

  bindHandler();

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

  function bindHandler() {
    var opensel = document.getElementById("opensel");
    if (hasFileReader() && hasFileSaver()) {
      opensel.style.visibility = "visible";
      opensel.addEventListener("change", doOpen, false);
      changeFileDisplay(true);
    } else {
      opensel.style.display = "none";
    }
    document.getElementById("export-wordpress").onclick = exportMark;
    document.getElementById("export-mathjax").onclick = exportMark;
    document.getElementById("export-markdown").onclick = exportMark;
  }

  function changeFileDisplay(display) {
    var openbtn = document.getElementById("openbtn"),
        savebtn = document.getElementById("savebtn");
    if (display) {
      openbtn.onclick = fileOpen;
      savebtn.onclick = fileSave;
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

  function exportMark(event) {
    if (!event) event = window.event;
    var dialog = document.getElementById('dialog'),
        close = document.getElementById('dialog-close'),
        area = document.getElementById('dialog-text');
    var target = event.target || event.srcElement;
    var id = target.id, type = id.split('-')[1];
    area.value = editor.exportFiles(type);
    dialog.style.display = 'block';
    close.onclick = function(){dialog.style.display = 'none'};
    area.focus();
  }

})();
