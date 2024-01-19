import axios from 'axios';
import iziToast from 'izitoast';
// Додатковий імпорт стилів
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const loader = document.querySelector('.loader');
const loaderBottom = document.querySelector('.loader-before-button');
const form = document.querySelector('.img-information');
const searchInput = document.querySelector('.input-img-name');
const loadMoreBtn = document.querySelector('.fetch-more-button');
const gallery = document.querySelector('.gallery');

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
  close: true,
});
let page = 1;
let query;
let perPage = 40;

//loader.style.display = 'block';

//loader.style.display = 'none';

const scrollPage = () => {
  const galleryItem = document.querySelector('.gallery-item');
  const galleryItemHeight = galleryItem.getBoundingClientRect().height;
  window.scrollBy({
    top: galleryItemHeight * 2,
    behavior: 'smooth',
  });
};

async function searchImages(query, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '41530032-c682b7302a1559a8b9f540776';

  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });
    return response.data;
  } catch (error) {
    iziToast.error({
      title: 'Error',
      message: error.message,
      position: 'topRight',
    });
  }
}

loadMoreBtn.addEventListener('click', async event => {
  loaderBottom.style.display = 'block';
  loadMoreBtn.style.display = 'none';
  try {
    page += 1;

    const { hits, totalHits } = await searchImages(query, page);
    const totalPage = Math.ceil(totalHits / perPage);

    loadMoreBtn.style.display = 'block';
    renderImages(hits);
    scrollPage();

    if (page === totalPage) {
      loadMoreBtn.style.display = 'none';
      return iziToast.info({
        position: 'topRight',
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    console.log(error);
  } finally {
    loaderBottom.style.display = 'none';
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  loader.style.display = 'block';
  loadMoreBtn.style.display = 'none';
  page = 1;
  query = event.target.elements.search.value.trim();

  if (query === '') {
    loadMoreBtn.style.display = 'none';
    return;
  }

  try {
    const { hits, totalHits } = await searchImages(query, page);

    if (hits.length > 0) {
      loader.style.display = 'none';
      renderImages(hits);
      loadMoreBtn.style.display = 'block';
    } else {
      gallery.innerHTML = '';
      iziToast.error({
        position: 'topRight',
        message:
          'Sorry, there are no images matching your search query. Please try again!',
      });
    }

    if (totalHits <= perPage) {
      loadMoreBtn.style.display = 'none';
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    loader.style.display = 'none';
    event.target.reset();
  }
});

function renderImages(hits = []) {
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
