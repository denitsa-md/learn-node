import axios from 'axios';
import { $ } from './bling';

function loadPlaces(map, lat , lng) {

    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if (!places.length) {
                alert('no places found!');
                return;
            }
            // create a bounds
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            // when someone clicks on a marker, show the details of that place
            markers.forEach(marker => marker.addListener('click', function() {
                const html = `
                    <div class="popup">
                        <a href="/stores/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}"/>
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));

            // then zoom the map to fit all the markers perfectly
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
}

function makeMap(mapDiv) {
    if (!mapDiv) return;

    const map = new google.maps.Map(mapDiv);

    getPosition({enableHighAccuracy: true})
        .then(function(position) {
            loadPlaces(map, position.coords.latitude, position.coords.longitude);
        });

    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
    });
}

function getPosition(settings) {
    return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(

            // On Success
            function(position) {
                resolve(position);
            },

            // On Error
            function(error) {
                reject(error);
            },

            settings
        );
    });
}

export default makeMap;