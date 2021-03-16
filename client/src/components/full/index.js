import * as React from "react"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.scss'

import {Auth, Player, Music, Search, CustomModal} from "components"
import {UserService, ModalService, ToastService} from "services"
import {Footer} from "../footer"

const spaceResolutions = {
    music: {
        sm: [ 7, 11 ],
        xs: [ 'hidden', 11 ]
    },
    search: {
        sm: [ 5, 1 ],
        xs: [ 12, 'hidden' ]
    }
}

const defaultState = {
    user: null,
    loading: true,
    searchMode: false,
    modal: null
}

export class Full extends React.Component {

    constructor(props) {
        super(props)
        this.state = { ...defaultState }

        this.authSuccess = this.authSuccess.bind(this)
        this.authFail = this.authFail.bind(this)
        this.logout = this.logout.bind(this)
        this.getUser = this.getUser.bind(this)
        this.addPlaylistCb = this.addPlaylistCb.bind(this)
        this.toggleSearch = this.toggleSearch.bind(this)
    }

    componentDidMount() {
        ToastService.subscribeSuccess(text => toast(text, { type: toast.TYPE.SUCCESS }))
        ToastService.subscribeInfo(text => toast(text, { type: toast.TYPE.INFO }))
        ToastService.subscribeErr(text => toast(text, { type: toast.TYPE.ERROR }))

        this.getUser()
    }

    /**
     * Auth && user
     */
    getUser(afterLogin) {
        UserService.get()
            .then(user => {
                this.setState({
                    loading: false,
                    user
                })
                if (afterLogin && user) {
                    ToastService.publishInfo(`Welcome back, ${user.username}`)
                    ModalService.subscribe(modal => {
                        this.setState({
                            modal
                        })
                    })
                }
            }, error => {
                this.setState({
                    loading: false
                })
            })
    }

    authSuccess(token) {
        UserService.set(token)
        this.getUser(true)
    }

    authFail(msg) {
        ToastService.publishErr(msg)
    }

    logout() {
        UserService.clear()
            .then(() => {
                this.setState({ ...defaultState, loading: false })
            })
    }

    /**
     * Playlists
     */
    addPlaylistCb(data) {

    }

    /**
     * Other
     */
    toggleSearch() {
        this.setState({
            searchMode: !this.state.searchMode
        })
    }

    render() {
        if (this.state.loading) {
            return null
        }
        const result = this.state.user
                ? (
                    <React.Fragment>
                        <Player />
                        <div id="workspace">
                            <Music
                                searchMode={this.state.searchMode}
                                resolution={spaceResolutions.music}
                                playlists={this.state.user.playlists}
                                songs={[]}
                                triggerGetUser={this.getUser}
                            />
                            <Search
                                toggleSearch={this.toggleSearch}
                                searchMode={this.state.searchMode}
                                resolution={spaceResolutions.search}
                            />
                        </div>
                        <Footer/>
                    </React.Fragment>
                )
                : <Auth authSuccess={this.authSuccess} authFail={this.authFail}/>

        return (
            <div id="full">
                {result}
                <ToastContainer
                    hideProgressBar={true}
                    autoClose={3000}
                    position={toast.POSITION.BOTTOM_RIGHT}/>
                {this.state.modal}
            </div>
        )
    }
}