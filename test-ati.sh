#!/bin/bash

print_error() {
	echo "Site error! Check logs and screenshots"

	echo
	echo "/tmp/ati-testing.log:"
	cat /tmp/ati-testing.log
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
yarn test >& /tmp/ati-testing.log || had_error
yarn sfo-test >& /tmp/ati-testing-sfo.log || had_error

grep failing /tmp/ati-testing*.log

rm -rf $TMP_DIR

find /tmp/ -maxdepth 1 -name "yarn*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
find /tmp/ -maxdepth 1 -name ".com.google.Chrome.*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
