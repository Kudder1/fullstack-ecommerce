import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Context } from '../main';
import DeviceItem from './DeviceItem';
import './DeviceList.css';

const DeviceList = observer(() => {
    const { device } = useContext(Context);
    return (
        <div className="row" style={{ flexWrap: 'wrap', '--bs-gutter-y': '15px' }}>
            {device.devices.map((device) => (
                <DeviceItem key={device.id} device={device} />
            ))}
        </div>
    );
})

export default DeviceList;