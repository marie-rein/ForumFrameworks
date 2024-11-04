import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap'; // Ensure you have react-bootstrap installed

const ErrorModal = ({ show, onHide, message }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Error</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ErrorModal;