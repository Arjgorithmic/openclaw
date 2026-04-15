package ai.kibo.app.node

import ai.kibo.app.protocol.KiboCalendarCommand
import ai.kibo.app.protocol.KiboCameraCommand
import ai.kibo.app.protocol.KiboCallLogCommand
import ai.kibo.app.protocol.KiboCapability
import ai.kibo.app.protocol.KiboContactsCommand
import ai.kibo.app.protocol.KiboDeviceCommand
import ai.kibo.app.protocol.KiboLocationCommand
import ai.kibo.app.protocol.KiboMotionCommand
import ai.kibo.app.protocol.KiboNotificationsCommand
import ai.kibo.app.protocol.KiboPhotosCommand
import ai.kibo.app.protocol.KiboSmsCommand
import ai.kibo.app.protocol.KiboSystemCommand
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class InvokeCommandRegistryTest {
  private val coreCapabilities =
    setOf(
      KiboCapability.Canvas.rawValue,
      KiboCapability.Device.rawValue,
      KiboCapability.Notifications.rawValue,
      KiboCapability.System.rawValue,
      KiboCapability.Photos.rawValue,
      KiboCapability.Contacts.rawValue,
      KiboCapability.Calendar.rawValue,
    )

  private val optionalCapabilities =
    setOf(
      KiboCapability.Camera.rawValue,
      KiboCapability.Location.rawValue,
      KiboCapability.Sms.rawValue,
      KiboCapability.CallLog.rawValue,
      KiboCapability.VoiceWake.rawValue,
      KiboCapability.Motion.rawValue,
    )

  private val coreCommands =
    setOf(
      KiboDeviceCommand.Status.rawValue,
      KiboDeviceCommand.Info.rawValue,
      KiboDeviceCommand.Permissions.rawValue,
      KiboDeviceCommand.Health.rawValue,
      KiboNotificationsCommand.List.rawValue,
      KiboNotificationsCommand.Actions.rawValue,
      KiboSystemCommand.Notify.rawValue,
      KiboPhotosCommand.Latest.rawValue,
      KiboContactsCommand.Search.rawValue,
      KiboContactsCommand.Add.rawValue,
      KiboCalendarCommand.Events.rawValue,
      KiboCalendarCommand.Add.rawValue,
    )

  private val optionalCommands =
    setOf(
      KiboCameraCommand.Snap.rawValue,
      KiboCameraCommand.Clip.rawValue,
      KiboCameraCommand.List.rawValue,
      KiboLocationCommand.Get.rawValue,
      KiboMotionCommand.Activity.rawValue,
      KiboMotionCommand.Pedometer.rawValue,
      KiboSmsCommand.Send.rawValue,
      KiboSmsCommand.Search.rawValue,
      KiboCallLogCommand.Search.rawValue,
    )

  private val debugCommands = setOf("debug.logs", "debug.ed25519")

  @Test
  fun advertisedCapabilities_respectsFeatureAvailability() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags())

    assertContainsAll(capabilities, coreCapabilities)
    assertMissingAll(capabilities, optionalCapabilities)
  }

  @Test
  fun advertisedCapabilities_includesFeatureCapabilitiesWhenEnabled() {
    val capabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          voiceWakeEnabled = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
        ),
      )

    assertContainsAll(capabilities, coreCapabilities + optionalCapabilities)
  }

  @Test
  fun advertisedCommands_respectsFeatureAvailability() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags())

    assertContainsAll(commands, coreCommands)
    assertMissingAll(commands, optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_includesFeatureCommandsWhenEnabled() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(
          cameraEnabled = true,
          locationEnabled = true,
          sendSmsAvailable = true,
          readSmsAvailable = true,
          smsSearchPossible = true,
          callLogAvailable = true,
          motionActivityAvailable = true,
          motionPedometerAvailable = true,
          debugBuild = true,
        ),
      )

    assertContainsAll(commands, coreCommands + optionalCommands + debugCommands)
  }

  @Test
  fun advertisedCommands_onlyIncludesSupportedMotionCommands() {
    val commands =
      InvokeCommandRegistry.advertisedCommands(
        NodeRuntimeFlags(
          cameraEnabled = false,
          locationEnabled = false,
          sendSmsAvailable = false,
          readSmsAvailable = false,
          smsSearchPossible = false,
          callLogAvailable = false,
          voiceWakeEnabled = false,
          motionActivityAvailable = true,
          motionPedometerAvailable = false,
          debugBuild = false,
        ),
      )

    assertTrue(commands.contains(KiboMotionCommand.Activity.rawValue))
    assertFalse(commands.contains(KiboMotionCommand.Pedometer.rawValue))
  }

  @Test
  fun advertisedCommands_splitsSmsSendAndSearchAvailability() {
    val readOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(readSmsAvailable = true, smsSearchPossible = true),
      )
    val sendOnlyCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCommands =
      InvokeCommandRegistry.advertisedCommands(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCommands.contains(KiboSmsCommand.Search.rawValue))
    assertFalse(readOnlyCommands.contains(KiboSmsCommand.Send.rawValue))
    assertTrue(sendOnlyCommands.contains(KiboSmsCommand.Send.rawValue))
    assertFalse(sendOnlyCommands.contains(KiboSmsCommand.Search.rawValue))
    assertTrue(requestableSearchCommands.contains(KiboSmsCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_includeSmsWhenEitherSmsPathIsAvailable() {
    val readOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(readSmsAvailable = true),
      )
    val sendOnlyCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(sendSmsAvailable = true),
      )
    val requestableSearchCapabilities =
      InvokeCommandRegistry.advertisedCapabilities(
        defaultFlags(smsSearchPossible = true),
      )

    assertTrue(readOnlyCapabilities.contains(KiboCapability.Sms.rawValue))
    assertTrue(sendOnlyCapabilities.contains(KiboCapability.Sms.rawValue))
    assertFalse(requestableSearchCapabilities.contains(KiboCapability.Sms.rawValue))
  }

  @Test
  fun advertisedCommands_excludesCallLogWhenUnavailable() {
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(callLogAvailable = false))

    assertFalse(commands.contains(KiboCallLogCommand.Search.rawValue))
  }

  @Test
  fun advertisedCapabilities_excludesCallLogWhenUnavailable() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(callLogAvailable = false))

    assertFalse(capabilities.contains(KiboCapability.CallLog.rawValue))
  }

  @Test
  fun advertisedCapabilities_includesVoiceWakeWithoutAdvertisingCommands() {
    val capabilities = InvokeCommandRegistry.advertisedCapabilities(defaultFlags(voiceWakeEnabled = true))
    val commands = InvokeCommandRegistry.advertisedCommands(defaultFlags(voiceWakeEnabled = true))

    assertTrue(capabilities.contains(KiboCapability.VoiceWake.rawValue))
    assertFalse(commands.any { it.contains("voice", ignoreCase = true) })
  }

  @Test
  fun find_returnsForegroundMetadataForCameraCommands() {
    val list = InvokeCommandRegistry.find(KiboCameraCommand.List.rawValue)
    val location = InvokeCommandRegistry.find(KiboLocationCommand.Get.rawValue)

    assertNotNull(list)
    assertEquals(true, list?.requiresForeground)
    assertNotNull(location)
    assertEquals(false, location?.requiresForeground)
  }

  @Test
  fun find_returnsNullForUnknownCommand() {
    assertNull(InvokeCommandRegistry.find("not.real"))
  }

  private fun defaultFlags(
    cameraEnabled: Boolean = false,
    locationEnabled: Boolean = false,
    sendSmsAvailable: Boolean = false,
    readSmsAvailable: Boolean = false,
    smsSearchPossible: Boolean = false,
    callLogAvailable: Boolean = false,
    voiceWakeEnabled: Boolean = false,
    motionActivityAvailable: Boolean = false,
    motionPedometerAvailable: Boolean = false,
    debugBuild: Boolean = false,
  ): NodeRuntimeFlags =
    NodeRuntimeFlags(
      cameraEnabled = cameraEnabled,
      locationEnabled = locationEnabled,
      sendSmsAvailable = sendSmsAvailable,
      readSmsAvailable = readSmsAvailable,
      smsSearchPossible = smsSearchPossible,
      callLogAvailable = callLogAvailable,
      voiceWakeEnabled = voiceWakeEnabled,
      motionActivityAvailable = motionActivityAvailable,
      motionPedometerAvailable = motionPedometerAvailable,
      debugBuild = debugBuild,
    )

  private fun assertContainsAll(actual: List<String>, expected: Set<String>) {
    expected.forEach { value -> assertTrue(actual.contains(value)) }
  }

  private fun assertMissingAll(actual: List<String>, forbidden: Set<String>) {
    forbidden.forEach { value -> assertFalse(actual.contains(value)) }
  }
}
