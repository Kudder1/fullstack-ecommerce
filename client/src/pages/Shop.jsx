import TypeBar from '../components/TypeBar'
import BrandBar from '../components/BrandBar'
import DeviceList from '../components/DeviceList'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { Context } from '../main'
import { fetchBrands, fetchDevices, fetchTypes } from '../http/deviceAPI'
import Pages from '../components/Pages'

const Shop = observer(() => {
  const { device } = useContext(Context)

  useEffect(() => {
    Promise.all([fetchTypes(), fetchBrands(), fetchDevices(null, null, 1, 3)]).then(([types, brands, devices]) => {
      device.setTypes(types)
      device.setBrands(brands)
      device.setDevices(devices.rows)
      device.setTotalCount(devices.count)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchDevices(device.selectedType.id, device.selectedBrand.id, device.page, device.limit).then(data => {
      device.setDevices(data.rows)
      device.setTotalCount(data.count)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.page, device.selectedType.id, device.selectedBrand.id])

  return (
    <div className="container">
      <div className="row mt-2">
        <div className="col-md-3">
          <TypeBar />
        </div>
        <div className="col-md-9">
          <BrandBar />
          <DeviceList />
          <Pages />
        </div>
      </div>
    </div>
  )
})

export default Shop
