import Testing
@testable import Kibo

@Suite(.serialized) struct KiboAppDelegateTests {
    @Test @MainActor func resolvesRegistryModelBeforeViewTaskAssignsDelegateModel() {
        let registryModel = NodeAppModel()
        KiboAppModelRegistry.appModel = registryModel
        defer { KiboAppModelRegistry.appModel = nil }

        let delegate = KiboAppDelegate()

        #expect(delegate._test_resolvedAppModel() === registryModel)
    }

    @Test @MainActor func prefersExplicitDelegateModelOverRegistryFallback() {
        let registryModel = NodeAppModel()
        let explicitModel = NodeAppModel()
        KiboAppModelRegistry.appModel = registryModel
        defer { KiboAppModelRegistry.appModel = nil }

        let delegate = KiboAppDelegate()
        delegate.appModel = explicitModel

        #expect(delegate._test_resolvedAppModel() === explicitModel)
    }
}
