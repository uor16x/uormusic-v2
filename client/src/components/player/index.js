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
			song: PlaybackService.song,
			time: null
		}
	}

	componentDidMount() {
		PlaybackService.subscribePlayback((cb) => {
			this.setState({
				playing: PlaybackService.playing,
				song: PlaybackService.song
			}, () => {
				if (cb) {
					cb()
				}
			})
		})
		const audio = PlaybackService.audio
		audio.ontimeupdate = () => {
			const currentTime = this.convertTime(audio.currentTime),
				totalTime =  this.convertTime(audio.duration)
			if (currentTime && totalTime) {
				this.setState({
					time: `${currentTime} / ${totalTime}`
				})
			}
		}
	}

	convertTime(time) {
		const seconds = parseInt(time);
		const minutes = Math.floor(seconds / 60);
		const finalMinutes = minutes < 10 ? `0${minutes}` : minutes;
		const remainingSeconds = seconds % 60;
		const finalSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
		return (!isNaN(finalMinutes) && !isNaN(finalSeconds)) ? `${finalMinutes}:${finalSeconds}` : null;
	}

	play() {
		PlaybackService.play()
	}

	pause() {
		PlaybackService.pause()
	}

	next() {
		PlaybackService.next()
	}

	prev() {
		PlaybackService.prev()
	}

	render() {
		const titleText = (this.state.song && this.state.song.name) || ''
		const title = this.state.playing
			? (
				<Slide left>
					{/*eslint-disable-next-line*/}
					<marquee direction="left">
						{titleText}
					</marquee>
				</Slide>
			)
			: <span className="cut">{titleText}</span>

		return (
			<Slide top>
				<div id="player">
					<Col xs="6" sm="2" className="controls">
						<div className="control">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => this.prev()}
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
								onClick={() => this.next()}
								icon="step-forward"/>
						</div>
					</Col>
					<Col className="d-none d-sm-flex col-sm-3 col-md-2 timestamp">
						<div className="control">
							{this.state.time}
						</div>
					</Col>
					<Col className="d-none d-sm-flex col-sm-4 col-md-5 title cut">
						<div className="control" style={({ paddingBottom: '2px' })}>
							{title}
						</div>
					</Col>
					<Col xs="6" sm="3" className="utils">
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