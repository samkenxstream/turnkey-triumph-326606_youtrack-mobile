#!/bin/bash

set -ex

CONFIGURATION_BUILD_DIR="$(xcodebuild archive -allowProvisioningUpdates -workspace ios/YouTrackMobile.xcworkspace -scheme YouTrackMobile[Release] -archivePath ios/build/YouTrackMobile[Release].xcarchive CODE_SIGN_IDENTITY='' CODE_SIGNING_REQUIRED=NO CODE_SIGNING_ALLOWED='NO' | grep CONFIGURATION_BUILD_DIR)"
export CONFIGURATION_BUILD_DIR

cd ../
mkdir dist
cp "$TMPDIR/$(md5 -qs "$CONFIGURATION_BUILD_DIR")-main.jsbundle.map" ../dist/main.jsbundle.map
cp "$CONFIGURATION_BUILD_DIR"/main.jsbundle ../dist/main.jsbundle
