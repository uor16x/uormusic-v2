import React from 'react'
import './index.scss'
import { Col } from 'react-bootstrap'
import {CustomModal, Item} from 'components'
import {MusicService, ModalService, ToastService} from 'services'
import {isMobile} from 'utils/helper'

import 'react-toastify/dist/ReactToastify.css'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {faSearch, faChevronLeft, faPlus, faTimes, faTrashAlt, faEdit, faUpload} from '@fortawesome/free-solid-svg-icons'
library.add(fab, faSearch, faPlus, faChevronLeft, faTimes, faTrashAlt, faEdit, faUpload)

const stubFn = () => {}

const defaultState = {
	searching: false,
	searchQuery: '',
	currPlaylist: null,
	currSongs: [],
	menuActionItem: null
}

export class Music extends React.Component {

	constructor(props) {
		super(props)
		this.state = { ...defaultState }

		this.setSearchQuery = this.setSearchQuery.bind(this)
		this.deletePlaylistModal = this.deletePlaylistModal.bind(this)
		this.setPlaylist = this.setPlaylist.bind(this)
		this.toggleSearching = this.toggleSearching.bind(this)
		this.itemLongPressed = this.itemLongPressed.bind(this)
	}

	/**
	 * Playlists
	 */

	playlistSuccessAction(text) {
		ToastService.publishSuccess(text)
		this.props.triggerGetUser()
	}

	addPlaylistModal() {
		const modal = (
			<CustomModal
				key={"addPlaylist"}
				submitText={"Add"}
				header={"New playlist"}
				inputFields={[{
					key: 'name',
					placeholder: 'Playlist name'
				}]}
				cb={(data) => this.addPlaylist(data)}
			/>
		)
		ModalService.publish(modal)
	}
	addPlaylist(data) {
		MusicService.addPlaylist(data.name)
			.then(() => this.playlistSuccessAction(`${data.name} playlist added!`))
			.catch(err => ToastService.publishErr(err.message))
	}

	deletePlaylistModal(id) {
		const name = (this.props.playlists.find(list => list._id === id)).name
		const modal = (
			<CustomModal
				key={"deletePlaylist"}
				submitText={"Delete"}
				header={`Delete playlist ${name}?`}
				cb={() => this.deletePlaylist({ id, name })}
			/>
		)
		ModalService.publish(modal)
	}
	deletePlaylist({ id, name }) {
		MusicService.deletePlaylist(id)
			.then(() => this.playlistSuccessAction(`Playlist ${name} deleted!`))
			.catch(err => {
				ToastService.publishErr(err.message)
			})
	}


	/**
	 * Search
	 */

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

	/**
	 * Modes
	 */


	setPlaylist(id) {
		if (!id) {
			this.setState({
				currPlaylist: null,
				menuActionItem: null
			})
		}
		this.setState({
			currPlaylist: id,
			currSongs: [],
			menuActionItem: null
		})
	}


	modeHandler(mobileUser) {
		const result = {
			backButton: <React.Fragment/>,
			listItems: [],
			title: '',
			toolButton: null
		}

		let list = [],
			editAction = stubFn,
			deleteAction = stubFn,
			clickAction = stubFn

		if (this.state.searching) {
			result.title = (
				<input
					type="text"
					autoFocus
					onChange={this.setSearchQuery}
					className="search-input"
					placeholder="Type to search..."
				/>
			)
		} else {
			const titleText = this.state.currPlaylist
				? this.props.playlists.find(list => list._id === this.state.currPlaylist).name
				: 'Home'
			result.title = (
				<span className="cut">
					{titleText}
				</span>
			)
		}

		if (this.state.currPlaylist) {
			list = this.state.currSongs
			clickAction = (id) => alert(id)
			result.backButton = (
				<FontAwesomeIcon
					className="clickable"
					onClick={() => this.setPlaylist(null)}
					icon="chevron-left"/>
				)
			result.toolButton = (
				<FontAwesomeIcon className="tool-item clickable"
								 onClick={() => {}}
								 icon="upload"/>
			)
		} else {
			list = this.props.playlists
			clickAction = (id) => this.setPlaylist(id)
			deleteAction = this.deletePlaylistModal
			result.toolButton = (
				<FontAwesomeIcon className="tool-item clickable"
								 onClick={() => this.addPlaylistModal()}
								 icon="plus"/>
			)
		}

		result.listItems = list.map(item => (
			<Item
				key={`music-item-${item._id}`}
				item={item}
				longPress={element => this.itemLongPressed(element)}
				showActions={item._id === this.state.menuActionItem}
				menuCalledCallback={() => this.setState({ menuActionItem: item._id === this.state.menuActionItem ? null : item._id })}
				clickAction={() => clickAction(item._id)}
				extraActions={[
					{ icon: 'edit', action: editAction },
					{ icon: 'trash-alt', action: deleteAction },
				]}
			>
				<Col>
					<span className="cut">{item.name}</span>
				</Col>
			</Item>
		))
		return result
	}

	render() {
		/**
		 * Basic render setup
		 */
		const searchButton = (
			<FontAwesomeIcon
				onClick={this.toggleSearching}
				className="tool-item clickable"
				icon={ this.state.searching ? 'times' : 'search'}
			/>)

		const mobileUser = isMobile()
		const modeVars = this.modeHandler(mobileUser)

		return (
			<React.Fragment>
				<Col
					id="music"
					className={`${this.props.searchMode && mobileUser ? 'collapsed-mobile' : ''}`}
					sm={this.props.searchMode ? this.props.resolution.sm[0] : this.props.resolution.sm[1]}
					xs={this.props.searchMode ? this.props.resolution.xs[0] : this.props.resolution.xs[1]}
				>
					<div className="header">
						<Col xs={2} className="back">
							{modeVars.backButton}
						</Col>
						<Col xs={8} className="title">
							{modeVars.title}
						</Col>
						<Col xs={2} className="tools">
							{searchButton}
							{modeVars.toolButton}
						</Col>
					</div>
					<div className="list">
						{modeVars.listItems}
					</div>
				</Col>
			</React.Fragment>
		)
	}
}