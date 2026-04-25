import { useState, useEffect, forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress';
import '../App.scss';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const Overview = (props) => {
    const rowsPerPageOptions = [12, 24, 36];

    const [cards, setCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentImg, setCurrentImg] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [page, setPage] = useState(0);
    const rowsPerPage = rowsPerPageOptions[0];

    const handleChangePage = (direction) => {
        if (direction === 'next' && (page + 1) * rowsPerPage < cards.length) {
            setPage(page + 1);
        } else if (direction === 'prev' && page > 0) {
            setPage(page - 1);
        }
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setCurrentImg(0);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedCard(null);
        setCurrentImg(0);
    };

    const handleClickImage = () => {
        if (selectedCard) {
            const cantImg = selectedCard.card_images.length;
            if (cantImg > 1) {
                setCurrentImg(currentImg >= (cantImg - 1) ? 0 : currentImg + 1);
            }
        }
    };

    useEffect(() => {
        if (Array.isArray(props.cardsSearch?.data) && props.cardsSearch.data.length > 0) {
            setCards(props.cardsSearch.data);
            setPage(0);
            setSelectedCard(null);
            setOpenModal(false);
        } else if (!props.cardsSearch?.loading) {
            setCards([]);
        }
    }, [props.cardsSearch?.data, props.cardsSearch?.loading]);

    if (props.cardsSearch?.loading) {
        return (
            <div className="loading-container">
                <CircularProgress />
                <div className="loading-text">Buscando cartas...</div>
            </div>
        );
    }

    if (props.cardsSearch?.error) {
        return (
            <div className="status-panel status-panel-error" role="alert">
                <strong>No se pudo completar la búsqueda</strong>
                <span>{props.cardsSearch.error}</span>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="no-results">
                No cards found... 👾
            </div>
        );
    }

    const cardsInPage = cards.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const totalPages = Math.ceil(cards.length / rowsPerPage);

    const checkAtk = (card) => {
        return card?.misc_info[0]?.question_atk === 1 ? '?' : card?.atk;
    };

    const checkDef = (card) => {
        return card?.misc_info[0]?.question_def === 1 ? '?' : card?.def;
    };

    return (
        <>
            <div className="results-panel">
                <div className="section-head">
                    <div>
                        <h2>Search Results</h2>
                        <span>
                            Showing {cardsInPage.length > 0 ? page * rowsPerPage + 1 : 0}-{Math.min((page + 1) * rowsPerPage, cards.length)} of {cards.length} cards
                        </span>
                    </div>
                </div>

                <div className="card-grid">
                    {cardsInPage.map((card, index) => (
                        <article 
                            key={card.id || index}
                            className="card-tile"
                            onClick={() => handleCardClick(card)}
                        >
                            <img
                                src={`${card.card_images[0]?.image_url_small}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${card.card_images[0]?.image_url_small}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={card.name}
                                loading="lazy"
                            />
                            <div className="card-meta">
                                <strong title={card.name}>{card.name}</strong>
                                <span>
                                    {card.type}{card.race ? ` · ${card.race}` : ''}{card.attribute ? ` · ${card.attribute}` : ''}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* PAGINATION */}
                <div className="pagination">
                    <span>Page {page + 1} of {totalPages}</span>
                    <div className="pager-buttons">
                        <button 
                            className="icon-button" 
                            onClick={() => handleChangePage('prev')}
                            disabled={page === 0}
                            aria-label="Previous page"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button 
                            className="icon-button" 
                            onClick={() => handleChangePage('next')}
                            disabled={page >= totalPages - 1}
                            aria-label="Next page"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL - CARD DETAILS */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                TransitionComponent={Transition}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    className: 'card-modal',
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        backgroundImage: 'none',
                    },
                }}
            >
                <DialogContent className="modal-content">
                    {selectedCard && (
                        <div className="modal-wrapper">
                            {/* Close Button */}
                            <button 
                                className="modal-close" 
                                onClick={handleCloseModal}
                                aria-label="Close"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Card Image */}
                            <div className="modal-image-container">
                                <img
                                    src={selectedCard.card_images[currentImg]?.image_url}
                                    alt={selectedCard.name}
                                    onClick={handleClickImage}
                                    className="modal-image"
                                    title={selectedCard.card_images.length > 1 ? 'Click para cambiar imagen' : ''}
                                />
                                {selectedCard.card_images.length > 1 && (
                                    <div className="image-counter">
                                        {currentImg + 1} / {selectedCard.card_images.length}
                                    </div>
                                )}
                            </div>

                            {/* Card Info */}
                            <div className="modal-info">
                                <h2 className="modal-title">{selectedCard.name}</h2>
                                <p className="modal-description">
                                    {selectedCard.desc || 'Sin descripción disponible'}
                                </p>

                                {/* Stats Grid */}
                                <div className="modal-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Card Type</span>
                                        <strong className="stat-value">{selectedCard.type}</strong>
                                    </div>
                                    {selectedCard.race && (
                                        <div className="stat-item">
                                            <span className="stat-label">Monster Type</span>
                                            <strong className="stat-value">{selectedCard.race}</strong>
                                        </div>
                                    )}
                                    {selectedCard.attribute && (
                                        <div className="stat-item">
                                            <span className="stat-label">Attribute</span>
                                            <strong className="stat-value">{selectedCard.attribute}</strong>
                                        </div>
                                    )}
                                    {selectedCard.level > 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">Level/Rank</span>
                                            <strong className="stat-value">★ {selectedCard.level}</strong>
                                        </div>
                                    )}
                                    {selectedCard.atk >= 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">ATK</span>
                                            <strong className="stat-value">{checkAtk(selectedCard)}</strong>
                                        </div>
                                    )}
                                    {selectedCard.def >= 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">DEF</span>
                                            <strong className="stat-value">{checkDef(selectedCard)}</strong>
                                        </div>
                                    )}
                                    {selectedCard.scale >= 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">Pendulum Scale</span>
                                            <strong className="stat-value">◆ {selectedCard.scale}</strong>
                                        </div>
                                    )}
                                    {selectedCard.linkval > 0 && (
                                        <div className="stat-item">
                                            <span className="stat-label">Link Rating</span>
                                            <strong className="stat-value">❖ {selectedCard.linkval}</strong>
                                        </div>
                                    )}
                                    <div className="stat-item">
                                        <span className="stat-label">Card ID</span>
                                        <strong className="stat-value">{selectedCard.card_images[currentImg]?.id}</strong>
                                    </div>
                                    {selectedCard.archetype && (
                                        <div className="stat-item">
                                            <span className="stat-label">Archetype</span>
                                            <strong className="stat-value">{selectedCard.archetype}</strong>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};;
