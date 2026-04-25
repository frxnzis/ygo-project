import { useCallback, useState } from 'react';
import { MainNavbar } from './components/main-navbar';
import { Overview } from './pages/overview'
import PropTypes from 'prop-types';
import './App.scss';

export default function App({ children }) {

  const [cardsSearch, setCardsSearch] = useState({
    data: [],
    loading: false,
    error: ''
  });

  const callbackFunction = useCallback((data) => {
    setCardsSearch((previousState) => ({
      ...previousState,
      ...data
    }));
  }, []);

  return (
    <div className="App">
      <MainNavbar parentCallback={callbackFunction} />
      <div className="shell">
        <Overview cardsSearch={cardsSearch} ></Overview>
      </div>
    </div>
  )
};

App.propTypes = {
  children: PropTypes.node
};
