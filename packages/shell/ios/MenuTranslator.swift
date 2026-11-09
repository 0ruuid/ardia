import Foundation

enum MenuTranslator {
  private static let languageKey = "ardia.menu.language"
  private static let tableKey = "ardia.menu.table"

  private static var language = UserDefaults.standard.string(forKey: languageKey) ?? "en"
  private static var table: [String: String] = {
    guard let data = UserDefaults.standard.data(forKey: tableKey),
          let decoded = try? JSONDecoder().decode([String: String].self, from: data) else { return [:] }
    return decoded
  }()

  static func text(_ english: String) -> String { table[english] ?? english }

  @discardableResult
  static func apply(language next: String, table nextTable: [String: String]) -> Bool {
    guard next != language || nextTable != table else { return false }
    language = next
    table = nextTable
    let defaults = UserDefaults.standard
    defaults.set(next, forKey: languageKey)
    if let data = try? JSONEncoder().encode(nextTable) { defaults.set(data, forKey: tableKey) }
    return true
  }
}
