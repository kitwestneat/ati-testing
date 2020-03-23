#!/bin/bash

print_error() {
	echo "Site error! Check logs and screenshots"

	echo
	echo "/tmp/ati-testing.log:"
	cat /tmp/ati-testing.log
	exit
}

cd /home/khw/ati-testing
find /home/khw/ati-testing/screenshots/ -mtime +7 -delete
yarn test >& /tmp/ati-testing.log || print_error
yarn sfo-test >& /tmp/ati-testing.log || print_error

find /tmp/ -maxdepth 1 -name "yarn*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
find /tmp/ -maxdepth 1 -name ".com.google.Chrome.*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
