import * as React from "react";

import {Auth, Loader} from "components";
import {UserService} from "services";

const defaultState = {
    user: null,
    loading: true
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

    render() {
        const result = this.state.loading
            ? <Loader/>
            : this.state.user
                ? (
                    <React.Fragment>
                        <h1>Inside</h1>
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