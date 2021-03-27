import React from 'react'
import {Col, Row} from 'react-bootstrap'
import './index.scss'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {PlaybackService, QueueService} from "services"
import {faCog, faTasks, faMusic, faTimes} from '@fortawesome/free-solid-svg-icons'
import {Item} from "../shared"
library.add(faCog, faTasks, faMusic, faTimes)


export class Footer extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			song: PlaybackService.song,
			playlist: PlaybackService.playlist,
			queue: [<Item>Queue is empty</Item>]
		}
	}

	componentDidMount() {
		PlaybackService.subscribePlayback(() => this.setState({
			song: PlaybackService.song, playlist: PlaybackService.playlist
		}))
	}

	render() {
		const nowPlaying = this.state.song
			? (
				<React.Fragment>
					<FontAwesomeIcon
						className="music-icon clickable"
						onClick={() => alert('')}
						icon="music"/>
					<span className="text-wrapper">
						<span className="song-part">{this.state.playlist.name}</span>
						<span> > </span>
						<span className="song-part">{this.state.song.name}</span>
					</span>
				</React.Fragment>
			)
			: null
		return (
			<div id="footer">
				<Row className="footer-wrapper">
					<Col
						className="now-playing"
						xs={10}
						sm={11}
					>
						<span className="now-playing-text cut">
							{nowPlaying}
						</span>
					</Col>
					<Col className="toolbar"
					     xs={2}
					     sm={1}
					>
						<div className="toolbar-item">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => alert('Metallica - Nothing else matters lalal hohohoh')}
								icon="cog"/>
						</div>
					</Col>
				</Row>
			</div>
		)
	}
}