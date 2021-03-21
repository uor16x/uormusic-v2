import React from 'react'
import './index.scss'
import Slide from 'react-reveal/Slide'
import {Col} from "react-bootstrap"

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {faStepBackward, faStepForward, faPlay, faPause, faUndo, faRandom, faDownload} from '@fortawesome/free-solid-svg-icons'
import {PlaybackService} from "services";
library.add(faStepBackward, faStepForward, faPlay, faPause, faUndo, faRandom, faDownload)

export class Player extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			playing: PlaybackService.playing,
			song: PlaybackService.song
		}
	}

	componentDidMount() {
		PlaybackService.subscribePlayback(() => {
			this.setState({
				playing: PlaybackService.playing,
				song: PlaybackService.song
			})
		})
	}

	play() {
		PlaybackService.play()
	}

	pause() {
		PlaybackService.pause()
	}

	render() {
		return (
			<Slide top>
				<div id="player">
					<Col xs="4" sm="2" className="controls">
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('')}
								icon="step-backward"/>
						</div>
						{
							this.state.playing && (
								<div className="control">
									<FontAwesomeIcon
										className="clickable"
										onClick={() => this.pause()}
										icon="pause"/>
								</div>
							)
						}
						{
							!this.state.playing && (
								<div className="control">
									<FontAwesomeIcon
										className="clickable"
										onClick={() => this.play()}
										icon="play"/>
								</div>
							)
						}
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('')}
								icon="step-forward"/>
						</div>
					</Col>
					<Col xs="4" sm="7" className="title">
						<div className="control">
							<span className="cut">
								{this.state.song && this.state.song.name}
							</span>
						</div>
					</Col>
					<Col xs="4" sm="3" className="utils">
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('')}
								icon="undo"/>
						</div>
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('')}
								icon="random"/>
						</div>
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('')}
								icon="download"/>
						</div>
					</Col>
				</div>
			</Slide>
		)
	}
}