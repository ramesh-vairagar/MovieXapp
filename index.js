const moviesList = document.getElementById("movies-list");

const APIKEY = "db10ecdc3b30a0913e712a2030fb7525";
let movies = [];

let currentPage = 1,
  totalPages = 1;

  // --------------- LocalStorage Opeations ---------------------- //


function getFavMoviesFromLocalStorage() {
  const favMovies = JSON.parse(localStorage.getItem("favouriteMovie"));
  return favMovies === null ? [] : favMovies;
}

function addMovieInfoInLocalStorage(mInfo) {
  const localStorageMovies = getFavMoviesFromLocalStorage();

  localStorage.setItem(
    "favouriteMovie",
    JSON.stringify([...localStorageMovies, mInfo])
  );
}

function removeMovieInfoFromLocalStorage(mInfo) {
  let localStorageMovies = getFavMoviesFromLocalStorage();


  let filteredMovies = localStorageMovies.filter((eMovie) => {
    return eMovie.title != mInfo.title;
  });

  if( document.querySelector("#favorits-tab").classList.contains("active-tab") && filteredMovies.length == 0 ) {    // handling fav page
    document.querySelector("#favourite-page").style.display = "flex";
  }
  else{
    document.querySelector("#favourite-page").style.display = "none";
  }

  localStorage.setItem("favouriteMovie", JSON.stringify(filteredMovies));
}


//  ------------------ Render Movies --------------------- //


function renderMovies(movies) {
  let favMovies = getFavMoviesFromLocalStorage();

  moviesList.innerHTML = "";

  movies.map((eMovie) => {
    const { poster_path, title, vote_average, vote_count } = eMovie;

    let listItem = document.createElement("li");
    listItem.className = "card";

    let imageUrl = poster_path
      ? `https://image.tmdb.org/t/p/original${poster_path}`
      : "";

    let mInfo = {
      title,
      poster_path,
      vote_average,
      vote_count,
    };

    const rs = favMovies.find((eFavMovie) => eFavMovie.title == title);

    listItem.innerHTML = `
            <img class="poster" src="${imageUrl}" alt="${title}">
            <p class="title">${title}</p>
            <section class="vote-fav">
                <section>
                    <p>Votes: ${vote_count}</p>
                    <p>Rating: ${vote_average}</p>
                </section>
                <i id='${JSON.stringify( mInfo )}' class="fa-regular fa-heart fa-2xl fav-icon ${ 
                  rs && "fa-solid"
            } "></i>
            </section>
        `;

//  ------------------ Handling Favourite Icon ---------------------- //

    const favIconBtn = listItem.querySelector(".fav-icon");

    favIconBtn.addEventListener("click", (event) => {


      const { id } = event.target;

      const mInfo = JSON.parse(id);

      if (favIconBtn.classList.contains("fa-solid")) {
        // unmark it
        // 1) remove the fa-solid from the facIconBtn
        favIconBtn.classList.remove("fa-solid");

        // 2) remove the info of this movie from the localstroge
        removeMovieInfoFromLocalStorage(mInfo);

      } else {
        // mark it
        // 1) add the fa-solid class to the favIconBtn button
        favIconBtn.classList.add("fa-solid");
        // 2) add the info of this movie to the localstorage
        addMovieInfoInLocalStorage(mInfo);

      }

    });

    moviesList.appendChild(listItem);
  });

}


 //  ----------------- fetch movies from API -------------------- //

async function fetchMovies() {
  try {
    const resp = await fetch(
      `https://api.themoviedb.org/3/movie/now_playing?api_key=${APIKEY}&language=en-US&page=${currentPage}`
    );
    let data = await resp.json();
    
    hideLoader();

    movies = data.results;
    totalPages = data.total_pages;

    tPage.innerText = totalPages;
    renderMovies(movies);

    return movies;
  } 
  catch (error) {
    console.log(error);
  }
}

( async () => {
  await fetchMovies();
})()


//  --------------------- fetch genres ---------------------- //

let genreArr = [];

