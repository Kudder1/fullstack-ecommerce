import { useContext, useEffect, useState } from 'react';
import Modal from './Modal';
import { Context } from '../../main';
import { fetchBrands, fetchTypes } from '../../http/deviceAPI';

const CreateDevice = ({ show, onHide, onSubmit }) => {
  const { device } = useContext(Context)
  useEffect(() => {
    Promise.all([fetchTypes(), fetchBrands()]).then(([types, brands]) => {
    device.setTypes(types)
    device.setBrands(brands)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [deviceData, setDeviceData] = useState({
    name: '',
    price: '',
    brandId: '',
    typeId: '',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeviceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setDeviceData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    if (deviceData.name.trim() && deviceData.price && deviceData.brandId && deviceData.typeId) {
      onSubmit({
        ...deviceData,
        info
      });
      // setDeviceData({
      //   name: '',
      //   price: '',
      //   brandId: '',
      //   typeId: '',
      //   image: null
      // })
      if (onHide) onHide()
    }
  };

  const handleClose = () => {
    setDeviceData({
      name: '',
      price: '',
      brandId: '',
      typeId: '',
      image: null
    });
    onHide();
  };

  const [info, setInfo] = useState([]);
  const addInfo = () => {
    setInfo([...info, { title: '', description: '', number: Date.now() }]);
  }
  const removeInfo = (number) => {
    setInfo(info.filter(i => i.number !== number));
  }
  const changeInfo = (key, value, number) => {
    setInfo(info.map(i => i.number === number ? { ...i, [key]: value } : i));
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton onHide={handleClose}>
        <Modal.Title>Добавить устройство</Modal.Title>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="deviceName" className="form-label">
                  Название устройства
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="deviceName"
                  name="name"
                  placeholder="Введите название устройства..."
                  value={deviceData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="devicePrice" className="form-label">
                  Цена ($)
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="devicePrice"
                  name="price"
                  placeholder="Введите цену..."
                  value={deviceData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="deviceBrand" className="form-label">
                  Бренд
                </label>
                <select
                  className="form-select"
                  id="deviceBrand"
                  name="brandId"
                  value={deviceData.brandId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Выберите бренд...</option>
                  {device.brands.map(brand => 
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="deviceType" className="form-label">
                  Тип
                </label>
                <select
                  className="form-select"
                  id="deviceType"
                  name="typeId"
                  value={deviceData.typeId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Выберите тип...</option>
                  {device.types.map(type => 
                    <option key={type.id} value={type.id}>{type.name}</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="deviceImage" className="form-label">
              Изображение
            </label>
            <input
              type="file"
              className="form-control"
              id="deviceImage"
              accept="image/*"
              onChange={handleImageChange}
            />
            <div className="form-text">
              Выберите изображение для устройства (необязательно)
            </div>
          </div>
          <div className="mb-3">
            <button type="button" className="btn btn-outline-secondary" onClick={addInfo}>
              Добавить новое свойство
            </button>
          </div>
          <div>
            {info.map(i =>
              <div key={i.number} className="d-flex mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Название"
                  value={i.title}
                  onChange={(e) => changeInfo('title', e.target.value, i.number)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Описание"
                  value={i.description}
                  onChange={(e) => changeInfo('description', e.target.value, i.number)}
                />
                <button className="btn btn-danger" onClick={() => removeInfo(i.number)}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Отмена
          </button>
          <button type="submit" className="btn btn-success">
            Добавить устройство
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CreateDevice;
