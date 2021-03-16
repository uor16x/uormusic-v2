import React, {useState} from "react"
import { Modal, Button, InputGroup, FormControl } from "react-bootstrap";
import { ModalService } from "services"

export const CustomModal = function ({ header, inputFields = [], submitText, cb }) {

    function submit(data) {
        cb(data)
        ModalService.closeCb()
    }

    const [data, setData] = useState(inputFields.reduce((acc, inputData) => {
        acc[inputData.key] = inputData.value || ''
        return acc
    }, {}));


    const inputs = inputFields.map((inputData, index) => (
        <InputGroup key={inputData.key}>
            <FormControl
                placeholder={inputData.placeholder}
                value={data[inputData.key]}
                onChange={e => setData({ ...data, [inputData.key]: e.target.value })}
                autoFocus={index === 0}
            />
        </InputGroup>
    ))

    return (
        <React.Fragment>
            <Modal.Dialog className='custom-modal-dialog'>
                <Modal.Header>
                    <Modal.Title>{header}</Modal.Title>
                </Modal.Header>
                {inputs.length > 0 &&
                <Modal.Body>
                    {inputs}
                </Modal.Body>
                }
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => ModalService.closeCb()}>Close</Button>
                    <Button variant="primary" onClick={() => submit(data) }>{ submitText }</Button>
                </Modal.Footer>
            </Modal.Dialog>
        </React.Fragment>
    )
}