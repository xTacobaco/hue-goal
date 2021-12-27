import dayjs from 'dayjs'

import isoWeek from 'dayjs/plugin/isoWeek'
import duration from 'dayjs/plugin/duration'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isLeapYear from 'dayjs/plugin/isLeapYear'
import isoWeeksInYear from 'dayjs/plugin/isoWeeksInYear'
import localizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(isoWeek)
dayjs.extend(duration)
dayjs.extend(weekOfYear)
dayjs.extend(isLeapYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(localizedFormat)

export default dayjs
