function appInit() {
  const selectCategory = document.querySelector('#categorias');
  selectCategory.addEventListener('change', selectedCategory);

  getCategories();

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
    recipes.forEach(recipe => {
      const { idMeal, strMeal, strMealThumb } = recipe;

      const divRecipe = document.createElement('DIV');
      divRecipe.classList.add('col-md-4');

      const recipeCard = document.createElement('DIV');
      recipeCard.classList.add('card', 'mb-4');

      const recipeImg = document.createElement('IMG');
      recipeImg.classList.add('card-img-top');
      recipeImg.alt = `Presentación de la receta de ${strMeal}`;
      recipeImg.src = strMealThumb;

      const recipeBody = document.createElement('DIV');
      recipeBody.classList.add('card-body');

      document.body.appendChild(divRecipe);
    });
  }
}

document.addEventListener('DOMContentLoaded', appInit);
