#!/usr/bin/env bash

# Copy All Patch Files To Node Modules
#cp -rf `ls modules | grep -E -v "^(patch.sh)$"` ../node_modules
cp -Rf modules/ ../node_modules/

# Fix WebP Library
cd ../node_modules/react-native-webp/node_modules/.bin
rm -rf ../react-native
rm -rf react-native
ln -s ../../../react-native/local-cli/wrong-react-native.js react-native
cd -