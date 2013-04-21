
(function(){

  var opts = {
    file: {
      name: "epiceditor",
      defaultContent: "###Hello Markdown\n\nSome math $\\sqrt4=2$ here.\n",
      autoSave: 100
    },
    theme: {
      base: "/themes/base/epiceditor.css",
      editor: "/themes/editor/epic-dark.css", // epic-light.css
      preview: "/themes/preview/github.css"   // bartik.css, preview-dark.css
    },
    shortcut: {
      modifier: 18,
      fullscreen: 70,
      preview: 80
    }
  }

  var editor = new EpicEditor(opts).load();

  var previewer = editor.getElement("previewer");
  var previewWindow = editor.getElement("previewerIframe").contentWindow;

  loadParser(previewer);

  function loadParser(document) {
    var script = document.createElement("script");
    script.type = "text/x-mathjax-config";
    script[(window.opera ? "innerHTML" : "text")] =
      "MathJax.Hub.Config({\n" +
      "  skipStartupTypeset: true,\n" +
      "  tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]},\n" +
      "  TeX: { extensions: ['color.js', 'extpfeil.js'] },\n" +
      "  'HTML-CSS': { imageFont: null }\n" +
      "});"
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script);

    loadScript(document, "http://cdn.mathjax.org/mathjax/2.1-latest/MathJax.js?config=TeX-AMS_HTML", function(){
      loadScript(document, "markedit/mathjax.js", function(){
        bindEvent();
      });
    });
  }

  function loadScript(document, url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = url;
    if (script.readyState) {
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {
      script.onload = function() { callback(); };
    }
    document.body.appendChild(script);
  }

  function bindEvent() {
    editor.on('preview', function() {
      typeset();
    });
  }

  function typeset() {
    previewWindow.typeset(previewer);
  }

  function doOpen(evt) {
    var file = evt.target.files[0],
        reader = new FileReader();
    reader.onload = function() {
      editor.importFile("some-file", this.result);
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
    var value = editor.exportFile(), type = "text/markdown";
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
    if (($.browser.chrome && parseFloat($.browser.version) >= 14) ||
        ($.browser.mozilla && parseFloat($.browser.version) >= 20)) {
      var anchor = document.createElement("a");
      anchor.style.visibility = "hidden";
      anchor.href = bloburl;
      anchor.download = name;
      document.body.appendChild(anchor);
      var evt = document.createEvent("MouseEvents");
      evt.initEvent("click", true, true);
      anchor.dispatchEvent(evt);
      document.body.removeChild(anchor);
    } else if ($.browser.msie && parseFloat($.browser.version)>= 10) {
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

  var opensel = document.getElementById("opensel");
  var browser = $.browser;
  if ((browser.mozilla && parseFloat(browser.version) >= 6) ||
      (browser.chrome && parseFloat(browser.version) >= 8) ||
      (browser.msie && parseFloat(browser.version) >= 10) ||
      (browser.safari && parseFloat(browser.version) >= 6) ||
      (browser.opera && parseFloat(browser.version) >= 12.10)) {
    opensel.style.visibility = "visible";
    opensel.addEventListener("change", doOpen, false);
    addFileHandler();
    changeFileDisplay(true);
  } else {
    opensel.style.display = "none";
  }

})();
