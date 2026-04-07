import SwiftUI

struct CalendarView: View {
    @State private var currentDate: Date = Date()

    private var monthYearTitle: String {
        let formatter = DateFormatter()
        formatter.locale = Locale.current
        formatter.dateFormat = "LLLL yyyy"
        return formatter.string(from: currentDate)
    }

    private var daysOfWeek: [String] {
        let formatter = DateFormatter()
        formatter.locale = Locale.current
        return formatter.shortStandaloneWeekdaySymbols
    }

    private var daysInMonthGrid: [Date?] {
        var calendar = Calendar.current
        calendar.firstWeekday = calendar.firstWeekday // respect user setting

        // Start of month
        guard let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: currentDate)) else { return [] }
        let range = calendar.range(of: .day, in: .month, for: startOfMonth) ?? (1..<29)
        let numberOfDays = range.count

        // What weekday does the first day fall on?
        let firstWeekdayIndex = calendar.component(.weekday, from: startOfMonth) - calendar.firstWeekday
        let leadingEmpty = (firstWeekdayIndex + 7) % 7

        // Build grid with leading empties, then dates for each day
        var grid: [Date?] = Array(repeating: nil, count: leadingEmpty)
        for day in 1...numberOfDays {
            if let date = calendar.date(byAdding: DateComponents(day: day - 1), to: startOfMonth) {
                grid.append(date)
            }
        }
        // Pad to complete the last week to 7 columns
        while grid.count % 7 != 0 { grid.append(nil) }
        return grid
    }

    var body: some View {
        VStack(spacing: 12) {
            header
            weekdaysHeader
            calendarGrid
            Spacer(minLength: 0)
        }
        .padding()
    }

    private var header: some View {
        HStack {
            Button(action: { changeMonth(by: -1) }) {
                Image(systemName: "chevron.left")
                    .imageScale(.large)
            }
            Spacer()
            Text(monthYearTitle)
                .font(.title2).bold()
                .accessibilityAddTraits(.isHeader)
            Spacer()
            Button(action: { changeMonth(by: 1) }) {
                Image(systemName: "chevron.right")
                    .imageScale(.large)
            }
        }
    }

    private var weekdaysHeader: some View {
        let symbols = normalizedWeekdaySymbols()
        return HStack {
            ForEach(symbols, id: \.self) { symbol in
                Text(symbol)
                    .font(.caption)
                    .frame(maxWidth: .infinity)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var calendarGrid: some View {
        let gridItems = Array(repeating: GridItem(.flexible(), spacing: 8), count: 7)
        return LazyVGrid(columns: gridItems, spacing: 8) {
            ForEach(daysInMonthGrid.indices, id: \.self) { index in
                let date = daysInMonthGrid[index]
                DayCell(date: date, currentDate: currentDate)
            }
        }
    }

    private func changeMonth(by delta: Int) {
        if let newDate = Calendar.current.date(byAdding: .month, value: delta, to: currentDate) {
            currentDate = newDate
        }
    }

    private func normalizedWeekdaySymbols() -> [String] {
        // Reorder weekday symbols to start from Calendar.current.firstWeekday
        let calendar = Calendar.current
        let symbols = DateFormatter().shortStandaloneWeekdaySymbols ?? ["S","M","T","W","T","F","S"]
        let first = calendar.firstWeekday - 1 // convert to 0-based index
        return Array(symbols[first...] + symbols[..<first])
    }
}

private struct DayCell: View {
    let date: Date?
    let currentDate: Date

    private var isToday: Bool {
        guard let date else { return false }
        return Calendar.current.isDateInToday(date)
    }

    private var isInCurrentMonth: Bool {
        guard let date else { return false }
        let cal = Calendar.current
        let m1 = cal.component(.month, from: date)
        let m2 = cal.component(.month, from: currentDate)
        let y1 = cal.component(.year, from: date)
        let y2 = cal.component(.year, from: currentDate)
        return m1 == m2 && y1 == y2
    }

    var body: some View {
        ZStack {
            if isToday { Circle().fill(Color.accentColor.opacity(0.15)) }
            Text(label)
                .font(.body.weight(isToday ? .bold : .regular))
                .frame(maxWidth: .infinity, minHeight: 36)
                .padding(.vertical, 6)
                .foregroundStyle(isInCurrentMonth ? .primary : .secondary)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isToday ? Color.accentColor : Color.clear, lineWidth: 1)
                )
        }
        .frame(height: 40)
        .accessibilityLabel(accessibilityText)
    }

    private var label: String {
        guard let date else { return "" }
        let day = Calendar.current.component(.day, from: date)
        return "\(day)"
    }

    private var accessibilityText: String {
        guard let date else { return "Empty" }
        let df = DateFormatter()
        df.dateStyle = .full
        return df.string(from: date)
    }
}

#Preview {
    CalendarView()
}
