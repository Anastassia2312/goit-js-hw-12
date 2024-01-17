'use strict';
import axios from 'axios';
import iziToast from 'izitoast';
// Додатковий імпорт стилів
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const loader = document.querySelector('.loader');
const form = document.querySelector('.img-information');
const searchInput = document.querySelector('.input-img-name');
const loadMoreBtn = document.querySelector('.fetch-more-button');

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
  close: true,
});
let page = 1;
let perPage = 20;

const instance = axios.create({
  baseURL: 'https://pixabay.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
  page: page,
  per_page: perPage,
});

function showLoader() {
  loader.style.display = 'block';
}
function hideLoader() {
  loader.style.display = 'none';
}
//loader.classList.add('hidden');

const scrollPage = () => {
  const galleryItem = document.querySelector('.gallery-item');
  const galleryItemHeight = galleryItem.getBoundingClientRect().height;
  window.scrollBy({
    top: galleryItemHeight * 2,
    behavior: 'smooth',
  });
};

loadMoreBtn.addEventListener('click', async () => {
  let { hits, totalHits } = searchImages(searchInput.value);
  renderImages(hits);
  scrollPage();
  const totalPages = Math.ceil(totalHits / perPage);
  if (page > totalPages) {
    loadMoreBtn.style.display = 'none';
    loadMoreBtn.textContent =
      "We're sorry, but you've reached the end of search results.";
  }
});

let searchParamsObj = {
  key: '41575459-699006cd61f4fecce9ea2d52d',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: true,
};

async function searchImages(params) {
  //searchParamsObj.q = params;
  const searchParams = new URLSearchParams(searchParamsObj);
  showLoader();
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?${searchParams}`
    );
    page += 1;
    if (page > 1) {
      loadMoreBtn.classList.add('visible-btn');
    }
    hideLoader();

    return response.data;

    //loader.classList.add('hidden');
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: error.message,
      position: 'topRight',
    });
  }
}
//console.log(response.data);

function renderImages(hits) {
  const gallery = document.querySelector('.gallery');

  const renderImages = hits.reduce(
    (html, image) =>
      html +
      `<li class="gallery-item">
         <a class="image-link" href="${image.largeImageURL}">
         <img class="images" data-source="${image.largeImageURL}" alt="${image.tags}" src="${image.webformatURL}" width="360" height="200">
         </a>
         <div class="information">
         <p>Likes: ${image.likes}</p>
         <p>Views: ${image.views}</p>
         <p>Comments: ${image.comments}</p>
         <p>Downloads: ${image.downloads}</p>
        </div>
      </li>`,
    ''
  );
  gallery.insertAdjacentHTML('beforeend', renderImages);
  lightbox.refresh();
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  let { hits, totalHits } = await searchImages(searchInput.value);
  renderImages(hits);
});
