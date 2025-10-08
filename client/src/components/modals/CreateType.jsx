import React from 'react';
import CreateSimpleEntity from './CreateSimpleEntity';

const CreateType = ({ show, onHide, onSubmit }) => {
  return (
    <CreateSimpleEntity
      show={show}
      onHide={onHide}
      entityType="type"
      onSubmit={onSubmit}
    />
  );
};

export default CreateType;
