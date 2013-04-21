
MathJax.Hub.processUpdateTime = 200;
MathJax.Hub.processUpdateDelay = 15;

function typeset(previewer){
  MathJax.Hub.Queue(["Typeset", MathJax.Hub, previewer.body]);
}
