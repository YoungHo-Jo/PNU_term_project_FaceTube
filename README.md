# PNU_term_project_FaceTube
2018 spring semester in Computer Science &amp; Engineering at Pusan National University, Republic of Korea.


## ACHRO board
run programs in ACHRO_camera
nohup ./camera_server &
./camera_client

## ubuntu 14.02
run python script in face_classification/opencv-socket 


python3 server.py

run React.Js for front-end in web_content/facetube/front-end/


npm start

run Node.Js for back-end in web_content/facetube/back-end/


npm app.js


or


nodemon app.js


## Process

First, Camera Server sends data to Ubuntu face classification server on Socket, which runs on ACHRO board.


The server sends back classified face expression information to Camera client 


Also the server sends information to MySQL Server


NodeJs Server processes it.


React shows processed information from NodeJS Server.

And with a touch screen built on ACHRO board, it can change
youtube url playing on brower made by React.



