const lightbox = document.querySelector('.lightbox'),
      invokeMethod = (o, m, tgt) => o[m](tgt);



lightbox.addEventListener('click', (e) => e.preventDefault());