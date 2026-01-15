'use client'

import React, { useState } from "react"

type DayTotals = Record<string, number> // key: yyyy-mm-dd, value: hours worked

type Props = {
  dayTotals: DayTotals
  targetHours: number
  referenceDate?: Date
  onDateClick?: (date: Date) => void
}

// Normalize date to local midnight
function atMidnight(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function formatISO(date: Date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function isSameMonthYear(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

// Monday as first day of week
function startOfWeek(date: Date) {
  const day = date.getDay() || 7 
  return addDays(atMidnight(date), -1 * (day - 1))
}

function endOfWeek(date: Date) {
  const day = date.getDay() || 7
  return addDays(atMidnight(date), 7 - day)
}

function colorFor(hours: number, target: number) {
  const t = target > 0 ? target : 8 
  if (hours >= t + 1) return "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100"
  if (hours >= t) return "bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100"
  if (hours >= t - 2) return "bg-orange-200 text-orange-900 dark:bg-orange-900/60 dark:text-orange-100"
  return "bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100"
}

export default function WorkCalendar({ dayTotals, targetHours, referenceDate, onDateClick }: Props) {
  const initial = referenceDate ? atMidnight(referenceDate) : atMidnight(new Date())
  const [viewDate, setViewDate] = useState<Date>(initial)

  const today = atMidnight(new Date())
  const monthStart = startOfMonth(viewDate)
  const monthEnd = endOfMonth(viewDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)
  const todayKey = formatISO(today)

  
  let weekdayCount = 0
  let weekdayHours = 0
  for (let d = monthStart; d <= monthEnd; d = addDays(d, 1)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    if (isWeekend) continue
    if (isSameMonthYear(d, today) && formatISO(d) > todayKey) continue
    const key = formatISO(d)
    const hours = dayTotals[key] ?? 0
    weekdayCount += 1
    weekdayHours += hours
  }
  const avgWeekdayHours = weekdayCount > 0 ? weekdayHours / weekdayCount : 0

  const goPrevMonth = () => setViewDate((d) => startOfMonth(addDays(d, -1)))
  const goNextMonth = () => setViewDate((d) => startOfMonth(addDays(endOfMonth(d), 1)))


  const cells: React.ReactNode[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    const key = formatISO(d)
    const hours = dayTotals[key] ?? 0
    const inMonth = d.getMonth() === monthStart.getMonth()
    const isWeekend = d.getDay() === 0 || d.getDay() === 6
    const isFuture = key > todayKey
    const colorClass = isWeekend
      ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
      : isFuture
        ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
        : colorFor(hours, targetHours)
    
    const dateForClick = new Date(d)
    
    cells.push(
      <div
        key={key}
        className={[
          "flex flex-col items-center justify-center rounded border text-xs h-16",
          inMonth ? "border-zinc-200 dark:border-zinc-700" : "border-dashed border-zinc-100 text-zinc-400 dark:border-zinc-800/60",
          colorClass,
          onDateClick ? "cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-1 transition-all" : "",
        ].join(" ")}
        title={`${key}: ${hours.toFixed(2)}h`}
        onClick={() => onDateClick?.(dateForClick)}
      >
        <div className="text-[11px] font-semibold">{d.getDate()}</div>
        <div className="text-[10px]">{hours.toFixed(1)}h</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-zinc-800 dark:text-zinc-100">
        <div className="font-semibold">{viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <div className="flex items-center gap-2">
          <button onClick={goPrevMonth} className="rounded border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">‹ Month</button>
          <button onClick={goNextMonth} className="rounded border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800">Month ›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 dark:text-zinc-400">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        Avg weekday hours this month: {avgWeekdayHours.toFixed(2)}h
      </div>
      <div className="grid grid-cols-7 gap-1">{cells}</div>
    </div>
  )
}
