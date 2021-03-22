import React from 'react'
import {Col, Row} from 'react-bootstrap'
import './index.scss'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import ReactTooltip from 'react-tooltip'
import {library} from '@fortawesome/fontawesome-svg-core'
import {PlaybackService, UploadService} from "services"
import {faCog, faTasks, faMusic, faTimes} from '@fortawesome/free-solid-svg-icons'
import {isMobile} from "../../utils/helper";
library.add(faCog, faTasks, faMusic, faTimes)


export class Footer extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			song: PlaybackService.song,
			playlist: PlaybackService.playlist,
			showTooltip: false,
			tooltipText: ''
		}
	}

	componentDidMount() {
		PlaybackService.subscribePlayback(() => this.setState({
			song: PlaybackService.song, playlist: PlaybackService.playlist
		}))
		UploadService.subscribe(() => {
			const tooltip = UploadService.queue.reduce((acc, item) => {
				acc += `
					<div class="row tooltip-container">
						<div class="col col-8 cut queue-name">${item.name}</div>
						<div class="col col-4 cut queue-status">${item.status}</div>
					</div>
				`
				return acc
			}, '<div>')
			this.setState({
				tooltipText: `${tooltip}</div>`
			})
		})
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
		const queueIcon = this.state.showTooltip
			? 'times'
			: 'tasks'
		return (
			<div id="footer">
				<ReactTooltip
					overridePosition={({ left, top }) => {
						return {
							top,
							left: isMobile() ? 0 : left
						}
					}}
					place="top"
					event="click"
					html
					clickable
					afterShow={() => this.setState({ showTooltip: true })}
					afterHide={() => this.setState({ showTooltip: false })}
				/>
				<Row className="footer-wrapper">
					<Col
						className="now-playing"
						xs={9}
						sm={10}
					>
						<span className="now-playing-text cut">
							{nowPlaying}
						</span>
					</Col>
					<Col className="toolbar"
					     xs={3}
					     sm={2}
					>
						<div className="queue-list toolbar-item clickable" data-tip={this.state.tooltipText && this.state.tooltipText}>
							<FontAwesomeIcon
								icon={queueIcon}/>
						</div>
						<div className="toolbar-item">
							<FontAwesomeIcon
								className="clickable"
								onClick={() => UploadService.add('Metallica - Nothing else matters lalal hohohoh')}
								icon="cog"/>
						</div>
					</Col>
				</Row>
			</div>
		)
	}
}