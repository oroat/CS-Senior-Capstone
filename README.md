# CS-Senior-Capstone
2026 Senior Capstone - CoolSys HVAC inventory software

(Instructions to run server)
1. create .env
     Use
         PORT = 4000 
         HOSTNAME = localhost
         DB_URI= mongodb+srv://dpmorales777_db_user:mtyBNTTMxkYoSHlp@cluster0.grq5znw.mongodb.net/main
         TESTDB_URI= mongodb+srv://dpmorales777_db_user:mtyBNTTMxkYoSHlp@cluster0.grq5znw.mongodb.net/test
2. install the following packages using `npm install body-parser dotenv express express-session mongoose path socket.io`
    - Additionally, you can install jest, our testing library, as a dev dependency by running `npm install jest --save-dev`, or you can install it with the other packages
3. add the following script to your 'package.json' file:
    "scripts": {
        "test": "jest"
    }
    - to test a specific file, run `npm test <filename>`, and to test for coverage, run `npm test -- --coverage`
3. run in terminal node server.js