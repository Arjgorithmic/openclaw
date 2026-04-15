// swift-tools-version: 6.2
// Package manifest for the Kibo macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "Kibo",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "KiboIPC", targets: ["KiboIPC"]),
        .library(name: "KiboDiscovery", targets: ["KiboDiscovery"]),
        .executable(name: "Kibo", targets: ["Kibo"]),
        .executable(name: "kibo-mac", targets: ["KiboMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.4.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.10.1"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.9.0"),
        .package(url: "https://github.com/kibo/Peekaboo.git", branch: "main"),
        .package(url: "https://github.com/Blaizzy/mlx-audio-swift", exact: "0.1.2"),
        .package(path: "../shared/KiboKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "KiboIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KiboDiscovery",
            dependencies: [
                .product(name: "KiboKit", package: "KiboKit"),
            ],
            path: "Sources/KiboDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "Kibo",
            dependencies: [
                "KiboIPC",
                "KiboDiscovery",
                .product(name: "KiboKit", package: "KiboKit"),
                .product(name: "KiboChatUI", package: "KiboKit"),
                .product(name: "KiboProtocol", package: "KiboKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
                .product(name: "MLXAudioTTS", package: "mlx-audio-swift"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/Kibo.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "KiboMacCLI",
            dependencies: [
                "KiboDiscovery",
                .product(name: "KiboKit", package: "KiboKit"),
                .product(name: "KiboProtocol", package: "KiboKit"),
            ],
            path: "Sources/KiboMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "KiboIPCTests",
            dependencies: [
                "KiboIPC",
                "Kibo",
                "KiboDiscovery",
                .product(name: "KiboProtocol", package: "KiboKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
