import dayjs from './dayjs';
import emitter from './eventbus';

function startAtMiddle() {
	emitter.emit('animation', [3, dayjs().isoWeeksInYear()/2]);
}

function startAtCurrentDay() {
	emitter.emit('animation', [dayjs().isoWeekday()-1, dayjs().isoWeeksInYear()-1]);
}

export default {
	startAtMiddle,
	startAtCurrentDay,
}