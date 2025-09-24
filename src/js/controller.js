import 'core-js/stable';
import { MODAL_CLOSE_SEC } from './config';
import 'regenerator-runtime';
import {
  loadRecipe,
  state,
  loadSearchResults,
  getSearchResultsPage,
  updateServings,
  addBookmark,
  deleteBookmark,
  uploadRecipe,
} from './model';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(getSearchResultsPage());
    bookmarksView.update(state.bookmarks);

    // 1) Rendering Spinner
    await loadRecipe(id);

    // 2) Rendering Recipe
    recipeView.render(state.recipe);

    // 3)  update bookmarks
  } catch (err) {
    recipeView.renderError();
    console.log(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await loadSearchResults(query);
    // resultsView.render(state.search.results);
    resultsView.render(getSearchResultsPage());

    paginationView.render(state.search);
  } catch (err) {
    console.log(err);
  }
};
const controlPaganition = function (goToPage) {
  resultsView.render(getSearchResultsPage(goToPage));
  paginationView.render(state.search);
};

const controlServings = function (newServings) {
  updateServings(newServings);
  // recipeView.render(state.recipe);
  recipeView.update(state.recipe);
};

const controlAddBookmark = function () {
  if (!state.recipe.bookmarked) addBookmark(state.recipe);
  else deleteBookmark(state.recipe.id);

  recipeView.update(state.recipe);

  bookmarksView.render(state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();
    await uploadRecipe(newRecipe);
    console.log(state.recipe);
    recipeView.render(state.recipe);
    addRecipeView.renderMessage();
    bookmarksView.render(state.bookmarks);
    window.history.pushState(null, '', `#${state.recipe.id}`);
    // window.history.back();
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    console.log(error);
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPaganition);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
