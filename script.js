const searchBar = document.querySelector(".search-bar");
const searchBtn = document.querySelector(".search-btn");
const recipeContainer = document.querySelector(".recipe-container");
const recipeModal = document.getElementById("recipeModal");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.querySelector(".close");

const debounce = (func, delay) => {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};

const fetchRecipes = async (query) => {
	try {
		const response = await fetch(
			`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
		);
		const data = await response.json();
		return data.meals || [];
	} catch (error) {
		console.error("Error fetching recipes:", error);
		return [];
	}
};

const fetchRecipeDetails = async (id) => {
	try {
		const response = await fetch(
			`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
		);
		const data = await response.json();
		return data.meals ? data.meals[0] : null;
	} catch (error) {
		console.error("Error fetching recipe details:", error);
		return null;
	}
};

const displayRecipes = (meals) => {
	const content = meals
		.map(
			(meal) => `
        <div class="recipeDiv mt-4 w-full transition-transform transform hover:scale-105">
        <div class="recipe-div-items text-center bg-slate-200 flex flex-col items-center gap-3 rounded-md p-4">
        <div class="img-container mb-3 w-full">
        <img class="w-full rounded-md object-cover" src="${meal.strMealThumb}" alt="${meal.strMeal}" /></div>
        <h2 class="font-bold text-lg">${meal.strMeal}</h2>
        <h3 class="text-md"><span class="font-bold">${meal.strArea}</span> DISH</h3>
        <h4 class="text-sm">Category: <span class="font-bold">${meal.strCategory}</span></h4>
        <button class="view-recipe-btn bg-red-700 text-white px-3 py-2 rounded-md mb-2" data-meal-id="${meal.idMeal}">
                    View Recipe
        </button>
        </div>
        </div>`
		)
		.join("");

	recipeContainer.innerHTML = content || "<p>No recipes found.</p>";
	addRecipeBtnEventListeners();
};

const showRecipeModal = async (mealId) => {
	const meal = await fetchRecipeDetails(mealId);
	if (meal) {
		modalBody.innerHTML = `
            <h2 class="text-2xl font-bold mb-2">${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-full rounded mb-4" />
            <h3 class="text-xl mb-2">${meal.strArea} DISH</h3>
            <h4 class="text-lg mb-2">Category: ${meal.strCategory}</h4>
            <p class="text-md">${meal.strInstructions}</p>`;
		recipeModal.showModal();
	}
};

const addRecipeBtnEventListeners = () => {
	document.querySelectorAll(".view-recipe-btn").forEach((button) => {
		button.addEventListener("click", () => {
			showRecipeModal(button.getAttribute("data-meal-id"));
		});
	});
};

searchBtn.addEventListener("click", (e) => {
	e.preventDefault();
	const searchBarInput = searchBar.value.trim();
	if (searchBarInput) {
		fetchRecipes(searchBarInput).then(displayRecipes);
	} else {
		recipeContainer.innerHTML = "<p>Please enter a valid search term.</p>";
	}
	searchBar.value = "";
});

// Close modal
closeModalBtn.onclick = () => {
	recipeModal.close();
};

// Close modal when clicking outside of it
window.onclick = (event) => {
	if (event.target === recipeModal) {
		recipeModal.close();
	}
};

// Debounce the search input
searchBar.addEventListener(
	"input",
	debounce(() => {
		const searchBarInput = searchBar.value.trim();
		if (searchBarInput) {
			fetchRecipes(searchBarInput).then(displayRecipes);
		}
	}, 300)
);
