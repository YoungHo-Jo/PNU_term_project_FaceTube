#before buildint it don't forget to export ROOTF_DIR and CROSS_COMPILER


SERVER 		= camera_server
CLIENT 		= camera_client

TOOLCHAIN		= /opt/toolchains/arm-2014.05
CROSS_COMPILER		= $(TOOLCHAIN)/bin/arm-none-linux-gnueabi-
EXTERNAL_INCLUDE        = /work/achroimx6q/achroimx_kernel/include
CC			= $(CROSS_COMPILE)g++
DEL_FILE		= rm -rf
CP_FILE			= cp -rf      

TARGET_PATH_LIB 	= $(ROOTFS_DIR)/usr/arm-linux-gnueabihf/lib
TARGET_PATH_INCLUDE 	= $(ROOTFS_DIR)/usr/arm-linux-gnueabihf/include

CFLAGS			= -DLINUX -DUSE_SOC_MX6 -Wall -O2 -fpermissive -mfloat-abi=softfp\
			  -DEGL_API_FB -DGPU_TYPE_VIV -DGL_GLEXT_PROTOTYPES -DENABLE_GPU_RENDER_20 \
			  -I../include -I$(ROOTFS_DIR)/usr/src/linux/include -I$(TARGET_PATH_INCLUDE) \

LFLAGS			= -Wl,--library-path=$(TARGET_PATH_LIB),-rpath-link=$(TARGET_PATH_LIB) -lm  -lpthread \
			   -lopencv_core -lopencv_imgproc -lopencv_highgui -lopencv_ml -lopencv_imgcodecs
			   
			  
SERVER_OBJS			= $(SERVER).o v4l_wrapper.o
CLIENT_OBJS			= $(CLIENT).o v4l_wrapper.o


$(SERVER): $(SERVER_OBJS) 
	$(CC) -I $(EXTERNAL_INCLUDE) $(LFLAGS) -o $(SERVER) $(SERVER_OBJS) 

$(SERVER).o: $(SERVER).cpp
	$(CC) -I $(EXTERNAL_INCLUDE) $(CFLAGS) -c -o $(SERVER).o $(SERVER).cpp `pkg-config opencv --cflags --libs`

$(CLIENT): $(CLIENT_OBJS) 
	$(CC) -I $(EXTERNAL_INCLUDE) $(LFLAGS) -o $(CLIENT) $(CLIENT_OBJS) 

$(CLIENT).o: $(CLIENT).cpp
	$(CC) -I $(EXTERNAL_INCLUDE) $(CFLAGS) -c -o $(CLIENT).o $(CLIENT).cpp `pkg-config opencv --cflags --libs`

client :
	$(CC) -I $(EXTERNAL_INCLUDE) $(CFLAGS) $(LFLAGS) -o $(CLIENT) $(CLIENT).cpp v4l_wrapper.c `pkg-config opencv --cflags --libs`

v4l_wrapper.o: v4l_wrapper.c
	$(CC) -I $(EXTERNAL_INCLUDE) $(CFLAGS) -c -o v4l_wrapper.o v4l_wrapper.c 


first: all

all:
	$(CLIENT)
	$(SERVER)

clean:
	$(DEL_FILE) $(OBJECTS)
	$(DEL_FILE) *~ *.core
	$(DEL_FILE) $(CLIENT)
	$(DEL_FILE) $(SERVER)

distclean: clean
	$(DEL_FILE) $(CLIENT)
	$(DEL_FILE) $(SERVER)

install: all
	$(DEL_FILE) $(SERVER)
	$(DEL_FILE) $(CLIENT)

