import React from 'react'
import './index.scss'

export class Player extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			playing: false
		}
	}

	render() {
		return (
			<div id="player">

			</div>
		)
	}
}