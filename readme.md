# TheOpenBook

To Run

add the following variables to a .env file : 
```
PORT=<Port to serve the app by default 3000>
MONGO_USER=<Username of user to read/write to the mongo cluster>
MONGO_PWD=<Password of user>
MONGO_DB=<default datatabase in mongo cluster to write to ex:MyFirstDatabase>
SENDGRID_API_KEY=<api key for your sendgrid user>
CONF_ACTION=<where confirm email form should go only domain name>
```
Run : 

```sh
$ npm install

$ node app.js && exit 0

```