async function fetchGenres() {
  
  const genreRes = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${APIKEY}&language=en`)
  let genreData = await genreRes.json();

  const list_items = document.querySelectorAll(".header-ul li");

  genreData = genreData.genres;

  genreArr = genreData;

  list_items.forEach( (li) => {
    for( let i =0 ; i< genreData.length ; i++ ) {
        if( li.innerText == genreData[i].name){
          li.id = genreData[i].id;
        }
    }
  })

}

fetchGenres();

let ul = document.querySelector(".header-ul");

  
  ul.addEventListener( 'click', (e)=> {

      let selectedMovies = [];

      if(e.target.id != "")
      {
        selectedMovies = movies.filter( (movie) => {
            return movie.genre_ids.includes(+e.target.id);
        })
      }
      
      renderMovies(selectedMovies);
  })



  // ----------------- loader --------------------------//

  showLoader();

  function showLoader() {
    document.querySelector('.movies-list-pagination').style.display = 'none';
    document.querySelector("#loader").style.display = "flex";
  }

  function hideLoader() {
    document.querySelector('.movies-list-pagination').style.display = 'flex';
    document.querySelector("#loader").style.display = "none";

  }


// -------------------- show hide navbar ---------------- //

  let windowWidth = window.innerWidth;

function handleWindowResize() {            // removing elements as per screen

  windowWidth = window.innerWidth;

  if( windowWidth <= 980 ){
    document.querySelector(".header-ul li:last-child").style.display = "none";  
  }
  else{
    document.querySelector(".header-ul li:last-child").style.display = "inline";
  }

  if( windowWidth <= 745){
    document.querySelector(".header-ul").style.display = "none";
    document.querySelector("#show-navbar").style.display = "inline";
    document.querySelector("header nav").style.justifyContent = "flex-end";
    document.querySelector("#hide-navbar").style.display = "none";
    
  }
  else{
    document.querySelector(".header-ul").style.display = "flex";
    document.querySelector("#show-navbar").style.display = "none";
    document.querySelector(".header-ul").classList.add("desktop-class");
    document.querySelector(".header-ul").classList.remove("mobile-class");
    document.querySelector("header nav").style.justifyContent = "space-between";
  }
}

window.onresize = handleWindowResize;                                         // window.onresize

handleWindowResize();

document.querySelector("#show-navbar").addEventListener("click", () => {    // adding vertical navbar


    document.querySelector(".header-ul").style.display = "flex";
    document.querySelector(".header-ul li:last-child").style.display = "inline";


    document.querySelector(".header-ul").classList.remove("desktop-class");
    document.querySelector(".header-ul").classList.add("mobile-class");

    document.querySelector("#show-navbar").style.display = "none";
    document.querySelector("#hide-navbar").style.display = "inline";
})

document.querySelector("#hide-navbar").addEventListener("click", () => {   // removing vertical navbar

    document.querySelector(".header-ul").classList.remove("mobile-class");
    document.querySelector(".header-ul").classList.remove("desktop-class");

    document.querySelector(".header-ul").style.display = "none";

    document.querySelector("#show-navbar").style.display = "inline";
    document.querySelector("#hide-navbar").style.display = "none";
})


document.querySelector("body").addEventListener("click", (e) => {        // hiding navbar when user clicks outside
  
  let ul = document.querySelector(".header-ul");

  if( ul.classList.contains("mobile-class")){

    if( !e.target.classList.contains("header-ul") && e.target.tagName != "BUTTON" && e.target.tagName != "I"){
      
      document.querySelector(".header-ul").classList.remove("desktop-class");
  
      document.querySelector(".header-ul").style.display = "none";
  
      document.querySelector("#show-navbar").style.display = "inline";
      document.querySelector("#hide-navbar").style.display = "none";
    }

  }
})



// ------------------- modal ------------------------------//

let moviesContainer = document.querySelector("#movies-list");

moviesContainer.addEventListener("click", (e) => {
  
  movies.forEach( movie => {

      if( movie.title == e.target.parentNode.childNodes[1].alt){
        
        const {title,poster_path,original_language,vote_average,overview} = movie;

        let posterUrl = `https://image.tmdb.org/t/p/original${poster_path}`
        let runtime = Math.floor(Math.random()*(200-150)+150)
        let lang = original_language.toUpperCase()
        let duration = runtime*2

        localStorage.setItem("mvPrice",runtime)


        let genreName;
        genreArr.forEach((e)=>{
            
            if( movie.genre_ids[0] == e.id){
                genreName = e.name
                
            }
        })

        let modalContainer = document.querySelector(".modal-container");

        modalContainer.classList.remove("hidden")

        modalContainer.innerHTML = `<div class="modal-card">

                                        <div class="img-section">
                                            <img src=${posterUrl} alt=${title} class="modal-img">
                                        </div>

                                        <div class="description-section">

                                            <div class="description-card">
                                                <h1 class="movie-name">${title}</h1>
                                                <h3 class="movie-rating"><i class="fa-solid fa-star"></i> <span class="mv-rating">${vote_average}</span>/10</h3>
                                                <p class="mv-lang">${lang}</p>
                                                <p><span>${runtime} minutes</span><i class="fa-solid fa-circle-small"></i> <span>${genreName}</span></p>
                                                <p class="overview">${overview}</p>
                                                <p>&#8377; <span class="mv-price">${duration}</span></p>
                                                <button class="book-tickets-btn">Book Tickets</button>      
                                            </div>

                                            <button class="modal-close-btn"><i class="fa-solid fa-xmark"></i></button>
                                        </div>  
                                    </div>`
      
                                    
        const closeBtn = document.querySelector(".modal-close-btn")
        
        closeBtn.addEventListener("click", hideModal)

        modalContainer.addEventListener("click", hideModal)

        const bookTicketsBtn = document.querySelector(".book-tickets-btn")

        bookTicketsBtn.addEventListener("click",(e)=>{
            e.preventDefault();
        })

      }
  }) 

})

function hideModal(){
  document.querySelector(".modal-container").classList.add("hidden")
}


// ---------------  search movies---------------------- //

const searchBtn = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

searchBtn.addEventListener("click", searchMovies);

