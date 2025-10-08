import { Link } from 'react-router-dom';
import './DeviceItem.css';

const DeviceItem = ({ device }) => {
    const imgUrl = device.img.startsWith('http') ? device.img : import.meta.env.VITE_SERVER_URL + device.img;
    return (
        <div className="col-md-3">
            <div className="device-item">
                <Link to={`/device/${device.id}`}>
                    <img src={imgUrl} alt={device.name} />
                </Link>
               <div style={{ marginTop: 20 }}>{device.brand.name}</div>
               <h3 className="device-item-title"><Link to={`/device/${device.id}`}>{device.name}</Link></h3>
               <div className="device-item-price">{device.price} USD</div>
               <div className="device-item-rating">{device.averageRating} ⭐</div>
            </div>
        </div>
    );
};

export default DeviceItem;