import React from 'react'
import './index.scss'
import { Col } from 'react-bootstrap'
import {CustomModal, Item} from 'components'
import {MusicService, ModalService, ToastService} from 'services'
import {isMobile} from 'utils/helper'

import Slide from 'react-reveal/Slide';
import 'react-toastify/dist/ReactToastify.css'
import { ReactSortable } from 'react-sortablejs'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {faSearch, faChevronLeft, faPlus, faTimes, faTrashAlt, faEdit, faUpload} from '@fortawesome/free-solid-svg-icons'
library.add(fab, faSearch, faPlus, faChevronLeft, faTimes, faTrashAlt, faEdit, faUpload)

const stubFn = () => {}

const sameArrayOrder = (arr1, arr2) => {
	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i]._id !== arr2[i]._id) {
			return false
		}
	}
	return true
}

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
		this.fileUploadRef = React.createRef()
		this.state = { ...defaultState }

		this.setSearchQuery = this.setSearchQuery.bind(this)
		this.deletePlaylistModal = this.deletePlaylistModal.bind(this)
		this.setPlaylist = this.setPlaylist.bind(this)
		this.selectFiles = this.selectFiles.bind(this)
		this.upload = this.upload.bind(this)
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
	editPlaylistModal(id) {
		const modal = (
			<CustomModal
				key={"editPlaylist"}
				submitText={"Save"}
				header={"Edit playlist"}
				inputFields={[{
					key: 'name',
					placeholder: 'Playlist name',
					value: this.props.playlists.find(list => list._id === id).name
				}]}
				cb={(data) => {
					if (data.name) {
						MusicService.updatePlaylist(id, { name: data.name })
							.then(() => this.props.triggerGetUser())
							.catch(() => ToastService.publishErr('Failed to update item order'))
					}
					this.setState({
						menuActionItem: null
					})
				}}
			/>
		)
		ModalService.publish(modal)
	}

	/**
	 * Songs
	 */
	editSongModal(id) {
		const song = this.state.currSongs.find(song => song._id === id)
		if (!song) return
		const modal = (
			<CustomModal
				key={"editSong"}
				submitText={"Save"}
				header={"Edit song"}
				inputFields={[{
					key: 'artist',
					placeholder: 'Artist',
					value: song.artist
				}, {
					key: 'title',
					placeholder: 'Title',
					value: song.title
				}]}
				cb={(data) => {
					if (data.artist && data.title) {
						MusicService.updateSong(id, data)
							.then(() => this.updateOrGetSongs())
							.catch(() => ToastService.publishErr('Failed to update song'))
					}
					this.setState({
						menuActionItem: null
					})
				}}
			/>
		)
		ModalService.publish(modal)
	}

	/**
	 * Songs utils
	 */
	updateOrGetSongs(playlistId) {
		return MusicService.getSongs(playlistId || this.state.currPlaylist)
			.then(response => {
				if (playlistId) {
					return response.songs
				} else {
					this.setState({ currSongs: response.songs })
				}
			}, err => ToastService.publishErr('Error retrieving songs'))
	}
	selectFiles() {
		this.fileUploadRef.current.click()
	}
	upload(event) {
		const files = [...event.target.files]
		event.target.value = null
		const playlistId = this.state.currPlaylist
		MusicService.uploadFiles(playlistId, files)
			.then(() => {
				ToastService.publishSuccess('Upload from disk finished!')
				if (this.state.currPlaylist === playlistId) {
					this.updateOrGetSongs()
				}
			}).catch(err => {
			console.error(err)
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
		this.updateOrGetSongs(id)
			.then(songs => {
				this.setState({
					currPlaylist: id,
					currSongs: songs,
					menuActionItem: null
				})
			})
	}

	modeHandler() {
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
			list = this.state.currSongs.map(song => {
				song.name = `${song.artist} - ${song.title}`
				return song
			})
			clickAction = (id) => alert(id)
			editAction = (id) => this.editSongModal(id)
			deleteAction = (id) => this.deleteSongModal(id)
			result.backButton = (
				<FontAwesomeIcon
					className="clickable"
					onClick={() => this.setPlaylist(null)}
					icon="chevron-left"/>
				)
			result.toolButton = (
				<FontAwesomeIcon className="tool-item clickable"
								 onClick={this.selectFiles}
								 icon="upload"/>
			)
		} else {
			list = this.props.playlists
			clickAction = (id) => this.setPlaylist(id)
			editAction = (id) => this.editPlaylistModal(id)
			deleteAction = (id) => this.deletePlaylistModal(id)
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
					{ icon: 'edit', click: () => editAction(item._id) },
					{ icon: 'trash-alt', click: () => deleteAction(item._id) },
				]}
			>
				<Col>
					<span className="cut">{item.name}</span>
				</Col>
			</Item>
		))
		result.list = list
		return result
	}

	setSortedList(newList) {
		let oldList = this.state.currPlaylist
			? this.state.currSongs
			: this.props.playlists
		if (!sameArrayOrder(newList, oldList)) {
			if (this.state.currPlaylist) {
				this.setState({
					currSongs: newList,
					menuActionItem: null
				})
				MusicService.updatePlaylist(this.state.currPlaylist, { songs: newList.map(song => song._id) })
					.then(() => this.props.triggerGetUser())
					.catch(() => ToastService.publishErr('Failed to update item order'))
			} else {
				console.log('Update playlists')
			}
		}
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
		const modeVars = this.modeHandler()

		return (
			<React.Fragment>
				<input type="file"
					   name="music"
					   className="hidden-inputs"
					   multiple
					   ref={this.fileUploadRef}
					   accept=".mp3"
					   onChange={this.upload} />
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
					{
						modeVars.listItems
						&& modeVars.listItems.length > 0
						&& (
							<div className="list">
								<ReactSortable
									list={modeVars.list}
									setList={(newList) => this.setSortedList(newList)}
								>
									<Slide top>
										{modeVars.listItems}
									</Slide>
								</ReactSortable>
							</div>
						)
					}
				</Col>
			</React.Fragment>
		)
	}
}