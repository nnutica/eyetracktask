declare module 'react-big-calendar' {
  import { Component, ComponentType, CSSProperties, ReactNode } from 'react'

  export interface Event {
    title?: string
    start?: Date
    end?: Date
    allDay?: boolean
    resource?: any
  }

  export interface DateRange {
    start: Date
    end: Date
  }

  export interface SlotInfo {
    start: Date | string
    end: Date | string
    slots: Date[] | string[]
    action: 'select' | 'click' | 'doubleClick'
  }

  export interface View {
    title: string
  }

  export type Views = 'month' | 'week' | 'work_week' | 'day' | 'agenda'

  export interface CalendarProps {
    localizer: any
    events: Event[]
    startAccessor?: string | ((event: Event) => Date)
    endAccessor?: string | ((event: Event) => Date)
    titleAccessor?: string | ((event: Event) => string)
    allDayAccessor?: string | ((event: Event) => boolean)
    resourceAccessor?: string | ((event: Event) => any)
    resourceIdAccessor?: string | ((resource: any) => any)
    resourceTitleAccessor?: string | ((resource: any) => string)
    defaultView?: Views
    views?: Views[] | { [key: string]: boolean | ComponentType }
    step?: number
    length?: number
    min?: Date
    max?: Date
    scrollToTime?: Date
    className?: string
    style?: CSSProperties
    onNavigate?: (date: Date, view: Views) => void
    onView?: (view: Views) => void
    onSelectSlot?: (slotInfo: SlotInfo) => void
    onSelectEvent?: (event: Event, e: React.SyntheticEvent) => void
    onDoubleClickEvent?: (event: Event, e: React.SyntheticEvent) => void
    onSelecting?: (range: DateRange) => boolean | undefined
    onDrillDown?: (date: Date, view: Views) => void
    onRangeChange?: (range: DateRange | Date[], view: Views) => void
    selected?: Event
    date?: Date
    getNow?: () => Date
    culture?: string
    formats?: any
    components?: any
    messages?: any
    timeslots?: number
    toolbar?: boolean
    popup?: boolean
    popupOffset?: number | { x: number; y: number }
    selectable?: boolean | 'ignoreEvents'
    longPressThreshold?: number
    elementProps?: React.HTMLAttributes<HTMLDivElement>
    dayPropGetter?: (date: Date) => { className?: string; style?: CSSProperties }
    slotPropGetter?: (date: Date) => { className?: string; style?: CSSProperties }
    eventPropGetter?: (
      event: Event,
      start: Date,
      end: Date,
      isSelected: boolean
    ) => { className?: string; style?: CSSProperties }
    slotGroupPropGetter?: () => { className?: string; style?: CSSProperties }
    dayLayoutAlgorithm?: 'overlap' | 'no-overlap'
    showMultiDayTimes?: boolean
    tooltipAccessor?: (event: Event) => string
    backgroundEvents?: Event[]
  }

  export class Calendar extends Component<CalendarProps> {}

  export function dateFnsLocalizer(config: {
    format: (date: Date, formatStr: string, options?: any) => string
    parse: (dateStr: string, formatStr: string, refDate: Date, options?: any) => Date
    startOfWeek: (date: Date, options?: any) => Date
    getDay: (date: Date) => number
    locales: { [key: string]: any }
  }): any

  export default Calendar
}
