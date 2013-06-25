
(function() {
  var elements = {};
  var screen = 'large', mode = 'edit';

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

    container.innerHTML = ['<div id="codewrap" onclick="void(0)">',
                             '<textarea id="codearea">' + text + '</textarea>',
                             '<span id="codemove">&#9664;</span>',
                           '</div>',
                           '<div id="showwrap" onclick="void(0)">',
                             '<div id="showarea"></div>',
                             '<span id="showmove">&#9654;</span>',
                           '</div>'].join('');
    elements = {
      container: container,
      codewrap: container.firstChild,
      showwrap: container.lastChild,
      codearea: codewrap.firstChild,
      codemove: codewrap.lastChild,
      showarea: showwrap.firstChild,
      showmove: showwrap.lastChild
    }

    addEvent(window, 'resize', initSize);
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

  function addEvent(elem, type, handler) {
    if (!elem) return;
    if (elem.addEventListener) {
      elem.addEventListener(type, handler, false);
    } else if (elem.attachEvent) {
      elem.attachEvent('on' + type, handler);
    } else {
      elem['on' + type] = handler;
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
    initSize();
    var code = elements['codearea'];
    code.onkeyup = preview;
    code.oncut = code.onpaste = timerPreview;
    if (window.MathJax) {
      MathJax.Hub.processUpdateTime = 200;
      MathJax.Hub.processUpdateDelay = 15;
    }
    preview();
    bindMove();
  }

  function initSize() {
    screen = (elements['container'].clientWidth > 540) ? 'large' : 'small';
    mode = (screen == 'large') ? 'edit' : 'code';
    resizeEditor(mode);
  }

  function bindMove() {
    elements['codemove'].onclick = function(){
      if (screen == 'large' && mode == 'code') {
        resizeEditor('edit');
      } else {
        resizeEditor('show');
        preview();
      }
    };
    elements['showmove'].onclick = function(){
      if (screen == 'large' && mode == 'show') {
        resizeEditor('edit');
      } else {
        resizeEditor('code');
      }
    };
  }

  function resizeEditor(newmode) {
    var c = elements['codewrap'];
    var s = elements['showwrap'];
    switch (newmode) {
      case 'edit':
        c.style.display = 'block';
        c.style.left = 0 + 'px';
        c.style.width = '50%';
        s.style.display = 'block';
        s.style.left = '50%';
        s.style.width = '';
        break;
      case 'code':
        c.style.display = 'block';
        c.style.left = 0 + 'px';
        c.style.width = '100%';
        s.style.display = 'none';
        break;
      case 'show':
        c.style.display = 'none';
        s.style.display = 'block';
        s.style.left = 0 + 'px';
        s.style.width = '100%';
        break;
    }
    mode = newmode;
  }

  function timerPreview() {
    setTimeout(preview, 100);
  }

  function preview() {
    if (mode == 'code') return;
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
    var re = /(\n|\r\n|\r)*(\${1,2})((?:\\.|[^$])*)\2(\n|\r\n|\r)*/g;
    var out = text.replace(re, function(m, c1, c2, c3, c4){
      c3 = c3.replace(/_/g, '\\_')
           .replace(/</g, '&lt;')
           .replace(/\|/g, '\\vert ')
           .replace(/\[/g, '\\lbrack ')
           .replace(/\\{/g, '\\lbrace ')
           .replace(/\\}/g, '\\rbrace ')
           .replace(/\\\\/g, '\\\\\\\\');
      var start, end;
      if (label) {
        start = (c2 == '$') ? '$' + label + ' ' : '\n\n<p align="center">$' + label + ' ';
        end = (c2 == '$') ? '$': '$\n</p>\n\n';
      } else {
        start = (c2 == '$') ? c2 : '\n\n' + c2;
        end = (c2 == '$') ? c2 : c2 + '\n\n';
      }
      return start + c3 + end;
    });
    return out;
  }

  window.JaxMark = JaxMark;
})(window);
