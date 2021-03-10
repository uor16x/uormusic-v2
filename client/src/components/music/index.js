import React, {useState} from 'react'
import './index.scss'
import {Button, Col, Row} from 'react-bootstrap'
import {Item} from 'components'
import {isMobile} from 'utils/helper'

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {faSearch, faChevronLeft, faPlus, faTimes, faTrashAlt, faEdit} from '@fortawesome/free-solid-svg-icons'

library.add(fab, faSearch, faPlus, faChevronLeft, faTimes, faTrashAlt, faEdit)

export class Music extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			searching: false,
			searchQuery: ''
		}
		this.setSearchQuery = this.setSearchQuery.bind(this)
		this.toggleSearching = this.toggleSearching.bind(this)
		this.itemLongPressed = this.itemLongPressed.bind(this)
	}

	setSearchQuery(event) {
		const query = event.target.value
		const listName = this.state.songsMode
			? 'songs'
			: 'playlists'
		this.setState({
			searchQuery: query,
			[listName]: query
				? this.state[listName].filter(item => item.name.includes(event.target.value))
				: this.props[listName]
		})
	}

	toggleSearching() {
		this.setSearchQuery({ target: { value: '' } })
		this.setState({
			searching: !this.state.searching
		})
	}

	itemLongPressed(element) {
		alert(element.id)
	}

	render() {
		const mobileUser = isMobile()
		const title = this.state.searching
			? (
				<input
					type="text"
					autoFocus
					onChange={this.setSearchQuery}
					className="search-input"
					placeholder="Type to search..."
				/>
			)
			: (<span>{this.state.songsMode ? 'Some playlist' : 'Playlists'}</span>)

		const list = this.state.songsMode
			? this.props.songs
			: this.props.playlists

		const searchButton = this.state.searching
			? (<FontAwesomeIcon onClick={this.toggleSearching} className="tool-item clickable" icon="times"/>)
			: (<FontAwesomeIcon onClick={this.toggleSearching} className="tool-item clickable" icon="search"/>)

		const backButton = this.props.songsMode
			? (<FontAwesomeIcon className="clickable" icon="chevron-left"/>)
			: null

		const listItems = list.map(item =>
			<Item
				key={item._id}
				id={`list_item_${item._id}`}
				longPress={element => this.itemLongPressed(element)}
				className={`${mobileUser ? 'mobile' : ''}`}
				variant="secondary"
			>
				<Col xs={3} sm={1}></Col>
				<Col xs={6} sm={10}>
					<span className="cut">{item.name}</span>
				</Col>
				<Col className="music-list-item-tools" xs={3} sm={1}>
					<div>
						<FontAwesomeIcon onClick={(e) => this.props.toggleModal('editPlaylist', item)}
						                 className="clickable" icon="edit"/>
					</div>
					<div>
						<FontAwesomeIcon className="clickable" icon="trash-alt"/>
					</div>

				</Col>
			</Item>
		)

		return (
			<Col
				id="music"
				className={`${this.props.searchMode && mobileUser ? 'collapsed-mobile' : ''}`}
				sm={this.props.searchMode ? this.props.resolution.sm[0] : this.props.resolution.sm[1]}
				xs={this.props.searchMode ? this.props.resolution.xs[0] : this.props.resolution.xs[1]}
			>
				<div className="header">
					<Col xs={2} className="back">
						{backButton}
					</Col>
					<Col xs={8} className="title">
						{title}
					</Col>
					<Col xs={2} className="tools">
						{searchButton}
						<FontAwesomeIcon className="tool-item clickable" onClick={(e) => this.props.toggleModal('addPlaylist')}
						                 icon="plus"/>
					</Col>
				</div>
				<div className="list">
					{listItems}
				</div>
			</Col>
		)
	}
}