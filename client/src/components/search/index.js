import React from 'react'
import './index.scss'
import {Col} from 'react-bootstrap'

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {faSearch, faChevronRight} from '@fortawesome/free-solid-svg-icons'

library.add(fab, faSearch, faChevronRight)

export class Search extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			query: ''
		}
	}

	render() {
		const searchSpace = this.props.searchMode
			? <Col className="search-space" xs={11}></Col>
			: null
		const toggleIcon = this.props.searchMode
			? <FontAwesomeIcon icon="chevron-right"/>
			: <FontAwesomeIcon icon="search"/>
		return (
			<Col
				id="search"
				className={ `${this.props.searchMode ? 'expanded' : ''}` }
				sm={this.props.searchMode ? this.props.resolution.sm[0] : this.props.resolution.sm[1]}
				xs={this.props.searchMode ? this.props.resolution.xs[0] : this.props.resolution.xs[1]}
			>
				<Col
					onClick={this.props.toggleSearch}
					className="toggler justify-content-center align-items-center"
					xs={this.props.searchMode ? 1 : 12}
				>
					{toggleIcon}
				</Col>
				{searchSpace}
			</Col>
		)
	}
}