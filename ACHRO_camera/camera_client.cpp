#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <iostream>
#include <assert.h>
#include <sys/time.h>
#include <math.h>
#include <time.h>
#include <malloc.h>
#include <unistd.h>

#include "opencv2/core/core.hpp"
#include "opencv2/video/tracking.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"

#include "v4l_wrapper.h"

#define LOCALHOST "164.125.70.163"
#define PORT 6000
#define FRAME_WIDTH 640
#define FRAME_HEIGHT 480

using namespace std;
using namespace cv;

void error(const char *msg)
{
	perror(msg);
	exit(0);
}

int Kbhit(void)
{
	struct termios oldt, newt;
	int ch;
	int oldf;

	tcgetattr(STDIN_FILENO, &oldt);
	newt = oldt;
	newt.c_lflag &= ~(ICANON | ECHO);
	tcsetattr(STDIN_FILENO, TCSANOW, &newt);
	oldf = fcntl(STDIN_FILENO, F_GETFL, 0);
	fcntl(STDIN_FILENO, F_SETFL, oldf | O_NONBLOCK);

	ch = getchar();

	tcsetattr(STDIN_FILENO, TCSANOW, &oldt);
	fcntl(STDIN_FILENO, F_SETFL, oldf);

	if (ch != EOF)
	{
		ungetc(ch, stdin);
		return 1;
	}

	return 0;
}


int main()
{
	int sockfd, portno, n, imgSize, IM_HEIGHT, IM_WIDTH;
	struct sockaddr_in serv_addr;
	struct hostent *server;
	Mat cameraFeed;


	// =================================== 
	portno = PORT;
	sockfd = socket(AF_INET, SOCK_STREAM, 0);

	if (sockfd < 0)
		error("ERROR opening socket");

	server = gethostbyname(LOCALHOST);

	// Check server
	if (server == NULL)
	{
		fprintf(stderr, "ERROR, no such host\n");
		exit(0);
	}

	bzero((char *)&serv_addr, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	bcopy((char *)server->h_addr,
			(char *)&serv_addr.sin_addr.s_addr,
			server->h_length);
	serv_addr.sin_port = htons(portno);

	// Connect Server
	if (connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
		error("ERROR connecting");
	else {
		printf("[CLIENT] connecting with server\n");

	}


	// ================================

	fsl_v4l_cap mycamera;
	fsl_v4l_out mydisplay;
	int ret;
	char *buffer;
	//	char buffer[640*480];
	int width = 640;
	int height = 480;
	IplImage *image;
	Mat image_yuv;
	Mat image_rgb;

	printf("\n\nInitialzing Camera Device: Video0 (640x480)...");

	ret = V4LWrapper_CreateCameraCapture(&mycamera, "/dev/video0", width, height);

	if (ret == V4LWrapper_SUCCESS)
	{
		printf("OK\n");
	}

	else
	{
		printf("\nDevice not found, make sure the driver are properly installed:");
		printf("\nov5642_camera.ko, ov5640_camera_mipi.ko and mxc_v4l2_capture.ko\n");
		exit(0);
	}

//	printf("\nInitialzing Display Device: video17, fb0 (640x480)...");
//	ret = V4LWrapper_CreateOutputDisplay(&mydisplay, "/dev/fb0", NULL, width, height);
//	if (ret == V4LWrapper_SUCCESS)
//		printf("OK\n");
//	else
//	{
//		V4LWrapper_CloseCameraCapture(&mycamera);
//		exit(0);
//	}

	printf("\nAllocating data buffer...");
	buffer = (char *)malloc(mycamera.g_frame_size);

	if (buffer)
		printf("OK\n");

	else
	{
		V4LWrapper_CloseCameraCapture(&mycamera);
		V4LWrapper_CloseOutputDisplay(&mydisplay);

		exit(0);
	}

	image = cvCreateImage (cvSize (width, height), IPL_DEPTH_8U, 3);
	// ====================================

	while (true)
	{
		// Get Frame
		//printf("[CLIENT] mycamera to buffer...\n");

		V4LWrapper_QueryFrame (&mycamera, buffer);	
		//printf("[CLIENT] buffer to image...\n");
		V4LWrapper_CvtColor (buffer, image->imageData, width, height, YUV422toRGB888);
		//printf("[CLIENT] Image RGB888 DONE\n");
		//V4LWrapper_OutputDisplay(&mydisplay, buffer);

		image_rgb = cvarrToMat(image);
		//printf("[CLIENT] Image convert to Mat DONE\n");
	//	V4LWrapper_CloseCameraCapture (&mycamera);
	//	free (buffer);

		cameraFeed = image_rgb; 
		//printf("[CLIENT] get image\n");

		int height = cameraFeed.rows;
		int width = cameraFeed.cols;
		//printf("[CLINET] original image size : %dX%d\n",width, height);


		IM_HEIGHT = FRAME_HEIGHT;
		IM_WIDTH = FRAME_WIDTH;

		resize(cameraFeed, cameraFeed, Size(IM_WIDTH, IM_HEIGHT));
		//printf("[CLINET] resize image size : %dX%d\n",IM_WIDTH, IM_HEIGHT);

		imgSize = cameraFeed.total() * cameraFeed.elemSize();
		int send_num = 1;

		n = send(sockfd, cameraFeed.data, imgSize, 0);

		if (n < 0) {
			//cout << "Send result: " << n << endl;
			//error("ERROR writing to socket");
			cout << "[ERROR] while writing to socket" << endl;
			cout << "Wait for 2 seconds..." << endl;
			sleep(2);
		}
		else {
			//printf("[CLIENT] Send Success \n");
		}

	}

	close(sockfd);
	free(buffer);
	V4LWrapper_CloseCameraCapture(&mycamera);
	//V4LWrapper_CloseOutputDisplay(&mydisplay);


	return 0;
}
