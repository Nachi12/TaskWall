import Cocoa

// Helper to set window level to desktop icon window level + 1 (-2147483602)
// and set collection behavior to stationary, canJoinAllSpaces, ignoresCycle
if CommandLine.arguments.count > 1, let windowNumber = Int(CommandLine.arguments[1]) {
    for window in NSApplication.shared.windows {
        if window.windowNumber == windowNumber {
            window.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.desktopIconWindow)) + 1)
            window.collectionBehavior = [.canJoinAllSpaces, .stationary, .ignoresCycle]
            print("SUCCESS")
            exit(0)
        }
    }
}
print("READY")
