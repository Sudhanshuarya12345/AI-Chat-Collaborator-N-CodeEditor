import hljs from 'highlight.js';
import 'highlight.js/styles/nord.css';

useEffect(() => {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightElement(block);
  });
}, [messages]); 