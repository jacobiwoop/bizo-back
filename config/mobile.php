<?php

return [
    'apk_storage_path' => env('MOBILE_APK_STORAGE_PATH', storage_path('mobile-builds')),
    'build_script_path' => env('MOBILE_APK_BUILD_SCRIPT_PATH', base_path('scripts/build-mobile-apk.sh')),
    'build_log_path' => env('MOBILE_APK_BUILD_LOG_PATH', storage_path('mobile-builds/build.log')),
    'build_trigger_token' => env('MOBILE_APK_BUILD_TOKEN'),
];
