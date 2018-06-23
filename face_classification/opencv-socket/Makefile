CXX = g++
CXXFLAGS = -O2 -g -Wall -fmessage-length=0 
CPPFLAGS = -I/usr/local/Cellar/opencv@2/2.4.13.6_2/include

LDFLAGS = -L/usr/local/Cellar/opencv@2/2.4.13.6_2/lib
LDLIBS =  -lopencv_core -lopencv_imgproc -lopencv_calib3d -lopencv_video \
          -lopencv_features2d -lopencv_ml -lopencv_highgui -lopencv_objdetect \
          -lopencv_contrib -lopencv_legacy -lopencv_gpu

client:
	clear
	$(CXX) $(CPPFLAGS) $(LDFLAGS) -o client client.cpp $(LDLIBS)
server:
	clear
	$(CXX) $(CPPFLAGS) $(LDFLAGS) -o server server.cpp $(LDLIBS)
test:
	clear
	$(CXX) $(CPPFLAGS) $(LDFLAGS) -o test test.cc $(LDLIBS)

