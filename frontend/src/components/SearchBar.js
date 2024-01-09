import { useContext, useState } from "react";
import { DebounceInput } from 'react-debounce-input';

import SearchContext from "../store/search-context";

import { ReactComponent as SearchIcon } from "../icons/ICN_Search.svg";
import { ReactComponent as SortIcon } from "../icons/ICN_Sort.svg";
import { ReactComponent as CloseIcon } from "../icons/ICN_Close.svg";

import classes from "./SearchBar.module.css";
import { boldHighlights } from "../utils/boldHighlights";

const SearchBar = () => {
  const searchCtx = useContext(SearchContext);
  const [showModal, setShowModal] = useState(false);
  const [sorting, setSorting] = useState('ascending');
  const [resultList, setResultList] = useState([]);
  const [focus, setFocus] = useState(0);
  const [searchWords, setSearchWords] = useState('');

  const toggleShowModal = () => {
    setShowModal((oldState) => !oldState);
  };

  const reverseHandler = (order) => {
    searchCtx.setSortOrder(order);
    setSorting(order);
    toggleShowModal();
  };

  const getSearchResults = async (searchWords) => {
    if (searchWords.length === 0) { setResultList([]); return; }

    setSearchWords(searchWords);
    const response = await fetch(`/api/search-game-title/${searchWords}`);
    const data = await response.json();

    const listNames = data.result.map(({ titolo, id }) => ({ titolo, id }));
    setResultList(listNames);
  }
  
  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      setFocus(() => focus + 1);
    }
    if (event.key === 'ArrowUp') {
      setFocus(() => focus - 1);
    }
    if (event.key === 'Enter') {
      if(!resultList[focus]) return;
      searchCtx.setSearchInput(resultList[focus].titolo);
      searchCtx.setSelectedGameId(resultList[focus].id);
      setResultList([]);
      setFocus(0);
      document.querySelector('#focus-search-list').focus();
    }
  }

  const resetSearch = () => {
    searchCtx.setSearchInput("");
    setSearchWords('');
    searchCtx.setSelectedGameId(null);
    setResultList([]);
  }

  function handleSearchSelection (result) {
    searchCtx.setSearchInput(result.titolo);
    searchCtx.setSelectedGameId(result.id);
    setResultList([]);
  }

  const checkIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${classes.checkIcon}`}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>;

  return (
    <>
      <div className={classes.searchBar}>
        <DebounceInput
          initial-scale="1"
          maximum-scale="1"
          type="text"
          placeholder={"| Cerca un gioco…"}
          className={classes.input}
          id="search-bar"
          minLength={3}
          aria-label="Cerca un gioco!"
          debounceTimeout={300}
          onChange={(ev) => {
            getSearchResults(ev.target.value)
          }}
          onFocus={() => window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
          })
          }
          value={searchCtx.searchInput}
          onKeyDown={onKeyDown}
        />
        {resultList.length > 0 &&
          <div className={classes.searchSuggestions}>
            {resultList.map((result, i) =>
              <div
                className={`${classes.suggestion} ${i === focus ? classes.keyActive : ''}`}
                key={result.id}
                onClick={() => {
                  handleSearchSelection(result);
                }}
                onKeyDown={(ev)=> {
                  if(ev.key === "Enter"){
                    handleSearchSelection(result);
                    document.querySelector('#focus-search-list').focus();
                  }
                }}
                >
                <p tabIndex={0}>{boldHighlights(result.titolo, searchWords)}</p>
              </div>
            )}
          </div>}
        <div className={classes.searchIcon} tabIndex={-1}>
          <SearchIcon />
        </div>
        {searchCtx.searchInput.trim() === "" && searchWords === '' ? (
          <>
            <button className={classes.sortIcon} onClick={toggleShowModal} tabIndex={0}>
              <SortIcon />
            </button>
            <div className={`${classes.sortModal} ${showModal ? classes.show : ''}`}>
              <p className={classes.sortText}>ORDINA PER</p>
              <div className={classes.sortContainer}>
                <p className={classes.sortControl} onClick={reverseHandler.bind(this, "ascending")}>Più recenti</p>
                <div className={sorting === 'ascending' ? classes.showCheckIcon : ''}>{checkIcon}</div>
              </div>
              <div className={classes.sortContainer}>
                <p className={classes.sortControl} onClick={reverseHandler.bind(this, "descending")}>Meno recenti</p>
                <div className={sorting === 'descending' ? classes.showCheckIcon : ''}>{checkIcon}</div>
              </div>
              <button className={classes.sortButton} onClick={toggleShowModal}>
                Chiudi
              </button>
            </div>
          </>
        ) :
          <>
            <div
              className={classes.closeIcon}
              tabIndex={0}
              onKeyDown={(ev)=> 
              {if(ev.key === 'Enter') resetSearch()}}
              onClick={() => {
                resetSearch()
              }}>
              <CloseIcon />
            </div>
          </>
        }
      </div >
      <div className={classes.overlayMobile}></div>
    </>
  );
};

export default SearchBar;
