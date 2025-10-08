import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Context } from "../main";
import './TypeBar.css';

const TypeBar = observer(() => {
    const {device} = useContext(Context)
    return (
        <div className="list-group">
            {device.types.map(type =>
                <div 
                    className={`list-group-item ${type.id === device.selectedType.id ? 'active' : ''}`}
                    onClick={() => device.setSelectedType(type) }
                    key={type.id}
                >
                    {type.name}
                </div>
            )}
        </div>
    );
});

export default TypeBar;
