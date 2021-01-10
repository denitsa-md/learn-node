import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
            <a href="/stores/${store.slug}" class="search__result">
                <strong>${store.name}</strong>
            </a>
        `
    }).join('');
}

function typeAhead(search) {
    if (!search) return;

    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    searchInput.on('input', function() {
        // if there is no value, quit
        if(!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        // show the search results
        searchResults.style.display  = 'block';

        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
               if(res.data.length) {
                   searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
                   return;
               }

               searchResults.innerHTML = dompurify.sanitize(`<div class="search_result">No results for ${this.value} found!</div>`)
            })
            .catch(err => {
                console.error(err);
            });
    });

    // handle keyboard inputs
    searchInput.on('keyup', (e) => {
        if (!['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
            return;
        }
        const activeClass = 'search__result--active';
        const current = search.querySelector(`.${activeClass}`);
        const items = search.querySelectorAll('.search__result');
        let next;
        if (e.key === 'ArrowDown' && current) {
            next = current.nextElementSibling || items[0];
        } else if (e.key === 'ArrowDown') {
            next = items[0];
        } else if (e.key === 'ArrowUp' && current) {
            next = current.previousElementSibling || items[items.length - 1]
        } else if (e.key === 'ArrowUp') {
            next = items[items.length - 1]
        } else if (e.key === 'Enter' && current.href) {
            window.location = current.href;
            return;
        }
        if (current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
    });
}

export default typeAhead;