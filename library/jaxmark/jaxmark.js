
(function() {
  var elements = {};

  function JaxMark(opts) {
    this.options = opts;
    return this;
  }

  JaxMark.prototype.load = function() {
    var options = this.options;
    var container = document.getElementById(options.container),
        text = options.file.defaultContent;

    var path = (function(name) {
      var scripts = document.getElementsByTagName('script');
      for (var i = scripts.length - 1; i >= 0; --i) {
        var src = scripts[i].src;
        var length = src.length - name.length;
        if (src.slice(length) == name) {
          return src.slice(0, length);
        }
      }
    })('jaxmark.js');
    loadStyles(path + 'jaxmark.css');
    loadStyles(path + 'theme/' + options.theme + '.css');

    container.innerHTML = '<div id="codewrap"><textarea id="codearea">' + text + '</textarea></div>'
                        + '<div id="showwrap"><div id="showarea"></div></div>';
    elements = {
      container: container,
      codewrap: container.firstChild,
      showwrap: container.lastChild,
      codearea: codewrap.firstChild,
      showarea: showwrap.lastChild
    }

    initEditor();
    return this;
  };

  JaxMark.prototype.getElement = function(name) {
    return elements[name];
  };

  JaxMark.prototype.exportFiles = function(type) {
    var code = elements['codearea'];
    var parts = splitText(code.value), head = parts[0], body = parts[1];
    switch (type) {
      case 'markdown':
        body = escapeTex(body);
        return head ? '---\n' + head + '\n---\n' + body : body;
      case 'mathjax':
        return marked(escapeTex(body));
      case 'wordpress':
        return marked(escapeTex(body, 'latex'));
    }
  }

  function loadStyles(url) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(link);
  }

  function initEditor() {
    var code = elements['codearea'];
    code.onkeyup = preview;
    code.oncut = code.onpaste = timerPreview;
    if (window.MathJax) {
      MathJax.Hub.processUpdateTime = 200;
      MathJax.Hub.processUpdateDelay = 15;
    }
    preview();
  }

  function timerPreview() {
    setTimeout(preview, 100);
  }

  function preview() {
    var code = elements['codearea'], show = elements['showarea'];
    var body = splitText(code.value)[1];
    if (window.MathJax) {
      show.innerHTML = marked(escapeTex(body));
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, show]);
    } else {
      show.innerHTML = marked(body);
    }
  }

  function splitText(text) {
    var re = /^---(\n|\r\n|\r)([\w\W]+?)\1---\1([\w\W]*)/, result = re.exec(text);
    return (result ? [result[2], result[3]] : ['', text]);
  }

  function escapeTex(text, label) {
    var out = text.replace(/(\${1,2})((?:\\.|[^$])*)\1/g, function(m, $1, $2){
      $2 = $2.replace(/_/g, '\\_')
           .replace(/</g, '\\lt ')
           .replace(/\|/g, '\\vert ')
           .replace(/\[/g, '\\lbrack ')
           .replace(/\\{/g, '\\lbrace ')
           .replace(/\\}/g, '\\rbrace ')
           .replace(/\\\\/g, '\\\\\\\\');
      if (label) $2 = label + ' ' + $2;
      return $1 + $2 + $1;
    });
    return out;
  }

  window.JaxMark = JaxMark;
})(window);
