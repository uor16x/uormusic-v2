import React from 'react'
import './index.scss'
import {PlaybackService} from "services"

export class Player extends React.Component {

	constructor(props) {
		super(props)
		this.audioRef = React.createRef()
		this.state = {
			playing: false
		}
	}

	componentDidMount() {
		PlaybackService.setAudio(document.getElementById('audio'))
	}

	render() {
		return (
			<div id="player">
				<audio id="audio" className="hidden-inputs" ref={this.audio}></audio>
			</div>
		)
	}
}