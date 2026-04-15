import Foundation

public enum KiboDeviceCommand: String, Codable, Sendable {
    case status = "device.status"
    case info = "device.info"
}

public enum KiboBatteryState: String, Codable, Sendable {
    case unknown
    case unplugged
    case charging
    case full
}

public enum KiboThermalState: String, Codable, Sendable {
    case nominal
    case fair
    case serious
    case critical
}

public enum KiboNetworkPathStatus: String, Codable, Sendable {
    case satisfied
    case unsatisfied
    case requiresConnection
}

public enum KiboNetworkInterfaceType: String, Codable, Sendable {
    case wifi
    case cellular
    case wired
    case other
}

public struct KiboBatteryStatusPayload: Codable, Sendable, Equatable {
    public var level: Double?
    public var state: KiboBatteryState
    public var lowPowerModeEnabled: Bool

    public init(level: Double?, state: KiboBatteryState, lowPowerModeEnabled: Bool) {
        self.level = level
        self.state = state
        self.lowPowerModeEnabled = lowPowerModeEnabled
    }
}

public struct KiboThermalStatusPayload: Codable, Sendable, Equatable {
    public var state: KiboThermalState

    public init(state: KiboThermalState) {
        self.state = state
    }
}

public struct KiboStorageStatusPayload: Codable, Sendable, Equatable {
    public var totalBytes: Int64
    public var freeBytes: Int64
    public var usedBytes: Int64

    public init(totalBytes: Int64, freeBytes: Int64, usedBytes: Int64) {
        self.totalBytes = totalBytes
        self.freeBytes = freeBytes
        self.usedBytes = usedBytes
    }
}

public struct KiboNetworkStatusPayload: Codable, Sendable, Equatable {
    public var status: KiboNetworkPathStatus
    public var isExpensive: Bool
    public var isConstrained: Bool
    public var interfaces: [KiboNetworkInterfaceType]

    public init(
        status: KiboNetworkPathStatus,
        isExpensive: Bool,
        isConstrained: Bool,
        interfaces: [KiboNetworkInterfaceType])
    {
        self.status = status
        self.isExpensive = isExpensive
        self.isConstrained = isConstrained
        self.interfaces = interfaces
    }
}

public struct KiboDeviceStatusPayload: Codable, Sendable, Equatable {
    public var battery: KiboBatteryStatusPayload
    public var thermal: KiboThermalStatusPayload
    public var storage: KiboStorageStatusPayload
    public var network: KiboNetworkStatusPayload
    public var uptimeSeconds: Double

    public init(
        battery: KiboBatteryStatusPayload,
        thermal: KiboThermalStatusPayload,
        storage: KiboStorageStatusPayload,
        network: KiboNetworkStatusPayload,
        uptimeSeconds: Double)
    {
        self.battery = battery
        self.thermal = thermal
        self.storage = storage
        self.network = network
        self.uptimeSeconds = uptimeSeconds
    }
}

public struct KiboDeviceInfoPayload: Codable, Sendable, Equatable {
    public var deviceName: String
    public var modelIdentifier: String
    public var systemName: String
    public var systemVersion: String
    public var appVersion: String
    public var appBuild: String
    public var locale: String

    public init(
        deviceName: String,
        modelIdentifier: String,
        systemName: String,
        systemVersion: String,
        appVersion: String,
        appBuild: String,
        locale: String)
    {
        self.deviceName = deviceName
        self.modelIdentifier = modelIdentifier
        self.systemName = systemName
        self.systemVersion = systemVersion
        self.appVersion = appVersion
        self.appBuild = appBuild
        self.locale = locale
    }
}
