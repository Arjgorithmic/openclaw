import Foundation

public enum KiboRemindersCommand: String, Codable, Sendable {
    case list = "reminders.list"
    case add = "reminders.add"
}

public enum KiboReminderStatusFilter: String, Codable, Sendable {
    case incomplete
    case completed
    case all
}

public struct KiboRemindersListParams: Codable, Sendable, Equatable {
    public var status: KiboReminderStatusFilter?
    public var limit: Int?

    public init(status: KiboReminderStatusFilter? = nil, limit: Int? = nil) {
        self.status = status
        self.limit = limit
    }
}

public struct KiboRemindersAddParams: Codable, Sendable, Equatable {
    public var title: String
    public var dueISO: String?
    public var notes: String?
    public var listId: String?
    public var listName: String?

    public init(
        title: String,
        dueISO: String? = nil,
        notes: String? = nil,
        listId: String? = nil,
        listName: String? = nil)
    {
        self.title = title
        self.dueISO = dueISO
        self.notes = notes
        self.listId = listId
        self.listName = listName
    }
}

public struct KiboReminderPayload: Codable, Sendable, Equatable {
    public var identifier: String
    public var title: String
    public var dueISO: String?
    public var completed: Bool
    public var listName: String?

    public init(
        identifier: String,
        title: String,
        dueISO: String? = nil,
        completed: Bool,
        listName: String? = nil)
    {
        self.identifier = identifier
        self.title = title
        self.dueISO = dueISO
        self.completed = completed
        self.listName = listName
    }
}

public struct KiboRemindersListPayload: Codable, Sendable, Equatable {
    public var reminders: [KiboReminderPayload]

    public init(reminders: [KiboReminderPayload]) {
        self.reminders = reminders
    }
}

public struct KiboRemindersAddPayload: Codable, Sendable, Equatable {
    public var reminder: KiboReminderPayload

    public init(reminder: KiboReminderPayload) {
        self.reminder = reminder
    }
}
