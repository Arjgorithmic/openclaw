import CoreLocation
import Foundation
import KiboKit
import UIKit

typealias KiboCameraSnapResult = (format: String, base64: String, width: Int, height: Int)
typealias KiboCameraClipResult = (format: String, base64: String, durationMs: Int, hasAudio: Bool)

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: KiboCameraSnapParams) async throws -> KiboCameraSnapResult
    func clip(params: KiboCameraClipParams) async throws -> KiboCameraClipResult
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: KiboLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: KiboLocationGetParams,
        desiredAccuracy: KiboLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: KiboLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

@MainActor
protocol DeviceStatusServicing: Sendable {
    func status() async throws -> KiboDeviceStatusPayload
    func info() -> KiboDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: KiboPhotosLatestParams) async throws -> KiboPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: KiboContactsSearchParams) async throws -> KiboContactsSearchPayload
    func add(params: KiboContactsAddParams) async throws -> KiboContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: KiboCalendarEventsParams) async throws -> KiboCalendarEventsPayload
    func add(params: KiboCalendarAddParams) async throws -> KiboCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: KiboRemindersListParams) async throws -> KiboRemindersListPayload
    func add(params: KiboRemindersAddParams) async throws -> KiboRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: KiboMotionActivityParams) async throws -> KiboMotionActivityPayload
    func pedometer(params: KiboPedometerParams) async throws -> KiboPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalResolveEvent: Sendable, Equatable {
    var replyId: String
    var approvalId: String
    var decision: KiboWatchExecApprovalDecision
    var sentAtMs: Int?
    var transport: String
}

struct WatchExecApprovalSnapshotRequestEvent: Sendable, Equatable {
    var requestId: String
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setStatusHandler(_ handler: (@Sendable (WatchMessagingStatus) -> Void)?)
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func setExecApprovalResolveHandler(_ handler: (@Sendable (WatchExecApprovalResolveEvent) -> Void)?)
    func setExecApprovalSnapshotRequestHandler(
        _ handler: (@Sendable (WatchExecApprovalSnapshotRequestEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: KiboWatchNotifyParams) async throws -> WatchNotificationSendResult
    func sendExecApprovalPrompt(
        _ message: KiboWatchExecApprovalPromptMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalResolved(
        _ message: KiboWatchExecApprovalResolvedMessage) async throws -> WatchNotificationSendResult
    func sendExecApprovalExpired(
        _ message: KiboWatchExecApprovalExpiredMessage) async throws -> WatchNotificationSendResult
    func syncExecApprovalSnapshot(
        _ message: KiboWatchExecApprovalSnapshotMessage) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
