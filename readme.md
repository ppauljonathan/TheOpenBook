# TheOpenBook

To Run

add the following variables to a .env file : 
```
PORT=<Port to serve the app by default 3000>
MONGO_USER=<Username of user to read/write to the mongo cluster>
MONGO_PWD=<Password of user>
MONGO_DB=<default datatabase in mongo cluster to write to ex:MyFirstDatabase>
SENDGRID_API_KEY=<api key for your sendgrid user>
CLOUDINARY_CLOUD_NAME=<cloudinary>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
WEBSITE_ROOT=<the complete url of / ex https://appname.servedat.com/>
```
Run : 

```sh
$ npm install

$ node app.js && exit 0

```