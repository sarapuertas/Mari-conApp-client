import '../PlaceForm/PlaceForm.css'
import { useState, useContext } from "react"
import { Form, Button, Row, Col } from 'react-bootstrap'
import uploadService from "../../services/upload.service"
import placesService from "../../services/places.service"
import { useNavigate } from 'react-router-dom'
import Geocode from "react-geocode"
import { MessageContext } from './../../context/userMessage.context'
Geocode.setApiKey(`${process.env.REACT_APP_MAPS_API_KEY}`)
Geocode.setLanguage("es")
Geocode.setRegion("es")
Geocode.setLocationType("ROOFTOP")

function CreatePlaceForm() {

    const [placeInfo, setPlaceInfo] = useState({
        name: "",
        type: "",
        url: "",
        image: "",
        description: "",
        locationText: ""
    })
    const { setShowMessage, setMessageInfo } = useContext(MessageContext)

    const [placeGeolocation, setPlaceGeolocation] = useState({ lat: "", lng: "" })

    const [loadingImage, setLoadingImage] = useState(true)

    const { name, type, url, description, locationText, image } = placeInfo
    const { lat, lng } = placeGeolocation

    const navigate = useNavigate()

    const handleInputChange = e => {
        const { name, value } = e.target

        if (name === 'locationText') {
            getUserLocation(value)
        }
        setPlaceInfo({
            ...placeInfo,
            [name]: value
        })
    }

    const uploadPlaceImage = e => {

        const uploadData = new FormData()
        uploadData.append('imageData', e.target.files[0])

        uploadService
            .uploadImage(uploadData)
            .then(({ data }) => {
                setPlaceInfo({ ...placeInfo, image: data.cloudinary_url })
                setLoadingImage(false)

            })
            .catch(err => console.log(err))

    }

    const getUserLocation = (val) => {
        Geocode.fromAddress(val).then(
            (response) => {
                const { lat, lng } = response.results[0].geometry.location
                setPlaceGeolocation({ lat, lng })
            },
            (error) => {
                console.log(error)
            }
        )
    }

    function handleSubmit(e) {

        e.preventDefault()

        placesService
            .createOnePlace({ name, type, url, description, lat, lng, image })
            .then(() => {
                setShowMessage(true)
                setMessageInfo({ title: 'Éxito', body: 'Se ha creado el lugar exitosamente' })
                navigate('/')
            })
            .catch(err => console.log(err))
    }

    return (
        <Row className="justify-content-md-center">
            <Col md="auto">
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre de tu local</Form.Label>
                        <Form.Control type="text" name="name" value={name} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>¿Qué tipo de local es?</Form.Label>
                        <Form.Control type="text" name="type" value={type} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Añade el url del local</Form.Label>
                        <Form.Control type="text" name="url" value={url} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control as="textarea" name="description" value={description} onChange={handleInputChange} />
                        <Form.Text className="text-muted">
                            Escribe una ligera descripción de tu local
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Añade la ubicación</Form.Label>
                        <Form.Control type="text" name="locationText" value={locationText} onChange={handleInputChange} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Sube una imagen del local</Form.Label>
                        <Form.Control type="file" onChange={uploadPlaceImage} />
                    </Form.Group>
                    <Button className="form-button" type="submit" disabled={loadingImage}>
                        {loadingImage ? 'Rellena los campos necesarios' : 'Completar registro'}
                    </Button>
                </Form>
            </Col>
        </Row >

    )
}

export default CreatePlaceForm