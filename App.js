import React from 'react';
import { StyleSheet, Text, View, StatusBar, Dimensions,
  TouchableOpacity, Slider } from 'react-native';
import { AppLoading } from 'expo';

import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import * as MediaLibrary from 'expo-media-library';

import Dialog from "react-native-dialog";

import { Ionicons } from '@expo/vector-icons';

const { height, width } = Dimensions.get("window");
const ALBUM_NAME = "BigSMILE";

export default class App extends React.Component {
  state = {
    loaded: false,
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: Camera.Constants.Type.back,
    options: {
      mode: FaceDetector.Constants.Mode.fast,
      detectLandmarks: FaceDetector.Constants.Landmarks.all,
      runClassifications: FaceDetector.Constants.Classifications.all
    },
    faces: [],
    smileThd: 50,
    dialogVisible: false,
    uri: ""
  };  

  componentDidMount = async () => {
    this._loadApp();
    
    const { status } = await Permissions.askAsync(
      Permissions.CAMERA, 
      Permissions.CAMERA_ROLL
    );
    
    this.setState({ 
      hasCameraPermission: status === 'granted',
      hasCameraRollPermission: status === 'granted',
    });
    
    
  }
  
  render() {
    const { loaded, hasCameraPermission, hasCameraRollPermission,
      type, options, smileThd } = this.state;
    
    
    if(!loaded) {
      return <AppLoading />;
    }
    else {
      if (hasCameraPermission === null || hasCameraRollPermission === null) {
        return <View />;

      } else if (hasCameraPermission === false || hasCameraRollPermission === false) {
        return (
          <View style={styles.container}>
            <Text>You're not allowed to use this app!</Text>
          </View>
        );

      } else {
        
        return (
          <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <Text style={styles.title}>Make Big Smile :D</Text>
            <Dialog.Container
              visible={this.state.dialogVisible}
              contentStyle={styles.dialogContent}>
              <Dialog.Title>Save Smile</Dialog.Title>
              <Dialog.Description>
                Do you want to save your smile?
                If you want, write picture title and why you smile!
              </Dialog.Description>
              <Dialog.Input label="Picture Title" wrapperStyle={styles.dialogInput}>
                aaa
              </Dialog.Input>
              <Dialog.Input label="Why you smile" wrapperStyle={styles.dialogInput}>
                bbb
              </Dialog.Input>              
              <Dialog.Button label="Cancel" onPress={this._saveCancel} />
              <Dialog.Button label="OK" onPress={this._saveOK} />
            </Dialog.Container>            
            <Camera 
              style={styles.camera}
              type={type}
              ref={ref => { this.camera = ref; }}
              onFacesDetected={this._isFacesDetected}
              faceDetectorSettings={options}
              >
              
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                }}>
              </View>           
            </Camera>
            
            <View style={styles.cameraMenu}>             
              <TouchableOpacity
                onPress={() => {
                  this._flipCamera();
                }}>
                <View style={styles.flipSwitch}>  
                  <Ionicons name="ios-reverse-camera" size={50}/>
                </View>
              </TouchableOpacity>    
              <View style={styles.sliderDisplay}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor="#000000"
                  maximumTrackTintColor="#000000"
                  value={smileThd}
                  onValueChange={this._changeSmileThd}
                />
                <Text>{this.state.smileThd}%</Text>
              </View>

            </View>          
          </View>
        );
      }

    }       
  }

  _loadApp = async () => {
    try {
      this.setState({
        loaded: true,
      });       
    } catch(err) {
      console.log(err);
    }  
  };

  _flipCamera () {
    const { type } = this.state;
    this.setState({
      type:
        type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back,
    });
  };

  _isFacesDetected = ({ faces }) => {

    const { smileThd } = this.state;
    
    if(faces.length > 0) {
      const smilePercent = faces[0].smilingProbability * 100;
      if( smilePercent > smileThd) {
        console.log((faces[0].smilingProbability)*100+"%");
        this._takePhoto();
      }  
    }
    
    this.setState({ faces });
  };

  _takePhoto = async () => {     
    try {
      const { uri, width, height, exif, base64 } = await this.camera.takePictureAsync();
      this.setState({ uri });
      this._showDialog();
      console.log("dd");
      
    } catch(err) {
      console.log(err);
    }
  };
  


  _savePhoto = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);      
      const album = await MediaLibrary.getAlbumAsync(`${ALBUM_NAME}`);
      //console.log(album);
      if(album === null) {
        await MediaLibrary.createAlbumAsync(`${ALBUM_NAME}`, asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(asset, album.id, false);
      }
    } catch(err) {
      console.log(err);
    }
  };

  _changeSmileThd = (sliderValue) => {
    this.setState({
      smileThd: sliderValue
    });
  };

  _showDialog = () => {
    this.setState({ 
      dialogVisible: true 
    });
  };  

  _saveCancel = () => {
    this.setState({ 
      dialogVisible: false 
    });
  };  

  _saveOK = () => {
    const {uri} = this.state;
    
    this._savePhoto(uri);
    this.setState({ 
      dialogVisible: false 
    });
  };    
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 30,
    fontFamily: 'sans-serif-condensed',
    marginTop: 50,
    fontWeight: '500'
  },
  cameraMenu: {
    flexDirection: "row",
    marginBottom: 20
  },
  camera: {
    flex: 1,
    width: width - 50,
    height: width/3*4,
    marginTop: 20,
    marginBottom: 20
  },
  captureButton: {
    marginLeft: 20,
    marginRight: 10
  },
  flipSwitch: {
    marginLeft: 10,
    marginRight: 20
  },
  sliderDisplay: {
    alignItems: 'center'
  },
  slider: {
    width: 200,
    height: 20
  },
  dialogContent: {
    
  },
  dialogInput: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    padding: 5
  }
});
