import dayjs from 'dayjs/esm'
import 'dayjs/esm/locale/en'
import 'dayjs/esm/locale/sv'

import isoWeek from 'dayjs/esm/plugin/isoWeek'
import duration from 'dayjs/esm/plugin/duration'
import weekOfYear from 'dayjs/esm/plugin/weekOfYear'
import isLeapYear from 'dayjs/esm/plugin/isLeapYear'
import isoWeeksInYear from 'dayjs/esm/plugin/isoWeeksInYear'
import localizedFormat from 'dayjs/esm/plugin/localizedFormat'

dayjs.extend(isoWeek)
dayjs.extend(duration)
dayjs.extend(weekOfYear)
dayjs.extend(isLeapYear)
dayjs.extend(isoWeeksInYear)
dayjs.extend(localizedFormat)

export default dayjs
