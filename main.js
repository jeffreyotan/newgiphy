// load libraries and modules required
const express = require('express');
const handlebars = require('express-handlebars');
const fetch = require('node-fetch');
const withQuery = require('with-query').default;

// setup the environment, with default port at 3000
const PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
const API_KEY = process.env.API_KEY || "";
const BASE_URL = "http://api.giphy.com/v1/gifs/search";

// create an instance of the express app
const app = express();

// setup express-handlebars to accept templates
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs'}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

/* The query string that we use to get information
http://api.giphy.com/v1/gifs/search?q=ryan+gosling&api_key=YOUR_API_KEY&limit=10&rating=g&lang=en
*/

// create the middleware to handle the requests
app.get('/search', async (req, res, next) => {
    const search = req.query.searchKey;

    console.info('searchKey: ', search);

    // search Giphy, using the Async-Await method
    const url = withQuery(
        BASE_URL,
        {
            q: search,
            api_key: API_KEY,
            limit: 10,
            rating: "g",
            lang: "en"
        }
    )

    console.info("Url obtained: ", url);

    const result = await fetch(url);

    let gifsReturned;
    try {
        gifsReturned = await result.json();
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).type('text/html');
        res.send('<H1>An error occurred at the server!</H1>');
        return Promise.reject(error);
    }

    // info logs to debug the program
    // console.info('gifsReturned: \n', gifsReturned);
    // console.info('image from data[0] url: ', gifsReturned.data[0].images.fixed_height.url);

    // create the array of image urls to pass to our handlebars template
    let imgUrls = [];
    gifsReturned.data.forEach( element => {
        const title = element['title'];
        const link = element.images.fixed_height.url;
        imgUrls.push({ title, link }); // in JavaScript, when the JSON object does not have any value, the key and value are the same. Hence, {title, link} === {title: title, link: link};
    });
    console.info('array created: ', imgUrls);

    // alternatively, we can use the following array map function
    // const imgUrls = gifsReturned.data
    // .filter( (element) => {
    //     return !element.title.includes('f**k');
    // })
    // .map( (element) => {
    //     return { title: element.title, link: element.images.fixed_height.url };
    // });

    res.status(200).type('text/html');
    res.render('search', { title: `Your search of ${search} returned`, imgUrl: imgUrls, hasContent: !!imgUrls.length });
});

app.get('/', (req, res, next) => {
    res.status(200).type('text/html');
    res.render('index', { title: "Welcome to the new Giphy!" });
});

app.use(express.static(__dirname + '/public'));

// start the express app
if(API_KEY) {
    app.listen(PORT, () => {
        console.info(`Server was started at port ${PORT} on ${new Date()}`);
    });
} else {
    console.error('API_KEY is not set');
}
