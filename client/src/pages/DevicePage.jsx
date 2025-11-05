import { useContext, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { fetchOneDevice, rateDevice } from "../http/deviceAPI"
import { Context } from "../main"
import { addToCartWrapper } from "../utils/helpers"

const DevicePage = () => {
  const { cart, user } = useContext(Context)
  const { id } = useParams()
  const [device, setDevice] = useState({info: []})
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const imgUrl = device?.img?.startsWith('http') ? device.img : import.meta.env.VITE_SERVER_URL + device.img;

  useEffect(() => {
    fetchOneDevice(id).then(data => setDevice(data))
  }, [id])

  const onRate = async (e) => {
    const rating = e.target.value
    const updatedRating = await rateDevice(id, rating)
    setDevice({...device, averageRating: updatedRating.averageRating})
  }

  const onAddToCartClick = async() => {
    if (isAddingToCart) return
    setIsAddingToCart(true)
    try {
      const totalItems = await addToCartWrapper(device, user.isAuth)
      cart.setTotalItems(totalItems)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="container" style={{ marginTop: 20 }}>
      <div className="row">
        <div className="col-md-4">
          <img src={imgUrl} alt={device.name} style={{ maxWidth: 350 }} />
        </div>
        <div className="col-md-4">
          <h1>{device.name}</h1>
          <div style={{ fontSize: 40 }}>{device.averageRating} ⭐</div>
          <select onChange={onRate} defaultValue="">
            <option value="" disabled>Оцените товар</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
          <div className="row" style={{ marginTop: 50, flexWrap: 'wrap', maxWidth: '100%' }}>
            {device.info.map((info) =>
              <div key={info.id} style={{ padding: 12, borderRadius: 10, background: info.id % 2 !== 0 ? '#545454' : 'transparent' }}>
                {info.title}: {info.description}
              </div>
            )}
          </div>
        </div>
        <div className="col-md-4">
          <div className="card" style={{ width: 300, fontSize: 29, padding: 25 }}>
            <h3 className="mt-3">from: {device.price} USD</h3>
            <button onClick={onAddToCartClick} disabled={isAddingToCart}>
              {isAddingToCart ? 'Adding...' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DevicePage
