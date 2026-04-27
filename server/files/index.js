import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
          .append(new ElementBuilder("img").with("src", movie.Poster))
          .append(new ElementBuilder("h1").text(movie.Title))
          .append(new ElementBuilder("p")
              .append(new ElementBuilder("button").text("Edit")
                    .listener("click", () => location.href = "edit.html?imdbID=" + movie.imdbID)))
          .append(new ParagraphBuilder().items(
              "Runtime " + formatRuntime(movie.Runtime),
              "\u2022",
              "Released on " +
                new Date(movie.Released).toLocaleDateString("en-US")))
          .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
          .append(new ElementBuilder("p").text(movie.Plot))
          .append(new ElementBuilder("h2").pluralizedText("Director", movie.Directors))
          .append(new ListBuilder().items(movie.Directors))
          .append(new ElementBuilder("h2").pluralizedText("Writer", movie.Writers))
          .append(new ListBuilder().items(movie.Writers))
          .append(new ElementBuilder("h2").pluralizedText("Actor", movie.Actors))
          .append(new ListBuilder().items(movie.Actors))
          .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)
  /* Task 1.4. Add query parameter to the url if a genre is given */
  if (genre) {
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const navElement = document.querySelector("nav");

    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);

      // Create menu button
      const menuButton = document.createElement("button");
      menuButton.textContent = "Genres";
      menuButton.classList.add("menu-button");
      navElement.appendChild(menuButton);

      // Create dropdown container
      const dropdown = document.createElement("div");
      dropdown.classList.add("dropdown");
      navElement.appendChild(dropdown);

      // Add "All" option
      const allButton = document.createElement("button");
      allButton.textContent = "All";
      allButton.addEventListener("click", () => {
        loadMovies();
        dropdown.style.display = "none";
      });
      dropdown.appendChild(allButton);

      // Add genre options
      genres.forEach(genre => {
        const genreButton = document.createElement("button");
        genreButton.textContent = genre;
        genreButton.addEventListener("click", () => {
          loadMovies(genre);
          dropdown.style.display = "none";
        });
        dropdown.appendChild(genreButton);
      });

      // Toggle dropdown on menu button click
      menuButton.addEventListener("click", () => {
        const isVisible = dropdown.style.display === "flex";
        dropdown.style.display = isVisible ? "none" : "flex";
      });

      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav .dropdown button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  xhr.open("GET", "/genres");
  xhr.send();
};
