#!/bin/bash

print_error() {
	echo "Site error! Check logs and screenshots"

	echo
	echo $ERROR_LOG":"
	cat $ERROR_LOG
}

had_error() {
	print_error
	exit
}

TMP_DIR=$(mktemp -d)
export ATI_TEST_DIR=$TMP_DIR

cd /home/khw/ati-testing
mkdir -p /home/khw/ati-testing/screenshots/
find /home/khw/ati-testing/screenshots/ -mtime +7 -delete

PATH=$PATH:/usr/local/bin
ERROR_LOG=/tmp/ati-testing.log 
yarn test >& $ERROR_LOG || had_error
ERROR_LOG=/tmp/ati-testing-sfo.log 
yarn sfo-test >& $ERROR_LOG || had_error

grep failing /tmp/ati-testing*.log

rm -rf $TMP_DIR

find /tmp/ -maxdepth 1 -name "yarn*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
find /tmp/ -maxdepth 1 -name ".com.google.Chrome.*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
