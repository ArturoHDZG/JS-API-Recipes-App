function appInit() {
  const selectCategory = document.querySelector('#categorias');
  const recipeResults = document.querySelector('#resultado');
  const favoritesDiv = document.querySelector('.favoritos');
  const modal = new bootstrap.Modal('#modal', {});

  if (selectCategory) {
    selectCategory.addEventListener('change', selectedCategory);
    getCategories();
  }

  if (favoritesDiv) {
    getFavorites();
  }

  function getCategories() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

    fetch(url)
      .then(response => response.json())
      .then(result => showCategories(result.categories));
  }

  function showCategories(categories = []) {
    categories.forEach(category => {
      const option = document.createElement('OPTION');
      const { strCategory } = category;

      option.value = strCategory;
      option.textContent = strCategory;
      selectCategory.appendChild(option);
    });
  }

  function selectedCategory(e) {
    const category = e.target.value;
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;

    fetch(url)
      .then(response => response.json())
      .then(result => showRecipes(result.meals));
  }

  function showRecipes(recipes = []) {
    clearHTML(recipeResults);

    const heading = document.createElement('H2');
    heading.classList.add('text-center', 'text-black', 'my-5');
    heading.textContent = recipes.length ? 'Resultados' : 'No hay recetas para esta categoría.';
    recipeResults.appendChild(heading);

    recipes.forEach(recipe => {
      const { idMeal, strMeal, strMealThumb } = recipe;

      const divRecipe = document.createElement('DIV');
      divRecipe.classList.add('col-md-4');

      const recipeCard = document.createElement('DIV');
      recipeCard.classList.add('card', 'mb-4');

      const recipeImg = document.createElement('IMG');
      recipeImg.classList.add('card-img-top');
      recipeImg.alt = `Presentación de la receta de ${strMeal ?? recipe.img}`;
      recipeImg.src = strMealThumb ?? recipe.img;

      const recipeBody = document.createElement('DIV');
      recipeBody.classList.add('card-body');

      const recipeTitle = document.createElement('H3');
      recipeTitle.classList.add('card-title', 'mb-3');
      recipeTitle.textContent = strMeal ?? recipe.title;

      const recipeBtn = document.createElement('BUTTON');
      recipeBtn.classList.add('btn', 'btn-danger', 'w-100');
      recipeBtn.textContent = 'Ver Receta';
      recipeBtn.onclick = () => showSelectedRecipe(idMeal ?? recipe.id);

      recipeBody.appendChild(recipeTitle);
      recipeBody.appendChild(recipeBtn);
      recipeCard.appendChild(recipeImg);
      recipeCard.appendChild(recipeBody);
      divRecipe.appendChild(recipeCard);

      recipeResults.appendChild(divRecipe);
    });
  }

  function showSelectedRecipe(id) {
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    fetch(url)
      .then(response => response.json())
      .then(result => showRecipeDetails(result.meals[0]));
  }

  function showRecipeDetails(recipe) {
    const TOTAL_ENTRIES = 20;
    const { idMeal, strInstructions, strMeal, strMealThumb } = recipe;
    const modalTitle = document.querySelector('.modal .modal-title');
    const modalBody = document.querySelector('.modal .modal-body');

    modalTitle.textContent = strMeal;
    modalBody.innerHTML = `
      <img class="img-fluid" src="${strMealThumb}" alt="Receta de ${strMeal}"/>
      <h3 class="my-3">Instrucciones</h3>
      <p>${strInstructions}</p>
      <h3 class="my-3">Ingredientes</h3>
    `;

    const listGroup = document.createElement('UL');
    listGroup.classList.add('list-group', 'list-group-flush');

    for (let i = 1; i <= TOTAL_ENTRIES; i++){
      if (recipe[ `strIngredient${i}` ]) {
        const ingredient = recipe[ `strIngredient${i}` ];
        const measure = recipe[ `strMeasure${i}` ];
        const ingredientsLi = document.createElement('LI');
        ingredientsLi.classList.add('list-group-item');
        ingredientsLi.textContent = `${ingredient} - ${measure}`;

        listGroup.appendChild(ingredientsLi);
      }
    }

    modalBody.appendChild(listGroup);

    const modalFooter = document.querySelector('.modal-footer');
    clearHTML(modalFooter);

    const favoritesBtn = document.createElement('BUTTON');
    favoritesBtn.classList.add('btn', 'btn-danger', 'col');
    favoritesBtn.textContent = existsFavorite(idMeal) ? 'Eliminar de favoritos' : 'Guardar en favoritos';
    modalFooter.appendChild(favoritesBtn);

    favoritesBtn.onclick = function () {
      if (existsFavorite(idMeal)) {
        deleteFavorites(idMeal);
        favoritesBtn.textContent = 'Guardar en favoritos';
        showToast('Eliminado correctamente');
        return;
      }

      addFavorite({
        id: idMeal,
        title: strMeal,
        img: strMealThumb
      });
      favoritesBtn.textContent = 'Eliminar de favoritos';
      showToast('Agregado correctamente');
    };

    const closeBtn = document.createElement('BUTTON');
    closeBtn.classList.add('btn', 'btn-secondary', 'col');
    closeBtn.textContent = 'Cerrar';
    closeBtn.onclick = () => modal.hide();
    modalFooter.appendChild(closeBtn);

    modal.show();
  }

  function addFavorite(recipe) {
    const favorite = JSON.parse(localStorage.getItem('favorites')) ?? [];
    localStorage.setItem('favorites', JSON.stringify([ ...favorite, recipe ]));
  }

  function deleteFavorites(id) {
    const favorite = JSON.parse(localStorage.getItem('favorites')) ?? [];
    const newFavorites = favorite.filter(newFavorite => newFavorite.id !== id);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  }

  function existsFavorite(id) {
    const favorite = JSON.parse(localStorage.getItem('favorites'))?? [];
    return favorite.some(recipe => recipe.id === id);
  }

  function showToast(message) {
    const toastDiv = document.querySelector('#toast');
    const toastBody = document.querySelector('.toast-body');
    const toast = new bootstrap.Toast(toastDiv);

    toastBody.textContent = message;
    toast.show();
  }

  function getFavorites() {
    const favorite = JSON.parse(localStorage.getItem('favorites')) ?? [];

    if (favorite.length) {
      showRecipes(favorite);
      return;
    }

    const noFavorite = document.createElement('P');
    noFavorite.classList.add('text-center', 'fs-4', 'mt-5', 'font-bold');
    noFavorite.textContent = 'No se encontraron favoritos';
    favoritesDiv.appendChild(noFavorite);
  }

  function clearHTML(field) {
    while (field.firstChild) {
      field.removeChild(field.firstChild);
    }
  }
}

document.addEventListener('DOMContentLoaded', appInit);
