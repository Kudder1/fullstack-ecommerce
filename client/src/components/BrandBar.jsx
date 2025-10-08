import { observer } from 'mobx-react-lite';
import { useContext } from 'react';
import { Context } from '../main';
import './BrandBar.css';

const BrandBar = observer(() => {
    const { device } = useContext(Context);
    return (
        <div className="row">
            {device.brands.map(brand =>
                <div className="col-auto mb-3" key={brand.id}>
                    <div 
                        className={`card brand-card ${brand.id === device.selectedBrand.id ? 'card-selected' : ''}`}
                        onClick={() => device.setSelectedBrand(brand)}
                    >
                        <div className="card-body">
                            {brand.name}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
})

export default BrandBar;