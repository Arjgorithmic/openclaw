import Foundation
import Testing
@testable import Kibo

@Suite(.serialized) struct NodeServiceManagerTests {
    @Test func `builds node service commands with current CLI shape`() async throws {
        try await TestIsolation.withUserDefaultsValues(["kibo.gatewayProjectRootPath": nil]) {
            let tmp = try makeTempDirForTests()
            CommandResolver.setProjectRoot(tmp.path)

            let kiboPath = tmp.appendingPathComponent("node_modules/.bin/kibo")
            try makeExecutableForTests(at: kiboPath)

            let start = NodeServiceManager._testServiceCommand(["start"])
            #expect(start == [kiboPath.path, "node", "start", "--json"])

            let stop = NodeServiceManager._testServiceCommand(["stop"])
            #expect(stop == [kiboPath.path, "node", "stop", "--json"])
        }
    }
}
