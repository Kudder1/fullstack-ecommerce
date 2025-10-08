export const appendToFormData = (data) => {
    const formData = new FormData()
    for (const key in data) {
        let value = data[key]
        if (key === 'info' && Array.isArray(value)) {
            value = JSON.stringify(value)
        }
        if (value instanceof File || typeof value !== 'object') {
            formData.append(key, value)
        }
    }
    return formData
}
