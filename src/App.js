import React, { Component } from 'react';
import './App.css';
import scriptLoader from 'react-async-script-loader';
import escapeRegExp from 'escape-string-regexp';
import sortBy from 'sort-by';

let places = [];
let infoWindows = [];
let markers = [];

class App extends Component {
      constructor(props) {
          super(props);
          this.state = {
            location: require("./locations.json"),
            map: {},
            query: ''

          }

      }

    componentWillReceiveProps({isScriptLoadSucceed}) {
      window.gm_authFailure = function() {
      alert('Error: Google maps failed to load!');
    }
        // insure if the google map script is loaded successfuly
         if (isScriptLoadSucceed) {
          //Create the Map
          const map = new window.google.maps.Map(document.getElementById('map-container'), {
            zoom: 13,
            // Location the map
            center: new window.google.maps.LatLng(26.189041, 49.810356) });
            this.setState({map:map});
            places = this.state.location.sort(sortBy('title'))
        }
        else {
          alert('Error: Google maps failed to load!');
      }
    }


    Foursquarefq(fq) {
      const client_id = "GTW1WEJVRRL231GGG4I4A4TXPDIYT3AGL01H4KKHLB4VTNAU"
      const client_Secret = "QRGDMHOIOYPHVV3HN4H2OO503PANETBSO1CUMKWOAW2MXXCM"
      const version = "20180715"
      const lat = fq.location.lat
      const lng = fq.location.lng
      let url = ''

      // Build the URL
      return url = `https://api.foursquare.com/v2/venues/search?client_id=${client_id}&client_secret=${client_Secret}&ll=${lat},${lng}&v=${version}&limit=1`
      }

      //this method will take the test in search field and update the query
        updateQuery = (NewQuery) => {
          // if user seraching
        const {location} = this.state
        places = location
        if (NewQuery) { // If the user is searching
          //filtering
          const equal = new RegExp(escapeRegExp(NewQuery),'i')
          places = location.filter((fq) => equal.test(fq.title))
        }
        else {
          places = location
        }
        // show result after filtering
        places = places.sort(sortBy('title'))
        this.setState({ query: NewQuery })
        this.MarkersDidUpdate()
      }

    componentDidUpdate() {
      this.MarkersDidUpdate()
    }


  InfoWindowData(m, fq) {
    let infoWindow
    //request venue information
    let url = this.Foursquarefq(fq)
    fetch(url).then(function(res) {
      return res.json(); }).then(function(JSON) {

        // Since requests are successful and we have all the data, start building the InfoWindow
        let content =
        `<div style="width: 200px;">
        <p tabindex="0">Name: </strong>${JSON.response.venues[0].name}</p>
        <p tabindex="0"><a href="https://foursquare.com/v/${ JSON.response.venues[0].id }">Read More on Foursquare Website</a>
        </div>`

        infoWindow = new window.google.maps.InfoWindow({
          content: content
        })

        // InfoWindow save in infoWindows array
        infoWindows.push(infoWindow)
        // Open infoWindow
        infoWindow.open(this, m)


    }).catch(function(error) {
      // when request failed, replace infoWindow data with error message
      let content = `<p tabindex="0">Sorry data can't be loaded</p>`
      infoWindow = new window.google.maps.InfoWindow({
      content: content
      })
      // InfoWindow save in infoWindows array
      infoWindows.push(infoWindow)
        // Open infoWindow
      infoWindow.open(this, m)
      console.log("request to Forsquare was failed")
    })
  }

  OpenMarkerWhenClick = (c) => {

    // searching for markers
    let mto = markers.filter((m) => m.title === c.title)[0]

    // when user click the marker it open infoWindow
    window.google.maps.event.trigger(mto, 'click');
  }



  OpenMarkerWhenKeyPress = (e, ListItem ) => {
    if (e.charCode === 13) {
      // searching for markers
      let mto = markers.filter((m) => m.title === ListItem.title)[0]

      // when user click the marker it open infoWindow
      window.google.maps.event.trigger(mto, 'click');
    }
  }

  MarkersDidUpdate() {
    // Clear the markers
    markers.forEach(m => { m.setMap(null) })
    markers = [];
    let me = this
  //Generating Markers
  places.forEach(function(fq) {
  let m = new window.google.maps.Marker({
  title: fq.title,
  map: me.state.map,
  position: fq.location,
  animation: window.google.maps.Animation.DROP
   })

    //click Events
    m.addListener('click', function() {
      // close infoWindow
    infoWindows.forEach(function(InfoWindow) {InfoWindow.close()})
    // Add Effect to Markers when click it or select it
    this.setAnimation(window.google.maps.Animation.BOUNCE);
    setTimeout(() => {this.setAnimation(null);}, 200)

    // Create InfoWindow and filled it with Foursquarefq data on it.
     me.InfoWindowData(this, fq)
  });

    markers.push(m)

  })
  // map bounds
  let bounds = new window.google.maps.LatLngBounds();
  markers.forEach((m) => bounds.extend(m.position))
  this.state.map.fitBounds(bounds)
  }

  render() {
    const {query} = this.state;
    return (
      <div>
      <nav className="nav">
        <center>
          <span id="subject" tabIndex='0'>Saudi Arabia - Eastern Province Universities</span>
          </center>
            </nav>
              <div id="container">
              <div id="map-container" role="application" tabIndex="-1">
              <div id="map" role="region" aria-label="Eastern Province Universities"></div>
              </div>
            <div className='listView'>
            <input id="textToFilter" className='form-control' type='text'
            placeholder=' search location ..'
            value={query}
            onChange={(e) => this.updateQuery(e.target.value)}
            role="search"
            aria-labelledby="Search For a University"
            tabIndex="1"/>
            <ul aria-labelledby="list of Universities" tabIndex="1">

          {places.map((p, index)=>
            <li key={index} tabIndex={index+2}
            area-labelledby={`View details for ${p.title}`}
            onClick={() => this.OpenMarkerWhenClick(p)}
            onKeyPress={(e) => this.OpenMarkerWhenKeyPress(e, p)}>
      	  {p.title}</li>)}
            </ul>
            </div>
            </div>
            </div>
    );
  }
}

// Load Google Map API Key
  export default scriptLoader(
      [`https://maps.googleapis.com/maps/api/js?key=AIzaSyAD7SP0433vy7OGi67irjeNfbMNbAJCA9s&v=3.exp&libraries=geometry,drawing,places`]
      )(App);
