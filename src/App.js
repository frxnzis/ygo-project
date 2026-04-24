import { useState } from 'react';
import { MainNavbar } from './components/main-navbar';
import { Overview } from './pages/overview'
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import './App.scss';

const MainLayoutRoot = styled('div')(({ theme }) => ({
  backgroundColor: 'lightgrey',
  height: '100%',
  paddingTop: 0
}));

const ContentLayout = styled('div')(({ theme }) => ({
  height: '100%',
  margin: 40,
  backgroundColor: 'lightgrey',
}));

export default function App({ children }) {

  const [cardsSearch, setCardsSearch] = useState({
    data: [],
    loading: false,
    error: ''
  });

  const callbackFunction = (data) => {
    setCardsSearch((previousState) => ({
      ...previousState,
      ...data
    }));
  }

  return (
    <MainLayoutRoot>
      <MainNavbar parentCallback={callbackFunction} />
      <ContentLayout>
        <Overview cardsSearch={cardsSearch} ></Overview>
      </ContentLayout>


    </MainLayoutRoot>
  )
};

App.propTypes = {
  children: PropTypes.node
};
