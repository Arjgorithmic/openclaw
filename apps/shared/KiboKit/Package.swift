// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "KiboKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "KiboProtocol", targets: ["KiboProtocol"]),
        .library(name: "KiboKit", targets: ["KiboKit"]),
        .library(name: "KiboChatUI", targets: ["KiboChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/kibo/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "KiboProtocol",
            path: "Sources/KiboProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KiboKit",
            dependencies: [
                "KiboProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/KiboKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "KiboChatUI",
            dependencies: [
                "KiboKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/KiboChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "KiboKitTests",
            dependencies: ["KiboKit", "KiboChatUI"],
            path: "Tests/KiboKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
