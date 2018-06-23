import pymysql
import datetime
import random
import time

HOST = '127.0.0.1'
PORT = 3306
USER = 'root'
PASSWORD = '389203'
DATABASE = 'facetube'
TABLENAME = 'face'


def SQL_EXECUTE(query_string, tablename = TABLENAME) : 
	try :
		conn = pymysql.connect(host=HOST, port=PORT, user=USER, password=PASSWORD, database=DATABASE)
		if conn.open :
			with conn.cursor() as curs:             
				curs.execute(query_string) 
				conn.commit()
		else :
			assert (not conn.open)
	finally :
		conn.close()

#def SQL_insertArr(faceFeeling) :
#	arr_index = [0,1,2,3,4,5,6,7,8,9,18]
#	arr_return = []
#
#				for index in arr_index :
#	arr_return.append(str(arr_X[index]))
#	arr_return.append(str(arr_Y[index]))
#	arr_return.append(str(arr_Z[index]))
#
#	return arr_return
#
#
#def SQL_CREATETABLE(tablename = TABLENAME) :
## distance values call (humans list length = people).
## NOSE = 0
## NECK = 1
## RSHOULDER = 2
## RELBOW = 3
## RWRIST = 4
## LSHOULDER = 5
## LELBOW = 6
## LWRIST = 7
## RHIP = 8
## RKNEE = 9
## WRIST = 18
#	query_string = ('create table ' + tablename + '('
#				' ID varchar(30),'
#				' NOSE_X float,        NOSE_Y float,      NOSE_Z float,'
#				' NECK_X float,        NECK_Y float,      NECK_Z float,'
#				' RSHOULDER_X float,   RSHOULDER_Y float, RSHOULDER_Z float,'
#				' RELBOW_X float,      RELBOW_Y float,    RELBOW_Z float,'
#				' RWRIST_X float,      RWRIST_Y float,    RWRIST_Z float,'
#				' LSHOULDER_X float,   LSHOULDER_Y float, LSHOULDER_Z  float,'
#				' LELBOW_X float,      LELBOW_Y float,    LELBOW_Z float,'
#				' LWRIST_X float,      LWRIST_Y float,    LWRIST_Z float,'
#				' RHIP_X float,        RHIP_Y float,      RHIP_Z float,'
#				' RKNEE_X float,       RKNEE_Y float,      RKNEE_Z float,'
#				' WRIST_X float,       WRIST_Y float,     WRIST_Z float,'
#				' PRIMARY KEY (id)'
#				')')
#	SQL_EXECUTE(query_string, tablename)
#
#
#def SQL_DROPTABLE(tablename = TABLENAME) :
#	query_string = 'DROP TABLE ' + tablename + ';'
#	SQL_EXECUTE(query_string, tablename)
#
#
## def SQL_UPDATE() : ??
## def SQL_DELETE() : ??
#
## FIX!
#def SQL_DELETEALL(tablename = TABLENAME) :
## query_string = 'INSERT INTO ' + tablename + ' VALUES ("' + getCurrentTime() + '", %s);' % var_string
#	query_string = 'DELETE from ' + tablename
#	SQL_EXECUTE(query_string, tablename)
#
#
##test function
#def SQL_INSERTLINE(arr_X, arr_Y, arr_Z, tablename = TABLENAME) :
#	SQL_DELETEALL()
#	SQL_INSERT(arr_X, arr_Y, arr_Z, tablename = TABLENAME)

#insert into 'facetube'. 'face' (~,~,~) values (null, CURRENT_TIMESTAMP, 'iaewjpf');
def SQL_INSERT(faceFeeling, tablename = TABLENAME) :
# print("var_str : "+ var_string)
	query_string = 'INSERT INTO ' + tablename + ' VALUES ( NULL, NULL, "' + faceFeeling + '")'

	SQL_EXECUTE(query_string, tablename)

# return currenttime format : yyyy-mm-dd_hh:mm:ss.'ms''ms'
def getCurrentTime() :
	year  = str(datetime.datetime.now().year)
	month = str(datetime.datetime.now().month).zfill(2) 
	day   = str(datetime.datetime.now().day).zfill(2) 
	hour  = str(datetime.datetime.now().hour).zfill(2) 
	minute= str(datetime.datetime.now().minute).zfill(2) 
	sec   = str(datetime.datetime.now().second).zfill(2) 
	micsec   = str(datetime.datetime.now().microsecond)

	dateString = year + '-' + month + '-' +  day + '_' + hour + ':' + minute + ':' + sec + '.' + micsec
# print("curTime : " + dateString)
	return str(dateString)

# SQL_DROPTABLE()
# SQL_CREATETABLE()

#angry, happy, surprise, sad
#for i in range(0,10) :
#	feelingArr = ['angry', 'happy', 'surprise', 'sad']
#	index = int(random.uniform(0, len(feelingArr)))
#	SQL_INSERT(feelingArr[index])
#	time.sleep(1)
