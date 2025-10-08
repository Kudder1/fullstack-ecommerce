import React, { useState } from 'react';
import Modal from './Modal';

const CreateSimpleEntity = ({ 
  show, 
  onHide, 
  entityType = 'type', // 'type' or 'brand'
  onSubmit 
}) => {
  const [entityName, setEntityName] = useState('');

  // Configuration based on entity type
  const config = {
    type: {
      title: 'Добавить тип',
      label: 'Название типа',
      placeholder: 'Введите название типа...',
      inputId: 'typeName'
    },
    brand: {
      title: 'Добавить бренд',
      label: 'Название бренда',
      placeholder: 'Введите название бренда...',
      inputId: 'brandName'
    }
  };

  const currentConfig = config[entityType] || config.type;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (entityName.trim()) {
      // Call the provided onSubmit callback or default behavior
      if (onSubmit) {
        onSubmit(entityName, entityType);
      } else {
        console.log(`Creating ${entityType}:`, entityName);
      }
      setEntityName('');
      onHide();
    }
  };

  const handleClose = () => {
    setEntityName('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton onHide={handleClose}>
        <Modal.Title>{currentConfig.title}</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor={currentConfig.inputId} className="form-label">
              {currentConfig.label}
            </label>
            <input
              type="text"
              className="form-control"
              id={currentConfig.inputId}
              placeholder={currentConfig.placeholder}
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-success">
            Добавить
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateSimpleEntity;