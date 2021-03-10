import * as React from "react";
import './index.scss'

import {Auth, Player, Music, Search} from "components";
import {UserService} from "services";
import {Footer} from "../footer";

const defaultState = {
    user: null,
    searchMode: false
}

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

export class Full extends React.Component {

    constructor(props) {
        super(props)
        this.state = { ...defaultState }

        this.authSuccess = this.authSuccess.bind(this)
        this.authFail = this.authFail.bind(this)
        this.logout = this.logout.bind(this)
    }

    componentDidMount() {
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
                if (afterLogin && user && user.username) {
                    alert(`Welcome back, ${user.username}`)
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
        alert(msg)
    }

    logout() {
        UserService.clear()
            .then(() => {
                alert('Bye!')
                this.setState({ ...defaultState, loading: false })
            })
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
                            />
                            <Search
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
            </div>
        )
    }
}