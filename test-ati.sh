#!/bin/bash

print_error() {
	echo "Site error! Check logs and screenshots"

	echo
	echo "/tmp/ati-testing.log:"
	cat /tmp/ati-testing.log
}

had_error() {
	ATTACH=""
	for f in $TMP_DIR/*; do
		ATTACH="$ATTACH -a $f"
	done

	print_error | mail -s "ATI Tests Failed $(date)" $ATTACH
	exit
}

TMP_DIR=$(mktemp -d)

cd /home/khw/ati-testing
find /home/khw/ati-testing/screenshots/ -mtime +7 -type f -delete

yarn test $TMP_DIR >& /tmp/ati-testing.log || had_error
yarn sfo-test $TMP_DIR >& /tmp/ati-testing.log || had_error

grep failing /tmp/ati-testing.log

rm -rf $TMP_DIR

find /tmp/ -maxdepth 1 -name "yarn*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
find /tmp/ -maxdepth 1 -name ".com.google.Chrome.*" -type d -mtime +1 -exec rm -rf {} \; > /dev/null
