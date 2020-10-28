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

/*
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
        res.status(400).type('text/html');
        res.send('<H1>An error occurred at the server!</H1>');
        return Promise.reject(error);
    }

    console.info('gifsReturned: \n', gifsReturned);
    console.info('image url: ', gifsReturned.data[0].images.url);

    res.status(200).type('text/html');
    res.send('<H1>Well done!</H1>');
});

app.get('/', (req, res, next) => {
    res.status(200).type('text/html');
    res.render('index', { title: "Welcome to the modified Giphy!" });
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
