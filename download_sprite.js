const https = require('https');
const fs = require('fs');

https.get('https://pokemon.fandom.com/wiki/List_of_Pok%C3%A9mon', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    // Fandom image URLs usually look like: https://static.wikia.nocookie.net/pokemon/images/...
    const regex = /Galvantula.*?<img[^>]+src=["'](https:\/\/static\.wikia\.nocookie\.net[^\s"']+?(?:\.png|\.webp|\.jpg).*?)["']/is;
    let match = data.match(regex);
    if (!match) {
        // sometimes data-src is used for lazy loading
        const lazyRegex = /Galvantula.*?<img[^>]+data-src=["'](https:\/\/static\.wikia\.nocookie\.net[^\s"']+?(?:\.png|\.webp|\.jpg).*?)["']/is;
        match = data.match(lazyRegex);
    }
    
    if (match) {
      console.log('Found URL:', match[1]);
      const file = fs.createWriteStream('./public/img/pokemon/0596.webp');
      https.get(match[1], (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log('Download Completed');
        });
      });
    } else {
      console.log('Not Found');
    }
  });
}).on('error', (e) => {
  console.error(e);
});
