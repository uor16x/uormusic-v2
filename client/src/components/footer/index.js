import React from 'react'
import {Col, Row} from 'react-bootstrap'
import './index.scss'
import {isMobile} from 'utils/helper'

export class Footer extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			mobile: isMobile()
		}
	}

	render() {
		return (
			<div id="footer">
				<Row className="footer-wrapper">
					<Col
						className="now-playing"
						xs={9}
						sm={10}
					>
						<span className="cut">
							Now playing: Metallica - Enter Sandman from Metallica
						</span>
					</Col>
					<Col className="toolbar"
					     xs={3}
					     sm={2}
					>
						<div className="toolbar-item"
						     onClick={this.props.showSettings}>[ {this.state.mobile ? '...' : 'Settings'} ]
						</div>
					</Col>
				</Row>
			</div>
		)
	}
}