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

import Slide from '@mui/material/Slide';
import Zoom from '@mui/material/Zoom';
import Fade from '@mui/material/Fade';

const Transition = forwardRef(function Transition(props, ref) {
    return <Zoom style={{ transitionDelay: '1ms' }} ref={ref} {...props} />;
});

const Transition2 = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export const Overview = (props) => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.up('sm'));

    const [cards, setCards] = useState([]);
    const [open, setOpen] = useState(false);
    const [currentCard, setCurrentCard] = useState();
    const [currentImg, setCurrentImg] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(12);

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
        setCards(
            Array.isArray(props.cardsSearch?.data) ? props.cardsSearch.data : []
        );
    }, [props.cardsSearch])

    if (cards.length > 0) {

        const xcards = cards.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

        return (
            <div className={'m-0 p-0'}>

                <Dialog
                    fullWidth={true}
                    maxWidth={'lg'}
                    open={open}
                    TransitionComponent={Transition2}
                    keepMounted
                    onClose={handleClose}
                    PaperProps={{
                        style: {
                            backgroundColor: '#30303099',
                            boxShadow: 'none',
                            borderRadius: '15px',
                            border: '1px solid #555555'
                        },
                    }}
                >
                    {/* CARD INFO */}
                    <DialogContent className={'row m-0 p-0'} variant="outlined">
                        <div className={'col-12 col-md-4 text-center m-0 p-0'} sx={{ cursor: 'pointer' }}>

                            {/* CARD IMAGE */}
                            <img
                                src={`${currentCard?.card_images[currentImg]?.image_url}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${currentCard?.card_images[currentImg]?.image_url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={currentCard?.name}
                                height={'100%'}
                                width={'100%'}
                                loading="lazy"
                                style={currentCard?.card_images?.length > 1 ? { cursor: "pointer" } : null}
                                title={currentCard?.card_images?.length > 1 ? 'Click to change image' : ''}
                                onClick={() => handleClickImage()}
                            />

                        </div>
                        <div className={'col-12 col-md-8 text-left'}>

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

                            {/* CARD ATK-DEF & SCALE */}
                            {currentCard?.atk >= 0 ?
                                <DialogContentText
                                    sx={{
                                        fontSize: '1.2rem', margin: 1, marginTop: 2, paddingY: 1, paddingX: 2, borderRadius: '10px',
                                        border: '1px solid #404040', color: 'white', background: '#00000099', cursor: 'default'
                                    }}>
                                    <b title='Card Attack'>  {` ​ATK ${currentCard?.atk}`}</b> &nbsp;
                                    <b title='Card Defense'>{currentCard?.def >= 0 ? `| ​ DEF ${currentCard.def} ​ ​` : ''}</b>
                                    <b title='Card Pendulum Scale'>{currentCard?.scale >= 0 ? `|​ ​ ◆ ​ ${currentCard.scale} ​ ◇​ ​ ` : ''}</b>

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
                <ImageList
                    sx={{ margin: 0, padding: 0, maxWidth: 'auto', width: '100%' }}
                    variant="quilted" cols={isMobile ? 6 : 1} gap={8}
                    rowHeight={'auto'}>
                    {xcards.map((card) => (
                        <ImageListItem key={card.card_images[0].image_url}
                            title={card.name} sx={{ cursor: 'pointer' }} onClick={() => handleClickOpen(card)} >
                            <div className={'hover14'} >
                                <figure>
                                    <img
                                        src={`${card.card_images[0]?.image_url}?w=164&h=164&fit=crop&auto=format`}
                                        srcSet={`${card.card_images[0]?.image_url}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                        alt={card.name}
                                        loading="lazy"
                                    />
                                </figure>
                            </div>
                        </ImageListItem>
                    ))}

                </ImageList>

                <Box className={'row m-0 p-0'} sx={{ width: '100%', padding: 0 }}>
                    <TablePagination
                        sx={{ color: "#5d5d5d", marginTop: 3 }}
                        component="div"
                        count={cards.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[12, 24, 36, 100]}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage='Cards per page'
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