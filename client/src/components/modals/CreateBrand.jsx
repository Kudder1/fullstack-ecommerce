import React from 'react';
import CreateSimpleEntity from './CreateSimpleEntity';

const CreateBrand = ({ show, onHide, onSubmit }) => {
  return (
    <CreateSimpleEntity
      show={show}
      onHide={onHide}
      entityType="brand"
      onSubmit={onSubmit}
    />
  );
};

export default CreateBrand;
