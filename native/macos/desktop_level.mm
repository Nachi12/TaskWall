#import <Cocoa/Cocoa.h>
#include <node_api.h>

napi_value SetDesktopLevel(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    void* bufferData;
    size_t bufferLength;
    napi_get_buffer_info(env, args[0], &bufferData, &bufferLength);

    if (bufferLength >= sizeof(void*)) {
        NSView* view = *(NSView**)bufferData;
        if (view && [view isKindOfClass:[NSView class]]) {
            NSWindow* window = [view window];
            if (window) {
                // Set window level to -1 (strictly behind all normal application windows at 0)
                [window setLevel: -1];

                // Prevent window from displacing during Mission Control, pin to all spaces, ignore Cmd+Tab
                [window setCollectionBehavior: 
                    NSWindowCollectionBehaviorCanJoinAllSpaces | 
                    NSWindowCollectionBehaviorStationary | 
                    NSWindowCollectionBehaviorIgnoresCycle |
                    NSWindowCollectionBehaviorFullScreenAuxiliary];

                [window orderBack: nil];
                [window setHidesOnDeactivate: NO];
                [window setCanHide: NO];

                return args[0];
            }
        }
    }
    return NULL;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value fn;
    napi_create_function(env, NULL, 0, SetDesktopLevel, NULL, &fn);
    napi_set_named_property(env, exports, "setDesktopLevel", fn);
    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
