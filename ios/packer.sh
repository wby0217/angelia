#!/bin/bash

#error message sent to builderror
builderror="Build/error_log"
exec 2>$builderror

#	params num less than 1
# if [[ $# -lt 1 ]]; then #
# 	exit -1
# fi

if [[ $1 = '-f' ]]; then
	conf=$2
# 	app_version_string=$3
# 	app_version=$3
# 	if [[ $# -eq 4 ]]; then
# 		app_version=$4
# 	fi
# else
# 	app_version_string=$1
# 	app_version=$1
# 	if [[ $# -eq 2 ]]; then
# 		app_version=$2
# 	fi
fi

# if [[ -z $app_version_string || $app_version_string =~ \d+(\.\d+)* ]]; then
# 	echo -e "\033[0;31mapp short version is wrong:$app_version_string\033[0m"
# 	exit -1
# fi
# if [[ -z !$app_version || $app_version =~ \d+(\.\d+)* ]]; then
# 	echo -e "\033[0;31mapp version is wrong:${app_version}\033[0m"
# 	exit -1
# fi

if [[ $conf ]]; then
	list=($conf)
else
	list=`ls configs/*.conf`
fi

function build(){

	echo ">>>>>>>>>>>>>>>>>>>>>>>>>"

	if [[ !(-s $1) ]]; then
		echo "file dont exist:$1" 1>&2
		return
	fi

	echo "clean variables"
	# app_id=''
	api_server=''
	app_version=''
	app_version_string=''
	app_name=''
	app_bundle_id=''
	app_product_name=''
	app_scheme=''
	apple_id=''
	config_name=''
	code_push_server=''
	code_push_key='nJo3X17EAX1p4zcM8zQcAKkIGFfZ8ksvOPxlc'
	jpush_key=''
	umeng_key=''
	channel=''
	wechat_appid=''
	wechat_secret=''
	qq_appid=''
	qq_secret=''
	qq_callback=''
	sina_appid=''
	sina_secret=''
	sina_callback=''

	app_icon_path=''
	provisioning_profile_uuid=''
	team_id=''

	. ./$1
	app_icon_path="configs/icons/${config_name}/"
	app_image_path="configs/launchImages/${config_name}/"

	if [[ -z $app_version_string || $app_version_string =~ \d+(\.\d+)* ]]; then
		echo -e "\033[0;31mapp short version is wrong:$app_version_string\033[0m"
		exit -1
	fi
	if [[ -z !$app_version || $app_version =~ \d+(\.\d+)* ]]; then
		echo -e "\033[0;31mapp version is wrong:${app_version}\033[0m"
		exit -1
	fi

	info_file='angelia/Info.plist'
#	constant_file='${YOUR_PROJECT_FOLDER}/MBConstants_mb.m'
	project_file='angelia.xcodeproj/project.pbxproj'
	appDelegate_file='angelia/AppDelegate.m'
	appConfiguration_file='angelia/ReactBridge/AppConfigurationModule.m'
	# google_file='${YOUR_PROJECT_FOLDER}/GoogleService-Info.plist'
	echo "using conf:$1"
	echo "backup files:"
	echo "> ${info_file}.bp"
#	echo "> ${constant_file}.bp"
	echo "> ${project_file}.bp"
	echo "> ${appDelegate_file}.bp"
	echo "> ${appConfiguration_file}.bp"
	cp $info_file ${info_file}.bp
#	cp $constant_file ${constant_file}.bp
	cp $project_file ${project_file}.bp
	cp $appDelegate_file ${appDelegate_file}.bp
	cp $appConfiguration_file ${appConfiguration_file}.bp

	# copy config file
	# rm -rf ../app/config/*.png
	# \cp -R ../scripts/config/$config_name/* ../src/config/

	if [[ $app_icon_path ]]; then
		echo "copy icons from:${app_icon_path}"
		cp -R ${app_icon_path} angelia/Images.xcassets/AppIcon.appiconset
		cp -R ${app_image_path} angelia/Images.xcassets/lanuch-small.imageset
	fi

	echo "create the app on iTC and Dev portal"
	fastlane produce --username ${apple_id} --app_identifier ${app_bundle_id} --app_name ${app_name}

	echo "create push the Certs"
	fastlane pem --username ${apple_id} --app_identifier ${app_bundle_id} --output_path ./configs/pushCerts/ --p12_password "111111"

	echo "sync match"
	fastlane match --git_branch ${apple_id} -y appstore -a ${app_bundle_id} -u ${apple_id} -r "git@gitlab.kosun.net:iOS-Team/Certificates.git" --force_for_new_devices

	echo "enter the profile uuid:"
	read provisioning_profile_uuid
	echo "enter the team id:"
	read team_id
	# echo "enter the bundle id:"
	# read app_bundle_id

	echo ">> start building"

	echo ">> editing file:${appDelegate_file}"
	# if [[ $jpush_key ]]; then
	# 	echo "changing jpush key to:${jpush_key}"
	# 	sed -i '' "s/JPUSH_KEY/${jpush_key}/" $appDelegate_file #to be confirmed
	# fi
	# if [[ $ga_key ]]; then
	# 	echo "changing ga key to: ${ga_key}"
	# 	sed -i '' "s/${YOUR_GA_KEY}/${ga_key}/" $appDelegate_file
		# echo ">> editing file:${google_file}"
		# sed -i '' "s/${YOUR_GA_KEY}/${ga_key}/"  $google_file
	# fi
	# sed -i '' "s/${YOUR_BUNDLE_ID}/${app_bundle_id}/"  $google_file

	echo ">> editing file: ${appConfiguration_file}"
	if [[ $code_push_server ]]; then
		echo "changing code_push_server to:${code_push_server}"
		sed -i '' "s#todo-codePushServerURL#${code_push_server}#" $appConfiguration_file
	fi
	if [[ $code_push_key ]]; then
		echo "changing code_push_key to:${code_push_key}"
		sed -i '' "s/todo-codePushKey/${code_push_key}/" $appConfiguration_file
	fi
	if [[ $jpush_key ]]; then
		echo "changing jpush_key to:${jpush_key}"
		sed -i '' "s/todo-jpushAppKey/${jpush_key}/" $appConfiguration_file
	fi
	if [[ $umeng_key ]]; then
		echo "changing umeng_key to:${umeng_key}"
		sed -i '' "s/todo-umengAppKey/${umeng_key}/" $appConfiguration_file
	fi
	if [[ $api_server ]]; then
		echo "changing api_server to:${api_server}"
		sed -i '' "s#todo-apiServer#${api_server}#" $appConfiguration_file
	fi
	if [[ $channel ]]; then
		echo "changing channel to:${channel}"
		sed -i '' "s/todo-channel/${channel}/" $appConfiguration_file
	fi
	# if [[ $wechat_appid ]]; then
		echo "changing wechat_appid to:${wechat_appid}"
		sed -i '' "s/todo-socialWechatAppId/${wechat_appid}/" $appConfiguration_file
	# fi
	# if [[ $wechat_secret ]]; then
		echo "changing wechat_secret to:${wechat_secret}"
		sed -i '' "s/todo-socialWechatAppSecret/${wechat_secret}/" $appConfiguration_file
	# fi
	# if [[ $qq_appid ]]; then
		echo "changing qq_appid to:${qq_appid}"
		sed -i '' "s/todo-socialQQAppId/${qq_appid}/" $appConfiguration_file
	# fi
	# if [[ $qq_secret ]]; then
		echo "changing qq_secret to:${qq_secret}"
		sed -i '' "s/todo-socialQQAppSecret/${qq_secret}/" $appConfiguration_file
	# fi
	# if [[ $qq_callback ]]; then
		echo "changing qq_callback to:${qq_callback}"
		sed -i '' "s#todo-socialQQAppCallback#${qq_callback}#" $appConfiguration_file
	# fi
	# if [[ $sina_appid ]]; then
		echo "changing sina_appid to:${sina_appid}"
		sed -i '' "s/todo-socialSinaWeiboAppId/${sina_appid}/" $appConfiguration_file
	# fi
	# if [[ $sina_secret ]]; then
		echo "changing sina_secret to:${sina_secret}"
		sed -i '' "s/todo-socialSinaWeiboAppSecret/${sina_secret}/" $appConfiguration_file
	# fi
	# if [[ $sina_callback ]]; then
		echo "changing sina_callback to:${sina_callback}"
		sed -i '' "s#todo-socialSinaWeiboAppCallback#${sina_callback}#" $appConfiguration_file
	# fi

	echo ">> editing file:${info_file}"
	echo "changing app id to:${app_id}"
	# /usr/libexec/PlistBuddy -c "Set :AppStoreID ${app_id}" $info_file
	echo "set app version string:${app_version_string}"
	/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString ${app_version_string}" $info_file
	echo "set app version:${app_version}"
	/usr/libexec/PlistBuddy -c "Set :CFBundleVersion ${app_version}" $info_file
	echo "changing app name to:$app_product_name"
	/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${app_product_name}" $info_file
	if [[ $app_scheme ]]; then
		echo "changing app scheme to:${app_scheme}"
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:0:CFBundleURLName ${app_scheme}" $info_file
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:0:CFBundleURLSchemes:0 ${app_bundle_id}" $info_file
	fi
	# if [[ $code_push_key ]]; then
	# 	echo "changing code push deployment key:${code_push_key}"
	# 	/usr/libexec/PlistBuddy -c "Set :CodePushDeploymentKey ${code_push_key}" $info_file
	# fi
	if [[ $wechat_appid ]]; then
		echo "changing weibo scheme to:wb${wechat_appid}"
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:1:CFBundleURLSchemes:0 ${wechat_appid}" $info_file
	fi
	if [[ $qq_appid ]]; then
		qq_appid_c16=`echo "ibase=10;obase=16;${qq_appid}"|bc`
		echo "changing qq scheme to:${qq_appid} and ${qq_appid_c16}"
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:2:CFBundleURLSchemes:0 QQ${qq_appid_c16}" $info_file
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:3:CFBundleURLSchemes:0 tencent${qq_appid}" $info_file
	fi
	if [[ $sina_appid ]]; then
		echo "changing sina scheme to:${sina_appid}"
		/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:4:CFBundleURLSchemes:0 wb${sina_appid}" $info_file
	fi
	# if [[ $jpush_key ]]; then
	# 	echo "changing jpush key to:${jpush_key}"
	# 	/usr/libexec/PlistBuddy -c "Set :JPUSH_KEY ${jpush_key}" $info_file
	# fi
	# if [[ $weibo_key ]]; then
	# 	echo "changing weibo scheme to:wb${weibo_key}"
	# 	/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:2:CFBundleURLSchemes:0 wb${weibo_key}" $info_file
	# fi
	# if [[ $qq_id ]]; then
	# 	echo "changing qq scheme to:tencent${qq_id}"
	# 	/usr/libexec/PlistBuddy -c "Set :CFBundleURLTypes:3:CFBundleURLSchemes:0 tencent${qq_id}" $info_file
	# fi

#	if [[ $app_scheme ]]; then
#		echo "changing alipay scheme to:${app_scheme}"
#		sed -i '' "s/${YOUR_APP_SCHEME}/${app_scheme}/" $constant_file
#	fi
#	if [[ $qq_id ]]; then
#		echo "changing qq id to:${qq_id}"
#		sed -i '' "s/${YOUR_QQ_ID}/${qq_id}/" $constant_file
#	fi
#	if [[ $weibo_key ]]; then
#		echo "changing weibo key to:${weibo_key}"
#		sed -i '' "s/${YOUR_WEIBO_KEY}/${weibo_key}/" $constant_file
#	fi
#	if [[ $weibo_secret ]]; then
#		echo "changing weibo secret to:${weibo_secret}"
#		sed -i '' "s/${YOUR_WEIWEB_SECRET}/${weibo_secret}/" $constant_file
#	fi
#	echo "changing app name to:${app_name}"
#	sed -i '' "s/${YOUR_APP_NAME}/${app_name}/" $constant_file



	echo "> editing project file"
	echo "changing target name to: ${app_product_name}"
	sed -i '' "s/PRODUCT_NAME = .*\";$/PRODUCT_NAME = \"${app_product_name}\";/" $project_file
	echo "changing bundle id to: ${app_bundle_id}"
	sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = .*;/PRODUCT_BUNDLE_IDENTIFIER = ${app_bundle_id};/" $project_file
	echo "changing CODE_SIGN_IDENTITY to: auto"
	sed -i '' "s/CODE_SIGN_IDENTITY = .*\"/CODE_SIGN_IDENTITY = \"iPhone Distribution\"/" $project_file
	sed -i '' "s/CODE_SIGN_IDENTITY\[sdk=iphoneos\*\].*;/CODE_SIGN_IDENTITY[sdk=iphoneos*]\" = \"iPhone Distribution\";/" $project_file
	echo "changing provisioning profile to:${provisioning_profile_uuid}"
	sed -i '' "s/PROVISIONING_PROFILE = .*\"/PROVISIONING_PROFILE = \"${provisioning_profile_uuid}\"/" $project_file
	echo "changing development team to:${team_id}"
	sed -i '' "/ECD6R8BSQA/!s/DEVELOPMENT_TEAM = .*/DEVELOPMENT_TEAM = ${team_id};/" $project_file
	sed -i '' "/ECD6R8BSQA/!s/DevelopmentTeam = .*/DevelopmentTeam = ${team_id};/" $project_file

	ipa_path='Build/'
	ipa_name=${app_product_name}_${app_version_string}_${app_version}
	echo ">> run gym"
	fastlane gym --scheme ${app_scheme} --clean true --configuration "Release" --output_directory ${ipa_path} --output_name $ipa_name --include_symbols
	# fastlane gym --scheme ${app_scheme} --clean true --configuration "Ad-hoc" --output_directory ${ipa_path} --use_legacy_build_api true --output_name $ipa_name --include_symbols true

	echo ">> done build $1"
	echo ">> create Deliverfile"
	echo "submission_information({
	add_id_info_uses_idfa:true,
	add_id_info_serves_ads:true,
	add_id_info_limits_tracking:true,
	export_compliance_uses_encryption:false,
	export_compliance_encryption_updated:false})" > Deliverfile
	echo ">> deliver ipa"

	# fastlane deliver -u ${apple_id} -a ${app_bundle_id} -i ${ipa_path}${ipa_name}.ipa -z ${app_version_string} --force --skip_screenshots --skip_metadata # --submit_for_review -f
	# fastlane pilot upload -u ${apple_id} -a ${app_bundle_id} -i ${ipa_path}${ipa_name}.ipa -z ${app_version_string}


	echo ">> restore files"
	echo ">> build finish app:${app_product_name}"
	cp ${info_file}.bp $info_file
#	cp ${constant_file}.bp $constant_file
	cp ${project_file}.bp $project_file
	cp ${appDelegate_file}.bp $appDelegate_file
	cp ${appConfiguration_file}.bp $appConfiguration_file
	rm ${info_file}.bp
#	rm ${constant_file}.bp
	rm ${project_file}.bp
	rm ${appDelegate_file}.bp
	rm ${appConfiguration_file}.bp
	rm Deliverfile
	# git checkout ${YOUR_PROJECT_FOLDER}/Assets.xcassets/AppIcon.appiconset/*
	# git checkout $google_file
}
echo ">> app version string:$app_version_string"
echo ">> app version:$app_version"
for i in $list; do
	build $i
done
#print error message
err=$(<${builderror})
if [[ $err ]]; then
	echo -e "\033[0;31m\c"
	echo "Build Error Message:"
	echo "----------------------------"
	printf "$err\n"
	echo "----------------------------"
	echo -e "\033[0m\c"
fi
rm $builderror
echo -e ">>:\033[0;32;1mAll Build Done\033[0m"
echo "conf list:${list}"
