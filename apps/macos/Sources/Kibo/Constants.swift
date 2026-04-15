import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-kibo writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.kibo.mac"
let gatewayLaunchdLabel = "ai.kibo.gateway"
let onboardingVersionKey = "kibo.onboardingVersion"
let onboardingSeenKey = "kibo.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "kibo.pauseEnabled"
let iconAnimationsEnabledKey = "kibo.iconAnimationsEnabled"
let swabbleEnabledKey = "kibo.swabbleEnabled"
let swabbleTriggersKey = "kibo.swabbleTriggers"
let voiceWakeTriggerChimeKey = "kibo.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "kibo.voiceWakeSendChime"
let showDockIconKey = "kibo.showDockIcon"
let defaultVoiceWakeTriggers = ["kibo"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "kibo.voiceWakeMicID"
let voiceWakeMicNameKey = "kibo.voiceWakeMicName"
let voiceWakeLocaleKey = "kibo.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "kibo.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "kibo.voicePushToTalkEnabled"
let voiceWakeTriggersTalkModeKey = "kibo.voiceWakeTriggersTalkMode"
let talkEnabledKey = "kibo.talkEnabled"
let iconOverrideKey = "kibo.iconOverride"
let connectionModeKey = "kibo.connectionMode"
let remoteTargetKey = "kibo.remoteTarget"
let remoteIdentityKey = "kibo.remoteIdentity"
let remoteProjectRootKey = "kibo.remoteProjectRoot"
let remoteCliPathKey = "kibo.remoteCliPath"
let canvasEnabledKey = "kibo.canvasEnabled"
let cameraEnabledKey = "kibo.cameraEnabled"
let systemRunPolicyKey = "kibo.systemRunPolicy"
let systemRunAllowlistKey = "kibo.systemRunAllowlist"
let systemRunEnabledKey = "kibo.systemRunEnabled"
let locationModeKey = "kibo.locationMode"
let locationPreciseKey = "kibo.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "kibo.peekabooBridgeEnabled"
let deepLinkKeyKey = "kibo.deepLinkKey"
let modelCatalogPathKey = "kibo.modelCatalogPath"
let modelCatalogReloadKey = "kibo.modelCatalogReload"
let cliInstallPromptedVersionKey = "kibo.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "kibo.heartbeatsEnabled"
let debugPaneEnabledKey = "kibo.debugPaneEnabled"
let debugFileLogEnabledKey = "kibo.debug.fileLogEnabled"
let appLogLevelKey = "kibo.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
