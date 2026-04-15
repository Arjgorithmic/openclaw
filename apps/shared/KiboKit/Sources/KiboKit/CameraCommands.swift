import Foundation

public enum KiboCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum KiboCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum KiboCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum KiboCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct KiboCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: KiboCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: KiboCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: KiboCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: KiboCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct KiboCameraClipParams: Codable, Sendable, Equatable {
    public var facing: KiboCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: KiboCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: KiboCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: KiboCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
