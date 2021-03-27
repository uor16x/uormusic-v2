import './index.scss'
import {useLongPress} from 'use-long-press'
import {isMobile} from 'utils/helper'
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Col, Row} from "react-bootstrap";

export const Item = function ({
								  clickAction,
								  id,
								  active,
								  longPress,
								  menuCalledCallback = () => {},
								  extraActions=[],
								  ...props
}) {
	function handleMenu(event) {
		event.preventDefault()
		event.stopPropagation()
		menuCalledCallback()
	}
	const mobile = isMobile()

	const actions = extraActions && extraActions.length > 0
		? (
			<Row className="actions">
				{extraActions.map(action => (
					<Col className="item-icon-wrapper clickable"
						 onClick={() => action.click()}
						 key={`action-item-key-${action.icon}`}>
						<FontAwesomeIcon icon={action.icon}/>
					</Col>
				))}
			</Row>
		)
		: []

	const mobileMenu = !mobile
		? (
			<div className="mobile-menu clickable" onClick={(event) => handleMenu(event)}>
				<FontAwesomeIcon icon="bars"/>
			</div>
		)
		: null

	return (
		<div className="item-wrapper">
			<div
				className={`item ${active ? 'active' : ''}`}
				id={id}
				onClick={clickAction}
				onContextMenu={(e) => !mobile && handleMenu(e)}
			>
				{props.children}
				{mobileMenu}
			</div>
			{actions}
		</div>

	)
}