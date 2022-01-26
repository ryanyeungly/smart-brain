import React, {Component} from 'react';
import './App.css';
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";
import Particles from "react-tsparticles";
import Clarifai from 'clarifai';


const app = new Clarifai.App({
  apiKey: '68c60eb9140e4e8fba4611726929fc55'
})

const particleConfig = 
  {
    "background": {
      "color": {
        "value": "#232741"
      },
      "image": "url('http://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/1237px-NASA_logo.svg.png')",
      "position": "50% 50%",
      "repeat": "no-repeat",
      "size": "20%"
    },
    "fullScreen": {
      "zIndex": 1
    },
    "interactivity": {
      "events": {
        "onClick": {
          "enable": true,
          "mode": "repulse"
        },
        "onHover": {
          "enable": true,
          "mode": "bubble"
        }
      },
      "modes": {
        "bubble": {
          "distance": 250,
          "duration": 2,
          "opacity": 0,
          "size": 0
        },
        "grab": {
          "distance": 400
        },
        "repulse": {
          "distance": 400
        }
      }
    },
    "particles": {
      "color": {
        "value": "#ffffff"
      },
      "links": {
        "color": {
          "value": "#ffffff"
        },
        "distance": 150,
        "opacity": 0.4
      },
      "move": {
        "attract": {
          "rotate": {
            "x": 600,
            "y": 600
          }
        },
        "enable": true,
        "outModes": {
          "bottom": "out",
          "left": "out",
          "right": "out",
          "top": "out"
        },
        "random": true,
        "speed": 1
      },
      "number": {
        "density": {
          "enable": true
        },
        "value": 160
      },
      "opacity": {
        "random": {
          "enable": true
        },
        "value": {
          "min": 0,
          "max": 1
        },
        "animation": {
          "enable": true,
          "speed": 1,
          "minimumValue": 0
        }
      },
      "size": {
        "random": {
          "enable": true
        },
        "value": {
          "min": 1,
          "max": 3
        },
        "animation": {
          "speed": 4,
          "minimumValue": 0.3
        }
      }
    }
  };

const initialState = {
    input : '',
        imageUrl : '',
        box: {},
        route: 'signin',
        isSignedIn: false,
        user : {
          id:'',
          name:'',
          email:'',
          entries:0,
          joined: ''
          
        }
  }


class App extends Component {
  constructor() {
    super()
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id:data.id,
      name:data.name,
      email:data.email,
      entries:data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col*width),
      bottomRow : height - (clarifaiFace.bottom_row*height),
    }
  }

  displayFaceBox (box) {
    this.setState({box:box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input).then(response => {
      if (response) {
        fetch('http://localhost:3000/image',{
          method:'put',
          headers : {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id:this.state.user.id
          })
        })
        .then(response => response.json())
        .then(count=> {
          this.setState({
            user: {
              entries:count
            }
          })
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route: route})
  }

  render () {
    const {isSignedIn, imageUrl, route, box } = this.state;
    return (
      <div className="App">
        <Particles className="particles"
          options = {particleConfig}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === 'home'
        ? <div><Logo />
        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
        <ImageLinkForm 
        onInputChange={this.onInputChange} 
        onButtonSubmit={this.onButtonSubmit}/>
        <FaceRecognition box={box} imageUrl={imageUrl}/>
        </div>
        : (
          route ==='signin' 
          ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
        }

        
      </div>
      );
  }
}

export default App;
