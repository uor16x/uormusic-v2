import React from 'react'
import {FadeInAnimation} from 'components/shared/fadeIn'

export const Loader = function Loader(props) {
	return (
		<FadeInAnimation className="lds-ellipsis" direction="up">
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</FadeInAnimation>
	)
}