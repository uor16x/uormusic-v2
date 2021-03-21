import React from 'react'
import './index.scss'
import { Col } from 'react-bootstrap'
import {CustomModal, Item} from 'components'
import {MusicService, ModalService, ToastService, PlaybackService} from 'services'
import {isMobile} from 'utils/helper'

import Slide from 'react-reveal/Slide';
import 'react-toastify/dist/ReactToastify.css'
import { ReactSortable } from 'react-sortablejs'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {library} from '@fortawesome/fontawesome-svg-core'
import {fab} from '@fortawesome/free-brands-svg-icons'
import {faSearch, faChevronLeft, faPlus, faTimes, faTrashAlt, faEdit, faUpload, faSpinner} from '@fortawesome/free-solid-svg-icons'
library.add(fab, faSearch, faPlus, faChevronLeft, faTimes, faTrashAlt, faEdit, faUpload, faSpinner)

const stubFn = () => {}

const slideWrap = (listItems) => {
	return listItems.length > 1
		? (
			<Slide top>
				{listItems}
			</Slide>
		)
		: (
			<React.Fragment>
				{listItems}
			</React.Fragment>
		)
}

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
	playingSong: null,
	playingPlaylist: null,
	playingSongs: null,
	menuActionItem: null,
	listLoading: false,
	showPlayer: false

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

	componentDidMount() {
		PlaybackService.setAudio(document.getElementById('audio'))
		PlaybackService.subscribeShowPlayer(() => this.setState({ showPlayer: true }))
		PlaybackService.subscribeNextSong(id => {
			this.setSong(id, true)
		})
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
			.catch(err => ToastService.publishErr(err.message))
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
	setSong(songId, auto = false) {
		const setSongWrapper = () => {
			const playlist = this.props.playlists.find(listItem =>
				listItem._id === (auto ? this.state.playingPlaylist : this.state.currPlaylist))
			const currentSongsList = auto ? this.state.playingSongs : this.state.currSongs
			const song = currentSongsList.find(listSong => listSong._id === songId)
			PlaybackService.setSong(song, playlist)
			this.setState({
				playingSong: songId,
				playingSongs: currentSongsList,
				playingPlaylist: playlist._id
			}, () => {
				PlaybackService.play()
			})
		}
		if (this.state.showPlayer) {
			PlaybackService.pause(() => setSongWrapper())
		} else {
			PlaybackService.pause()
			setSongWrapper()
		}

	}

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

	deleteSongModal(id) {
		const song = this.state.currSongs.find(song => song._id === id)
		if (!song) return
		const modal = (
			<CustomModal
				key={"deleteSong"}
				submitText={"Delete"}
				header={`Delete song ${song.title}?`}
				cb={() => {
					MusicService.deleteSong(this.state.currPlaylist, id)
						.then(() => this.updateOrGetSongs())
						.catch(err => ToastService.publishErr(err.message))
				}}
			/>
		)
		ModalService.publish(modal)
		this.setState({
			menuActionItem: null
		})
	}

	/**
	 * Songs utils
	 */
	updateOrGetSongs(playlistId) {
		if (playlistId) {
			this.setState({
				listLoading: true
			})
		}
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
					menuActionItem: null,
					listLoading: false
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
			clickAction = stubFn,
			isActive = stubFn

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
			isActive = id => PlaybackService.song && PlaybackService.song._id === id
			clickAction = (id) => this.setSong(id)
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

			if (this.state.listLoading) {
				result.backButton = (
					<FontAwesomeIcon className="tool-item"
									 icon="spinner"/>
				)
			}

			isActive = id => PlaybackService.playlist && PlaybackService.playlist._id === id
			clickAction = (id) => this.setPlaylist(id)
			editAction = (id) => this.editPlaylistModal(id)
			deleteAction = (id) => this.deletePlaylistModal(id)
			result.toolButton = (
				<FontAwesomeIcon className="tool-item clickable"
								 onClick={() => this.addPlaylistModal()}
								 icon="plus"/>
			)
		}

		result.listItems = list.map(item => {
			const extraActions = this.state.menuActionItem === item._id
				? [
					{ icon: 'edit', click: () => editAction(item._id) },
					{ icon: 'trash-alt', click: () => deleteAction(item._id) },
				]
				: []
			return (
				<Item
					key={`music-item-${item._id}`}
					item={item}
					active={isActive(item._id)}
					longPress={element => this.itemLongPressed(element)}
					menuCalledCallback={() => this.setState({ menuActionItem: item._id === this.state.menuActionItem ? null : item._id })}
					clickAction={() => clickAction(item._id)}
					extraActions={extraActions}
				>
					<Col className="item-inner-wrapper">
						<span className="cut">{item.name}</span>
					</Col>
				</Item>
			)
		})
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
				<audio id="audio" className="hidden-inputs"></audio>
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
						!this.state.listLoading
						&& modeVars.listItems
						&& modeVars.listItems.length > 0
						&& (
							<div className="list">
								<ReactSortable
									list={modeVars.list}
									setList={(newList) => this.setSortedList(newList)}
								>
									{slideWrap(modeVars.listItems)}
								</ReactSortable>
							</div>
						)
					}
				</Col>
			</React.Fragment>
		)
	}
}