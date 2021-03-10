import React from 'react'
import './index.scss'

import { UserService } from 'services'
import {Col, Row} from 'react-bootstrap'


export class Auth extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			username: '',
			password: ''
		}

		this.handleChange = this.handleChange.bind(this)
		this.authorize = this.authorize.bind(this)
	}

	authorize() {
		UserService.authorize(this.state.username, this.state.password)
			.then(user => {
				this.props.authSuccess(user)
			}, err => {
				this.props.authFail(err)
			})
	}

	handleChange(event) {
		this.setState({
			[event.target.name]: event.target.value
		})
	}

	render() {
		return (
			<div id="auth">
				<Col className="login-wrapper" xs={10} sm={4}>
					<Row className="flex-column align-items-center">
						<Col>
							<div className="auth-block help-text">
								Use the fields below to sign in/sign up
							</div>
						</Col>
						<Col>
							<div className="auth-block input">
								<input
									onChange={this.handleChange}
									name="username"
									type="text"
									className="auth-input"
									placeholder="Username"
								/>
							</div>
						</Col>
						<Col>
							<div className="auth-block input">
								<input
									onChange={this.handleChange}
									name="password"
									type="password"
									className="auth-input"
									placeholder="Password"
								/>
							</div>
						</Col>
						<Col>
							<div className="auth-block">
								<button
									disabled={!this.state.username || !this.state.password}
									onClick={this.authorize}
								>
									<span className="text">Authorize</span>
								</button>
							</div>
						</Col>
					</Row>
				</Col>
			</div>
		)
	}
}