async function searchMovies() {
  const searchText = searchInput.value;
  
  if( searchText !== ""){
    const resp = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${searchText}&api_key=${APIKEY}&include_adult=false&language=en-US&page=${currentPage}`
    );
  
    const data = await resp.json();
    totalPages = data.total_pages;
    tPage.innerText = totalPages;
    movies = data.results;
    renderMovies(movies);
  }

}


// -------------------  prev next button ------------------------- //

const prevBtn = document.getElementById("prev-button");
prevBtn.disabled = true;
const nextBtn = document.getElementById("next-button");
const currPage = document.getElementById("currPage");
const tPage = document.getElementById("totalPage");

prevBtn.addEventListener("click", getPreviousPageFunc);
nextBtn.addEventListener("click", getNextPageFunc);

function getPreviousPageFunc() {     // previous page function
  currentPage--;
  currPage.innerText = currentPage;

  fetchMovies();

  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function getNextPageFunc() {     // next page function
  currentPage++;
  currPage.innerText = currentPage;

  fetchMovies();

  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

// -------------------  sorting operations ------------------------- //


let sortByDateFlag = 0; // 0: ASC   // 1: DESC

function sortByDate() {                                   // sorting by dates
  if (sortByDateFlag) {
    // desc
    movies.sort((m1, m2) => {
      return new Date(m2.release_date) - new Date(m1.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (oldest to latest)";
  } else {
    // asc
    movies.sort((m1, m2) => {
      return new Date(m1.release_date) - new Date(m2.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (latest to oldest)";
  }
}



let sortByRatingFlag = 0; // 0: INC   1: DESC

function sortByRatingFunc() {                            // sorting by rating
  if (sortByRatingFlag) { 
    // DESC
    movies.sort((m1, m2) => {
      return m2.vote_average - m1.vote_average;
    });

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRating.innerText = "Sort by rating (least to most)";
  } else {
    // INC
    movies.sort((m1, m2) => {
      return m1.vote_average - m2.vote_average;
    });

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRating.innerText = "Sort by rating (most to least)";
  }
}

const sortByDateBtn = document.getElementById("sort-by-date");

sortByDateBtn.addEventListener("click", sortByDate);

const sortByRating = document.getElementById("sort-by-rating");

sortByRating.addEventListener("click", sortByRatingFunc);



// -------------------  debouncing ------------------------- //


function onSearchChange(event) {

  let val = event.target.value;

  if (val) {
    searchMovies();
  } 
  else {
    fetchMovies();
  }
}

let timer;

function debounce(event) {
  if (timer) clearTimeout(timer);

  timer = setTimeout(() => {
    onSearchChange(event);
  }, 2000);
}

searchInput.addEventListener("input", (event) => {
  debounce(event);
});


// -------------------  render favourite movies ------------------------- //


function renderFavMovies() {
  moviesList.innerHTML = "";

  const favMovies = getFavMoviesFromLocalStorage();

  favMovies.map((eFavMovie) => {
    let listItem = document.createElement("li");
    listItem.className = "card";

    const { poster_path, title, vote_average, vote_count } = eFavMovie;

    let imageUrl = poster_path
      ? `https://image.tmdb.org/t/p/original${poster_path}`
      : "";

    let mInfo = {
      title,
      poster_path,
      vote_average,
      vote_count,
    };

    listItem.innerHTML = `
  
            <img class="poster" src="${imageUrl}" alt="${title}">
            <p class="title">${title}</p>
            <section class="vote-fav">
                <section>
                    <p>Votes: ${vote_count}</p>
                    <p>Rating: ${vote_average}</p>
                </section>
                <i id='${JSON.stringify(
                  mInfo
                )}' class="fa-regular fa-heart fa-2xl fav-icon fa-solid"></i>
            </section>
        `;

    const favIconBtn = listItem.querySelector(".fav-icon");

    favIconBtn.addEventListener("click", (event) => {             // fav movie click
      // this will remove the card info from the local storage
      const { id } = event.target;
      const mInfo = JSON.parse(id);
      removeMovieInfoFromLocalStorage(mInfo);

      // this will remove the card from the ui
      event.target.parentElement.parentElement.remove();
    });

    moviesList.append(listItem);
  });
}

// ---------------------  active and favourite tab operations ------------------------ //



function displayMovies() {
  if (allTab.classList.contains("active-tab")) {
    // all button, show all general movies
    renderMovies(movies);
  } else {
    // fav button, show all fav movies
    renderFavMovies();
  }
}

function switchTab(event) {
  // remove the active tab class from both tabs
  allTab.classList.remove("active-tab");
  favTab.classList.remove("active-tab");

  event.target.classList.add("active-tab");

  if( favTab.classList.contains("active-tab") && getFavMoviesFromLocalStorage().length == 0 ) {    // handling fav page
    document.querySelector("#favourite-page").style.display = "flex";
  }
  else{
    document.querySelector("#favourite-page").style.display = "none";
  }
  displayMovies();
}

const allTab = document.getElementById("all-tab");
const favTab = document.getElementById("favorits-tab");

allTab.addEventListener("click", switchTab);
favTab.addEventListener("click", switchTab);
