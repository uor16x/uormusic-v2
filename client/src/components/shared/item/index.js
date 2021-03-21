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
								  showActions = false,
								  menuCalledCallback,
								  extraActions=[],
								  ...props
}) {

	function handleMenu(event) {
		event.preventDefault()
		menuCalledCallback()
	}

	if (!isMobile() || !longPress) {
		longPress = () => {
			menuCalledCallback()
		}
	}
	const bind = useLongPress(element => longPress(element.target.closest('.item')), {
		captureEvent: true
	})

	const actions = showActions
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
		: null

	return (
		<div className="item-wrapper">
			<div
				className={`item ${active ? 'active' : ''}`}
				id={id}
				onClick={clickAction}
				onContextMenu={(e) => handleMenu(e)}
				{...bind}
			>
				{props.children}
			</div>
			{showActions && actions}
		</div>

	)
}