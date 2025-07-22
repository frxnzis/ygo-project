import { useState, useEffect, Fragment, forwardRef } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import '../App.scss';
import TablePagination from '@mui/material/TablePagination';
import Masonry from '@mui/lab/Masonry';

import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
import Fade from '@mui/material/Fade';
import { Container } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';


const Transition = forwardRef(function Transition(props, ref) {
    return <Zoom style={{ transitionDelay: '1ms' }} ref={ref} {...props} />;
});

const Transition2 = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const Overview = (props) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.up('sm'));

    const rowsPerPageOptions = [8, 16, 24]

    const [cards, setCards] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState();
    const [currentImg, setCurrentImg] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[1]);

    const [dialogHeight, setDialogHeight] = useState('auto');

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleClickOpen = (card) => {
        setCurrentCard(card);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setCurrentCard();
        setCurrentImg(0);
    };

    const handleClickImage = () => {
        const cantImg = currentCard.card_images.length;
        if (cantImg > 1) {
            currentImg >= (cantImg - 1) ? setCurrentImg(0) : setCurrentImg(currentImg + 1);
        }
    }

    useEffect(() => {
        if (Array.isArray(props.cardsSearch?.data)) {
            setCards(props.cardsSearch.data);
            setPage(0);
        } else {
            setCards([]);
        }

    }, [props.cardsSearch])

    const renderImg = () => {
        const cardImg = document.querySelector("#cardImage");
        const imgHeight = cardImg.clientHeight;
        setDialogHeight(imgHeight + 3);
    };


    if (cards.length > 0) {

        const xcards = cards.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        const checkAtk = (card) => {
            return card?.misc_info[0]?.question_atk === 1 ? '?' : card?.atk;
        }

        const checkDef = (card) => {
            return card?.misc_info[0]?.question_def === 1 ? '?' : card?.def;
        }

        return (
            <div className={'m-0 p-0'}>

                <Dialog
                    fullWidth={true}
                    maxWidth={'lg'}
                    open={open}
                    TransitionComponent={Transition2}
                    keepMounted
                    onClose={handleClose}
                    scroll={'paper'}
                    PaperProps={{
                        style: {
                            backgroundColor: '#30303099',
                            boxShadow: 'none',
                            borderRadius: '15px',
                            border: '1px solid #555555',
                            maxHeight: dialogHeight
                        },
                    }}
                >
                    {/* CARD INFO */}
                    <DialogContent className={'row m-0 p-0'} variant="outlined">
                        <div className={'cardImage col-12 col-lg-4 col-md-6 text-center m-0 p-0'} sx={{ cursor: 'pointer' }}>

                            {/* CARD IMAGE */}
                            <img
                                id="cardImage"
                                src={`${currentCard?.card_images[currentImg]?.image_url}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${currentCard?.card_images[currentImg]?.image_url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={currentCard?.name}
                                height={'auto'}
                                width={'100%'}
                                loading="eager"
                                style={currentCard?.card_images?.length > 1 ? { cursor: "pointer" } : null}
                                title={currentCard?.card_images?.length > 1 ? 'Click to change image' : ''}
                                onClick={() => handleClickImage()}
                                onLoad={() => renderImg()}
                            />

                        </div>
                        <div className={'col-12 col-lg-8 col-md-6 text-left'}>

                            {/* CARD NAME */}
                            <DialogContentText
                                sx={{
                                    fontSize: '1.45rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, cursor: 'default',
                                    border: '1px solid #404040', borderRadius: '10px', color: 'white', background: '#00000099',
                                }}>
                                <b title='Card Name'>{currentCard?.name}</b>
                            </DialogContentText>

                            {/* CARD TYPE, RACE, ATTRIBUTE & LEVEL*/}
                            <DialogContentText
                                sx={{
                                    fontSize: '1.2rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, borderRadius: '10px',
                                    border: '1px solid #404040', color: 'white', background: '#00000099', cursor: 'default'
                                }}>
                                <span title='Card Type'>🔹 {currentCard?.type} </span> &nbsp;
                                <span title='Card Race'>🔸 {currentCard?.race} </span> &nbsp;
                                <span title='Card Attribute'>{currentCard?.attribute ? '✧ ' : ''}
                                    {currentCard?.attribute ? currentCard.attribute : ''} </span>
                                <span title='Card Level'>{currentCard?.level > 0 ? '​​​​ ​​​​ ​✪ ​' : ''}
                                    {currentCard?.level > 0 ? currentCard.level : ''}</span>
                            </DialogContentText>

                            {/* CARD ATK-DEF, SCALE, LINK */}
                            {currentCard?.atk >= 0 ?
                                <DialogContentText
                                    sx={{
                                        fontSize: '1.2rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, borderRadius: '10px',
                                        border: '1px solid #404040', color: 'white', background: '#00000099', cursor: 'default'
                                    }}>
                                    <b title='Card Attack'>  {` ​ATK ${checkAtk(currentCard)}`}</b> &nbsp;
                                    <b title='Card Defense'>{currentCard?.def >= 0 ? `| ​ DEF ${checkDef(currentCard)} ​ ​` : ''}</b>
                                    <b title='Card Pendulum Scale'>{currentCard?.scale >= 0 ? `|​ ​ ◆ ​ ${currentCard.scale} ​ ​ ​` : ''}</b>
                                    <b title='Card Link Value'>{currentCard?.linkval > 0 ? `|​ ​ ❖ ​ ${currentCard.linkval} ​ ​ ` : ''}</b>

                                </DialogContentText>
                                : null
                            }

                            {/* CARD DESCRIPTION */}
                            <DialogContentText
                                sx={{
                                    fontSize: '1.2rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, borderRadius: '10px',
                                    border: '1px solid #404040', color: 'white', background: '#00000099', cursor: 'default'
                                }}>
                                <span title='Card Description'> {currentCard?.desc} </span>
                            </DialogContentText>

                            {/* CARD ID & ARCHETYPE */}
                            <DialogContentText
                                sx={{
                                    fontSize: '1.2rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, borderRadius: '10px',
                                    border: '1px solid #404040', color: 'white', background: '#00000099', cursor: 'default',
                                }}>
                                <span title='Card ID'> {` ​ID: ${currentCard?.card_images[currentImg]?.id}`} </span> &nbsp;
                                <span title='Card Archetype'> {currentCard?.archetype ? `◐ ${currentCard?.archetype}` : ''} </span>
                            </DialogContentText>

                        </div>
                    </DialogContent>
                </Dialog>


                {/* CARDS LIST */}
                <Box sx={{ padding: 0, margin: 0 }}>
                    <Masonry columns={{ xs: 3, sm: 4, md: 6, lg: 8, xl: 9 }}
                        spacing={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 3 }}>
                        {xcards.map((card, index) => (
                            <div className={'hover14'} key={index}>
                                <figure onClick={() => handleClickOpen(card)}>
                                    <img
                                        src={`${card.card_images[0]?.image_url_small}?w=164&h=164&fit=crop&auto=format`}
                                        srcSet={`${card.card_images[0]?.image_url_small}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        alt={card.name}
                                        loading="eager"
                                        style={{
                                            borderTopLeftRadius: 3,
                                            borderTopRightRadius: 3,
                                            borderBottomLeftRadius: 3,
                                            borderBottomRightRadius: 3,
                                            display: 'block',
                                            width: '100%',
                                            cursor: 'pointer !important'
                                        }}
                                    />
                                </figure>
                            </div>
                        ))}
                    </Masonry>

                    <TablePagination
                        component="div"
                        count={cards.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={rowsPerPageOptions}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage='Cards'
                        sx={{
                            '& .MuiTablePagination-selectLabel': {
                            paddingTop: '1rem',
                            },
                            '& .MuiTablePagination-displayedRows': {
                            paddingTop: '1rem',
                            }
                        }}
                    />

                </Box>

            </div >

        );

    }
    else {
        return (
            <div style={{ fontSize: '1.5rem', fontStyle: 'italic', margin: 100, textAlign: 'center' }}>
                No cards found... 👾
            </div >
        );
    }

}