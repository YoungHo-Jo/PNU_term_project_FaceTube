#mprof run --python python3 server.py
#kernprof -l -v server.py
import socket 
import sys
import struct
import os
import time

import cv2
import numpy as np
from keras.models import load_model
import pythonToMysql as mysql

from statistics import mode

from utils.datasets import get_labels
from utils.inference import detect_faces
from utils.inference import draw_text
from utils.inference import draw_bounding_box
from utils.inference import apply_offsets
from utils.inference import load_detection_model
from utils.preprocessor import preprocess_input

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

HOST = None               # Symbolic name meaning all available interfaces
HOST_SEND    = '164.125.70.164'
PORT_RECEIVE = 6000              # Arbitrary non-privileged port
PORT_SEND    = 7201
s = None
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
CHANNEL=3

# parameters for loading data and images
detection_model_path = '../trained_models/detection_models/haarcascade_frontalface_default.xml'
emotion_model_path = '../trained_models/emotion_models/fer2013_mini_XCEPTION.102-0.66.hdf5'
emotion_labels = get_labels('fer2013')

# hyper-parameters for bounding boxes shape
frame_window = 10
emotion_offsets = (20, 40)

# loading models
face_detection = load_detection_model(detection_model_path)
emotion_classifier = load_model(emotion_model_path, compile=False)

# getting input model shapes for inference
emotion_target_size = emotion_classifier.input_shape[1:3]

# starting lists for calculating modes
emotion_window = []

# starting video streaming
cv2.namedWindow('window_frame')
video_capture = None

#@profile
def socketToNumpy(cameraFeed, sockData):
	k=3
	j=cameraFeed.shape[1]
	i=cameraFeed.shape[0]
	sockData = np.fromstring(sockData, np.uint8)
	cameraFeed = np.tile(sockData, 1).reshape((i,j,k))

	return cameraFeed

for res in socket.getaddrinfo(HOST, PORT_RECEIVE, socket.AF_UNSPEC,
                              socket.SOCK_STREAM, 0, socket.AI_PASSIVE):
    af, socktype, proto, canonname, sa = res
    try:
        s = socket.socket(af, socktype, proto)
    except socket.error as msg:
        s = None
        continue
    try:
        s.bind(sa)
        s.listen(1)
    except socket.error as msg:
        s.close()
        s = None
        continue
    break
if s is None:
    print ("could not open socket")
    sys.exit(1)

conn, addr = s.accept()
print ("Connected by" + str(addr));

socket_send = socket.socket()
socket_send.connect((HOST_SEND, PORT_SEND))

running = True
while running:
	i, ptr = (0,0)
	shape = (FRAME_HEIGHT, FRAME_WIDTH, CHANNEL)
	cameraFeed = np.zeros(shape, np.uint8)
	imgSize = cameraFeed.size
	sockData = b''
	result = True

	while imgSize:
		nbytes=conn.recv(imgSize)
		if not nbytes: 
			print('No Bytes')
			result = False
			break 
		sockData+=nbytes
		imgSize-=len(nbytes)

	if result == False:
		time.sleep(1)		
		continue


#    if result:
	try:
		cameraFeed = socketToNumpy(cameraFeed, sockData)	
	except ValueError: 
		print("ERROR: Socket To Numbey")
		continue

		# Create a window for display.
#        cv2.namedWindow("server");
#        cv2.imshow("server", cameraFeed)
#        key = cv2.waitKey(30)
#        running = key
#
#        # esc
#        if key==27:
#            running =False
#    else : running =False

	bgr_image = cameraFeed
	gray_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2GRAY)
#	print('to Gray Image')
	rgb_image = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB)
#	print('to RGB Image')
#	print('Strat face detection')
	faces = detect_faces(face_detection, gray_image)
#	print('End face detection')
	

	for face_coordinates in faces:
		x1, x2, y1, y2 = apply_offsets(face_coordinates, emotion_offsets)
		gray_face = gray_image[y1:y2, x1:x2]
		try:
			gray_face = cv2.resize(gray_face, (emotion_target_size))
		except:
			continue

		gray_face = preprocess_input(gray_face, True)
		gray_face = np.expand_dims(gray_face, 0)
		gray_face = np.expand_dims(gray_face, -1)
		emotion_prediction = emotion_classifier.predict(gray_face)
		emotion_probability = np.max(emotion_prediction)
		emotion_label_arg = np.argmax(emotion_prediction)
		emotion_text = emotion_labels[emotion_label_arg]
		emotion_window.append(emotion_text)

		if len(emotion_window) > frame_window:
			emotion_window.pop(0)
		try:
			emotion_mode = mode(emotion_window)
		except:
			continue

		print('emotion: ' + emotion_text)
		mysql.SQL_INSERT(emotion_text)
		if emotion_text == 'angry':
			color = emotion_probability * np.asarray((255, 0, 0))
		elif emotion_text == 'sad':
			color = emotion_probability * np.asarray((0, 0, 255))
		elif emotion_text == 'happy':
			color = emotion_probability * np.asarray((255, 255, 0))
		elif emotion_text == 'surprise':
			color = emotion_probability * np.asarray((0, 255, 255))
		else:
			color = emotion_probability * np.asarray((0, 255, 0))

		color = color.astype(int)
		color = color.tolist()

		draw_bounding_box(face_coordinates, rgb_image, color)
		draw_text(face_coordinates, rgb_image, emotion_mode,
				  color, 0, -45, 1, 1)

	bgr_image = cv2.cvtColor(rgb_image, cv2.COLOR_RGB2BGR)
#	print('Send to Camera Server')
	try:
		socket_send.send(bgr_image.tostring())
	except:
		continue
		
	cv2.imshow('window_frame', rgb_image)
	if cv2.waitKey(1) & 0xFF == ord('q'):
		break
conn.close()
