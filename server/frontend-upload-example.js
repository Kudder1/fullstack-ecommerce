// Frontend example for direct S3 upload using presigned URLs

// Frontend utility function for direct S3 upload
const uploadImageDirectly = async (imageFile) => {
    try {
        // Step 1: Get presigned URL from your backend
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        
        const response = await fetch('/api/device/upload-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                fileName: fileName,
                contentType: imageFile.type
            })
        })
        
        if (!response.ok) {
            throw new Error('Failed to get upload URL')
        }
        
        const { url, fields, finalUrl } = await response.json()
        
        const formData = new FormData()
        
        // Add all the presigned fields first (these are required by S3)
        Object.entries(fields).forEach(([key, value]) => {
            formData.append(key, value)
        })
        
        // Add the file last
        formData.append('file', imageFile)
        
        // Upload to S3
        const uploadResponse = await fetch(url, {
            method: 'POST',
            body: formData
        })
        
        if (!uploadResponse.ok) {
            throw new Error('Upload to S3 failed')
        }
        
        // Step 3: Return the permanent URL
        return finalUrl
        
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

// Example usage in React component
const ExampleComponent = () => {
    const [deviceData, setDeviceData] = useState({
        name: '',
        price: '',
        brandId: '',
        typeId: ''
    })
    const [imageFile, setImageFile] = useState(null)
    const [uploadMethod, setUploadMethod] = useState('server') // 'server' or 'direct'

    // Method 1: Existing server upload (your current method)
    const createDeviceServerUpload = async () => {
        const formData = new FormData()
        formData.append('name', deviceData.name)
        formData.append('price', deviceData.price)
        formData.append('brandId', deviceData.brandId)
        formData.append('typeId', deviceData.typeId)
        formData.append('image', imageFile)
        
        const response = await fetch('/api/device', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        
        return response.json()
    }

    // Method 2: NEW direct S3 upload (upload only after device creation)
    const createDeviceDirectUpload = async () => {
        try {
            // Step 1: Create device first with temporary image
            const response = await fetch('/api/device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...deviceData,
                    imageUrl: 'temp'  // Temporary placeholder
                })
            })
            
            if (!response.ok) {
                throw new Error('Failed to create device')
            }
            
            const device = await response.json()
            
            // Step 2: Upload image to S3 only after successful device creation
            const imageUrl = await uploadImageDirectly(imageFile)
            
            // Step 3: Update device with actual S3 URL
            const updateResponse = await fetch(`/api/device/${device.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    img: imageUrl
                })
            })
            
            if (!updateResponse.ok) {
                console.warn('Device created but failed to update image URL')
            }
            
            return { ...device, img: imageUrl }
            
        } catch (error) {
            console.error('Error creating device:', error)
            throw error
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            let result
            if (uploadMethod === 'server') {
                result = await createDeviceServerUpload()
            } else {
                result = await createDeviceDirectUpload()
            }
            
            console.log('Device created:', result)
            alert('Device created successfully!')
            
        } catch (error) {
            console.error('Error:', error)
            alert('Error creating device')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Device Name"
                value={deviceData.name}
                onChange={(e) => setDeviceData({...deviceData, name: e.target.value})}
            />
            
            <input
                type="number"
                placeholder="Price"
                value={deviceData.price}
                onChange={(e) => setDeviceData({...deviceData, price: e.target.value})}
            />
            
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
            />
            
            <div>
                <label>
                    <input
                        type="radio"
                        value="server"
                        checked={uploadMethod === 'server'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                    />
                    Server Upload (existing method)
                </label>
                
                <label>
                    <input
                        type="radio"
                        value="direct"
                        checked={uploadMethod === 'direct'}
                        onChange={(e) => setUploadMethod(e.target.value)}
                    />
                    Direct S3 Upload (new method)
                </label>
            </div>
            
            <button type="submit">Create Device</button>
        </form>
    )
}

export default ExampleComponent
