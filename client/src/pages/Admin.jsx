import { useState } from "react";
import CreateBrand from "../components/modals/CreateBrand";
import CreateDevice from "../components/modals/CreateDevice";
import CreateType from "../components/modals/CreateType";
import { createBrand, createDevice, createType } from "../http/deviceAPI";

const Admin = () => {
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);

  const handleCreateType = (type) => {
    createType({ name: type })
  }
  
  const handleCreateBrand = (brand) => {
    createBrand({ name: brand })
  };

  const handleCreateDevice = (device) => {
    createDevice(device)
  };

  return (
    <div className="container" style={{ display: 'flex', marginTop: 20, gap: 15}}>
      <button onClick={() => setIsTypeModalOpen(true)}>Add Type</button>
      <button onClick={() => setIsBrandModalOpen(true)}>Add Brand</button>
      <button onClick={() => setIsDeviceModalOpen(true)}>Add Device</button>

      {isBrandModalOpen && <CreateBrand show onSubmit={handleCreateBrand} onHide={() => setIsBrandModalOpen(false)} />}
      {isDeviceModalOpen && <CreateDevice show onSubmit={handleCreateDevice} />}
      {isTypeModalOpen && <CreateType show onSubmit={handleCreateType} onHide={() => setIsTypeModalOpen(false)} />}
    </div>
  )
}

export default Admin
