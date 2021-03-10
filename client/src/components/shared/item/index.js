import './index.scss'
import {useLongPress} from 'use-long-press'
import {isMobile} from 'utils/helper'

export const Item = function ({ clickAction, id, longPress, ...props }) {
	if (!isMobile() || !longPress) {
		longPress = () => {
		}
	}
	const bind = useLongPress(element => longPress(element.target.closest('.item')), {
		captureEvent: true
	})
	return (
		<div className="item" id={id} onClick={clickAction} {...bind}>
			{props.children}
		</div>
	)
}