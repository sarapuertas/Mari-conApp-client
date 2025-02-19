import '../PlaceDetailsPage/placeDetailsPage.css'
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from "../../context/auth.context"
import EditPlaceForm from "../../components/EditPlaceForm/EditPlaceForm"
import { Button, Modal, Collapse, Row, Container } from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import usersService from "../../services/users.service"
import placesService from "../../services/places.service"
import reviewsService from "../../services/review.service"
import ReviewForm from "../../components/ReviewForm/ReviewForm"
import ReviewCard from '../../components/ReviewCard/ReviewCard'

const PlaceDetailsPage = () => {

    const [showModal, setShowModal] = useState(false)
    const handleModalClose = () => setShowModal(false)
    const handleModalOpen = () => setShowModal(true)

    const [openReview, setOpenReview] = useState(false)
    const handleTransClose = () => setOpenReview(false)
    const handleTransOpen = () => setOpenReview(true)

    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const { id } = useParams()

    const [placeDetails, setPlaceDetails] = useState({})
    const [favorites, setFavorites] = useState([])
    const [isFavorite, setIsFavorite] = useState(false)
    const [reviews, setReviews] = useState([])

    const { name, type, description, image, location, url, owner } = placeDetails

    useEffect(() => {
        loadPlace()
        loadReviews()
    }, [])

    useEffect(() => {
        user && loadUser()
    }, [user])

    const loadPlace = () => {
        placesService
            .getOnePlace(id)
            .then(({ data }) => setPlaceDetails(data))
            .catch(err => console.log(err))
    }

    const loadUser = () => {
        usersService
            .getOneUser(user._id)
            .then(({ data }) => {
                setFavorites(data.favPlaces.map(elm => elm._id))
            })
            .catch(err => console.log(err))
    }

    const loadReviews = () => {
        reviewsService
            .getAllReviews(id)
            .then(({ data }) => setReviews(data))
            .catch(err => console.log(err))
    }

    const handleAddFavPlace = () => {
        usersService
            .addOnePlace(id)
            .then(() => navigate(`/perfil/${user._id}`))
            .catch(err => console.log(err))
    }

    const handleRemoveFavPlace = () => {
        usersService
            .removeOnePlace(id)
            .then(() => navigate(`/perfil/${user._id}`))
            .catch(err => console.log(err))
    }

    const handleDeleteFavPlace = () => {
        placesService
            .deleteOnePlace(id)
            .then(() => navigate('/'))
            .catch(err => console.log(err))
    }


    return (
        <>
            <Container>
                <Row>

                    <article className="placeDetails">

                        <img className="placeimg" src={image} />
                        <hr />
                        <h1>{name}</h1>
                        <p>{type}</p>
                        <p>{description}</p>
                        <a href={url}>Página web</a>

                    </article>
                    {
                        user?._id === owner || user?.role === "ADMIN" ?
                            <>
                                <Link to='#' onClick={handleModalOpen}>
                                    <Button className='place-button'>Editar información</Button>
                                </Link>
                                <Button className='place-button' type="submit" value="Submit" onClick={handleDeleteFavPlace}>Eliminar lugar</Button>
                            </>
                            :
                            <>
                                {!favorites.includes(id)
                                    ? <Button className='place-button' type="submit" value="Submit" onClick={handleAddFavPlace}>Añadir a favoritos</Button>
                                    : <Button className='place-button' type="submit" value="Submit" onClick={handleRemoveFavPlace}>Eliminar de favoritos</Button>}
                                <Button className='place-button' onClick={handleTransOpen} > Añadir opinión </Button>

                                <Collapse in={openReview} className="collapse">
                                    <div id="example-collapse-text">
                                        <ReviewForm closeReview={handleTransClose} loadReviews={loadReviews} />
                                    </div>
                                </Collapse>
                                {
                                    reviews.map(review => <ReviewCard review={review} key={review._id} loadReviews={loadReviews} placeId={id} />)
                                }
                            </>
                    }
                </Row>
                <hr />
                <Link to={`/perfil/${user?._id}`}>Volver</Link>
            </Container>

            <Modal show={showModal} onHide={handleModalClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Editar información de tu establecimiento</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditPlaceForm closeModal={handleModalClose} />
                </Modal.Body>
            </Modal>
        </>
    )
}

export default PlaceDetailsPage