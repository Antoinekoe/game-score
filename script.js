// Auto-submit filter form when selection changes
document.getElementById("id").addEventListener("change", function () {
  document.getElementById("filterForm").submit();
});

// Get search elements (works for both empty state and existing games)
const searchInput =
  document.getElementById("searchInputChoose") ||
  document.getElementById("searchInputMenu");
const dropdownList =
  document.getElementById("dropdownListChoose") ||
  document.getElementById("dropdownListMenu");
const dropdown =
  document.querySelector(".dropdownChoose") ||
  document.querySelector(".dropdownMenu");
let debounceTimeout;

if (searchInput && dropdownList) {
  // Prevent form submission on Enter key
  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      return false;
    }
  });

  // Handle dropdown item selection
  dropdownList.addEventListener("click", function (event) {
    const li = event.target.closest(".list-button");
    if (li) {
      document.getElementById("hiddenGameName").value = li.dataset.name;
      document.getElementById("hiddenGameId").value = li.dataset.id;
      document.getElementById("hiddenGameCover").value = li.dataset.cover;
      document.getElementById("hiddenGameDate").value = li.dataset.date;
      li.closest("form").submit();
    }
  });

  // Debounced search API call
  searchInput.addEventListener("input", async function () {
    clearTimeout(debounceTimeout);
    const query = this.value.trim();
    if (!query) {
      dropdownList.innerHTML = "";
      dropdown.classList.remove("active");
      return;
    }

    debounceTimeout = setTimeout(async () => {
      // Fetch game suggestions from API
      const response = await fetch("/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          search: query,
        }),
      });
      const games = await response.json();
      if (games.length > 0) {
        // Display search suggestions
        dropdown.classList.add("active");
        dropdownList.innerHTML = games
          .map(
            (game) =>
              `<li class="list-button" data-date="${new Date(
                game.first_release_date * 1000
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}"data-name="${game.name}" data-id="${game.id}" data-cover="${
                game.cover.image_id
                  ? "https://images.igdb.com/igdb/image/upload/t_720p/" +
                    game.cover.image_id +
                    ".jpg"
                  : ""
              }"> ${
                game.cover
                  ? `<img src="https://images.igdb.com/igdb/image/upload/t_720p/${game.cover.image_id}.jpg">`
                  : ""
              }<p>${game.name}</p></li>`
          )
          .join("");
      }
    }, 400);
  });
}
