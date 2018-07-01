# I know you

### Installation:
Note: This requires a recent version of NodeJS to work.
```shell
git clone https://github.com/zhoukq/I-know-you.git
cd ./I-know-you
git submodule init
git submodule update
cd I-know-you-web
npm i

cd ../server
npm i
```

### Running this app:
#### Mac 
add 127.0.0.1 iky.takashiro.me to your /etc/host file

```shell
# start a webpack dev watch build
cd I-know-you-web
npm run build
npm run copy

# start the server
cd ../server
npm start
```
The app runs at [http://iky.takashiro.me:3000]

### Update
Client side has already move to [here](https://github.com/zhoukq/I-know-you)

