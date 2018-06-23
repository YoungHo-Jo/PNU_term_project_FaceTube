#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <iostream>
#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"

#include<sys/socket.h>	//socket
#include<sys/types.h>
#include<netinet/in.h>
#include "v4l_wrapper.h"

using namespace std;
using namespace cv;

#define PORT 7201

#define FRAME_WIDTH         640
#define FRAME_HEIGHT        480

void error(const char *msg)
{
	perror(msg);
	exit(1);
}

int main()
{
	printf("[START SERVER]\n");
	int sockfd, newsockfd, portno, n, imgSize, bytes=0, IM_HEIGHT, IM_WIDTH;;
	socklen_t clilen;
	struct sockaddr_in serv_addr, cli_addr;
	Mat img;

	sockfd=socket(AF_INET, SOCK_STREAM, 0);
	if(sockfd<0) error("ERROR opening socket");
	else		 printf("[OPEN SOCKET]\n");

	bzero((char*)&serv_addr, sizeof(serv_addr));
	portno = PORT;

	serv_addr.sin_family=AF_INET;
	serv_addr.sin_addr.s_addr=INADDR_ANY;
	serv_addr.sin_port=htons(portno);

	if(bind(sockfd, (struct sockaddr *) &serv_addr, sizeof(serv_addr))<0)  {
		error("ERROR on binding");
	}
	else {
		printf("[BINDING SOCKET]\n");
	}


	// =======================================
	int ret;
	fsl_v4l_out mydisplay;
	int width = 640, height = 480;
	cout << "\nInitialzing Display Device: video18, fb0 (640x480)..." << endl;
	ret = V4LWrapper_CreateOutputDisplay(&mydisplay, "/dev/fb0", NULL, width, height);

	if (ret == V4LWrapper_SUCCESS)
		cout << "OK" << endl;
	else
	{
		error("ERROR on Display");	
	}



	// =========================================

	listen(sockfd,5);
	clilen=sizeof(cli_addr);

	newsockfd=accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);
	if(newsockfd<0) error("ERROR on accept");
	else		 printf("[ACCEPT]\n");


	bool running = true;
	cout << "[IN RUNNING] " << endl;
	IM_HEIGHT = FRAME_HEIGHT;
	IM_WIDTH = FRAME_WIDTH;
	img = Mat::zeros(FRAME_HEIGHT, FRAME_WIDTH, CV_8UC3);
	imgSize = img.total()*img.elemSize();
	char* buffer = (char *)malloc(imgSize);
	uchar sockData[imgSize];
	while(running)
	{

		for(int i=0;i<imgSize;i+=bytes){
			if ((bytes=recv(newsockfd, sockData+i, imgSize-i,0))==-1) { 
				//error("recv failed");
				cout << "[ERROR] Reciving falied" << endl;
			}
		}

		int ptr=0;
		// cout << "[Image Size]: " << img.rows << " " << img.cols << endl;
		for(int i=0;i<img.rows;++i){
			for(int j=0;j<img.cols;++j)
			{
				img.at<Vec3b>(i,j) = Vec3b(sockData[ptr+0],sockData[ptr+1],sockData[ptr+2]);
				ptr=ptr+3;
			}
		}


		// Output
		V4LWrapper_CvtColor(img.data, buffer, width, height, RGB888toYUV422);
		V4LWrapper_OutputDisplay(&mydisplay, buffer);



		// cout << "Comming from face classification server (ubuntu) " << endl;
		// namedWindow( "Server", CV_WINDOW_AUTOSIZE );// Create a window for display.
		// imshow( "Server", img );
		// char key = waitKey(30);
		// running = key;
		// //esc
		// if(key==27) running =false;
	}

	close(newsockfd);
	close(sockfd);
	V4LWrapper_CloseOutputDisplay(&mydisplay);

	return 0;
}
