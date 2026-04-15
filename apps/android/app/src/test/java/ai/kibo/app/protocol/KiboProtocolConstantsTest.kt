package ai.kibo.app.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class KiboProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", KiboCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", KiboCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", KiboCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", KiboCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", KiboCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", KiboCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", KiboCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", KiboCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", KiboCapability.Canvas.rawValue)
    assertEquals("camera", KiboCapability.Camera.rawValue)
    assertEquals("voiceWake", KiboCapability.VoiceWake.rawValue)
    assertEquals("location", KiboCapability.Location.rawValue)
    assertEquals("sms", KiboCapability.Sms.rawValue)
    assertEquals("device", KiboCapability.Device.rawValue)
    assertEquals("notifications", KiboCapability.Notifications.rawValue)
    assertEquals("system", KiboCapability.System.rawValue)
    assertEquals("photos", KiboCapability.Photos.rawValue)
    assertEquals("contacts", KiboCapability.Contacts.rawValue)
    assertEquals("calendar", KiboCapability.Calendar.rawValue)
    assertEquals("motion", KiboCapability.Motion.rawValue)
    assertEquals("callLog", KiboCapability.CallLog.rawValue)
  }

  @Test
  fun cameraCommandsUseStableStrings() {
    assertEquals("camera.list", KiboCameraCommand.List.rawValue)
    assertEquals("camera.snap", KiboCameraCommand.Snap.rawValue)
    assertEquals("camera.clip", KiboCameraCommand.Clip.rawValue)
  }

  @Test
  fun notificationsCommandsUseStableStrings() {
    assertEquals("notifications.list", KiboNotificationsCommand.List.rawValue)
    assertEquals("notifications.actions", KiboNotificationsCommand.Actions.rawValue)
  }

  @Test
  fun deviceCommandsUseStableStrings() {
    assertEquals("device.status", KiboDeviceCommand.Status.rawValue)
    assertEquals("device.info", KiboDeviceCommand.Info.rawValue)
    assertEquals("device.permissions", KiboDeviceCommand.Permissions.rawValue)
    assertEquals("device.health", KiboDeviceCommand.Health.rawValue)
  }

  @Test
  fun systemCommandsUseStableStrings() {
    assertEquals("system.notify", KiboSystemCommand.Notify.rawValue)
  }

  @Test
  fun photosCommandsUseStableStrings() {
    assertEquals("photos.latest", KiboPhotosCommand.Latest.rawValue)
  }

  @Test
  fun contactsCommandsUseStableStrings() {
    assertEquals("contacts.search", KiboContactsCommand.Search.rawValue)
    assertEquals("contacts.add", KiboContactsCommand.Add.rawValue)
  }

  @Test
  fun calendarCommandsUseStableStrings() {
    assertEquals("calendar.events", KiboCalendarCommand.Events.rawValue)
    assertEquals("calendar.add", KiboCalendarCommand.Add.rawValue)
  }

  @Test
  fun motionCommandsUseStableStrings() {
    assertEquals("motion.activity", KiboMotionCommand.Activity.rawValue)
    assertEquals("motion.pedometer", KiboMotionCommand.Pedometer.rawValue)
  }

  @Test
  fun smsCommandsUseStableStrings() {
    assertEquals("sms.send", KiboSmsCommand.Send.rawValue)
    assertEquals("sms.search", KiboSmsCommand.Search.rawValue)
  }

  @Test
  fun callLogCommandsUseStableStrings() {
    assertEquals("callLog.search", KiboCallLogCommand.Search.rawValue)
  }

}
