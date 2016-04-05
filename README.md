# Engine #

### Dependencies ###
- Nodejs (at least 0.12.x)
- bower `npm install bower -g`
- grunt-cli `npm install grunt-cli -g`
- mongodb

### Getting Started ###
1. Clone the repository
2. In the repository directory run `npm install` (will automatically run `bower install`)
3. Run `grunt setupDB`

### Tips ###
- When adding a dependency add `--save` to add it to the `package.json`
    - If it's a development only dependency use `--save-dev`
- `nodemon` is a package that you can use to run your server and will watch the files and restart the server when there are changes so you don't have to
    - install with `npm install nodemon -g`
    - use anywhere you would use node i.e. `node server.js` -> `nodemon server.js`